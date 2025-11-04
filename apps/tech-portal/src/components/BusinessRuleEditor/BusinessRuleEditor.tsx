import React, { useCallback, useMemo, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Background,
  Controls,
  MiniMap,
  Connection,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { BusinessRule, BusinessRuleNode, BusinessRuleEdge, ActionType, ConditionConfig } from '../../types/business-rule';

// Custom node types
const initialNodeTypes = {
  start: StartNode,
  condition: ConditionNode,
  action: ActionNode,
  decision: DecisionNode,
  end: EndNode,
};

interface BusinessRuleEditorProps {
  rule?: BusinessRule;
  onSave?: (rule: Partial<BusinessRule>) => void;
  onExecute?: (facts: Record<string, any>) => void;
}

export function BusinessRuleEditor({ rule, onSave, onExecute }: BusinessRuleEditorProps) {
  const [ruleName, setRuleName] = useState(rule?.name || '');
  const [ruleDescription, setRuleDescription] = useState(rule?.description || '');
  const [ruleType, setRuleType] = useState<string>(rule?.type || 'workflow');
  const [ruleStatus, setRuleStatus] = useState<string>(rule?.status || 'draft');
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showActionDialog, setShowActionDialog] = useState(false);

  // Initialize nodes and edges from rule or default
  const initialNodes: Node[] = useMemo(() => {
    if (rule?.config?.workflow?.nodes) {
      return rule.config.workflow.nodes.map(node => ({
        id: node.id,
        type: node.type,
        position: node.position,
        data: node.data,
      }));
    }
    // Default start node
    return [
      {
        id: '1',
        type: 'start',
        position: { x: 250, y: 100 },
        data: { label: 'Start' },
      },
    ];
  }, [rule]);

  const initialEdges: Edge[] = useMemo(() => {
    if (rule?.config?.workflow?.edges) {
      return rule.config.workflow.edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.label,
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
      }));
    }
    return [];
  }, [rule]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = {
        ...params,
        id: `e${params.source}-${params.target}`,
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const addNode = useCallback((type: string) => {
    const newNode: Node = {
      id: `${type}-${Date.now()}`,
      type,
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 400 + 100,
      },
      data: {
        label: type.charAt(0).toUpperCase() + type.slice(1),
      },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes]);

  const deleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
    }
  }, [setNodes, setEdges, selectedNode]);

  const updateNodeData = useCallback((nodeId: string, data: any) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
      )
    );
  }, [setNodes]);

  const handleSave = useCallback(() => {
    const config = {
      version: '1.0.0',
      rules: nodes
        .filter((node) => node.type === 'condition' || node.type === 'decision')
        .map((node) => ({
          id: node.id,
          name: node.data.label || `Rule ${node.id}`,
          conditions: node.data.conditions || {},
          actions: node.data.actions || [],
          priority: node.data.priority || 10,
        })),
      workflow: {
        nodes: nodes.map((node) => ({
          id: node.id,
          type: node.type,
          data: node.data,
          position: node.position,
        })),
        edges: edges.map((edge) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          label: edge.label,
        })),
      },
    };

    const ruleData: Partial<BusinessRule> = {
      name: ruleName,
      description: ruleDescription,
      type: ruleType as any,
      status: ruleStatus as any,
      config: config as any,
    };

    if (onSave) {
      onSave(ruleData);
    }
  }, [ruleName, ruleDescription, ruleType, ruleStatus, nodes, edges, onSave]);

  return (
    <div className="business-rule-editor">
      <div className="editor-header">
        <div className="header-form">
          <input
            type="text"
            placeholder="Rule Name"
            value={ruleName}
            onChange={(e) => setRuleName(e.target.value)}
            className="rule-name-input"
          />
          <input
            type="text"
            placeholder="Description"
            value={ruleDescription}
            onChange={(e) => setRuleDescription(e.target.value)}
            className="rule-description-input"
          />
          <select
            value={ruleType}
            onChange={(e) => setRuleType(e.target.value)}
            className="rule-type-select"
          >
            <option value="workflow">Workflow</option>
            <option value="decision">Decision</option>
            <option value="validation">Validation</option>
            <option value="automation">Automation</option>
          </select>
          <select
            value={ruleStatus}
            onChange={(e) => setRuleStatus(e.target.value)}
            className="rule-status-select"
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="archived">Archived</option>
          </select>
          <button onClick={handleSave} className="save-button">
            Save Rule
          </button>
        </div>
      </div>

      <div className="editor-toolbar">
        <button onClick={() => addNode('condition')} className="toolbar-button">
          + Condition
        </button>
        <button onClick={() => addNode('action')} className="toolbar-button">
          + Action
        </button>
        <button onClick={() => addNode('decision')} className="toolbar-button">
          + Decision
        </button>
        {selectedNode && (
          <button
            onClick={() => deleteNode(selectedNode.id)}
            className="toolbar-button delete"
          >
            Delete Selected
          </button>
        )}
      </div>

      <div className="editor-content">
        <div className="flow-container">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={initialNodeTypes}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>

        {selectedNode && (
          <div className="node-properties">
            <h3>Node Properties: {selectedNode.data.label}</h3>
            <NodePropertiesPanel
              node={selectedNode}
              onUpdate={(data) => updateNodeData(selectedNode.id, data)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Simple node components
function StartNode({ data }: { data: any }) {
  return <div className="node start-node">{data.label || 'Start'}</div>;
}

function ConditionNode({ data }: { data: any }) {
  return <div className="node condition-node">{data.label || 'Condition'}</div>;
}

function ActionNode({ data }: { data: any }) {
  return <div className="node action-node">{data.label || 'Action'}</div>;
}

function DecisionNode({ data }: { data: any }) {
  return <div className="node decision-node">{data.label || 'Decision'}</div>;
}

function EndNode({ data }: { data: any }) {
  return <div className="node end-node">{data.label || 'End'}</div>;
}

// Node properties panel
function NodePropertiesPanel({ node, onUpdate }: { node: Node; onUpdate: (data: any) => void }) {
  const [label, setLabel] = useState(node.data.label || '');
  const [conditions, setConditions] = useState(node.data.conditions || {});
  const [actions, setActions] = useState(node.data.actions || []);

  const handleLabelChange = (newLabel: string) => {
    setLabel(newLabel);
    onUpdate({ label: newLabel });
  };

  return (
    <div className="properties-panel">
      <div className="property-group">
        <label>Label:</label>
        <input
          type="text"
          value={label}
          onChange={(e) => handleLabelChange(e.target.value)}
        />
      </div>

      {(node.type === 'condition' || node.type === 'decision') && (
        <div className="property-group">
          <label>Conditions:</label>
          <textarea
            value={JSON.stringify(conditions, null, 2)}
            onChange={(e) => {
              try {
                const newConditions = JSON.parse(e.target.value);
                setConditions(newConditions);
                onUpdate({ conditions: newConditions });
              } catch {
                // Invalid JSON, ignore
              }
            }}
            rows={5}
          />
        </div>
      )}

      {node.type === 'action' && (
        <div className="property-group">
          <label>Actions:</label>
          <textarea
            value={JSON.stringify(actions, null, 2)}
            onChange={(e) => {
              try {
                const newActions = JSON.parse(e.target.value);
                setActions(newActions);
                onUpdate({ actions: newActions });
              } catch {
                // Invalid JSON, ignore
              }
            }}
            rows={5}
          />
        </div>
      )}
    </div>
  );
}


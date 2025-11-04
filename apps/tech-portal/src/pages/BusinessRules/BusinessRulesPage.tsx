import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { BusinessRule } from '../../types/business-rule';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function BusinessRulesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Fetch rules
  const { data: rulesData, isLoading } = useQuery({
    queryKey: ['business-rules', filterStatus],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterStatus !== 'all') {
        params.append('status', filterStatus);
      }

      const response = await fetch(`${API_URL}/api/v1/business-rules?${params}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch rules');
      const data = await response.json();
      return data.data as BusinessRule[];
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (ruleId: string) => {
      const response = await fetch(`${API_URL}/api/v1/business-rules/${ruleId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete rule');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-rules'] });
      alert('Rule deleted successfully!');
    },
    onError: (error: Error) => {
      alert(`Failed to delete rule: ${error.message}`);
    },
  });

  const handleCreate = () => {
    navigate('/business-rules/new');
  };

  const handleEdit = (ruleId: string) => {
    navigate(`/business-rules/${ruleId}/edit`);
  };

  const handleDelete = (ruleId: string) => {
    if (window.confirm('Are you sure you want to delete this rule?')) {
      deleteMutation.mutate(ruleId);
    }
  };

  if (isLoading) {
    return <div className="loading">Loading rules...</div>;
  }

  return (
    <div className="business-rules-page">
      <div className="page-wrapper">
        <div className="page-header">
          <div>
            <h1>Business Rules</h1>
            <p className="page-description">Create and manage business logic workflows</p>
          </div>
          <button onClick={handleCreate} className="create-button">
            + Create New Rule
          </button>
        </div>

        <div className="filters">
        <label>Filter by Status:</label>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All</option>
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="archived">Archived</option>
        </select>
        </div>

        <div className="rules-list">
        {rulesData && rulesData.length > 0 ? (
          rulesData.map((rule) => (
            <div key={rule._id} className="rule-card">
              <div className="rule-header">
                <h3>{rule.name}</h3>
                <span className={`status-badge status-${rule.status}`}>
                  {rule.status}
                </span>
              </div>
              {rule.description && (
                <p className="rule-description">{rule.description}</p>
              )}
              <div className="rule-meta">
                <span>Type: {rule.type}</span>
                {rule.category && <span>Category: {rule.category}</span>}
                {rule.executionCount !== undefined && (
                  <span>Executions: {rule.executionCount}</span>
                )}
              </div>
              <div className="rule-actions">
                <button
                  onClick={() => handleEdit(rule._id!)}
                  className="action-button edit"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(rule._id!)}
                  className="action-button delete"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <p>No business rules found. Create your first rule!</p>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}


import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BusinessRuleEditor } from '../../components/BusinessRuleEditor/BusinessRuleEditor';
import { BusinessRule } from '../../types/business-rule';
import { useParams, useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function BusinessRuleEditorPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch rule if editing
  const { data: rule, isLoading } = useQuery({
    queryKey: ['business-rule', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await fetch(`${API_URL}/api/v1/business-rules/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch rule');
      const data = await response.json();
      return data.data as BusinessRule;
    },
    enabled: !!id,
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (ruleData: Partial<BusinessRule>) => {
      const url = id
        ? `${API_URL}/api/v1/business-rules/${id}`
        : `${API_URL}/api/v1/business-rules`;
      const method = id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(ruleData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save rule');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['business-rules'] });
      queryClient.invalidateQueries({ queryKey: ['business-rule', id] });
      alert('Rule saved successfully!');
      if (!id && data.data?._id) {
        navigate(`/business-rules/${data.data._id}/edit`);
      }
    },
    onError: (error: Error) => {
      alert(`Failed to save rule: ${error.message}`);
    },
  });

  // Execute mutation
  const executeMutation = useMutation({
    mutationFn: async ({ ruleId, facts }: { ruleId: string; facts: Record<string, any> }) => {
      const response = await fetch(`${API_URL}/api/v1/business-rules/${ruleId}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ facts }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to execute rule');
      }

      return response.json();
    },
    onSuccess: (data) => {
      alert(`Rule executed successfully! Results: ${JSON.stringify(data.data, null, 2)}`);
    },
    onError: (error: Error) => {
      alert(`Failed to execute rule: ${error.message}`);
    },
  });

  const handleSave = (ruleData: Partial<BusinessRule>) => {
    saveMutation.mutate(ruleData);
  };

  const handleExecute = (facts: Record<string, any>) => {
    if (!id) {
      alert('Please save the rule first before executing');
      return;
    }
    executeMutation.mutate({ ruleId: id, facts });
  };

  if (isLoading) {
    return <div className="loading">Loading rule...</div>;
  }

  return (
    <div className="business-rule-editor-page">
      <div className="page-header">
        <h1>{id ? 'Edit Business Rule' : 'Create Business Rule'}</h1>
        <button onClick={() => navigate('/business-rules')} className="back-button">
          ← Back to Rules
        </button>
      </div>
      <BusinessRuleEditor rule={rule} onSave={handleSave} onExecute={handleExecute} />
    </div>
  );
}


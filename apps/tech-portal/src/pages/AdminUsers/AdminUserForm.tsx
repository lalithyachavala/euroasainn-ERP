import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface AdminUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  portalType: string;
  role: string;
  isActive: boolean;
  organizationId?: string;
}

interface Organization {
  _id: string;
  name: string;
  type: string;
  portalType: string;
}

interface AdminUserFormProps {
  user?: AdminUser | null;
  organizations: Organization[];
  onSuccess: () => void;
  onCancel: () => void;
}

export function AdminUserForm({ user, organizations, onSuccess, onCancel }: AdminUserFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    portalType: 'admin',
    role: 'admin_superuser',
    organizationId: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        password: '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        portalType: user.portalType || 'admin',
        role: user.role || 'admin_superuser',
        organizationId: user.organizationId || '',
      });
    }
  }, [user]);

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`${API_URL}/api/v1/tech/admin-users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create admin user');
      }
      return response.json();
    },
    onSuccess: () => {
      alert('Admin user created successfully!');
      onSuccess();
    },
    onError: (error: Error) => {
      alert(`Failed to create admin user: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user && !formData.password) {
      alert('Password is required for new users');
      return;
    }
    createMutation.mutate(formData);
  };

  const roles = [
    { value: 'admin_superuser', label: 'Admin Superuser' },
    { value: 'admin_user', label: 'Admin User' },
  ];

  return (
    <form onSubmit={handleSubmit} className="admin-user-form">
      <div className="form-group">
        <label htmlFor="email">Email *</label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          disabled={!!user}
        />
      </div>

      {!user && (
        <div className="form-group">
          <label htmlFor="password">Password *</label>
          <input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
        </div>
      )}

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="firstName">First Name *</label>
          <input
            id="firstName"
            type="text"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="lastName">Last Name *</label>
          <input
            id="lastName"
            type="text"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="organizationId">Organization</label>
          <select
            id="organizationId"
            value={formData.organizationId}
            onChange={(e) => setFormData({ ...formData, organizationId: e.target.value })}
          >
            <option value="">Select Organization (Optional)</option>
            {organizations.map((org) => (
              <option key={org._id} value={org._id}>
                {org.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="role">Role *</label>
          <select
            id="role"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            required
          >
            {roles.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="cancel-button">
          Cancel
        </button>
        <button
          type="submit"
          className="submit-button"
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? 'Saving...' : user ? 'Update Admin User' : 'Create Admin User'}
        </button>
      </div>
    </form>
  );
}


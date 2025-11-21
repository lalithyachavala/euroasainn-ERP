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
        email: user.email,
        password: '',
        firstName: user.firstName,
        lastName: user.lastName,
        portalType: user.portalType,
        role: user.role,
        organizationId: user.organizationId || '',
      });
    }
  }, [user]);

  // CREATE admin user
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

  // UPDATE admin user
  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`${API_URL}/api/v1/tech/admin-users/${user!._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update admin user');
      }
      return response.json();
    },
    onSuccess: () => {
      alert('Admin user updated successfully!');
      onSuccess();
    },
    onError: (error: Error) => {
      alert(`Failed to update admin user: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // If editing → use PUT
    if (user) {
      updateMutation.mutate(formData);
      return;
    }

    // If creating → require password
    if (!formData.password) {
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
        <label>Email *</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          disabled={!!user} // cannot change email on edit
        />
      </div>

      {!user && (
        <div className="form-group">
          <label>Password *</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
        </div>
      )}

      <div className="form-row">
        <div className="form-group">
          <label>First Name *</label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label>Last Name *</label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Organization</label>
          <select
            value={formData.organizationId}
            onChange={(e) => setFormData({ ...formData, organizationId: e.target.value })}
          >
            <option value="">Select Organization</option>
            {organizations.map((org) => (
              <option key={org._id} value={org._id}>
                {org.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Role *</label>
          <select
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
          disabled={createMutation.isPending || updateMutation.isPending}
        >
          {createMutation.isPending || updateMutation.isPending
            ? 'Saving...'
            : user
            ? 'Update Admin User'
            : 'Create Admin User'}
        </button>
      </div>
    </form>
  );
}

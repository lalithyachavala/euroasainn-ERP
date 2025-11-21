import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DataTable } from '../../components/shared/DataTable';
import { Modal } from '../../components/shared/Modal';
import { AdminUserForm } from './AdminUserForm';

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
  lastLogin?: string;
  createdAt?: string;
}

export function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [filterActive, setFilterActive] = useState<string>('all');

  // Fetch admin users
  const { data: usersData, isLoading } = useQuery({
    queryKey: ['admin-users', filterActive],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterActive !== 'all') {
        params.append('isActive', filterActive === 'active' ? 'true' : 'false');
      }

      const response = await fetch(`${API_URL}/api/v1/tech/admin-users?${params}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch admin users');
      const data = await response.json();
      return data.data as AdminUser[];
    },
  });

  // Fetch organizations
  const { data: orgsData } = useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/v1/tech/organizations`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      if (!response.ok) return [];
      const data = await response.json();
      return data.data || [];
    },
  });

  // Delete admin user
  const deleteMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`${API_URL}/api/v1/tech/admin-users/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete admin user');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      alert('Admin user deleted successfully!');
    },
    onError: (error: Error) => {
      alert(`Failed to delete admin user: ${error.message}`);
    },
  });

  // Open create form
  const handleCreate = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  // Open edit form
  const handleEdit = (user: AdminUser) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  // Delete admin
  const handleDelete = (user: AdminUser) => {
    if (window.confirm(`Delete admin user ${user.email}?`)) {
      deleteMutation.mutate(user._id);
    }
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  // Table columns
  const columns = [
    {
      key: 'email',
      header: 'Email',
      render: (u: AdminUser) => <strong>{u.email}</strong>,
    },
    { key: 'name', header: 'Name', render: (u: AdminUser) => `${u.firstName} ${u.lastName}` },
    { key: 'role', header: 'Role', render: (u: AdminUser) => u.role },
    {
      key: 'isActive',
      header: 'Status',
      render: (u: AdminUser) => (
        <span className={`status-badge ${u.isActive ? 'active' : 'inactive'}`}>
          {u.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'lastLogin',
      header: 'Last Login',
      render: (u: AdminUser) =>
        u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never',
    },
  ];

  if (isLoading) return <div className="loading">Loading admin users...</div>;

  return (
    <div className="admin-users-page">

      {/* Header */}
      <div className="admin-users-header">
        <div>
          <h1 className="page-title">Admin Users</h1>
          <p className="page-subtitle">Manage admin portal users</p>
        </div>

        <button onClick={handleCreate} className="btn-primary">
          + Create Admin User
        </button>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <label className="filter-label">Filter by Status:</label>
        <select
          className="filter-select"
          value={filterActive}
          onChange={(e) => setFilterActive(e.target.value)}
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={usersData || []}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyMessage="No admin users found."
      />

      {/* Modal — Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={editingUser ? 'Edit Admin User' : 'Create Admin User'}
        size="medium"
      >
        <AdminUserForm
          user={editingUser}
          organizations={orgsData || []}
          onSuccess={() => {
            handleClose();
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
          }}
          onCancel={handleClose}
        />
      </Modal>
    </div>
  );
}

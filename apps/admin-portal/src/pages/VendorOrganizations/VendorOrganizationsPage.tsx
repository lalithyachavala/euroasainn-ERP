/**
 * Vendor Organizations Page
 * Professional Admin Portal Design
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DataTable } from '../../components/shared/DataTable';
import { Modal } from '../../components/shared/Modal';
import { OrganizationForm } from '../CustomerOrganizations/OrganizationForm';
import { useToast } from '../../components/shared/Toast';
import { MdAdd, MdBusiness, MdFilterList } from 'react-icons/md';
import { cn } from '../../lib/utils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface Organization {
  _id: string;
  name: string;
  type: string;
  portalType: string;
  isActive: boolean;
  createdAt?: string;
}

export function VendorOrganizationsPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [filterActive, setFilterActive] = useState<string>('all');

  // Fetch vendor organizations
  const { data: orgsData, isLoading } = useQuery({
    queryKey: ['vendor-orgs', filterActive],
    queryFn: async () => {
      const params = new URLSearchParams({ type: 'vendor' });
      if (filterActive !== 'all') {
        params.append('isActive', filterActive === 'active' ? 'true' : 'false');
      }

      const response = await fetch(`${API_URL}/api/v1/admin/vendor-orgs?${params}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch vendor organizations');
      const data = await response.json();
      return data.data as Organization[];
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (orgId: string) => {
      const response = await fetch(`${API_URL}/api/v1/admin/vendor-orgs/${orgId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete organization');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-orgs'] });
      showToast('Vendor organization deleted successfully!', 'success');
    },
    onError: (error: Error) => {
      showToast(`Failed to delete: ${error.message}`, 'error');
    },
  });

  const handleCreate = () => {
    setEditingOrg(null);
    setIsModalOpen(true);
  };

  const handleEdit = (org: Organization) => {
    setEditingOrg(org);
    setIsModalOpen(true);
  };

  const handleDelete = (org: Organization) => {
    if (window.confirm(`Are you sure you want to delete ${org.name}?`)) {
      deleteMutation.mutate(org._id);
    }
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingOrg(null);
  };

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['vendor-orgs'] });
    showToast(
      editingOrg ? 'Vendor organization updated successfully!' : 'Vendor organization created successfully!',
      'success'
    );
    handleClose();
  };

  const columns = [
    {
      key: 'name',
      header: 'Organization Name',
      render: (org: Organization) => (
        <div className="font-semibold text-gray-900 dark:text-white">{org.name}</div>
      ),
    },
    {
      key: 'portalType',
      header: 'Portal Type',
      render: (org: Organization) => (
        <span className="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300 ring-1 ring-purple-200 dark:ring-purple-800">
          {org.portalType}
        </span>
      ),
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (org: Organization) => (
        <span
          className={cn(
            'px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full',
            org.isActive
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 ring-1 ring-emerald-200 dark:ring-emerald-800'
              : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 ring-1 ring-red-200 dark:ring-red-800'
          )}
        >
          {org.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (org: Organization) => (
        <span className="text-gray-600 dark:text-gray-400">
          {org.createdAt ? new Date(org.createdAt).toLocaleDateString() : 'N/A'}
        </span>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Vendor Organizations</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage vendor organizations and their settings</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
        >
          <MdAdd className="w-5 h-5" />
          <span>Add Vendor Org</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <MdFilterList className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</label>
          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={orgsData || []}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyMessage="No vendor organizations found"
      />

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={editingOrg ? 'Edit Vendor Organization' : 'Create Vendor Organization'}
        size="medium"
      >
        <OrganizationForm
          organization={editingOrg}
          organizationType="vendor"
          onSuccess={handleSuccess}
          onCancel={handleClose}
        />
      </Modal>
    </div>
  );
}


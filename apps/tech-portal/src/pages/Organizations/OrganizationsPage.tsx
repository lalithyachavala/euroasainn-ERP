/**
 * Polished Modern Organizations Page
 * Professional Enterprise Dashboard - Fixed Layout & Spacing
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DataTable } from '../../components/shared/DataTable';
import { Modal } from '../../components/shared/Modal';
import { OrganizationForm } from './OrganizationForm';
import { MdAdd, MdBusiness, MdFilterList } from 'react-icons/md';
import { Button } from '../../components/ui/button';
import { cn } from '../../lib/utils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface Organization {
  _id: string;
  name: string;
  type: string;
  portalType: string;
  isActive: boolean;
  licenseKey?: string;
  createdAt?: string;
}

export function OrganizationsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [filterActive, setFilterActive] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  // Fetch organizations
  const { data: orgsData, isLoading } = useQuery({
    queryKey: ['organizations', filterActive, filterType],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterActive !== 'all') {
        params.append('isActive', filterActive === 'active' ? 'true' : 'false');
      }
      if (filterType !== 'all') {
        params.append('type', filterType);
      }

      const response = await fetch(`${API_URL}/api/v1/tech/organizations?${params}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch organizations');
      const data = await response.json();
      return data.data as Organization[];
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (orgId: string) => {
      const response = await fetch(`${API_URL}/api/v1/tech/organizations/${orgId}`, {
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
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      alert('Organization deleted successfully!');
    },
    onError: (error: Error) => {
      alert(`Failed to delete organization: ${error.message}`);
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
    if (window.confirm(`Are you sure you want to delete organization ${org.name}?`)) {
      deleteMutation.mutate(org._id);
    }
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingOrg(null);
  };

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['organizations'] });
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
      key: 'type',
      header: 'Type',
      render: (org: Organization) => (
        <span className="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300 ring-1 ring-purple-200 dark:ring-purple-800">
          {org.type}
        </span>
      ),
    },
    {
      key: 'portalType',
      header: 'Portal Type',
      render: (org: Organization) => (
        <span className="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 ring-1 ring-blue-200 dark:ring-blue-800">
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
      key: 'licenseKey',
      header: 'License Key',
      render: (org: Organization) => (
        <div className="text-gray-700 dark:text-gray-300 font-mono text-sm">
          {org.licenseKey || 'N/A'}
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created At',
      render: (org: Organization) => (
        <div className="text-gray-500 dark:text-gray-400 text-sm">
          {org.createdAt ? new Date(org.createdAt).toLocaleDateString() : 'N/A'}
        </div>
      ),
    },
  ];

  return (
    <div className="w-full min-h-screen p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Organizations
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">
            Manage organizations and their configurations
          </p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40">
          <MdAdd className="w-5 h-5" /> Add Organization
        </Button>
      </div>

      {/* Filters */}
      <div className="p-6 rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-800/50 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-semibold">
            <MdFilterList className="w-5 h-5" />
            <span>Filters:</span>
          </div>
          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 font-medium"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 font-medium"
          >
            <option value="all">All Types</option>
            <option value="customer">Customer</option>
            <option value="vendor">Vendor</option>
            <option value="partner">Partner</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="p-12 text-center rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-800/50 shadow-lg">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Loading organizations...</p>
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-800/50 shadow-lg">
          <DataTable
            columns={columns}
            data={orgsData || []}
            onEdit={handleEdit}
            onDelete={handleDelete}
            emptyMessage="No organizations found."
          />
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={editingOrg ? 'Edit Organization' : 'Create New Organization'}
      >
        <OrganizationForm organization={editingOrg} onSuccess={handleSuccess} onCancel={handleClose} />
      </Modal>
    </div>
  );
}

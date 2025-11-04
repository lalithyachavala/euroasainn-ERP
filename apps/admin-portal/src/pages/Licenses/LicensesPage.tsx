/**
 * Licenses Page
 * Professional Admin Portal Design
 */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DataTable } from '../../components/shared/DataTable';
import { MdVpnKey, MdFilterList } from 'react-icons/md';
import { cn } from '../../lib/utils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface License {
  _id: string;
  organizationId: string;
  organizationName?: string;
  status: 'active' | 'expired' | 'pending';
  expiresAt: string;
  usageLimits?: {
    maxUsers?: number;
    maxStorage?: number;
  };
  createdAt?: string;
}

export function LicensesPage() {
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Fetch licenses
  const { data: licensesData, isLoading } = useQuery({
    queryKey: ['licenses', filterStatus],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterStatus !== 'all') {
        params.append('status', filterStatus);
      }

      const response = await fetch(`${API_URL}/api/v1/admin/licenses?${params}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch licenses');
      const data = await response.json();
      return data.data as License[];
    },
  });

  const columns = [
    {
      key: 'organizationName',
      header: 'Organization',
      render: (license: License) => (
        <div className="font-semibold text-gray-900 dark:text-white">
          {license.organizationName || license.organizationId}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (license: License) => {
        const statusColors = {
          active: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 ring-emerald-200 dark:ring-emerald-800',
          expired: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 ring-red-200 dark:ring-red-800',
          pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 ring-amber-200 dark:ring-amber-800',
        };
        return (
          <span className={cn('px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ring-1', statusColors[license.status])}>
            {license.status.charAt(0).toUpperCase() + license.status.slice(1)}
          </span>
        );
      },
    },
    {
      key: 'expiresAt',
      header: 'Expires At',
      render: (license: License) => (
        <span className="text-gray-600 dark:text-gray-400">
          {license.expiresAt ? new Date(license.expiresAt).toLocaleDateString() : 'N/A'}
        </span>
      ),
    },
    {
      key: 'usageLimits',
      header: 'Usage Limits',
      render: (license: License) => (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {license.usageLimits?.maxUsers ? `Users: ${license.usageLimits.maxUsers}` : 'N/A'}
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (license: License) => (
        <span className="text-gray-600 dark:text-gray-400">
          {license.createdAt ? new Date(license.createdAt).toLocaleDateString() : 'N/A'}
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Licenses</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage organization licenses and subscriptions</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <MdFilterList className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={licensesData || []}
        emptyMessage="No licenses found"
      />
    </div>
  );
}


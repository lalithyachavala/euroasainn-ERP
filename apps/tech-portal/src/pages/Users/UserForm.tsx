/**
 * Ultra-Modern User Form Component
 * World-Class SaaS ERP Platform Design
 */

import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { MdEmail, MdLock, MdPerson, MdWork, MdSecurity, MdCheckCircle } from 'react-icons/md';
import { useToast } from '../../components/shared/Toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  portalType: string;
  role: string;
  isActive: boolean;
  organizationId?: string;
}

interface UserFormProps {
  user?: User | null;
  onSuccess: () => void;
  onCancel: () => void;
  defaultInviteMode?: boolean;
}

// Define roles for each portal type (outside component to avoid recreation)
const techRoles = [
  { value: 'tech_admin', label: 'Tech Admin', description: 'Full system access' },
  { value: 'tech_manager', label: 'Tech Manager', description: 'Manage users and licenses' },
  { value: 'tech_developer', label: 'Tech Developer', description: 'Development access' },
  { value: 'tech_support', label: 'Tech Support', description: 'Support access' },
];

const adminRoles = [
  { value: 'admin_superuser', label: 'Admin Superuser', description: 'Full admin portal access' },
  { value: 'admin_user', label: 'Admin User', description: 'Standard admin access' },
];

// Get roles based on selected portal type
const getRolesForPortal = (portalType: string) => {
  switch (portalType) {
    case 'tech':
      return techRoles;
    case 'admin':
      return adminRoles;
    default:
      return techRoles; // Default to tech roles
  }
};

export function UserForm({ user, onSuccess, onCancel, defaultInviteMode = false }: UserFormProps) {
  const toast = useToast();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    portalType: 'tech',
    role: 'tech_admin',
    isActive: true,
    organizationId: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isInvite, setIsInvite] = useState(defaultInviteMode);

  useEffect(() => {
    if (user) {
      const portalType = user.portalType || 'tech';
      const roles = getRolesForPortal(portalType);
      const defaultRole = roles.find(r => r.value === user.role) ? user.role : roles[0]?.value || 'tech_admin';
      
      setFormData({
        email: user.email || '',
        password: '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        portalType: portalType,
        role: defaultRole,
        isActive: user.isActive ?? true,
        organizationId: user.organizationId || '',
      });
    }
  }, [user]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email || !formData.email.includes('@')) {
      newErrors.email = 'Valid email is required';
    }

    if (!user && !isInvite && !formData.password) {
      newErrors.password = 'Password is required';
    }

    if (!isInvite && formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const endpoint = isInvite ? `${API_URL}/api/v1/tech/users/invite` : `${API_URL}/api/v1/tech/users`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to ${isInvite ? 'invite' : 'create'} user`);
      }
      const result = await response.json();
      return result;
    },
    onSuccess: (data) => {
      if (isInvite && data.data?.temporaryPassword) {
        toast.success(`User invited successfully! Temporary password: ${data.data.temporaryPassword}`);
      } else {
        toast.success(isInvite ? 'User invited successfully!' : 'User created successfully!');
      }
      onSuccess();
    },
    onError: (error: Error) => {
      toast.error(`Failed to ${isInvite ? 'invite' : 'create'} user: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`${API_URL}/api/v1/tech/users/${user!._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update user');
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success('User updated successfully!');
      onSuccess();
    },
    onError: (error: Error) => {
      toast.error(`Failed to update user: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    const submitData: any = {
      email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      portalType: formData.portalType,
      role: formData.role,
      isActive: formData.isActive,
    };

    if (formData.organizationId) {
      submitData.organizationId = formData.organizationId;
    }

    // For invite, don't send password (backend will generate temporary password)
    // For regular create, send password if provided
    if (!isInvite && formData.password) {
      submitData.password = formData.password;
    }
    // For invite, password is generated by backend, so don't send it

    if (user) {
      updateMutation.mutate(submitData);
    } else {
      createMutation.mutate(submitData);
    }
  };

  // Get current roles based on selected portal type
  const roles = getRolesForPortal(formData.portalType);

  const portalTypes = [
    { value: 'tech', label: 'Tech Portal' },
    { value: 'admin', label: 'Admin Portal' },
    { value: 'customer', label: 'Customer Portal' },
    { value: 'vendor', label: 'Vendor Portal' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {!user && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
          <input
            type="checkbox"
            id="invite"
            checked={isInvite}
            onChange={(e) => setIsInvite(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
          <label htmlFor="invite" className="flex-1 text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
            Send invitation email (user will receive temporary password)
          </label>
        </div>
      )}

      {/* Email */}
      <div>
        <label htmlFor="email" className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          <MdEmail className="w-4 h-4 text-gray-400" />
          Email Address *
        </label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => {
            setFormData({ ...formData, email: e.target.value });
            setErrors({ ...errors, email: '' });
          }}
          disabled={!!user}
          className={`w-full px-4 py-3 rounded-xl border ${
            errors.email
              ? 'border-red-300 dark:border-red-700'
              : 'border-gray-300 dark:border-gray-700'
          } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:cursor-not-allowed`}
          placeholder="user@example.com"
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.email}</p>
        )}
      </div>

      {/* Password */}
      {!user && !isInvite && (
        <div>
          <label htmlFor="password" className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            <MdLock className="w-4 h-4 text-gray-400" />
            Password *
          </label>
          <input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => {
              setFormData({ ...formData, password: e.target.value });
              setErrors({ ...errors, password: '' });
            }}
            className={`w-full px-4 py-3 rounded-xl border ${
              errors.password
                ? 'border-red-300 dark:border-red-700'
                : 'border-gray-300 dark:border-gray-700'
            } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
            placeholder="Enter password (min 6 characters)"
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.password}</p>
          )}
        </div>
      )}

      {/* Name Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            <MdPerson className="w-4 h-4 text-gray-400" />
            First Name *
          </label>
          <input
            id="firstName"
            type="text"
            value={formData.firstName}
            onChange={(e) => {
              setFormData({ ...formData, firstName: e.target.value });
              setErrors({ ...errors, firstName: '' });
            }}
            className={`w-full px-4 py-3 rounded-xl border ${
              errors.firstName
                ? 'border-red-300 dark:border-red-700'
                : 'border-gray-300 dark:border-gray-700'
            } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
            placeholder="John"
          />
          {errors.firstName && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.firstName}</p>
          )}
        </div>

        <div>
          <label htmlFor="lastName" className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            <MdPerson className="w-4 h-4 text-gray-400" />
            Last Name *
          </label>
          <input
            id="lastName"
            type="text"
            value={formData.lastName}
            onChange={(e) => {
              setFormData({ ...formData, lastName: e.target.value });
              setErrors({ ...errors, lastName: '' });
            }}
            className={`w-full px-4 py-3 rounded-xl border ${
              errors.lastName
                ? 'border-red-300 dark:border-red-700'
                : 'border-gray-300 dark:border-gray-700'
            } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
            placeholder="Doe"
          />
          {errors.lastName && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.lastName}</p>
          )}
        </div>
      </div>

      {/* Portal Type and Role */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="portalType" className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            <MdWork className="w-4 h-4 text-gray-400" />
            Portal Type *
          </label>
          <select
            id="portalType"
            value={formData.portalType}
            onChange={(e) => {
              const newPortalType = e.target.value;
              const newRoles = getRolesForPortal(newPortalType);
              // Reset role to first role of new portal type
              setFormData({ 
                ...formData, 
                portalType: newPortalType,
                role: newRoles[0]?.value || ''
              });
            }}
            disabled={!!user}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:cursor-not-allowed"
          >
            {portalTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="role" className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            <MdSecurity className="w-4 h-4 text-gray-400" />
            Role *
          </label>
          <select
            id="role"
            value={formData.role}
            onChange={(e) => {
              setFormData({ ...formData, role: e.target.value });
              setErrors({ ...errors, role: '' });
            }}
            className={`w-full px-4 py-3 rounded-xl border ${
              errors.role
                ? 'border-red-300 dark:border-red-700'
                : 'border-gray-300 dark:border-gray-700'
            } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
          >
            {roles.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label} - {role.description}
              </option>
            ))}
          </select>
          {errors.role && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.role}</p>
          )}
        </div>
      </div>

      {/* Active Status */}
      {user && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
          <label htmlFor="isActive" className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
            <MdCheckCircle className="w-4 h-4 text-emerald-500" />
            User is active
          </label>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={createMutation.isPending || updateMutation.isPending}
          className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          {createMutation.isPending || updateMutation.isPending
            ? 'Saving...'
            : user
            ? 'Update User'
            : isInvite
            ? 'Send Invitation'
            : 'Create User'}
        </button>
      </div>
    </form>
  );
}

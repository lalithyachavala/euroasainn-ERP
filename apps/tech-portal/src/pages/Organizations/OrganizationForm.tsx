/**
 * Ultra-Modern Organization Form Component
 * World-Class SaaS ERP Platform Design
 */

import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { MdBusiness, MdWork, MdEmail, MdPerson } from 'react-icons/md';
import { useToast } from '../../components/shared/Toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface Organization {
  _id: string;
  name: string;
  type: string;
  portalType: string;
  isActive: boolean;
  licenseKey?: string;
}

interface OrganizationFormProps {
  organization?: Organization | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function OrganizationForm({ organization, onSuccess, onCancel }: OrganizationFormProps) {
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: '',
    type: 'customer',
    adminEmail: '',
    firstName: '',
    lastName: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (organization) {
      setFormData({
        name: organization.name || '',
        type: organization.type || 'customer',
        adminEmail: '',
        firstName: '',
        lastName: '',
      });
    }
  }, [organization]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Organization name is required';
    }

    if (!formData.type) {
      newErrors.type = 'Organization type is required';
    }

    if (!formData.adminEmail.trim()) {
      newErrors.adminEmail = 'Organization admin email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.adminEmail)) {
      newErrors.adminEmail = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      // Determine portal type based on organization type
      const portalType = data.type === 'customer' ? 'customer' : 'vendor';
      
      const submitData = {
        name: data.name,
        type: data.type,
        portalType: portalType,
        adminEmail: data.adminEmail, // This will trigger email sending in createOrganization
        firstName: data.firstName || undefined,
        lastName: data.lastName || undefined,
      };

      // Log what we're sending for debugging
      console.log('📤 Sending organization creation request:');
      console.log('   Organization Name:', submitData.name);
      console.log('   Organization Type:', submitData.type);
      console.log('   ⭐ Admin Email (will receive invitation):', submitData.adminEmail);
      console.log('   First Name:', submitData.firstName);
      console.log('   Last Name:', submitData.lastName);
      
      // Verify the email is being sent
      if (!submitData.adminEmail) {
        console.error('❌ WARNING: Admin email is missing! Email will not be sent.');
      } else {
        console.log(`✅ Admin email provided: ${submitData.adminEmail} - invitation will be sent to this address`);
      }

      const response = await fetch(`${API_URL}/api/v1/tech/organizations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create organization');
      }
      const result = await response.json();
      
      // Log the response
      console.log('📥 Organization creation response:', {
        success: result.success,
        emailSent: result.emailSent,
        emailTo: result.emailTo,
        message: result.message,
      });
      
      return result;
    },
    onSuccess: (data) => {
      if (data.emailSent === false && data.emailError) {
        // Email failed
        toast.warning(`Organization created, but email failed to send to ${data.emailTo}: ${data.emailError}`);
        console.error('❌ Email sending failed:', data.emailError);
      } else if (data.emailSent === true) {
        // Email sent successfully
        toast.success(`Organization created successfully! Invitation email has been sent to ${data.emailTo || formData.adminEmail}.`);
        console.log('✅ Email sent successfully to:', data.emailTo || formData.adminEmail);
      } else if (data.message) {
        // Use server message
        toast.success(data.message);
      } else {
        // Fallback message
        toast.success('Organization created successfully! Invitation email has been sent to the admin.');
      }
      onSuccess();
    },
    onError: (error: Error) => {
      toast.error(`Failed to create organization: ${error.message}`);
      console.error('❌ Organization creation error:', error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    // Create organization with admin invitation
    createMutation.mutate(formData);
  };

  const organizationTypes = [
    { value: 'customer', label: 'Customer' },
    { value: 'vendor', label: 'Vendor' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Organization Name */}
      <div>
        <label htmlFor="name" className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          <MdBusiness className="w-4 h-4 text-gray-400" />
          Organization Name *
        </label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => {
            setFormData({ ...formData, name: e.target.value });
            setErrors({ ...errors, name: '' });
          }}
          className={`w-full px-4 py-3 rounded-xl border ${
            errors.name
              ? 'border-red-300 dark:border-red-700'
              : 'border-gray-300 dark:border-gray-700'
          } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
          placeholder="Enter organization name"
          required
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.name}</p>
        )}
      </div>

      {/* Organization Type */}
      <div>
        <label htmlFor="type" className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          <MdWork className="w-4 h-4 text-gray-400" />
          Organization Type *
        </label>
        <select
          id="type"
          value={formData.type}
          onChange={(e) => {
            setFormData({ ...formData, type: e.target.value });
            setErrors({ ...errors, type: '' });
          }}
          className={`w-full px-4 py-3 rounded-xl border ${
            errors.type
              ? 'border-red-300 dark:border-red-700'
              : 'border-gray-300 dark:border-gray-700'
          } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
          required
        >
          {organizationTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        {errors.type && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.type}</p>
        )}
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Portal type will be automatically set to match organization type ({formData.type === 'customer' ? 'Customer' : 'Vendor'} Portal)
        </p>
      </div>

      {/* Organization Admin Email */}
      <div>
        <label htmlFor="adminEmail" className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          <MdEmail className="w-4 h-4 text-gray-400" />
          Organization Admin Email *
        </label>
        <input
          id="adminEmail"
          type="email"
          value={formData.adminEmail}
          onChange={(e) => {
            setFormData({ ...formData, adminEmail: e.target.value });
            setErrors({ ...errors, adminEmail: '' });
          }}
          className={`w-full px-4 py-3 rounded-xl border ${
            errors.adminEmail
              ? 'border-red-300 dark:border-red-700'
              : 'border-gray-300 dark:border-gray-700'
          } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
          placeholder={`Enter ${formData.type === 'customer' ? 'customer' : 'vendor'} organization admin email`}
          required
        />
        {errors.adminEmail && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.adminEmail}</p>
        )}
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          An invitation email will be sent to this address with login credentials
        </p>
      </div>

      {/* First Name (Optional) */}
      <div>
        <label htmlFor="firstName" className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          <MdPerson className="w-4 h-4 text-gray-400" />
          First Name (Optional)
        </label>
        <input
          id="firstName"
          type="text"
          value={formData.firstName}
          onChange={(e) => {
            setFormData({ ...formData, firstName: e.target.value });
            setErrors({ ...errors, firstName: '' });
          }}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          placeholder="Enter first name (will be extracted from email if not provided)"
        />
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          If not provided, will be extracted from email address
        </p>
      </div>

      {/* Last Name (Optional) */}
      <div>
        <label htmlFor="lastName" className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          <MdPerson className="w-4 h-4 text-gray-400" />
          Last Name (Optional)
        </label>
        <input
          id="lastName"
          type="text"
          value={formData.lastName}
          onChange={(e) => {
            setFormData({ ...formData, lastName: e.target.value });
            setErrors({ ...errors, lastName: '' });
          }}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          placeholder="Enter last name (will be extracted from email if not provided)"
        />
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          If not provided, will be extracted from email address
        </p>
      </div>

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
          disabled={createMutation.isPending}
          className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          {createMutation.isPending ? 'Creating Organization...' : 'Create Organization'}
        </button>
      </div>
    </form>
  );
}


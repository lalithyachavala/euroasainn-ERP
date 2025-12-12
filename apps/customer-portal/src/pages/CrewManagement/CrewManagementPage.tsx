import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MdAdd, MdEdit, MdDelete, MdPersonAdd, MdSearch } from 'react-icons/md';
import { authenticatedFetch } from '../../lib/api';
import { useToast } from '../../components/shared/Toast';
import { DataTable } from '../../components/shared/DataTable';

interface Role {
  _id: string;
  name: string;
  description?: string;
  portalType: string;
}

interface BusinessUnit {
  _id: string;
  name: string;
  code?: string;
}

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role?: string;
  position?: string;
  department?: string;
  businessUnitId?: string;
  metadata?: {
    employeeType?: string;
    accessLevel?: string;
  };
  createdAt: string;
}

export function CrewManagementPage() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [creatingForRowId, setCreatingForRowId] = useState<number | null>(null);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form state for adding employee
  const [employeeForm, setEmployeeForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
    businessUnitId: '',
  });

  // Payroll template state (auto-fetched when role is selected)
  const [payrollTemplate, setPayrollTemplate] = useState<{
    base?: number;
    hraPercent?: number;
    taPercent?: number;
    daPercent?: number;
    pfPercent?: number;
    tdsPercent?: number;
    incentives?: number;
    grossSalary?: number;
    netSalary?: number;
  } | null>(null);

  // Fetch employees
  const { data: employees = [], isLoading: employeesLoading, refetch: refetchEmployees } = useQuery<Employee[]>({
    queryKey: ['employees'],
    queryFn: async () => {
      try {
        const response = await authenticatedFetch('/api/v1/customer/employees');
        if (!response.ok) {
          // Don't throw for connection errors
          if (response.status === 0 || response.type === 'error') {
            return [];
          }
          throw new Error('Failed to fetch employees');
        }
        const data = await response.json();
        return data.data || [];
      } catch (error: any) {
        // Return empty array on connection errors instead of throwing
        if (error?.message?.includes('Failed to fetch') || error?.message?.includes('ERR_CONNECTION_REFUSED')) {
          return [];
        }
        throw error;
      }
    },
    retry: false,
  });

  // Fetch roles from Tech Portal Role Management API
  const { data: roles = [], isLoading: rolesLoading, refetch: refetchRoles } = useQuery<Role[]>({
    queryKey: ['roles', 'tech'],
    queryFn: async () => {
      try {
        // Fetch roles from Tech Portal Role Management API
        // Same API endpoint used by Tech Portal: /api/v1/roles?portalType=tech
        const response = await authenticatedFetch('/api/v1/roles?portalType=tech');
      if (!response.ok) {
          // Don't throw for connection errors
          if (response.status === 0 || response.type === 'error') {
            return [];
          }
          return [];
        }
        const data = await response.json();
        // Ensure we return the data in the same format as Tech Portal
        if (data.success && Array.isArray(data.data)) {
          return data.data as Role[];
        }
        // Handle case where data might be directly an array
        if (Array.isArray(data)) {
          return data as Role[];
        }
        // Handle case where data.data exists but is not an array
        if (data.data && Array.isArray(data.data)) {
          return data.data as Role[];
        }
        return [];
      } catch (error: any) {
        // Return empty array on connection errors
        if (error?.message?.includes('Failed to fetch') || error?.message?.includes('ERR_CONNECTION_REFUSED')) {
          return [];
        }
        return [];
      }
    },
    retry: 1,
    refetchOnWindowFocus: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: true, // Always enable the query
  });

  // Fetch payroll structure when role is selected (from Payroll Management)
  const { data: fetchedPayrollTemplate, isLoading: payrollLoading } = useQuery({
    queryKey: ['role-payroll-structure', employeeForm.role],
    queryFn: async () => {
      if (!employeeForm.role) return null;
      try {
        // Fetch payroll structure for the selected role from Payroll Management API
        const response = await authenticatedFetch(`/api/v1/customer/role-payroll-structures/${employeeForm.role}`);
        if (!response.ok) {
          // If 404, no payroll structure exists for this role
          if (response.status === 404) {
            return null;
          }
          // Don't throw for connection errors
          if (response.status === 0 || response.type === 'error') {
            return null;
          }
          return null;
        }
        const data = await response.json();
        if (data.success && data.data?.payrollStructure) {
          return data.data.payrollStructure;
        }
        return null;
      } catch (error: any) {
        // Return null on connection errors
        if (error?.message?.includes('Failed to fetch') || error?.message?.includes('ERR_CONNECTION_REFUSED')) {
          return null;
        }
        return null;
      }
    },
    enabled: !!employeeForm.role && (showAddModal || showEditModal), // Fetch when role is selected and either modal is open
    retry: false,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 0, // Always consider data stale to ensure fresh data after mutations
  });

  // Update payroll template when fetched data changes
  useEffect(() => {
    if (fetchedPayrollTemplate) {
      setPayrollTemplate(fetchedPayrollTemplate);
    } else {
      setPayrollTemplate(null);
    }
  }, [fetchedPayrollTemplate]);

  // Fetch business units
  const { data: businessUnits = [] } = useQuery<BusinessUnit[]>({
    queryKey: ['business-units'],
    queryFn: async () => {
      try {
        const response = await authenticatedFetch('/api/v1/customer/business-units');
        if (!response.ok) {
          // Don't throw for connection errors
          if (response.status === 0 || response.type === 'error') {
            return [];
          }
        return [];
      }
      const data = await response.json();
      return data.data || [];
      } catch (error: any) {
        // Return empty array on connection errors
        if (error?.message?.includes('Failed to fetch') || error?.message?.includes('ERR_CONNECTION_REFUSED')) {
          return [];
        }
        return [];
      }
    },
    retry: false,
  });

  // Invite employee mutation
  const inviteEmployeeMutation = useMutation({
    mutationFn: async (employeeData: typeof employeeForm) => {
      // Prepare the data
      const payload: any = {
        firstName: employeeData.firstName,
        lastName: employeeData.lastName,
        email: employeeData.email,
        phone: employeeData.phone || undefined,
      };

      // Add business unit if selected (not "unassigned")
      if (employeeData.businessUnitId && employeeData.businessUnitId !== 'unassigned') {
        payload.businessUnitId = employeeData.businessUnitId;
      }

      // Add role if selected
      if (employeeData.role) {
        payload.role = employeeData.role;
      }

      const response = await authenticatedFetch('/api/v1/customer/employees/invite', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to invite employee');
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setShowAddModal(false);
      setEmployeeForm({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: '',
        businessUnitId: '',
      });
      setPayrollTemplate(null);
      
      const message = data.data?.emailSent
        ? 'Employee invited successfully! Invitation email sent with login credentials.'
        : data.message || 'Employee invited successfully!';
      showToast(message, 'success');
    },
    onError: (error: any) => {
      showToast(error.message || 'Failed to invite employee', 'error');
    },
  });

  // Update employee mutation
  const updateEmployeeMutation = useMutation({
    mutationFn: async ({ employeeId, data }: { employeeId: string; data: typeof employeeForm }) => {
      // Prepare the data
      const payload: any = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone || undefined,
      };

      // Add business unit if selected (not "unassigned")
      if (data.businessUnitId && data.businessUnitId !== 'unassigned') {
        payload.businessUnitId = data.businessUnitId;
      } else {
        payload.businessUnitId = undefined;
      }

      // Add role if selected
      if (data.role) {
        payload.role = data.role;
      }

      const response = await authenticatedFetch(`/api/v1/customer/employees/${employeeId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update employee');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setShowEditModal(false);
      setEditingEmployee(null);
      setEmployeeForm({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: '',
        businessUnitId: '',
      });
      setPayrollTemplate(null);
      showToast('Employee updated successfully!', 'success');
    },
    onError: (error: any) => {
      showToast(error.message || 'Failed to update employee', 'error');
    },
  });

  // Delete employee mutation
  const deleteEmployeeMutation = useMutation({
    mutationFn: async (employeeId: string) => {
      const response = await authenticatedFetch(`/api/v1/customer/employees/${employeeId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete employee');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      showToast('Employee deleted successfully!', 'success');
    },
    onError: (error: any) => {
      showToast(error.message || 'Failed to delete employee', 'error');
    },
  });

  // Create role mutation
  const createRoleMutation = useMutation({
    mutationFn: async (roleData: { name: string; description?: string }) => {
      const response = await authenticatedFetch('/api/v1/roles', {
        method: 'POST',
        body: JSON.stringify({
          name: roleData.name,
          description: roleData.description,
          portalType: 'customer',
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create role');
      }
      return response.json();
    },
    onSuccess: async () => {
      await refetchRoles();
      setShowRoleModal(false);
      setNewRoleName('');
      setNewRoleDescription('');
      showToast('Role created successfully!', 'success');
    },
    onError: (error: any) => {
      showToast(error.message || 'Failed to create role', 'error');
    },
  });

  const handleSubmitEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeForm.firstName || !employeeForm.lastName || !employeeForm.email) {
      showToast('Please fill in all required fields (Name and Email)', 'error');
      return;
    }
    inviteEmployeeMutation.mutate(employeeForm);
  };

  const handleUpdateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeForm.firstName || !employeeForm.lastName || !employeeForm.email) {
      showToast('Please fill in all required fields (Name and Email)', 'error');
      return;
    }
    if (!editingEmployee) return;
    updateEmployeeMutation.mutate({ employeeId: editingEmployee._id, data: employeeForm });
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setEmployeeForm({
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phone: employee.phone || '',
      role: employee.role || '',
      businessUnitId: employee.businessUnitId || 'unassigned',
    });
    setShowEditModal(true);
  };

  const handleDeleteEmployee = (employeeId: string) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      deleteEmployeeMutation.mutate(employeeId);
    }
  };

  // Filter employees based on search query
  const filteredEmployees = useMemo(() => {
    if (!searchQuery.trim()) {
      return employees;
    }

    const query = searchQuery.toLowerCase().trim();
    return employees.filter((employee) => {
      const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase();
      const email = employee.email.toLowerCase();
      const phone = employee.phone?.toLowerCase() || '';
      const role = employee.role || '';
      const roleName = roles.find((r) => r._id === role)?.name.toLowerCase() || '';
      const businessUnit = businessUnits.find((bu) => bu._id === employee.businessUnitId);
      const buName = businessUnit?.name.toLowerCase() || 'unassigned';

      return (
        fullName.includes(query) ||
        email.includes(query) ||
        phone.includes(query) ||
        roleName.includes(query) ||
        buName.includes(query)
      );
    });
  }, [employees, searchQuery, businessUnits, roles]);

  // Table columns
  const columns = [
    {
      key: 'employeeId',
      header: 'Employee ID',
      render: (employee: Employee) => (
        <span className="font-mono text-sm">{employee._id.slice(-8).toUpperCase()}</span>
      ),
    },
    {
      key: 'name',
      header: 'Name',
      render: (employee: Employee) => (
        <span className="font-medium">{`${employee.firstName} ${employee.lastName}`}</span>
      ),
    },
    {
      key: 'email',
      header: 'Email',
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (employee: Employee) => employee.phone || '-',
    },
    {
      key: 'role',
      header: 'Role',
      render: (employee: Employee) => {
        const role = roles.find((r) => r._id === employee.role);
        return role?.name || '-';
      },
    },
    {
      key: 'businessUnit',
      header: 'Business Unit',
      render: (employee: Employee) => {
        if (!employee.businessUnitId) return 'Unassigned';
        const bu = businessUnits.find((b) => b._id === employee.businessUnitId);
        return bu?.name || 'Unassigned';
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (employee: Employee) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEditEmployee(employee)}
            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            title="Edit"
          >
            <MdEdit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteEmployee(employee._id)}
            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Delete"
          >
            <MdDelete className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">Employee Management</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-[hsl(var(--primary-foreground))] rounded-lg font-medium transition-colors shadow-sm"
        >
          <MdPersonAdd className="w-5 h-5" />
          Add / Invite Employee
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search employees by name, email, phone, type, access level, or business unit..."
          className="w-full pl-10 pr-4 py-2.5 border border-[hsl(var(--border))] rounded-lg bg-[hsl(var(--card))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
        />
      </div>

      {/* Employees Table */}
      {employeesLoading ? (
        <div className="p-16 text-center rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
          <p className="text-lg font-semibold text-[hsl(var(--muted-foreground))]">Loading employees...</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredEmployees}
          emptyMessage={
            searchQuery
              ? `No employees found matching "${searchQuery}".`
              : "No employees found. Click 'Add / Invite Employee' to add your first employee."
          }
        />
      )}

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Add / Invite Employee</h3>
            <form onSubmit={handleSubmitEmployee} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name *
                </label>
                <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                    value={employeeForm.firstName}
                    onChange={(e) => setEmployeeForm((prev) => ({ ...prev, firstName: e.target.value }))}
                    placeholder="First Name"
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                    value={employeeForm.lastName}
                    onChange={(e) => setEmployeeForm((prev) => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Last Name"
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email *
                </label>
              <input
                type="email"
                  value={employeeForm.email}
                  onChange={(e) => setEmployeeForm((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone
                </label>
              <input
                type="tel"
                  value={employeeForm.phone}
                  onChange={(e) => setEmployeeForm((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter phone number"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Role (from Tech Portal Role Management)
                </label>
                <select
                  value={employeeForm.role}
                  onChange={(e) => {
                    setEmployeeForm((prev) => ({ ...prev, role: e.target.value }));
                    // Clear payroll template when role changes (will be auto-fetched)
                    setPayrollTemplate(null);
                  }}
                  disabled={rolesLoading}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {rolesLoading ? 'Loading roles from Tech Portal...' : 'Select Role'}
                  </option>
                  {roles.length > 0 ? (
                    roles.map((role) => (
                      <option key={role._id} value={role._id}>
                        {role.name}
                      </option>
                    ))
                  ) : !rolesLoading ? (
                    <option value="" disabled>
                      No roles available
                    </option>
                  ) : null}
                </select>
                {!rolesLoading && roles.length === 0 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    No roles found. Create roles in Tech Portal Role Management.
                  </p>
                )}
              </div>

              {/* Auto-fetched Salary Template Display */}
              {employeeForm.role && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                      Salary Template (Auto-loaded from Payroll Management)
                    </h4>
                    {payrollLoading && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">Loading...</span>
                    )}
                  </div>
                  
                  {payrollTemplate ? (
                    <div className="space-y-2 text-sm">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Base Salary:</span>
                          <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                            ₹{payrollTemplate.base?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Incentives:</span>
                          <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                            ₹{payrollTemplate.incentives?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 pt-2 border-t border-gray-200 dark:border-gray-600">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">HRA:</span>
                          <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                            {payrollTemplate.hraPercent?.toFixed(2) || '0.00'}%
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">TA:</span>
                          <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                            {payrollTemplate.taPercent?.toFixed(2) || '0.00'}%
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">DA:</span>
                          <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                            {payrollTemplate.daPercent?.toFixed(2) || '0.00'}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200 dark:border-gray-600">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">PF:</span>
                          <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                            {payrollTemplate.pfPercent?.toFixed(2) || '0.00'}%
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">TDS:</span>
                          <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                            {payrollTemplate.tdsPercent?.toFixed(2) || '0.00'}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200 dark:border-gray-600">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Gross Salary:</span>
                          <span className="ml-2 font-semibold text-green-600 dark:text-green-400">
                            ₹{payrollTemplate.grossSalary?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Net Salary:</span>
                          <span className="ml-2 font-semibold text-blue-600 dark:text-blue-400">
                            ₹{payrollTemplate.netSalary?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : !payrollLoading ? (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      No salary template found for this role. Define one in Payroll Management.
                    </p>
                  ) : null}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Business Unit
                </label>
              <select
                  value={employeeForm.businessUnitId}
                  onChange={(e) => setEmployeeForm((prev) => ({ ...prev, businessUnitId: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="unassigned">Unassigned</option>
                  {businessUnits.map((bu) => (
                    <option key={bu._id} value={bu._id}>
                      {bu.name}
                      </option>
                    ))}
              </select>
              </div>

              <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setPayrollTemplate(null);
                    setEmployeeForm({
                      firstName: '',
                      lastName: '',
                      email: '',
                      phone: '',
                      role: '',
                      businessUnitId: '',
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviteEmployeeMutation.isPending}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {inviteEmployeeMutation.isPending ? 'Inviting...' : 'Invite Employee'}
              </button>
            </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditModal && editingEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Edit Employee</h3>
            <form onSubmit={handleUpdateEmployee} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={employeeForm.firstName}
                    onChange={(e) => setEmployeeForm((prev) => ({ ...prev, firstName: e.target.value }))}
                    placeholder="First Name"
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={employeeForm.lastName}
                    onChange={(e) => setEmployeeForm((prev) => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Last Name"
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={employeeForm.email}
                  onChange={(e) => setEmployeeForm((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={employeeForm.phone}
                  onChange={(e) => setEmployeeForm((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter phone number"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Role (from Tech Portal Role Management)
                </label>
                <select
                  value={employeeForm.role}
                  onChange={(e) => {
                    setEmployeeForm((prev) => ({ ...prev, role: e.target.value }));
                    // Clear payroll template when role changes (will be auto-fetched)
                    setPayrollTemplate(null);
                  }}
                  disabled={rolesLoading}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {rolesLoading ? 'Loading roles from Tech Portal...' : 'Select Role'}
                  </option>
                  {roles.length > 0 ? (
                    roles.map((role) => (
                      <option key={role._id} value={role._id}>
                        {role.name}
                      </option>
                    ))
                  ) : !rolesLoading ? (
                    <option value="" disabled>
                      No roles available
                    </option>
                  ) : null}
                </select>
                {!rolesLoading && roles.length === 0 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    No roles found. Create roles in Tech Portal Role Management.
                  </p>
                )}
              </div>

              {/* Auto-fetched Salary Template Display */}
              {employeeForm.role && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                      Salary Template (Auto-loaded from Payroll Management)
                    </h4>
                    {payrollLoading && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">Loading...</span>
                    )}
                  </div>
                  
                  {payrollTemplate ? (
                    <div className="space-y-2 text-sm">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Base Salary:</span>
                          <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                            ₹{payrollTemplate.base?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Incentives:</span>
                          <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                            ₹{payrollTemplate.incentives?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 pt-2 border-t border-gray-200 dark:border-gray-600">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">HRA:</span>
                          <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                            {payrollTemplate.hraPercent?.toFixed(2) || '0.00'}%
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">TA:</span>
                          <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                            {payrollTemplate.taPercent?.toFixed(2) || '0.00'}%
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">DA:</span>
                          <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                            {payrollTemplate.daPercent?.toFixed(2) || '0.00'}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200 dark:border-gray-600">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">PF:</span>
                          <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                            {payrollTemplate.pfPercent?.toFixed(2) || '0.00'}%
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">TDS:</span>
                          <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                            {payrollTemplate.tdsPercent?.toFixed(2) || '0.00'}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200 dark:border-gray-600">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Gross Salary:</span>
                          <span className="ml-2 font-semibold text-green-600 dark:text-green-400">
                            ₹{payrollTemplate.grossSalary?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Net Salary:</span>
                          <span className="ml-2 font-semibold text-blue-600 dark:text-blue-400">
                            ₹{payrollTemplate.netSalary?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : !payrollLoading ? (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      No salary template found for this role. Define one in Payroll Management.
                    </p>
                  ) : null}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Business Unit
                </label>
                <select
                  value={employeeForm.businessUnitId}
                  onChange={(e) => setEmployeeForm((prev) => ({ ...prev, businessUnitId: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="unassigned">Unassigned</option>
                  {businessUnits.map((bu) => (
                    <option key={bu._id} value={bu._id}>
                      {bu.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setPayrollTemplate(null);
                    setEditingEmployee(null);
                    setEmployeeForm({
                      firstName: '',
                      lastName: '',
                      email: '',
                      phone: '',
                      role: '',
                      businessUnitId: '',
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
          <button
                  type="submit"
                  disabled={updateEmployeeMutation.isPending}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
                  {updateEmployeeMutation.isPending ? 'Updating...' : 'Update Employee'}
          </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Role Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create New Role</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Role Name *
                </label>
                <input
                  type="text"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  placeholder="Enter role name"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={newRoleDescription}
                  onChange={(e) => setNewRoleDescription(e.target.value)}
                  placeholder="Enter role description"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => {
                  setShowRoleModal(false);
                  setNewRoleName('');
                  setNewRoleDescription('');
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (newRoleName.trim()) {
                    createRoleMutation.mutate({
                      name: newRoleName.trim(),
                      description: newRoleDescription.trim() || undefined,
                    });
                  }
                }}
                disabled={!newRoleName.trim() || createRoleMutation.isPending}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {createRoleMutation.isPending ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

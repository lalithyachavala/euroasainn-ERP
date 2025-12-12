import { Employee, IEmployee, IPayrollDetails } from '../models/employee.model';
import { licenseService } from './license.service';
import { userService } from './user.service';
import { emailService } from './email.service';
import { Organization } from '../models/organization.model';
import { PortalType } from '../../../../packages/shared/src/types/index.ts';
import { logger } from '../config/logger';
import mongoose from 'mongoose';

// Helper function to calculate payroll totals
function calculatePayrollTotals(payroll: Partial<IPayrollDetails>): { grossSalary: number; netSalary: number } {
  // Calculate Gross Salary (sum of all credits)
  const grossSalary = 
    (payroll.base || 0) +
    (payroll.hra || 0) +
    (payroll.ta || 0) +
    (payroll.da || 0) +
    (payroll.sa || 0) +
    (payroll.incentives || 0) +
    (payroll.miscAddons || 0);

  // Calculate Total Deductions (sum of all debits)
  const totalDeductions = 
    (payroll.pf || 0) +
    (payroll.tds || 0) +
    (payroll.insurance || 0) +
    (payroll.salaryAdvance || 0);

  // Calculate Net Salary
  const netSalary = grossSalary - totalDeductions;

  return { grossSalary, netSalary };
}

export class EmployeeService {
  async createEmployee(organizationId: string, data: Partial<IEmployee>) {
    // Check license limit
    const canCreate = await licenseService.checkUsageLimit(organizationId, 'employees');
    if (!canCreate) {
      throw new Error('Employee limit exceeded');
    }

    const employee = new Employee({
      ...data,
      organizationId,
    });

    await employee.save();
    await licenseService.incrementUsage(organizationId, 'employees');
    return employee;
  }

  async getEmployees(organizationId: string, filters?: any) {
    const query: any = { organizationId };
    if (filters?.businessUnitId) {
      query.businessUnitId = filters.businessUnitId;
    }
    return await Employee.find(query);
  }

  async getEmployeeById(employeeId: string, organizationId: string) {
    const employee = await Employee.findOne({ _id: employeeId, organizationId });
    if (!employee) {
      throw new Error('Employee not found');
    }
    return employee;
  }

  async updateEmployee(employeeId: string, organizationId: string, data: Partial<IEmployee>) {
    const employee = await Employee.findOne({ _id: employeeId, organizationId });
    if (!employee) {
      throw new Error('Employee not found');
    }

    // Handle metadata merging
    if (data.metadata && typeof data.metadata === 'object') {
      employee.metadata = { ...employee.metadata, ...data.metadata };
      delete (data as any).metadata;
    }

    // Handle payroll details
    if (data.payrollDetails && typeof data.payrollDetails === 'object') {
      const { grossSalary, netSalary } = calculatePayrollTotals(data.payrollDetails);
      employee.payrollDetails = {
        ...(employee.payrollDetails || {}),
        ...data.payrollDetails,
        grossSalary,
        netSalary,
      };
      delete (data as any).payrollDetails;
    }

    // Handle businessUnitId - convert to ObjectId or set to undefined
    if (data.businessUnitId !== undefined) {
      if (data.businessUnitId && data.businessUnitId !== 'unassigned') {
        employee.businessUnitId = new mongoose.Types.ObjectId(data.businessUnitId as any);
      } else {
        employee.businessUnitId = undefined;
      }
      delete (data as any).businessUnitId;
    }

    // Normalize email if provided
    if (data.email) {
      data.email = (data.email as string).toLowerCase().trim();
    }

    Object.assign(employee, data);
    await employee.save();
    return employee;
  }

  async deleteEmployee(employeeId: string, organizationId: string) {
    const employee = await Employee.findOneAndDelete({ _id: employeeId, organizationId });
    if (!employee) {
      throw new Error('Employee not found');
    }
    await licenseService.decrementUsage(organizationId, 'employees');
    return { success: true };
  }

  async inviteEmployee(organizationId: string, data: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    employeeType?: string;
    accessLevel?: string;
    businessUnitId?: string;
    payrollDetails?: Partial<IPayrollDetails>;
  }) {
    // Check license limit
    const canCreate = await licenseService.checkUsageLimit(organizationId, 'employees');
    if (!canCreate) {
      throw new Error('Employee limit exceeded');
    }

    // Normalize email
    const normalizedEmail = data.email.toLowerCase().trim();

    // Check if employee with this email already exists
    const existingEmployee = await Employee.findOne({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      email: normalizedEmail,
    });

    if (existingEmployee) {
      throw new Error('Employee with this email already exists');
    }

    // Get organization name for email
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      throw new Error('Organization not found');
    }

    // Create or get user account
    let user: any = null;
    let temporaryPassword: string | undefined;

    try {
      // Try to create a user account for the employee
      // Employees use customer portal with a default role
      const { User } = await import('../models/user.model');
      const existingUser = await User.findOne({
        email: normalizedEmail,
        portalType: PortalType.CUSTOMER,
      });

      if (existingUser) {
        // User exists, reset password
        const result = await userService.resetUserTemporaryPassword(normalizedEmail, PortalType.CUSTOMER);
        temporaryPassword = result.temporaryPassword;
        user = result.user;
      } else {
        // Create new user
        const userResult = await userService.inviteUser({
          email: normalizedEmail,
          firstName: data.firstName,
          lastName: data.lastName,
          portalType: PortalType.CUSTOMER,
          role: 'customer_user', // Default role for employees
          organizationId: organizationId,
        });
        temporaryPassword = userResult.temporaryPassword;
        user = userResult;
      }
    } catch (error: any) {
      logger.error(`Failed to create user for employee: ${error.message}`);
      // Continue with employee creation even if user creation fails
      // The employee can be created without a user account
    }

    // Prepare employee data
    const employeeData: any = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: normalizedEmail,
      organizationId: new mongoose.Types.ObjectId(organizationId),
    };

    if (data.phone) {
      employeeData.phone = data.phone;
    }

    if (data.businessUnitId && data.businessUnitId !== 'unassigned') {
      employeeData.businessUnitId = new mongoose.Types.ObjectId(data.businessUnitId);
    }

      // Add metadata for employeeType and accessLevel
      if (data.employeeType || data.accessLevel) {
        employeeData.metadata = {};
        if (data.employeeType) {
          employeeData.metadata.employeeType = data.employeeType;
        }
        if (data.accessLevel) {
          employeeData.metadata.accessLevel = data.accessLevel;
        }
      }

      // Handle payroll details
      if (data.payrollDetails) {
        const { grossSalary, netSalary } = calculatePayrollTotals(data.payrollDetails);
        employeeData.payrollDetails = {
          ...data.payrollDetails,
          grossSalary,
          netSalary,
        };
      }

      // Create employee
      const employee = new Employee(employeeData);
      await employee.save();
    await licenseService.incrementUsage(organizationId, 'employees');

    // Send invitation email if user was created
    if (user && temporaryPassword) {
      try {
        const portalLink = process.env.CUSTOMER_PORTAL_URL || 'http://localhost:4300';
        await emailService.sendEmployeeInvitationEmail({
          to: normalizedEmail,
          firstName: data.firstName,
          lastName: data.lastName,
          organizationName: organization.name,
          portalLink: `${portalLink}/login`,
          temporaryPassword,
        });
        logger.info(`✅ Employee invitation email sent to ${normalizedEmail}`);
      } catch (emailError: any) {
        logger.error(`Failed to send employee invitation email: ${emailError.message}`);
        // Don't fail the invitation if email fails - employee is still created
      }
    }

    return {
      employee,
      temporaryPassword: temporaryPassword || undefined,
      emailSent: !!user && !!temporaryPassword,
    };
  }
}

export const employeeService = new EmployeeService();

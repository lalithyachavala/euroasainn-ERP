import { Employee, IEmployee } from '../models/employee.model';
import { licenseService } from './license.service';

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
}

export const employeeService = new EmployeeService();

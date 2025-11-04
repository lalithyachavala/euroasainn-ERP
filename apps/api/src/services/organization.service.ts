import { Organization, IOrganization } from '../models/organization.model';
import { OrganizationType, PortalType } from '@euroasiann/shared';
import { logger } from '../config/logger';

export class OrganizationService {
  async createOrganization(data: {
    name: string;
    type: OrganizationType;
    portalType: PortalType;
    metadata?: Record<string, any>;
  }) {
    const organization = new Organization(data);
    await organization.save();
    return organization;
  }

  async getOrganizations(type?: OrganizationType, portalType?: PortalType, filters?: any) {
    const query: any = {};

    if (type) {
      query.type = type;
    }

    if (portalType) {
      query.portalType = portalType;
    }

    if (filters?.isActive !== undefined) {
      query.isActive = filters.isActive;
    }

    const organizations = await Organization.find(query);
    return organizations;
  }

  async getOrganizationById(orgId: string) {
    const organization = await Organization.findById(orgId);
    if (!organization) {
      throw new Error('Organization not found');
    }
    return organization;
  }

  async updateOrganization(orgId: string, data: Partial<IOrganization>) {
    const organization = await Organization.findById(orgId);
    if (!organization) {
      throw new Error('Organization not found');
    }

    Object.assign(organization, data);
    await organization.save();
    return organization;
  }

  async deleteOrganization(orgId: string) {
    const organization = await Organization.findByIdAndDelete(orgId);
    if (!organization) {
      throw new Error('Organization not found');
    }
    return { success: true };
  }
}

export const organizationService = new OrganizationService();

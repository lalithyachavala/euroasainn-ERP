import { RFQ, IRFQ } from '../models/rfq.model';
import { v4 as uuidv4 } from 'uuid';
import { licenseService } from './license.service';

export class RFQService {
  generateRFQNumber(): string {
    return `RFQ-${Date.now()}-${uuidv4().substring(0, 8).toUpperCase()}`;
  }

  async createRFQ(organizationId: string, data: Partial<IRFQ>) {
    // Check license limit
    await licenseService.checkUsageLimit(organizationId, 'employees');

    const rfq = new RFQ({
      ...data,
      organizationId,
      rfqNumber: this.generateRFQNumber(),
    });

    await rfq.save();
    return rfq;
  }

  async getRFQs(organizationId: string, filters?: any) {
    const query: any = { organizationId };
    if (filters?.status) {
      query.status = filters.status;
    }
    return await RFQ.find(query);
  }

  async getRFQById(rfqId: string, organizationId: string) {
    const rfq = await RFQ.findOne({ _id: rfqId, organizationId });
    if (!rfq) {
      throw new Error('RFQ not found');
    }
    return rfq;
  }

  async updateRFQ(rfqId: string, organizationId: string, data: Partial<IRFQ>) {
    const rfq = await RFQ.findOne({ _id: rfqId, organizationId });
    if (!rfq) {
      throw new Error('RFQ not found');
    }

    Object.assign(rfq, data);
    await rfq.save();
    return rfq;
  }

  async deleteRFQ(rfqId: string, organizationId: string) {
    const rfq = await RFQ.findOneAndDelete({ _id: rfqId, organizationId });
    if (!rfq) {
      throw new Error('RFQ not found');
    }
    return { success: true };
  }
}

export const rfqService = new RFQService();

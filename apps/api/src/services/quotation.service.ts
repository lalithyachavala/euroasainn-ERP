import { Quotation, IQuotation } from '../models/quotation.model';
import { v4 as uuidv4 } from 'uuid';

export class QuotationService {
  generateQuotationNumber(): string {
    return `QUO-${Date.now()}-${uuidv4().substring(0, 8).toUpperCase()}`;
  }

  async createQuotation(organizationId: string, data: Partial<IQuotation>) {
    const quotation = new Quotation({
      ...data,
      organizationId,
      quotationNumber: this.generateQuotationNumber(),
    });

    await quotation.save();
    return quotation;
  }

  async getQuotations(organizationId: string, filters?: any) {
    const query: any = { organizationId };
    if (filters?.status) {
      query.status = filters.status;
    }
    if (filters?.rfqId) {
      query.rfqId = filters.rfqId;
    }
    return await Quotation.find(query);
  }

  async getQuotationById(quotationId: string, organizationId: string) {
    const quotation = await Quotation.findOne({ _id: quotationId, organizationId });
    if (!quotation) {
      throw new Error('Quotation not found');
    }
    return quotation;
  }

  async updateQuotation(quotationId: string, organizationId: string, data: Partial<IQuotation>) {
    const quotation = await Quotation.findOne({ _id: quotationId, organizationId });
    if (!quotation) {
      throw new Error('Quotation not found');
    }

    Object.assign(quotation, data);
    await quotation.save();
    return quotation;
  }

  async deleteQuotation(quotationId: string, organizationId: string) {
    const quotation = await Quotation.findOneAndDelete({ _id: quotationId, organizationId });
    if (!quotation) {
      throw new Error('Quotation not found');
    }
    return { success: true };
  }
}

export const quotationService = new QuotationService();

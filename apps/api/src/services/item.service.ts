import { Item, IItem } from '../models/item.model';
import { licenseService } from './license.service';

export class ItemService {
  async createItem(organizationId: string, data: Partial<IItem>) {
    // Check license limit
    const canCreate = await licenseService.checkUsageLimit(organizationId, 'items');
    if (!canCreate) {
      throw new Error('Item limit exceeded');
    }

    const item = new Item({
      ...data,
      organizationId,
    });

    await item.save();
    await licenseService.incrementUsage(organizationId, 'items');
    return item;
  }

  async getItems(organizationId: string, filters?: any) {
    const query: any = { organizationId };
    if (filters?.category) {
      query.category = filters.category;
    }
    return await Item.find(query);
  }

  async getItemById(itemId: string, organizationId: string) {
    const item = await Item.findOne({ _id: itemId, organizationId });
    if (!item) {
      throw new Error('Item not found');
    }
    return item;
  }

  async updateItem(itemId: string, organizationId: string, data: Partial<IItem>) {
    const item = await Item.findOne({ _id: itemId, organizationId });
    if (!item) {
      throw new Error('Item not found');
    }

    Object.assign(item, data);
    await item.save();
    return item;
  }

  async deleteItem(itemId: string, organizationId: string) {
    const item = await Item.findOneAndDelete({ _id: itemId, organizationId });
    if (!item) {
      throw new Error('Item not found');
    }
    await licenseService.decrementUsage(organizationId, 'items');
    return { success: true };
  }
}

export const itemService = new ItemService();

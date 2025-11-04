import mongoose, { Schema, Document } from 'mongoose';

export interface IItem extends Document {
  organizationId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  category?: string;
  unitPrice: number;
  currency: string;
  stockQuantity?: number;
  sku?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const ItemSchema = new Schema<IItem>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      index: true,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    stockQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    sku: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

ItemSchema.index({ organizationId: 1 });
ItemSchema.index({ sku: 1 });
ItemSchema.index({ category: 1 });

export const Item = mongoose.model<IItem>('Item', ItemSchema);

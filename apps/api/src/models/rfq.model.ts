import mongoose, { Schema, Document } from 'mongoose';

export interface IRFQ extends Document {
  organizationId: mongoose.Types.ObjectId;
  rfqNumber: string;
  title: string;
  description?: string;
  status: string;
  dueDate?: Date;
  vesselId?: mongoose.Types.ObjectId;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const RFQSchema = new Schema<IRFQ>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    rfqNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      default: 'draft',
      index: true,
    },
    dueDate: {
      type: Date,
    },
    vesselId: {
      type: Schema.Types.ObjectId,
      ref: 'Vessel',
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

RFQSchema.index({ organizationId: 1, status: 1 });
RFQSchema.index({ rfqNumber: 1 });

export const RFQ = mongoose.model<IRFQ>('RFQ', RFQSchema);

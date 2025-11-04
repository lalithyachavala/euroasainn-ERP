import mongoose, { Schema, Document } from 'mongoose';

export interface IBusinessUnit extends Document {
  organizationId: mongoose.Types.ObjectId;
  name: string;
  code?: string;
  description?: string;
  parentUnitId?: mongoose.Types.ObjectId;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const BusinessUnitSchema = new Schema<IBusinessUnit>(
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
    code: {
      type: String,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    parentUnitId: {
      type: Schema.Types.ObjectId,
      ref: 'BusinessUnit',
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

BusinessUnitSchema.index({ organizationId: 1 });
BusinessUnitSchema.index({ parentUnitId: 1 });

export const BusinessUnit = mongoose.model<IBusinessUnit>('BusinessUnit', BusinessUnitSchema);

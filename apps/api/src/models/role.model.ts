import mongoose, { Schema, Document } from "mongoose";
import { PortalType } from "@euroasiann/shared";

export interface IRole extends Document {
  name: string;
  key: string;
  portalType: PortalType;
  permissions: string[];
  organizationId?: mongoose.Types.ObjectId; // 🔥 NEW
  description?: string;
  isSystem?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RoleSchema = new Schema<IRole>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    key: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    portalType: {
      type: String,
      enum: Object.values(PortalType),
      required: true,
      index: true,
    },

    permissions: {
      type: [String],
      default: [],
    },

    // 🔥 Organization-scoped roles
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      index: true,
    },

    description: {
      type: String,
      trim: true,
    },

    // 🔐 System roles (global)
    isSystem: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * 🔑 UNIQUE RULES
 * - System roles: unique by (key + portalType)
 * - Org roles: unique by (key + portalType + organizationId)
 */

// Org-specific role uniqueness
RoleSchema.index(
  { key: 1, portalType: 1, organizationId: 1 },
  { unique: true, partialFilterExpression: { organizationId: { $exists: true } } }
);

// System role uniqueness
RoleSchema.index(
  { key: 1, portalType: 1 },
  { unique: true, partialFilterExpression: { isSystem: true } }
);

// Optional: prevent duplicate role names per org
RoleSchema.index(
  { name: 1, portalType: 1, organizationId: 1 },
  { unique: true, partialFilterExpression: { organizationId: { $exists: true } } }
);

export const Role = mongoose.model<IRole>("Role", RoleSchema);

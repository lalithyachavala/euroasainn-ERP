import mongoose, { Schema, Document } from 'mongoose';
import { PortalType } from '../../../../packages/shared/src/types/index.ts';

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  portalType: PortalType;
  role: string;              // casbin role key — example: "tech_cto"
  roleName: string;          // readable name — example: "CTO"
  roleId?: mongoose.Types.ObjectId;
  organizationId?: mongoose.Types.ObjectId;
  isActive: boolean;
  lastLogin?: Date;
  preferences?: {
    language?: string;
    timezone?: string;
    dateFormat?: string;
    timeFormat?: '12h' | '24h';
  };
  securityQuestion?: string;
  securityAnswer?: string;
  createdAt: Date;
  updatedAt: Date;

  // Virtual
  casbinSubject: string;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: function () {
        return this.isNew;
      },
      select: false,
    },

    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },

    portalType: {
      type: String,
      enum: Object.values(PortalType),
      required: true,
    },
<<<<<<< HEAD

    roleName: { type: String, default: "" },
    role: { type: String, default: "" },

    roleId: { type: Schema.Types.ObjectId, ref: 'Role' },

    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization' },

    isActive: { type: Boolean, default: true },

    lastLogin: { type: Date },
=======
    preferences: {
      language: {
        type: String,
        default: 'en',
      },
      timezone: {
        type: String,
        default: 'UTC',
      },
      dateFormat: {
        type: String,
        default: 'MM/DD/YYYY',
      },
      timeFormat: {
        type: String,
        enum: ['12h', '24h'],
        default: '12h',
      },
    },
    securityQuestion: {
      type: String,
    },
    securityAnswer: {
      type: String,
      select: false, // Don't return in queries by default
    },
>>>>>>> main
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual Casbin Subject
UserSchema.virtual("casbinSubject").get(function () {
  return `user:${this._id.toString()}`;
});

// Correct indexes (NO DUPLICATES)
UserSchema.index({ email: 1, portalType: 1 }, { unique: true });
UserSchema.index({ roleId: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ organizationId: 1, portalType: 1 });

export const User = mongoose.model<IUser>('User', UserSchema);

import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { User, IUser } from "../models/user.model";
import { PortalType } from "../../../../packages/shared/src/types/index";
import { redisService } from "./redis.service";

/* ---------------- UTIL ---------------- */

function generateTemporaryPassword() {
  return (
    Math.random().toString(36).slice(-6) +
    Math.random().toString(36).slice(-6).toUpperCase()
  );
}

/* ---------------- SERVICE ---------------- */

export class UserService {

  /* ---------------- CREATE USER ---------------- */
  async createUser(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    portalType: PortalType;
    role: string;
    organizationId: string;
  }) {
    if (!data.organizationId) {
      throw new Error("OrganizationId is required");
    }

    const normalizedEmail = data.email.toLowerCase().trim();

    const existing = await User.findOne({
      email: normalizedEmail,
      portalType: data.portalType,
      organizationId: data.organizationId,
    });

    if (existing) {
      throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = new User({
      email: normalizedEmail,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      portalType: data.portalType,
      role: data.role,
      organizationId: new mongoose.Types.ObjectId(data.organizationId),
    });

    await user.save();

    const userDoc = user.toObject();
    delete userDoc.password;
    
    // ⚡ REDIS CACHE: Invalidate users cache
    try {
      await redisService.deleteCache(`users:${data.organizationId}:all`);
      await redisService.deleteCache(`users:${data.organizationId}:${data.portalType}`);
      await redisService.deleteCache(`user:${user._id}`);
    } catch (error) {
      // Non-critical
    }
    
    return userDoc;
  }

  /* ---------------- GET USERS ---------------- */
  async getUsers(
    portalType: PortalType,
    organizationId: string,
    filters?: any
  ) {
    if (!organizationId) {
      throw new Error("OrganizationId is required");
    }

    const query: any = {
      portalType,
      organizationId,
    };

    if (filters?.isActive !== undefined) {
      query.isActive = filters.isActive;
    }

    return User.find(query).select("-password");
  }

  /* ---------------- GET USER BY ID ---------------- */
  async getUserById(userId: string) {
    const user = await User.findById(userId).select("-password");
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }

  /* ---------------- UPDATE USER ---------------- */
  async updateUser(userId: string, data: Partial<IUser>) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    delete (data as any).password; // 🚫 never here

    Object.assign(user, data);
    await user.save();

    const userDoc = user.toObject();
    delete userDoc.password;
    
    // ⚡ REDIS CACHE: Invalidate users cache
    try {
      const orgId = user.organizationId?.toString();
      if (orgId) {
        await redisService.deleteCache(`users:${orgId}:all`);
        await redisService.deleteCache(`users:${orgId}:${user.portalType}`);
      }
      await redisService.deleteCache(`user:${userId}`);
    } catch (error) {
      // Non-critical
    }
    
    return userDoc;
  }

  /* ---------------- DELETE USER ---------------- */
  async deleteUser(userId: string) {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    // ⚡ REDIS CACHE: Invalidate users cache
    try {
      const orgId = user.organizationId?.toString();
      if (orgId) {
        await redisService.deleteCache(`users:${orgId}:all`);
        await redisService.deleteCache(`users:${orgId}:${user.portalType}`);
      }
      await redisService.deleteCache(`user:${userId}`);
    } catch (error) {
      // Non-critical
    }
    
    return { success: true };
  }

  /* ---------------- INVITE USER ---------------- */
  async inviteUser(data: {
    email: string;
    firstName: string;
    lastName: string;
    portalType: PortalType;
    role: string;
    roleId?: string;
    organizationId: string;
  }) {
    if (!data.organizationId) {
      throw new Error("OrganizationId is required");
    }

    const normalizedEmail = data.email.toLowerCase().trim();

    const existing = await User.findOne({
      email: normalizedEmail,
      portalType: data.portalType,
      organizationId: data.organizationId,
    });

    if (existing) {
      throw new Error("User already exists");
    }

    const temporaryPassword = generateTemporaryPassword();
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    const user = new User({
      email: normalizedEmail,
      firstName: data.firstName,
      lastName: data.lastName,
      portalType: data.portalType,
      role: data.role,
      roleId: data.roleId
        ? new mongoose.Types.ObjectId(data.roleId)
        : undefined,
      password: hashedPassword,
      organizationId: new mongoose.Types.ObjectId(data.organizationId),
    });

    await user.save();

    const userDoc = user.toObject();
    delete userDoc.password;

    // ⚡ REDIS CACHE: Invalidate users cache
    try {
      await redisService.deleteCache(`users:${data.organizationId}:all`);
      await redisService.deleteCache(`users:${data.organizationId}:${data.portalType}`);
    } catch (error) {
      // Non-critical
    }

    return { ...userDoc, temporaryPassword };
  }

  /* ---------------- RESET TEMP PASSWORD ---------------- */
  async resetUserTemporaryPassword(email: string, portalType: PortalType) {
    const user = await User.findOne({ email, portalType });
    if (!user) {
      throw new Error("User not found");
    }

    const temporaryPassword = generateTemporaryPassword();
    user.password = await bcrypt.hash(temporaryPassword, 10);
    await user.save();

    const userDoc = user.toObject();
    delete userDoc.password;
    return { user: userDoc, temporaryPassword };
  }
}

export const userService = new UserService();

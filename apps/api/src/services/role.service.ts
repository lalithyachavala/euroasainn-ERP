import mongoose from "mongoose";
import { Role, IRole } from "../models/role.model";
import { PortalType } from "@euroasiann/shared";
import { logger } from "../config/logger";
import { getCasbinEnforcer, resetCasbinEnforcer } from "../config/casbin";
import { PERMISSION_TO_CASBIN } from
  "../../../../packages/casbin-config/src/permission-casbin.map";

/* =========================
   HELPERS
========================= */

const generateRoleKey = (name: string, portalType: PortalType) => {
  const base = `${portalType}_${name}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return base || `${portalType}_role`;
};

const portalTypeToCasbinPortal = (portal: string) =>
  `${portal}_portal`;

/* =========================
   SERVICE
========================= */

class RoleService {

  async listRoles(filter: {
    portalType?: PortalType;
    organizationId: string;
  }) {
    const query: any = {
      $or: [
        { organizationId: new mongoose.Types.ObjectId(filter.organizationId) },
        { isSystem: true },
      ],
    };

    if (filter.portalType) query.portalType = filter.portalType;

    return Role.find(query)
      .sort({ isSystem: -1, name: 1 })
      .lean();
  }

  /* ---------- CREATE ROLE ---------- */

  async createRole(data: {
    name: string;
    portalType: PortalType;
    permissions?: string[];
    description?: string;
    organizationId: string;
  }) {
    const {
      name,
      portalType,
      permissions = [],
      description,
      organizationId,
    } = data;

    const orgId = new mongoose.Types.ObjectId(organizationId);

    const existing = await Role.findOne({
      name: name.trim(),
      portalType,
      organizationId: orgId,
    });

    if (existing) {
      throw new Error("Role with this name already exists");
    }

    const baseKey = generateRoleKey(name, portalType);
    let key = baseKey;
    let counter = 1;

    while (await Role.exists({ key, organizationId: orgId })) {
      key = `${baseKey}_${counter++}`;
    }

    const role = await Role.create({
      name: name.trim(),
      key,
      portalType,
      permissions,
      organizationId: orgId,
      description: description?.trim() || "",
      isSystem: false,
    });

    const enforcer = await getCasbinEnforcer();
    const casbinPortal = portalTypeToCasbinPortal(portalType);

    await enforcer.addNamedGroupingPolicy(
      "g4",
      role.key,
      role.key,
      casbinPortal
    );

    if (permissions.length > 0) {
      const policies = permissions
        .map((perm) => {
          const mapped = PERMISSION_TO_CASBIN[perm];
          if (!mapped) return null;

          return [
            role.key,
            mapped.obj,
            mapped.act,
            organizationId,
            "allow",
            casbinPortal,
            role.key,
          ];
        })
        .filter(Boolean) as string[][];

      await enforcer.addPolicies(policies);
      await enforcer.savePolicy();

      // 🔥 PERMANENT FIX (DO NOT RENAME)
      resetCasbinEnforcer();
    }

    logger.info(`✅ Role created: ${role.key}`);
    return role;
  }

  /* ---------- UPDATE ROLE ---------- */

  async updateRole(roleId: string, data: Partial<IRole>) {
    const role = await Role.findById(roleId);
    if (!role) throw new Error("Role not found");
    if (role.isSystem) throw new Error("Cannot update system roles");

    const enforcer = await getCasbinEnforcer();
    const casbinPortal = portalTypeToCasbinPortal(role.portalType);
    const orgIdStr = role.organizationId!.toString();

    if (data.permissions) {
      role.permissions = data.permissions;

      const allPolicies = await enforcer.getPolicy();
      const oldPolicies = allPolicies.filter(
        (p) => p[0] === role.key && p[3] === orgIdStr
      );

      if (oldPolicies.length > 0) {
        await enforcer.removePolicies(oldPolicies);
      }

      const newPolicies = role.permissions
        .map((perm) => {
          const mapped = PERMISSION_TO_CASBIN[perm];
          if (!mapped) return null;

          return [
            role.key,
            mapped.obj,
            mapped.act,
            orgIdStr,
            "allow",
            casbinPortal,
            role.key,
          ];
        })
        .filter(Boolean) as string[][];

      if (newPolicies.length > 0) {
        await enforcer.addPolicies(newPolicies);
      }

      await enforcer.savePolicy();

      // 🔥 PERMANENT FIX (DO NOT RENAME)
      resetCasbinEnforcer();
    }

    await role.save();
    return role;
  }

  async deleteRole(roleId: string, organizationId: string) {
    const role = await Role.findOne({ _id: roleId, organizationId });
    if (!role) throw new Error("Role not found");
    if (role.isSystem) throw new Error("Cannot delete system roles");

    const enforcer = await getCasbinEnforcer();

    const allPolicies = await enforcer.getPolicy();
    const oldPolicies = allPolicies.filter(
      (p) => p[0] === role.key && p[3] === organizationId
    );

    if (oldPolicies.length > 0) {
      await enforcer.removePolicies(oldPolicies);
    }

    await enforcer.removeFilteredNamedGroupingPolicy("g4", 0, role.key);
    await enforcer.savePolicy();

    // 🔥 PERMANENT FIX (DO NOT RENAME)
    resetCasbinEnforcer();

    await Role.findByIdAndDelete(roleId);
    logger.info(`✅ Role deleted fully: ${role.key}`);
    return true;
  }
}

export const roleService = new RoleService();

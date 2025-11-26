import { useState } from "react";
import { MdEdit, MdDelete, MdClose } from "react-icons/md";

/** ONLY ADMIN PORTAL AVAILABLE */
const PORTALS = [
  { label: "Admin Portal", value: "admin_portal" },
];

/** REAL ADMIN PORTAL PERMISSIONS (ENTERPRISE LEVEL) */
const PERMISSION_MAP = {
  admin_portal: [
    // User & Access Management
    "adminUsersCreate",
    "adminUsersEdit",
    "adminUsersDisable",

    // Customer & Vendor Org Management
    "customerOrgsManage",
    "vendorOrgsManage",

    // License Management
    "licensesIssue",
    "licensesRevoke",
    "licenseView",

    // Security & System
    "systemSettingsManage",
    "securityPoliciesManage",

    // Audit
    "auditLogsView",
  ],
};

export function RolesPage() {
  const [roles, setRoles] = useState([
    // -------------------------------
    // 1. SUPER ADMIN (FULL ACCESS)
    // -------------------------------
    {
      _id: "1",
      portal: "admin_portal",
      name: "Admin Superuser",
      permissions: Object.fromEntries(
        PERMISSION_MAP.admin_portal.map((p) => [p, true])
      ),
    },

    // -------------------------------
    // 2. HR TEAM
    // -------------------------------
    {
      _id: "2",
      portal: "admin_portal",
      name: "HR Manager",
      permissions: {
        adminUsersCreate: true,
        adminUsersEdit: true,
        adminUsersDisable: false,
        customerOrgsManage: false,
        vendorOrgsManage: false,
        licensesIssue: false,
        licensesRevoke: false,
        licenseView: true,
        systemSettingsManage: false,
        securityPoliciesManage: false,
        auditLogsView: false,
      },
    },

    // -------------------------------
    // 3. FINANCE TEAM
    // -------------------------------
    {
      _id: "3",
      portal: "admin_portal",
      name: "Finance Manager",
      permissions: {
        adminUsersCreate: false,
        adminUsersEdit: false,
        adminUsersDisable: false,
        customerOrgsManage: true,
        vendorOrgsManage: false,
        licensesIssue: true,
        licensesRevoke: true,
        licenseView: true,
        systemSettingsManage: false,
        securityPoliciesManage: false,
        auditLogsView: true,
      },
    },

    // -------------------------------
    // 4. IT SUPPORT
    // -------------------------------
    {
      _id: "4",
      portal: "admin_portal",
      name: "IT Support",
      permissions: {
        adminUsersCreate: false,
        adminUsersEdit: false,
        adminUsersDisable: false,
        customerOrgsManage: false,
        vendorOrgsManage: false,
        licensesIssue: false,
        licensesRevoke: false,
        licenseView: false,
        systemSettingsManage: true,
        securityPoliciesManage: true,
        auditLogsView: false,
      },
    },

    // -------------------------------
    // 5. OPERATIONS MANAGER
    // -------------------------------
    {
      _id: "5",
      portal: "admin_portal",
      name: "Operations Manager",
      permissions: {
        adminUsersCreate: false,
        adminUsersEdit: false,
        adminUsersDisable: false,
        customerOrgsManage: true,
        vendorOrgsManage: true,
        licensesIssue: false,
        licensesRevoke: false,
        licenseView: true,
        systemSettingsManage: false,
        securityPoliciesManage: false,
        auditLogsView: true,
      },
    },

    // -------------------------------
    // 6. SECURITY ADMIN
    // -------------------------------
    {
      _id: "6",
      portal: "admin_portal",
      name: "Security Admin",
      permissions: {
        adminUsersCreate: true,
        adminUsersEdit: true,
        adminUsersDisable: true,
        customerOrgsManage: false,
        vendorOrgsManage: false,
        licensesIssue: false,
        licensesRevoke: false,
        licenseView: true,
        systemSettingsManage: true,
        securityPoliciesManage: true,
        auditLogsView: false,
      },
    },

    // -------------------------------
    // 7. AUDIT ADMIN (View Only)
    // -------------------------------
    {
      _id: "7",
      portal: "admin_portal",
      name: "Audit Admin",
      permissions: {
        adminUsersCreate: false,
        adminUsersEdit: false,
        adminUsersDisable: false,
        customerOrgsManage: false,
        vendorOrgsManage: false,
        licensesIssue: false,
        licensesRevoke: false,
        licenseView: true,
        systemSettingsManage: false,
        securityPoliciesManage: false,
        auditLogsView: true,
      },
    },
  ]);

  // -------------------------------------------------------------
  // STATE FOR CREATING / EDITING ROLES
  // -------------------------------------------------------------
  const [portal, setPortal] = useState("");
  const [roleName, setRoleName] = useState("");
  const [permissions, setPermissions] = useState({});
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);

  // Load permissions when portal selected
  const handlePortalChange = (value: string) => {
    setPortal(value);
    const newPermissions: any = {};
    PERMISSION_MAP[value]?.forEach((perm) => (newPermissions[perm] = false));
    setPermissions(newPermissions);
  };

  // Add Role
  const handleAddRole = () => {
    if (!portal || !roleName.trim()) return;

    setRoles([
      ...roles,
      { _id: Date.now().toString(), portal, name: roleName, permissions },
    ]);

    setPortal("");
    setRoleName("");
    setPermissions({});
  };

  // Delete role
  const deleteRole = (id: string) => {
    setRoles(roles.filter((r) => r._id !== id));
  };

  // Save editing
  const saveEdit = () => {
    setRoles(roles.map((r) => (r._id === editingRole._id ? editingRole : r)));
    setIsEditModalOpen(false);
  };

  return (
    <div className="p-6 space-y-10 w-full">
      <h1 className="text-2xl font-semibold">Roles & Permissions (Admin Portal)</h1>

      {/* --------------------- CREATE ROLE --------------------- */}
      <div className="bg-white border rounded-lg p-6 shadow-sm space-y-4">
        <h2 className="font-semibold text-lg">Create Custom Role</h2>

        <div className="flex gap-4">
          <select
            className="border rounded-lg p-2 w-1/2"
            value={portal}
            onChange={(e) => handlePortalChange(e.target.value)}
          >
            <option value="">Select Portal</option>
            {PORTALS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>

          <input
            className="border rounded-lg p-2 w-1/2"
            placeholder="Enter Role Name"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
          />
        </div>

        {portal && (
          <div className="grid grid-cols-2 gap-3">
            {Object.keys(permissions).map((key) => (
              <label key={key} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={permissions[key]}
                  onChange={() =>
                    setPermissions({
                      ...permissions,
                      [key]: !permissions[key],
                    })
                  }
                />
                {key.replace(/([A-Z])/g, " $1")}
              </label>
            ))}
          </div>
        )}

        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          onClick={handleAddRole}
        >
          + Add Role
        </button>
      </div>

      {/* --------------------- EXISTING ROLES --------------------- */}
      <div className="bg-white border p-6 rounded-lg shadow-sm">
        <h2 className="font-semibold mb-4">Existing Roles</h2>

        <table className="w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border">Portal</th>
              <th className="p-3 border">Role Name</th>
              <th className="p-3 border">Permissions</th>
              <th className="p-3 border text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {roles.map((r) => (
              <tr key={r._id} className="hover:bg-gray-50">
                <td className="border p-3">{r.portal}</td>
                <td className="border p-3">{r.name}</td>
                <td className="border p-3 text-sm">
                  <div className="grid grid-cols-2 gap-1">
                    {Object.entries(r.permissions)
                      .filter(([_, v]) => v)
                      .map(([p]) => (
                        <div key={p}>• {p.replace(/([A-Z])/g, " $1")}</div>
                      ))}
                  </div>
                </td>

                <td className="border p-0 w-[90px]">
                  <div className="flex divide-x">
                    <button
                      className="w-full py-2 hover:bg-blue-50"
                      onClick={() => {
                        setEditingRole(r);
                        setIsEditModalOpen(true);
                      }}
                    >
                      <MdEdit size={20} className="text-blue-600" />
                    </button>
                    <button
                      className="w-full py-2 hover:bg-red-50"
                      onClick={() => deleteRole(r._id)}
                    >
                      <MdDelete size={20} className="text-red-600" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --------------------- EDIT MODAL --------------------- */}
      {isEditModalOpen && editingRole && (
        <div className="fixed inset-0 bg-black/30 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-[400px] shadow-xl relative space-y-4">
            <button
              className="absolute right-3 top-3"
              onClick={() => setIsEditModalOpen(false)}
            >
              <MdClose size={22} />
            </button>

            <h2 className="text-lg font-semibold">Edit Role</h2>

            <input
              disabled
              value={editingRole.portal}
              className="border p-2 rounded bg-gray-100 w-full"
            />

            <input
              disabled
              value={editingRole.name}
              className="border p-2 rounded bg-gray-100 w-full"
            />

            <div className="grid grid-cols-2 gap-3">
              {Object.keys(editingRole.permissions).map((perm) => (
                <label key={perm} className="flex gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={editingRole.permissions[perm]}
                    onChange={() =>
                      setEditingRole({
                        ...editingRole,
                        permissions: {
                          ...editingRole.permissions,
                          [perm]: !editingRole.permissions[perm],
                        },
                      })
                    }
                  />
                  {perm.replace(/([A-Z])/g, " $1")}
                </label>
              ))}
            </div>

            <button
              className="bg-blue-600 text-white py-2 rounded-lg w-full hover:bg-blue-700"
              onClick={saveEdit}
            >
              Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

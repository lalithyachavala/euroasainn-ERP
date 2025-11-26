import { useState } from "react";
import { MdEdit, MdDelete, MdClose } from "react-icons/md";

const PORTALS = [{ label: "Tech Portal", value: "tech_portal" }];

const PERMISSION_MAP = {
  tech_portal: [
    "adminUsersCreate",
    "adminUsersUpdate",
    "adminUsersDelete",
    "adminUsersView",

    "techUsersCreate",
    "techUsersUpdate",
    "techUsersDelete",
    "techUsersView",

    "licensesFullControl",
    "licensesIssue",
    "licensesRevoke",

    "systemLogsView",
    "systemConfigManage",
    "systemStatusView",

    "manageRoles",
  ],
};

export default function RolesPage() {
  const [roles, setRoles] = useState([
    {
      _id: "1",
      portal: "tech_portal",
      name: "Tech Superadmin",
      permissions: Object.fromEntries(
        PERMISSION_MAP.tech_portal.map((p) => [p, true])
      ),
    },
    {
      _id: "2",
      portal: "tech_portal",
      name: "Tech Manager",
      permissions: {
        adminUsersCreate: true,
        adminUsersUpdate: true,
        adminUsersDelete: false,
        adminUsersView: true,

        techUsersCreate: true,
        techUsersUpdate: true,
        techUsersDelete: false,
        techUsersView: true,

        licensesIssue: true,
        licensesRevoke: true,
        licensesFullControl: false,

        systemLogsView: true,
        systemConfigManage: false,
        systemStatusView: true,

        manageRoles: true,
      },
    },
    {
      _id: "3",
      portal: "tech_portal",
      name: "Tech Developer",
      permissions: {
        systemLogsView: true,
        systemStatusView: true,
        techUsersView: true,

        adminUsersCreate: false,
        adminUsersUpdate: false,
        techUsersCreate: false,
        licensesIssue: false,
        licensesFullControl: false,

        manageRoles: false,
      },
    },
    {
      _id: "4",
      portal: "tech_portal",
      name: "Tech Support",
      permissions: {
        systemStatusView: true,
        systemLogsView: true,
        techUsersView: true,

        adminUsersCreate: false,
        adminUsersUpdate: false,
        techUsersCreate: false,
        licensesIssue: false,
        manageRoles: false,
      },
    },
  ]);

  const [portal, setPortal] = useState("");
  const [roleName, setRoleName] = useState("");
  const [permissions, setPermissions] = useState({});
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);

  const handlePortalChange = (value) => {
    setPortal(value);
    const defaultPerms = {};
    PERMISSION_MAP[value]?.forEach((p) => (defaultPerms[p] = false));
    setPermissions(defaultPerms);
  };

  const handleAddRole = () => {
    if (!portal || !roleName.trim()) return;
    setRoles([
      ...roles,
      {
        _id: Date.now().toString(),
        portal,
        name: roleName,
        permissions,
      },
    ]);

    setPortal("");
    setRoleName("");
    setPermissions({});
  };

  const deleteRole = (id) => {
    setRoles(roles.filter((r) => r._id !== id));
  };

  const saveEdit = () => {
    setRoles(roles.map((r) => (r._id === editingRole._id ? editingRole : r)));
    setIsEditModalOpen(false);
  };

  return (
    <div className="p-6 space-y-10 w-full">
      <h1 className="text-2xl font-semibold">Tech Portal — Roles & Permissions</h1>

      {/* CREATE ROLE */}
      <div className="bg-white border rounded-lg p-6 space-y-4 shadow-sm">
        <h2 className="font-semibold text-lg">Create New Tech Role</h2>

        <div className="flex gap-4">
          <select
            className="border p-2 rounded-lg w-1/2"
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
            className="border p-2 rounded-lg w-1/2"
            placeholder="Enter Role Name (e.g., Tech Lead)"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
          />
        </div>

        {portal && (
          <div className="grid grid-cols-2 gap-3">
            {Object.keys(permissions).map((perm) => (
              <label key={perm} className="flex gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={permissions[perm]}
                  onChange={() =>
                    setPermissions({ ...permissions, [perm]: !permissions[perm] })
                  }
                />
                {perm.replace(/([A-Z])/g, " $1")}
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

      {/* ROLES TABLE */}
      <div className="bg-white border p-6 rounded-lg shadow-sm">
        <h2 className="font-semibold mb-4">Existing Tech Roles</h2>

        <table className="w-full border-collapse table-fixed">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2 w-[20%]">Portal</th>
              <th className="border p-2 w-[20%]">Role</th>
              <th className="border p-2 w-[50%]">Permissions</th>
              <th className="border p-2 w-[10%] text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {roles.map((r) => (
              <tr key={r._id} className="hover:bg-gray-50">
                <td className="border p-2">{r.portal}</td>
                <td className="border p-2">{r.name}</td>

                <td className="border p-2 text-sm">
                  <div className="grid grid-cols-2 gap-1">
                    {Object.entries(r.permissions)
                      .filter(([_, v]) => v)
                      .map(([p]) => (
                        <div key={p}>• {p.replace(/([A-Z])/g, " $1")}</div>
                      ))}
                  </div>
                </td>

               <td className="border p-2 align-middle text-center">
  <div className="flex items-center justify-center gap-3">
    <button
      onClick={() => {
        setEditingRole(r);
        setIsEditModalOpen(true);
      }}
      className="hover:bg-blue-100 p-1 rounded"
    >
      <MdEdit size={18} className="text-blue-600" />
    </button>

    <button
      onClick={() => deleteRole(r._id)}
      className="hover:bg-red-100 p-1 rounded"
    >
      <MdDelete size={18} className="text-red-600" />
    </button>
  </div>
</td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* EDIT MODAL */}
      {isEditModalOpen && editingRole && (
        <div className="fixed inset-0 bg-black/30 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-[400px] shadow-xl space-y-4 relative">
            <button
              className="absolute right-3 top-3"
              onClick={() => setIsEditModalOpen(false)}
            >
              <MdClose size={22} />
            </button>

            <h2 className="font-semibold text-lg">Edit Tech Role</h2>

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

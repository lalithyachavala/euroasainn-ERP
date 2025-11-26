import { useState } from "react";
import { MdEdit, MdDelete, MdClose } from "react-icons/md";

/** ONLY CUSTOMER PORTAL */
const PORTALS = [
  { label: "Customer Portal", value: "customer_portal" },
];

/** PERMISSIONS BASED ON YOUR RULES */
const PERMISSION_MAP = {
  customer_portal: [
    "rfqManage",
    "rfqView",
    "vesselsManage",
    "vesselsView",
    "employeesManage",
    "crewManage",
    "crewView",
    "portManage",
    "financeView",
    "financeManage",
    "customerBillingView",
    "customerBillingManage",
    "vendorOrgsManage",
    "vendorOrgsView",
    "customerOrgsManage",
    "claimManage",
    "claimView",
   
    "licensesIssue",
    "licensesRevoke",
    "documentsUpload",
    "documentsView",
    "shipmentTracking",
  ],
};

export function RolesPage() {
 const [roles, setRoles] = useState([

  // -------------------------------------------------
  // 1. SUPER USER
  // -------------------------------------------------
  {
    _id: "1",
    portal: "customer_portal",
    name: "Admin Superuser",
    permissions: Object.fromEntries(
      PERMISSION_MAP.customer_portal.map((p) => [p, true])
    ),
  },

  // -------------------------------------------------
  // 2. LOGISTICS & BOOKING
  // -------------------------------------------------
  {
    _id: "2",
    portal: "customer_portal",
    name: "Booking Manager",
    permissions: {
      rfqManage: true,
      rfqView: true,
      vesselsView: true,
      shipmentTracking: true,
    },
  },
  {
    _id: "3",
    portal: "customer_portal",
    name: "Booking Executive",
    permissions: {
      rfqView: true,
      shipmentTracking: true,
    },
  },

  // -------------------------------------------------
  // 3. CHARTERING ROLES
  // -------------------------------------------------
  {
    _id: "4",
    portal: "customer_portal",
    name: "Chartering Manager",
    permissions: {
      rfqManage: true,
      rfqView: true,
      vesselsView: true,
    },
  },
  {
    _id: "5",
    portal: "customer_portal",
    name: "Chartering Executive",
    permissions: {
      rfqView: true,
    },
  },

  // -------------------------------------------------
  // 4. OPERATIONS
  // -------------------------------------------------
  {
    _id: "6",
    portal: "customer_portal",
    name: "Operations Manager",
    permissions: {
      vesselsView: true,
      rfqView: true,
      portManage: true,
      vendorOrgsManage: true,
      customerOrgsManage: true,
    },
  },
  {
    _id: "7",
    portal: "customer_portal",
    name: "Operations Executive",
    permissions: {
      vesselsView: true,
      rfqView: true,
      portManage: true,
    },
  },

  // -------------------------------------------------
  // 5. PORT / MARINE
  // -------------------------------------------------
  {
    _id: "8",
    portal: "customer_portal",
    name: "Port Operations Coordinator",
    permissions: {
      portManage: true,
      vesselsView: true,
    },
  },

  // -------------------------------------------------
  // 6. FLEET / TECHNICAL
  // -------------------------------------------------
  {
    _id: "9",
    portal: "customer_portal",
    name: "Fleet Manager",
    permissions: {
      vesselsManage: true,
      vesselsView: true,
      rfqView: true,
    },
  },
  {
    _id: "10",
    portal: "customer_portal",
    name: "Technical Superintendent",
    permissions: {
      vesselsView: true,
      crewView: true,
    },
  },

  // -------------------------------------------------
  // 7. CREWING
  // -------------------------------------------------
  {
    _id: "11",
    portal: "customer_portal",
    name: "Crew Manager",
    permissions: {
      crewManage: true,
      crewView: true,
      vesselsView: true,
    },
  },
  {
    _id: "12",
    portal: "customer_portal",
    name: "Crew Scheduler",
    permissions: {
      crewView: true,
      vesselsView: true,
    },
  },

  // -------------------------------------------------
  // 8. PROCUREMENT / RFQ
  // -------------------------------------------------
  {
    _id: "13",
    portal: "customer_portal",
    name: "Procurement Manager",
    permissions: {
      rfqManage: true,
      rfqView: true,
      vendorOrgsManage: true,
    },
  },
  {
    _id: "14",
    portal: "customer_portal",
    name: "RFQ Officer",
    permissions: {
      rfqManage: true,
      rfqView: true,
    },
  },

  // -------------------------------------------------
  // 9. DOCUMENTATION
  // -------------------------------------------------
  {
    _id: "15",
    portal: "customer_portal",
    name: "Documentation Executive",
    permissions: {
      documentsUpload: true,
      documentsView: true,
      shipmentTracking: true,
      rfqView: true,
    },
  },

  // -------------------------------------------------
  // 10. CUSTOMER & VENDOR RELATIONS
  // -------------------------------------------------
  {
    _id: "16",
    portal: "customer_portal",
    name: "Vendor Relations Manager",
    permissions: {
      vendorOrgsManage: true,
      vendorOrgsView: true,
      rfqView: true,
    },
  },
  {
    _id: "17",
    portal: "customer_portal",
    name: "Customer Relations Manager",
    permissions: {
      customerOrgsManage: true,
      rfqView: true,
    },
  },

  // -------------------------------------------------
  // 11. CLAIMS
  // -------------------------------------------------
  {
    _id: "18",
    portal: "customer_portal",
    name: "Claims Coordinator",
    permissions: {
      claimManage: true,
      claimView: true,
    },
  },
  {
    _id: "19",
    portal: "customer_portal",
    name: "Claims Viewer",
    permissions: {
      claimView: true,
    },
  },

  // -------------------------------------------------
  // 12. TRACKING
  // -------------------------------------------------
  {
    _id: "20",
    portal: "customer_portal",
    name: "Tracking Officer",
    permissions: {
      shipmentTracking: true,
      vesselsView: true,
    },
  },

  // -------------------------------------------------
  // 13. HR
  // -------------------------------------------------
  {
    _id: "21",
    portal: "customer_portal",
    name: "HR Manager",
    permissions: {
      employeesManage: true,
      crewView: true,
    },
  },

  // -------------------------------------------------
  // 14. IT & SYSTEM ADMIN
  // -------------------------------------------------
  {
    _id: "22",
    portal: "customer_portal",
    name: "IT Admin",
    permissions: {
      adminUsersCreate: true,
    },
  },
  {
    _id: "23",
    portal: "customer_portal",
    name: "Security Admin",
    permissions: {
      adminUsersCreate: true,
    },
  },

  // -------------------------------------------------
  // 15. AUDIT
  // -------------------------------------------------
  {
    _id: "24",
    portal: "customer_portal",
    name: "Audit Admin",
    permissions: {
      financeView: true,
      vendorOrgsView: true,
      customerOrgsView: true,
      claimView: true,
    },
  },
]);


  // STATE
  const [portal, setPortal] = useState("");
  const [roleName, setRoleName] = useState("");
  const [permissions, setPermissions] = useState({});
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);

  const handlePortalChange = (value: string) => {
    setPortal(value);
    const newPermissions: any = {};
    PERMISSION_MAP[value]?.forEach((perm) => (newPermissions[perm] = false));
    setPermissions(newPermissions);
  };

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

  const deleteRole = (id: string) => {
    setRoles(roles.filter((r) => r._id !== id));
  };

  const saveEdit = () => {
    setRoles(roles.map((r) => (r._id === editingRole._id ? editingRole : r)));
    setIsEditModalOpen(false);
  };

  return (
    <div className="p-6 space-y-10 w-full">
      <h1 className="text-2xl font-semibold">Roles & Permissions</h1>

      {/* CREATE ROLE */}
      <div className="bg-white border rounded-lg p-6 shadow-sm w-full space-y-4">
        <h2 className="font-semibold text-lg">Create Custom Role</h2>

        <div className="flex gap-4 w-full">
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
            placeholder="Enter Role Name (Manager)"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
          />
        </div>

        {portal && (
          <>
            <p className="font-medium text-sm">Select Permissions:</p>
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
          </>
        )}

        <button
          className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
          onClick={handleAddRole}
        >
          + Add Role
        </button>
      </div>

      {/* EXISTING ROLES */}
      <div className="bg-white border p-6 rounded-lg shadow-sm w-full">
        <h2 className="font-semibold mb-4">Existing Roles</h2>

        <table className="w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-3 w-[15%]">Portal</th>
              <th className="border p-3 w-[15%]">Role Name</th>
              <th className="border p-3 w-[60%]">Permissions</th>
              <th className="border p-3 w-[10%] text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {roles.map((r) => (
              <tr key={r._id} className="hover:bg-gray-50">
                <td className="border p-3 align-top">{r.portal}</td>
                <td className="border p-3 align-top">{r.name}</td>

                {/* PERMISSIONS NOW IN 2 COLUMNS */}
                <td className="border p-3 text-sm align-top">
                  <div className="grid grid-cols-2 gap-1">
                    {Object.entries(r.permissions)
                      .filter(([_, v]) => v)
                      .map(([p]) => (
                        <div key={p}>• {p.replace(/([A-Z])/g, " $1")}</div>
                      ))}
                  </div>
                </td>

                <td className="border p-0">
                  <div className="flex items-center justify-center h-full divide-x">
                    <button
                      className="w-full py-3 hover:bg-blue-50 flex justify-center"
                      onClick={() => {
                        setEditingRole(r);
                        setIsEditModalOpen(true);
                      }}
                    >
                      <MdEdit className="text-blue-600" size={20} />
                    </button>
                    <button
                      className="w-full py-3 hover:bg-red-50 flex justify-center"
                      onClick={() => deleteRole(r._id)}
                    >
                      <MdDelete className="text-red-600" size={20} />
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
          <div className="bg-white p-6 rounded-lg w-[400px] shadow-xl relative space-y-4">
            <button
              className="absolute right-3 top-3"
              onClick={() => setIsEditModalOpen(false)}
            >
              <MdClose size={24} />
            </button>

            <h2 className="text-lg font-semibold">Edit Role</h2>

            <input
              disabled
              value={editingRole.portal}
              className="border p-2 rounded w-full bg-gray-100"
            />

            <input
              disabled
              value={editingRole.name}
              className="border p-2 rounded w-full bg-gray-100"
            />

            {/* Permissions in 2 Columns */}
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
              className="bg-blue-600 text-white py-2 w-full rounded-lg hover:bg-blue-700"
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

import { useState } from "react";
import { MdEdit, MdDelete, MdClose } from "react-icons/md";

/** ONLY VENDOR PORTAL */
const PORTALS = [{ label: "Vendor Portal", value: "vendor_portal" }];

/** REAL-LIFE VENDOR PERMISSIONS */
const PERMISSION_MAP = {
  vendor_portal: [
    // PRODUCT & CATALOG
    "catalogueManage",
    "catalogueView",

    // INVENTORY
    "inventoryManage",
    "inventoryView",

    // QUOTATIONS
    "quotationManage",
    "quotationView",

    // BILLING / INVOICING
    "vendorBillingView",
    "vendorBillingManage",

    // DOCUMENTATION
    "vendorDocumentsUpload",
    "vendorDocumentsView",

    // CLAIMS RESPONSE (for customer claims)
    "vendorClaimRespond",
    "vendorClaimView",

    // QA & COMPLIANCE
    "qualityVerify",
    "complianceApprove",

    // SUPPORT / TICKETS
    "vendorSupportView",
    "vendorSupportRespond",

    // TRACKING
    "shipmentUpdate",
    "shipmentView",

    // USERS
    "vendorUsersCreate",
  ],
};

export default function RolesPage() {
  const [roles, setRoles] = useState([
    // SUPER ADMIN
    {
      _id: "1",
      portal: "vendor_portal",
      name: "Vendor Super Admin",
      permissions: Object.fromEntries(
        PERMISSION_MAP.vendor_portal.map((p) => [p, true])
      ),
    },

    // CATALOG & PRODUCT MANAGEMENT
    {
      _id: "2",
      portal: "vendor_portal",
      name: "Catalogue Manager",
      permissions: {
        catalogueManage: true,
        catalogueView: true,
      },
    },
    {
      _id: "3",
      portal: "vendor_portal",
      name: "Catalogue Executive",
      permissions: {
        catalogueView: true,
      },
    },

    // INVENTORY
    {
      _id: "4",
      portal: "vendor_portal",
      name: "Inventory Manager",
      permissions: {
        inventoryManage: true,
        inventoryView: true,
      },
    },
    {
      _id: "5",
      portal: "vendor_portal",
      name: "Inventory Executive",
      permissions: {
        inventoryView: true,
      },
    },

    // QUOTATIONS
    {
      _id: "6",
      portal: "vendor_portal",
      name: "Quotation Officer",
      permissions: {
        quotationManage: true,
        quotationView: true,
      },
    },

    // BILLING / INVOICING
    {
      _id: "7",
      portal: "vendor_portal",
      name: "Billing Manager",
      permissions: {
        vendorBillingView: true,
        vendorBillingManage: true,
      },
    },
    {
      _id: "8",
      portal: "vendor_portal",
      name: "Billing Executive",
      permissions: {
        vendorBillingView: true,
      },
    },

    // DOCUMENTATION
    {
      _id: "9",
      portal: "vendor_portal",
      name: "Documents Controller",
      permissions: {
        vendorDocumentsUpload: true,
        vendorDocumentsView: true,
      },
    },

    // QUALITY / COMPLIANCE
    {
      _id: "10",
      portal: "vendor_portal",
      name: "QA & Compliance Officer",
      permissions: {
        qualityVerify: true,
        complianceApprove: true,
      },
    },

    // CLAIMS HANDLING
    {
      _id: "11",
      portal: "vendor_portal",
      name: "Claims Respondent",
      permissions: {
        vendorClaimRespond: true,
        vendorClaimView: true,
      },
    },
    {
      _id: "12",
      portal: "vendor_portal",
      name: "Claims Viewer",
      permissions: {
        vendorClaimView: true,
      },
    },

    // SUPPORT TEAM
    {
      _id: "13",
      portal: "vendor_portal",
      name: "Vendor Support Agent",
      permissions: {
        vendorSupportView: true,
        vendorSupportRespond: true,
      },
    },

    // TRACKING / LOGISTICS
    {
      _id: "14",
      portal: "vendor_portal",
      name: "Tracking Officer",
      permissions: {
        shipmentUpdate: true,
        shipmentView: true,
      },
    },

    // IT / ACCESS CONTROL
    {
      _id: "15",
      portal: "vendor_portal",
      name: "Vendor IT Admin",
      permissions: {
        vendorUsersCreate: true,
      },
    },
  ]);

  // STATE FOR ADD + EDIT
  const [portal, setPortal] = useState("");
  const [roleName, setRoleName] = useState("");
  const [permissions, setPermissions] = useState({});
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);

  /** Load permissions when selecting portal */
  const handlePortalChange = (value: string) => {
    setPortal(value);
    const newPermissions: any = {};
    PERMISSION_MAP[value]?.forEach((perm) => (newPermissions[perm] = false));
    setPermissions(newPermissions);
  };

  /** Add Role */
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

  /** Delete Role */
  const deleteRole = (id: string) => {
    setRoles(roles.filter((r) => r._id !== id));
  };

  /** Save Edited Role */
  const saveEdit = () => {
    setRoles(roles.map((r) => (r._id === editingRole._id ? editingRole : r)));
    setIsEditModalOpen(false);
  };

  return (
    <div className="p-6 space-y-10 w-full">
      <h1 className="text-2xl font-semibold">Vendor Roles & Permissions</h1>

      {/* CREATE ROLE */}
      <div className="bg-white border rounded-lg p-6 shadow-sm w-full space-y-4">
        <h2 className="font-semibold text-lg">Create Vendor Role</h2>

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
        <h2 className="font-semibold mb-4">Existing Vendor Roles</h2>

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

                {/* Permissions Grid */}
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

            <h2 className="text-lg font-semibold">Edit Vendor Role</h2>

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

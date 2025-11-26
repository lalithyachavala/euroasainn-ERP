import { useState, useMemo } from "react";
import Select from "react-select";
import { MdSearch, MdFilterList, MdDelete, MdEdit, MdClose } from "react-icons/md";

export default function AssignRolesPage() {
  const FIXED_PORTAL = "vendor_portal"; // vendor portal fixed — no selection needed

  // form states
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  // filters
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  /** Vendor Portal Users (Dummy Data) */
  const fallbackUsers = [
    { _id: "501", name: "Rajesh Supplier", email: "rajesh@vendor.com", role: "vendor_admin" },
    { _id: "502", name: "Megha Vendor", email: "megha@vendor.com", role: "vendor_manager" },
    { _id: "503", name: "Ravi Logistics", email: "ravi@vendor.com", role: "quotation_officer" },
    { _id: "504", name: "Anita Inventory", email: "anita@vendor.com", role: "inventory_manager" },
    { _id: "505", name: "Karan Billing", email: "karan@vendor.com", role: "vendor_billing_manager" },
  ];

  /** Real-life Vendor Roles */
  const fallbackRoles = [
    "vendor_admin",
    "vendor_manager",
    "catalogue_manager",
    "inventory_manager",
    "inventory_executive",
    "quotation_officer",
    "vendor_billing_manager",
    "vendor_billing_executive",
    "vendor_documents_controller",
    "qa_compliance_officer",
    "tracking_officer",
    "claims_respondent",
    "vendor_support",
  ];

  const roleOptions = fallbackRoles.map((r) => ({ label: r, value: r }));

  /** Filter Users Table */
  const filteredUsers = useMemo(() => {
    let data = fallbackUsers;

    if (roleFilter !== "all") data = data.filter((u) => u.role === roleFilter);

    if (searchQuery.trim()) {
      data = data.filter((u) =>
        `${u.name} ${u.email}`.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return data;
  }, [roleFilter, searchQuery]);

  return (
    <div className="p-6 space-y-10">
      <h1 className="text-2xl font-semibold">Assign Vendor Roles</h1>

      {/* ASSIGN ROLE FORM */}
      <div className="border rounded-lg p-5 bg-white shadow-sm max-w-md space-y-4">
        <h2 className="font-semibold">Assign Role</h2>

        {/* Role Dropdown */}
        <Select
          options={roleOptions}
          placeholder="Select Role..."
          value={selectedRole}
          onChange={setSelectedRole}
        />

        {/* User Dropdown */}
        <Select
          options={filteredUsers.map((u) => ({
            value: u._id,
            label: `${u.name} (${u.email})`,
          }))}
          placeholder="Select User..."
          value={selectedUser}
          onChange={setSelectedUser}
        />

        <button
          disabled={!selectedRole || !selectedUser}
          className="bg-blue-600 text-white p-2 rounded w-full disabled:bg-gray-300"
        >
          Assign Role
        </button>
      </div>

      {/* SEARCH + FILTER */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border shadow-sm">

        {/* Search */}
        <div className="relative w-72">
          <MdSearch className="absolute left-3 top-2.5 text-gray-500" />
          <input
            className="border w-full pl-10 p-2 rounded-lg"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Role Filter */}
        <div className="flex items-center border rounded-lg px-3 py-2">
          <MdFilterList className="mr-2 text-gray-600" />
          <select
            className="bg-transparent outline-none cursor-pointer"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            {fallbackRoles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* USERS TABLE */}
      <div className="border rounded-lg p-5 bg-white shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Users</h2>

        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Role</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u._id} className="hover:bg-gray-50">
                <td className="p-2 border">{u.name}</td>
                <td className="p-2 border">{u.email}</td>
                <td className="p-2 border">{u.role}</td>

                <td className="p-2 border flex gap-3">
                  {/* EDIT */}
                  <button
                    className="text-blue-600"
                    onClick={() => {
                      setEditingUser(u);
                      setEditModalOpen(true);
                      setSelectedRole(roleOptions.find((r) => r.value === u.role));
                    }}
                  >
                    <MdEdit size={18} />
                  </button>

                  {/* DELETE */}
                  <button className="text-red-600">
                    <MdDelete size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* EDIT MODAL */}
      {editModalOpen && editingUser && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-[400px] shadow-xl space-y-4 relative">

            <button
              className="absolute right-3 top-3 text-gray-600 hover:text-black"
              onClick={() => setEditModalOpen(false)}
            >
              <MdClose size={22} />
            </button>

            <h2 className="font-semibold text-lg">Edit Role</h2>

            <input
              disabled
              value={editingUser.name}
              className="border p-2 rounded bg-gray-100 cursor-not-allowed w-full"
            />
            <input
              disabled
              value={editingUser.email}
              className="border p-2 rounded bg-gray-100 cursor-not-allowed w-full"
            />

            <Select options={roleOptions} value={selectedRole} onChange={setSelectedRole} />

            <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg w-full">
              Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

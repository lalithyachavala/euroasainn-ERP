import { useState, useMemo } from "react";
import Select from "react-select";
import { MdSearch, MdFilterList, MdDelete, MdEdit, MdClose } from "react-icons/md";

export function AssignRolesPage() {
  const FIXED_PORTAL = "admin_portal";

  // --------------------------
  // ADMIN PORTAL ROLES (REAL)
  // --------------------------
  const adminRoles = [
    "admin_superuser",
    "hr_manager",
    "finance_manager",
    "it_support",
    "operations_manager",
    "security_admin",
    "audit_admin",
  ];

  const roleOptions = adminRoles.map((r) => ({
    label: r.replace(/_/g, " ").toUpperCase(),
    value: r,
  }));

  // --------------------------
  // REALISTIC ADMIN USERS
  // --------------------------
  const fallbackUsers = [
    // SUPER ADMIN
    {
      _id: "101",
      name: "Arvind Kumar",
      email: "arvind.kumar@company.com",
      portal: "admin_portal",
      role: "admin_superuser",
    },
    {
      _id: "102",
      name: "Priya Menon",
      email: "priya.menon@company.com",
      portal: "admin_portal",
      role: "admin_superuser",
    },

    // HR TEAM
    {
      _id: "103",
      name: "Sanjana Rao",
      email: "sanjana.rao@company.com",
      portal: "admin_portal",
      role: "hr_manager",
    },
    {
      _id: "104",
      name: "Ajay Kumar",
      email: "ajay.kumar@company.com",
      portal: "admin_portal",
      role: "hr_manager",
    },

    // FINANCE TEAM
    {
      _id: "105",
      name: "Nisha Patel",
      email: "nisha.patel@company.com",
      portal: "admin_portal",
      role: "finance_manager",
    },
    {
      _id: "106",
      name: "Kiran Shah",
      email: "kiran.shah@company.com",
      portal: "admin_portal",
      role: "finance_manager",
    },

    // IT SUPPORT
    {
      _id: "107",
      name: "Lokesh Kumar",
      email: "lokesh.kumar@company.com",
      portal: "admin_portal",
      role: "it_support",
    },
    {
      _id: "108",
      name: "Swathi Reddy",
      email: "swathi.reddy@company.com",
      portal: "admin_portal",
      role: "it_support",
    },

    // OPERATIONS
    {
      _id: "109",
      name: "Joseph Martin",
      email: "joseph.martin@company.com",
      portal: "admin_portal",
      role: "operations_manager",
    },
    {
      _id: "110",
      name: "Sneha Gupta",
      email: "sneha.gupta@company.com",
      portal: "admin_portal",
      role: "operations_manager",
    },

    // SECURITY TEAM
    {
      _id: "111",
      name: "Vignesh S",
      email: "vignesh.s@company.com",
      portal: "admin_portal",
      role: "security_admin",
    },
    {
      _id: "112",
      name: "Aditi Sharma",
      email: "aditi.sharma@company.com",
      portal: "admin_portal",
      role: "security_admin",
    },

    // AUDIT TEAM
    {
      _id: "113",
      name: "Rohit Rao",
      email: "rohit.rao@company.com",
      portal: "admin_portal",
      role: "audit_admin",
    },
    {
      _id: "114",
      name: "Meera Iyer",
      email: "meera.iyer@company.com",
      portal: "admin_portal",
      role: "audit_admin",
    },
  ];

  // --------------------------
  // STATES
  // --------------------------
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  // --------------------------
  // FILTER USERS
  // --------------------------
  const filteredUsers = useMemo(() => {
    let data = fallbackUsers;

    if (roleFilter !== "all") data = data.filter((u) => u.role === roleFilter);
    if (searchQuery.trim())
      data = data.filter((u) =>
        `${u.name} ${u.email}`.toLowerCase().includes(searchQuery.toLowerCase())
      );

    return data;
  }, [roleFilter, searchQuery]);

  return (
    <div className="p-6 space-y-10">
      <h1 className="text-2xl font-semibold">Assign Roles (Admin Portal)</h1>

      {/* Assign Form */}
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

      {/* Search + Filters */}
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
            {adminRoles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Users Table */}
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

                  <button className="text-red-600">
                    <MdDelete size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
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

            <Select
              options={roleOptions}
              value={selectedRole}
              onChange={setSelectedRole}
            />

            <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg w-full">
              Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

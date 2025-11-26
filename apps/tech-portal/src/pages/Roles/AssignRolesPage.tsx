import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Select from "react-select";
import { MdSearch, MdFilterList, MdDelete, MdEdit, MdClose } from "react-icons/md";

const API_URL = import.meta.env.VITE_API_URL;

export function AssignRolesPage() {
  const queryClient = useQueryClient();

  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [portalFilter, setPortalFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  /** Dummy Data (Fallback if API fails) */
  const fallbackUsers = [
    { _id: "101", name: "Alice Johnson", email: "alice@example.com", portal: "tech_portal", role: "tech_admin" },
    { _id: "102", name: "David Miller", email: "david@example.com", portal: "tech_portal", role: "tech_manager" },
    { _id: "103", name: "Sofia Brown", email: "sofia@example.com", portal: "tech_portal", role: "tech_developer" },
    { _id: "104", name: "Leo Chan", email: "leo@example.com", portal: "tech_portal", role: "tech_support" },
  ];

  const fallbackRoles = {
    tech_portal: ["tech_admin", "tech_manager", "tech_developer", "tech_support"],
  
  };

  /** Role options (ALL roles at once) */
  const roleOptions = Object.values(fallbackRoles)
    .flat()
    .map((r) => ({ label: r, value: r }));

  /** Filter Logic for Table */
  const filteredUsers = useMemo(() => {
    let data = fallbackUsers;

    if (portalFilter !== "all") data = data.filter((u) => u.portal === portalFilter);
    if (roleFilter !== "all") data = data.filter((u) => u.role === roleFilter);
    if (searchQuery.trim())
      data = data.filter((u) =>
        `${u.name} ${u.email}`.toLowerCase().includes(searchQuery.toLowerCase())
      );

    return data;
  }, [portalFilter, roleFilter, searchQuery]);

  return (
    <div className="p-6 space-y-10">
      <h1 className="text-2xl font-semibold">Assign Roles</h1>

      {/* ---------- ASSIGN ROLE FORM (Portal Removed) ---------- */}
      <div className="border rounded-lg p-5 bg-white shadow-sm max-w-md space-y-4">
        <h2 className="font-semibold">Assign Role</h2>

        {/* role dropdown */}
        <Select
          options={roleOptions}
          placeholder="Select Role..."
          value={selectedRole}
          onChange={setSelectedRole}
        />

        {/* user dropdown */}
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

      {/* ---------- SEARCH & FILTER SECTION ---------- */}
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

        {/* Filters side-by-side */}
        <div className="flex gap-4">

          {/* Filter by Portal */}
          <div className="flex items-center border rounded-lg px-3 py-2">
            <MdFilterList className="mr-2 text-gray-600" />
            <select
              className="bg-transparent outline-none cursor-pointer"
              value={portalFilter}
              onChange={(e) => setPortalFilter(e.target.value)}
            >
              <option value="all">All Portals</option>
              <option value="tech_portal">Tech Portal</option>
              <option value="admin_portal">Admin Portal</option>
              <option value="customer_portal">Customer Portal</option>
              <option value="vendor_portal">Vendor Portal</option>
            </select>
          </div>

          {/* Filter by Role */}
          <div className="flex items-center border rounded-lg px-3 py-2">
            <MdFilterList className="mr-2 text-gray-600" />
            <select
              className="bg-transparent outline-none cursor-pointer"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">All Roles</option>
              {Object.values(fallbackRoles)
                .flat()
                .map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      {/* ---------- USERS TABLE ---------- */}
      <div className="border rounded-lg p-5 bg-white shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Users</h2>

        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Portal</th>
              <th className="p-2 border">Role</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u._id} className="hover:bg-gray-50">
                <td className="p-2 border">{u.name}</td>
                <td className="p-2 border">{u.email}</td>
                <td className="p-2 border">{u.portal}</td>
                <td className="p-2 border">{u.role}</td>
                <td className="p-2 border flex gap-3">
                  <button className="text-blue-600">
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
    </div>
  );
}

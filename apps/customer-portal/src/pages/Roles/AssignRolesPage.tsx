import { useState, useMemo } from "react";
import Select from "react-select";
import { MdSearch, MdFilterList, MdDelete, MdEdit, MdClose } from "react-icons/md";

export function AssignRolesPage() {
  const FIXED_PORTAL = "customer_portal";

  // --------------------------
  // ALL CUSTOMER PORTAL ROLES
  // --------------------------
  const fallbackRoles = [
    "Admin Superuser",
    "Booking Manager",
    "Booking Executive",
    "Chartering Manager",
    "Chartering Executive",
    "Operations Manager",
    "Operations Executive",
    "Port Operations Coordinator",
    "Fleet Manager",
    "Technical Superintendent",
    "Crew Manager",
    "Crew Scheduler",
    "Procurement Manager",
    "RFQ Officer",
    "Documentation Executive",
    "Vendor Relations Manager",
    "Customer Relations Manager",
    "Claims Coordinator",
    "Claims Viewer",
    "Tracking Officer",
    "HR Manager",
    "IT Admin",
    "Security Admin",
    "Audit Admin",
  ];

  const roleOptions = fallbackRoles.map((r) => ({ label: r, value: r }));

  // --------------------------
  // REALISTIC DUMMY USERS
  // --------------------------
  const fallbackUsers = [
    // ADMIN SUPER USERS
    { _id: "201", name: "Arun Kumar", email: "arun@company.com", role: "Admin Superuser" },
    { _id: "202", name: "Megha Sharma", email: "megha@company.com", role: "Admin Superuser" },

    // BOOKING TEAM
    { _id: "203", name: "Sanjay Raj", email: "sanjay@company.com", role: "Booking Manager" },
    { _id: "204", name: "Pooja N", email: "pooja@company.com", role: "Booking Executive" },
    { _id: "205", name: "Karthik Joshi", email: "karthik@company.com", role: "Booking Executive" },

    // CHARTERING TEAM
    { _id: "206", name: "Ravi Teja", email: "ravi@company.com", role: "Chartering Manager" },
    { _id: "207", name: "Divya Rao", email: "divya@company.com", role: "Chartering Executive" },

    // OPERATIONS TEAM
    { _id: "208", name: "Rohit Shetty", email: "rohit@company.com", role: "Operations Manager" },
    { _id: "209", name: "Sneha Jain", email: "sneha@company.com", role: "Operations Executive" },

    // PORT / MARINE
    { _id: "210", name: "Joseph Mathew", email: "joseph@company.com", role: "Port Operations Coordinator" },

    // FLEET / TECHNICAL
    { _id: "211", name: "Mohammed Azhar", email: "azhar@company.com", role: "Fleet Manager" },
    { _id: "212", name: "Rahul Menon", email: "rahul@company.com", role: "Technical Superintendent" },

    // CREWING
    { _id: "213", name: "Ayesha Khan", email: "ayesha@company.com", role: "Crew Manager" },
    { _id: "214", name: "Vijay Patel", email: "vijay@company.com", role: "Crew Scheduler" },

    // PROCUREMENT / RFQ
    { _id: "215", name: "Suresh Babu", email: "suresh@company.com", role: "Procurement Manager" },
    { _id: "216", name: "Isha Agarwal", email: "isha@company.com", role: "RFQ Officer" },

    // DOCUMENTATION
    { _id: "217", name: "Keerthi M", email: "keerthi@company.com", role: "Documentation Executive" },

    // RELATIONS
    { _id: "218", name: "Thomas George", email: "thomas@company.com", role: "Vendor Relations Manager" },
    { _id: "219", name: "Ritika Sen", email: "ritika@company.com", role: "Customer Relations Manager" },

    // CLAIMS
    { _id: "220", name: "Harsha V", email: "harsha@company.com", role: "Claims Coordinator" },
    { _id: "221", name: "Neelima R", email: "neelima@company.com", role: "Claims Viewer" },

    // TRACKING
    { _id: "222", name: "Mahesh G", email: "mahesh@company.com", role: "Tracking Officer" },

    // HR
    { _id: "223", name: "Pallavi R", email: "pallavi@company.com", role: "HR Manager" },

    // IT / SECURITY
    { _id: "224", name: "Kiran Kumar", email: "kiran@company.com", role: "IT Admin" },
    { _id: "225", name: "Lokesh Naik", email: "lokesh@company.com", role: "Security Admin" },

    // AUDIT
    { _id: "226", name: "Nidhi Joshi", email: "nidhi@company.com", role: "Audit Admin" },
  ];

  // form states
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  // filters
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  /** Filter users */
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
      <h1 className="text-2xl font-semibold">Assign Customer Portal Roles</h1>

      {/* Assign Form */}
      <div className="border rounded-lg p-5 bg-white shadow-sm max-w-md space-y-4">
        <h2 className="font-semibold">Assign Role</h2>

        <Select
          options={roleOptions}
          placeholder="Select Role..."
          value={selectedRole}
          onChange={setSelectedRole}
        />

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

      {/* Search & Filter */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border shadow-sm">
        <div className="relative w-72">
          <MdSearch className="absolute left-3 top-2.5 text-gray-500" />
          <input
            className="border w-full pl-10 p-2 rounded-lg"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

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

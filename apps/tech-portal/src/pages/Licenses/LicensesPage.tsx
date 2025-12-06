import { useState } from "react";
<<<<<<< HEAD
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DataTable } from "../../components/shared/DataTable";
import { Modal } from "../../components/shared/Modal";
import { LicenseForm } from "./LicenseForm";
import { MdSearch } from "react-icons/md";
=======
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { DataTable } from "../../components/shared/DataTable";
import { Modal } from "../../components/shared/Modal";
import { LicenseForm } from "./LicenseForm";
import { Button } from "../../components/ui/button";
import { MdAdd, MdFilterList } from "react-icons/md";
>>>>>>> main

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

interface License {
  _id: string;
  licenseKey: string;
  licenseType: "customer" | "vendor";
  status: string;
<<<<<<< HEAD
  organizationName: string;
  expiryDate: string;
  maxUsers: number;
  maxVessels?: number;
  maxItems?: number;
  organizationId: string;
=======
  organizationId: any;
  expiryDate: string;
>>>>>>> main
}

export function LicensesPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLicense, setEditingLicense] = useState<License | null>(null);
<<<<<<< HEAD
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isEditLoading, setIsEditLoading] = useState(false);

  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

=======
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");

  // Fetch organizations
>>>>>>> main
  const { data: orgsData } = useQuery({
    queryKey: ["organizations"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/v1/tech/organizations`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      });
<<<<<<< HEAD
      return (await res.json()).data || [];
    },
  });

=======
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    },
  });

  // Fetch licenses
>>>>>>> main
  const { data: licensesData, isLoading } = useQuery({
    queryKey: ["licenses", filterStatus, filterType],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterStatus !== "all") params.append("status", filterStatus);
      if (filterType !== "all") params.append("licenseType", filterType);

      const res = await fetch(`${API_URL}/api/v1/tech/licenses?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      });

<<<<<<< HEAD
      return (await res.json()).data as License[];
=======
      if (!res.ok) throw new Error("Failed to fetch licenses");
      const json = await res.json();
      return json.data as License[];
>>>>>>> main
    },
  });

  const deleteMutation = useMutation({
<<<<<<< HEAD
    mutationFn: async () =>
      fetch(`${API_URL}/api/v1/tech/licenses/${deleteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      }).then((r) => r.json()),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["licenses"] });
      setDeleteId(null);
=======
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_URL}/api/v1/tech/licenses/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      });
      if (!res.ok) throw new Error("Failed to delete license");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["licenses"] });
      alert("License deleted successfully!");
>>>>>>> main
    },
  });

  const handleEdit = async (row: License) => {
    setIsEditLoading(true);
    setIsModalOpen(true);

    const res = await fetch(`${API_URL}/api/v1/tech/licenses/${row._id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
    });

    const data = await res.json();
    setEditingLicense(data.data);
    setIsEditLoading(false);
  };

<<<<<<< HEAD
  // 🔍 Apply Filters + Search
  const filteredLicenses = licensesData
    ?.filter((l) =>
      l.licenseKey.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.organizationName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    ?.filter((l) => (filterType === "all" ? true : l.licenseType === filterType))
    ?.filter((l) => (filterStatus === "all" ? true : l.status === filterStatus));
=======
  const handleEdit = (l: License) => {
    setEditingLicense(l);
    setIsModalOpen(true);
  };

  const handleDelete = (l: License) => {
    if (confirm(`Delete license ${l.licenseKey}?`))
      deleteMutation.mutate(l._id);
  };
>>>>>>> main

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingLicense(null);
  };

<<<<<<< HEAD
=======
  const getOrgName = (id: any) => {
    if (!orgsData) return "Unknown";
    const org = (orgsData as any[]).find(
      (o) => o._id === id || o._id === id?._id
    );
    return org?.name || "Unknown";
  };

  // TABLE COLUMNS (optimized)
>>>>>>> main
  const columns = [
    { key: "licenseKey", header: "License Key" },
    { key: "organizationName", header: "Organization" },
    { key: "licenseType", header: "Type" },
    {
<<<<<<< HEAD
      key: "status",
      header: "Status",
      render: (row: License) => (
        <span
          className={`px-3 py-1 text-xs rounded-full ${
            row.status === "active"
              ? "bg-green-200 text-green-900"
              : "bg-red-200 text-red-900"
          }`}
        >
          {row.status}
=======
      key: "licenseKey",
      header: "LICENSE KEY",
      render: (l: License) => (
        <div className="font-semibold text-[hsl(var(--foreground))]">{l.licenseKey}</div>
      ),
    },
    {
      key: "organizationId",
      header: "ORGANIZATION",
      render: (l: License) => (
        <span className="text-gray-600 dark:text-gray-300">
          {getOrgName(l.organizationId)}
>>>>>>> main
        </span>
      ),
    },

    // TYPE — NO DROPDOWN (only badge like ERP standard)
    {
<<<<<<< HEAD
      key: "expiryDate",
      header: "Expires",
      render: (row: License) => new Date(row.expiryDate).toLocaleDateString(),
=======
      key: "licenseType",
      header: "TYPE",
      render: (l: License) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ring-1 
            ${
              l.licenseType === "customer"
                ? "bg-blue-100 text-[hsl(var(--foreground))] font-semibold dark:bg-blue-900/50 ring-blue-300"
                : "bg-purple-100 text-[hsl(var(--foreground))] font-semibold dark:bg-purple-900/50 ring-purple-300"
            }
          `}
        >
          {l.licenseType}
        </span>
      ),
    },

    // STATUS moved BEFORE ACTIONS
    {
      key: "status",
      header: "STATUS",
      render: (l: License) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold ring-1 
            ${
              l.status === "active"
                ? "bg-emerald-100 text-[hsl(var(--foreground))] font-semibold dark:bg-emerald-900/50 ring-emerald-300"
                : "bg-red-100 text-[hsl(var(--foreground))] font-semibold dark:bg-red-900/50 ring-red-300"
            }
          `}
        >
          {l.status}
        </span>
      ),
    },

    {
      key: "expiryDate",
      header: "EXPIRES",
      render: (l: License) => {
        const d = new Date(l.expiryDate);
        return <span className="text-[hsl(var(--muted-foreground))]">{d.toLocaleDateString()}</span>;
      },
>>>>>>> main
    },
  ];

  return (
<<<<<<< HEAD
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Licenses</h1>
          <p className="text-gray-500">Manage organization licenses</p>
=======
    <div className="w-full min-h-screen p-8 space-y-6">

      {/* HEADER same as Organizations */}
      <div className="flex flex-wrap justify-between items-center mb-6">
        <div>
          <h1 className="text-4xl font-bold text-[hsl(var(--foreground))] mb-2 
                         bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Licenses
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Manage organization licenses and usage limits
          </p>
>>>>>>> main
        </div>
        <button
          disabled={isLoading}
          onClick={() => {
            setEditingLicense(null);
            setIsModalOpen(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          + Create License
        </button>
      </div>

      {/* Filters Section */}
      {!isLoading && (
        <div className="p-4 bg-white rounded-xl border shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative flex-1">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search licenses..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border bg-gray-50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

<<<<<<< HEAD
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 rounded-xl border bg-gray-50"
            >
              <option value="all">All Types</option>
              <option value="customer">Customer</option>
              <option value="vendor">Vendor</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 rounded-xl border bg-gray-50"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>
      )}

      {/* Loader */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="animate-spin w-10 h-10 border-4 border-gray-300 border-t-blue-600 rounded-full"></div>
          <p className="mt-3 text-gray-500">Loading licenses...</p>
        </div>
      )}

      {/* Table */}
      {!isLoading && (
        <DataTable
          columns={columns}
          data={filteredLicenses || []}
          onEdit={handleEdit}
          onDelete={(row) => setDeleteId(row._id)}
          emptyMessage="No licenses found."
        />
      )}

      {/* DELETE MODAL */}
      {deleteId && (
        <Modal isOpen={true} onClose={() => setDeleteId(null)} title="Confirm Delete">
          <div className="space-y-6">
            <p className="text-gray-700 text-center">Are you sure you want to delete this license?</p>

            <div className="flex justify-center gap-4">
              <button
                className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400"
                onClick={() => setDeleteId(null)}
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate()}
                className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* CREATE / EDIT MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={
          isEditLoading
            ? "Loading License..."
            : editingLicense
            ? "Edit License"
            : "Create License"
        }
        size="large"
      >
        {isEditLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin w-10 h-10 border-4 border-gray-300 border-t-blue-600 rounded-full"></div>
          </div>
        ) : (
          <LicenseForm
            license={editingLicense || undefined}
            organizations={orgsData || []}
            onCancel={handleClose}
            onSuccess={() => {
              handleClose();
              queryClient.invalidateQueries({ queryKey: ["licenses"] });
            }}
          />
        )}
=======
        <Button onClick={handleCreate} className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40">
          <MdAdd className="w-5 h-5" /> Add License
        </Button>
      </div>

      {/* FILTER CARD — exact ERP theme */}
      <div className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-[hsl(var(--foreground))] font-semibold">
            <MdFilterList className="w-5 h-5" />
            <span>Filters:</span>
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 rounded-xl border border-[hsl(var(--border))] 
                       bg-[hsl(var(--card))] text-[hsl(var(--foreground))] 
                       shadow-sm focus:ring-2 focus:ring-[hsl(var(--primary))] transition-all"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="suspended">Suspended</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 rounded-xl border border-[hsl(var(--border))] 
                       bg-[hsl(var(--card))] text-[hsl(var(--foreground))] 
                       shadow-sm focus:ring-2 focus:ring-[hsl(var(--primary))] transition-all"
          >
            <option value="all">All Types</option>
            <option value="customer">Customer</option>
            <option value="vendor">Vendor</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-gray-300 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading licenses...</p>
          </div>
        ) : (
          <div className="p-6">
            <DataTable
              columns={columns}
              data={licensesData || []}
              onEdit={handleEdit}
              onDelete={handleDelete}
              emptyMessage="No licenses found."
            />
          </div>
        )}
      </div>

      {/* MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={editingLicense ? "Edit License" : "Create License"}
        size="large"
      >
        <LicenseForm
          license={editingLicense as any}
          organizations={(orgsData as any) || []}
          onSuccess={() => {
            handleClose();
            queryClient.invalidateQueries({ queryKey: ["licenses"] });
          }}
          onCancel={handleClose}
        />
>>>>>>> main
      </Modal>
    </div>
  );
}

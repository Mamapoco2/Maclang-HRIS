import { useEffect, useMemo, useState } from "react";
import RoleFormModal from "./roleFormModal";
import RoleViewModal from "./roleViewModal";
import DeleteRoleDialog from "./deleteRoleDialog";
import { toast } from "sonner";
import { IconSearch, IconLoader2, IconPlus } from "@tabler/icons-react";
import {
  ShieldCheck,
  Users,
  KeyRound,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";
import { DEFAULT_ROLE_NAME, ACCESS_SCOPE_LABEL } from "../roles";

/*
|--------------------------------------------------------------------------
| MOCK DATA
|--------------------------------------------------------------------------
| Frontend only.
| No Laravel/API connection is required.
*/

const INITIAL_ROLES = [
  {
    id: 1,
    name: "SuperAdmin",
    description: "Full system access",
    accessScope: "ALL",
    usersCount: 1,
    permissions: [
      { name: "view employees" },
      { name: "manage employees" },
      { name: "manage roles" },
      { name: "manage payroll" },
      { name: "manage leave" },
    ],
    departments: [],
  },
  {
    id: 2,
    name: "HR",
    description: "Human Resources management access",
    accessScope: "DEPARTMENT",
    usersCount: 5,
    permissions: [
      { name: "view employees" },
      { name: "manage employees" },
      { name: "manage leave" },
      { name: "view payroll" },
    ],
    departments: [
      {
        id: 1,
        name: "Human Resources",
      },
    ],
  },
  {
    id: 3,
    name: "Manager",
    description: "Department manager access",
    accessScope: "DEPARTMENT",
    usersCount: 8,
    permissions: [
      { name: "view employees" },
      { name: "approve leave" },
      { name: "view attendance" },
    ],
    departments: [
      {
        id: 2,
        name: "Operations",
      },
    ],
  },
  {
    id: 4,
    name: "Employee",
    description: "Standard employee access",
    accessScope: "SELF",
    usersCount: 25,
    permissions: [
      { name: "view profile" },
      { name: "file leave" },
      { name: "view payslip" },
    ],
    departments: [],
  },
  {
    id: 5,
    name: "Finance",
    description: "Finance and payroll access",
    accessScope: "DEPARTMENT",
    usersCount: 3,
    permissions: [
      { name: "view payroll" },
      { name: "manage payroll" },
      { name: "view reports" },
    ],
    departments: [
      {
        id: 3,
        name: "Finance",
      },
    ],
  },
];

const INITIAL_DEPARTMENTS = [
  {
    id: 1,
    name: "Human Resources",
  },
  {
    id: 2,
    name: "Operations",
  },
  {
    id: 3,
    name: "Finance",
  },
  {
    id: 4,
    name: "Information Technology",
  },
  {
    id: 5,
    name: "Administration",
  },
];

function StatCard({ icon: Icon, label, value, tone }) {
  const tones = {
    indigo: "bg-indigo-50 text-indigo-600",
    amber: "bg-amber-50 text-amber-600",
    emerald: "bg-emerald-50 text-emerald-600",
  };

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-3.5 shadow-sm">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
          tones[tone] || tones.indigo
        }`}
      >
        <Icon size={18} />
      </div>

      <div className="min-w-0">
        <p className="text-lg font-semibold leading-tight text-gray-900">
          {value}
        </p>

        <p className="truncate text-xs text-gray-400">{label}</p>
      </div>
    </div>
  );
}

export default function RoleManagementPage() {
  /*
  |--------------------------------------------------------------------------
  | LOCAL STATE
  |--------------------------------------------------------------------------
  */

  const [roles, setRoles] = useState(INITIAL_ROLES);
  const [departments, setDepartments] = useState(INITIAL_DEPARTMENTS);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [saving, setSaving] = useState(false);

  const [viewingRole, setViewingRole] = useState(null);

  const [deletingRole, setDeletingRole] = useState(null);
  const [deleting, setDeleting] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | FRONTEND ONLY LOADING
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    // Simulate loading so the UI still has a loading state.
    const timer = setTimeout(() => {
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  /*
  |--------------------------------------------------------------------------
  | CREATE ROLE
  |--------------------------------------------------------------------------
  */

  const openCreate = () => {
    setEditingRole(null);
    setFormOpen(true);
  };

  /*
  |--------------------------------------------------------------------------
  | EDIT ROLE
  |--------------------------------------------------------------------------
  */

  const openEdit = (role) => {
    setEditingRole(role);
    setFormOpen(true);
  };

  /*
  |--------------------------------------------------------------------------
  | SAVE ROLE
  |--------------------------------------------------------------------------
  | Local only — does NOT call API.
  */

  const handleSaveRole = async (payload) => {
    setSaving(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      if (payload.id) {
        // Update existing role locally.
        setRoles((currentRoles) =>
          currentRoles.map((role) =>
            role.id === payload.id
              ? {
                  ...role,
                  ...payload,
                }
              : role,
          ),
        );

        toast.success("Role updated.");
      } else {
        // Create new role locally.
        const newRole = {
          ...payload,
          id: Date.now(),
          usersCount: 0,
          permissions: payload.permissions || [],
          departments: payload.departments || [],
        };

        setRoles((currentRoles) => [...currentRoles, newRole]);

        toast.success("Role created.");
      }

      setFormOpen(false);
      setEditingRole(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to save role.");
    } finally {
      setSaving(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | DELETE ROLE
  |--------------------------------------------------------------------------
  | Local only — does NOT call API.
  */

  const handleDeleteRole = async () => {
    if (!deletingRole) return;

    setDeleting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      setRoles((currentRoles) =>
        currentRoles.filter((role) => role.id !== deletingRole.id),
      );

      toast.success("Role deleted.");

      setDeletingRole(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete role.");
    } finally {
      setDeleting(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | SEARCH
  |--------------------------------------------------------------------------
  */

  const filteredRoles = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return roles;
    }

    return roles.filter((role) => {
      return (
        role.name?.toLowerCase().includes(query) ||
        role.description?.toLowerCase().includes(query) ||
        role.accessScope?.toLowerCase().includes(query) ||
        role.departments?.some((department) =>
          department.name?.toLowerCase().includes(query),
        )
      );
    });
  }, [roles, search]);

  /*
  |--------------------------------------------------------------------------
  | STATISTICS
  |--------------------------------------------------------------------------
  */

  const stats = useMemo(
    () => ({
      total: roles.length,

      inUse: roles.filter((role) => (role.usersCount ?? 0) > 0).length,

      unused: roles.filter((role) => (role.usersCount ?? 0) === 0).length,
    }),
    [roles],
  );

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <IconLoader2 size={24} className="animate-spin text-gray-300" />
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | PAGE
  |--------------------------------------------------------------------------
  */

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto max-w-full px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-600 p-2">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>

            <div>
              <h1 className="text-lg font-bold leading-tight text-gray-900">
                Role Management
              </h1>

              <p className="text-xs leading-tight text-gray-500">
                Define what each role can access and which department it
                governs.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="mx-auto max-w-full space-y-4 px-6 py-6">
        {/* STATISTICS */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard
            icon={ShieldCheck}
            label="Total roles"
            value={stats.total}
            tone="indigo"
          />

          <StatCard
            icon={Users}
            label="Roles in use"
            value={stats.inUse}
            tone="emerald"
          />

          <StatCard
            icon={KeyRound}
            label="Unused roles"
            value={stats.unused}
            tone="amber"
          />
        </div>

        {/* TABLE CARD */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          {/* TOOLBAR */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-3.5">
            {/* SEARCH */}
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 focus-within:ring-2 focus-within:ring-indigo-500">
              <IconSearch size={13} className="shrink-0 text-gray-400" />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search roles..."
                className="w-56 flex-1 bg-transparent text-xs text-gray-700 outline-none placeholder:text-gray-400"
              />
            </div>

            {/* NEW ROLE */}
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-indigo-700"
            >
              <IconPlus size={13} />
              New role
            </button>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80">
                  {["Role", "Scope", "Users", "Permissions", "Actions"].map(
                    (column) => (
                      <th
                        key={column}
                        className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400"
                      >
                        {column}
                      </th>
                    ),
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {/* NO ROLES */}
                {roles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16">
                      <div className="flex flex-col items-center gap-2 text-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                          <ShieldCheck size={18} className="text-gray-400" />
                        </div>

                        <p className="text-sm text-gray-400">
                          No roles configured yet.
                        </p>

                        <button
                          onClick={openCreate}
                          className="mt-1 text-xs font-medium text-indigo-600 hover:text-indigo-700"
                        >
                          Create the first role
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : filteredRoles.length === 0 ? (
                  /* NO SEARCH RESULTS */
                  <tr>
                    <td
                      colSpan={5}
                      className="py-16 text-center text-sm text-gray-400"
                    >
                      No roles match your search.
                    </td>
                  </tr>
                ) : (
                  /* ROLE ROWS */
                  filteredRoles.map((role) => {
                    const isDefault = role.name === DEFAULT_ROLE_NAME;

                    return (
                      <tr
                        key={role.id}
                        className="transition-colors hover:bg-gray-50"
                      >
                        {/* ROLE */}
                        <td className="px-4 py-3">
                          <p className="text-xs font-medium text-gray-800">
                            {role.name}

                            {isDefault && (
                              <span className="ml-1.5 rounded-full border border-gray-200 bg-gray-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-gray-500">
                                Default
                              </span>
                            )}
                          </p>

                          {role.description && (
                            <p className="mt-0.5 max-w-xs truncate text-[11px] text-gray-400">
                              {role.description}
                            </p>
                          )}
                        </td>

                        {/* SCOPE */}
                        <td className="px-4 py-3">
                          <p className="text-xs text-gray-600">
                            {role.accessScope
                              ? ACCESS_SCOPE_LABEL[role.accessScope] ||
                                role.accessScope
                              : "—"}
                          </p>

                          {role.departments?.length > 0 && (
                            <p className="mt-0.5 max-w-[10rem] truncate text-[11px] text-gray-400">
                              {role.departments
                                .map((department) => department.name)
                                .join(", ")}
                            </p>
                          )}
                        </td>

                        {/* USERS */}
                        <td className="px-4 py-3 text-xs text-gray-600">
                          {role.usersCount ?? 0}
                        </td>

                        {/* PERMISSIONS */}
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                            <KeyRound size={10} />

                            {role.permissions?.length ?? 0}
                          </span>
                        </td>

                        {/* ACTIONS */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            {/* VIEW */}
                            <button
                              onClick={() => setViewingRole(role)}
                              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-600 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                            >
                              <Eye size={11} />
                              View
                            </button>

                            {/* EDIT */}
                            <button
                              onClick={() => openEdit(role)}
                              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-600 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                            >
                              <Pencil size={11} />
                              Edit
                            </button>

                            {/* DELETE */}
                            <button
                              onClick={() => setDeletingRole(role)}
                              disabled={isDefault}
                              title={
                                isDefault
                                  ? "The default role can't be deleted."
                                  : "Delete role"
                              }
                              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:bg-white disabled:hover:text-gray-600"
                            >
                              <Trash2 size={11} />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      <RoleFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingRole(null);
        }}
        onSave={handleSaveRole}
        saving={saving}
        role={editingRole}
        departments={departments}
      />

      {/* VIEW MODAL */}
      <RoleViewModal
        open={!!viewingRole}
        onClose={() => setViewingRole(null)}
        role={viewingRole}
      />

      {/* DELETE DIALOG */}
      <DeleteRoleDialog
        open={!!deletingRole}
        onClose={() => setDeletingRole(null)}
        onConfirm={handleDeleteRole}
        role={deletingRole}
        deleting={deleting}
      />
    </div>
  );
}

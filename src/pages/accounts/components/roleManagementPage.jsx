import { useEffect, useMemo, useState, useContext } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getApprovedUsers,
  updateUserPermissions,
  updateUserRole,
} from "@/services/accountsService";
import { AuthContext } from "@/context/authContext";
import { getEcho } from "@/lib/echo";
import PermissionsModal from "./permissionModal";
import { ASSIGNABLE_ROLES } from "@/constants/permissions";
import { toast } from "sonner";
import { IconSearch, IconLoader2 } from "@tabler/icons-react";
import { ShieldCheck, Users, UserX, KeyRound, Pencil } from "lucide-react";

const ROLE_BADGE_STYLES = {
  "medical center chief": "bg-indigo-50 text-indigo-700 border-indigo-200",
  admin: "bg-orange-50 text-orange-700 border-orange-200",
  chairman: "bg-rose-50 text-rose-700 border-rose-200",
  director: "bg-purple-50 text-purple-700 border-purple-200",
  hr: "bg-blue-50 text-blue-700 border-blue-200",
  head: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "officer in charge": "bg-cyan-50 text-cyan-700 border-cyan-200",
  supervisor: "bg-amber-50 text-amber-700 border-amber-200",
  staff: "bg-gray-100 text-gray-600 border-gray-200",
};

const AVATAR_STYLES = [
  "bg-indigo-50 text-indigo-600",
  "bg-violet-50 text-violet-600",
  "bg-sky-50 text-sky-600",
  "bg-teal-50 text-teal-600",
  "bg-amber-50 text-amber-700",
  "bg-rose-50 text-rose-600",
];

function avatarStyle(seed = "") {
  let hash = 0;
  for (let i = 0; i < seed.length; i++)
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_STYLES[Math.abs(hash) % AVATAR_STYLES.length];
}

function getRoleBadgeClass(role) {
  return (
    ROLE_BADGE_STYLES[role?.toLowerCase()] ??
    "bg-gray-100 text-gray-600 border-gray-200"
  );
}

function getCurrentRole(user) {
  const role = user.roles?.find((r) => r.toLowerCase() !== "superadmin");
  if (!role) return "none";
  const match = ASSIGNABLE_ROLES.find(
    (r) => r.value.toLowerCase() === role.toLowerCase(),
  );
  return match?.value ?? role;
}

function StatCard({ icon: Icon, label, value, tone }) {
  const tones = {
    indigo: "bg-indigo-50 text-indigo-600",
    amber: "bg-amber-50 text-amber-600",
    emerald: "bg-emerald-50 text-emerald-600",
  };
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-3.5 shadow-sm">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}
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
  const { user: currentUser } = useContext(AuthContext);
  const [accounts, setAccounts] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [roleSaving, setRoleSaving] = useState({});
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    const echo = getEcho();
    if (!echo) return;
    const channel = echo.private("admin.notifications");
    channel.listen(".permissions.updated", () => loadAccounts());
    return () => echo.leaveChannel("admin.notifications");
  }, []);

  const loadAccounts = async () => {
    const data = await getApprovedUsers();
    if (data) {
      const filtered = data.filter(
        (u) =>
          !u.roles?.some((r) => r.toLowerCase() === "superadmin") &&
          u.id !== currentUser?.id,
      );
      setAccounts(filtered);
      setSelectedUser((prev) => {
        if (!prev) return prev;
        return filtered.find((u) => u.id === prev.id) ?? prev;
      });
      return filtered;
    }
    return [];
  };

  const handleRoleChange = async (userId, role) => {
    setRoleSaving((prev) => ({ ...prev, [userId]: true }));
    try {
      await updateUserRole(userId, role);
      await loadAccounts();
      toast.success("Role updated successfully.");
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Failed to update role.");
    } finally {
      setRoleSaving((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const handleSave = async (userId, permissions) => {
    try {
      setSaving(true);
      await updateUserPermissions(userId, permissions);
      const fresh = await loadAccounts();
      const updatedUser = fresh.find((u) => u.id === userId);
      if (updatedUser) setSelectedUser(updatedUser);
      setModalOpen(false);
      toast.success("Permissions updated successfully.");
    } catch (err) {
      const message =
        err?.response?.data?.message ??
        err?.response?.data?.errors?.["permissions.0"]?.[0] ??
        "Failed to update permissions.";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const filteredAccounts = accounts.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()),
  );

  const stats = useMemo(() => {
    const withRole = accounts.filter(
      (u) => getCurrentRole(u) !== "none",
    ).length;
    return {
      total: accounts.length,
      withRole,
      unassigned: accounts.length - withRole,
    };
  }, [accounts]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Page header ── */}
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
                Assign roles and configure permissions for active accounts.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-full px-4 py-6 sm:px-6">
        {/* ── Stats ── */}
        <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard
            icon={Users}
            label="Active accounts"
            value={stats.total}
            tone="indigo"
          />
          <StatCard
            icon={ShieldCheck}
            label="Roles assigned"
            value={stats.withRole}
            tone="emerald"
          />
          <StatCard
            icon={UserX}
            label="No role assigned"
            value={stats.unassigned}
            tone="amber"
          />
        </div>

        {/* ── Content card ── */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 px-5 py-3.5">
            <div className="flex items-center gap-1.5 text-sm">
              <span className="font-medium text-gray-700">Active accounts</span>
              <span className="text-gray-400">
                {accounts.length} user{accounts.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 focus-within:ring-2 focus-within:ring-indigo-500">
              <IconSearch size={13} className="shrink-0 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, username or email..."
                className="w-56 flex-1 bg-transparent text-xs text-gray-700 outline-none placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80">
                  {["User", "Email", "Role", "Permissions", "Actions"].map(
                    (col) => (
                      <th
                        key={col}
                        className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400"
                      >
                        {col}
                      </th>
                    ),
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {accounts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16">
                      <div className="flex flex-col items-center gap-2 text-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                          <Users size={18} className="text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-400">
                          No approved accounts found.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : filteredAccounts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-16 text-center text-sm text-gray-400"
                    >
                      No accounts match your search.
                    </td>
                  </tr>
                ) : (
                  filteredAccounts.map((u) => {
                    const currentRole = getCurrentRole(u);
                    const displayName = (() => {
                      if (!u.name || u.name === u.username) return null;
                      const parts = u.name.trim().split(" ");
                      if (parts.length >= 2) {
                        const last = parts[parts.length - 1];
                        const first = parts.slice(0, -1).join(" ");
                        return `${last}, ${first}`;
                      }
                      return u.name;
                    })();

                    return (
                      <tr
                        key={u.id}
                        className="transition-colors hover:bg-gray-50"
                      >
                        {/* User (avatar + name) */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${avatarStyle(
                                u.username || u.email,
                              )}`}
                            >
                              {(u.username || u.email || "?")
                                .slice(0, 2)
                                .toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-xs font-medium text-gray-800">
                                {displayName ?? (
                                  <span className="italic text-gray-400">
                                    No name
                                  </span>
                                )}
                              </p>
                              <p className="truncate text-[11px] text-gray-400">
                                {u.username}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {u.email}
                        </td>

                        {/* Role selector */}
                        <td className="px-4 py-3">
                          <Select
                            value={currentRole}
                            onValueChange={(role) =>
                              handleRoleChange(u.id, role)
                            }
                            disabled={!!roleSaving[u.id]}
                          >
                            <SelectTrigger
                              className={`h-7 w-40 rounded-lg border text-xs focus:ring-0 focus:ring-offset-0 ${
                                currentRole !== "none"
                                  ? `${getRoleBadgeClass(currentRole)} font-semibold`
                                  : "border-gray-200 bg-gray-50 text-gray-400"
                              }`}
                            >
                              <SelectValue placeholder="Assign role…" />
                            </SelectTrigger>
                            <SelectContent>
                              {ASSIGNABLE_ROLES.map((r) => (
                                <SelectItem
                                  key={r.value}
                                  value={r.value}
                                  className={`text-xs ${r.value === "none" ? "italic text-gray-400" : ""}`}
                                >
                                  {r.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>

                        {/* Permissions */}
                        <td className="px-4 py-3">
                          {u.permissions?.length > 0 ? (
                            <div className="flex flex-wrap items-center gap-1">
                              <span className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                                <KeyRound size={10} /> {u.permissions.length}
                              </span>
                              {u.permissions.slice(0, 2).map((p) => (
                                <span
                                  key={p}
                                  className="rounded-md border border-gray-200 bg-gray-100 px-2 py-0.5 text-[10px] text-gray-600"
                                >
                                  {p}
                                </span>
                              ))}
                              {u.permissions.length > 2 && (
                                <span className="rounded-md border border-gray-200 px-2 py-0.5 text-[10px] text-gray-400">
                                  +{u.permissions.length - 2} more
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs italic text-gray-400">
                              None set
                            </span>
                          )}
                        </td>

                        {/* Action */}
                        <td className="px-4 py-3">
                          <button
                            onClick={() => {
                              setSelectedUser(u);
                              setModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-600 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                          >
                            <Pencil size={11} /> Edit permissions
                          </button>
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

      <PermissionsModal
        user={selectedUser}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        saving={saving}
      />
    </div>
  );
}

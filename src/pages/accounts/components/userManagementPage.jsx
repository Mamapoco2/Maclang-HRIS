import { useContext, useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getApprovedUsers, updateUserRole } from "@/services/accountsService";
import { getRoles } from "../services/rolesService";
import { AuthContext } from "@/context/authContext";
import { getEcho } from "@/lib/echo";
import RoleViewModal from "./roleViewModal";
import { toast } from "sonner";
import { IconSearch, IconLoader2 } from "@tabler/icons-react";
import { Users, Eye } from "lucide-react";
import { DEFAULT_ROLE_NAME } from "../constants/roles";

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
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_STYLES[Math.abs(hash) % AVATAR_STYLES.length];
}

function getRoleBadgeClass(roleName) {
  return ROLE_BADGE_STYLES[roleName?.toLowerCase()] ?? "bg-gray-100 text-gray-600 border-gray-200";
}

export default function UserManagementPage() {
  const { user: currentUser } = useContext(AuthContext);
  const [accounts, setAccounts] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleSaving, setRoleSaving] = useState({});
  const [search, setSearch] = useState("");
  const [viewingRole, setViewingRole] = useState(null);

  const loadAccounts = async () => {
    const data = await getApprovedUsers();
    const filtered = (data ?? []).filter(
      (u) =>
        !u.roles?.some((r) => r.toLowerCase() === "superadmin") &&
        u.id !== currentUser?.id,
    );
    setAccounts(filtered);
    return filtered;
  };

  useEffect(() => {
    Promise.all([loadAccounts(), getRoles()])
      .then(([, roleList]) => setRoles(roleList ?? []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const echo = getEcho();
    if (!echo) return;
    const channel = echo.private("admin.notifications");
    channel.listen(".role.updated", async () => setRoles(await getRoles()));
    return () => echo.leaveChannel("admin.notifications");
  }, []);

  // Only active roles from Role Management can be assigned; a deleted or
  // deactivated role simply drops out of this list.
  const activeRoles = roles.filter((r) => r.isActive !== false);

  const getCurrentRoleName = (user) =>
    user.roles?.find((r) => r.toLowerCase() !== "superadmin") ?? null;

  const handleRoleChange = async (userId, roleName) => {
    setRoleSaving((prev) => ({ ...prev, [userId]: true }));
    try {
      await updateUserRole(userId, roleName);
      await loadAccounts();
      toast.success("Role updated successfully.");
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Failed to update role.");
    } finally {
      setRoleSaving((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const filteredAccounts = accounts.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <IconLoader2 size={24} className="animate-spin text-gray-300" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto max-w-full px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-600 p-2">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight text-gray-900">User Management</h1>
              <p className="text-xs leading-tight text-gray-500">
                Assign a role to each employee. New accounts default to {DEFAULT_ROLE_NAME}.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-full px-6 py-6">
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-3.5">
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 focus-within:ring-2 focus-within:ring-blue-500">
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

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80">
                  {["Employee", "Email", "Role", "Actions"].map((col) => (
                    <th
                      key={col}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {accounts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-16">
                      <div className="flex flex-col items-center gap-2 text-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                          <Users size={18} className="text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-400">No approved accounts found.</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredAccounts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-16 text-center text-sm text-gray-400">
                      No accounts match your search.
                    </td>
                  </tr>
                ) : (
                  filteredAccounts.map((u) => {
                    const currentRoleName = getCurrentRoleName(u);
                    const currentRole = activeRoles.find(
                      (r) => r.name.toLowerCase() === currentRoleName?.toLowerCase(),
                    );
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
                      <tr key={u.id} className="transition-colors hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${avatarStyle(
                                u.username || u.email,
                              )}`}
                            >
                              {(u.username || u.email || "?").slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-xs font-medium text-gray-800">
                                {displayName ?? <span className="italic text-gray-400">No name</span>}
                              </p>
                              <p className="truncate text-[11px] text-gray-400">{u.username}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3 text-xs text-gray-500">{u.email}</td>

                        <td className="px-4 py-3">
                          <Select
                            value={currentRole?.name ?? ""}
                            onValueChange={(roleName) => handleRoleChange(u.id, roleName)}
                            disabled={!!roleSaving[u.id]}
                          >
                            <SelectTrigger
                              className={`h-7 w-40 rounded-lg border text-xs focus:ring-0 focus:ring-offset-0 ${
                                currentRole
                                  ? `${getRoleBadgeClass(currentRole.name)} font-semibold`
                                  : "border-gray-200 bg-gray-50 text-gray-400"
                              }`}
                            >
                              <SelectValue placeholder="Assign role…" />
                            </SelectTrigger>
                            <SelectContent>
                              {activeRoles.map((r) => (
                                <SelectItem key={r.id} value={r.name} className="text-xs">
                                  {r.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>

                        <td className="px-4 py-3">
                          <button
                            onClick={() => setViewingRole(currentRole)}
                            disabled={!currentRole}
                            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-600 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <Eye size={11} /> View role
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

      <RoleViewModal open={!!viewingRole} onClose={() => setViewingRole(null)} role={viewingRole} />
    </div>
  );
}

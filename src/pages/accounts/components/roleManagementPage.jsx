import { useEffect, useState, useContext } from "react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { getApprovedUsers, updateUserPermissions, updateUserRole } from "@/services/accountsService";
import { AuthContext } from "@/context/AuthContext";
import { getEcho } from "@/lib/echo";
import PermissionsModal from "./permissionModal";
import { toast } from "sonner";
import { IconSearch } from "@tabler/icons-react";

const ROLE_BADGE_STYLES = {
  admin:      "bg-orange-50 text-orange-700 border-orange-200",
  director:   "bg-purple-50 text-purple-700 border-purple-200",
  hr:         "bg-blue-50 text-blue-700 border-blue-200",
  head:       "bg-emerald-50 text-emerald-700 border-emerald-200",
  supervisor: "bg-amber-50 text-amber-700 border-amber-200",
  staff:      "bg-gray-100 text-gray-600 border-gray-200",
};

const ASSIGNABLE_ROLES = [
  { value: "none",       label: "No role" },
  { value: "admin",      label: "Admin" },
  { value: "director",   label: "Director" },
  { value: "hr",         label: "HR" },
  { value: "head",       label: "Head" },
  { value: "supervisor", label: "Supervisor" },
  { value: "staff",      label: "Staff" },
];

function getRoleBadgeClass(role) {
  return ROLE_BADGE_STYLES[role?.toLowerCase()] ?? "bg-gray-100 text-gray-600 border-gray-200";
}

function getCurrentRole(user) {
  return user.roles?.find((r) => r.toLowerCase() !== "superadmin")?.toLowerCase() ?? "none";
}

export default function RoleManagementPage() {
  const { user: currentUser } = useContext(AuthContext);
  const [accounts, setAccounts] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [roleSaving, setRoleSaving] = useState({});
  const [search, setSearch] = useState("");

  useEffect(() => { loadAccounts(); }, []);

  useEffect(() => {
    const echo = getEcho();
    if (!echo) return;
    const channel = echo.channel("permissions-updated");
    channel.listen(".permissions.updated", () => loadAccounts());
    return () => echo.leaveChannel("permissions-updated");
  }, []);

  const loadAccounts = async () => {
    const data = await getApprovedUsers();
    if (data) {
      const filtered = data.filter(
        (u) => !u.roles?.some((r) => r.toLowerCase() === "superadmin") && u.id !== currentUser?.id,
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
      setSaving(false); }
  };

  const filteredAccounts = accounts.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 flex-wrap">
          <div className="flex items-center gap-1.5 text-sm">
            <span className="font-medium text-gray-700">Active accounts</span>
            <span className="text-gray-400">{accounts.length} user{accounts.length !== 1 ? "s" : ""}</span>
          </div>
          <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1.5 bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500">
            <IconSearch size={13} className="text-gray-400 shrink-0" />
            <input
              type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, username or email..."
              className="bg-transparent text-xs flex-1 outline-none placeholder:text-gray-400 text-gray-700 w-56"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {["Fullname", "Username", "Email", "Role", "Permissions", "Actions"].map((col) => (
                  <th key={col} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {accounts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-sm text-gray-400">
                    No approved accounts found.
                  </td>
                </tr>
              ) : filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-sm text-gray-400">
                    No accounts match your search.
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((u) => {
                  const currentRole = getCurrentRole(u);
                  // Format name as "Last, First"
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
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      {/* Name */}
                      <td className="px-4 py-3 text-xs font-medium text-gray-800">
                        {displayName ?? <span className="italic text-gray-400">No name</span>}
                      </td>

                      {/* Username */}
                      <td className="px-4 py-3 text-xs font-medium text-gray-800">{u.username}</td>

                      {/* Email */}
                      <td className="px-4 py-3 text-xs text-gray-500">{u.email}</td>

                      {/* Role selector */}
                      <td className="px-4 py-3">
                        <Select
                          value={currentRole}
                          onValueChange={(role) => handleRoleChange(u.id, role)}
                          disabled={!!roleSaving[u.id]}
                        >
                          <SelectTrigger className={`h-7 w-36 text-xs border focus:ring-0 focus:ring-offset-0 rounded-lg ${
                            currentRole !== "none"
                              ? `${getRoleBadgeClass(currentRole)} font-semibold`
                              : "border-gray-200 text-gray-400 bg-gray-50"
                          }`}>
                            <SelectValue placeholder="Assign role…" />
                          </SelectTrigger>
                          <SelectContent>
                            {ASSIGNABLE_ROLES.map((r) => (
                              <SelectItem key={r.value} value={r.value} className={`text-xs ${r.value === "none" ? "text-gray-400 italic" : ""}`}>
                                {r.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>

                      {/* Permissions */}
                      <td className="px-4 py-3">
                        {u.permissions?.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {u.permissions.slice(0, 3).map((p) => (
                              <span key={p} className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 border border-gray-200">
                                {p}
                              </span>
                            ))}
                            {u.permissions.length > 3 && (
                              <span className="text-[10px] px-2 py-0.5 rounded-md text-gray-400 border border-gray-200">
                                +{u.permissions.length - 3} more
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">None set</span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3">
                        <button
                          onClick={() => { setSelectedUser(u); setModalOpen(true); }}
                          className="px-2.5 py-1 text-xs font-medium rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
                        >
                          Edit permissions
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

      <PermissionsModal
        user={selectedUser}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        saving={saving}
      />
    </>
  );
}

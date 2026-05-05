import { useEffect, useState, useContext } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { AuthContext } from "@/context/AuthContext";
import { getEcho } from "@/lib/echo";
import PermissionsModal from "./permissionModal";
import { toast } from "sonner";

const ROLE_BADGE_STYLES = {
  admin: "bg-orange-50 text-orange-700 border-orange-200",
  director: "bg-purple-50 text-purple-700 border-purple-200",
  hr: "bg-blue-50 text-blue-700 border-blue-200",
  head: "bg-teal-50 text-teal-700 border-teal-200",
  supervisor: "bg-amber-50 text-amber-700 border-amber-200",
  staff: "bg-gray-100 text-gray-600 border-gray-200",
};

const ASSIGNABLE_ROLES = [
  { value: "none", label: "No role" },
  { value: "admin", label: "Admin" },
  { value: "director", label: "Director" },
  { value: "hr", label: "HR" },
  { value: "head", label: "Head" },
  { value: "supervisor", label: "Supervisor" },
  { value: "staff", label: "Staff" },
];

function getRoleBadgeClass(role) {
  return (
    ROLE_BADGE_STYLES[role?.toLowerCase()] ??
    "bg-gray-100 text-gray-600 border-gray-200"
  );
}

// Extract the current assignable role for a user (ignores superadmin)
function getCurrentRole(user) {
  return (
    user.roles?.find((r) => r.toLowerCase() !== "superadmin")?.toLowerCase() ??
    "none"
  );
}

export default function ApprovedAccountsTab() {
  const { user: currentUser } = useContext(AuthContext);
  const [accounts, setAccounts] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  // Track which row is currently saving a role change
  const [roleSaving, setRoleSaving] = useState({});

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    const echo = getEcho();
    if (!echo) return;

    const channel = echo.channel("permissions-updated");
    channel.listen(".permissions.updated", () => {
      loadAccounts();
    });

    return () => echo.leaveChannel("permissions-updated");
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
      console.error("updateUserRole:", err);
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
      console.error("updateUserPermissions:", err);
      const message =
        err?.response?.data?.message ??
        err?.response?.data?.errors?.["permissions.0"]?.[0] ??
        "Failed to update permissions.";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="rounded-lg border border-gray-200 overflow-hidden bg-white">
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100">
          <span className="text-sm font-medium text-gray-800">
            Active accounts
          </span>
          <span className="text-sm text-gray-400">
            {accounts.length} user{accounts.length !== 1 ? "s" : ""}
          </span>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wide px-5">
                Name
              </TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Email
              </TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Role
              </TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Permissions
              </TableHead>
              <TableHead className="text-right text-xs font-medium text-gray-500 uppercase tracking-wide pr-5">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {accounts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-14 text-center text-sm text-gray-400"
                >
                  No approved accounts found.
                </TableCell>
              </TableRow>
            ) : (
              accounts.map((u) => (
                <TableRow
                  key={u.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <TableCell className="py-3 px-5 font-medium text-sm text-gray-900">
                    {u.name}
                  </TableCell>
                  <TableCell className="py-3 text-sm text-gray-500">
                    {u.email}
                  </TableCell>

                  {/* ── Inline role dropdown ─────────────────────────── */}
                  <TableCell className="py-3">
                    <Select
                      value={getCurrentRole(u)}
                      onValueChange={(role) => handleRoleChange(u.id, role)}
                      disabled={!!roleSaving[u.id]}
                    >
                      <SelectTrigger
                        className={`h-7 w-36 text-xs border-gray-200 focus:ring-0 focus:ring-offset-0 ${
                          getCurrentRole(u) !== "none"
                            ? `${getRoleBadgeClass(getCurrentRole(u))} font-medium`
                            : "text-gray-400"
                        }`}
                      >
                        <SelectValue placeholder="Assign role..." />
                      </SelectTrigger>
                      <SelectContent>
                        {ASSIGNABLE_ROLES.map((r) => (
                          <SelectItem
                            key={r.value}
                            value={r.value}
                            className={`text-xs ${
                              r.value === "none" ? "text-gray-400 italic" : ""
                            }`}
                          >
                            {r.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>

                  <TableCell className="py-3">
                    {u.permissions?.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {u.permissions.slice(0, 3).map((p) => (
                          <span
                            key={p}
                            className="inline-block text-xs px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 border border-gray-200"
                          >
                            {p}
                          </span>
                        ))}
                        {u.permissions.length > 3 && (
                          <span className="inline-block text-xs px-2 py-0.5 rounded-md text-gray-400 border border-gray-200">
                            +{u.permissions.length - 3} more
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">
                        None set
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="py-3 text-right pr-5">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedUser(u);
                        setModalOpen(true);
                      }}
                      className="h-7 text-xs px-3 border-gray-200 text-gray-700 hover:bg-gray-50"
                    >
                      Edit permissions
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
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

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Users, AlertTriangle } from "lucide-react";
import { IconLoader2, IconRefresh, IconSearch } from "@tabler/icons-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useUserManagement } from "@/hooks/useUserManagement";
import { PERMISSIONS } from "@/constants/permissions";
import { getRoles } from "@/services/rolesService";
import {
  updateUserPermissions,
  updateUserRole,
} from "@/services/accountsService";
import {
  SEARCH_MAX_LENGTH,
  formatUserName,
  getApiErrorMessage,
} from "@/utils/userManagement";
import RoleViewModal from "./roleViewModal";
import PermissionsModal from "./permissionModal";
import { DEFAULT_ROLE_NAME } from "../roles";
import UserManagementTable from "./UserManagementTable";
import UserPagination from "./UserPagination";
import RoleChangeDialog from "./RoleChangeDialog";

const ALL_ROLES = "all";

export default function UserManagementPage() {
  const { hasPermission } = useAuth();
  const canManage = hasPermission(PERMISSIONS.USERS_MANAGE_ROLES);
  const canViewRoles = hasPermission(PERMISSIONS.ROLES_VIEW);

  const list = useUserManagement();
  const { reload, setPage } = list;

  const [roles, setRoles] = useState([]);
  const [savingIds, setSavingIds] = useState(() => new Set());
  const [pendingChange, setPendingChange] = useState(null);
  const [viewingRole, setViewingRole] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [permissionsSaving, setPermissionsSaving] = useState(false);

  useEffect(() => {
    if (!canViewRoles) return undefined;

    let cancelled = false;

    getRoles()
      .then((data) => {
        if (cancelled) return;
        const active = (Array.isArray(data) ? data : []).filter(
          (r) => r.isActive !== false,
        );
        setRoles(active);
      })
      .catch((err) => {
        if (cancelled) return;
        toast.error(getApiErrorMessage(err, "Failed to load roles."));
      });

    return () => {
      cancelled = true;
    };
  }, [canViewRoles]);

  const setSaving = useCallback((userId, isSaving) => {
    setSavingIds((prev) => {
      const next = new Set(prev);
      if (isSaving) next.add(userId);
      else next.delete(userId);
      return next;
    });
  }, []);

  const handleRoleChange = useCallback(
    (user, roleName) => setPendingChange({ user, roleName }),
    [],
  );

  const confirmRoleChange = useCallback(async () => {
    if (!pendingChange) return;

    const { user, roleName } = pendingChange;
    setPendingChange(null);
    setSaving(user.id, true);

    try {
      await updateUserRole(user.id, roleName);
      toast.success(
        `${formatUserName(user) ?? user.username} is now ${roleName}.`,
      );
      reload();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to update role."));
    } finally {
      setSaving(user.id, false);
    }
  }, [pendingChange, reload, setSaving]);

  const handleViewRole = useCallback(
    (roleName) => {
      const role = roles.find((r) => r.name === roleName);
      if (role) setViewingRole(role);
    },
    [roles],
  );

  const handleSavePermissions = useCallback(
    async (userId, permissions) => {
      setPermissionsSaving(true);
      try {
        await updateUserPermissions(userId, permissions);
        toast.success("Permissions updated successfully.");
        setEditingUser(null);
        reload();
      } catch (err) {
        toast.error(getApiErrorMessage(err, "Failed to update permissions."));
      } finally {
        setPermissionsSaving(false);
      }
    },
    [reload],
  );

  const roleFilterOptions = useMemo(() => roles.map((r) => r.name), [roles]);
  const busy = list.loading || list.isSearchPending;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto max-w-full px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-600 p-2">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight text-gray-900">
                User Management
              </h1>
              <p className="text-xs leading-tight text-gray-500">
                {canManage
                  ? "Assign a role to each employee, then fine-tune individual access under Permissions."
                  : "View each employee's assigned role."}{" "}
                New accounts default to {DEFAULT_ROLE_NAME}.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-full px-6 py-6">
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 px-5 py-3.5">
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 focus-within:ring-2 focus-within:ring-blue-500">
              <IconSearch size={13} className="shrink-0 text-gray-400" />
              <input
                type="search"
                value={list.search}
                onChange={(e) => list.setSearch(e.target.value)}
                maxLength={SEARCH_MAX_LENGTH}
                placeholder="Search by name, username or email..."
                aria-label="Search users"
                className="w-64 flex-1 bg-transparent text-xs text-gray-700 outline-none placeholder:text-gray-400"
              />
              {busy && (
                <IconLoader2
                  size={13}
                  className="shrink-0 animate-spin text-gray-300"
                />
              )}
            </div>

            {roleFilterOptions.length > 0 && (
              <Select
                value={list.role || ALL_ROLES}
                onValueChange={(value) =>
                  list.setRole(value === ALL_ROLES ? "" : value)
                }
              >
                <SelectTrigger
                  aria-label="Filter by role"
                  className="h-8 w-44 rounded-lg border-gray-200 bg-gray-50 text-xs"
                >
                  <SelectValue placeholder="All roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_ROLES} className="text-xs">
                    All roles
                  </SelectItem>
                  {roleFilterOptions.map((name) => (
                    <SelectItem key={name} value={name} className="text-xs">
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <button
              type="button"
              onClick={reload}
              disabled={list.loading}
              aria-label="Refresh list"
              title="Refresh"
              className="ml-auto inline-flex h-8 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              <IconRefresh
                size={13}
                className={list.loading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>

          {list.error && (
            <div
              role="alert"
              className="flex items-center gap-3 border-b border-red-100 bg-red-50 px-5 py-3 text-xs text-red-700"
            >
              <AlertTriangle size={14} className="shrink-0" />
              <span className="flex-1">{list.error}</span>
              <button
                type="button"
                onClick={reload}
                className="font-semibold underline-offset-2 hover:underline"
              >
                Retry
              </button>
            </div>
          )}

          <UserManagementTable
            users={list.users}
            roles={roles}
            loading={list.loading}
            hasFilters={list.hasFilters}
            canManage={canManage}
            canViewRoles={canViewRoles}
            savingIds={savingIds}
            onRoleChange={handleRoleChange}
            onViewRole={handleViewRole}
            onEditPermissions={setEditingUser}
            onClearFilters={list.clearFilters}
          />

          <UserPagination
            meta={list.meta}
            disabled={list.loading}
            onPage={setPage}
            onPerPage={list.setPerPage}
          />
        </div>
      </div>

      <RoleChangeDialog
        change={pendingChange}
        onConfirm={confirmRoleChange}
        onCancel={() => setPendingChange(null)}
      />

      <RoleViewModal
        open={!!viewingRole}
        onClose={() => setViewingRole(null)}
        role={viewingRole}
      />

      <PermissionsModal
        open={!!editingUser}
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onSave={handleSavePermissions}
        saving={permissionsSaving}
      />
    </div>
  );
}

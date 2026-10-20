import { memo } from "react";
import { Users } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { IconLoader2 } from "@tabler/icons-react";
import {
  avatarStyle,
  formatUserName,
  getCurrentRoleName,
  getInitials,
  getRoleBadgeClass,
} from "@/utils/userManagement";

const COLUMNS = ["Employee", "Email", "Role"];
const SKELETON_ROWS = 6;

function RoleCell({ user, roles, canEdit, saving, onChange }) {
  const roleName = getCurrentRoleName(user);

  if (!canEdit) {
    return roleName ? (
      <span
        className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-semibold ${getRoleBadgeClass(roleName)}`}
      >
        {roleName}
      </span>
    ) : (
      <span className="text-xs italic text-gray-400">No role</span>
    );
  }

  const options =
    roleName && !roles.some((r) => r.name === roleName)
      ? [...roles, { id: `current-${roleName}`, name: roleName }]
      : roles;

  return (
    <div className="flex items-center gap-2">
      <Select
        value={roleName ?? ""}
        onValueChange={(name) => onChange(user, name)}
        disabled={saving}
      >
        <SelectTrigger
          aria-label={`Role for ${user.username}`}
          className={`h-7 w-44 rounded-lg border text-xs focus:ring-0 focus:ring-offset-0 ${
            roleName
              ? `${getRoleBadgeClass(roleName)} font-semibold`
              : "border-gray-200 bg-gray-50 text-gray-400"
          }`}
        >
          <SelectValue placeholder="Assign role…" />
        </SelectTrigger>
        <SelectContent>
          {options.map((r) => (
            <SelectItem key={r.id} value={r.name} className="text-xs">
              {r.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {saving && (
        <IconLoader2 size={14} className="animate-spin text-gray-400" />
      )}
    </div>
  );
}

function UserRow({
  user,
  roles,
  canManage,
  saving,
  onRoleChange,
}) {
  const displayName = formatUserName(user);

  return (
    <tr className="transition-colors hover:bg-gray-50">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${avatarStyle(user.username || user.email)}`}
            aria-hidden="true"
          >
            {getInitials(user)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-gray-800">
              {displayName ?? (
                <span className="italic text-gray-400">No name</span>
              )}
            </p>
            <p className="truncate text-[11px] text-gray-400">
              {user.username}
            </p>
          </div>
        </div>
      </td>

      <td className="px-4 py-3 text-xs text-gray-500">{user.email}</td>

      <td className="px-4 py-3">
        <RoleCell
          user={user}
          roles={roles}
          canEdit={canManage && roles.length > 0}
          saving={saving}
          onChange={onRoleChange}
        />
      </td>
    </tr>
  );
}

const MemoUserRow = memo(UserRow);

function SkeletonRows() {
  return Array.from({ length: SKELETON_ROWS }, (_, i) => (
    <tr key={i}>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-7 w-7 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-2.5 w-20" />
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-3 w-40" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-7 w-44 rounded-lg" />
      </td>
    </tr>
  ));
}

export default function UserManagementTable({
  users,
  roles,
  loading,
  hasFilters,
  canManage,
  savingIds,
  onRoleChange,
  onClearFilters,
}) {
  const initialLoad = loading && users.length === 0;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm" aria-busy={loading}>
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/80">
            {COLUMNS.map((col) => (
              <th
                key={col}
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>

        <tbody
          className={`divide-y divide-gray-50 transition-opacity ${
            loading && !initialLoad ? "opacity-60" : ""
          }`}
        >
          {initialLoad ? (
            <SkeletonRows />
          ) : users.length === 0 ? (
            <tr>
              <td colSpan={COLUMNS.length} className="py-16">
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                    <Users size={18} className="text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-400">
                    {hasFilters
                      ? "No users match your filters."
                      : "No approved users found."}
                  </p>
                  {hasFilters && (
                    <button
                      type="button"
                      onClick={onClearFilters}
                      className="text-xs font-medium text-blue-600 hover:underline"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <MemoUserRow
                key={user.id}
                user={user}
                roles={roles}
                canManage={canManage}
                saving={savingIds.has(user.id)}
                onRoleChange={onRoleChange}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
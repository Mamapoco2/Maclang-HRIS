import { useEffect, useMemo, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IconLoader2, IconSearch } from "@tabler/icons-react";
import { ShieldCheck, X } from "lucide-react";
import { PERMISSION_GROUPS } from "./permissionGroups";
import { DEFAULT_ROLE_NAME, ACCESS_SCOPE_LABEL } from "../roles";

const ACCESS_SCOPE = [
  {
    value: "ALL",
    label: "All Departments",
  },
  {
    value: "DEPARTMENT",
    label: "Specific Department",
  },
  {
    value: "SELF",
    label: "Self",
  },
];

const ALL_PERMISSION_KEYS = PERMISSION_GROUPS.flatMap((g) =>
  g.permissions.map((p) => p.key),
);

function emptyPermissionMap(value = false) {
  return Object.fromEntries(ALL_PERMISSION_KEYS.map((k) => [k, value]));
}

export default function RoleFormModal({
  open,
  onClose,
  onSave,
  saving = false,
  role = null,
  departments = [],
}) {
  const isEdit = !!role;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [accessScope, setAccessScope] = useState(ACCESS_SCOPE.DEPARTMENT);
  const [departmentIds, setDepartmentIds] = useState([]);
  const [permissions, setPermissions] = useState(emptyPermissionMap());
  const [query, setQuery] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) return;
    setName(role?.name ?? "");
    setDescription(role?.description ?? "");
    setAccessScope(role?.accessScope ?? ACCESS_SCOPE.DEPARTMENT);
    setDepartmentIds(role?.departments?.map((d) => d.id) ?? []);
    setPermissions((prev) => {
      const map = emptyPermissionMap();
      role?.permissions?.forEach((key) => {
        if (key in map) map[key] = true;
      });
      return map;
    });
    setQuery("");
    setErrors({});
  }, [open, role?.id]);

  const toggleDepartment = (id) =>
    setDepartmentIds((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id],
    );

  const togglePermission = (key) =>
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }));

  const toggleGroup = (groupPermissions) => {
    const keys = groupPermissions.map((p) => p.key);
    const allChecked = keys.every((k) => permissions[k]);
    setPermissions((prev) => {
      const next = { ...prev };
      keys.forEach((k) => (next[k] = !allChecked));
      return next;
    });
  };

  const selectedCount = Object.values(permissions).filter(Boolean).length;
  const selectAll = () => setPermissions(emptyPermissionMap(true));
  const clearAll = () => setPermissions(emptyPermissionMap(false));

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PERMISSION_GROUPS;
    return PERMISSION_GROUPS.map((g) => ({
      ...g,
      permissions: g.permissions.filter(
        (p) =>
          p.label.toLowerCase().includes(q) || p.key.toLowerCase().includes(q),
      ),
    })).filter((g) => g.permissions.length > 0);
  }, [query]);

  const validate = () => {
    const next = {};
    if (!name.trim()) next.name = "Role name is required.";
    if (accessScope === ACCESS_SCOPE.DEPARTMENT && departmentIds.length === 0) {
      next.departments = "Select at least one department.";
    }
    if (selectedCount === 0)
      next.permissions = "Select at least one permission.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({
      id: role?.id,
      name: name.trim(),
      description: description.trim(),
      accessScope,
      departmentIds:
        accessScope === ACCESS_SCOPE.DEPARTMENT ? departmentIds : [],
      permissions: Object.entries(permissions)
        .filter(([, checked]) => checked)
        .map(([key]) => key),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl overflow-hidden rounded-2xl border border-gray-100 p-0 shadow-xl">
        <DialogHeader className="px-6 pb-0 pt-5">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <ShieldCheck size={16} />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-sm font-semibold text-gray-900">
                {isEdit ? "Edit role" : "Create new role"}
              </DialogTitle>
              <DialogDescription className="mt-0.5 text-xs text-gray-400">
                {isEdit
                  ? "Changes apply automatically to every user assigned this role."
                  : "Define what this role can access and which department(s) it governs."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto px-6 py-4">
          {/* Role information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Role name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Nursing Directorate Supervisor"
                className={`w-full rounded-lg border bg-gray-50 px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.name ? "border-red-300" : "border-gray-200"
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-[11px] text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Access scope
              </label>
              <div className="flex h-[38px] items-center gap-4">
                {Object.values(ACCESS_SCOPE).map((scope) => (
                  <label
                    key={scope}
                    className="flex cursor-pointer items-center gap-1.5 text-xs text-gray-600"
                  >
                    <input
                      type="radio"
                      name="access-scope"
                      checked={accessScope === scope}
                      onChange={() => setAccessScope(scope)}
                      className="h-3.5 w-3.5 accent-indigo-600"
                    />
                    {ACCESS_SCOPE_LABEL[scope]}
                  </label>
                ))}
              </div>
            </div>

            <div className="col-span-2">
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Role description
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this role for, and who typically holds it?"
                className="min-h-[64px] resize-none rounded-lg border-gray-200 bg-gray-50 text-sm"
              />
            </div>

            {accessScope === ACCESS_SCOPE.DEPARTMENT && (
              <div className="col-span-2">
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Department / organizational unit
                </label>
                <div
                  className={`flex flex-wrap gap-2 rounded-lg border p-2.5 ${
                    errors.departments ? "border-red-300" : "border-gray-200"
                  }`}
                >
                  {departments.length === 0 ? (
                    <p className="px-1 py-1 text-xs text-gray-400">
                      No departments configured yet.
                    </p>
                  ) : (
                    departments.map((d) => {
                      const active = departmentIds.includes(d.id);
                      return (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => toggleDepartment(d.id)}
                          className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                            active
                              ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                              : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          {d.name}
                        </button>
                      );
                    })
                  )}
                </div>
                {errors.departments && (
                  <p className="mt-1 text-[11px] text-red-500">
                    {errors.departments}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Permissions */}
          <div className="mt-5 border-t border-gray-100 pt-4">
            <div className="flex items-center gap-2">
              <div className="flex flex-1 items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 focus-within:ring-2 focus-within:ring-indigo-500">
                <IconSearch size={13} className="shrink-0 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Filter permissions..."
                  className="flex-1 bg-transparent text-xs text-gray-700 outline-none placeholder:text-gray-400"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
              <span className="whitespace-nowrap rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-gray-500">
                {selectedCount} selected
              </span>
            </div>

            <div className="mt-2 flex items-center gap-3 text-[11px]">
              <button
                onClick={selectAll}
                className="font-medium text-indigo-600 hover:text-indigo-700"
              >
                Select all
              </button>
              <span className="text-gray-300">|</span>
              <button
                onClick={clearAll}
                className="font-medium text-gray-500 hover:text-gray-700"
              >
                Clear all
              </button>
              {errors.permissions && (
                <span className="text-red-500">{errors.permissions}</span>
              )}
            </div>

            <div className="mt-3 max-h-[35vh] space-y-2 overflow-y-auto">
              {filteredGroups.length === 0 ? (
                <p className="py-8 text-center text-xs text-gray-400">
                  No permissions match "{query}".
                </p>
              ) : (
                filteredGroups.map(
                  ({ group, permissions: groupPermissions }) => {
                    const allChecked = groupPermissions.every(
                      (p) => permissions[p.key],
                    );
                    const someChecked =
                      !allChecked &&
                      groupPermissions.some((p) => permissions[p.key]);

                    return (
                      <div
                        key={group}
                        className="overflow-hidden rounded-xl border border-gray-100 bg-white"
                      >
                        <div className="flex items-center gap-2.5 border-b border-gray-100 bg-gray-50 px-4 py-2.5">
                          <Checkbox
                            id={`group-${group}`}
                            checked={allChecked}
                            ref={(el) => {
                              if (el) el.indeterminate = someChecked;
                            }}
                            onCheckedChange={() =>
                              toggleGroup(groupPermissions)
                            }
                            className="border-gray-300"
                          />
                          <label
                            htmlFor={`group-${group}`}
                            className="flex-1 cursor-pointer select-none text-xs font-semibold uppercase tracking-wide text-gray-700"
                          >
                            {group}
                          </label>
                          <span className="text-[10px] text-gray-400">
                            {
                              groupPermissions.filter((p) => permissions[p.key])
                                .length
                            }
                            /{groupPermissions.length}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 divide-x divide-gray-50">
                          {groupPermissions.map(({ key, label }) => (
                            <div
                              key={key}
                              className="flex items-center gap-2.5 border-b border-gray-50 px-4 py-2 last:border-b-0"
                            >
                              <Checkbox
                                id={key}
                                checked={!!permissions[key]}
                                onCheckedChange={() => togglePermission(key)}
                                className="border-gray-300"
                              />
                              <label
                                htmlFor={key}
                                className="cursor-pointer select-none text-xs text-gray-600"
                              >
                                {label}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  },
                )
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-100 px-6 py-4">
          <button
            onClick={onClose}
            disabled={saving}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving && <IconLoader2 size={13} className="animate-spin" />}
            {saving ? "Saving…" : isEdit ? "Save changes" : "Create role"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

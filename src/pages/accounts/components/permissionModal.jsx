import { useEffect, useMemo, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IconLoader2, IconSearch } from "@tabler/icons-react";
import { KeyRound, X } from "lucide-react";
import { PERMISSION_GROUPS } from "./permissionGroups";

export default function PermissionsModal({
  user,
  open,
  onClose,
  onSave,
  saving = false,
}) {
  const [selected, setSelected] = useState({});
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!user) return;
    const initial = {};
    PERMISSION_GROUPS.forEach(({ permissions }) =>
      permissions.forEach(({ key }) => {
        initial[key] = user.permissions?.includes(key) ?? false;
      }),
    );
    setSelected(initial);
    setQuery("");
  }, [user?.id, JSON.stringify(user?.permissions)]);

  const toggle = (key) => setSelected((prev) => ({ ...prev, [key]: !prev[key] }));

  const toggleGroup = (permissions) => {
    const keys = permissions.map((p) => p.key);
    const allChecked = keys.every((k) => selected[k]);
    setSelected((prev) => {
      const next = { ...prev };
      keys.forEach((k) => (next[k] = !allChecked));
      return next;
    });
  };

  const allKeys = useMemo(
    () => PERMISSION_GROUPS.flatMap((g) => g.permissions.map((p) => p.key)),
    [],
  );
  const selectedCount = Object.values(selected).filter(Boolean).length;

  const selectAll = () =>
    setSelected(Object.fromEntries(allKeys.map((k) => [k, true])));
  const clearAll = () =>
    setSelected(Object.fromEntries(allKeys.map((k) => [k, false])));

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PERMISSION_GROUPS;
    return PERMISSION_GROUPS.map((g) => ({
      ...g,
      permissions: g.permissions.filter(
        (p) => p.label.toLowerCase().includes(q) || p.key.toLowerCase().includes(q),
      ),
    })).filter((g) => g.permissions.length > 0);
  }, [query]);

  const handleSave = () => {
    const permissions = Object.entries(selected)
      .filter(([, v]) => v)
      .map(([k]) => k);
    onSave(user.id, permissions);
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg overflow-hidden rounded-2xl border border-gray-100 p-0 shadow-xl">
        <DialogHeader className="px-6 pb-0 pt-5">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <KeyRound size={16} />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-sm font-semibold text-gray-900">
                Edit permissions
              </DialogTitle>
              <DialogDescription className="mt-0.5 text-xs text-gray-400">
                Updating access for{" "}
                <span className="font-medium text-gray-700">{user.name}</span>
                {" — "}
                {user.email}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Search + quick actions */}
        <div className="flex items-center gap-2 px-6 pt-4">
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
              <button onClick={() => setQuery("")} className="text-gray-400 hover:text-gray-600">
                <X size={12} />
              </button>
            )}
          </div>
          <span className="whitespace-nowrap rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-gray-500">
            {selectedCount} selected
          </span>
        </div>

        <div className="flex items-center gap-3 px-6 pb-1 pt-2 text-[11px]">
          <button onClick={selectAll} className="font-medium text-indigo-600 hover:text-indigo-700">
            Select all
          </button>
          <span className="text-gray-300">|</span>
          <button onClick={clearAll} className="font-medium text-gray-500 hover:text-gray-700">
            Clear all
          </button>
        </div>

        <div className="max-h-[55vh] space-y-2 overflow-y-auto px-6 py-4">
          {filteredGroups.length === 0 ? (
            <p className="py-10 text-center text-xs text-gray-400">
              No permissions match "{query}".
            </p>
          ) : (
            filteredGroups.map(({ group, permissions }) => {
              const allChecked = permissions.every((p) => selected[p.key]);
              const someChecked = !allChecked && permissions.some((p) => selected[p.key]);

              return (
                <div key={group} className="overflow-hidden rounded-xl border border-gray-100 bg-white">
                  {/* Group header */}
                  <div className="flex items-center gap-2.5 border-b border-gray-100 bg-gray-50 px-4 py-2.5">
                    <Checkbox
                      id={`group-${group}`}
                      checked={allChecked}
                      ref={(el) => {
                        if (el) el.indeterminate = someChecked;
                      }}
                      onCheckedChange={() => toggleGroup(permissions)}
                      className="border-gray-300"
                    />
                    <label
                      htmlFor={`group-${group}`}
                      className="flex-1 cursor-pointer select-none text-xs font-semibold uppercase tracking-wide text-gray-700"
                    >
                      {group}
                    </label>
                    <span className="text-[10px] text-gray-400">
                      {permissions.filter((p) => selected[p.key]).length}/{permissions.length}
                    </span>
                  </div>

                  {/* Permission items */}
                  <div className="grid grid-cols-2 divide-x divide-gray-50">
                    {permissions.map(({ key, label }) => (
                      <div
                        key={key}
                        className="flex items-center gap-2.5 border-b border-gray-50 px-4 py-2 last:border-b-0"
                      >
                        <Checkbox
                          id={key}
                          checked={!!selected[key]}
                          onCheckedChange={() => toggle(key)}
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
            })
          )}
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
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

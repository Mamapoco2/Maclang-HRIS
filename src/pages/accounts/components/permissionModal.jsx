import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IconLoader2 } from "@tabler/icons-react";
import { PERMISSION_GROUPS } from "./permissionGroups";

export default function PermissionsModal({
  user,
  open,
  onClose,
  onSave,
  saving = false,
}) {
  const [selected, setSelected] = useState({});

  useEffect(() => {
    if (!user) return;
    const initial = {};
    PERMISSION_GROUPS.forEach(({ permissions }) =>
      permissions.forEach(({ key }) => {
        initial[key] = user.permissions?.includes(key) ?? false;
      }),
    );
    setSelected(initial);
  }, [user?.id, JSON.stringify(user?.permissions)]);

  const toggle = (key) =>
    setSelected((prev) => ({ ...prev, [key]: !prev[key] }));

  const toggleGroup = (permissions) => {
    const keys = permissions.map((p) => p.key);
    const allChecked = keys.every((k) => selected[k]);
    setSelected((prev) => {
      const next = { ...prev };
      keys.forEach((k) => (next[k] = !allChecked));
      return next;
    });
  };

  const handleSave = () => {
    const permissions = Object.entries(selected)
      .filter(([, v]) => v)
      .map(([k]) => k);
    onSave(user.id, permissions);
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg rounded-2xl border border-gray-100 shadow-xl p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-5 pb-0">
          <DialogTitle className="text-sm font-semibold text-gray-900">
            Edit permissions
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-400 mt-0.5">
            Updating access for{" "}
            <span className="font-medium text-gray-700">{user.name}</span>
            {" — "}
            {user.email}
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[60vh] px-6 py-4 space-y-2">
          {PERMISSION_GROUPS.map(({ group, permissions }) => {
            const allChecked = permissions.every((p) => selected[p.key]);
            const someChecked =
              !allChecked && permissions.some((p) => selected[p.key]);

            return (
              <div
                key={group}
                className="bg-white rounded-xl border border-gray-100 overflow-hidden"
              >
                {/* Group header */}
                <div className="flex items-center gap-2.5 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                  <Checkbox
                    id={`group-${group}`}
                    checked={allChecked}
                    data-indeterminate={someChecked}
                    onCheckedChange={() => toggleGroup(permissions)}
                    className="border-gray-300"
                  />
                  <label
                    htmlFor={`group-${group}`}
                    className="text-xs font-semibold text-gray-700 cursor-pointer select-none flex-1 uppercase tracking-wide"
                  >
                    {group}
                  </label>
                  {someChecked && (
                    <span className="text-[10px] text-gray-400">partial</span>
                  )}
                </div>

                {/* Permission items */}
                <div className="grid grid-cols-2 divide-x divide-gray-50">
                  {permissions.map(({ key, label }) => (
                    <div
                      key={key}
                      className="flex items-center gap-2.5 px-4 py-2 border-b border-gray-50 last:border-b-0"
                    >
                      <Checkbox
                        id={key}
                        checked={!!selected[key]}
                        onCheckedChange={() => toggle(key)}
                        className="border-gray-300"
                      />
                      <label
                        htmlFor={key}
                        className="text-xs text-gray-600 cursor-pointer select-none"
                      >
                        {label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
          >
            {saving && <IconLoader2 size={13} className="animate-spin" />}
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
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
      <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden rounded-xl">
        <DialogHeader className="px-5 pt-5 pb-4 border-b border-gray-100">
          <DialogTitle className="text-base font-medium text-gray-900">
            Edit permissions
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500 mt-0.5">
            Updating access for{" "}
            <span className="font-medium text-gray-800">{user.name}</span>
            {" — "}
            {user.email}
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[60vh] px-5 py-4 space-y-2">
          {PERMISSION_GROUPS.map(({ group, permissions }) => {
            const allChecked = permissions.every((p) => selected[p.key]);
            const someChecked =
              !allChecked && permissions.some((p) => selected[p.key]);

            return (
              <div
                key={group}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-gray-50 border-b border-gray-100">
                  <Checkbox
                    id={`group-${group}`}
                    checked={allChecked}
                    data-indeterminate={someChecked}
                    onCheckedChange={() => toggleGroup(permissions)}
                    className="border-gray-300"
                  />
                  <label
                    htmlFor={`group-${group}`}
                    className="text-sm font-medium text-gray-800 cursor-pointer select-none flex-1"
                  >
                    {group}
                  </label>
                  {someChecked && (
                    <span className="text-[11px] text-gray-400 font-normal">
                      partial
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 divide-x divide-gray-100">
                  {permissions.map(({ key, label }) => (
                    <div
                      key={key}
                      className="flex items-center gap-2.5 px-3.5 py-2 border-b border-gray-100 last:border-b-0"
                    >
                      <Checkbox
                        id={key}
                        checked={!!selected[key]}
                        onCheckedChange={() => toggle(key)}
                        className="border-gray-300"
                      />
                      <label
                        htmlFor={key}
                        className="text-sm text-gray-600 cursor-pointer select-none"
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

        <DialogFooter className="px-5 py-4 border-t border-gray-100 gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={saving}
            className="h-8 text-sm border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="h-8 text-sm bg-gray-900 hover:bg-gray-800 text-white"
          >
            {saving && (
              <IconLoader2
                size={13}
                stroke={1.5}
                className="animate-spin mr-1.5"
              />
            )}
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

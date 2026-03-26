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
  }, [user]);

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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Permissions</DialogTitle>
          <DialogDescription>
            Updating access for{" "}
            <span className="font-medium text-foreground">{user.name}</span>{" "}
            &mdash; {user.email}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2 max-h-[60vh] overflow-y-auto pr-1">
          {PERMISSION_GROUPS.map(({ group, permissions }) => {
            const allChecked = permissions.every((p) => selected[p.key]);
            const someChecked =
              !allChecked && permissions.some((p) => selected[p.key]);

            return (
              <div key={group} className="border rounded-md p-3">
                {/* Group header with select-all checkbox */}
                <div className="flex items-center gap-2 mb-2">
                  <Checkbox
                    id={`group-${group}`}
                    checked={allChecked}
                    data-indeterminate={someChecked}
                    onCheckedChange={() => toggleGroup(permissions)}
                  />
                  <label
                    htmlFor={`group-${group}`}
                    className="text-sm font-semibold cursor-pointer select-none"
                  >
                    {group}
                  </label>
                  {someChecked && (
                    <span className="text-[10px] text-muted-foreground ml-auto">
                      partial
                    </span>
                  )}
                </div>

                {/* Individual permission checkboxes */}
                <div className="grid grid-cols-2 gap-y-1.5 gap-x-4 pl-6">
                  {permissions.map(({ key, label }) => (
                    <div key={key} className="flex items-center gap-2">
                      <Checkbox
                        id={key}
                        checked={!!selected[key]}
                        onCheckedChange={() => toggle(key)}
                      />
                      <label
                        htmlFor={key}
                        className="text-sm text-muted-foreground cursor-pointer select-none"
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

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <IconLoader2 size={14} className="animate-spin mr-1" />}
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IconLoader2 } from "@tabler/icons-react";
import { AlertTriangle } from "lucide-react";

export default function DeleteRoleDialog({ open, onClose, onConfirm, role, deleting = false }) {
  if (!role) return null;

  const hasUsers = (role.usersCount ?? 0) > 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm overflow-hidden rounded-2xl border border-gray-100 p-0 shadow-xl">
        <DialogHeader className="px-6 pb-0 pt-5">
          <div className="flex items-start gap-3">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                hasUsers ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"
              }`}
            >
              <AlertTriangle size={16} />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-sm font-semibold text-gray-900">
                Delete "{role.name}"?
              </DialogTitle>
              <DialogDescription className="mt-1 text-xs leading-relaxed text-gray-500">
                {hasUsers ? (
                  <>
                    This role is currently assigned to{" "}
                    <span className="font-medium text-gray-700">
                      {role.usersCount} user{role.usersCount === 1 ? "" : "s"}
                    </span>
                    . Please reassign these users to another role before
                    deleting this role.
                  </>
                ) : (
                  "This action can't be undone. The role will be permanently removed."
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex justify-end gap-2 px-6 py-5">
          <button
            onClick={onClose}
            disabled={deleting}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            {hasUsers ? "Close" : "Cancel"}
          </button>
          {!hasUsers && (
            <button
              onClick={onConfirm}
              disabled={deleting}
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
            >
              {deleting && <IconLoader2 size={13} className="animate-spin" />}
              {deleting ? "Deleting…" : "Delete role"}
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

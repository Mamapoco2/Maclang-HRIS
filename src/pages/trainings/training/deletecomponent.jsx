import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { IconLoader2, IconAlertTriangle } from "@tabler/icons-react";

export function DeleteConfirmModal({ open, onClose, onDelete, training }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await onDelete(training);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm rounded-2xl border border-gray-100 shadow-xl p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-5 pb-0">
          <DialogTitle className="text-sm font-semibold text-gray-900">
            Delete Training
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6 pt-4 space-y-5">
          {/* Warning block */}
          <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl p-4">
            <IconAlertTriangle
              size={16}
              className="text-red-500 shrink-0 mt-0.5"
            />
            <div>
              <p className="text-sm text-red-700">
                Are you sure you want to delete{" "}
                <span className="font-semibold">"{training?.title}"</span>?
              </p>
              <p className="text-xs text-red-500 mt-1">
                This action cannot be undone. All associated data will be
                permanently removed.
              </p>
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-2 sm:justify-end">
            <button
              onClick={() => onClose(false)}
              disabled={deleting}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50"
            >
              {deleting ? (
                <>
                  <IconLoader2 size={14} className="animate-spin" /> Deleting…
                </>
              ) : (
                "Delete"
              )}
            </button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default DeleteConfirmModal;

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
      <DialogContent className="sm:max-w-md p-0 rounded-xl overflow-hidden border-gray-200 gap-0">
        <DialogHeader className="px-6 py-4 border-b border-gray-100">
          <DialogTitle className="text-base font-semibold text-gray-900">
            Delete Training
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-5 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0 mt-0.5">
              <IconAlertTriangle size={16} className="text-red-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">
                Are you sure you want to delete{" "}
                <span className="font-semibold">"{training?.title}"</span>?
              </p>
              <p className="text-xs text-gray-400 mt-1">
                This action cannot be undone. All associated data will be
                permanently removed.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-gray-100 gap-2">
          <Button
            variant="outline"
            onClick={() => onClose(false)}
            disabled={deleting}
            className="rounded-lg border-gray-200 text-gray-600 h-9"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-lg bg-red-500 hover:bg-red-600 text-white h-9 gap-1.5"
          >
            {deleting ? (
              <>
                <IconLoader2 size={14} className="animate-spin" /> Deleting…
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DeleteConfirmModal;

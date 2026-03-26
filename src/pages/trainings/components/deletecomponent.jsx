import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { IconLoader2 } from "@tabler/icons-react";

const DeleteConfirmModal = ({ open, onClose, onDelete, training }) => {
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
      <DialogContent className="sm:max-w-lg bg-white rounded-lg shadow-lg p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            Delete Training
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            Are you sure you want to delete{" "}
            <span className="font-semibold">"{training?.title}"</span>? This
            action cannot be undone.
          </p>
        </div>

        <DialogFooter className="flex justify-end space-x-3">
          <Button
            variant="outline"
            className="text-gray-600"
            onClick={() => onClose(false)}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            className="bg-red-600 text-white hover:bg-red-700"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <>
                <IconLoader2 size={14} className="animate-spin mr-1" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteConfirmModal;

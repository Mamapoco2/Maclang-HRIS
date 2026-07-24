import React from "react";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { Button, Modal } from "../ui";

export function DeletePostingModal({ item, deleting, onCancel, onConfirm }) {
  return (
    <Modal
      open={!!item}
      onClose={() => !deleting && onCancel()}
      widthClass="max-w-sm"
    >
      {item && (
        <div className="p-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-50 text-rose-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-slate-900">
            Delete posting
          </h3>
          <p className="mt-1.5 text-sm text-slate-500">
            This posting will be removed. This action cannot be undone.
          </p>
          <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
            {item.positionTitle} · {item.baseItemNumber}
          </p>
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="secondary" onClick={onCancel} disabled={deleting}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirm}
              disabled={deleting}
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Delete
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

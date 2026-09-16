import { useState } from "react";
import { X, Undo2 } from "lucide-react";
import { formatDate } from "../utils";

// Mirrors CancelRequestModal's shape (request / submitting / onClose / onSave)
// so RequestsPage can treat Cancel and Retract as interchangeable dialogs.
// Align the visual details here with the actual CancelRequestModal if its
// markup differs from this reconstruction.
export function RetractRequestModal({ request, submitting, onClose, onSave }) {
  const [reason, setReason] = useState("");

  if (!request) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) return;
    onSave(reason.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-[var(--card)] shadow-xl">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <div className="flex items-center gap-2">
            <Undo2 className="w-4 h-4 text-amber-600" />
            <h2 className="text-sm font-semibold text-[var(--foreground)]">
              Retract Approved Leave
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          <p className="text-sm text-[var(--muted-foreground)]">
            This leave was approved for{" "}
            <span className="font-medium text-[var(--foreground)]">
              {formatDate(request.startDate)} – {formatDate(request.endDate)}
            </span>
            . Retracting it withdraws the approved leave and sets its status
            to <span className="font-medium">Retracted</span>. This cannot be
            undone from here.
          </p>

          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">
              Reason for retracting
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              rows={3}
              placeholder="Let your approver know why you're withdrawing this approved leave..."
              className="w-full rounded-lg border-0 bg-[var(--muted)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--muted)]"
            >
              Never mind
            </button>
            <button
              type="submit"
              disabled={submitting || !reason.trim()}
              className="rounded-lg bg-amber-600 px-3 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
            >
              {submitting ? "Retracting…" : "Retract Leave"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

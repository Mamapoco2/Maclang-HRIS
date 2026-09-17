import { X, RotateCcw } from "lucide-react";
import { formatDate } from "../utils";

export function ResubmitRequestModal({ request, submitting, onClose, onSave }) {
  if (!request) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-[var(--card)] shadow-xl">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-orange-600" />
            <h2 className="text-sm font-semibold text-[var(--foreground)]">
              Resubmit Leave Request
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

        <div className="px-5 py-4 space-y-4">
          {request.returnReason && (
            <div className="rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900 px-3 py-2.5">
              <p className="text-xs font-medium text-orange-700 dark:text-orange-400 mb-0.5">
                Reason for return
              </p>
              <p className="text-sm text-orange-900 dark:text-orange-200">
                {request.returnReason}
              </p>
            </div>
          )}

          <p className="text-sm text-[var(--muted-foreground)]">
            This will resend your{" "}
            <span className="font-medium text-[var(--foreground)]">
              {formatDate(request.startDate)} – {formatDate(request.endDate)}
            </span>{" "}
            request to the same approver for another review. It does not yet let
            you edit the request's details here — if something needs to change,
            cancel this request instead and file a new one.
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--muted)]"
            >
              Never mind
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={submitting}
              className="rounded-lg bg-orange-600 px-3 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50"
            >
              {submitting ? "Resubmitting…" : "Resubmit for Review"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

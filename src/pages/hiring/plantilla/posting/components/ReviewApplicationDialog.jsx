import React, { useEffect, useState } from "react";
import { X, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { plantillaPostingService } from "@/services/plantillaPostingService";
import { Button, Textarea, Label, FieldError, Select, Modal } from "./ui";
import { InterviewStatusBadge } from "./TableParts";
import { APPLICATION_STATUSES } from "./constants";

const REVIEW_OPTIONS = APPLICATION_STATUSES.filter((s) => s !== "Pending");

export function ReviewApplicationDialog({ application, onClose, onSaved }) {
  const [status, setStatus] = useState("");
  const [remarks, setRemarks] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!application) return;
    setStatus(
      application.status === "Pending" ? "Under Review" : application.status,
    );
    setRemarks(application.remarks ?? "");
    setError("");
  }, [application?.id]);

  if (!application) return <Modal open={false} onClose={onClose} />;

  const interviewCompleted =
    application.interview?.overall_status?.toUpperCase() === "COMPLETED";
  const showApprovalWarning = status === "Approved" && !interviewCompleted;

  const handleSave = async () => {
    if (saving || !status) return;
    setSaving(true);
    setError("");
    try {
      await plantillaPostingService.reviewApplication(application.id, {
        status,
        remarks,
      });
      toast?.success?.("Na-update ang application.");
      onSaved();
    } catch (err) {
      const message =
        err?.response?.data?.errors?.status?.[0] ||
        err?.response?.data?.message ||
        "Hindi na-update ang application.";
      setError(message);
      toast?.error?.(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={!!application}
      onClose={() => !saving && onClose()}
      widthClass="max-w-lg"
    >
      <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white px-6 py-4">
        <h2 className="text-base font-semibold text-slate-900">
          Review Application
        </h2>
        <button
          onClick={() => !saving && onClose()}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-5 px-6 py-5">
        <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
          <span className="text-xs font-medium text-slate-500">
            Current Interview Status
          </span>
          <InterviewStatusBadge
            status={application.interview?.overall_status}
          />
        </div>

        <div>
          <Label required>New Status</Label>
          <Select
            value={status}
            onChange={setStatus}
            options={REVIEW_OPTIONS.map((v) => ({ value: v, label: v }))}
            placeholder="Select status"
          />
        </div>

        {showApprovalWarning && (
          <div className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2.5 text-xs text-amber-700">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              Hindi pa COMPLETED ang interview ng application na ito. Hindi ito
              maaaprubahan ng backend hangga't hindi na-mamark as Completed sa
              Interview dialog.
            </span>
          </div>
        )}

        <div>
          <Label>Remarks</Label>
          <Textarea
            rows={3}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Optional remarks para sa employee"
          />
        </div>

        <FieldError>{error}</FieldError>
      </div>

      <div className="sticky bottom-0 flex justify-end gap-2 border-t border-slate-200 bg-white px-6 py-4">
        <Button
          variant="secondary"
          onClick={() => !saving && onClose()}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saving || !status}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Decision"
          )}
        </Button>
      </div>
    </Modal>
  );
}

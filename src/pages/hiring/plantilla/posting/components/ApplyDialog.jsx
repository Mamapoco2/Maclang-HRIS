import React, { useCallback, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { plantillaPostingService } from "@/services/plantillaPostingService";
import { Button, Textarea, Label, FieldError, Checkbox, Modal } from "./ui";
import { UploadCard } from "./UploadCard";
import { DOC_KEYS } from "./constants";

export function ReadOnlyField({ label, value }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-sm font-medium text-slate-700">{value}</p>
    </div>
  );
}

export function ApplyDialog({ item, user, onClose, onSuccess }) {
  const [files, setFiles] = useState({});
  const [fileErrors, setFileErrors] = useState({});
  const [notes, setNotes] = useState("");
  const [certified, setCertified] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [attempted, setAttempted] = useState(false);

  const resetLocal = useCallback(() => {
    setFiles({});
    setFileErrors({});
    setNotes("");
    setCertified(false);
    setSubmitting(false);
    setAttempted(false);
  }, []);

  if (!item) return <Modal open={false} onClose={onClose} />;

  const requiredDocs = DOC_KEYS.filter((d) => item.requiredDocuments[d.key]);
  const allRequiredUploaded = requiredDocs.every((d) => files[d.key]);
  const canSubmit = allRequiredUploaded && certified && !submitting;

  const handleFile = (key, file, okType, okSize) => {
    if (!okType) {
      setFileErrors((e) => ({
        ...e,
        [key]: "Only PDF, DOC, or DOCX files are accepted.",
      }));
      return;
    }
    if (!okSize) {
      setFileErrors((e) => ({ ...e, [key]: "File must not exceed 10MB." }));
      return;
    }
    setFileErrors((e) => ({ ...e, [key]: undefined }));
    setFiles((f) => ({ ...f, [key]: file }));
  };

  const handleSubmit = async () => {
    setAttempted(true);
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await plantillaPostingService.applyToPosting(item.id, {
        notes,
        certified,
        documents: files,
      });
      resetLocal();
      onSuccess();
    } catch (err) {
      toast?.error?.(
        err?.response?.data?.message ?? "Hindi na-submit ang application.",
      );
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (submitting) return;
    resetLocal();
    onClose();
  };

  const employee = user?.employee;

  return (
    <Modal open={!!item} onClose={handleClose} widthClass="max-w-2xl">
      <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white px-6 py-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Apply for Position
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">
            {item.positionTitle} · {item.baseItemNumber}
          </p>
        </div>
        <button
          onClick={handleClose}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="space-y-6 px-6 py-5">
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Employee Information
          </h3>
          <div className="grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3 text-sm">
            <ReadOnlyField
              label="Employee ID"
              value={employee?.employee_number ?? "—"}
            />
            <ReadOnlyField
              label="Name"
              value={employee?.full_name ?? user?.name ?? "—"}
            />
            <ReadOnlyField
              label="Department"
              value={employee?.department?.name ?? "—"}
            />
            <ReadOnlyField label="Position" value={employee?.position ?? "—"} />
            <ReadOnlyField
              label="Employment Status"
              value={employee?.employment_status ?? "—"}
            />
          </div>
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Required Documents
            </h3>
            {attempted && !allRequiredUploaded && (
              <span className="text-xs font-medium text-rose-600">
                Upload all required documents
              </span>
            )}
          </div>
          <div className="space-y-2">
            {requiredDocs.map((d) => (
              <UploadCard
                key={d.key}
                label={d.label}
                file={files[d.key]}
                onFile={(file, okType, okSize) =>
                  handleFile(d.key, file, okType, okSize)
                }
                onRemove={() => setFiles((f) => ({ ...f, [d.key]: undefined }))}
                error={
                  fileErrors[d.key] ||
                  (attempted && !files[d.key]
                    ? "This document is required."
                    : undefined)
                }
              />
            ))}
          </div>
        </div>
        <div>
          <Label>Application Notes</Label>
          <Textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any additional notes for the HR office (optional)"
          />
        </div>
        <label className="flex cursor-pointer items-start gap-2.5">
          <Checkbox checked={certified} onChange={setCertified} />
          <span className="text-sm text-slate-600">
            I certify that the information provided is true and correct.
          </span>
        </label>
        {attempted && !certified && (
          <FieldError>You must certify before submitting.</FieldError>
        )}
      </div>
      <div className="sticky bottom-0 flex justify-end gap-2 border-t border-slate-200 bg-white px-6 py-4">
        <Button variant="secondary" onClick={handleClose} disabled={submitting}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Application"
          )}
        </Button>
      </div>
    </Modal>
  );
}

import React, { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { Button, Modal } from "../ui";
import { PostingForm } from "./PostingForm";
import { EMPTY_FORM } from "../constants";
import {
  buildEditFormFromRecord,
  validatePostingForm,
  buildSavePayload,
  deriveAnnualFromMonthly,
  deriveMonthlyFromAnnual,
  formatSalaryLiveInput,
  formatSalaryNumber,
} from "./postingHelpers";

export function EditPostingDialog({
  posting,
  onClose,
  onSave,
  departments,
  divisions,
  salaryGrades,
}) {
  const open = !!posting;
  const [form, setForm] = useState(EMPTY_FORM);
  const [stepLabel, setStepLabel] = useState("—");
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!posting) return;
    const built = buildEditFormFromRecord(posting);
    setForm(built.form);
    setStepLabel(built.stepLabel);
    setErrors({});
  }, [posting?.id]);

  if (!open) return <Modal open={false} onClose={onClose} />;

  const handleFieldChange = (key, value) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleDocChange = (key, value) =>
    setForm((f) => ({
      ...f,
      required_documents: { ...f.required_documents, [key]: value },
    }));

  const handleMonthlySalaryChange = (raw) => {
    const liveFormatted = formatSalaryLiveInput(raw);
    const derivedAnnual = deriveAnnualFromMonthly(liveFormatted);
    setForm((f) => ({
      ...f,
      monthly_salary: liveFormatted,
      annual_salary: derivedAnnual ?? f.annual_salary,
    }));
  };

  const handleAnnualSalaryChange = (raw) => {
    const liveFormatted = formatSalaryLiveInput(raw);
    const derivedMonthly = deriveMonthlyFromAnnual(liveFormatted);
    setForm((f) => ({
      ...f,
      annual_salary: liveFormatted,
      monthly_salary: derivedMonthly ?? f.monthly_salary,
    }));
  };

  const handleMonthlySalaryBlur = () =>
    setForm((f) => ({
      ...f,
      monthly_salary: formatSalaryNumber(f.monthly_salary),
    }));

  const handleAnnualSalaryBlur = () =>
    setForm((f) => ({
      ...f,
      annual_salary: formatSalaryNumber(f.annual_salary),
    }));

  const handleSave = async () => {
    if (saving) return;
    const nextErrors = validatePostingForm(form, { mode: "edit" });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      await onSave(buildSavePayload(form, "edit"));
    } catch {
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (saving) return;
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} widthClass="max-w-3xl">
      <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white px-6 py-4">
        <h2 className="text-base font-semibold text-slate-900">Edit Posting</h2>
        <button
          onClick={handleClose}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-6 px-6 py-5">
        <PostingForm
          form={form}
          errors={errors}
          departments={departments}
          divisions={divisions}
          salaryGrades={salaryGrades}
          stepLabel={stepLabel}
          statusLabel={form.status || "—"}
          slotNameHelpText="Fixed at the time this posting was created. Never editable."
          onFieldChange={handleFieldChange}
          onMonthlySalaryChange={handleMonthlySalaryChange}
          onAnnualSalaryChange={handleAnnualSalaryChange}
          onMonthlySalaryBlur={handleMonthlySalaryBlur}
          onAnnualSalaryBlur={handleAnnualSalaryBlur}
          onDocChange={handleDocChange}
        />
      </div>

      <div className="sticky bottom-0 flex justify-end gap-2 border-t border-slate-200 bg-white px-6 py-4">
        <Button variant="secondary" onClick={handleClose} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Update"
          )}
        </Button>
      </div>
    </Modal>
  );
}

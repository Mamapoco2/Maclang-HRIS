import React, { useContext, useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { Button, Label, Select, Modal } from "../ui";
import { FormSection, PostingForm } from "./PostingForm";
import { EMPTY_FORM } from "../constants";
import { AuthContext } from "@/context/authContext";
import {
  filterSelectableVacantItems,
  getPositionTitleOptions,
  getSlotOptionsForTitle,
  findVacantItemBySlotId,
  validatePostingForm,
  buildSavePayload,
  deriveAnnualFromMonthly,
  deriveMonthlyFromAnnual,
  formatSalaryLiveInput,
  formatSalaryNumber,
  getTodayDateString,
  computeClosingDate,
  computeApplicationDeadline,
} from "./postingHelpers";

function buildInitialForm() {
  const datePosted = getTodayDateString();
  return {
    ...EMPTY_FORM,
    status: "Open",
    date_posted: datePosted,
    application_deadline: computeApplicationDeadline(datePosted),
    closing_date: computeClosingDate(datePosted),
  };
}

export function CreatePostingDialog({
  open,
  onClose,
  onSave,
  departments,
  divisions,
  salaryGrades,
  vacantItems,
  postedBaseItemNumbers,
}) {
  const { hasRole } = useContext(AuthContext) || {};
  const canViewClosingDate = !!(hasRole?.("HR") || hasRole?.("SuperAdmin"));

  const [form, setForm] = useState(buildInitialForm());
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [availableSteps, setAvailableSteps] = useState([]);
  const [selectedTitle, setSelectedTitle] = useState("");
  const [resolvedOffice, setResolvedOffice] = useState({
    type: "",
    name: "",
    divisionName: "",
  });

  useEffect(() => {
    if (open) {
      setForm(buildInitialForm());
      setAvailableSteps([]);
      setSelectedTitle("");
      setResolvedOffice({ type: "", name: "", divisionName: "" });
      setErrors({});
    }
  }, [open]);

  if (!open) return <Modal open={false} onClose={onClose} />;

  const selectableVacantItems = filterSelectableVacantItems(
    vacantItems,
    postedBaseItemNumbers,
  );
  const positionTitleOptions = getPositionTitleOptions(selectableVacantItems);
  const itemNumberOptions = getSlotOptionsForTitle(
    selectableVacantItems,
    selectedTitle,
  );

  const resetItemSelection = () => {
    setForm((f) => ({
      ...f,
      base_item_number: "",
      position_slot_names: [],
      plantilla_position_ids: [],
      section: "",
      vacancies: "",
    }));
    setAvailableSteps([]);
    setResolvedOffice({ type: "", name: "", divisionName: "" });
  };

  const handleTitleChange = (title) => {
    setSelectedTitle(title);
    resetItemSelection();
  };

  const applyItemNumber = (slotId) => {
    const found = findVacantItemBySlotId(selectableVacantItems, slotId);
    if (!found) {
      resetItemSelection();
      return;
    }
    const { vacantItem: vi, slot } = found;

    setAvailableSteps(vi.step_increments ?? []);
    setResolvedOffice({
      type: vi.office_type ?? "",
      name: vi.office_name ?? "",
      divisionName: vi.division_name ?? "",
    });
    setForm((f) => ({
      ...f,
      base_item_number: vi.base_item_number,
      position_slot_names: [slot.position_slot_name],
      plantilla_position_ids: [slot.id],
      title: vi.title || f.title,
      display_department_id: vi.display_department_id ?? "",
      display_division_id: vi.display_division_id ?? "",
      section: vi.office_type === "SECTION" ? (vi.office_name ?? "") : "",
      salary_grade_id: slot.salary_grade_id ?? vi.salary_grade_id ?? "",
      step_increment_id: slot.step_increment_id ?? vi.step_increment_id ?? "",
      monthly_salary: formatSalaryNumber(
        slot.monthly_salary ?? vi.monthly_salary ?? null,
      ),
      annual_salary: formatSalaryNumber(
        slot.annual_salary ?? vi.annual_salary ?? null,
      ),
      immediate_supervisor: vi.immediate_supervisor ?? f.immediate_supervisor,
      status: f.status || "Open",
      vacancies: "1",
    }));
  };

  const stepLabel = (() => {
    const step = availableSteps.find(
      (s) => String(s.id) === String(form.step_increment_id),
    );
    return step ? `Step ${step.step}` : "—";
  })();

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
    const nextErrors = validatePostingForm(form, {
      mode: "create",
      canViewClosingDate,
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      await onSave(buildSavePayload(form, "create"));
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
        <h2 className="text-base font-semibold text-slate-900">New Posting</h2>
        <button
          onClick={handleClose}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-6 px-6 py-5">
        <FormSection title="Source Plantilla Item">
          <Label required>Position Title</Label>
          <Select
            value={selectedTitle}
            onChange={handleTitleChange}
            options={positionTitleOptions}
            placeholder="Select a position title"
          />
          <p className="mt-1 text-[11px] text-slate-400">
            Only items with at least one VACANT slot and no existing posting are
            listed, one entry per title. Pick the Item Number below (under
            Position Details) to load the specific item's details.
          </p>
        </FormSection>

        <PostingForm
          form={form}
          errors={errors}
          departments={departments}
          divisions={divisions}
          salaryGrades={salaryGrades}
          stepLabel={stepLabel}
          statusLabel="Open"
          officeType={resolvedOffice.type}
          departmentDisplayName={resolvedOffice.name}
          divisionDisplayName={resolvedOffice.divisionName}
          itemNumberOptions={itemNumberOptions}
          itemNumberEditable
          itemNumberDisabled={!selectedTitle}
          slotNameHelpText={
            selectedTitle ? undefined : "Select a position title above first."
          }
          onItemNumberChange={applyItemNumber}
          onFieldChange={handleFieldChange}
          onMonthlySalaryChange={handleMonthlySalaryChange}
          onAnnualSalaryChange={handleAnnualSalaryChange}
          onMonthlySalaryBlur={handleMonthlySalaryBlur}
          onAnnualSalaryBlur={handleAnnualSalaryBlur}
          onDocChange={handleDocChange}
          canViewClosingDate={canViewClosingDate}
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
            "Save"
          )}
        </Button>
      </div>
    </Modal>
  );
}

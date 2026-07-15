import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import {
  Button,
  Input,
  Textarea,
  Label,
  FieldError,
  Select,
  Switch,
  Modal,
} from "./ui";
import { EMP_STATUS, DOC_KEYS, EMPTY_FORM } from "./constants";

export function FormSection({ title, children }) {
  return (
    <div>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </h3>
      {children}
    </div>
  );
}

export function EditDialog({
  state,
  onClose,
  onSave,
  departments,
  divisions,
  salaryGrades,
  vacantItems,
}) {
  const open = !!state;
  const mode = state?.mode;
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [availableSteps, setAvailableSteps] = useState([]);

  const sourceId = state ? (mode === "edit" ? state.data.id : "create") : null;

  useEffect(() => {
    if (!open) return;
    if (mode === "edit") {
      const d = state.data;
      setForm({
        id: d.id,
        base_item_number: d.baseItemNumber,
        title: d.positionTitle,
        display_department_id: d.officeId ?? "",
        display_division_id: d.divisionId ?? "",
        section: d.section,
        salary_grade_id: d.salaryGradeId ?? "",
        step_increment_id: d.stepIncrementId ?? "",
        monthly_salary: String(d.monthlySalary ?? ""),
        annual_salary: String(d.annualSalary ?? ""),
        employment_status: d.employmentStatus,
        vacancies: String(d.vacancies),
        immediate_supervisor:
          d.immediateSupervisor === "—" ? "" : (d.immediateSupervisor ?? ""),
        qualification_education: d.qualifications.education,
        qualification_experience: d.qualifications.experience,
        qualification_training: d.qualifications.training,
        qualification_eligibility: d.qualifications.eligibility,
        qualification_competency: d.qualifications.competency,
        job_description: d.jobDescription,
        date_posted: d.datePosted,
        closing_date: d.closingDate,
        expected_appointment_date: d.expectedAppointmentDate || "",
        status: d.status,
        required_documents: { ...d.requiredDocuments },
      });
      // If editing, try to source steps from the matching vacant item (if still vacant)
      const vi = vacantItems.find(
        (v) => v.base_item_number === d.baseItemNumber,
      );
      setAvailableSteps(vi?.step_increments ?? []);
    } else {
      setForm({ ...EMPTY_FORM, status: "Open" });
      setAvailableSteps([]);
    }
    setErrors({});
  }, [sourceId, open]);

  if (!open) return <Modal open={false} onClose={onClose} />;

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const setDoc = (key, value) =>
    setForm((f) => ({
      ...f,
      required_documents: { ...f.required_documents, [key]: value },
    }));

  const applyVacantItem = (baseItemNumber) => {
    const vi = vacantItems.find((v) => v.base_item_number === baseItemNumber);
    if (!vi) {
      set("base_item_number", baseItemNumber);
      setAvailableSteps([]);
      return;
    }
    setAvailableSteps(vi.step_increments ?? []);
    setForm((f) => ({
      ...f,
      base_item_number: vi.base_item_number,
      title: vi.title || f.title,
      display_department_id: vi.display_department_id ?? "",
      display_division_id: vi.display_division_id ?? "",
      salary_grade_id: vi.salary_grade_id ?? "",
      step_increment_id: vi.step_increment_id ?? "",
      monthly_salary:
        vi.monthly_salary != null ? String(vi.monthly_salary) : "",
      annual_salary: vi.annual_salary != null ? String(vi.annual_salary) : "",
      immediate_supervisor: vi.immediate_supervisor ?? f.immediate_supervisor,
      status: f.status || "Open",
      vacancies: f.vacancies || String(vi.vacant_count ?? ""),
    }));
  };

  const applyStep = (stepId) => {
    const step = availableSteps.find((s) => String(s.id) === String(stepId));
    setForm((f) => ({
      ...f,
      step_increment_id: stepId,
      monthly_salary: step ? String(step.monthly_salary) : f.monthly_salary,
      annual_salary: step ? String(step.annual_salary) : f.annual_salary,
    }));
  };

  const validate = () => {
    const e = {};
    if (!form.base_item_number?.trim())
      e.base_item_number = "Item number is required.";
    if (!form.title?.trim()) e.title = "Position title is required.";
    if (!form.employment_status)
      e.employment_status = "Employment status is required.";
    if (!form.vacancies || Number(form.vacancies) <= 0)
      e.vacancies = "Vacancies must be greater than zero.";
    if (!form.date_posted) e.date_posted = "Posting date is required.";
    if (!form.closing_date) e.closing_date = "Closing date is required.";
    if (
      form.date_posted &&
      form.closing_date &&
      new Date(form.closing_date) < new Date(form.date_posted)
    )
      e.closing_date = "Closing date cannot be earlier than posting date.";
    if (!form.job_description?.trim())
      e.job_description = "Job description is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };
  const handleSave = async () => {
    if (saving) return;
    if (!validate()) return;
    const payload = {
      ...form,
      display_department_id: form.display_department_id || null,
      display_division_id: form.display_division_id || null,
      salary_grade_id: form.salary_grade_id || null,
      step_increment_id: form.step_increment_id || null,
      monthly_salary: form.monthly_salary || null,
      annual_salary: form.annual_salary || null,
      vacancies: Number(form.vacancies),
      expected_appointment_date: form.expected_appointment_date || null,
    };
    setSaving(true);
    try {
      await onSave(payload, mode);
    } catch {
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => !saving && onClose()}
      widthClass="max-w-3xl"
    >
      <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white px-6 py-4">
        <h2 className="text-base font-semibold text-slate-900">
          {mode === "create" ? "New Posting" : "Edit Posting"}
        </h2>
        <button
          onClick={() => !saving && onClose()}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="space-y-6 px-6 py-5">
        {mode === "create" && (
          <FormSection title="Source Plantilla Item">
            <Label required>Position Title</Label>
            <Select
              value={form.base_item_number}
              onChange={applyVacantItem}
              options={vacantItems.map((v) => ({
                value: v.base_item_number,
                label: v.title,
              }))}
              placeholder="Select a vacant plantilla item"
            />
            <p className="mt-1 text-[11px] text-slate-400">
              Only items with at least one VACANT slot are listed.
            </p>
            <FieldError>{errors.base_item_number}</FieldError>
          </FormSection>
        )}

        <FormSection title="Position Details">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label required>Plantilla Item Number</Label>
              <Input value={form.base_item_number} disabled />
              <FieldError>{errors.title}</FieldError>
            </div>
            <div>
              <Label>Department</Label>
              <Select
                value={String(form.display_department_id || "")}
                onChange={(v) => set("display_department_id", v)}
                options={departments.map((d) => ({
                  value: String(d.id),
                  label: d.name,
                }))}
                placeholder="Auto-filled from plantilla item"
              />
            </div>
            <div>
              <Label>Division</Label>
              <Select
                value={String(form.display_division_id || "")}
                onChange={(v) => set("display_division_id", v)}
                options={divisions.map((d) => ({
                  value: String(d.id),
                  label: d.name,
                }))}
                placeholder="Auto-filled from plantilla item"
              />
            </div>
            <div>
              <Label>Section</Label>
              <Input
                value={form.section}
                onChange={(e) => set("section", e.target.value)}
                placeholder="e.g. Records Section"
              />
            </div>
            <div>
              <Label>Salary Grade</Label>
              <Select
                value={String(form.salary_grade_id || "")}
                onChange={(v) => set("salary_grade_id", v)}
                options={salaryGrades.map((sg) => ({
                  value: String(sg.id),
                  label: `SG-${sg.salary_grade}`,
                }))}
                placeholder="Auto-filled from plantilla item"
              />
            </div>
            <div>
              <Label>Step</Label>
              <Select
                value={String(form.step_increment_id || "")}
                onChange={applyStep}
                options={availableSteps.map((s) => ({
                  value: String(s.id),
                  label: `Step ${s.step}`,
                }))}
                placeholder="Auto-filled from plantilla item"
              />
            </div>
            <div>
              <Label>Monthly Salary</Label>
              <Input
                type="number"
                min="0"
                value={form.monthly_salary}
                disabled
              />
              <p className="mt-1 text-[11px] text-slate-400">
                Computed from Salary Grade + Step.
              </p>
            </div>
            <div>
              <Label>Annual Salary</Label>
              <Input
                type="number"
                min="0"
                value={form.annual_salary}
                disabled
              />
            </div>

            <div>
              <Label required>Status</Label>
              <Select
                value={form.status}
                onChange={(v) => set("status", v)}
                options={["Open", "Closing Soon", "Closed", "Filled"].map(
                  (v) => ({ value: v, label: v }),
                )}
                placeholder="Select status"
              />
            </div>
            <div>
              <Label>Immediate Supervisor</Label>
              <Input
                value={form.immediate_supervisor || ""}
                onChange={(e) => set("immediate_supervisor", e.target.value)}
                placeholder="Auto-filled from department/division head"
              />
            </div>
          </div>
        </FormSection>

        <FormSection title="Qualification Standards">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>Education</Label>
              <Input
                value={form.qualification_education}
                onChange={(e) => set("qualification_education", e.target.value)}
              />
            </div>
            <div>
              <Label>Experience</Label>
              <Input
                value={form.qualification_experience}
                onChange={(e) =>
                  set("qualification_experience", e.target.value)
                }
              />
            </div>
            <div>
              <Label>Training</Label>
              <Input
                value={form.qualification_training}
                onChange={(e) => set("qualification_training", e.target.value)}
              />
            </div>
            <div>
              <Label>Eligibility</Label>
              <Input
                value={form.qualification_eligibility}
                onChange={(e) =>
                  set("qualification_eligibility", e.target.value)
                }
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Competency</Label>
              <Input
                value={form.qualification_competency}
                onChange={(e) =>
                  set("qualification_competency", e.target.value)
                }
              />
            </div>
          </div>
        </FormSection>

        <FormSection title="Timeline">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label required>Posting Date</Label>
              <Input
                type="date"
                value={form.date_posted}
                onChange={(e) => set("date_posted", e.target.value)}
              />
              <FieldError>{errors.date_posted}</FieldError>
            </div>
            <div>
              <Label required>Closing Date</Label>
              <Input
                type="date"
                value={form.closing_date}
                onChange={(e) => set("closing_date", e.target.value)}
              />
              <FieldError>{errors.closing_date}</FieldError>
            </div>
          </div>
        </FormSection>

        <FormSection title="Required Documents Checklist">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {DOC_KEYS.map((d) => (
              <Switch
                key={d.key}
                checked={!!form.required_documents[d.key]}
                onChange={(v) => setDoc(d.key, v)}
                label={d.label}
              />
            ))}
          </div>
        </FormSection>
      </div>
      <div className="sticky bottom-0 flex justify-end gap-2 border-t border-slate-200 bg-white px-6 py-4">
        <Button
          variant="secondary"
          onClick={() => !saving && onClose()}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : mode === "create" ? (
            "Save"
          ) : (
            "Update"
          )}
        </Button>
      </div>
    </Modal>
  );
}

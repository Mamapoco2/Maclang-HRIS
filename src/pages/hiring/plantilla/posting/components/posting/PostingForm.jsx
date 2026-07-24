import React from "react";
import { Input, Label, FieldError, Switch } from "../ui";
import { DOC_KEYS } from "../constants";
import { formatDateSlash } from "./postingHelpers";

function CurrencyInput({ value, onChange, onBlur }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
        {"\u20B1"}
      </span>
      <Input
        type="text"
        inputMode="decimal"
        autoComplete="off"
        placeholder="0.00"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className="pl-7"
      />
    </div>
  );
}

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

function ReadOnlyField({ children }) {
  return (
    <div className="flex h-9 items-center rounded-md border border-input bg-muted px-3 text-sm text-muted-foreground">
      {children ?? "—"}
    </div>
  );
}

export function PostingForm({
  form,
  errors,
  departments,
  divisions,
  salaryGrades,
  stepLabel,
  statusLabel,
  slotNameHelpText,
  onFieldChange,
  onMonthlySalaryChange,
  onAnnualSalaryChange,
  onMonthlySalaryBlur,
  onAnnualSalaryBlur,
  onDocChange,
}) {
  const departmentName =
    departments.find((d) => String(d.id) === String(form.display_department_id))
      ?.name || "—";
  const divisionName =
    divisions.find((d) => String(d.id) === String(form.display_division_id))
      ?.name || "—";
  const salaryGradeLabel = (() => {
    const sg = salaryGrades.find(
      (s) => String(s.id) === String(form.salary_grade_id),
    );
    return sg ? `SG-${sg.salary_grade}` : "—";
  })();

  return (
    <>
      <FormSection title="Position Details">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label required>Plantilla Item Number</Label>
            <ReadOnlyField>{form.base_item_number || "—"}</ReadOnlyField>
          </div>
          <div>
            <Label required>Position Slot Name</Label>
            <div className="flex min-h-9 flex-wrap items-center gap-1.5 rounded-md border border-input bg-muted px-3 py-1.5">
              {form.position_slot_names?.length > 0 ? (
                form.position_slot_names.map((name) => (
                  <span
                    key={name}
                    className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700"
                  >
                    {name}
                  </span>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">—</span>
              )}
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              {slotNameHelpText}
            </p>
            <FieldError>{errors.position_slot_names}</FieldError>
          </div>
          <div>
            <Label>Department</Label>
            <ReadOnlyField>{departmentName}</ReadOnlyField>
          </div>
          <div>
            <Label>Division</Label>
            <ReadOnlyField>{divisionName}</ReadOnlyField>
          </div>
          <div>
            <Label>Section</Label>
            <ReadOnlyField>{form.section || "—"}</ReadOnlyField>
          </div>
          <div>
            <Label>Immediate Supervisor</Label>
            <ReadOnlyField>{form.immediate_supervisor || "—"}</ReadOnlyField>
          </div>
          <div>
            <Label>Salary Grade</Label>
            <ReadOnlyField>{salaryGradeLabel}</ReadOnlyField>
          </div>
          <div>
            <Label>Step</Label>
            <ReadOnlyField>{stepLabel}</ReadOnlyField>
          </div>
          <div>
            <Label>Gross Monthly Compensation</Label>
            <CurrencyInput
              value={form.monthly_salary}
              onChange={onMonthlySalaryChange}
              onBlur={onMonthlySalaryBlur}
            />
            <p className="mt-1 text-[11px] text-slate-400">
              Auto-computed from Salary Grade + Step — override if needed.
            </p>
          </div>
          <div>
            <Label>Annual Salary</Label>
            <CurrencyInput
              value={form.annual_salary}
              onChange={onAnnualSalaryChange}
              onBlur={onAnnualSalaryBlur}
            />
          </div>
          <div>
            <Label required>Status</Label>
            <ReadOnlyField>{statusLabel}</ReadOnlyField>
          </div>
        </div>
      </FormSection>

      <FormSection title="Qualification Standards">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label>Education</Label>
            <Input
              value={form.qualification_education}
              onChange={(e) =>
                onFieldChange("qualification_education", e.target.value)
              }
            />
          </div>
          <div>
            <Label>Experience</Label>
            <Input
              value={form.qualification_experience}
              onChange={(e) =>
                onFieldChange("qualification_experience", e.target.value)
              }
            />
          </div>
          <div>
            <Label>Training</Label>
            <Input
              value={form.qualification_training}
              onChange={(e) =>
                onFieldChange("qualification_training", e.target.value)
              }
            />
          </div>
          <div>
            <Label>Eligibility</Label>
            <Input
              value={form.qualification_eligibility}
              onChange={(e) =>
                onFieldChange("qualification_eligibility", e.target.value)
              }
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Competency</Label>
            <Input
              value={form.qualification_competency}
              onChange={(e) =>
                onFieldChange("qualification_competency", e.target.value)
              }
            />
          </div>
        </div>
      </FormSection>

      <FormSection title="Timeline">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label required>Posting Date</Label>
            <ReadOnlyField>{formatDateSlash(form.date_posted)}</ReadOnlyField>
            <p className="mt-1 text-[11px] text-slate-400">
              Automatically set to today's date — not editable.
            </p>
          </div>
          <div>
            <Label required>Closing Date</Label>
            <ReadOnlyField>{formatDateSlash(form.closing_date)}</ReadOnlyField>
            <p className="mt-1 text-[11px] text-slate-400">
              Automatically set to 9 months after the Posting Date — not
              editable.
            </p>
          </div>
        </div>
      </FormSection>

      <FormSection title="Required Documents Checklist">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {DOC_KEYS.map((d) => (
            <Switch
              key={d.key}
              checked={!!form.required_documents[d.key]}
              onChange={(v) => onDocChange(d.key, v)}
              label={d.label}
            />
          ))}
        </div>
      </FormSection>
    </>
  );
}

import { cn } from "@/lib/utils";
import { FormSection, FieldSelect, NativeSelect } from "../shared/FormField";
import { MultiCombobox, SingleCombobox } from "../shared/Combobox";
import {
  EMPLOYEE_TYPES,
  GENDER_OPTIONS,
  STATUS_OPTIONS,
  POSITION_CLASSIFICATION_OPTIONS,
} from "../../utils/employeeConstants";
import {
  applyEmployeeNumberPrefix,
  employeeNumberNeedsReentry,
} from "../../utils/employeeFormatters";
import { CompensationSection } from "./CompensationSection";
import { PositionDetailsSection } from "./PositionDetailsSection";
import { toast } from "sonner";

export function EmploymentInformationSection({
  formData,
  setFormData,
  handleChange,
  allDivisions,
  departments,
  pendingProvision,
  positions,
  selectedPositionLabel,
  selectedStepLabel,
  handlePositionChange,
  cosPositions,
  consultantPositions,
  handleMonthlySalaryChange,
  handleAnnualSalaryChange,
}) {
  return (
    <FormSection label="Employment information">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
        <FieldSelect label="Position classification" className="sm:col-span-1">
          <MultiCombobox
            value={formData.rolePosition}
            onChange={(v) => handleChange("rolePosition", v)}
            placeholder="Select classification"
            options={POSITION_CLASSIFICATION_OPTIONS}
          />
        </FieldSelect>

        <FieldSelect label="Sex">
          <NativeSelect
            value={formData.gender}
            onChange={(v) => handleChange("gender", v)}
            options={GENDER_OPTIONS}
            placeholder="Select sex"
          />
        </FieldSelect>

        <FieldSelect label="Division">
          <SingleCombobox
            value={formData.division}
            onChange={(v) => handleChange("division", v)}
            placeholder="Select division"
            options={allDivisions.map((d) => ({
              value: String(d.id),
              label: d.name,
            }))}
          />
        </FieldSelect>

        <FieldSelect label="Department">
          <MultiCombobox
            value={formData.department}
            onChange={(v) => handleChange("department", v)}
            placeholder="Select department"
            options={departments.map((d) => ({
              value: String(d.id),
              label: d.name,
            }))}
          />
        </FieldSelect>

        <FieldSelect label="Deployment area">
          <MultiCombobox
            value={formData.designation}
            onChange={(v) => handleChange("designation", v)}
            placeholder="Select area"
            options={departments.map((d) => ({
              value: d.name.toUpperCase(),
              label: d.name.toUpperCase(),
            }))}
          />
        </FieldSelect>

        <FieldSelect label="Status">
          <NativeSelect
            value={formData.status}
            onChange={(v) => handleChange("status", v)}
            options={STATUS_OPTIONS}
            placeholder="Select status"
          />
        </FieldSelect>
      </div>

      {pendingProvision?.pending && (
        <div className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] text-emerald-700 normal-case">
          This employee has a <strong>Completed</strong> application for{" "}
          <strong>{pendingProvision.posting_title}</strong>. The Employee Type
          and Position have been automatically filled in — please review and
          save to proceed with provisioning.
        </div>
      )}

      {/* Employee type pills */}
      <div className="space-y-1 mb-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
          Employee type
        </p>
        <div className="flex gap-2">
          {EMPLOYEE_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() =>
                setFormData((prev) => {
                  if (
                    employeeNumberNeedsReentry(prev.employeeNumber, t.value)
                  ) {
                    toast.info(
                      "Employment type changed — please enter a new Employee No. for this type (numbers aren't shared across Plantilla/COS/Consultant).",
                    );
                    return {
                      ...prev,
                      employeeType: t.value,
                      employeeNumber: applyEmployeeNumberPrefix("", t.value),
                    };
                  }
                  return {
                    ...prev,
                    employeeType: t.value,
                    employeeNumber: applyEmployeeNumberPrefix(
                      prev.employeeNumber,
                      t.value,
                    ),
                  };
                })
              }
              className={cn(
                "flex-1 py-2 px-3 rounded-lg border text-xs font-semibold uppercase tracking-wider transition-all duration-150",
                formData.employeeType === t.value
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-400 border-gray-200 hover:border-gray-400 hover:text-gray-700",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <CompensationSection
        formData={formData}
        setFormData={setFormData}
        handleMonthlySalaryChange={handleMonthlySalaryChange}
        handleAnnualSalaryChange={handleAnnualSalaryChange}
      />

      <PositionDetailsSection
        formData={formData}
        handleChange={handleChange}
        positions={positions}
        selectedPositionLabel={selectedPositionLabel}
        selectedStepLabel={selectedStepLabel}
        handlePositionChange={handlePositionChange}
        cosPositions={cosPositions}
        consultantPositions={consultantPositions}
      />
    </FormSection>
  );
}

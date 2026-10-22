import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { FormSection, FieldSelect, SelectField } from "../shared/FormField";
import { MultiCombobox, SingleCombobox } from "../shared/Combobox";
import {
  EMPLOYEE_TYPES,
  STATUS_OPTIONS,
  POSITION_CLASSIFICATION_OPTIONS,
} from "../../utils/employeeConstants";
import {
  applyEmployeeNumberPrefix,
  employeeNumberNeedsReentry,
} from "../../utils/employeeFormatters";
import { CompensationSection } from "./CompensationSection";
import { PositionDetailsSection } from "./PositionDetailsSection";

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
  const changeEmployeeType = (value) =>
    setFormData((prev) => {
      if (employeeNumberNeedsReentry(prev.employeeNumber, value)) {
        toast.info(
          "Employment type changed — please enter a new Employee No. for this type (numbers aren't shared across Plantilla/COS/Consultant).",
        );
        return {
          ...prev,
          employeeType: value,
          employeeNumber: applyEmployeeNumberPrefix("", value),
        };
      }
      return {
        ...prev,
        employeeType: value,
        employeeNumber: applyEmployeeNumberPrefix(prev.employeeNumber, value),
      };
    });

  return (
    <FormSection
      label="Employment information"
      description="Where this person works and how they are employed."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <FieldSelect label="Position classification">
          <MultiCombobox
            value={formData.rolePosition}
            onChange={(v) => handleChange("rolePosition", v)}
            placeholder="Select classification"
            options={POSITION_CLASSIFICATION_OPTIONS}
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
          <SelectField
            value={formData.status}
            onChange={(v) => handleChange("status", v)}
            options={STATUS_OPTIONS}
            placeholder="Select status"
          />
        </FieldSelect>
      </div>

      {pendingProvision?.pending && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200">
          This employee has a <strong>Completed</strong> application for{" "}
          <strong>{pendingProvision.posting_title}</strong>. The Employee Type
          and Position have been automatically filled in. Please review and
          save to proceed with provisioning.
        </div>
      )}

      {/* Employee type */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground">
          Employee type
        </Label>
        <div
          role="radiogroup"
          aria-label="Employee type"
          className="grid grid-cols-1 gap-2 sm:grid-cols-3"
        >
          {EMPLOYEE_TYPES.map((t) => {
            const selected = formData.employeeType === t.value;
            return (
              <button
                key={t.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => changeEmployeeType(t.value)}
                className={cn(
                  "flex h-10 items-center justify-center rounded-md border px-3 text-sm font-medium outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50",
                  selected
                    ? "border-primary bg-primary text-primary-foreground shadow-xs"
                    : "border-input bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
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
      </div>
    </FormSection>
  );
}

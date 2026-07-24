import { cn } from "@/lib/utils";
import { FieldSelect } from "../shared/FormField";
import { CurrencyInput } from "../shared/CurrencyInput";

export function CompensationSection({
  formData,
  setFormData,
  handleMonthlySalaryChange,
  handleAnnualSalaryChange,
}) {
  const isPlantilla = formData.employeeType === "Plantilla";
  const readOnly = isPlantilla && !formData.salaryOverride;

  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-3 mb-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
          Compensation
        </p>
        {isPlantilla && (
          <label className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-500 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={formData.salaryOverride}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  salaryOverride: e.target.checked,
                }))
              }
              className="w-3.5 h-3.5 rounded border-gray-300"
            />
            Override computed salary
          </label>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FieldSelect label="Gross salary">
          <CurrencyInput
            value={formData.monthlySalary}
            onChange={handleMonthlySalaryChange}
            readOnly={readOnly}
            className={cn(
              "field-input",
              readOnly && "bg-gray-100 text-gray-500 cursor-default",
            )}
          />
        </FieldSelect>

        <FieldSelect label="Annual salary">
          <CurrencyInput
            value={formData.annualSalary}
            onChange={handleAnnualSalaryChange}
            readOnly={readOnly}
            className={cn(
              "field-input",
              readOnly && "bg-gray-100 text-gray-500 cursor-default",
            )}
          />
        </FieldSelect>
      </div>

      {readOnly && (
        <p className="text-[10px] text-gray-400 normal-case">
          Auto-computed from the assigned position's step increment. Check
          "Override computed salary" to enter a custom amount.
        </p>
      )}
    </div>
  );
}

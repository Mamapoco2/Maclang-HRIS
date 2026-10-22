import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FieldSelect, FormPanel } from "../shared/FormField";
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
    <FormPanel
      title="Compensation"
      action={
        isPlantilla && (
          <div className="flex items-center gap-2">
            <Checkbox
              id="salary-override"
              checked={!!formData.salaryOverride}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({
                  ...prev,
                  salaryOverride: checked === true,
                }))
              }
            />
            <Label
              htmlFor="salary-override"
              className="cursor-pointer text-sm font-normal"
            >
              Override computed salary
            </Label>
          </div>
        )
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FieldSelect label="Gross salary (monthly)">
          <CurrencyInput
            value={formData.monthlySalary}
            onChange={handleMonthlySalaryChange}
            readOnly={readOnly}
          />
        </FieldSelect>

        <FieldSelect label="Annual salary">
          <CurrencyInput
            value={formData.annualSalary}
            onChange={handleAnnualSalaryChange}
            readOnly={readOnly}
          />
        </FieldSelect>
      </div>

      {readOnly && (
        <p className="text-sm text-muted-foreground">
          Calculated from the position's step increment. Tick "Override
          computed salary" to enter a custom amount.
        </p>
      )}
    </FormPanel>
  );
}

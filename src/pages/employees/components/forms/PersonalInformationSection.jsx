import { FormSection, FieldSelect, SelectField } from "../shared/FormField";
import { MultiCombobox } from "../shared/Combobox";
import { Input } from "@/components/ui/input";
import {
  PREFIX_OPTIONS,
  SUFFIX_OPTIONS,
  TITLE_OPTIONS,
  EMPLOYEE_TYPE_PREFIXES,
  GENDER_OPTIONS,
} from "../../utils/employeeConstants";
import { stripEmployeeNumberPrefix } from "../../utils/employeeFormatters";

// Names are saved in capitals, so the inputs show capitals as you type.
const NAME_INPUT = "h-9 uppercase placeholder:normal-case";

export function PersonalInformationSection({ formData, handleChange }) {
  const employeeNumberPrefix =
    EMPLOYEE_TYPE_PREFIXES[formData.employeeType] ?? "";
  const employeeNumberSuffix = stripEmployeeNumberPrefix(
    formData.employeeNumber,
  );

  return (
    <FormSection
      label="Employee information"
      description="Basic details used on records and documents."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <FieldSelect label="Employee no.">
          <div className="flex h-9 items-center rounded-md border border-input bg-transparent px-3 text-sm shadow-xs focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 dark:bg-input/30">
            {employeeNumberPrefix && (
              <span className="shrink-0 select-none pr-1 font-medium text-muted-foreground">
                {employeeNumberPrefix}
              </span>
            )}
            <input
              type="text"
              value={employeeNumberSuffix}
              onChange={(e) =>
                handleChange(
                  "employeeNumber",
                  employeeNumberPrefix +
                    stripEmployeeNumberPrefix(e.target.value),
                )
              }
              className="h-full min-w-0 flex-1 border-0 bg-transparent p-0 uppercase outline-none"
            />
          </div>
        </FieldSelect>

        <FieldSelect label="Prefix">
          <SelectField
            value={formData.prefix}
            onChange={(v) => handleChange("prefix", v)}
            options={PREFIX_OPTIONS}
            placeholder="Select prefix"
          />
        </FieldSelect>

        <FieldSelect label="First name">
          <Input
            type="text"
            value={formData.firstName}
            onChange={(e) => handleChange("firstName", e.target.value)}
            className={NAME_INPUT}
          />
        </FieldSelect>

        <FieldSelect label="Middle name">
          <Input
            type="text"
            value={formData.middleName}
            onChange={(e) => handleChange("middleName", e.target.value)}
            className={NAME_INPUT}
          />
        </FieldSelect>

        <FieldSelect label="Last name">
          <Input
            type="text"
            value={formData.lastName}
            onChange={(e) => handleChange("lastName", e.target.value)}
            className={NAME_INPUT}
          />
        </FieldSelect>

        <FieldSelect label="Suffix">
          <SelectField
            value={formData.suffix}
            onChange={(v) => handleChange("suffix", v)}
            options={SUFFIX_OPTIONS}
            placeholder="Select suffix"
          />
        </FieldSelect>

        <FieldSelect label="Sex">
          <SelectField
            value={formData.gender}
            onChange={(v) => handleChange("gender", v)}
            options={GENDER_OPTIONS}
            placeholder="Select sex"
          />
        </FieldSelect>

        <FieldSelect label="Title / profession">
          <MultiCombobox
            value={formData.title}
            onChange={(v) => handleChange("title", v)}
            placeholder="Select titles"
            options={TITLE_OPTIONS}
          />
        </FieldSelect>
      </div>
    </FormSection>
  );
}

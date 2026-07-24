import { FormSection, FieldSelect, NativeSelect } from "../shared/FormField";
import { MultiCombobox } from "../shared/Combobox";
import {
  PREFIX_OPTIONS,
  SUFFIX_OPTIONS,
  TITLE_OPTIONS,
  EMPLOYEE_TYPE_PREFIXES,
} from "../../utils/employeeConstants";
import { stripEmployeeNumberPrefix } from "../../utils/employeeFormatters";

export function PersonalInformationSection({ formData, handleChange }) {
  const employeeNumberPrefix =
    EMPLOYEE_TYPE_PREFIXES[formData.employeeType] ?? "";
  const employeeNumberSuffix = stripEmployeeNumberPrefix(
    formData.employeeNumber,
  );

  return (
    <FormSection label="Employee information">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <FieldSelect label="Employee No." className="sm:col-span-1">
          <div className="field-input">
            {employeeNumberPrefix && (
              <span className="text-black-900 select-none shrink-0">
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
              className="flex-1 min-w-0 h-full bg-transparent outline-none border-0 p-0"
            />
          </div>
        </FieldSelect>

        <FieldSelect label="Prefix">
          <NativeSelect
            value={formData.prefix}
            onChange={(v) => handleChange("prefix", v)}
            options={PREFIX_OPTIONS}
            placeholder="—"
          />
        </FieldSelect>

        <FieldSelect label="First name" className="sm:col-span-1">
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => handleChange("firstName", e.target.value)}
            className="field-input"
          />
        </FieldSelect>

        <FieldSelect label="Middle name" className="sm:col-span-1">
          <input
            type="text"
            value={formData.middleName}
            onChange={(e) => handleChange("middleName", e.target.value)}
            className="field-input"
          />
        </FieldSelect>

        <FieldSelect label="Last name" className="sm:col-span-1">
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => handleChange("lastName", e.target.value)}
            className="field-input"
          />
        </FieldSelect>

        <FieldSelect label="Suffix">
          <NativeSelect
            value={formData.suffix}
            onChange={(v) => handleChange("suffix", v)}
            options={SUFFIX_OPTIONS}
            placeholder="—"
          />
        </FieldSelect>

        <FieldSelect label="Title / profession" className="sm:col-span-2">
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

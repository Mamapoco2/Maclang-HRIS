import { FormSection, FieldSelect, NativeSelect } from "../shared/FormField";
import { MultiCombobox } from "../shared/Combobox";
import {
  PREFIX_OPTIONS,
  SUFFIX_OPTIONS,
  TITLE_OPTIONS,
} from "../../utils/employeeConstants";

/** "Employee information" section: name, prefix/suffix, title/profession. */
export function PersonalInformationSection({ formData, handleChange }) {
  return (
    <FormSection label="Employee information">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <FieldSelect label="Employee No." className="sm:col-span-1">
          <input
            type="text"
            value={formData.employeeNumber}
            onChange={(e) => handleChange("employeeNumber", e.target.value)}
            className="field-input"
          />
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

import { FieldSelect } from "../shared/FormField";
import { SingleCombobox } from "../shared/Combobox";
import { positionLabel } from "../../utils/employeeFormatters";

export function PositionDetailsSection({
  formData,
  handleChange,
  positions,
  selectedPositionLabel,
  selectedStepLabel,
  handlePositionChange,
  cosPositions,
  consultantPositions,
}) {
  if (formData.employeeType === "Plantilla") {
    return (
      <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
          Plantilla position details
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <FieldSelect label="Position slot" className="sm:col-span-2">
            <SingleCombobox
              value={formData.plantillaPositionId}
              displayLabel={selectedPositionLabel}
              onChange={handlePositionChange}
              placeholder="Select position"
              options={
                Array.isArray(positions)
                  ? positions
                      .filter(
                        (pos) =>
                          pos.is_assignable ||
                          pos.is_current_employee ||
                          String(pos.id) ===
                            String(formData.plantillaPositionId),
                      )
                      .map((pos) => ({
                        value: String(pos.id),
                        label: positionLabel(pos),
                        disabled:
                          !pos.is_assignable && !pos.is_current_employee,
                      }))
                  : []
              }
            />
          </FieldSelect>

          <FieldSelect label="Salary grade">
            <div className="field-input flex items-center bg-gray-100 text-gray-500 cursor-default">
              {formData.sgLevel ? `SG ${formData.sgLevel}` : "—"}
            </div>
          </FieldSelect>

          <FieldSelect label="Step increment">
            <div className="field-input flex items-center bg-gray-100 text-gray-500 cursor-default">
              {selectedStepLabel ||
                (!formData.plantillaPositionId
                  ? "Select a position first"
                  : "—")}
            </div>
          </FieldSelect>
        </div>
      </div>
    );
  }

  if (formData.employeeType === "Contract of Service") {
    return (
      <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
          Contract of service position
        </p>
        <FieldSelect label="COS position">
          <SingleCombobox
            value={formData.cosPositionId}
            onChange={(v) => handleChange("cosPositionId", v)}
            placeholder="Select COS position"
            options={
              Array.isArray(cosPositions)
                ? cosPositions.map((p) => ({
                    value: String(p.id),
                    label: p.title.toUpperCase(),
                  }))
                : []
            }
          />
        </FieldSelect>
      </div>
    );
  }

  if (formData.employeeType === "Consultant") {
    return (
      <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
          Consultant position
        </p>
        <FieldSelect label="Consultant position">
          <SingleCombobox
            value={formData.consultantPositionId}
            onChange={(v) => handleChange("consultantPositionId", v)}
            placeholder="Select consultant position"
            options={
              Array.isArray(consultantPositions)
                ? consultantPositions.map((p) => ({
                    value: String(p.id),
                    label: p.title.toUpperCase(),
                  }))
                : []
            }
          />
        </FieldSelect>
      </div>
    );
  }

  return null;
}

import { useEffect, useRef, useState } from "react";
import { Calendar } from "lucide-react";
import { FieldSelect } from "../shared/FormField";
import { SingleCombobox } from "../shared/Combobox";
import { positionLabel } from "../../utils/employeeFormatters";

// --- date helpers -----------------------------------------------------
// `value` in/out of DateField stays in ISO "YYYY-MM-DD" form, same as
// before, so nothing downstream (backend payloads, min/max comparisons)
// needs to change. Only the on-screen representation is MM/DD/YYYY.

function isoToDisplay(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return "";
  return `${m}/${d}/${y}`;
}

// Parses a MM/DD/YYYY string. Returns the ISO string if it's a real,
// valid calendar date, otherwise null.
function displayToIso(display) {
  const match = display.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return null;

  const [, mm, dd, yyyy] = match;
  const month = Number(mm);
  const day = Number(dd);
  const year = Number(yyyy);

  const dateObj = new Date(year, month - 1, day);
  const isRealDate =
    dateObj.getFullYear() === year &&
    dateObj.getMonth() === month - 1 &&
    dateObj.getDate() === day;

  if (!isRealDate) return null;

  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

// Auto-inserts "/" as the user types digits, e.g. "01022026" -> "01/02/2026".
// Always rebuilds from the underlying digits (capped at 8: MM DD YYYY) so
// typing past a slash keeps reformatting correctly instead of just
// appending characters onto whatever's already there.
function autoSlash(raw) {
  const digitsOnly = raw.replace(/\D/g, "").slice(0, 8);
  if (digitsOnly.length === 0) return "";

  const parts = [digitsOnly.slice(0, 2)];
  if (digitsOnly.length > 2) parts.push(digitsOnly.slice(2, 4));
  if (digitsOnly.length > 4) parts.push(digitsOnly.slice(4, 8));

  return parts.join("/");
}

function isoInRange(iso, min, max) {
  if (min && iso < min) return false;
  if (max && iso > max) return false;
  return true;
}

function DateField({ label, value, onChange, min, max }) {
  const [text, setText] = useState(() => isoToDisplay(value));
  const [error, setError] = useState("");
  const hiddenPickerRef = useRef(null);

  // Keep the visible text in sync when the value changes from outside
  // (e.g. the sibling "from"/"to" field adjusting this one, or a reset).
  useEffect(() => {
    setText(isoToDisplay(value));
    setError("");
  }, [value]);

  function commit(rawText) {
    if (rawText.trim() === "") {
      setError("");
      onChange("");
      return;
    }

    const iso = displayToIso(rawText);
    if (!iso) {
      setError("Enter a valid date as MM/DD/YYYY");
      return;
    }

    if (!isoInRange(iso, min, max)) {
      setError(
        min && iso < min
          ? `Date can't be before ${isoToDisplay(min)}`
          : `Date can't be after ${isoToDisplay(max)}`,
      );
      return;
    }

    setError("");
    onChange(iso);
  }

  function handleTextChange(e) {
    const next = autoSlash(e.target.value);
    setText(next);

    // Validate live once it looks complete, so a correct date commits
    // immediately without waiting for blur; otherwise just clear stale errors.
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(next)) {
      commit(next);
    } else if (error) {
      setError("");
    }
  }

  function handleBlur() {
    commit(text);
  }

  function openPicker() {
    const el = hiddenPickerRef.current;
    if (!el) return;
    if (typeof el.showPicker === "function") {
      el.showPicker();
    } else {
      el.click();
    }
  }

  function handlePickerChange(e) {
    const iso = e.target.value;
    setText(isoToDisplay(iso));
    setError("");
    onChange(iso);
  }

  return (
    <FieldSelect label={label}>
      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          placeholder="MM/DD/YYYY"
          value={text}
          onChange={handleTextChange}
          onBlur={handleBlur}
          className={`field-input pr-8 ${error ? "border-red-400 focus:border-red-400" : ""}`}
        />
        <button
          type="button"
          onClick={openPicker}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          aria-label={`Open calendar for ${label}`}
        >
          <Calendar size={14} />
        </button>
        {/* Hidden native date input, used only to render the calendar
            picker UI. Its value stays in sync so opening it always
            starts on the currently entered date. */}
        <input
          ref={hiddenPickerRef}
          type="date"
          value={value || ""}
          min={min || undefined}
          max={max || undefined}
          onChange={handlePickerChange}
          tabIndex={-1}
          aria-hidden="true"
          className="absolute inset-0 h-0 w-0 opacity-0 pointer-events-none"
        />
      </div>
      {error && <p className="mt-1 text-[10px] text-red-500">{error}</p>}
    </FieldSelect>
  );
}

function ContractDatesFields({ formData, handleChange }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
      <DateField
        label="First day of service"
        value={formData.firstDayOfService}
        onChange={(v) => handleChange("firstDayOfService", v)}
      />

      <DateField
        label="Contract period — from"
        value={formData.contractPeriodFrom}
        onChange={(v) => handleChange("contractPeriodFrom", v)}
        max={formData.contractPeriodTo}
      />

      <DateField
        label="Contract period — to"
        value={formData.contractPeriodTo}
        onChange={(v) => handleChange("contractPeriodTo", v)}
        min={formData.contractPeriodFrom}
      />
    </div>
  );
}

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

        <ContractDatesFields formData={formData} handleChange={handleChange} />
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

        <ContractDatesFields formData={formData} handleChange={handleChange} />
      </div>
    );
  }

  return null;
}

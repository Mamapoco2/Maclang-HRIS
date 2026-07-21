import { EMPLOYEE_TYPE_PREFIXES } from "./employeeConstants";

/**
 * Normalizes free-form / legacy employment_type strings coming from the
 * API (e.g. "cos", "Contract Of Service") into the canonical values used
 * throughout the form. Falls back to the raw value (or "Plantilla") if
 * nothing matches, so unexpected backend values never silently disappear.
 */
export const normalizeEmployeeType = (raw) => {
  const map = {
    plantilla: "Plantilla",
    "contract of service": "Contract of Service",
    cos: "Contract of Service",
    consultant: "Consultant",
  };
  return map[(raw ?? "").toLowerCase().trim()] ?? raw ?? "Plantilla";
};

/**
 * Builds the human-readable label for a plantilla position/slot, e.g.
 * "9-1 — Nurse II". Accepts either the raw `positions` list shape
 * (item_number/title) or the normalized shape (position_slot_name/
 * position_title) used elsewhere in the module.
 */
export const positionLabel = (pos) => {
  if (!pos) return "";
  const slot = pos.position_slot_name ?? pos.item_number ?? "";
  const title = pos.position_title ?? pos.title ?? "";
  return slot && title ? `${slot} — ${title}` : slot || title;
};

/** Formats a raw numeric-ish value as a fixed 2-decimal money string. */
export const toMoneyString = (v) => {
  if (v === null || v === undefined || v === "") return "";
  const n = Number(v);
  return Number.isFinite(n) ? n.toFixed(2) : "";
};

/**
 * Swaps the employment-type prefix on an employee number (e.g.
 * "RMBGH-0001" -> "CT-0001" when switching from Plantilla to COS),
 * preserving whatever the user already typed after the prefix. Also used
 * to keep the prefix in sync with the record's employment_type whenever
 * an employee is hydrated (see useEmployeeFormState).
 */
export const applyEmployeeNumberPrefix = (currentValue, type) => {
  const prefix = EMPLOYEE_TYPE_PREFIXES[type] ?? "";
  let base = currentValue ?? "";
  for (const p of Object.values(EMPLOYEE_TYPE_PREFIXES)) {
    if (base.startsWith(p)) {
      base = base.slice(p.length);
      break;
    }
  }
  return prefix + base;
};

/** Joins first/last name for display, with a safe fallback for new records. */
export const getDisplayName = (formData) =>
  [formData.firstName, formData.lastName].filter(Boolean).join(" ") ||
  "New Employee";

/** Builds avatar-fallback initials (e.g. "JD") from first/last name. */
export const getInitials = (formData) =>
  [formData.firstName?.[0] ?? "", formData.lastName?.[0] ?? ""]
    .join("")
    .toUpperCase() || "?";

/** Comma-joins the (possibly multi-select) role/position classification list. */
export const getRoleDisplay = (formData) =>
  (Array.isArray(formData.rolePosition)
    ? formData.rolePosition
    : [formData.rolePosition]
  )
    .filter(Boolean)
    .join(", ") || "No role assigned";

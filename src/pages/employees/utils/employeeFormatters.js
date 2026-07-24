import { EMPLOYEE_TYPE_PREFIXES } from "./employeeConstants";

export const normalizeEmployeeType = (raw) => {
  const map = {
    plantilla: "Plantilla",
    "contract of service": "Contract of Service",
    cos: "Contract of Service",
    consultant: "Consultant",
  };
  return map[(raw ?? "").toLowerCase().trim()] ?? raw ?? "Plantilla";
};

export const positionLabel = (pos) => {
  if (!pos) return "";
  const slot = pos.position_slot_name ?? pos.item_number ?? "";
  const title = pos.position_title ?? pos.title ?? "";
  return slot && title ? `${slot} — ${title}` : slot || title;
};

export const toMoneyString = (v) => {
  if (v === null || v === undefined || v === "") return "";
  const cleaned = typeof v === "string" ? v.replace(/[^0-9.-]/g, "") : v;
  if (cleaned === "") return "";
  const n = Number(cleaned);
  return Number.isFinite(n) ? n.toFixed(2) : "";
};

export const stripEmployeeNumberPrefix = (value) => {
  let base = (value ?? "").trim();
  for (const p of Object.values(EMPLOYEE_TYPE_PREFIXES)) {
    if (base.startsWith(p)) {
      return base.slice(p.length);
    }
  }
  return base;
};

export const employeeNumberHasDigits = (value) =>
  stripEmployeeNumberPrefix(value).length > 0;

export const applyEmployeeNumberPrefix = (currentValue, type) => {
  const prefix = EMPLOYEE_TYPE_PREFIXES[type] ?? "";
  return prefix + stripEmployeeNumberPrefix(currentValue);
};

export const employeeNumberNeedsReentry = (currentValue, type) => {
  const nextPrefix = EMPLOYEE_TYPE_PREFIXES[type] ?? "";
  const base = currentValue ?? "";
  const currentPrefix = Object.values(EMPLOYEE_TYPE_PREFIXES).find((p) =>
    base.startsWith(p),
  );
  return Boolean(currentPrefix) && currentPrefix !== nextPrefix;
};

export const getDisplayName = (formData) =>
  [formData.firstName, formData.lastName].filter(Boolean).join(" ") ||
  "New Employee";

export const getInitials = (formData) =>
  [formData.firstName?.[0] ?? "", formData.lastName?.[0] ?? ""]
    .join("")
    .toUpperCase() || "?";

export const getRoleDisplay = (formData) =>
  (Array.isArray(formData.rolePosition)
    ? formData.rolePosition
    : [formData.rolePosition]
  )
    .filter(Boolean)
    .join(", ") || "No role assigned";

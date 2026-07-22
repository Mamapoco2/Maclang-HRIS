const trim = (v) => (v ? String(v).trim() : "");
const withPeriod = (v) => (v && !v.endsWith(".") ? `${v}.` : v);

/**
 * Formats an assigned employee's display name as:
 *   Prefix. First MiddleInitial. Last Suffix Title
 *
 * - Middle name is reduced to its first character + "." (e.g. "Santos" -> "S.")
 * - Prefix/suffix get a trailing "." only if they don't already have one
 *   (matches the convention already used in EmployeeViewDialog's buildDisplayName)
 * - Any missing/empty field is simply omitted — no dangling spaces
 * - Values are shown exactly as stored (the form already saves them
 *   uppercase), so no case conversion is applied here
 */
export function formatAssignedEmployeeName(employee) {
  if (!employee) return null;

  const prefix = withPeriod(trim(employee.prefix));
  const first = trim(employee.first_name);
  const middleInitial = employee.middle_name
    ? `${trim(employee.middle_name).charAt(0)}.`
    : "";
  const last = trim(employee.last_name);
  const suffix = withPeriod(trim(employee.suffix));

  const titles = Array.isArray(employee.title)
    ? employee.title.filter(Boolean)
    : employee.title
      ? [employee.title]
      : [];

  const parts = [prefix, first, middleInitial, last, suffix, ...titles].filter(
    Boolean,
  );

  return parts.length > 0 ? parts.join(" ") : null;
}

/**
 * Resolves the "Assigned To" display value for a single plantilla position
 * row. Only trusts the position's own status + its (first/active)
 * assignment's employee — never a placeholder — and always falls back to
 * "—" when the slot isn't FILLED or has no employee data, per the
 * "never display placeholder values" / "no employee -> —" requirements.
 *
 * NOTE: the backend key is `active_assignments` (each entry now includes
 * a nested `employee` object with prefix/first_name/middle_name/
 * last_name/suffix/title) — not `assignments`, which was the actual
 * root cause of the name never showing up.
 */
export function getAssignedToDisplay(position) {
  const status = (position?.status ?? "").toUpperCase();
  if (status !== "FILLED") return "—";

  const employee = position?.active_assignments?.[0]?.employee ?? null;
  return formatAssignedEmployeeName(employee) ?? "—";
}

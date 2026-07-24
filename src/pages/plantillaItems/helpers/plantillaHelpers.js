import api from "@/api/api";
import { BASE_POSITION_HEADERS, PAGE_SIZE } from "./constants";

// ─── Item list ──────────────────────────────────────────────────────────────

/** Sorts plantilla items by base_item_number (numeric when possible). */
export function sortItems(items) {
  return [...items].sort((a, b) => {
    const numA = Number(a.base_item_number);
    const numB = Number(b.base_item_number);
    const bothNumeric = !isNaN(numA) && !isNaN(numB);
    if (bothNumeric) return numA - numB;
    return String(a.base_item_number).localeCompare(String(b.base_item_number));
  });
}

/** Filters items by title / item number against a free-text search query. */
export function filterItemsBySearch(items, search) {
  const q = search.trim().toLowerCase();
  if (!q) return items;
  return items.filter(
    (item) =>
      item.title?.toLowerCase().includes(q) ||
      item.base_item_number?.toString().includes(q),
  );
}

/** Aggregates the four stat-card totals (items / filled / vacant / unfilled). */
export function computeItemStats(items) {
  const all = items.flatMap((i) => i.positions ?? []);
  return {
    total_items: items.length,
    filled: all.filter((p) => getStatus(p) === "FILLED").length,
    vacant: all.filter((p) => getStatus(p) === "VACANT").length,
    unfilled: all.filter((p) => getStatus(p) === "UNFILLED").length,
  };
}

/** Normalized status key for a position (falls back to computed_status). */
export function getStatus(position) {
  return (position?.computed_status ?? position?.status ?? "").toUpperCase();
}

// ─── Pagination ─────────────────────────────────────────────────────────────

/**
 * Computes the paginated slice + page metadata for a sorted list. Page is
 * clamped to the valid range so a stale `page` (e.g. after a filter
 * shrinks the list) never produces an out-of-bounds slice.
 */
export function getPagination(sortedItems, page, pageSize = PAGE_SIZE) {
  const totalPages = Math.max(1, Math.ceil(sortedItems.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = sortedItems.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );
  return { totalPages, safePage, paginated };
}

/** Builds the "1 … 4 5 [6] 7 8 … 12" page-number list used by Pagination. */
export function buildPageList(totalPages, safePage) {
  return Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
    .reduce((acc, p, i, arr) => {
      if (i > 0 && p - arr[i - 1] > 1) acc.push("…");
      acc.push(p);
      return acc;
    }, []);
}

// ─── Positions sub-table ────────────────────────────────────────────────────

/** Whether any position in the item has a recorded step increment. */
export function itemHasSteps(positions = []) {
  return positions.some((p) => !!p.step_increment?.step);
}

/** Column headers for the positions sub-table, with/without the Step column. */
export function getPositionHeaders(showStep) {
  if (!showStep) return BASE_POSITION_HEADERS;
  return [
    "Item Number",
    "Position Title",
    "SG",
    "Step",
    "Status",
    "Assigned To",
    "Actions",
  ];
}

/**
 * Finds the most common (salary grade, step) pairing already configured
 * across an item's slots, so "Add Slot" can default new slots to match —
 * returns null when no slot has both fields set yet.
 */
export function resolveInheritedConfig(positions = []) {
  const configured = positions.filter(
    (p) => p.salary_grade_id && p.step_increment_id,
  );
  if (configured.length === 0) return null;

  const freq = new Map();
  for (const p of configured) {
    const key = `${p.salary_grade_id}:${p.step_increment_id}`;
    freq.set(key, (freq.get(key) ?? 0) + 1);
  }
  const topKey = [...freq.entries()].sort((a, b) => b[1] - a[1])[0][0];
  const best = configured.find(
    (p) => `${p.salary_grade_id}:${p.step_increment_id}` === topKey,
  );

  return {
    sg_id: String(best.salary_grade_id),
    step_id: String(best.step_increment_id),
    sg_label: best.salary_grade?.salary_grade
      ? `SG ${best.salary_grade.salary_grade}`
      : null,
    step_label: best.step_increment?.step
      ? `Step ${best.step_increment.step}`
      : null,
    monthly_salary: best.step_increment?.monthly_salary ?? null,
  };
}

// ─── Directorate / Division / Department hierarchy ─────────────────────────

/** Fetches divisions + departments and tags departments with type: "DEPARTMENT". */
export async function fetchAllUnits() {
  const [divRes, deptRes] = await Promise.all([
    api.get("/divisions"),
    api.get("/departments"),
  ]);
  const divData = divRes.data;
  const deptData = deptRes.data;
  const divisions = Array.isArray(divData) ? divData : (divData.data ?? []);
  const departments = (
    Array.isArray(deptData) ? deptData : (deptData.data ?? [])
  ).map((d) => ({ ...d, type: "DEPARTMENT" }));
  return [...divisions, ...departments];
}

export function unitValue(unit) {
  const prefix =
    (unit?.type ?? "").toUpperCase() === "DEPARTMENT"
      ? "department"
      : "division";
  return `${prefix}:${unit.id}`;
}

export function parseDisplayTarget(value) {
  const [type, id] = (value || "").split(":");
  return {
    display_department_id: type === "department" && id ? Number(id) : null,
    display_division_id: type === "division" && id ? Number(id) : null,
  };
}

export function buildDisplayTarget({
  display_department_id,
  display_division_id,
}) {
  if (display_department_id) return `department:${display_department_id}`;
  if (display_division_id) return `division:${display_division_id}`;
  return "";
}

/** Resolves the Directorate/Division a department belongs to, if any. */
export function resolveUnitForDepartment(dept) {
  if (dept?.division) {
    return {
      ...dept.division,
      type: (dept.division.type ?? "DIVISION").toUpperCase(),
    };
  }
  if (dept?.division_id) {
    return { id: dept.division_id, type: "DIVISION" };
  }
  return null;
}

/** Filters a department list down to those belonging to the given unit. */
export function departmentsUnderUnit(departmentUnits, unit) {
  if (!unit) return departmentUnits;
  return departmentUnits.filter(
    (dept) =>
      Number(dept.division_id) === Number(unit.id) ||
      Number(dept.division?.id) === Number(unit.id),
  );
}

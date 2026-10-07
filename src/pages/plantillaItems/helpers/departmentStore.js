// ─────────────────────────────────────────────────────────────────────────────
// Department Database store (FRONT-END ONLY, in-memory)
//
// Scope: used by System Management → Plantilla Positions only. It is NOT the
// department master for other HRIS modules.
//
// Everything the UI needs goes through the functions exported here, so wiring
// the backend later means replacing the bodies of these functions with API
// calls (GET/POST/PATCH on a plantilla-org-units endpoint) — the components
// don't change.
// ─────────────────────────────────────────────────────────────────────────────
import { useSyncExternalStore } from "react";
import { buildDepartmentSeed } from "../data/personnelSchedule";

const seed = buildDepartmentSeed();

let state = {
  divisions: seed.divisions,
  departments: seed.departments,
};
let nextDivId = Math.max(...seed.divisions.map((d) => d.id)) + 1;
let nextDeptId = Math.max(...seed.departments.map((d) => d.id)) + 1;

const listeners = new Set();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const getSnapshot = () => state;

export function useDepartmentDatabase() {
  return useSyncExternalStore(subscribe, getSnapshot);
}

const norm = (s) => s.trim().replace(/\s+/g, " ").toLowerCase();

// ─── Reads ──────────────────────────────────────────────────────────────────
export function getAllUnits() {
  return [...state.divisions, ...state.departments];
}

/** Units offered in the Plantilla Positions dropdowns: Active only. */
export function getActiveUnits() {
  return getAllUnits().filter((u) => u.status === "ACTIVE");
}

// ─── Writes ─────────────────────────────────────────────────────────────────
export function saveDivision({ id, name, type, status }) {
  const clean = name.trim().replace(/\s+/g, " ");
  const dup = state.divisions.some(
    (d) => d.id !== id && norm(d.name) === norm(clean),
  );
  if (dup) return { ok: false, error: "A Directorate / Division with this name already exists." };

  if (id) {
    state = {
      ...state,
      divisions: state.divisions.map((d) =>
        d.id === id ? { ...d, name: clean, type, status } : d,
      ),
      // Deactivating a division also deactivates what sits under it.
      departments:
        status === "INACTIVE"
          ? state.departments.map((d) =>
              d.division_id === id ? { ...d, status: "INACTIVE" } : d,
            )
          : state.departments,
    };
  } else {
    state = {
      ...state,
      divisions: [
        ...state.divisions,
        { id: nextDivId++, name: clean, type, kind: "division", status, linked_count: 0 },
      ],
    };
  }
  emit();
  return { ok: true };
}

export function saveDepartment({ id, name, type, status, division_id }) {
  const clean = name.trim().replace(/\s+/g, " ");
  const dup = state.departments.some(
    (d) =>
      d.id !== id &&
      Number(d.division_id) === Number(division_id) &&
      norm(d.name) === norm(clean),
  );
  if (dup) return { ok: false, error: "This Directorate / Division already has a unit with that name." };

  const parent = state.divisions.find((d) => d.id === Number(division_id));
  if (status === "ACTIVE" && parent?.status === "INACTIVE")
    return { ok: false, error: "The parent Directorate / Division is Inactive. Reactivate it first." };

  if (id) {
    state = {
      ...state,
      departments: state.departments.map((d) =>
        d.id === id ? { ...d, name: clean, type, status, division_id: Number(division_id) } : d,
      ),
    };
  } else {
    state = {
      ...state,
      departments: [
        ...state.departments,
        {
          id: nextDeptId++,
          name: clean,
          type,
          kind: "department",
          division_id: Number(division_id),
          status,
          linked_count: 0,
        },
      ],
    };
  }
  emit();
  return { ok: true };
}

export function setUnitStatus(unit, status) {
  if (unit.kind === "division") {
    return saveDivision({ ...unit, status });
  }
  return saveDepartment({ ...unit, status });
}

/** Hard delete — only allowed when nothing is linked to the unit. */
export function deleteUnit(unit) {
  if (unit.kind === "division") {
    const children = state.departments.filter((d) => d.division_id === unit.id);
    const linked = unit.linked_count + children.reduce((s, d) => s + d.linked_count, 0);
    if (linked > 0 || children.length > 0)
      return { ok: false, error: "This Directorate / Division still has units or linked plantilla records." };
    state = { ...state, divisions: state.divisions.filter((d) => d.id !== unit.id) };
  } else {
    if (unit.linked_count > 0)
      return { ok: false, error: "Linked to plantilla records — mark it Inactive instead." };
    state = { ...state, departments: state.departments.filter((d) => d.id !== unit.id) };
  }
  emit();
  return { ok: true };
}

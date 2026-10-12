import { useEffect, useSyncExternalStore } from "react";
import {
  personnelScheduleService,
  getErrorMessage,
} from "@/services/personnelScheduleService";

let state = {
  divisions: [],
  departments: [],
  lines: [],
  status: "idle",
  error: null,
};
let inflight = null;
const listeners = new Set();

function setState(patch) {
  state = { ...state, ...patch };
  listeners.forEach((fn) => fn());
}

function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

const getSnapshot = () => state;

export function loadDepartmentDatabase({ force = false } = {}) {
  if (inflight) {
    return force
      ? inflight.then(() => loadDepartmentDatabase({ force: true }))
      : inflight;
  }
  if (state.status === "ready" && !force) return Promise.resolve(state);

  if (state.status !== "ready") setState({ status: "loading", error: null });

  inflight = personnelScheduleService
    .getSnapshot()
    .then((data) => {
      setState({
        divisions: data.divisions ?? [],
        departments: data.departments ?? [],
        lines: data.lines ?? [],
        status: "ready",
        error: null,
      });
      return state;
    })
    .catch((err) => {
      setState({
        status: state.status === "ready" ? "ready" : "error",
        error: getErrorMessage(err),
      });
      return state;
    })
    .finally(() => {
      inflight = null;
    });

  return inflight;
}

export function useDepartmentDatabase() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot);

  useEffect(() => {
    loadDepartmentDatabase({ force: true });
  }, []);

  return {
    divisions: snapshot.divisions,
    departments: snapshot.departments,
    lines: snapshot.lines,
    status: snapshot.status,
    error: snapshot.error,
    loading: snapshot.status === "idle" || snapshot.status === "loading",
  };
}

export const getAllUnits = () => [...state.divisions, ...state.departments];

export const getActiveUnits = () =>
  getAllUnits().filter((u) => u.status === "ACTIVE");

async function write(action) {
  try {
    await action();
  } catch (err) {
    return { ok: false, error: getErrorMessage(err) };
  }
  await loadDepartmentDatabase({ force: true });
  return { ok: true };
}

export function saveDivision({ id, name, type, status }) {
  const payload = { name, type, status };
  return write(() =>
    id
      ? personnelScheduleService.updateDivision(id, payload)
      : personnelScheduleService.createDivision(payload),
  );
}

export function saveDepartment({ id, name, type, status, division_id }) {
  const payload = { name, type, status, division_id };
  return write(() =>
    id
      ? personnelScheduleService.updateUnit(id, payload)
      : personnelScheduleService.createUnit(payload),
  );
}

export function setUnitStatus(unit, status) {
  const { id, name, type, division_id } = unit;
  return unit.kind === "division"
    ? saveDivision({ id, name, type, status })
    : saveDepartment({ id, name, type, status, division_id });
}

export function deleteUnit(unit) {
  return write(() =>
    unit.kind === "division"
      ? personnelScheduleService.deleteDivision(unit.id)
      : personnelScheduleService.deleteUnit(unit.id),
  );
}

export function updateLine(lineId, payload) {
  return write(() => personnelScheduleService.updateLine(lineId, payload));
}

function patchSlot(slot) {
  setState({
    lines: state.lines.map((line) =>
      line.id === slot.line_id
        ? { ...line, slots: line.slots.map((s) => (s.id === slot.id ? slot : s)) }
        : line,
    ),
  });
}

export async function assignSlot(slotId, employeeId) {
  try {
    patchSlot(await personnelScheduleService.assign(slotId, employeeId));
    return { ok: true };
  } catch (err) {
    return { ok: false, error: getErrorMessage(err) };
  }
}

export async function clearSlot(slotId) {
  try {
    patchSlot(await personnelScheduleService.unassign(slotId));
    return { ok: true };
  } catch (err) {
    return { ok: false, error: getErrorMessage(err) };
  }
}

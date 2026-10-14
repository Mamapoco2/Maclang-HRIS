const ACTION_LABELS = {
  "dtr.attendance.created": "Added attendance",
  "dtr.attendance.updated": "Edited attendance",
  "dtr.shift.created": "Added shift",
  "dtr.shift.updated": "Edited shift",
  "dtr.shift.deleted": "Deleted shift",
  "dtr.shift.assigned": "Assigned shift",
  "dtr.shift.unassigned": "Removed shift assignment",
  "dtr.schedule.saved": "Saved schedule",
  "dtr.schedule.submitted": "Submitted schedule",
  "dtr.schedule.approved": "Approved schedule",
  "dtr.schedule.returned": "Returned schedule",
  "dtr.schedule.change_off.requested": "Filed change-off",
  "dtr.schedule.change_off.approved": "Approved change-off",
  "dtr.schedule.change_off.rejected": "Rejected change-off",
  "dtr.schedule.scheduler.assigned": "Assigned scheduler",
  "dtr.schedule.scheduler.removed": "Removed scheduler",
  "dtr.face.registered": "Registered face",
  "dtr.face.re_registered": "Re-registered face",
  "dtr.face.deleted": "Removed face registration",
};

export const SCOPE_ACTIONS = {
  attendance: ["dtr.attendance.created", "dtr.attendance.updated"],
  shift: [
    "dtr.shift.created",
    "dtr.shift.updated",
    "dtr.shift.deleted",
    "dtr.shift.assigned",
    "dtr.shift.unassigned",
  ],
  schedule: [
    "dtr.schedule.saved",
    "dtr.schedule.submitted",
    "dtr.schedule.approved",
    "dtr.schedule.returned",
    "dtr.schedule.change_off.requested",
    "dtr.schedule.change_off.approved",
    "dtr.schedule.change_off.rejected",
    "dtr.schedule.scheduler.assigned",
    "dtr.schedule.scheduler.removed",
  ],
};

const FIELD_LABELS = {
  name: "Name",
  start_time: "Start",
  end_time: "End",
  grace_minutes: "Grace (minutes)",
  is_default: "Default shift",
  is_active: "Active",
  department: "Department",
  work_date: "Date",
  time_in: "Time in",
  time_out: "Time out",
  time_out_date: "Time out date",
  shift_id: "Shift ID",
};

const TIME_FIELDS = new Set(["time_in", "time_out", "start_time", "end_time"]);

const WHEN_FORMAT = new Intl.DateTimeFormat("en-PH", {
  timeZone: "Asia/Manila",
  dateStyle: "medium",
  timeStyle: "short",
});

function formatTime12h(value) {
  const match = String(value).match(/^(\d{1,2}):(\d{2})/);
  if (!match) return String(value);

  const hours = Number(match[1]);
  if (hours > 23) return String(value);

  const suffix = hours >= 12 ? "PM" : "AM";
  return `${hours % 12 || 12}:${match[2]} ${suffix}`;
}

function formatValue(field, value) {
  if (value === null || value === undefined || value === "") return "\u2014";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (TIME_FIELDS.has(field)) return formatTime12h(value);
  return String(value);
}

function describeFields(before, after) {
  const fields = Object.keys({ ...before, ...after });
  const label = (field) => FIELD_LABELS[field] ?? field;

  if (before && after) {
    return fields
      .filter((field) => before[field] !== after[field])
      .map((field) => ({
        field: label(field),
        from: formatValue(field, before[field]),
        to: formatValue(field, after[field]),
      }));
  }

  if (after) {
    return fields.map((field) => ({
      field: label(field),
      to: formatValue(field, after[field]),
    }));
  }

  if (before) {
    return fields.map((field) => ({
      field: label(field),
      from: formatValue(field, before[field]),
    }));
  }

  return [];
}

function describeShift(shift) {
  if (!shift) return "no shift";
  return `${shift.name} (${formatTime12h(shift.start_time)} - ${formatTime12h(shift.end_time)})`;
}

function describeChangeOff(action, subject, payload) {
  const who = payload?.employee ?? "an employee";
  const head = `${subject ?? "Department"}: ${who}, ${payload?.work_date ?? "unknown date"}`;
  const shifts = `${describeShift(payload?.from_shift)} to ${describeShift(payload?.to_shift)}`;
  const reason = payload?.reason ? `. Reason: ${payload.reason}` : "";

  if (action === "dtr.schedule.change_off.requested") {
    return `${head}, ${shifts}, filed by ${payload?.requested_by ?? "unknown"}${reason}`;
  }

  if (action === "dtr.schedule.change_off.approved") {
    return `${head}, ${shifts}, filed by ${payload?.requested_by ?? "unknown"}, approved by ${payload?.approved_by ?? "unknown"}${reason}`;
  }

  const remarks = payload?.remarks ? ` - ${payload.remarks}` : "";
  return `${head}, ${shifts}, rejected${remarks}${reason}`;
}

function describeScheduler(action, subject, payload) {
  const who = payload?.employee ?? "An employee";
  const since = payload?.started_at ? ` (since ${payload.started_at})` : "";

  return action === "dtr.schedule.scheduler.assigned"
    ? `${who} is now a scheduler of ${subject ?? "the department"}${since}`
    : `${who} is no longer a scheduler of ${subject ?? "the department"}`;
}

function describeSchedule(action, subject, payload) {
  if (action.startsWith("dtr.schedule.change_off.")) {
    return describeChangeOff(action, subject, payload);
  }

  if (action.startsWith("dtr.schedule.scheduler.")) {
    return describeScheduler(action, subject, payload);
  }

  const where = [subject, payload?.period].filter(Boolean).join(", ");

  if (action === "dtr.schedule.saved") {
    const parts = [
      [payload?.added, "added"],
      [payload?.updated, "changed"],
      [payload?.removed, "removed"],
    ]
      .filter(([n]) => Number(n) > 0)
      .map(([n, label]) => `${n} ${label}`);
    const reverted = payload?.reverted ? " (sent back to draft)" : "";
    return `${where}: ${parts.join(", ") || "no changes"}${reverted}`;
  }

  if (action === "dtr.schedule.approved") {
    const n = Number(payload?.records_updated) || 0;
    return `${where}: approved, ${n} existing DTR record${n === 1 ? "" : "s"} updated`;
  }

  if (action === "dtr.schedule.returned") {
    return `${where}: returned${payload?.remarks ? ` - ${payload.remarks}` : ""}`;
  }

  return `${where}: submitted for approval`;
}

const employees = (count) => `${count} employee${count === 1 ? "" : "s"}`;

export function actionLabel(action) {
  return ACTION_LABELS[action] ?? action;
}

export function actionTone(action) {
  if (
    action.endsWith(".deleted") ||
    action.endsWith(".unassigned") ||
    action.endsWith(".returned") ||
    action.endsWith(".rejected") ||
    action.endsWith(".removed")
  ) {
    return "destructive";
  }
  if (
    action.endsWith(".created") ||
    action.endsWith(".assigned") ||
    action.endsWith(".approved") ||
    action.endsWith(".registered")
  ) {
    return "success";
  }
  return "neutral";
}

export function formatWhen(iso) {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : WHEN_FORMAT.format(date);
}

export function describeLog({ action, subject_label: subject, payload }) {
  const count = Number(payload?.count) || 0;

  if (action === "dtr.shift.assigned") {
    return { text: `${employees(count)} assigned to ${subject ?? "a shift"}` };
  }

  if (action.startsWith("dtr.schedule.")) {
    return { text: describeSchedule(action, subject, payload) };
  }

  if (action === "dtr.shift.unassigned") {
    return { text: `Shift assignment removed for ${employees(count)}` };
  }

  return { changes: describeFields(payload?.before, payload?.after) };
}
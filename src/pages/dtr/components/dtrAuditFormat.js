const ACTION_LABELS = {
  "dtr.attendance.created": "Added attendance",
  "dtr.attendance.updated": "Edited attendance",
  "dtr.shift.created": "Added shift",
  "dtr.shift.updated": "Edited shift",
  "dtr.shift.deleted": "Deleted shift",
  "dtr.shift.assigned": "Assigned shift",
  "dtr.shift.unassigned": "Removed shift assignment",
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
};

const FIELD_LABELS = {
  name: "Name",
  start_time: "Start",
  end_time: "End",
  grace_minutes: "Grace (minutes)",
  is_default: "Default shift",
  is_active: "Active",
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

const employees = (count) => `${count} employee${count === 1 ? "" : "s"}`;

export function actionLabel(action) {
  return ACTION_LABELS[action] ?? action;
}

export function actionTone(action) {
  if (action.endsWith(".deleted") || action.endsWith(".unassigned")) {
    return "destructive";
  }
  if (
    action.endsWith(".created") ||
    action.endsWith(".assigned") ||
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

  if (action === "dtr.shift.unassigned") {
    return { text: `Shift assignment removed for ${employees(count)}` };
  }

  return { changes: describeFields(payload?.before, payload?.after) };
}
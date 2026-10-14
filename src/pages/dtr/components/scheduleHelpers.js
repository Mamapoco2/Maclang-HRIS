const WHEN_FORMAT = new Intl.DateTimeFormat("en-PH", {
  timeZone: "Asia/Manila",
  dateStyle: "medium",
  timeStyle: "short",
});

export function errorMessage(err, fallback) {
  const validation = err?.response?.data?.errors
    ? Object.values(err.response.data.errors)[0]?.[0]
    : null;
  return validation || err?.response?.data?.message || err?.message || fallback;
}

export function formatWhen(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : WHEN_FORMAT.format(date);
}

function formatTime12h(value) {
  const match = String(value).match(/^(\d{1,2}):(\d{2})/);
  if (!match) return String(value);

  const hours = Number(match[1]);
  const suffix = hours >= 12 ? "PM" : "AM";
  return `${hours % 12 || 12}:${match[2]} ${suffix}`;
}

export function formatShift(shift) {
  if (!shift) return "No shift";
  return `${shift.name} (${formatTime12h(shift.start_time)} - ${formatTime12h(shift.end_time)})`;
}

export function initials(name) {
  const parts = String(name ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "?";

  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export function countByStatus(rows, statuses) {
  const counts = Object.fromEntries(statuses.map((status) => [status, 0]));
  (rows ?? []).forEach((row) => {
    if (Object.hasOwn(counts, row?.status)) counts[row.status] += 1;
  });
  return counts;
}

const TODAY_FORMAT = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Manila",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function todayYmd(now = new Date()) {
  return TODAY_FORMAT.format(now);
}

export const DEFAULT_WEEKLY_LIMIT_MINUTES = 2400;

const SHORT_MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function parseUtc(ymd) {
  const [year, month, day] = String(ymd).split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function addDays(ymd, amount) {
  const date = parseUtc(ymd);
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
}

export function mondayIndex(ymd) {
  return (parseUtc(ymd).getUTCDay() + 6) % 7;
}

export function weekStartYmd(ymd) {
  return addDays(ymd, -mondayIndex(ymd));
}

export function groupByWeek(dates) {
  const weeks = [];
  (dates ?? []).forEach((date) => {
    const start = weekStartYmd(date);
    let week = weeks[weeks.length - 1];
    if (!week || week.start !== start) {
      week = { start, days: Array(7).fill(null) };
      weeks.push(week);
    }
    week.days[mondayIndex(date)] = date;
  });
  return weeks;
}

export function weekRangeLabel(weekStart) {
  const end = addDays(weekStart, 6);
  const [, startMonth, startDay] = weekStart.split("-").map(Number);
  const [, endMonth, endDay] = end.split("-").map(Number);
  const start = `${SHORT_MONTH_NAMES[startMonth - 1]} ${startDay}`;
  return startMonth === endMonth
    ? `${start} - ${endDay}`
    : `${start} - ${SHORT_MONTH_NAMES[endMonth - 1]} ${endDay}`;
}

export function formatHoursValue(minutes) {
  return String(Number((minutes / 60).toFixed(2)));
}

export function weekMinutes({ cells, employeeId, weekStart, minutesByShift, external }) {
  let total = external?.[`${employeeId}|${weekStart}`] ?? 0;
  for (let i = 0; i < 7; i += 1) {
    const shiftId = cells[`${employeeId}|${addDays(weekStart, i)}`];
    if (shiftId) total += minutesByShift[shiftId] ?? 0;
  }
  return total;
}

export function checkAssign({ cells, employeeId, date, shiftId, minutesByShift, external, limit }) {
  const weekStart = weekStartYmd(date);
  const current = weekMinutes({ cells, employeeId, weekStart, minutesByShift, external });
  const replaced = cells[`${employeeId}|${date}`];
  const next =
    current -
    (replaced ? (minutesByShift[replaced] ?? 0) : 0) +
    (minutesByShift[shiftId] ?? 0);

  return { ok: next <= limit || next <= current, current, next, weekStart };
}

export function weekTone(minutes, limit) {
  if (minutes > limit) return "over";
  if (minutes === limit) return "full";
  if (minutes >= limit * 0.9) return "near";
  return "ok";
}

const LUNCH_MINUTES = 60;
const LUNCH_THRESHOLD_MINUTES = 480;

function timeToMinutes(time) {
  const match = /^(\d{1,2}):(\d{2})/.exec(String(time ?? ""));
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
}

export function shiftPaidMinutes(shift) {
  if (Number.isFinite(shift?.paid_minutes)) return shift.paid_minutes;

  const from = timeToMinutes(shift?.start_time);
  const to = timeToMinutes(shift?.end_time);
  if (from === null || to === null) return 0;

  const gross = to > from ? to - from : to + 1440 - from;
  return gross > LUNCH_THRESHOLD_MINUTES ? Math.max(0, gross - LUNCH_MINUTES) : gross;
}
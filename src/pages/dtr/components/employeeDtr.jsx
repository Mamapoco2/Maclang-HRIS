import { useCallback, useEffect, useMemo, useState } from "react";
import {
  approveSchedule,
  getSchedule,
  getScheduleDepartments,
  returnSchedule,
  saveSchedule,
  submitSchedule,
} from "@/services/scheduleService";
import { PermissionGate } from "@/components/PermissionGate";
import { PERMISSIONS } from "@/constants/permissions";
import DtrAuditLogSheet from "./DtrAuditLogSheet";
import ShiftsPage from "./shiftsPage";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const BTN_PRIMARY = "bg-blue-600 text-white hover:bg-blue-700";

const SELECT_CLASS =
  "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

const CELL_SELECT_CLASS =
  "h-8 w-[58px] rounded border border-input bg-transparent px-1 text-center text-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50";

const PAGE_SIZE = 10;

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const SHORT_MONTHS = MONTHS.map((m) => m.slice(0, 3));
const WEEKDAY_LETTERS = ["S", "M", "T", "W", "T", "F", "S"];

const STATUS_META = {
  none: {
    label: "Not started",
    className: "border-slate-300 text-slate-600",
  },
  draft: { label: "Draft", className: "border-blue-300 text-blue-700" },
  submitted: {
    label: "For approval",
    className: "border-amber-400 text-amber-700",
  },
  approved: {
    label: "Approved",
    className: "border-emerald-400 text-emerald-700",
  },
  returned: { label: "Returned", className: "border-red-400 text-red-700" },
};

const STATUS_FILTERS = ["none", "draft", "submitted", "approved", "returned"];

const WHEN_FORMAT = new Intl.DateTimeFormat("en-PH", {
  timeZone: "Asia/Manila",
  dateStyle: "medium",
  timeStyle: "short",
});

function defaultCutoff() {
  const now = new Date();
  const target = new Date(
    now.getFullYear(),
    now.getMonth() + (now.getDate() >= 26 ? 1 : 0),
    1,
  );
  return { month: target.getMonth() + 1, year: target.getFullYear() };
}

function errorMessage(err, fallback) {
  const validation = err?.response?.data?.errors
    ? Object.values(err.response.data.errors)[0]?.[0]
    : null;
  return validation || err?.response?.data?.message || err?.message || fallback;
}

function formatWhen(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : WHEN_FORMAT.format(date);
}

function parseYmd(value) {
  const [y, m, d] = String(value).split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function formatYmd(date) {
  return date.toISOString().slice(0, 10);
}

function dateRange(start, end) {
  const days = [];
  const last = parseYmd(end);
  for (let d = parseYmd(start); d <= last; d = new Date(d.getTime() + 864e5)) {
    days.push(formatYmd(d));
  }
  return days;
}

function isWeekend(ymd) {
  const dow = parseYmd(ymd).getUTCDay();
  return dow === 0 || dow === 6;
}

function formatPeriod(period) {
  if (!period?.start || !period?.end) return "";
  const start = parseYmd(period.start);
  const end = parseYmd(period.end);
  return `${SHORT_MONTHS[start.getUTCMonth()]} ${start.getUTCDate()} - ${SHORT_MONTHS[end.getUTCMonth()]} ${end.getUTCDate()}, ${end.getUTCFullYear()}`;
}

function formatTime12h(value) {
  const match = String(value ?? "").match(/^(\d{1,2}):(\d{2})/);
  if (!match) return String(value ?? "");
  const hours = Number(match[1]);
  return `${hours % 12 || 12}:${match[2]} ${hours >= 12 ? "PM" : "AM"}`;
}

function buildShiftCodes(shifts) {
  const used = new Set();
  const codes = new Map();
  shifts.forEach((shift) => {
    let code = shift.name
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word[0].toUpperCase())
      .join("")
      .slice(0, 3);
    if (!code || used.has(code)) code = `${code || "S"}${shift.id}`;
    used.add(code);
    codes.set(shift.id, code);
  });
  return codes;
}

const SHIFT_COLORS = [
  "border-blue-300 bg-blue-50 text-blue-800",
  "border-amber-300 bg-amber-50 text-amber-800",
  "border-emerald-300 bg-emerald-50 text-emerald-800",
  "border-violet-300 bg-violet-50 text-violet-800",
  "border-rose-300 bg-rose-50 text-rose-800",
  "border-cyan-300 bg-cyan-50 text-cyan-800",
];

const DRAG_TYPE = "application/x-dtr-shift";
const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function shiftColor(shifts, shiftId) {
  const index = shifts.findIndex((s) => String(s.id) === String(shiftId));
  return SHIFT_COLORS[Math.max(index, 0) % SHIFT_COLORS.length];
}

const cellKey = (employeeId, date) => `${employeeId}|${date}`;

function cellsFromEntries(entries) {
  const cells = {};
  (entries ?? []).forEach((entry) => {
    cells[cellKey(entry.employee_id, entry.work_date)] = String(entry.shift_id);
  });
  return cells;
}

function serializeCells(cells) {
  return Object.keys(cells)
    .sort()
    .map((key) => `${key}=${cells[key]}`)
    .join(",");
}

function StatusBadge({ status }) {
  const meta = STATUS_META[status] ?? STATUS_META.none;
  return (
    <Badge variant="outline" className={meta.className}>
      {meta.label}
    </Badge>
  );
}

export default function SchedulePage() {
  const initial = useMemo(defaultCutoff, []);
  const [tab, setTab] = useState("schedules");
  const [month, setMonth] = useState(initial.month);
  const [year, setYear] = useState(initial.year);
  const [selected, setSelected] = useState(null);
  const [auditOpen, setAuditOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6 p-4 text-foreground md:p-7">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="mb-1.5 text-2xl font-bold tracking-tight">
            Work schedule
          </h2>
          <p className="max-w-[65ch] text-sm leading-relaxed text-muted-foreground">
            Each department head builds the schedule of their staff per cutoff
            (26th to 25th). Only schedules approved by HR are used by the DTR.
            Dates without an approved schedule use the default shift.
          </p>
        </div>
        <PermissionGate permission={PERMISSIONS.DTR_AUDIT_VIEW}>
          <Button
            type="button"
            variant="outline"
            className="max-md:w-full"
            onClick={() => setAuditOpen(true)}
          >
            Audit log
          </Button>
          <DtrAuditLogSheet
            open={auditOpen}
            onOpenChange={setAuditOpen}
            scope="schedule"
            title="Work schedule audit log"
            description="Who saved, submitted, approved or returned department schedules."
            searchPlaceholder="Department name"
          />
        </PermissionGate>
      </header>

      <PermissionGate permission={PERMISSIONS.DTR_MANAGE}>
        <div role="tablist" className="flex gap-2 border-b">
          {[
            ["schedules", "Schedules"],
            ["shiftTypes", "Shift types"],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={`-mb-px border-b-2 px-4 py-2 text-sm font-semibold ${
                tab === id
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </PermissionGate>

      {tab === "shiftTypes" ? (
        <PermissionGate permission={PERMISSIONS.DTR_MANAGE}>
          <ShiftsPage embedded />
        </PermissionGate>
      ) : selected ? (
        <ScheduleEditor
          department={selected}
          month={month}
          year={year}
          onBack={() => setSelected(null)}
        />
      ) : (
        <DepartmentsView
          month={month}
          year={year}
          onMonthChange={setMonth}
          onYearChange={setYear}
          onOpen={setSelected}
        />
      )}
    </div>
  );
}

function DepartmentsView({ month, year, onMonthChange, onYearChange, onOpen }) {
  const [rows, setRows] = useState([]);
  const [period, setPeriod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    getScheduleDepartments({ month, year })
      .then((result) => {
        if (cancelled) return;
        setRows(result.rows);
        setPeriod(result.period);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error(err);
        setRows([]);
        setError(errorMessage(err, "Failed to load departments"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [month, year]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (statusFilter && row.status !== statusFilter) return false;
      if (!term) return true;
      return (
        row.name?.toLowerCase().includes(term) ||
        row.code?.toLowerCase().includes(term) ||
        row.head?.toLowerCase().includes(term)
      );
    });
  }, [rows, search, statusFilter]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, month, year]);

  const lastPage = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, lastPage);
  const visible = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-full sm:w-44">
          <Label htmlFor="schedule-month">Month</Label>
          <select
            id="schedule-month"
            className={SELECT_CLASS}
            value={month}
            onChange={(e) => onMonthChange(Number(e.target.value))}
          >
            {MONTHS.map((name, i) => (
              <option key={name} value={i + 1}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div className="w-full sm:w-28">
          <Label htmlFor="schedule-year">Year</Label>
          <Input
            id="schedule-year"
            type="number"
            min={2000}
            max={2100}
            value={year}
            onChange={(e) => onYearChange(Number(e.target.value))}
          />
        </div>
        <div className="w-full sm:w-56">
          <Label htmlFor="schedule-status">Status</Label>
          <select
            id="schedule-status"
            className={SELECT_CLASS}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All statuses</option>
            {STATUS_FILTERS.map((status) => (
              <option key={status} value={status}>
                {STATUS_META[status].label}
              </option>
            ))}
          </select>
        </div>
        <div className="w-full sm:w-64">
          <Label htmlFor="schedule-search">Search</Label>
          <Input
            id="schedule-search"
            placeholder="Department or head"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {period && (
          <p className="pb-2 text-sm text-muted-foreground">
            Cutoff:{" "}
            <strong className="text-foreground">{formatPeriod(period)}</strong>
          </p>
        )}
      </div>

      {loading && (
        <div className="py-4 text-muted-foreground">Loading departments…</div>
      )}
      {error && (
        <div
          role="alert"
          className="rounded-md border border-red-300 px-4 py-3 text-sm text-red-600"
        >
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <Table className="min-w-[760px]">
            <TableHeader>
              <TableRow className="border-b-2 border-blue-600 hover:bg-transparent">
                <TableHead className="text-blue-700">Department</TableHead>
                <TableHead className="text-blue-700">Head</TableHead>
                <TableHead className="text-blue-700">Staff</TableHead>
                <TableHead className="text-blue-700">Status</TableHead>
                <TableHead className="text-blue-700">Last update</TableHead>
                <TableHead className="text-right text-blue-700">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((row) => (
                <TableRow key={row.id} className="hover:bg-transparent">
                  <TableCell>
                    <div className="font-semibold">{row.name}</div>
                    {row.code && (
                      <div className="text-xs text-muted-foreground">
                        {row.code}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{row.head}</TableCell>
                  <TableCell className="tabular-nums">
                    {row.staff_count}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={row.status} />
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {formatWhen(row.reviewed_at || row.submitted_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      size="sm"
                      className={BTN_PRIMARY}
                      onClick={() => onOpen({ id: row.id, name: row.name })}
                      aria-label={`Open ${row.name} schedule`}
                    >
                      Open
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {visible.length === 0 && (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={6}>
                    <div className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
                      <strong className="text-base text-foreground">
                        No departments found
                      </strong>
                      <span>
                        Only departments with an assigned head can have a
                        schedule.
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <Pager
            page={currentPage}
            lastPage={lastPage}
            total={filtered.length}
            noun="department"
            onChange={setPage}
          />
        </>
      )}
    </section>
  );
}

function Pager({ page, lastPage, total, noun, onChange }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
      <span>
        {total} {noun}
        {total === 1 ? "" : "s"}
      </span>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
        >
          Previous
        </Button>
        <span className="tabular-nums">
          Page {page} of {lastPage}
        </span>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={page >= lastPage}
          onClick={() => onChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

function ScheduleCalendar({
  data,
  dates,
  cells,
  canEdit,
  shiftCodes,
  setCell,
  fillRow,
}) {
  const [employeeId, setEmployeeId] = useState(null);
  const [search, setSearch] = useState("");
  const [active, setActive] = useState("");
  const [dragOver, setDragOver] = useState(null);

  const shifts = data.shifts;
  const usableShifts = shifts.filter((s) => s.is_active);

  const staff = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return data.staff;
    return data.staff.filter(
      (e) =>
        e.name.toLowerCase().includes(term) ||
        String(e.employee_number ?? "")
          .toLowerCase()
          .includes(term),
    );
  }, [data.staff, search]);

  const counts = useMemo(() => {
    const map = new Map();
    Object.keys(cells).forEach((key) => {
      const id = Number(key.split("|")[0]);
      map.set(id, (map.get(id) ?? 0) + 1);
    });
    return map;
  }, [cells]);

  const employee =
    data.staff.find((e) => e.id === employeeId) ?? staff[0] ?? data.staff[0];

  if (!employee) {
    return (
      <p className="py-10 text-center text-muted-foreground">
        No staff are assigned to this department.
      </p>
    );
  }

  const slots = [...Array(parseYmd(dates[0]).getUTCDay()).fill(null), ...dates];

  const apply = (date) => {
    if (!canEdit || !active) return;
    setCell(employee.id, date, active === "erase" ? "" : active);
  };

  const startDrag = (e, shiftId, from) => {
    e.dataTransfer.setData(
      DRAG_TYPE,
      JSON.stringify({ shiftId, from, employeeId: employee.id }),
    );
    e.dataTransfer.effectAllowed = "copyMove";
  };

  const handleDrop = (e, date) => {
    e.preventDefault();
    setDragOver(null);
    if (!canEdit) return;

    let payload;
    try {
      payload = JSON.parse(e.dataTransfer.getData(DRAG_TYPE));
    } catch {
      return;
    }
    if (!payload || payload.employeeId !== employee.id) return;

    setCell(employee.id, date, String(payload.shiftId));
    if (payload.from && payload.from !== date && !e.altKey) {
      setCell(employee.id, payload.from, "");
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
      <aside className="flex flex-col gap-2">
        <Label htmlFor="calendar-staff-search">Employee</Label>
        <Input
          id="calendar-staff-search"
          placeholder="Search name or number"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <ul className="flex max-h-[520px] flex-col gap-1 overflow-y-auto rounded-md border p-1">
          {staff.map((member) => (
            <li key={member.id}>
              <button
                type="button"
                onClick={() => setEmployeeId(member.id)}
                aria-current={member.id === employee.id}
                className={`flex w-full items-center justify-between gap-2 rounded px-2 py-1.5 text-left text-sm ${
                  member.id === employee.id
                    ? "bg-blue-600 text-white"
                    : "hover:bg-muted"
                }`}
              >
                <span className="min-w-0">
                  <span className="block truncate font-semibold">
                    {member.name}
                  </span>
                  {member.employee_number && (
                    <span className="block text-xs opacity-75">
                      {member.employee_number}
                    </span>
                  )}
                </span>
                <span className="shrink-0 text-xs tabular-nums opacity-80">
                  {counts.get(member.id) ?? 0}d
                </span>
              </button>
            </li>
          ))}
          {staff.length === 0 && (
            <li className="px-2 py-3 text-sm text-muted-foreground">
              No match.
            </li>
          )}
        </ul>
      </aside>

      <div className="flex min-w-0 flex-col gap-3">
        <div>
          <h4 className="text-base font-bold">{employee.name}</h4>
          <p className="text-xs text-muted-foreground">
            {counts.get(employee.id) ?? 0} of {dates.length} days scheduled
          </p>
        </div>

        {canEdit && (
          <div className="flex flex-col gap-2 rounded-md border p-3">
            <div className="flex flex-wrap items-center gap-2">
              {usableShifts.map((shift) => {
                const selected = active === String(shift.id);
                return (
                  <button
                    key={shift.id}
                    type="button"
                    draggable
                    onDragStart={(e) => startDrag(e, shift.id, null)}
                    onClick={() => setActive(selected ? "" : String(shift.id))}
                    aria-pressed={selected}
                    title={`${shift.name} (${formatTime12h(shift.start_time)} - ${formatTime12h(shift.end_time)})`}
                    className={`cursor-grab rounded-md border px-3 py-1.5 text-left text-xs active:cursor-grabbing ${shiftColor(shifts, shift.id)} ${
                      selected ? "ring-2 ring-blue-600" : ""
                    }`}
                  >
                    <span className="block font-semibold">{shift.name}</span>
                    <span className="block opacity-80">
                      {formatTime12h(shift.start_time)} -{" "}
                      {formatTime12h(shift.end_time)}
                    </span>
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setActive(active === "erase" ? "" : "erase")}
                aria-pressed={active === "erase"}
                className={`rounded-md border border-dashed px-3 py-1.5 text-xs ${
                  active === "erase" ? "ring-2 ring-blue-600" : ""
                }`}
              >
                Eraser
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Drag a shift onto a day. Drag a placed shift to move it (hold Alt
              to copy). On touch screens or with the keyboard, pick a shift
              above and then tap the days.
            </p>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={!active || active === "erase"}
                onClick={() => fillRow(employee.id, active, true)}
              >
                Fill weekdays
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={!active || active === "erase"}
                onClick={() => fillRow(employee.id, active, false)}
              >
                Fill all days
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => fillRow(employee.id, "", false)}
              >
                Clear month
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-muted-foreground">
          {WEEKDAY_NAMES.map((name) => (
            <div key={name}>{name}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {slots.map((date, index) => {
            if (date === null) return <div key={`blank-${index}`} />;

            const value = cells[cellKey(employee.id, date)] ?? "";
            const shift = shifts.find((s) => String(s.id) === value);
            const day = Number(date.slice(8));
            const label =
              date === dates[0] || day === 1
                ? `${SHORT_MONTHS[Number(date.slice(5, 7)) - 1]} ${day}`
                : String(day);

            return (
              <div
                key={date}
                role={canEdit ? "button" : undefined}
                tabIndex={canEdit ? 0 : undefined}
                aria-label={canEdit ? `Schedule ${date}` : undefined}
                onClick={() => apply(date)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    apply(date);
                  }
                }}
                onDragOver={(e) => {
                  if (!canEdit) return;
                  e.preventDefault();
                  setDragOver(date);
                }}
                onDragLeave={() => setDragOver(null)}
                onDrop={(e) => handleDrop(e, date)}
                className={`flex min-h-[78px] min-w-0 flex-col gap-1 rounded-md border p-1 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/60 ${
                  isWeekend(date) ? "bg-muted/50" : ""
                } ${dragOver === date ? "ring-2 ring-blue-500" : ""} ${
                  canEdit && active ? "cursor-copy" : ""
                }`}
              >
                <span className="text-[11px] text-muted-foreground">
                  {label}
                </span>
                {shift && (
                  <span
                    draggable={canEdit}
                    onDragStart={(e) => startDrag(e, shift.id, date)}
                    title={`${shift.name} (${formatTime12h(shift.start_time)} - ${formatTime12h(shift.end_time)})`}
                    className={`flex items-start justify-between gap-1 rounded border px-1 py-0.5 ${shiftColor(shifts, shift.id)} ${
                      canEdit ? "cursor-grab active:cursor-grabbing" : ""
                    }`}
                  >
                    <span className="min-w-0 truncate font-semibold">
                      <span className="hidden sm:inline">{shift.name}</span>
                      <span className="sm:hidden">
                        {shiftCodes.get(shift.id)}
                      </span>
                    </span>
                    {canEdit && (
                      <button
                        type="button"
                        aria-label={`Remove shift on ${date}`}
                        className="shrink-0 leading-none opacity-70 hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCell(employee.id, date, "");
                        }}
                      >
                        ×
                      </button>
                    )}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ScheduleEditor({ department, month, year, onBack }) {
  const [data, setData] = useState(null);
  const [cells, setCells] = useState({});
  const [baseline, setBaseline] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [page, setPage] = useState(1);
  const [weekdaysOnly, setWeekdaysOnly] = useState(false);
  const [view, setView] = useState("calendar");
  const [confirm, setConfirm] = useState(null);
  const [returnOpen, setReturnOpen] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [dialogError, setDialogError] = useState("");

  const applyData = useCallback((next) => {
    const nextCells = cellsFromEntries(next.entries);
    setData(next);
    setCells(nextCells);
    setBaseline(serializeCells(nextCells));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    getSchedule({ departmentId: department.id, month, year })
      .then((result) => {
        if (!cancelled) applyData(result);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error(err);
        setError(errorMessage(err, "Failed to load the schedule"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [department.id, month, year, applyData]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  const dates = useMemo(
    () => (data ? dateRange(data.period.start, data.period.end) : []),
    [data],
  );
  const shiftCodes = useMemo(() => buildShiftCodes(data?.shifts ?? []), [data]);
  const dirty = serializeCells(cells) !== baseline;

  const staff = data?.staff ?? [];
  const lastPage = Math.max(1, Math.ceil(staff.length / PAGE_SIZE));
  const currentPage = Math.min(page, lastPage);
  const visibleStaff = staff.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const setCell = (employeeId, date, value) => {
    setCells((prev) => {
      const next = { ...prev };
      const key = cellKey(employeeId, date);
      if (value) next[key] = value;
      else delete next[key];
      return next;
    });
  };

  const fillRow = (employeeId, value, skipWeekends = weekdaysOnly) => {
    setCells((prev) => {
      const next = { ...prev };
      dates.forEach((date) => {
        if (skipWeekends && isWeekend(date)) return;
        const key = cellKey(employeeId, date);
        if (value) next[key] = value;
        else delete next[key];
      });
      return next;
    });
  };

  const run = async (action, successMessage) => {
    setBusy(true);
    setError("");
    setDialogError("");
    try {
      const next = await action();
      applyData(next);
      setNotice(successMessage(next));
      return true;
    } catch (err) {
      console.error(err);
      const message = errorMessage(err, "Something went wrong.");
      setError(message);
      setDialogError(message);
      return false;
    } finally {
      setBusy(false);
    }
  };

  const handleSave = () =>
    run(
      () =>
        saveSchedule({
          departmentId: department.id,
          month,
          year,
          entries: Object.entries(cells).map(([key, shiftId]) => {
            const [employeeId, workDate] = key.split("|");
            return {
              employee_id: Number(employeeId),
              work_date: workDate,
              shift_id: Number(shiftId),
            };
          }),
        }),
      (next) =>
        next.status === "draft" && data?.status === "approved"
          ? "Saved. The schedule is back to draft; submit it again for HR approval."
          : "Schedule saved",
    );

  const handleSubmit = async () => {
    const ok = await run(
      () => submitSchedule(data.schedule.id),
      () => "Schedule submitted for HR approval",
    );
    if (ok) setConfirm(null);
  };

  const handleApprove = async () => {
    const ok = await run(
      () => approveSchedule(data.schedule.id),
      () => "Schedule approved. The DTR will now use these shifts.",
    );
    if (ok) setConfirm(null);
  };

  const handleReturn = async () => {
    if (!remarks.trim()) {
      setDialogError("Tell the department head what needs to change.");
      return;
    }
    const ok = await run(
      () => returnSchedule(data.schedule.id, remarks.trim()),
      () => "Schedule returned to the department head",
    );
    if (ok) {
      setReturnOpen(false);
      setRemarks("");
    }
  };

  if (loading) {
    return <div className="py-4 text-muted-foreground">Loading schedule…</div>;
  }

  if (!data) {
    return (
      <div className="flex flex-col gap-3">
        <div
          role="alert"
          className="rounded-md border border-red-300 px-4 py-3 text-sm text-red-600"
        >
          {error || "The schedule could not be loaded."}
        </div>
        <div>
          <Button type="button" variant="outline" onClick={onBack}>
            Back to departments
          </Button>
        </div>
      </div>
    );
  }

  const canEdit = data.can_edit;
  const status = data.status;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="-ml-3 mb-1"
            onClick={() => {
              if (dirty && !window.confirm("Discard your unsaved changes?")) {
                return;
              }
              onBack();
            }}
          >
            ← Departments
          </Button>
          <h3 className="text-xl font-bold tracking-tight">
            {data.department.name}
          </h3>
          <p className="text-sm text-muted-foreground">
            {formatPeriod(data.period)}
            {data.department.head && <> · Head: {data.department.head}</>}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 max-md:w-full">
          <StatusBadge status={status} />
          {canEdit && (
            <Button
              type="button"
              variant="outline"
              disabled={!dirty || busy}
              onClick={handleSave}
            >
              {busy ? "Saving…" : "Save"}
            </Button>
          )}
          {data.can_submit && (
            <Button
              type="button"
              className={BTN_PRIMARY}
              disabled={dirty || busy}
              title={dirty ? "Save your changes first" : undefined}
              onClick={() => {
                setDialogError("");
                setConfirm("submit");
              }}
            >
              Submit for approval
            </Button>
          )}
          {data.can_review && (
            <>
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={() => {
                  setDialogError("");
                  setRemarks("");
                  setReturnOpen(true);
                }}
              >
                Return
              </Button>
              <Button
                type="button"
                className={BTN_PRIMARY}
                disabled={busy}
                onClick={() => {
                  setDialogError("");
                  setConfirm("approve");
                }}
              >
                Approve
              </Button>
            </>
          )}
        </div>
      </div>

      {notice && (
        <p role="status" className="text-sm font-semibold text-blue-700">
          {notice}
        </p>
      )}
      {error && (
        <div
          role="alert"
          className="rounded-md border border-red-300 px-4 py-3 text-sm text-red-600"
        >
          {error}
        </div>
      )}

      {status === "returned" && data.schedule?.review_remarks && (
        <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          <strong>Returned by {data.schedule.reviewed_by ?? "HR"}:</strong>{" "}
          {data.schedule.review_remarks}
        </div>
      )}
      {status === "submitted" && (
        <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Submitted
          {data.schedule?.submitted_by && <> by {data.schedule.submitted_by}</>}
          {data.schedule?.submitted_at && (
            <> on {formatWhen(data.schedule.submitted_at)}</>
          )}
          . Waiting for HR review; it cannot be edited until it is reviewed.
        </div>
      )}
      {status === "approved" && canEdit && (
        <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          Approved. Editing it sends the schedule back to draft, and the DTR
          uses the default shift for these dates until HR approves it again.
        </div>
      )}

      <div role="group" aria-label="Schedule view" className="flex gap-2">
        {[
          ["calendar", "Calendar"],
          ["grid", "Grid overview"],
        ].map(([id, label]) => (
          <Button
            key={id}
            type="button"
            size="sm"
            variant={view === id ? "default" : "outline"}
            className={view === id ? BTN_PRIMARY : ""}
            aria-pressed={view === id}
            onClick={() => setView(id)}
          >
            {label}
          </Button>
        ))}
      </div>

      {view === "calendar" && (
        <ScheduleCalendar
          data={data}
          dates={dates}
          cells={cells}
          canEdit={canEdit}
          shiftCodes={shiftCodes}
          setCell={setCell}
          fillRow={fillRow}
        />
      )}

      {view === "grid" && (
        <>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
            <span className="font-semibold text-muted-foreground">Legend</span>
            {data.shifts.map((shift) => (
              <span key={shift.id} className="whitespace-nowrap">
                <strong>{shiftCodes.get(shift.id)}</strong> = {shift.name} (
                {formatTime12h(shift.start_time)} -{" "}
                {formatTime12h(shift.end_time)})
                {!shift.is_active && " · inactive"}
              </span>
            ))}
            {canEdit && (
              <label className="ml-auto flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={weekdaysOnly}
                  onChange={(e) => setWeekdaysOnly(e.target.checked)}
                />
                Fill row: weekdays only
              </label>
            )}
          </div>

          <div className="overflow-x-auto rounded-md border">
            <table className="w-max min-w-full border-collapse text-xs">
              <thead>
                <tr>
                  <th className="sticky left-0 z-10 min-w-[210px] border-b-2 border-blue-600 bg-background px-3 py-2 text-left text-blue-700">
                    Employee
                  </th>
                  {canEdit && (
                    <th className="border-b-2 border-blue-600 px-2 py-2 text-left text-blue-700">
                      Fill row
                    </th>
                  )}
                  {dates.map((date) => (
                    <th
                      key={date}
                      className={`border-b-2 border-blue-600 px-1 py-1 text-center ${
                        isWeekend(date) ? "bg-muted/60" : ""
                      }`}
                    >
                      <div>{Number(date.slice(8))}</div>
                      <div className="font-normal text-muted-foreground">
                        {WEEKDAY_LETTERS[parseYmd(date).getUTCDay()]}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleStaff.map((employee) => (
                  <tr key={employee.id} className="border-b">
                    <td className="sticky left-0 z-10 bg-background px-3 py-1.5">
                      <div className="font-semibold">{employee.name}</div>
                      {employee.employee_number && (
                        <div className="text-muted-foreground">
                          {employee.employee_number}
                        </div>
                      )}
                    </td>
                    {canEdit && (
                      <td className="px-2 py-1">
                        <select
                          aria-label={`Fill all days for ${employee.name}`}
                          className={`${CELL_SELECT_CLASS} w-[70px]`}
                          value=""
                          onChange={(e) => {
                            const value = e.target.value;
                            fillRow(
                              employee.id,
                              value === "clear" ? "" : value,
                            );
                          }}
                        >
                          <option value="">Fill…</option>
                          {data.shifts
                            .filter((shift) => shift.is_active)
                            .map((shift) => (
                              <option key={shift.id} value={String(shift.id)}>
                                {shiftCodes.get(shift.id)}
                              </option>
                            ))}
                          <option value="clear">Clear</option>
                        </select>
                      </td>
                    )}
                    {dates.map((date) => {
                      const value = cells[cellKey(employee.id, date)] ?? "";
                      const shift = data.shifts.find(
                        (s) => String(s.id) === value,
                      );

                      return (
                        <td
                          key={date}
                          className={`px-0.5 py-1 text-center ${
                            isWeekend(date) ? "bg-muted/40" : ""
                          }`}
                        >
                          {canEdit ? (
                            <select
                              aria-label={`${employee.name}, ${date}`}
                              title={
                                shift
                                  ? `${shift.name} (${formatTime12h(shift.start_time)} - ${formatTime12h(shift.end_time)})`
                                  : undefined
                              }
                              className={CELL_SELECT_CLASS}
                              value={value}
                              onChange={(e) =>
                                setCell(employee.id, date, e.target.value)
                              }
                            >
                              <option value="">-</option>
                              {data.shifts
                                .filter(
                                  (s) => s.is_active || String(s.id) === value,
                                )
                                .map((s) => (
                                  <option key={s.id} value={String(s.id)}>
                                    {shiftCodes.get(s.id)}
                                  </option>
                                ))}
                            </select>
                          ) : (
                            <span className="font-semibold" title={shift?.name}>
                              {shift ? shiftCodes.get(shift.id) : ""}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {staff.length === 0 && (
                  <tr>
                    <td
                      colSpan={dates.length + 2}
                      className="py-10 text-center text-muted-foreground"
                    >
                      No staff are assigned to this department.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <Pager
            page={currentPage}
            lastPage={lastPage}
            total={staff.length}
            noun="employee"
            onChange={setPage}
          />
        </>
      )}

      <AlertDialog
        open={confirm === "submit"}
        onOpenChange={(open) => {
          if (!open) setConfirm(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit this schedule?</AlertDialogTitle>
            <AlertDialogDescription>
              The {data.department.name} schedule for{" "}
              {formatPeriod(data.period)} goes to HR for approval. You cannot
              edit it while it is waiting for review.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {dialogError && (
            <p role="alert" className="text-sm text-red-600">
              {dialogError}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={busy}
              onClick={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
            >
              Submit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={confirm === "approve"}
        onOpenChange={(open) => {
          if (!open) setConfirm(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve this schedule?</AlertDialogTitle>
            <AlertDialogDescription>
              The DTR will use these shifts for {data.department.name} from{" "}
              {formatPeriod(data.period)}. Existing DTR records on scheduled
              dates are updated to the scheduled shift, so their late and
              undertime are recomputed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {dialogError && (
            <p role="alert" className="text-sm text-red-600">
              {dialogError}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={busy}
              onClick={(e) => {
                e.preventDefault();
                handleApprove();
              }}
            >
              Approve
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={returnOpen}
        onOpenChange={(open) => {
          if (!busy) setReturnOpen(open);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Return to department head</DialogTitle>
            <DialogDescription>
              The head can edit the schedule again and resubmit it.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="schedule-return-remarks">
              What needs to change?
            </Label>
            <textarea
              id="schedule-return-remarks"
              rows={4}
              maxLength={500}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
            {dialogError && (
              <p role="alert" className="text-sm text-red-600">
                {dialogError}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => setReturnOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className={BTN_PRIMARY}
              disabled={busy}
              onClick={handleReturn}
            >
              Return schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
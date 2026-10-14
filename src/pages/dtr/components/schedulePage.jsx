import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
import { AuthContext } from "@/context/authContext";
import DtrAuditLogSheet from "./DtrAuditLogSheet";
import ChangeOffPanel from "./changeOffPanel";
import SchedulersPanel from "./schedulersPanel";
import ShiftsPage from "./shiftsPage";
import {
  DEFAULT_WEEKLY_LIMIT_MINUTES,
  checkAssign,
  countByStatus,
  formatHoursValue,
  groupByWeek,
  initials,
  mondayIndex,
  shiftPaidMinutes,
  todayYmd,
  weekMinutes,
  weekRangeLabel,
  weekTone,
} from "./scheduleHelpers";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDashed,
  Clock,
  Eraser,
  History,
  Info,
  LayoutGrid,
  Loader2,
  Pencil,
  Printer,
  RotateCcw,
  Save,
  Search,
  Send,
  Users,
} from "lucide-react";
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

const CELL_SELECT_CLASS =
  "h-8 w-[92px] rounded border border-input bg-transparent px-1 text-center text-[11px] outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50";

const PAGE_SIZE = 10;

const ORG_WIDE_ROLES = ["superadmin", "super-admin", "hr"];

const SHIFT_TYPE_PERMISSIONS = [
  PERMISSIONS.DTR_MANAGE,
  PERMISSIONS.DTR_SCHEDULE_MANAGE,
];

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
    icon: CircleDashed,
    dot: "bg-slate-400",
    className:
      "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200",
  },
  draft: {
    label: "Draft",
    icon: Pencil,
    dot: "bg-blue-500",
    className:
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-300",
  },
  submitted: {
    label: "For approval",
    icon: Clock,
    dot: "bg-amber-500",
    className:
      "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-300",
  },
  approved: {
    label: "Approved",
    icon: CheckCircle2,
    dot: "bg-emerald-500",
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300",
  },
  returned: {
    label: "Returned",
    icon: RotateCcw,
    dot: "bg-red-500",
    className:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300",
  },
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

function compactTime(value) {
  const match = String(value ?? "").match(/^(\d{1,2}):(\d{2})/);
  if (!match) return "";
  const hours = Number(match[1]);
  const minutes = match[2] === "00" ? "" : `:${match[2]}`;
  return `${hours % 12 || 12}${minutes}${hours >= 12 ? "PM" : "AM"}`;
}

function buildShiftCodes(shifts) {
  const seen = new Map();
  const codes = new Map();
  shifts.forEach((shift) => {
    const base = `${compactTime(shift.start_time)}-${compactTime(shift.end_time)}`;
    const count = (seen.get(base) ?? 0) + 1;
    seen.set(base, count);
    codes.set(shift.id, count > 1 ? `${base} #${count}` : base);
  });
  return codes;
}

function escapeHtml(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );
}

const PRINT_SHIFT_COLORS = [
  { bg: "#dbeafe", text: "#1e40af" },
  { bg: "#fef3c7", text: "#92400e" },
  { bg: "#d1fae5", text: "#065f46" },
  { bg: "#ede9fe", text: "#5b21b6" },
  { bg: "#ffe4e6", text: "#9f1239" },
  { bg: "#cffafe", text: "#155e75" },
];

function shiftIndex(shifts, shiftId) {
  const index = shifts.findIndex((s) => String(s.id) === String(shiftId));
  return Math.max(index, 0) % PRINT_SHIFT_COLORS.length;
}

function printSchedule({ data, dates, cells, shiftCodes }) {
  const midpoint = Math.ceil(dates.length / 2);
  const halves = [dates.slice(0, midpoint), dates.slice(midpoint)].filter(
    (slice) => slice.length > 0,
  );
  const usedShiftIds = new Set();

  const colorClass = (shiftId) => `c${shiftIndex(data.shifts, shiftId)}`;

  const approvedBy =
    data.status === "approved" && data.schedule?.reviewed_by
      ? `<div>Approved by: <strong>${escapeHtml(data.schedule.reviewed_by)}</strong></div>`
      : "";

  const renderHalf = (slice) => {
    const first = slice[0];
    const last = slice[slice.length - 1];

    const header = slice
      .map((date) => {
        const day = Number(date.slice(8));
        const month =
          date === first || day === 1
            ? SHORT_MONTHS[Number(date.slice(5, 7)) - 1]
            : "";
        const weekend = isWeekend(date) ? ' class="we"' : "";
        return `<th${weekend}><span class="m">${month}</span>${day}<br>${WEEKDAY_LETTERS[parseYmd(date).getUTCDay()]}</th>`;
      })
      .join("");

    const rows = data.staff
      .map((employee) => {
        const body = slice
          .map((date) => {
            const shiftId = cells[cellKey(employee.id, date)];
            if (shiftId) usedShiftIds.add(shiftId);
            const code = shiftId ? shiftCodes.get(Number(shiftId)) : "";
            const classes = [
              isWeekend(date) ? "we" : "",
              shiftId ? colorClass(shiftId) : "",
            ]
              .filter(Boolean)
              .join(" ");
            return `<td${classes ? ` class="${classes}"` : ""}>${escapeHtml(code)}</td>`;
          })
          .join("");
        return `<tr><td class="name">${escapeHtml(employee.name)}</td>${body}</tr>`;
      })
      .join("");

    return `<div class="block">
<h2>${escapeHtml(rangeLabel([first, last]))}</h2>
<div class="tablewrap"><table><thead><tr><th>Employee</th>${header}</tr></thead><tbody>${rows}</tbody></table></div>
</div>`;
  };

  const blocks = halves.map(renderHalf).join("");

  const legendItems = data.shifts
    .filter((shift) => usedShiftIds.has(String(shift.id)))
    .map(
      (shift) =>
        `<li><span class="swatch ${colorClass(shift.id)}"></span><strong>${escapeHtml(shiftCodes.get(shift.id))}</strong> = ${escapeHtml(shift.name)} (${escapeHtml(formatTime12h(shift.start_time))} - ${escapeHtml(formatTime12h(shift.end_time))})</li>`,
    )
    .join("");

  const colorStyles = PRINT_SHIFT_COLORS.map(
    (color, i) => `.c${i} { background: ${color.bg}; color: ${color.text}; }`,
  ).join("\n");

  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Work schedule - ${escapeHtml(data.department.name)}</title><style>
@page { size: A4 landscape; margin: 10mm; }
* { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
html, body { margin: 0; }
body { font-family: Arial, Helvetica, sans-serif; color: #000; font-size: 11px; }
h1 { font-size: 16px; margin: 0 0 4px; text-align: center; }
h2 { font-size: 12px; margin: 8px 0 4px; }
.meta { margin-bottom: 2px; line-height: 1.5; }
.page { height: 188mm; overflow: hidden; }
.sheet { height: 100%; display: flex; flex-direction: column; transform-origin: top left; }
.block { flex: 1; min-height: 0; display: flex; flex-direction: column; }
.tablewrap { flex: 1; min-height: 0; }
table { border-collapse: collapse; width: 100%; table-layout: fixed; height: 100%; }
tr { page-break-inside: avoid; }
th, td { border: 1px solid #444; text-align: center; padding: 2px 1px; font-size: 9px; overflow: hidden; }
th { background: #eee; }
th .m { display: block; font-size: 7px; min-height: 8px; }
.we { background: #f1f1f1; }
th:first-child, td.name { width: 150px; text-align: left; padding-left: 4px; font-size: 9.5px; }
td.name small { display: block; color: #555; font-size: 7.5px; }
${colorStyles}
.legend { display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 14px; margin-top: 6px; font-size: 9.5px; }
.legend-title { font-weight: bold; }
.legend ul { list-style: none; padding: 0; margin: 0; display: flex; flex-wrap: wrap; gap: 4px 18px; }
.legend li { display: flex; align-items: center; gap: 4px; }
.swatch { display: inline-block; width: 12px; height: 12px; border: 1px solid #444; }
</style></head><body>
<div class="page"><div class="sheet">
<h1>Work schedule - ${escapeHtml(data.department.name)}</h1>
<div class="meta">
<div>Cutoff: <strong>${escapeHtml(formatPeriod(data.period))}</strong></div>
<div>Department head: <strong>${escapeHtml(data.department.head ?? "")}</strong></div>
${approvedBy}
</div>
${blocks}
<div class="legend"><span class="legend-title">Legend</span>${
    legendItems ? `<ul>${legendItems}</ul>` : "<span>No shifts scheduled</span>"
  }</div>
</div></div>
</body></html>`;

  const frame = document.createElement("iframe");
  frame.style.cssText =
    "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden";
  document.body.appendChild(frame);

  const frameWindow = frame.contentWindow;
  frameWindow.document.open();
  frameWindow.document.write(html);
  frameWindow.document.close();
  frameWindow.onafterprint = () => frame.remove();

  const fitToPage = () => {
    const page = frameWindow.document.querySelector(".page");
    const sheet = page.firstElementChild;
    const needed = sheet.scrollHeight;
    const available = page.clientHeight;
    if (needed <= available) return;
    const scale = (available / needed) * 0.99;
    sheet.style.transform = `scale(${scale})`;
    sheet.style.width = `${100 / scale}%`;
    sheet.style.height = `${100 / scale}%`;
  };

  setTimeout(() => {
    fitToPage();
    frameWindow.focus();
    frameWindow.print();
  }, 150);
}

const SHIFT_COLORS = [
  "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-200",
  "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-200",
  "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200",
  "border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-900 dark:bg-violet-950/50 dark:text-violet-200",
  "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-200",
  "border-cyan-200 bg-cyan-50 text-cyan-800 dark:border-cyan-900 dark:bg-cyan-950/50 dark:text-cyan-200",
];

const SHIFT_DOTS = [
  "bg-blue-500",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-violet-500",
  "bg-rose-500",
  "bg-cyan-500",
];

const DRAG_TYPE = "application/x-dtr-shift";
const WEEKDAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const TONE_STYLES = {
  ok: {
    text: "text-foreground",
    bar: "bg-primary",
    badge: "border-border bg-muted/40 text-foreground",
  },
  near: {
    text: "text-amber-700 dark:text-amber-300",
    bar: "bg-amber-500",
    badge:
      "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-300",
  },
  full: {
    text: "text-emerald-700 dark:text-emerald-300",
    bar: "bg-emerald-500",
    badge:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300",
  },
  over: {
    text: "text-red-700 dark:text-red-300",
    bar: "bg-red-500",
    badge:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300",
  },
};

function shiftColor(shifts, shiftId) {
  return SHIFT_COLORS[shiftIndex(shifts, shiftId)];
}

function shiftDot(shifts, shiftId) {
  return SHIFT_DOTS[shiftIndex(shifts, shiftId)];
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
    <Badge variant="outline" className={cn("gap-1.5 font-medium", meta.className)}>
      <span className={cn("size-1.5 rounded-full", meta.dot)} aria-hidden />
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
  const [shiftsVersion, setShiftsVersion] = useState(0);

  const auth = useContext(AuthContext);
  const isOrgWide = (auth?.user?.roles ?? []).some((role) =>
    ORG_WIDE_ROLES.includes(String(role).toLowerCase()),
  );

  const openDepartment = useCallback((department, locked = false) => {
    setSelected({ ...department, locked });
  }, []);

  const closeDepartment = useCallback(() => {
    setSelected(null);
  }, []);

  const changePeriod = useCallback((nextMonth, nextYear) => {
    setMonth(nextMonth);
    setYear(nextYear);
  }, []);

  return (
    <div className="flex w-full flex-col gap-6 p-4 text-foreground md:p-7">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CalendarDays className="size-5" aria-hidden />
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Work schedule
            </h2>
            <p className="mt-1 max-w-[65ch] text-sm leading-relaxed text-muted-foreground">
              Each department head builds the schedule of their staff per
              cutoff (26th to 25th). Only schedules approved by HR are used by
              the DTR. Dates without an approved schedule use the default
              shift.
            </p>
          </div>
        </div>
        <PermissionGate permission={PERMISSIONS.DTR_AUDIT_VIEW}>
          <Button
            type="button"
            variant="outline"
            className="max-md:w-full"
            onClick={() => setAuditOpen(true)}
          >
            <History aria-hidden />
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

      <PermissionGate anyOf={SHIFT_TYPE_PERMISSIONS}>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="schedules">
              <CalendarDays aria-hidden />
              Schedules
            </TabsTrigger>
            <TabsTrigger value="shiftTypes">
              <Clock aria-hidden />
              Shift types
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </PermissionGate>

      <div className={tab === "schedules" ? "" : "hidden"}>
        {selected ? (
          <ScheduleEditor
            department={selected}
            month={month}
            year={year}
            onBack={selected.locked ? null : closeDepartment}
            onPeriodChange={selected.locked ? changePeriod : null}
            shiftsVersion={shiftsVersion}
          />
        ) : (
          <DepartmentsView
            month={month}
            year={year}
            onPeriodChange={changePeriod}
            onOpen={openDepartment}
            autoOpen={!isOrgWide}
          />
        )}
      </div>

      {tab === "shiftTypes" && (
        <PermissionGate anyOf={SHIFT_TYPE_PERMISSIONS}>
          <ShiftsPage
            embedded
            onChanged={() => setShiftsVersion((v) => v + 1)}
          />
        </PermissionGate>
      )}
    </div>
  );
}

function DepartmentsView({ month, year, onPeriodChange, onOpen, autoOpen }) {
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

  const counts = useMemo(() => countByStatus(rows, STATUS_FILTERS), [rows]);

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

  const ownDepartment = useMemo(() => {
    const own = rows.filter((row) => row.can_edit);
    if (own.length === 1) return own[0];
    if (own.length === 0 && rows.length === 1) return rows[0];
    return null;
  }, [rows]);
  const openOwn = autoOpen && !loading && !error && ownDepartment !== null;

  useEffect(() => {
    if (openOwn) onOpen({ id: ownDepartment.id, name: ownDepartment.name }, true);
  }, [openOwn, ownDepartment, onOpen]);

  if (openOwn) {
    return (
      <div className="flex items-center gap-2 py-4 text-muted-foreground">
        <Loader2 className="size-4 animate-spin" aria-hidden />
        Opening your schedule…
      </div>
    );
  }

  const hasFilters = Boolean(search.trim() || statusFilter);

  return (
    <section className="flex flex-col gap-5">
      {!loading && !error && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {STATUS_FILTERS.map((status) => {
            const meta = STATUS_META[status];
            const Icon = meta.icon;
            const active = statusFilter === status;
            return (
              <button
                key={status}
                type="button"
                aria-pressed={active}
                onClick={() => setStatusFilter(active ? "" : status)}
                className={cn(
                  "flex items-center gap-3 rounded-xl border bg-card p-3 text-left shadow-xs transition-colors outline-none hover:bg-accent/50 focus-visible:ring-[3px] focus-visible:ring-ring/50",
                  active && "border-primary ring-1 ring-primary",
                )}
              >
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-lg border",
                    meta.className,
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block text-xl font-semibold leading-none tabular-nums">
                    {counts[status]}
                  </span>
                  <span className="mt-1 block truncate text-xs text-muted-foreground">
                    {meta.label}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      <Card className="gap-0 overflow-hidden py-0">
        <div className="flex flex-wrap items-center gap-3 border-b p-3 sm:p-4">
          <div className="relative w-full sm:max-w-xs sm:flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              id="schedule-search"
              aria-label="Search departments"
              className="pl-9"
              placeholder="Search department or head"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Select
            value={statusFilter || "all"}
            onValueChange={(value) => setStatusFilter(value === "all" ? "" : value)}
          >
            <SelectTrigger
              id="schedule-status"
              aria-label="Filter by status"
              className="w-full sm:w-48"
            >
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUS_FILTERS.map((status) => (
                <SelectItem key={status} value={status}>
                  {STATUS_META[status].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex flex-wrap items-center gap-3 sm:ml-auto">
            {hasFilters && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("");
                }}
              >
                Clear filters
              </Button>
            )}
            <PeriodStepper month={month} year={year} onChange={onPeriodChange} />
          </div>
        </div>

        {period && (
          <div className="flex items-center gap-2 border-b bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
            <CalendarDays className="size-3.5" aria-hidden />
            Cutoff period
            <strong className="font-semibold text-foreground">
              {formatPeriod(period)}
            </strong>
          </div>
        )}

        {error && (
          <div className="p-4">
            <Alert variant="destructive">
              <AlertTriangle aria-hidden />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        {loading && (
          <div className="flex flex-col gap-3 p-4" aria-busy="true">
            {Array.from({ length: 5 }, (_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        )}

        {!loading && !error && (
          <div className="overflow-x-auto">
            <Table className="min-w-[760px]">
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="pl-4">Department</TableHead>
                  <TableHead>Head</TableHead>
                  <TableHead>Staff</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last update</TableHead>
                  <TableHead className="pr-4 text-right">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((row) => (
                  <TableRow
                    key={row.id}
                    className="cursor-pointer"
                    onClick={() => onOpen({ id: row.id, name: row.name })}
                  >
                    <TableCell className="pl-4">
                      <div className="font-medium">{row.name}</div>
                      {row.code && (
                        <div className="text-xs text-muted-foreground">
                          {row.code}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {row.head ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="size-7">
                            <AvatarFallback className="text-[10px]">
                              {initials(row.head)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{row.head}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 text-sm tabular-nums">
                        <Users
                          className="size-3.5 text-muted-foreground"
                          aria-hidden
                        />
                        {row.staff_count}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={row.status} />
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {formatWhen(row.reviewed_at || row.submitted_at) || "-"}
                    </TableCell>
                    <TableCell className="pr-4 text-right">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpen({ id: row.id, name: row.name });
                        }}
                        aria-label={`Open ${row.name} schedule`}
                      >
                        Open
                        <ArrowRight aria-hidden />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}

                {visible.length === 0 && (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={6}>
                      <div className="flex flex-col items-center gap-2 py-12 text-center">
                        <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                          <Building2 className="size-5" aria-hidden />
                        </span>
                        <strong className="text-base">
                          No departments found
                        </strong>
                        <span className="max-w-sm text-sm text-muted-foreground">
                          {hasFilters
                            ? "Try a different search or clear the filters."
                            : "Only departments with an assigned head can have a schedule."}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="border-t px-4 py-3">
            <Pager
              page={currentPage}
              lastPage={lastPage}
              total={filtered.length}
              noun="department"
              onChange={setPage}
            />
          </div>
        )}
      </Card>
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
          size="icon-sm"
          variant="outline"
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
        >
          <ChevronLeft aria-hidden />
        </Button>
        <span className="tabular-nums">
          Page {page} of {lastPage}
        </span>
        <Button
          type="button"
          size="icon-sm"
          variant="outline"
          aria-label="Next page"
          disabled={page >= lastPage}
          onClick={() => onChange(page + 1)}
        >
          <ChevronRight aria-hidden />
        </Button>
      </div>
    </div>
  );
}

function WeekTotal({ minutes, limit }) {
  const tone = weekTone(minutes, limit);
  const style = TONE_STYLES[tone];
  const percent = Math.min(100, (minutes / Math.max(limit, 1)) * 100);

  return (
    <div
      className="flex min-w-0 flex-col justify-center gap-1 rounded-lg border bg-muted/30 px-2 py-1.5"
      title={`${formatHoursValue(minutes)} of ${formatHoursValue(limit)} hours this week`}
    >
      <span className={cn("text-xs font-semibold tabular-nums", style.text)}>
        {formatHoursValue(minutes)} / {formatHoursValue(limit)} h
      </span>
      <span className="h-1 overflow-hidden rounded-full bg-muted">
        <span
          className={cn("block h-full rounded-full", style.bar)}
          style={{ width: `${percent}%` }}
        />
      </span>
      {tone === "full" && (
        <span className={cn("text-[10px] font-medium", style.text)}>Full</span>
      )}
      {tone === "over" && (
        <span className={cn("text-[10px] font-medium", style.text)}>
          Over limit
        </span>
      )}
    </div>
  );
}

function WeeklyHoursSummary({ staff, dates, cells, weekly }) {
  const weeks = useMemo(() => groupByWeek(dates), [dates]);
  const { minutesByShift, external, limit } = weekly;

  if (staff.length === 0) return null;

  return (
    <Card className="gap-0 overflow-hidden py-0">
      <div className="border-b px-4 py-3">
        <h4 className="text-sm font-semibold">Weekly hours</h4>
        <p className="text-xs text-muted-foreground">
          Monday to Sunday. A week can hold up to {formatHoursValue(limit)}{" "}
          hours; once it is full, no more shifts can be added to it.
        </p>
      </div>
      <div className="max-h-[480px] overflow-auto">
        <Table className="min-w-[640px]">
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="pl-4">Employee</TableHead>
              {weeks.map((week) => (
                <TableHead key={week.start} className="whitespace-nowrap text-center">
                  {weekRangeLabel(week.start)}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="pl-4 font-medium">{member.name}</TableCell>
                {weeks.map((week) => {
                  const minutes = weekMinutes({
                    cells,
                    employeeId: member.id,
                    weekStart: week.start,
                    minutesByShift,
                    external,
                  });
                  const tone = weekTone(minutes, limit);
                  return (
                    <TableCell key={week.start} className="text-center">
                      <span
                        className={cn(
                          "inline-flex min-w-[60px] justify-center rounded-md border px-2 py-0.5 text-xs font-medium tabular-nums",
                          TONE_STYLES[tone].badge,
                        )}
                      >
                        {formatHoursValue(minutes)} h
                      </span>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}

function ScheduleCalendar({
  data,
  dates,
  cells,
  canEdit,
  shiftCodes,
  setCell,
  applyChanges,
  weekly,
  fillRow,
}) {
  const [employeeId, setEmployeeId] = useState(data.viewer_employee_id ?? null);
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

  const weeks = groupByWeek(dates);

  const apply = (date) => {
    if (!canEdit || !active) return;
    applyChanges([
      { employeeId: employee.id, date, value: active === "erase" ? "" : active },
    ]);
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

    const changes = [];
    if (payload.from && payload.from !== date && !e.altKey) {
      changes.push({ employeeId: employee.id, date: payload.from, value: "" });
    }
    changes.push({
      employeeId: employee.id,
      date,
      value: String(payload.shiftId),
    });
    applyChanges(changes);
  };

  const today = todayYmd();
  const { minutesByShift, external, limit } = weekly;
  const scheduledDays = counts.get(employee.id) ?? 0;

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
      <Card className="h-fit gap-0 py-0">
        <div className="relative border-b p-3">
          <Search
            className="pointer-events-none absolute left-6 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            id="calendar-staff-search"
            aria-label="Search employee"
            className="pl-9"
            placeholder="Search name or number"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <ul className="flex max-h-[520px] flex-col gap-1 overflow-y-auto p-2">
          {staff.map((member) => {
            const days = counts.get(member.id) ?? 0;
            const current = member.id === employee.id;
            return (
              <li key={member.id}>
                <button
                  type="button"
                  onClick={() => setEmployeeId(member.id)}
                  aria-current={current}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50",
                    current
                      ? "bg-primary/10 ring-1 ring-primary/30"
                      : "hover:bg-muted",
                  )}
                >
                  <Avatar className="size-8">
                    <AvatarFallback className="text-[11px]">
                      {initials(member.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {member.name}
                    </span>
                    <span className="mt-1 flex items-center gap-2">
                      <span className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
                        <span
                          className="block h-full rounded-full bg-primary"
                          style={{
                            width: `${Math.min(100, (days / Math.max(dates.length, 1)) * 100)}%`,
                          }}
                        />
                      </span>
                      <span className="text-[11px] tabular-nums text-muted-foreground">
                        {days}/{dates.length}
                      </span>
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
          {staff.length === 0 && (
            <li className="px-2 py-6 text-center text-sm text-muted-foreground">
              No employee matches your search.
            </li>
          )}
        </ul>
      </Card>

      <div className="flex min-w-0 flex-col gap-4">
        <div className="flex items-center gap-3">
          <Avatar className="size-10">
            <AvatarFallback>{initials(employee.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h4 className="truncate text-base font-semibold">{employee.name}</h4>
            <p className="text-xs text-muted-foreground">
              {employee.employee_number ? `${employee.employee_number} · ` : ""}
              {scheduledDays} of {dates.length} days scheduled
            </p>
          </div>
        </div>

        {canEdit && (
          <Card className="gap-3 bg-muted/30 py-0 shadow-none">
            <CardContent className="flex flex-col gap-3 p-4">
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
                      className={cn(
                        "flex cursor-grab items-center gap-2 rounded-lg border px-3 py-1.5 text-left text-xs shadow-xs outline-none transition active:cursor-grabbing focus-visible:ring-[3px] focus-visible:ring-ring/50",
                        shiftColor(shifts, shift.id),
                        selected && "ring-2 ring-primary",
                      )}
                    >
                      <span
                        className={cn("size-2 rounded-full", shiftDot(shifts, shift.id))}
                        aria-hidden
                      />
                      <span>
                        <span className="block font-semibold">{shift.name}</span>
                        <span className="block opacity-80">
                          {formatTime12h(shift.start_time)} -{" "}
                          {formatTime12h(shift.end_time)} ·{" "}
                          {formatHoursValue(shiftPaidMinutes(shift))} h
                        </span>
                      </span>
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setActive(active === "erase" ? "" : "erase")}
                  aria-pressed={active === "erase"}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border border-dashed bg-background px-3 py-2 text-xs outline-none transition hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50",
                    active === "erase" && "ring-2 ring-primary",
                  )}
                >
                  <Eraser className="size-3.5" aria-hidden />
                  Eraser
                </button>
              </div>

              <p className="flex items-start gap-2 text-xs text-muted-foreground">
                <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                <span>
                  Drag a shift onto a day, or pick a shift and tap the days.
                  Drag a placed shift to move it (hold Alt to copy).
                </span>
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
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={() => fillRow(employee.id, "", false)}
                >
                  Clear month
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="overflow-x-auto">
          <div className="min-w-[680px]">
            <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>
                Weeks run Monday to Sunday. Maximum{" "}
                <strong className="text-foreground">
                  {formatHoursValue(limit)} h
                </strong>{" "}
                per week.
              </span>
            </div>

            <div className="mb-1.5 grid grid-cols-[repeat(7,minmax(0,1fr))_96px] gap-1.5 text-center text-xs font-medium text-muted-foreground">
              {WEEKDAY_NAMES.map((name) => (
                <div key={name}>{name}</div>
              ))}
              <div>Week total</div>
            </div>

            <div className="flex flex-col gap-1.5">
              {weeks.map((week) => {
                const total = weekMinutes({
                  cells,
                  employeeId: employee.id,
                  weekStart: week.start,
                  minutesByShift,
                  external,
                });

                return (
                  <div
                    key={week.start}
                    className="grid grid-cols-[repeat(7,minmax(0,1fr))_96px] gap-1.5"
                  >
                    {week.days.map((date, index) => {
                      if (date === null) {
                        return <div key={`blank-${week.start}-${index}`} />;
                      }

                      const value = cells[cellKey(employee.id, date)] ?? "";
                      const shift = shifts.find((s) => String(s.id) === value);
                      const day = Number(date.slice(8));
                      const isToday = date === today;
                      const label =
                        date === dates[0] || day === 1
                          ? `${SHORT_MONTHS[Number(date.slice(5, 7)) - 1]} ${day}`
                          : String(day);
                      const blocked =
                        canEdit &&
                        active !== "" &&
                        active !== "erase" &&
                        !checkAssign({
                          cells,
                          employeeId: employee.id,
                          date,
                          shiftId: active,
                          minutesByShift,
                          external,
                          limit,
                        }).ok;

                      return (
                        <div
                          key={date}
                          role={canEdit ? "button" : undefined}
                          tabIndex={canEdit ? 0 : undefined}
                          aria-label={canEdit ? `Schedule ${date}` : undefined}
                          title={blocked ? "Weekly hour limit reached" : undefined}
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
                          className={cn(
                            "flex min-h-[84px] min-w-0 flex-col gap-1 rounded-lg border bg-card p-1.5 text-xs outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/60",
                            isWeekend(date) && "bg-muted/50",
                            canEdit &&
                              active &&
                              !blocked &&
                              "cursor-copy hover:border-primary/50",
                            blocked && "cursor-not-allowed opacity-50",
                            dragOver === date &&
                              "border-primary bg-primary/5 ring-2 ring-primary/40",
                            isToday && "border-primary",
                          )}
                        >
                          <span
                            className={cn(
                              "inline-flex h-5 w-fit min-w-5 items-center justify-center rounded-full px-1 text-[11px]",
                              isToday
                                ? "bg-primary font-semibold text-primary-foreground"
                                : "text-muted-foreground",
                            )}
                          >
                            {label}
                          </span>
                          {shift && (
                            <span
                              draggable={canEdit}
                              onDragStart={(e) => startDrag(e, shift.id, date)}
                              title={`${shift.name} (${formatTime12h(shift.start_time)} - ${formatTime12h(shift.end_time)})`}
                              className={cn(
                                "flex items-start justify-between gap-1 rounded-md border px-1.5 py-1",
                                shiftColor(shifts, shift.id),
                                canEdit && "cursor-grab active:cursor-grabbing",
                              )}
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
                                  className="shrink-0 leading-none opacity-60 hover:opacity-100"
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
                    <WeekTotal minutes={total} limit={limit} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const DAY_FORMAT = new Intl.DateTimeFormat("en-PH", {
  timeZone: "UTC",
  weekday: "short",
  month: "short",
  day: "numeric",
  year: "numeric",
});

const NAMES_PER_SHIFT_IN_CELL = 2;

function DepartmentCalendar({ data, dates, cells, shiftCodes }) {
  const [openDate, setOpenDate] = useState(null);

  const shifts = data.shifts;

  const byDate = useMemo(() => {
    const staffById = new Map(data.staff.map((member) => [member.id, member]));
    const days = new Map();

    Object.entries(cells).forEach(([key, shiftId]) => {
      const [employeeId, date] = key.split("|");
      const member = staffById.get(Number(employeeId));
      if (!member) return;

      if (!days.has(date)) days.set(date, new Map());
      const groups = days.get(date);
      if (!groups.has(shiftId)) groups.set(shiftId, []);
      groups.get(shiftId).push(member);
    });

    days.forEach((groups) =>
      groups.forEach((members) =>
        members.sort((a, b) => a.name.localeCompare(b.name)),
      ),
    );

    return days;
  }, [cells, data.staff]);

  const groupsFor = (date) =>
    shifts
      .map((shift) => ({
        shift,
        members: byDate.get(date)?.get(String(shift.id)) ?? [],
      }))
      .filter((group) => group.members.length > 0);

  if (data.staff.length === 0) {
    return (
      <p className="py-10 text-center text-muted-foreground">
        No staff are assigned to this department.
      </p>
    );
  }

  const slots = [...Array(mondayIndex(dates[0])).fill(null), ...dates];

  const openGroups = openDate ? groupsFor(openDate) : [];
  const scheduledIds = new Set(
    openGroups.flatMap((group) => group.members.map((member) => member.id)),
  );
  const unscheduled = data.staff.filter((member) => !scheduledIds.has(member.id));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
        <span className="font-semibold text-muted-foreground">Shifts</span>
        {shifts.map((shift) => (
          <span
            key={shift.id}
            className={`whitespace-nowrap rounded border px-2 py-0.5 ${shiftColor(shifts, shift.id)}`}
          >
            <strong>{shiftCodes.get(shift.id)}</strong> {shift.name}
          </span>
        ))}
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[760px]">
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-muted-foreground">
            {WEEKDAY_NAMES.map((name) => (
              <div key={name}>{name}</div>
            ))}
          </div>

          <div className="mt-1 grid grid-cols-7 gap-1">
            {slots.map((date, index) => {
              if (date === null) return <div key={`blank-${index}`} />;

              const day = Number(date.slice(8));
              const label =
                date === dates[0] || day === 1
                  ? `${SHORT_MONTHS[Number(date.slice(5, 7)) - 1]} ${day}`
                  : String(day);
              const groups = groupsFor(date);

              return (
                <button
                  key={date}
                  type="button"
                  aria-label={`View the schedule of ${DAY_FORMAT.format(parseYmd(date))}`}
                  onClick={() => setOpenDate(date)}
                  className={`flex min-h-[96px] min-w-0 flex-col gap-1 rounded-md border p-1 text-left text-xs outline-none hover:border-blue-400 focus-visible:ring-2 focus-visible:ring-ring/60 ${
                    isWeekend(date) ? "bg-muted/50" : ""
                  }`}
                >
                  <span className="text-[11px] text-muted-foreground">
                    {label}
                  </span>
                  {groups.map(({ shift, members }) => (
                    <span
                      key={shift.id}
                      className={`flex min-w-0 flex-col rounded border px-1 py-0.5 ${shiftColor(shifts, shift.id)}`}
                    >
                      <span className="flex justify-between gap-1 font-semibold">
                        <span className="truncate">
                          {shiftCodes.get(shift.id)}
                        </span>
                        <span className="tabular-nums">{members.length}</span>
                      </span>
                      {members.slice(0, NAMES_PER_SHIFT_IN_CELL).map((member) => (
                        <span
                          key={member.id}
                          className="truncate text-[10px] opacity-90"
                        >
                          {member.name}
                        </span>
                      ))}
                      {members.length > NAMES_PER_SHIFT_IN_CELL && (
                        <span className="text-[10px] opacity-75">
                          +{members.length - NAMES_PER_SHIFT_IN_CELL} more
                        </span>
                      )}
                    </span>
                  ))}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <Dialog
        open={openDate !== null}
        onOpenChange={(open) => {
          if (!open) setOpenDate(null);
        }}
      >
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {openDate ? DAY_FORMAT.format(parseYmd(openDate)) : ""}
            </DialogTitle>
            <DialogDescription>{data.department.name}</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            {openGroups.map(({ shift, members }) => (
              <section key={shift.id}>
                <h4 className="text-sm font-semibold">
                  {shift.name}{" "}
                  <span className="font-normal text-muted-foreground">
                    ({formatTime12h(shift.start_time)} -{" "}
                    {formatTime12h(shift.end_time)}) · {members.length}
                  </span>
                </h4>
                <ul className="mt-1 text-sm">
                  {members.map((member) => (
                    <li key={member.id}>
                      {member.name}
                      {member.employee_number && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          {member.employee_number}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            ))}

            {openGroups.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No one is scheduled on this date.
              </p>
            )}

            {openGroups.length > 0 && unscheduled.length > 0 && (
              <section>
                <h4 className="text-sm font-semibold text-muted-foreground">
                  Not scheduled · {unscheduled.length}
                </h4>
                <ul className="mt-1 text-sm text-muted-foreground">
                  {unscheduled.map((member) => (
                    <li key={member.id}>{member.name}</li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function rangeLabel(dates) {
  const label = (ymd) =>
    `${SHORT_MONTHS[Number(ymd.slice(5, 7)) - 1]} ${Number(ymd.slice(8))}`;
  return `${label(dates[0])} - ${label(dates[dates.length - 1])}`;
}

function ScheduleGridTable({
  dates,
  showFill,
  staff,
  hasStaff,
  shifts,
  cells,
  canEdit,
  shiftCodes,
  setCell,
  fillRow,
}) {
  return (
    <div className="flex flex-col gap-1">
      <h4 className="text-sm font-semibold text-blue-700">
        {rangeLabel(dates)}
      </h4>
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              <th className="min-w-[190px] border-b-2 border-blue-600 bg-background px-3 py-2 text-left text-blue-700">
                Employee
              </th>
              {showFill && (
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
            {staff.map((employee) => (
              <tr key={employee.id} className="border-b">
                <td className="bg-background px-3 py-1.5">
                  <div className="font-semibold">{employee.name}</div>
                  {employee.employee_number && (
                    <div className="text-muted-foreground">
                      {employee.employee_number}
                    </div>
                  )}
                </td>
                {showFill && (
                  <td className="px-2 py-1">
                    <select
                      aria-label={`Fill all days for ${employee.name}`}
                      className={CELL_SELECT_CLASS}
                      value=""
                      onChange={(e) => {
                        const value = e.target.value;
                        fillRow(employee.id, value === "clear" ? "" : value);
                      }}
                    >
                      <option value="">Fill…</option>
                      {shifts
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
                  const shift = shifts.find((s) => String(s.id) === value);

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
                          {shifts
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

            {!hasStaff && (
              <tr>
                <td
                  colSpan={dates.length + (showFill ? 2 : 1)}
                  className="py-10 text-center text-muted-foreground"
                >
                  No staff are assigned to this department.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PeriodStepper({ month, year, onChange }) {
  const step = (delta) => {
    const index = year * 12 + (month - 1) + delta;
    const nextYear = Math.floor(index / 12);
    if (nextYear < 2000 || nextYear > 2100) return;
    onChange((index % 12) + 1, nextYear);
  };

  return (
    <div className="flex items-center gap-1 rounded-lg border bg-background p-0.5 shadow-xs">
      <Button
        type="button"
        size="icon-sm"
        variant="ghost"
        aria-label="Previous cutoff"
        onClick={() => step(-1)}
      >
        <ChevronLeft aria-hidden />
      </Button>
      <span
        className="min-w-[132px] text-center text-sm font-medium"
        aria-live="polite"
      >
        {MONTHS[month - 1]} {year}
      </span>
      <Button
        type="button"
        size="icon-sm"
        variant="ghost"
        aria-label="Next cutoff"
        onClick={() => step(1)}
      >
        <ChevronRight aria-hidden />
      </Button>
    </div>
  );
}

function ScheduleEditor({
  department,
  month,
  year,
  onBack,
  onPeriodChange,
  shiftsVersion,
}) {
  const [data, setData] = useState(null);
  const [cells, setCells] = useState({});
  const [baseline, setBaseline] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [page, setPage] = useState(1);
  const [weekdaysOnly, setWeekdaysOnly] = useState(false);
  const [view, setView] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [returnOpen, setReturnOpen] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [dialogError, setDialogError] = useState("");
  const [discardAction, setDiscardAction] = useState(null);

  const applyData = useCallback((next) => {
    const nextCells = cellsFromEntries(next.entries);
    setData(next);
    setCells(nextCells);
    setBaseline(serializeCells(nextCells));
    const viewerIsStaff = (next.staff ?? []).some(
      (member) => member.id === next.viewer_employee_id,
    );
    setView((current) => current ?? (next.can_edit || viewerIsStaff ? "calendar" : "department"));
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

  const reloadSchedule = useCallback(async () => {
    try {
      applyData(await getSchedule({ departmentId: department.id, month, year }));
    } catch (err) {
      console.error(err);
      setError(errorMessage(err, "Failed to refresh the schedule"));
    }
  }, [applyData, department.id, month, year]);

  const seenShiftsVersion = useRef(shiftsVersion);

  useEffect(() => {
    if (seenShiftsVersion.current === shiftsVersion) return;
    seenShiftsVersion.current = shiftsVersion;

    let cancelled = false;
    getSchedule({ departmentId: department.id, month, year })
      .then((fresh) => {
        if (cancelled) return;
        setData((prev) => (prev ? { ...prev, shifts: fresh.shifts } : prev));
      })
      .catch((err) => console.error(err));

    return () => {
      cancelled = true;
    };
  }, [shiftsVersion, department.id, month, year]);

  useEffect(() => {
    if (!notice) return;
    toast.success(notice);
    setNotice("");
  }, [notice]);

  const dates = useMemo(
    () => (data ? dateRange(data.period.start, data.period.end) : []),
    [data],
  );
  const shiftCodes = useMemo(() => buildShiftCodes(data?.shifts ?? []), [data]);
  const weekly = useMemo(
    () => ({
      minutesByShift: Object.fromEntries(
        (data?.shifts ?? []).map((s) => [String(s.id), shiftPaidMinutes(s)]),
      ),
      external: data?.external_week_minutes ?? {},
      limit: data?.weekly_limit_minutes ?? DEFAULT_WEEKLY_LIMIT_MINUTES,
    }),
    [data],
  );
  const dirty = serializeCells(cells) !== baseline;

  const guard = (action) => {
    if (dirty) setDiscardAction(() => action);
    else action();
  };

  const midpoint = Math.ceil(dates.length / 2);
  const halves = [dates.slice(0, midpoint), dates.slice(midpoint)];

  const staff = data?.staff ?? [];
  const lastPage = Math.max(1, Math.ceil(staff.length / PAGE_SIZE));
  const currentPage = Math.min(page, lastPage);
  const visibleStaff = staff.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const reportLimit = (employeeId, check) => {
    const name =
      data?.staff.find((member) => member.id === employeeId)?.name ??
      "This employee";
    toast.error("Weekly limit reached", {
      description: `${name} would have ${formatHoursValue(check.next)} h in the week of ${weekRangeLabel(check.weekStart)}. The maximum is ${formatHoursValue(weekly.limit)} h per week.`,
    });
  };

  // Applies several edits as one step. If any added shift would push a week
  // over the limit, nothing changes (a move never half-applies).
  const applyChanges = (changes) => {
    const next = { ...cells };

    for (const { employeeId, date, value } of changes) {
      const key = cellKey(employeeId, date);

      if (!value) {
        delete next[key];
        continue;
      }

      const check = checkAssign({
        cells: next,
        employeeId,
        date,
        shiftId: value,
        ...weekly,
      });

      if (!check.ok) {
        reportLimit(employeeId, check);
        return false;
      }

      next[key] = value;
    }

    setCells(next);
    return true;
  };

  const setCell = (employeeId, date, value) =>
    applyChanges([{ employeeId, date, value }]);

  const fillRow = (employeeId, value, skipWeekends = weekdaysOnly) => {
    const next = { ...cells };
    let skipped = 0;

    dates.forEach((date) => {
      if (skipWeekends && isWeekend(date)) return;

      const key = cellKey(employeeId, date);

      if (!value) {
        delete next[key];
        return;
      }

      const check = checkAssign({
        cells: next,
        employeeId,
        date,
        shiftId: value,
        ...weekly,
      });

      if (check.ok) next[key] = value;
      else skipped += 1;
    });

    setCells(next);

    if (skipped > 0) {
      toast.warning("Some days were skipped", {
        description: `${skipped} day${skipped === 1 ? "" : "s"} would go over the ${formatHoursValue(weekly.limit)} h weekly limit.`,
      });
    }
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
    return (
      <div className="flex flex-col gap-4" aria-busy="true">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-9 w-80" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col gap-3">
        <Alert variant="destructive">
          <AlertTriangle aria-hidden />
          <AlertDescription>
            {error || "The schedule could not be loaded."}
          </AlertDescription>
        </Alert>
        {onBack && (
          <div>
            <Button type="button" variant="outline" onClick={onBack}>
              <ArrowLeft aria-hidden />
              Back to departments
            </Button>
          </div>
        )}
      </div>
    );
  }

  const canEdit = data.can_edit;
  const status = data.status;

  return (
    <section className="flex flex-col gap-4">
      <Card className="gap-0 py-0">
        <CardContent className="flex flex-wrap items-start justify-between gap-4 p-4 sm:p-5">
          <div className="min-w-0">
            {onBack && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="-ml-2 mb-1 text-muted-foreground"
                onClick={() => guard(onBack)}
              >
                <ArrowLeft aria-hidden />
                Departments
              </Button>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xl font-semibold tracking-tight">
                {data.department.name}
              </h3>
              <StatusBadge status={status} />
              {dirty && (
                <Badge
                  variant="outline"
                  className="gap-1.5 border-amber-300 bg-amber-50 font-medium text-amber-800 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300"
                >
                  <span className="size-1.5 rounded-full bg-amber-500" aria-hidden />
                  Unsaved changes
                </Badge>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatPeriod(data.period)}
              {data.department.head && <> · Head: {data.department.head}</>}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 max-md:w-full">
            {onPeriodChange && (
              <PeriodStepper
                month={month}
                year={year}
                onChange={(nextMonth, nextYear) =>
                  guard(() => onPeriodChange(nextMonth, nextYear))
                }
              />
            )}
            <Button
              type="button"
              variant="outline"
              disabled={dirty || busy || data.staff.length === 0}
              title={dirty ? "Save your changes first" : undefined}
              onClick={() => printSchedule({ data, dates, cells, shiftCodes })}
            >
              <Printer aria-hidden />
              Print
            </Button>
            {canEdit && (
              <Button
                type="button"
                variant="outline"
                disabled={!dirty || busy}
                onClick={handleSave}
              >
                {busy ? <Loader2 className="animate-spin" aria-hidden /> : <Save aria-hidden />}
                {busy ? "Saving…" : "Save"}
              </Button>
            )}
            {data.can_submit && (
              <Button
                type="button"
                disabled={dirty || busy}
                title={dirty ? "Save your changes first" : undefined}
                onClick={() => {
                  setDialogError("");
                  setConfirm("submit");
                }}
              >
                <Send aria-hidden />
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
                  <RotateCcw aria-hidden />
                  Return
                </Button>
                <Button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setDialogError("");
                    setConfirm("approve");
                  }}
                >
                  <CheckCircle2 aria-hidden />
                  Approve
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle aria-hidden />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!canEdit && (status === "draft" || status === "returned") && (
        <Alert>
          <Info aria-hidden />
          <AlertDescription>
            This schedule is not approved yet and may still change. The DTR
            only uses approved schedules.
          </AlertDescription>
        </Alert>
      )}
      {status === "returned" && data.schedule?.review_remarks && (
        <Alert variant="destructive">
          <RotateCcw aria-hidden />
          <AlertTitle>Returned by {data.schedule.reviewed_by ?? "HR"}</AlertTitle>
          <AlertDescription>{data.schedule.review_remarks}</AlertDescription>
        </Alert>
      )}
      {status === "submitted" && (
        <Alert className="border-amber-200 bg-amber-50 text-amber-900 *:data-[slot=alert-description]:text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100 dark:*:data-[slot=alert-description]:text-amber-200">
          <Clock aria-hidden />
          <AlertTitle>Waiting for HR review</AlertTitle>
          <AlertDescription>
            Submitted
            {data.schedule?.submitted_by && <> by {data.schedule.submitted_by}</>}
            {data.schedule?.submitted_at && (
              <> on {formatWhen(data.schedule.submitted_at)}</>
            )}
            . It cannot be edited until it is reviewed.
          </AlertDescription>
        </Alert>
      )}
      {status === "approved" && canEdit && (
        <Alert className="border-blue-200 bg-blue-50 text-blue-900 *:data-[slot=alert-description]:text-blue-800 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-100 dark:*:data-[slot=alert-description]:text-blue-200">
          <CheckCircle2 aria-hidden />
          <AlertTitle>Approved</AlertTitle>
          <AlertDescription>
            For a single shift change, file a change-off below; it applies
            right away once another head or scheduler approves it. Editing the
            schedule itself sends it back to draft, and the DTR uses the
            default shift for these dates until HR approves it again.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={view ?? "calendar"} onValueChange={setView}>
        <TabsList className="h-auto flex-wrap">
          <TabsTrigger value="department">
            <Building2 aria-hidden />
            Department calendar
          </TabsTrigger>
          <TabsTrigger value="calendar">
            <CalendarDays aria-hidden />
            Employee calendar
          </TabsTrigger>
          <TabsTrigger value="grid">
            <LayoutGrid aria-hidden />
            Grid overview
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {view === "calendar" && (
        <ScheduleCalendar
          data={data}
          dates={dates}
          cells={cells}
          canEdit={canEdit}
          shiftCodes={shiftCodes}
          setCell={setCell}
          applyChanges={applyChanges}
          weekly={weekly}
          fillRow={fillRow}
        />
      )}

      {view === "department" && (
        <DepartmentCalendar
          data={data}
          dates={dates}
          cells={cells}
          shiftCodes={shiftCodes}
        />
      )}

      {view === "grid" && (
        <>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
            <span className="font-semibold text-muted-foreground">Legend</span>
            {data.shifts.map((shift) => (
              <span key={shift.id} className="whitespace-nowrap">
                <strong>{shiftCodes.get(shift.id)}</strong> = {shift.name} (
                {formatHoursValue(shiftPaidMinutes(shift))} h)
                {!shift.is_active && " · inactive"}
              </span>
            ))}
            {canEdit && (
              <label className="ml-auto flex items-center gap-2 text-sm">
                <Checkbox
                  checked={weekdaysOnly}
                  onCheckedChange={(value) => setWeekdaysOnly(value === true)}
                />
                Fill row: weekdays only
              </label>
            )}
          </div>

          <WeeklyHoursSummary
            staff={staff}
            dates={dates}
            cells={cells}
            weekly={weekly}
          />

          {halves.map(
            (slice, index) =>
              slice.length > 0 && (
                <ScheduleGridTable
                  key={slice[0]}
                  dates={slice}
                  showFill={canEdit && index === 0}
                  staff={visibleStaff}
                  hasStaff={staff.length > 0}
                  shifts={data.shifts}
                  cells={cells}
                  canEdit={canEdit}
                  shiftCodes={shiftCodes}
                  setCell={setCell}
                  fillRow={fillRow}
                />
              ),
          )}

          <Pager
            page={currentPage}
            lastPage={lastPage}
            total={staff.length}
            noun="employee"
            onChange={setPage}
          />
        </>
      )}

      {data.can_view_change_offs && (
        <>
          <ChangeOffPanel
            data={data}
            month={month}
            year={year}
            hasUnsavedChanges={dirty}
            onApplied={reloadSchedule}
          />
          <SchedulersPanel data={data} />
        </>
      )}

      <AlertDialog
        open={discardAction !== null}
        onOpenChange={(open) => {
          if (!open) setDiscardAction(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have schedule changes that have not been saved. If you
              leave now, they will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const action = discardAction;
                setDiscardAction(null);
                action?.();
              }}
            >
              Discard changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
            <Button type="button" disabled={busy} onClick={handleReturn}>
              Return schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
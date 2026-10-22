import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Users,
  FileText,
  Upload,
  Download,
  Eye,
  Trash2,
  Clock,
  Building,
  Briefcase,
  Search,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Printer,
  ChevronLeft,
  ChevronRight,
  X,
  ArrowUpDown,
  File,
  FilePlus,
  Paperclip,
  Loader2,
  FileCheck,
  UserCheck,
  ArrowLeft,
  Info,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

import { employeeService } from "../../services/employeeService";
import { contractService } from "../../services/contractService";
import AutoRenewalPanel from "./components/autorenewalpanels";

// ─── STATIC CONSTANTS ─────────────────────────────────────────────────────────

const CONTRACT_TYPES = [
  "Regular",
  "Project-Based",
  "Probationary",
  "Part-Time",
  "Contractual",
];
const CONTRACT_STATUSES = ["Active", "Expiring Soon", "Expired"];
const RENEWAL_STATUSES = ["Pending", "In Progress", "Completed", "Renewed"];
const TEMPLATES = [
  "Standard Employment",
  "Executive Agreement",
  "Probationary Contract",
  "Project Agreement",
];
const SCHEDULES = [
  "Monday–Friday, 8AM–5PM",
  "Shifting Schedule",
  "Flexible Hours",
  "Remote Work",
];

const RENEWABLE_EMPLOYMENT_TYPES = [
  "Contract of Service",
  "Consultant",
  "contract of service",
  "consultant",
  "COS",
  "cos",
];

function normaliseEmployee(raw) {
  const endDate =
    raw.contract_end_date ??
    raw.contractEndDate ??
    raw.end_date ??
    raw.endDate ??
    null;

  const startDate =
    raw.contract_start_date ??
    raw.contractStartDate ??
    raw.start_date ??
    raw.startDate ??
    null;

  const daysRemaining = endDate
    ? Math.round((new Date(endDate) - new Date()) / 86_400_000)
    : null;

  const contractStatus =
    daysRemaining === null
      ? "Active"
      : daysRemaining < 0
        ? "Expired"
        : daysRemaining <= 30
          ? "Expiring Soon"
          : "Active";

  const renewalStatus =
    raw.renewal_status ??
    raw.renewalStatus ??
    (daysRemaining !== null && daysRemaining < 0
      ? "Pending"
      : daysRemaining !== null && daysRemaining <= 30
        ? "In Progress"
        : daysRemaining !== null && daysRemaining <= 60
          ? "Completed"
          : "Pending");

  const name =
    raw.full_name ??
    raw.fullName ??
    [raw.first_name ?? raw.firstName, raw.last_name ?? raw.lastName]
      .filter(Boolean)
      .join(" ") ??
    raw.name ??
    "—";

  const employmentType =
    raw.employment_type ??
    raw.employmentType ??
    raw.contract_type ??
    raw.contractType ??
    "";

  const departmentFromDesignation = Array.isArray(raw.position_designation)
    ? raw.position_designation.filter(Boolean)
    : [];

  const departmentList = Array.isArray(raw.departments)
    ? raw.departments
        .map((d) => (typeof d === "string" ? d : d?.name))
        .filter(Boolean)
    : [];

  const positionTitle =
    raw.cos_position?.title ?? raw.consultant_position?.title ?? null;

  const positionFromRole = Array.isArray(raw.role_position)
    ? raw.role_position.filter(Boolean)
    : [];

  return {
    id: raw.id ?? raw.employee_id ?? raw.employeeId,
    employeeNumber:
      raw.employee_number ??
      raw.employeeNumber ??
      raw.employee_code ??
      raw.employeeCode ??
      raw.id,
    name,
    department:
      departmentList.length > 0
        ? departmentList.join(", ")
        : departmentFromDesignation.length > 0
          ? departmentFromDesignation.join(", ")
          : (raw.department?.name ??
            raw.department_name ??
            raw.department ??
            "—"),
    position:
      positionTitle ??
      (positionFromRole.length > 0
        ? positionFromRole.join(", ")
        : (raw.position?.name ?? raw.position_name ?? raw.position ?? "—")),
    employmentType,
    contractType:
      raw.contract_type ?? raw.contractType ?? employmentType ?? "Regular",
    contractNumber:
      raw.contract_number ?? raw.contractNumber ?? `CTR-${raw.id}`,
    startDate,
    endDate,
    daysRemaining,
    contractStatus,
    renewalStatus,
    salary: raw.salary
      ? Number(raw.salary).toLocaleString()
      : raw.monthly_salary
        ? Number(raw.monthly_salary).toLocaleString()
        : "—",
    schedule:
      raw.work_schedule ?? raw.workSchedule ?? raw.schedule ?? SCHEDULES[0],
    employmentStatus:
      raw.employment_status ??
      raw.employmentStatus ??
      (daysRemaining !== null && daysRemaining < 0 ? "For Renewal" : "Active"),
    photo:
      raw.avatar_url ??
      raw.avatarUrl ??
      raw.photo_url ??
      raw.photo ??
      `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1e3a5f&color=fff&size=80`,
  };
}

function extractList(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  return [];
}

// ─── MOCK HISTORY / TIMELINE ──────────────────────────────────────────────────

function defaultHistory(employee) {
  return [
    {
      contractNumber: `CTR-2022-${employee.id}`,
      type: "Regular",
      effective: "2022-01-15",
      end: "2023-01-14",
      by: "HR Admin",
      status: "Expired",
    },
    {
      contractNumber: `CTR-2023-${employee.id}`,
      type: "Regular",
      effective: "2023-01-15",
      end: "2024-01-14",
      by: "HR Admin",
      status: "Expired",
    },
    {
      contractNumber: employee.contractNumber,
      type: employee.contractType,
      effective: employee.startDate,
      end: employee.endDate,
      by: "HR Admin",
      status: employee.contractStatus,
    },
  ];
}

const TIMELINE_STEPS_TEMPLATE = [
  { label: "Renewal Created", date: "2024-12-01", done: true, icon: FilePlus },
  { label: "Documents Uploaded", date: "2024-12-05", done: true, icon: Upload },
  {
    label: "Contract Generated",
    date: "2024-12-10",
    done: true,
    icon: FileText,
  },
  { label: "Awaiting Signature", date: null, done: false, icon: UserCheck },
  { label: "Completed", date: null, done: false, icon: CheckCircle2 },
];

// ─── UTILITIES ────────────────────────────────────────────────────────────────

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

// ─── TOAST STATE ──────────────────────────────────────────────────────────────

function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  }, []);
  const remove = useCallback(
    (id) => setToasts((p) => p.filter((t) => t.id !== id)),
    [],
  );
  return { toasts, add, remove };
}

// ─── HOOKS ────────────────────────────────────────────────────────────────────

function useEmployeeList(filters) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.department) params.department = filters.department;
      if (filters.position) params.position = filters.position;
      params.employment_type = ["Contract of Service", "Consultant"];

      const response = await employeeService.getAll(params);
      const raw = extractList(response);

      const normalised = raw
        .map(normaliseEmployee)
        .filter((e) => RENEWABLE_EMPLOYMENT_TYPES.includes(e.employmentType));

      setEmployees(normalised);
    } catch (err) {
      setError(err?.response?.data?.message ?? err?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [filters.search, filters.department, filters.position]);

  useEffect(() => {
    load();
  }, [load]);

  return { employees, loading, error, reload: load };
}

function useEmployeeDetail(id) {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    employeeService
      .getById(id)
      .then((raw) => {
        if (!cancelled) setEmployee(normaliseEmployee(raw?.data ?? raw));
      })
      .catch((err) => {
        if (!cancelled)
          setError(
            err?.response?.data?.message ?? err?.message ?? "Unknown error",
          );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  return { employee, loading, error };
}

function useDepartments() {
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    employeeService
      .getDepartments()
      .then((res) => {
        const list = extractList(res);
        setDepartments(
          list.map((d) =>
            typeof d === "string" ? d : (d.name ?? d.label ?? String(d.id)),
          ),
        );
      })
      .catch(() => setDepartments([]));
  }, []);

  return departments;
}

function useActiveContract(employee) {
  const [activeContract, setActiveContract] = useState(null);
  const [contractLoading, setContractLoading] = useState(false);

  useEffect(() => {
    if (!employee?.id && !employee?.name) {
      setActiveContract(null);
      return;
    }

    let cancelled = false;
    setContractLoading(true);

    contractService
      .getAll()
      .then((contracts) => {
        if (cancelled) return;

        // ── Primary: ID-based match via employee_id ──
        let match = contracts
          .filter(
            (c) =>
              c.employee_id != null &&
              String(c.employee_id) === String(employee.id) &&
              c.status !== "Expired",
          )
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];

        // ── Fallback: name-based match (uppercase + trim) for legacy records ──
        if (!match && employee.name) {
          const normalName = employee.name.toUpperCase().trim();
          match = contracts
            .filter((c) => {
              const cName = (c.employee_name ?? "").toUpperCase().trim();
              return cName === normalName && c.status !== "Expired";
            })
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
        }

        setActiveContract(match ?? null);
      })
      .catch(() => {
        if (!cancelled) setActiveContract(null);
      })
      .finally(() => {
        if (!cancelled) setContractLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [employee?.id, employee?.name]);

  return { activeContract, setActiveContract, contractLoading };
}

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────

const STATUS_STYLES = {
  Active: [
    "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    "bg-emerald-500",
  ],
  "Expiring Soon": [
    "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    "bg-amber-500",
  ],
  Expired: ["bg-red-500/10 text-red-700 dark:text-red-400", "bg-red-500"],
  "In Progress": [
    "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    "bg-blue-500",
  ],
  Pending: ["bg-muted text-muted-foreground", "bg-muted-foreground/60"],
  Completed: [
    "bg-violet-500/10 text-violet-700 dark:text-violet-400",
    "bg-violet-500",
  ],
  Renewed: ["bg-teal-500/10 text-teal-700 dark:text-teal-400", "bg-teal-500"],
  "For Renewal": [
    "bg-orange-500/10 text-orange-700 dark:text-orange-400",
    "bg-orange-500",
  ],
  Generated: [
    "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    "bg-emerald-500",
  ],
};

function StatusBadge({ status }) {
  const [tone, dot] = STATUS_STYLES[status] ?? STATUS_STYLES.Pending;
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 border-transparent font-medium whitespace-nowrap",
        tone,
      )}
    >
      <span className={cn("size-1.5 rounded-full", dot)} />
      {status}
    </Badge>
  );
}

// ─── SMALL SHARED PIECES ──────────────────────────────────────────────────────

function initials(name) {
  return (
    String(name ?? "")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0])
      .join("")
      .toUpperCase() || "?"
  );
}

function PersonAvatar({ employee, className }) {
  return (
    <Avatar className={className}>
      <AvatarImage src={employee.photo} alt={employee.name} />
      <AvatarFallback>{initials(employee.name)}</AvatarFallback>
    </Avatar>
  );
}

function EmptyState({ icon: Icon, title, desc }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
      <div className="rounded-full bg-muted p-3">
        <Icon className="size-5 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium">{title}</p>
      {desc && <p className="max-w-sm text-sm text-muted-foreground">{desc}</p>}
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
      <div className="rounded-full bg-destructive/10 p-3">
        <AlertCircle className="size-5 text-destructive" />
      </div>
      <p className="text-sm font-medium">Could not load data</p>
      <p className="max-w-sm text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <Button size="sm" variant="outline" onClick={onRetry} className="mt-2">
          <RefreshCw /> Try again
        </Button>
      )}
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-4 p-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="size-8 rounded-full" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="ml-auto h-8 w-16" />
        </div>
      ))}
    </div>
  );
}

function Field({ label, children, className }) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function OptionSelect({ value, onChange, options, placeholder, className }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={cn("w-full", className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// ─── TOAST ────────────────────────────────────────────────────────────────────

function Toast({ toasts, remove }) {
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className="flex items-start gap-3 rounded-lg border bg-background p-4 text-sm shadow-lg"
        >
          {t.type === "success" ? (
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
          )}
          <span className="flex-1">{t.message}</span>
          <button
            onClick={() => remove(t.id)}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Dismiss"
          >
            <X className="size-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Delete",
  loading,
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={loading}>
            {loading && <Loader2 className="animate-spin" />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── SUMMARY ──────────────────────────────────────────────────────────────────

function SummaryCards({ employees }) {
  const s = useMemo(
    () => ({
      total: employees.length,
      expiring: employees.filter(
        (e) =>
          e.daysRemaining != null &&
          e.daysRemaining > 0 &&
          e.daysRemaining <= 30,
      ).length,
      expired: employees.filter(
        (e) => e.daysRemaining != null && e.daysRemaining < 0,
      ).length,
      inProgress: employees.filter((e) => e.renewalStatus === "In Progress")
        .length,
      completed: employees.filter(
        (e) => e.renewalStatus === "Completed" || e.renewalStatus === "Renewed",
      ).length,
    }),
    [employees],
  );

  const items = [
    {
      label: "Total contracts",
      value: s.total,
      desc: "COS and Consultant",
      tone: "",
    },
    {
      label: "Expiring in 30 days",
      value: s.expiring,
      desc: "Plan these renewals now",
      tone: s.expiring ? "text-amber-600" : "",
    },
    {
      label: "Expired",
      value: s.expired,
      desc: "Need action today",
      tone: s.expired ? "text-destructive" : "",
    },
    {
      label: "Renewal in progress",
      value: s.inProgress,
      desc: "Being processed",
      tone: "",
    },
    {
      label: "Renewed",
      value: s.completed,
      desc: "Completed this period",
      tone: "",
    },
  ];

  return (
    <Card className="gap-0 overflow-hidden py-0">
      <div className="grid grid-cols-2 lg:grid-cols-5">
        {items.map((it, i) => (
          <div
            key={it.label}
            className={cn(
              "p-5",
              i % 2 === 0 && "border-r lg:border-r-0",
              i < items.length - 1 && "lg:border-r",
              i < items.length - 1 && "border-b lg:border-b-0",
            )}
          >
            <p className="text-sm text-muted-foreground">{it.label}</p>
            <p
              className={cn(
                "mt-1 text-3xl font-semibold tabular-nums",
                it.tone,
              )}
            >
              {it.value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{it.desc}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── FILTERS ──────────────────────────────────────────────────────────────────

function FilterSelect({ value, onChange, allLabel, options, className }) {
  return (
    <Select
      value={value || "all"}
      onValueChange={(v) => onChange(v === "all" ? "" : v)}
    >
      <SelectTrigger className={cn("w-full sm:w-44", className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{allLabel}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function RenewalFilters({ filters, onChange, onReset, departments }) {
  const hasFilters = Object.values(filters).some(Boolean);
  return (
    <div className="flex flex-wrap items-center gap-3 p-4">
      <div className="relative min-w-52 flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={filters.search}
          onChange={(e) => onChange("search", e.target.value)}
          placeholder="Search by name or number"
          className="pl-9"
        />
      </div>
      <FilterSelect
        value={filters.department}
        onChange={(v) => onChange("department", v)}
        allLabel="All departments"
        options={departments}
      />
      <FilterSelect
        value={filters.contractStatus}
        onChange={(v) => onChange("contractStatus", v)}
        allLabel="All contract statuses"
        options={CONTRACT_STATUSES}
      />
      <FilterSelect
        value={filters.renewalStatus}
        onChange={(v) => onChange("renewalStatus", v)}
        allLabel="All renewal statuses"
        options={RENEWAL_STATUSES}
      />
      {hasFilters && (
        <Button variant="ghost" onClick={onReset}>
          <X /> Clear
        </Button>
      )}
    </div>
  );
}

// ─── EMPLOYEE TABLE ───────────────────────────────────────────────────────────

function SortHead({ label, k, sortKey, sortDir, onSort, className }) {
  const active = sortKey === k;
  return (
    <TableHead className={className}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onSort(k)}
        className="-ml-3 h-8 gap-1.5 font-medium"
      >
        {label}
        <ArrowUpDown
          className={cn("size-3", active ? "opacity-100" : "opacity-40")}
        />
        {active && (
          <span className="sr-only">
            {sortDir === "asc" ? "ascending" : "descending"}
          </span>
        )}
      </Button>
    </TableHead>
  );
}

function DaysRemaining({ days }) {
  if (days == null) return <span className="text-muted-foreground">—</span>;
  if (days < 0)
    return (
      <span className="font-medium text-destructive">
        {Math.abs(days)} days overdue
      </span>
    );
  return (
    <span className={cn("font-medium", days <= 30 ? "text-amber-600" : "")}>
      {days} {days === 1 ? "day" : "days"}
    </span>
  );
}

function EmployeeRenewalTable({
  employees,
  onSelect,
  loading,
  error,
  onRetry,
  toolbar,
}) {
  const [sortKey, setSortKey] = useState("daysRemaining");
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const sorted = useMemo(
    () =>
      [...employees].sort((a, b) => {
        const av = a[sortKey],
          bv = b[sortKey];
        if (av == null) return 1;
        if (bv == null) return -1;
        if (typeof av === "number")
          return sortDir === "asc" ? av - bv : bv - av;
        return sortDir === "asc"
          ? String(av).localeCompare(String(bv))
          : String(bv).localeCompare(String(av));
      }),
    [employees, sortKey, sortDir],
  );

  useEffect(() => setPage(1), [employees]);

  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(sorted.length / pageSize);

  function toggleSort(k) {
    if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(k);
      setSortDir("asc");
    }
  }
  const sortProps = { sortKey, sortDir, onSort: toggleSort };

  return (
    <Card className="min-w-0 gap-0 overflow-hidden py-0">
      {toolbar}
      <div className="border-t">
        {loading ? (
          <TableSkeleton />
        ) : error ? (
          <ErrorState message={error} onRetry={onRetry} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <SortHead
                  label="Employee"
                  k="name"
                  {...sortProps}
                  className="pl-4"
                />
                <SortHead label="Department" k="department" {...sortProps} />
                <SortHead label="Type" k="employmentType" {...sortProps} />
                <SortHead label="Contract period" k="endDate" {...sortProps} />
                <SortHead label="Time left" k="daysRemaining" {...sortProps} />
                <TableHead>Contract</TableHead>
                <TableHead>Renewal</TableHead>
                <TableHead className="pr-4 text-right">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={8}>
                    <EmptyState
                      icon={Users}
                      title="No COS or Consultant employees found"
                      desc="Plantilla employees are excluded from contract renewal. Try changing or clearing your filters."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((emp) => (
                  <TableRow
                    key={emp.id}
                    className="cursor-pointer"
                    onClick={() => onSelect(emp)}
                  >
                    <TableCell className="pl-4">
                      <div className="flex items-center gap-3">
                        <PersonAvatar employee={emp} className="size-9" />
                        <div className="min-w-0">
                          <p className="truncate font-medium">{emp.name}</p>
                          <p className="font-mono text-xs text-muted-foreground">
                            {emp.employeeNumber}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="max-w-52 truncate">{emp.department}</p>
                      <p className="max-w-52 truncate text-xs text-muted-foreground">
                        {emp.position}
                      </p>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {emp.employmentType || "—"}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {formatDate(emp.startDate)} to {formatDate(emp.endDate)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <DaysRemaining days={emp.daysRemaining} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={emp.contractStatus} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={emp.renewalStatus} />
                    </TableCell>
                    <TableCell className="pr-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelect(emp);
                        }}
                      >
                        <Eye /> View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>
      {!loading && !error && totalPages > 1 && (
        <div className="flex items-center justify-between border-t px-4 py-3">
          <span className="text-sm text-muted-foreground">
            Showing {(page - 1) * pageSize + 1} to{" "}
            {Math.min(page * pageSize, sorted.length)} of {sorted.length}
          </span>
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="outline"
              className="size-8"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              aria-label="Previous page"
            >
              <ChevronLeft />
            </Button>
            <span className="text-sm tabular-nums">
              {page} / {totalPages}
            </span>
            <Button
              size="icon"
              variant="outline"
              className="size-8"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              aria-label="Next page"
            >
              <ChevronRight />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

// ─── DOCUMENTS ────────────────────────────────────────────────────────────────

function UploadDocumentsCard({ toast }) {
  const [docs, setDocs] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const inputRef = useRef(null);

  function handleFiles(files) {
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
    ];
    let added = 0;
    for (const f of files) {
      if (!allowed.includes(f.type)) {
        toast.add(`${f.name}: unsupported file type`, "error");
        continue;
      }
      if (f.size > 10 * 1024 * 1024) {
        toast.add(`${f.name}: exceeds 10 MB limit`, "error");
        continue;
      }
      added++;
      const reader = new FileReader();
      reader.onload = () =>
        setDocs((p) => [
          ...p,
          {
            id: Date.now() + Math.random(),
            name: f.name,
            type: f.type.includes("pdf")
              ? "PDF"
              : f.type.includes("word")
                ? "DOCX"
                : "Image",
            by: "HR Admin",
            date: new Date().toISOString().split("T")[0],
            size: f.size,
            url: reader.result,
          },
        ]);
      reader.readAsDataURL(f);
    }
    if (added) {
      setUploading(true);
      setTimeout(() => {
        setUploading(false);
        toast.add(`${added} file(s) uploaded successfully`);
      }, 1500);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    handleFiles(Array.from(e.dataTransfer.files));
  }

  function confirmDelete() {
    setDeleting(true);
    setTimeout(() => {
      setDocs((p) => p.filter((d) => d.id !== deleteTarget.id));
      setDeleteTarget(null);
      setDeleting(false);
      toast.add("Document deleted");
    }, 800);
  }

  return (
    <>
      <Card className="min-w-0">
        <CardHeader>
          <CardTitle>Employee documents</CardTitle>
          <CardDescription>
            Upload the documents the employee submitted for this renewal.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div
            role="button"
            tabIndex={0}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) =>
              (e.key === "Enter" || e.key === " ") && inputRef.current?.click()
            }
            className={cn(
              "flex cursor-pointer flex-col items-center gap-1 rounded-lg border-2 border-dashed p-8 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              dragging ? "border-primary bg-primary/5" : "hover:bg-muted/50",
            )}
          >
            <input
              ref={inputRef}
              type="file"
              multiple
              className="hidden"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={(e) => handleFiles(Array.from(e.target.files))}
            />
            {uploading ? (
              <>
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Uploading files...
                </p>
              </>
            ) : (
              <>
                <Upload className="size-6 text-muted-foreground" />
                <p className="mt-1 text-sm font-medium">
                  Drop files here, or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  PDF, DOC, DOCX, JPG or PNG. Up to 10 MB each.
                </p>
              </>
            )}
          </div>

          {docs.length === 0 ? (
            <EmptyState
              icon={Paperclip}
              title="No documents yet"
              desc="Files you upload will be listed here."
            />
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="pl-4">File</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead className="pr-4 text-right">
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {docs.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="pl-4">
                        <div className="flex items-center gap-2">
                          <File className="size-4 shrink-0 text-muted-foreground" />
                          <span className="max-w-48 truncate">{doc.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{doc.type}</Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {formatDate(doc.date)} by {doc.by}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatFileSize(doc.size)}
                      </TableCell>
                      <TableCell className="pr-4">
                        <div className="flex justify-end gap-1">
                          <Button
                            asChild
                            size="icon"
                            variant="ghost"
                            className="size-8"
                          >
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noreferrer"
                              aria-label="View"
                            >
                              <Eye />
                            </a>
                          </Button>
                          <Button
                            asChild
                            size="icon"
                            variant="ghost"
                            className="size-8"
                          >
                            <a
                              href={doc.url}
                              download={doc.name}
                              aria-label="Download"
                            >
                              <Download />
                            </a>
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="size-8 text-destructive hover:text-destructive"
                            onClick={() => setDeleteTarget(doc)}
                            aria-label="Delete"
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        title="Delete document"
        message={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete document"
      />
    </>
  );
}

// ─── GENERATE CONTRACT ────────────────────────────────────────────────────────

function GenerateContractCard({ employee, toast }) {
  const [form, setForm] = useState({
    template: "",
    contractType: employee.contractType,
    startDate: "",
    endDate: "",
    salary: employee.salary?.replace?.(/,/g, "") ?? "",
    allowances: "",
    schedule: employee.schedule ?? SCHEDULES[0],
    position: employee.position,
    department: employee.department,
    probation: "No",
    remarks: "",
  });
  const [generated, setGenerated] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [previewing, setPreviewing] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  function handleGenerate() {
    if (!form.startDate || !form.endDate) {
      toast.add("Please fill in contract dates", "error");
      return;
    }
    setGenerating(true);
    setTimeout(() => {
      setGenerated({
        number: `CTR-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`,
        date: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "2-digit",
        }),
        by: "HR Admin",
        status: "Generated",
      });
      setGenerating(false);
      toast.add("Contract generated successfully");
    }, 1800);
  }

  return (
    <>
      <Card className="min-w-0">
        <CardHeader>
          <CardTitle>Generate contract</CardTitle>
          <CardDescription>
            Create a new employment contract. You do not need uploaded documents
            first.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Contract template">
              <OptionSelect
                value={form.template}
                onChange={(v) => set("template", v)}
                options={TEMPLATES}
                placeholder="Select a template"
              />
            </Field>
            <Field label="New contract type">
              <OptionSelect
                value={form.contractType}
                onChange={(v) => set("contractType", v)}
                options={CONTRACT_TYPES}
              />
            </Field>
            <Field label="Start date">
              <Input
                type="date"
                value={form.startDate}
                onChange={(e) => set("startDate", e.target.value)}
              />
            </Field>
            <Field label="End date">
              <Input
                type="date"
                value={form.endDate}
                onChange={(e) => set("endDate", e.target.value)}
              />
            </Field>
            <Field label="Salary (PHP)">
              <Input
                type="number"
                value={form.salary}
                onChange={(e) => set("salary", e.target.value)}
              />
            </Field>
            <Field label="Allowances">
              <Input
                value={form.allowances}
                onChange={(e) => set("allowances", e.target.value)}
                placeholder="e.g. Transportation, Meal"
              />
            </Field>
            <Field label="Work schedule">
              <OptionSelect
                value={form.schedule}
                onChange={(v) => set("schedule", v)}
                options={SCHEDULES}
              />
            </Field>
            <Field label="Probation">
              <OptionSelect
                value={form.probation}
                onChange={(v) => set("probation", v)}
                options={["No", "Yes — 3 months", "Yes — 6 months"]}
              />
            </Field>
            <Field label="Position">
              <Input
                value={form.position}
                onChange={(e) => set("position", e.target.value)}
              />
            </Field>
            <Field label="Department">
              <Input
                value={form.department}
                onChange={(e) => set("department", e.target.value)}
              />
            </Field>
            <Field label="Remarks" className="md:col-span-2">
              <Textarea
                value={form.remarks}
                onChange={(e) => set("remarks", e.target.value)}
                rows={3}
                placeholder="Additional notes or terms"
                className="resize-none"
              />
            </Field>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={handleGenerate} disabled={generating}>
              {generating ? <Loader2 className="animate-spin" /> : <FileText />}
              {generating ? "Generating..." : "Generate contract"}
            </Button>
            <Button variant="outline" onClick={() => setPreviewing(true)}>
              <Eye /> Preview
            </Button>
            {generated && (
              <>
                <Button variant="outline">
                  <Download /> Download PDF
                </Button>
                <Button variant="outline">
                  <Printer /> Print
                </Button>
              </>
            )}
          </div>

          {generated && (
            <div className="rounded-lg border bg-emerald-500/5 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="size-4" /> Contract generated
              </div>
              <dl className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                {[
                  ["Contract number", generated.number],
                  ["Generated on", generated.date],
                  ["Generated by", generated.by],
                  ["Status", generated.status],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-xs text-muted-foreground">{k}</dt>
                    <dd className="mt-0.5 font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={previewing} onOpenChange={setPreviewing}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{form.contractType} contract preview</DialogTitle>
            <DialogDescription>
              Between {employee.name} (Employee) and the Company. Review all
              details before generating.
            </DialogDescription>
          </DialogHeader>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-4 rounded-lg border bg-muted/40 p-4 text-sm">
            {[
              ["Position", form.position],
              ["Department", form.department],
              ["Start date", formatDate(form.startDate)],
              ["End date", formatDate(form.endDate)],
              ["Salary", `PHP ${Number(form.salary).toLocaleString()}`],
              ["Schedule", form.schedule],
              ["Probation", form.probation],
              ["Allowances", form.allowances || "None"],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs text-muted-foreground">{k}</dt>
                <dd className="mt-0.5 font-medium">{v || "—"}</dd>
              </div>
            ))}
          </dl>
          {form.remarks && (
            <p className="text-sm">
              <span className="font-medium">Remarks:</span> {form.remarks}
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewing(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                setPreviewing(false);
                handleGenerate();
              }}
            >
              Confirm and generate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── TIMELINE ─────────────────────────────────────────────────────────────────

function RenewalTimeline() {
  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="size-4 text-muted-foreground" /> Renewal progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="relative space-y-6">
          <span
            className="absolute bottom-4 left-4 top-4 w-px bg-border"
            aria-hidden
          />
          {TIMELINE_STEPS_TEMPLATE.map((step) => {
            const Icon = step.icon;
            return (
              <li key={step.label} className="relative flex items-start gap-4">
                <span
                  className={cn(
                    "z-10 flex size-8 shrink-0 items-center justify-center rounded-full border",
                    step.done
                      ? "border-primary bg-primary text-primary-foreground"
                      : "bg-background text-muted-foreground",
                  )}
                >
                  <Icon className="size-4" />
                </span>
                <div className="pt-0.5">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      !step.done && "text-muted-foreground",
                    )}
                  >
                    {step.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {step.date ? formatDate(step.date) : "Not yet"}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}

// ─── HISTORY ──────────────────────────────────────────────────────────────────

function RenewalHistoryTable({ employee }) {
  const rows = useMemo(() => defaultHistory(employee), [employee]);
  return (
    <Card className="min-w-0 gap-0 overflow-hidden py-0">
      <CardHeader className="py-6">
        <CardTitle>Renewal history</CardTitle>
        <CardDescription>Every contract this employee has had.</CardDescription>
      </CardHeader>
      <div className="border-t">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              {[
                "Contract number",
                "Type",
                "Effective",
                "Ends",
                "Generated by",
                "Status",
              ].map((h, i) => (
                <TableHead
                  key={h}
                  className={cn("whitespace-nowrap", i === 0 && "pl-6")}
                >
                  {h}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.contractNumber}>
                <TableCell className="pl-6 font-mono text-xs">
                  {row.contractNumber}
                </TableCell>
                <TableCell>{row.type}</TableCell>
                <TableCell className="whitespace-nowrap">
                  {formatDate(row.effective)}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {formatDate(row.end)}
                </TableCell>
                <TableCell>{row.by}</TableCell>
                <TableCell>
                  <StatusBadge status={row.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}

// ─── CURRENT CONTRACT ─────────────────────────────────────────────────────────

function EmployeeContractCard({ employee, contract }) {
  const startDate = contract?.start_date ?? employee.startDate;
  const endDate = contract?.end_date ?? employee.endDate;
  const salary =
    contract?.salary ?? (employee.salary !== "—" ? employee.salary : null);
  const daysRemaining = endDate
    ? Math.round((new Date(endDate) - new Date()) / 86_400_000)
    : null;

  const fields = [
    [
      "Contract number",
      contract?.id ? `CTR-${contract.id}` : employee.contractNumber,
    ],
    ["Employment type", employee.employmentType || "—"],
    ["Start date", formatDate(startDate)],
    ["End date", formatDate(endDate)],
    ["Salary", salary ? `PHP ${Number(salary).toLocaleString()}` : "—"],
    ["Work schedule", employee.schedule],
    ["Employment status", employee.employmentStatus],
    [
      "Time left",
      daysRemaining == null
        ? "—"
        : daysRemaining < 0
          ? `${Math.abs(daysRemaining)} days overdue`
          : `${daysRemaining} days`,
    ],
  ];

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileCheck className="size-4 text-muted-foreground" /> Current
          contract
        </CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-x-8 gap-y-5 md:grid-cols-4">
          {fields.map(([k, v]) => (
            <div key={k}>
              <dt className="text-xs text-muted-foreground">{k}</dt>
              <dd
                className={cn(
                  "mt-1 text-sm font-medium",
                  k === "Time left" &&
                    daysRemaining != null &&
                    daysRemaining < 0 &&
                    "text-destructive",
                )}
              >
                {v}
              </dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}

// ─── DETAIL PAGE ──────────────────────────────────────────────────────────────

function BackButton({ onBack }) {
  return (
    <Button variant="ghost" size="sm" onClick={onBack} className="-ml-2">
      <ArrowLeft /> All renewals
    </Button>
  );
}

function EmployeeRenewalDetails({ employeeId, listSnapshot, onBack, toast }) {
  const { employee: fetched, loading, error } = useEmployeeDetail(employeeId);
  const employee = fetched ?? listSnapshot;
  const { activeContract, setActiveContract, contractLoading } =
    useActiveContract(employee);

  if (loading && !employee) {
    return (
      <div className="space-y-6">
        <BackButton onBack={onBack} />
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (error && !employee) {
    return (
      <div className="space-y-4">
        <BackButton onBack={onBack} />
        <Card>
          <ErrorState message={error} />
        </Card>
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex items-center gap-2">
        <BackButton onBack={onBack} />
        {(loading || contractLoading) && (
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
        )}
      </div>

      <Card className="min-w-0">
        <CardContent className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <PersonAvatar employee={employee} className="size-16" />
          <div className="min-w-0 flex-1">
            <p className="font-mono text-xs text-muted-foreground">
              {employee.employeeNumber}
            </p>
            <h2 className="text-xl font-semibold">{employee.name}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Building className="size-3.5" /> {employee.department}
              </span>
              <span className="flex items-center gap-1.5">
                <Briefcase className="size-3.5" /> {employee.position}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="size-3.5" /> {employee.employmentType}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={employee.contractStatus} />
            <StatusBadge status={employee.renewalStatus} />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="min-w-0 gap-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="contract">New contract</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="min-w-0">
          <div className="grid min-w-0 gap-6 lg:grid-cols-3">
            <div className="min-w-0 space-y-6 lg:col-span-2">
              <EmployeeContractCard
                employee={employee}
                contract={activeContract}
              />
              {activeContract ? (
                <AutoRenewalPanel
                  contract={activeContract}
                  toast={toast}
                  onUpdated={(updated) => setActiveContract(updated)}
                />
              ) : (
                !contractLoading && (
                  <Card>
                    <CardContent className="flex items-start gap-3 text-sm text-muted-foreground">
                      <Info className="mt-0.5 size-4 shrink-0" />
                      <p>
                        No active contract was found in the hiring module for
                        this employee. Create one under{" "}
                        <span className="font-medium text-foreground">
                          Hiring, Contracts
                        </span>{" "}
                        first.
                      </p>
                    </CardContent>
                  </Card>
                )
              )}
            </div>
            <RenewalTimeline />
          </div>
        </TabsContent>

        <TabsContent value="documents" className="min-w-0">
          <UploadDocumentsCard toast={toast} />
        </TabsContent>
        <TabsContent value="contract" className="min-w-0">
          <GenerateContractCard employee={employee} toast={toast} />
        </TabsContent>
        <TabsContent value="history" className="min-w-0">
          <RenewalHistoryTable employee={employee} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

export default function App() {
  const toast = useToast();
  const departments = useDepartments();
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    department: "",
    contractStatus: "",
    renewalStatus: "",
  });

  const { employees, loading, error, reload } = useEmployeeList(filters);

  const filtered = useMemo(
    () =>
      employees.filter((e) => {
        if (
          filters.contractStatus &&
          e.contractStatus !== filters.contractStatus
        )
          return false;
        if (filters.renewalStatus && e.renewalStatus !== filters.renewalStatus)
          return false;
        return true;
      }),
    [employees, filters.contractStatus, filters.renewalStatus],
  );

  const handleFilter = (k, v) => setFilters((p) => ({ ...p, [k]: v }));
  const resetFilters = () =>
    setFilters({
      search: "",
      department: "",
      contractStatus: "",
      renewalStatus: "",
    });

  return (
    <div className="min-h-screen min-w-0 bg-muted/30">
      <main className="mx-auto min-w-0 max-w-screen-2xl space-y-6 overflow-x-hidden py-8 sm:px-6">
        {selected ? (
          <EmployeeRenewalDetails
            employeeId={selected.id}
            listSnapshot={selected.snapshot}
            onBack={() => setSelected(null)}
            toast={toast}
          />
        ) : (
          <>
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                  Contract renewals
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Contract of Service and Consultant employees. Plantilla
                  positions are not included.
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            <SummaryCards employees={filtered} />

            <EmployeeRenewalTable
              employees={filtered}
              loading={loading}
              error={error}
              onRetry={reload}
              onSelect={(emp) => setSelected({ id: emp.id, snapshot: emp })}
              toolbar={
                <RenewalFilters
                  filters={filters}
                  onChange={handleFilter}
                  onReset={resetFilters}
                  departments={departments}
                />
              }
            />
          </>
        )}
      </main>
      <Toast toasts={toast.toasts} remove={toast.remove} />
    </div>
  );
}

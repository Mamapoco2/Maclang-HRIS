import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Users,
  FileText,
  Upload,
  Download,
  Eye,
  Trash2,
  Calendar,
  Clock,
  Building,
  Briefcase,
  Search,
  CheckCircle2,
  AlertCircle,
  History,
  RefreshCw,
  Printer,
  ChevronLeft,
  ChevronRight,
  X,
  ArrowUpDown,
  File,
  FilePlus,
  ClipboardList,
  Bell,
  AlertTriangle,
  Loader2,
  FileCheck,
  UserCheck,
  Paperclip,
  ArrowLeft,
  Info,
} from "lucide-react";
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

// ─── BADGE ────────────────────────────────────────────────────────────────────

function Badge({ status }) {
  const map = {
    Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Expiring Soon": "bg-amber-50 text-amber-700 border-amber-200",
    Expired: "bg-red-50 text-red-700 border-red-200",
    "In Progress": "bg-blue-50 text-blue-700 border-blue-200",
    Pending: "bg-slate-50 text-slate-600 border-slate-200",
    Completed: "bg-purple-50 text-purple-700 border-purple-200",
    Renewed: "bg-teal-50 text-teal-700 border-teal-200",
    "For Renewal": "bg-orange-50 text-orange-700 border-orange-200",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border
      ${map[status] || "bg-slate-100 text-slate-600 border-slate-200"}`}
    >
      {status}
    </span>
  );
}

// ─── SKELETON ─────────────────────────────────────────────────────────────────

function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-slate-200 rounded ${className}`} />;
}

function TableSkeleton() {
  return (
    <div className="space-y-3 p-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex gap-4 items-center">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-7 w-7 rounded-full shrink-0" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-4">
      <Skeleton className="h-16 w-16 rounded-xl" />
      <Skeleton className="h-5 w-48" />
      <Skeleton className="h-4 w-32" />
      <div className="grid grid-cols-2 gap-4 pt-2">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-4" />
        ))}
      </div>
    </div>
  );
}

// ─── EMPTY / ERROR STATE ──────────────────────────────────────────────────────

function EmptyState({ icon: Icon, title, desc, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <div className="p-4 rounded-full bg-slate-100">
        <Icon className="w-8 h-8 text-slate-400" />
      </div>
      <p className="text-sm font-medium text-slate-700">{title}</p>
      {desc && <p className="text-xs text-slate-400 max-w-xs">{desc}</p>}
      {action}
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <div className="p-4 rounded-full bg-red-50">
        <AlertCircle className="w-8 h-8 text-red-400" />
      </div>
      <p className="text-sm font-medium text-slate-700">Failed to load data</p>
      <p className="text-xs text-slate-400 max-w-xs">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-600 text-white hover:bg-red-700"
        >
          <RefreshCw className="w-3 h-3" /> Retry
        </button>
      )}
    </div>
  );
}

// ─── TOAST ────────────────────────────────────────────────────────────────────

function Toast({ toasts, remove }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 min-w-72">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start gap-3 p-4 rounded-lg shadow-lg border text-sm
            ${t.type === "success" ? "bg-white border-emerald-200" : "bg-white border-red-200"}`}
        >
          {t.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
          )}
          <span className="flex-1 text-slate-700">{t.message}</span>
          <button onClick={() => remove(t.id)}>
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      ))}
    </div>
  );
}

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

// ─── DIALOG ───────────────────────────────────────────────────────────────────

function Dialog({ open, onClose, title, children, size = "md" }) {
  if (!open) return null;
  const widths = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div
        className={`bg-white rounded-xl shadow-2xl w-full ${widths[size]} max-h-[90vh] flex flex-col`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-800">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
      </div>
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
    <Dialog open={open} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-slate-600 mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-60 flex items-center gap-2"
        >
          {loading && <Loader2 className="w-3 h-3 animate-spin" />}
          {confirmLabel}
        </button>
      </div>
    </Dialog>
  );
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

// ─── SUMMARY CARDS ────────────────────────────────────────────────────────────

function SummaryCards({ employees }) {
  const summary = useMemo(
    () => ({
      total: employees.length,
      expiringThisMonth: employees.filter(
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

  const cards = [
    {
      label: "Total Contracts",
      value: summary.total,
      desc: "COS & Consultant only",
      icon: FileText,
      color: "blue",
    },
    {
      label: "Expiring This Month",
      value: summary.expiringThisMonth,
      desc: "Contracts ending within 30 days",
      icon: Bell,
      color: "amber",
    },
    {
      label: "Expired Contracts",
      value: summary.expired,
      desc: "Require immediate renewal action",
      icon: AlertTriangle,
      color: "red",
    },
    {
      label: "Renewal In Progress",
      value: summary.inProgress,
      desc: "Currently being processed",
      icon: RefreshCw,
      color: "indigo",
    },
    {
      label: "Completed Renewals",
      value: summary.completed,
      desc: "Successfully renewed this period",
      icon: CheckCircle2,
      color: "emerald",
    },
  ];

  const colorMap = {
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map(({ label, value, desc, icon: Icon, color }) => (
        <div
          key={label}
          className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex flex-col gap-3"
        >
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center ${colorMap[color]}`}
          >
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
            <p className="text-xs font-medium text-slate-700 mt-0.5">{label}</p>
            <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── FILTERS ──────────────────────────────────────────────────────────────────

function RenewalFilters({ filters, onChange, onReset, departments }) {
  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-sm p-4">
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-44">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={filters.search}
            onChange={(e) => onChange("search", e.target.value)}
            placeholder="Search employee..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
          />
        </div>
        <select
          value={filters.department}
          onChange={(e) => onChange("department", e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-slate-700 bg-white"
        >
          <option value="">Department</option>
          {departments.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        {[
          {
            key: "contractStatus",
            label: "Contract Status",
            options: CONTRACT_STATUSES,
          },
          {
            key: "renewalStatus",
            label: "Renewal Status",
            options: RENEWAL_STATUSES,
          },
        ].map(({ key, label, options }) => (
          <select
            key={key}
            value={filters[key]}
            onChange={(e) => onChange(key, e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-slate-700 bg-white"
          >
            <option value="">{label}</option>
            {options.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        ))}
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-3 py-2 text-sm text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>
    </div>
  );
}

// ─── EMPLOYEE TABLE ───────────────────────────────────────────────────────────

function EmployeeRenewalTable({
  employees,
  onSelect,
  loading,
  error,
  onRetry,
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

  function SortBtn({ label, k }) {
    return (
      <button
        onClick={() => toggleSort(k)}
        className="flex items-center gap-1 hover:text-slate-800 whitespace-nowrap"
      >
        {label}
        <ArrowUpDown className="w-3 h-3 opacity-50" />
      </button>
    );
  }

  if (loading)
    return (
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <TableSkeleton />
      </div>
    );
  if (error)
    return (
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <ErrorState message={error} onRetry={onRetry} />
      </div>
    );

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-100 sticky top-0 z-10">
            <tr>
              {[
                ["employeeNumber", "Employee Number"],
                ["name", "Employee Name"],
                ["department", "Department"],
                ["position", "Position"],
                ["employmentType", "Employment Type"],
                ["startDate", "Start Date"],
                ["endDate", "End Date"],
                ["daysRemaining", "Days Remaining"],
              ].map(([k, l]) => (
                <th
                  key={k}
                  className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide"
                >
                  <SortBtn label={l} k={k} />
                </th>
              ))}
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Contract Status
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Renewal Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={11}>
                  <EmptyState
                    icon={Users}
                    title="No COS or Consultant employees found"
                    desc="Plantilla employees are excluded from contract renewal. Adjust your filters to see results."
                  />
                </td>
              </tr>
            ) : (
              paginated.map((emp) => (
                <tr
                  key={emp.id}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">
                    {emp.employeeNumber}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <img
                        src={emp.photo}
                        alt={emp.name}
                        className="w-7 h-7 rounded-full shrink-0"
                        onError={(e) => (e.target.style.display = "none")}
                      />
                      <span className="font-medium text-slate-800 whitespace-nowrap">
                        {emp.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                    {emp.department}
                  </td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                    {emp.position}
                  </td>
                  <td className="px-4 py-3">
                    {/* FIX: Show employment type with color-coded badge */}
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                      ${
                        emp.employmentType?.toLowerCase().includes("consultant")
                          ? "bg-purple-50 text-purple-700"
                          : "bg-sky-50 text-sky-700"
                      }`}
                    >
                      {emp.employmentType || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                    {formatDate(emp.startDate)}
                  </td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                    {formatDate(emp.endDate)}
                  </td>
                  <td className="px-4 py-3">
                    {emp.daysRemaining == null ? (
                      <span className="text-slate-400 text-xs">—</span>
                    ) : (
                      <span
                        className={`font-semibold text-sm
                        ${
                          emp.daysRemaining < 0
                            ? "text-red-600"
                            : emp.daysRemaining <= 30
                              ? "text-amber-600"
                              : "text-slate-700"
                        }`}
                      >
                        {emp.daysRemaining < 0
                          ? `${Math.abs(emp.daysRemaining)}d overdue`
                          : `${emp.daysRemaining}d`}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge status={emp.contractStatus} />
                  </td>
                  <td className="px-4 py-3">
                    <Badge status={emp.renewalStatus} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => onSelect(emp)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                    >
                      <Eye className="w-3 h-3" /> View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
          <span className="text-xs text-slate-500">
            Showing {(page - 1) * pageSize + 1}–
            {Math.min(page * pageSize, sorted.length)} of {sorted.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-40 text-slate-500"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-7 h-7 rounded text-xs font-medium
                  ${page === i + 1 ? "bg-blue-600 text-white" : "hover:bg-slate-100 text-slate-600"}`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-40 text-slate-500"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── UPLOAD CARD ──────────────────────────────────────────────────────────────

function UploadDocumentsCard({ toast }) {
  const [docs, setDocs] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

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

  const docTypes = {
    PDF: "text-red-600 bg-red-50",
    DOCX: "text-blue-600 bg-blue-50",
    Image: "text-purple-600 bg-purple-50",
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-50">
            <Upload className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800">
              Employee Submitted Documents
            </h3>
            <p className="text-xs text-slate-400">
              Upload documents submitted by the employee for contract renewal
            </p>
          </div>
        </div>
        <div className="p-6 space-y-5">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById("fileInput").click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer
              ${dragging ? "border-blue-400 bg-blue-50/50" : "border-slate-200 hover:border-blue-300 hover:bg-slate-50/50"}`}
          >
            <input
              id="fileInput"
              type="file"
              multiple
              className="hidden"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={(e) => handleFiles(Array.from(e.target.files))}
            />
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                <p className="text-sm text-slate-500">Uploading files...</p>
              </div>
            ) : (
              <>
                <Upload
                  className={`w-8 h-8 mx-auto mb-3 ${dragging ? "text-blue-500" : "text-slate-300"}`}
                />
                <p className="text-sm font-medium text-slate-600">
                  Drag and drop files here
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  or click to browse — PDF, DOC, DOCX, JPG, PNG · Max 10 MB each
                </p>
              </>
            )}
          </div>
          {docs.length === 0 ? (
            <EmptyState
              icon={Paperclip}
              title="No employee documents uploaded yet."
              desc="Use the area above to upload supporting documents for this renewal."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-y border-slate-100">
                  <tr>
                    {[
                      "File Name",
                      "Type",
                      "Uploaded By",
                      "Upload Date",
                      "File Size",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {docs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <File className="w-4 h-4 text-slate-400 shrink-0" />
                          <span className="text-slate-700 text-xs truncate max-w-40">
                            {doc.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${docTypes[doc.type]}`}
                        >
                          {doc.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-xs">
                        {doc.by}
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-xs whitespace-nowrap">
                        {formatDate(doc.date)}
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-xs">
                        {formatFileSize(doc.size)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-700"
                            title="View"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </a>
                          <a
                            href={doc.url}
                            download={doc.name}
                            className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-700"
                            title="Download"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                          <button
                            onClick={() => setDeleteTarget(doc)}
                            className="p-1.5 rounded hover:bg-red-50 text-slate-500 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        title="Delete Document"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete Document"
      />
    </>
  );
}

// ─── GENERATE CONTRACT CARD ───────────────────────────────────────────────────

function GenerateContractCard({ employee, toast }) {
  const [form, setForm] = useState({
    template: "",
    contractType: employee.contractType,
    startDate: "",
    endDate: "",
    salary: employee.salary?.replace?.(",", "") ?? "",
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

  function set(k, v) {
    setForm((p) => ({ ...p, [k]: v }));
  }

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

  const inputCls =
    "w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-slate-700";
  const labelCls = "block text-xs font-medium text-slate-600 mb-1.5";

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-50">
              <FileText className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-800">
                Generate Contract
              </h3>
              <p className="text-xs text-slate-400">
                Create a new employment contract for this employee
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs">
            <Info className="w-3.5 h-3.5" /> Available regardless of uploaded
            documents
          </div>
        </div>
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              ["template", "Contract Template", "select", TEMPLATES, true],
              [
                "contractType",
                "New Contract Type",
                "select",
                CONTRACT_TYPES,
                false,
              ],
              ["startDate", "Start Date", "date", null],
              ["endDate", "End Date", "date", null],
              ["salary", "Salary (PHP)", "number", null],
              ["allowances", "Allowances", "text", null],
              ["schedule", "Work Schedule", "select", SCHEDULES, false],
              ["position", "Position", "text", null],
              ["department", "Department", "text", null],
              [
                "probation",
                "Probation Status",
                "select",
                ["No", "Yes — 3 months", "Yes — 6 months"],
                false,
              ],
            ].map(([key, label, type, options, withBlank]) => (
              <div key={key}>
                <label className={labelCls}>{label}</label>
                {type === "select" ? (
                  <select
                    value={form[key]}
                    onChange={(e) => set(key, e.target.value)}
                    className={inputCls}
                  >
                    {withBlank && <option value="">Select template</option>}
                    {options.map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={type}
                    value={form[key]}
                    onChange={(e) => set(key, e.target.value)}
                    placeholder={
                      key === "allowances"
                        ? "e.g. Transportation, Meal"
                        : undefined
                    }
                    className={inputCls}
                  />
                )}
              </div>
            ))}
          </div>
          <div>
            <label className={labelCls}>Remarks</label>
            <textarea
              value={form.remarks}
              onChange={(e) => set("remarks", e.target.value)}
              rows={3}
              placeholder="Additional notes or terms..."
              className={`${inputCls} resize-none`}
            />
          </div>
          <div className="flex flex-wrap gap-3 pt-1">
            <button
              onClick={() => setPreviewing(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50"
            >
              <Eye className="w-4 h-4" /> Preview Contract
            </button>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
            >
              {generating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
              {generating ? "Generating..." : "Generate Contract"}
            </button>
            {generated && (
              <>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">
                  <Download className="w-4 h-4" /> Download PDF
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">
                  <Printer className="w-4 h-4" /> Print Contract
                </button>
              </>
            )}
          </div>
          {generated && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-semibold text-emerald-800">
                  Contract Generated Successfully
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                {[
                  ["Contract Number", generated.number],
                  ["Generated Date", generated.date],
                  ["Generated By", generated.by],
                  ["Status", generated.status],
                ].map(([k, v]) => (
                  <div key={k}>
                    <p className="text-emerald-600 font-medium">{k}</p>
                    <p className="text-emerald-900 font-semibold mt-0.5">{v}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog
        open={previewing}
        onClose={() => setPreviewing(false)}
        title="Contract Preview"
        size="lg"
      >
        <div className="text-center mb-6">
          <p className="text-xs text-slate-500 uppercase tracking-widest">
            Employment Contract
          </p>
          <h2 className="text-lg font-bold text-slate-800 mt-1">
            {form.contractType} Contract
          </h2>
        </div>
        <div className="space-y-4 text-sm text-slate-700">
          <p>
            This contract is entered into between{" "}
            <strong>{employee.name}</strong> (Employee) and the Company.
          </p>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 border border-slate-100 rounded-lg p-4 bg-slate-50">
            {[
              ["Position", form.position],
              ["Department", form.department],
              ["Start Date", formatDate(form.startDate)],
              ["End Date", formatDate(form.endDate)],
              ["Salary", `PHP ${Number(form.salary).toLocaleString()}`],
              ["Schedule", form.schedule],
              ["Probation", form.probation],
              ["Allowances", form.allowances || "None"],
            ].map(([k, v]) => (
              <div key={k}>
                <span className="text-xs text-slate-500">{k}: </span>
                <span className="font-medium">{v || "—"}</span>
              </div>
            ))}
          </div>
          {form.remarks && (
            <p>
              <strong>Remarks:</strong> {form.remarks}
            </p>
          )}
          <p className="text-xs text-slate-400 pt-4 border-t border-slate-100">
            Preview only. Review all details before generating the final
            contract.
          </p>
        </div>
        <div className="flex justify-end gap-3 mt-5">
          <button
            onClick={() => setPreviewing(false)}
            className="px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50"
          >
            Close Preview
          </button>
          <button
            onClick={() => {
              setPreviewing(false);
              handleGenerate();
            }}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
          >
            Confirm &amp; Generate
          </button>
        </div>
      </Dialog>
    </>
  );
}

// ─── RENEWAL TIMELINE ─────────────────────────────────────────────────────────

function RenewalTimeline() {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-5">
        <Clock className="w-4 h-4 text-slate-400" />
        <h3 className="text-sm font-semibold text-slate-800">
          Renewal Timeline
        </h3>
      </div>
      <div className="relative">
        <div className="absolute left-5 top-5 bottom-5 w-px bg-slate-100" />
        <div className="space-y-5">
          {TIMELINE_STEPS_TEMPLATE.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="flex items-start gap-4 relative">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 border-2
                  ${step.done ? "bg-blue-600 border-blue-600" : "bg-white border-slate-200"}`}
                >
                  <Icon
                    className={`w-4 h-4 ${step.done ? "text-white" : "text-slate-300"}`}
                  />
                </div>
                <div className="pt-1.5">
                  <p
                    className={`text-sm font-medium ${step.done ? "text-slate-800" : "text-slate-400"}`}
                  >
                    {step.label}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {step.date ? formatDate(step.date) : "Pending"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── RENEWAL HISTORY ──────────────────────────────────────────────────────────

function RenewalHistoryTable({ employee }) {
  const rows = useMemo(() => defaultHistory(employee), [employee]);
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
        <History className="w-4 h-4 text-slate-400" />
        <h3 className="text-sm font-semibold text-slate-800">
          Renewal History
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              {[
                "Contract Number",
                "Contract Type",
                "Effective Date",
                "End Date",
                "Generated By",
                "Status",
              ].map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {rows.map((row) => (
              <tr key={row.contractNumber} className="hover:bg-slate-50/60">
                <td className="px-4 py-3 font-mono text-xs text-slate-600">
                  {row.contractNumber}
                </td>
                <td className="px-4 py-3 text-slate-600">{row.type}</td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                  {formatDate(row.effective)}
                </td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                  {formatDate(row.end)}
                </td>
                <td className="px-4 py-3 text-slate-600">{row.by}</td>
                <td className="px-4 py-3">
                  <Badge status={row.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── EMPLOYEE CONTRACT CARD ───────────────────────────────────────────────────

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
      "Contract Number",
      contract?.id ? `CTR-${contract.id}` : employee.contractNumber,
    ],
    ["Employment Type", employee.employmentType],
    ["Start Date", formatDate(startDate)],
    ["End Date", formatDate(endDate)],
    ["Salary", salary ? `PHP ${Number(salary).toLocaleString()}` : "—"],
    ["Work Schedule", employee.schedule],
    ["Employment Status", employee.employmentStatus],
    [
      "Days Remaining",
      daysRemaining == null
        ? "—"
        : daysRemaining < 0
          ? `${Math.abs(daysRemaining)} days overdue`
          : `${daysRemaining} days`,
    ],
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <FileCheck className="w-4 h-4 text-slate-400" />
        <h3 className="text-sm font-semibold text-slate-800">
          Current Contract
        </h3>
      </div>
      <div className="grid grid-cols-2 gap-x-8 gap-y-4">
        {fields.map(([k, v]) => (
          <div key={k}>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">
              {k}
            </p>
            <p
              className={`text-sm font-medium mt-0.5
              ${
                k === "Days Remaining" &&
                daysRemaining != null &&
                daysRemaining < 0
                  ? "text-red-600"
                  : "text-slate-800"
              }`}
            >
              {v}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── DETAIL PAGE ──────────────────────────────────────────────────────────────

function EmployeeRenewalDetails({ employeeId, listSnapshot, onBack, toast }) {
  const { employee: fetched, loading, error } = useEmployeeDetail(employeeId);
  const employee = fetched ?? listSnapshot;

  // ── FIX: Extracted into dedicated hook with uppercase-safe name matching ──
  const { activeContract, setActiveContract, contractLoading } =
    useActiveContract(employee);

  if (loading && !employee) {
    return (
      <div className="space-y-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="w-4 h-4" /> Back to List
        </button>
        <CardSkeleton />
      </div>
    );
  }

  if (error && !employee) {
    return (
      <div className="space-y-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="w-4 h-4" /> Back to List
        </button>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
          <ErrorState message={error} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to List
        </button>
        <span className="text-slate-200">/</span>
        <span className="text-sm text-slate-800 font-medium">
          {employee.name}
        </span>
        {(loading || contractLoading) && (
          <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin" />
        )}
      </div>

      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <img
            src={employee.photo}
            alt={employee.name}
            className="w-16 h-16 rounded-xl"
            onError={(e) => (e.target.style.display = "none")}
          />
          <div className="flex-1">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <p className="text-xs font-mono text-slate-400">
                  {employee.employeeNumber}
                </p>
                <h2 className="text-xl font-bold text-slate-800 mt-0.5">
                  {employee.name}
                </h2>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Building className="w-3.5 h-3.5" />
                    {employee.department}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5" />
                    {employee.position}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {employee.employmentType}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge status={employee.contractStatus} />
                <Badge status={employee.renewalStatus} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <EmployeeContractCard employee={employee} contract={activeContract} />

          {/* ── AutoRenewalPanel — only shown when a matching active contract exists ── */}
          {activeContract ? (
            <AutoRenewalPanel
              contract={activeContract}
              toast={toast}
              onUpdated={(updated) => setActiveContract(updated)}
            />
          ) : (
            !contractLoading && (
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
                <div className="flex items-center gap-2 text-slate-400">
                  <Info className="w-4 h-4" />
                  <p className="text-sm">
                    No active contract found in the hiring module for this
                    employee. Create one via the{" "}
                    <strong>Hiring → Contracts</strong> section first.
                  </p>
                </div>
              </div>
            )
          )}

          <UploadDocumentsCard toast={toast} />
          <GenerateContractCard employee={employee} toast={toast} />
          <RenewalHistoryTable employee={employee} />
        </div>
        <div className="space-y-6">
          <RenewalTimeline />
        </div>
      </div>
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

  function handleFilter(k, v) {
    setFilters((p) => ({ ...p, [k]: v }));
  }
  function resetFilters() {
    setFilters({
      search: "",
      department: "",
      contractStatus: "",
      renewalStatus: "",
    });
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-30">
        <div className="max-w-screen-2xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <ClipboardList className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs text-slate-400 leading-none">HRMS</p>
              <p className="text-sm font-semibold text-slate-800 leading-tight">
                Contract Renewal
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Calendar className="w-3.5 h-3.5" />
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {selected ? (
          <EmployeeRenewalDetails
            employeeId={selected.id}
            listSnapshot={selected.snapshot}
            onBack={() => setSelected(null)}
            toast={toast}
          />
        ) : (
          <>
            <div>
              <h1 className="text-lg font-bold text-slate-800">
                Employee Contract Renewals
              </h1>
              {/* FIX: Clarify scope — Plantilla excluded */}
              <p className="text-sm text-slate-400 mt-0.5">
                Manage renewals for Contract of Service and Consultant
                employees. Plantilla positions are excluded.
              </p>
            </div>
            <SummaryCards employees={filtered} />
            <RenewalFilters
              filters={filters}
              onChange={handleFilter}
              onReset={resetFilters}
              departments={departments}
            />
            {!loading && !error && (
              <p className="text-xs text-slate-500">
                {filtered.length} COS/Consultant employee(s) found
              </p>
            )}
            <EmployeeRenewalTable
              employees={filtered}
              loading={loading}
              error={error}
              onRetry={reload}
              onSelect={(emp) => setSelected({ id: emp.id, snapshot: emp })}
            />
          </>
        )}
      </main>

      <Toast toasts={toast.toasts} remove={toast.remove} />
    </div>
  );
}

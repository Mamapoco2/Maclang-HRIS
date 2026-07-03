import React, {
  useState,
  useMemo,
  useRef,
  useCallback,
  useEffect,
} from "react";
import {
  BriefcaseBusiness,
  Plus,
  Download,
  Search,
  RotateCcw,
  RefreshCw,
  Eye,
  Pencil,
  Trash2,
  FileText,
  X,
  Upload,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Users,
  Clock,
  Briefcase,
  UserCheck,
  Building2,
  GraduationCap,
  Award,
  ClipboardList,
  Paperclip,
  Loader2,
  SlidersHorizontal,
  ChevronUp,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/api/api";
import { plantillaPostingService } from "../../../services/plantillaPostingService";
import { useContext } from "react";
import { AuthContext } from "@/context/authContext";

const EMP_STATUS = ["Permanent", "Casual", "Job Order", "Contractual"];
const DOC_KEYS = [
  { key: "resume", label: "Updated Resume" },
  { key: "pds", label: "Personal Data Sheet" },
  { key: "transcript", label: "Transcript of Records" },
  { key: "diploma", label: "Diploma" },
  { key: "eligibility", label: "Eligibility Certificate" },
  { key: "certificates", label: "Training Certificates" },
  { key: "others", label: "Other Supporting Documents" },
];
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const STATUS_STYLES = {
  Open: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  "Closing Soon": "bg-amber-50 text-amber-700 ring-amber-600/20",
  Closed: "bg-rose-50 text-rose-700 ring-rose-600/20",
  Filled: "bg-slate-100 text-slate-600 ring-slate-500/20",
};
const STATUS_DOT = {
  Open: "bg-emerald-500",
  "Closing Soon": "bg-amber-500",
  Closed: "bg-rose-500",
  Filled: "bg-slate-400",
};

function normalisePosting(p) {
  return {
    id: p.id,
    baseItemNumber: p.base_item_number,
    positionTitle: p.title,
    officeId: p.display_department_id,
    office: p.department?.name || "—",
    divisionId: p.display_division_id,
    division: p.division?.name || "—",
    section: p.section || "",
    salaryGradeId: p.salary_grade_id,
    salaryGrade: p.salary_grade?.salary_grade
      ? `SG-${p.salary_grade.salary_grade}`
      : "—",
    stepIncrementId: p.step_increment_id,
    monthlySalary: Number(p.monthly_salary || 0),
    employmentStatus: p.employment_status,
    vacancies: p.vacancies,
    vacantSlots: p.vacant_slots,
    remainingVacancies: p.remaining_vacancies,
    datePosted: p.date_posted,
    closingDate: p.closing_date,
    expectedAppointmentDate: p.expected_appointment_date,
    status: p.effective_status || p.status,
    applicants: p.applications_count ?? 0,
    immediateSupervisor: p.immediate_supervisor || "—",
    qualifications: {
      education: p.qualification_education || "",
      experience: p.qualification_experience || "",
      training: p.qualification_training || "",
      eligibility: p.qualification_eligibility || "",
      competency: p.qualification_competency || "",
    },
    jobDescription: p.job_description || "",
    requiredDocuments: p.required_documents || {},
  };
}

function formatCurrency(n) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(n || 0);
}
function formatDate(d) {
  if (!d) return "—";
  return new Date(d + "T00:00:00").toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function Button({
  variant = "default",
  size = "md",
  className = "",
  children,
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50";
  const variants = {
    default: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm",
    secondary:
      "bg-white text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50",
    ghost: "text-slate-600 hover:bg-slate-100",
    destructive: "bg-rose-600 text-white hover:bg-rose-700 shadow-sm",
  };
  const sizes = { sm: "h-8 px-3 text-xs", md: "h-9 px-4", icon: "h-9 w-9" };
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
function Input({ className = "", ...props }) {
  return (
    <input
      className={`h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${className}`}
      {...props}
    />
  );
}
function Textarea({ className = "", ...props }) {
  return (
    <textarea
      className={`w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${className}`}
      {...props}
    />
  );
}
function Label({ children, required, className = "" }) {
  return (
    <label
      className={`mb-1.5 block text-xs font-medium text-slate-700 ${className}`}
    >
      {children}
      {required && <span className="ml-0.5 text-rose-500">*</span>}
    </label>
  );
}
function FieldError({ children }) {
  if (!children) return null;
  return <p className="mt-1 text-xs text-rose-600">{children}</p>;
}
function Select({ value, onChange, options, placeholder, className = "" }) {
  return (
    <div className="relative">
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className={`h-9 w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 pr-8 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${className}`}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  );
}
function Switch({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2"
    >
      <span className="text-sm text-slate-700">{label}</span>
      <span
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${checked ? "bg-indigo-600" : "bg-slate-300"}`}
      >
        <span
          className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
          style={{
            transform: checked ? "translateX(18px)" : "translateX(2px)",
          }}
        />
      </span>
    </button>
  );
}
function Checkbox({ checked, onChange }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`flex shrink-0 items-center justify-center rounded border transition-colors ${checked ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 bg-white"}`}
      style={{ height: "18px", width: "18px" }}
    >
      {checked && <Check className="h-3 w-3" strokeWidth={3} />}
    </button>
  );
}
function Skeleton({ className = "" }) {
  return (
    <div className={`animate-pulse rounded-md bg-slate-200 ${className}`} />
  );
}
function Modal({ open, onClose, children, widthClass = "max-w-lg" }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`relative z-10 max-h-[90vh] w-full ${widthClass} overflow-y-auto rounded-xl bg-white shadow-xl ring-1 ring-slate-200`}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </div>
  );
}
function DrawerPanel({ open, onClose, children }) {
  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity ${open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
    >
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-xl transform overflow-y-auto bg-white shadow-2xl transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, tone }) {
  const tones = {
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    sky: "bg-sky-50 text-sky-600",
  };
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-900">
            {value}
          </p>
          <p className="mt-1 text-xs text-slate-400">{sub}</p>
        </div>
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${tones[tone]}`}
        >
          <Icon style={{ height: 18, width: 18 }} />
        </div>
      </div>
    </div>
  );
}
function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-xl border border-slate-200 bg-white p-4"
        >
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-2 h-7 w-16" />
          <Skeleton className="mt-2 h-3 w-32" />
        </div>
      ))}
    </div>
  );
}

function UploadCard({ label, file, onFile, onRemove, error }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const handleFiles = (files) => {
    const f = files?.[0];
    if (!f) return;
    onFile(f, /\.(pdf|doc|docx)$/i.test(f.name), f.size <= 10 * 1024 * 1024);
  };
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        handleFiles(e.dataTransfer.files);
      }}
      className={`relative rounded-lg border-2 border-dashed p-3 transition-colors ${dragOver ? "border-indigo-500 bg-indigo-50" : error ? "border-rose-300 bg-rose-50/50" : "border-slate-200 bg-slate-50"}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white text-slate-500 ring-1 ring-slate-200">
            <Paperclip className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-700">{label}</p>
            <p className="truncate text-xs text-slate-400">
              {file ? file.name : "PDF, DOC, DOCX up to 10MB"}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {file ? (
            <>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="rounded-md px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50"
              >
                Replace
              </button>
              <button
                type="button"
                onClick={onRemove}
                className="rounded-md p-1.5 text-slate-400 hover:bg-slate-200 hover:text-rose-600"
                aria-label={`Remove ${label}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-1 rounded-md bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
            >
              <Upload className="h-3.5 w-3.5" />
              Upload
            </button>
          )}
        </div>
      </div>
      {error && <p className="mt-1.5 text-xs text-rose-600">{error}</p>}
    </div>
  );
}

const EMPTY_FORM = {
  base_item_number: "",
  title: "",
  display_department_id: "",
  display_division_id: "",
  section: "",
  salary_grade_id: "",
  monthly_salary: "",
  employment_status: "",
  vacancies: "",
  qualification_education: "",
  qualification_experience: "",
  qualification_training: "",
  qualification_eligibility: "",
  qualification_competency: "",
  job_description: "",
  date_posted: "",
  closing_date: "",
  expected_appointment_date: "",
  status: "Open",
  required_documents: {
    resume: true,
    pds: true,
    transcript: false,
    diploma: false,
    eligibility: false,
    certificates: false,
    others: false,
  },
};

export default function PlantillaPostingPage() {
  const { user, hasPermission, hasRole } = useContext(AuthContext) || {};
  const isAdmin =
    !!hasPermission?.("manage-plantilla-postings") || !!hasRole?.("SuperAdmin");

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [salaryGrades, setSalaryGrades] = useState([]);
  const [vacantItems, setVacantItems] = useState([]);

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    department_id: "",
    division_id: "",
    salary_grade_id: "",
    employment_status: "",
    status: "",
  });
  const [sortBy, setSortBy] = useState("Newest");
  const [showFilters, setShowFilters] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const [viewItem, setViewItem] = useState(null);
  const [applyItem, setApplyItem] = useState(null);
  const [editItem, setEditItem] = useState(undefined);
  const [deleteItem, setDeleteItem] = useState(null);
  const [applySuccess, setApplySuccess] = useState(false);

  /* ---------------- data loading ---------------- */

  const loadPostings = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        per_page: pageSize,
        search: search || undefined,
        department_id: filters.department_id || undefined,
        division_id: filters.division_id || undefined,
        salary_grade_id: filters.salary_grade_id || undefined,
        employment_status: filters.employment_status || undefined,
        status: filters.status || undefined,
      };
      const fetcher = isAdmin
        ? plantillaPostingService.getPostings
        : plantillaPostingService.getAvailablePostings;
      const res = await fetcher(params);
      const raw = res.data ?? res;
      setItems(raw.map(normalisePosting));
      setTotalCount(res.total ?? raw.length);
    } catch (err) {
      console.error(err);
      toast?.error?.("Hindi ma-load ang mga plantilla postings.");
    } finally {
      setLoading(false);
    }
  }, [isAdmin, page, pageSize, search, filters]);

  useEffect(() => {
    loadPostings();
  }, [loadPostings]);

  useEffect(() => {
    api
      .get("/departments")
      .then((res) => setDepartments(res.data?.data ?? res.data ?? []))
      .catch(console.error);
    api
      .get("/divisions")
      .then((res) => setDivisions(res.data?.data ?? res.data ?? []))
      .catch(console.error);
    plantillaPostingService.getPostings?.({ per_page: 1 }).catch(() => {}); // warm auth, ignore
    api
      .get("/salary-grades")
      .then((res) => setSalaryGrades(res.data?.data ?? res.data ?? []))
      .catch(console.error);
    if (isAdmin) {
      plantillaPostingService
        .getVacantItems()
        .then(setVacantItems)
        .catch(console.error);
    }
  }, [isAdmin]);

  const sorted = useMemo(() => {
    const list = [...items];
    list.sort((a, b) => {
      switch (sortBy) {
        case "Oldest":
          return new Date(a.datePosted) - new Date(b.datePosted);
        case "Salary Grade":
          return (
            parseInt(b.salaryGrade.replace(/\D/g, "")) -
            parseInt(a.salaryGrade.replace(/\D/g, ""))
          );
        case "Position Name":
          return a.positionTitle.localeCompare(b.positionTitle);
        default:
          return new Date(b.datePosted) - new Date(a.datePosted);
      }
    });
    return list;
  }, [items, sortBy]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const stats = useMemo(
    () => ({
      totalVacancies: items.reduce(
        (s, i) => s + (i.vacantSlots ?? i.vacancies),
        0,
      ),
      open: items.filter((i) => i.status === "Open").length,
      closingSoon: items.filter((i) => i.status === "Closing Soon").length,
      totalApplicants: items.reduce((s, i) => s + i.applicants, 0),
    }),
    [items],
  );

  const resetFilters = () => {
    setSearch("");
    setFilters({
      department_id: "",
      division_id: "",
      salary_grade_id: "",
      employment_status: "",
      status: "",
    });
    setSortBy("Newest");
    setPage(1);
  };

  const handleDelete = async () => {
    try {
      await plantillaPostingService.deletePosting(deleteItem.id);
      toast?.success?.("Naalis na ang posting.");
      setDeleteItem(null);
      loadPostings();
    } catch (err) {
      toast?.error?.(
        err?.response?.data?.message ?? "Hindi na-delete ang posting.",
      );
    }
  };

  const handleExport = () => {
    const rows = [
      [
        "Item No.",
        "Position Title",
        "Office",
        "Division",
        "Salary Grade",
        "Monthly Salary",
        "Employment Status",
        "Vacancies",
        "Date Posted",
        "Closing Date",
        "Applicants",
        "Status",
      ],
      ...sorted.map((i) => [
        i.baseItemNumber,
        i.positionTitle,
        i.office,
        i.division,
        i.salaryGrade,
        i.monthlySalary,
        i.employmentStatus,
        i.vacantSlots ?? i.vacancies,
        i.datePosted,
        i.closingDate,
        i.applicants,
        i.status,
      ]),
    ];
    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "plantilla-postings.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-full w-full bg-slate-50 font-sans text-slate-900 antialiased">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <BriefcaseBusiness style={{ height: 22, width: 22 }} />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                {isAdmin ? "Plantilla Postings" : "Available Plantilla Items"}
              </h1>
              <p className="mt-0.5 text-sm text-slate-500">
                {isAdmin
                  ? "Post vacant plantilla items and review applicants."
                  : "View and apply for available plantilla positions."}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {isAdmin && (
              <>
                <Button variant="secondary" size="sm" onClick={handleExport}>
                  <Download className="h-4 w-4" />
                  Export List
                </Button>
                <Button
                  size="sm"
                  onClick={() =>
                    setEditItem({ mode: "create", data: EMPTY_FORM })
                  }
                >
                  <Plus className="h-4 w-4" />
                  New Posting
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6">
          {loading ? (
            <StatsSkeleton />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                icon={Briefcase}
                label="Total Vacancies"
                value={stats.totalVacancies}
                sub="Across all postings"
                tone="indigo"
              />
              <StatCard
                icon={CheckCircle2}
                label="Open Positions"
                value={stats.open}
                sub="Currently accepting applicants"
                tone="emerald"
              />
              <StatCard
                icon={Clock}
                label="Closing Soon"
                value={stats.closingSoon}
                sub="Closing within the week"
                tone="amber"
              />
              <StatCard
                icon={Users}
                label="Total Applicants"
                value={stats.totalApplicants}
                sub="Submitted applications"
                tone="sky"
              />
            </div>
          )}
        </div>

        {/* Search & Filters */}
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search position, item number..."
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={sortBy}
                onChange={setSortBy}
                options={[
                  "Newest",
                  "Oldest",
                  "Salary Grade",
                  "Position Name",
                ].map((v) => ({ value: v, label: v }))}
                placeholder="Sort by"
                className="w-40"
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowFilters((s) => !s)}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {showFilters ? (
                  <ChevronUp className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
              </Button>
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={loadPostings}
                aria-label="Refresh"
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 sm:grid-cols-3 lg:grid-cols-5">
              <Select
                value={filters.department_id}
                onChange={(v) => {
                  setFilters((f) => ({ ...f, department_id: v }));
                  setPage(1);
                }}
                options={departments.map((d) => ({
                  value: String(d.id),
                  label: d.name,
                }))}
                placeholder="Office"
              />
              <Select
                value={filters.division_id}
                onChange={(v) => {
                  setFilters((f) => ({ ...f, division_id: v }));
                  setPage(1);
                }}
                options={divisions.map((d) => ({
                  value: String(d.id),
                  label: d.name,
                }))}
                placeholder="Division"
              />
              <Select
                value={filters.salary_grade_id}
                onChange={(v) => {
                  setFilters((f) => ({ ...f, salary_grade_id: v }));
                  setPage(1);
                }}
                options={salaryGrades.map((sg) => ({
                  value: String(sg.id),
                  label: `SG-${sg.salary_grade}`,
                }))}
                placeholder="Salary Grade"
              />
              <Select
                value={filters.employment_status}
                onChange={(v) => {
                  setFilters((f) => ({ ...f, employment_status: v }));
                  setPage(1);
                }}
                options={EMP_STATUS.map((v) => ({ value: v, label: v }))}
                placeholder="Employment Status"
              />
              <Select
                value={filters.status}
                onChange={(v) => {
                  setFilters((f) => ({ ...f, status: v }));
                  setPage(1);
                }}
                options={["Open", "Closing Soon", "Closed", "Filled"].map(
                  (v) => ({ value: v, label: v }),
                )}
                placeholder="Vacancy Status"
              />
            </div>
          )}
        </div>

        {/* List */}
        <div className="mt-6">
          {loading ? (
            <TableSkeleton />
          ) : sorted.length === 0 ? (
            <EmptyState
              onCreate={() => setEditItem({ mode: "create", data: EMPTY_FORM })}
              showCreate={isAdmin}
            />
          ) : (
            <>
              <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:block">
                <div className="max-h-[560px] overflow-auto">
                  <table className="w-full min-w-[1100px] border-collapse text-left text-sm">
                    <thead className="sticky top-0 z-10 bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500">
                      <tr>
                        <Th>Item No.</Th>
                        <Th>Position Title</Th>
                        <Th>Office</Th>
                        <Th>Division</Th>
                        <Th>Salary Grade</Th>
                        <Th>Monthly Salary</Th>
                        <Th>Employment Status</Th>
                        <Th>Vacancies</Th>
                        <Th>Date Posted</Th>
                        <Th>Closing Date</Th>
                        <Th>Applicants</Th>
                        <Th>Status</Th>
                        <Th className="text-right">Actions</Th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sorted.map((it) => (
                        <tr
                          key={it.id}
                          className="transition-colors hover:bg-slate-50"
                        >
                          <Td className="font-medium text-slate-700">
                            {it.baseItemNumber}
                          </Td>
                          <Td className="max-w-[220px] truncate font-medium text-slate-900">
                            {it.positionTitle}
                          </Td>
                          <Td className="text-slate-500">{it.office}</Td>
                          <Td className="text-slate-500">{it.division}</Td>
                          <Td>{it.salaryGrade}</Td>
                          <Td className="whitespace-nowrap">
                            {formatCurrency(it.monthlySalary)}
                          </Td>
                          <Td className="text-slate-500">
                            {it.employmentStatus}
                          </Td>
                          <Td>{it.vacantSlots ?? it.vacancies}</Td>
                          <Td className="whitespace-nowrap text-slate-500">
                            {formatDate(it.datePosted)}
                          </Td>
                          <Td className="whitespace-nowrap text-slate-500">
                            {formatDate(it.closingDate)}
                          </Td>
                          <Td>{it.applicants}</Td>
                          <Td>
                            <StatusBadge status={it.status} />
                          </Td>
                          <Td className="text-right">
                            <RowActions
                              item={it}
                              isAdmin={isAdmin}
                              onView={() => setViewItem(it)}
                              onEdit={() =>
                                setEditItem({ mode: "edit", data: it })
                              }
                              onDelete={() => setDeleteItem(it)}
                              onApply={() => setApplyItem(it)}
                            />
                          </Td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:hidden">
                {sorted.map((it) => (
                  <div
                    key={it.id}
                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {it.positionTitle}
                        </p>
                        <p className="text-xs text-slate-400">
                          {it.baseItemNumber}
                        </p>
                      </div>
                      <StatusBadge status={it.status} />
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-y-1.5 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5" /> {it.office}
                      </div>
                      <div>SG: {it.salaryGrade}</div>
                      <div className="col-span-2 font-medium text-slate-700">
                        {formatCurrency(it.monthlySalary)} / mo
                      </div>
                      <div>Vacancies: {it.vacantSlots ?? it.vacancies}</div>
                      <div>Closes: {formatDate(it.closingDate)}</div>
                    </div>
                    <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1"
                        onClick={() => setViewItem(it)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View Details
                      </Button>
                      {!isAdmin ? (
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => setApplyItem(it)}
                          disabled={
                            it.status === "Closed" || it.status === "Filled"
                          }
                        >
                          <FileText className="h-3.5 w-3.5" />
                          Apply
                        </Button>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              setEditItem({ mode: "edit", data: it })
                            }
                            aria-label="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteItem(it)}
                            aria-label="Delete"
                          >
                            <Trash2 className="h-4 w-4 text-rose-500" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <Pagination
                total={totalCount}
                page={page}
                pageSize={pageSize}
                totalPages={totalPages}
                onPageChange={setPage}
                onPageSizeChange={(v) => {
                  setPageSize(v);
                  setPage(1);
                }}
              />
            </>
          )}
        </div>
      </div>

      <ViewDrawer
        item={viewItem}
        onClose={() => setViewItem(null)}
        isAdmin={isAdmin}
        onApply={() => {
          setApplyItem(viewItem);
          setViewItem(null);
        }}
      />

      <ApplyDialog
        item={applyItem}
        user={user}
        onClose={() => setApplyItem(null)}
        onSuccess={() => {
          setApplyItem(null);
          setApplySuccess(true);
          loadPostings();
        }}
      />

      <Modal
        open={applySuccess}
        onClose={() => setApplySuccess(false)}
        widthClass="max-w-sm"
      >
        <div className="p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-slate-900">
            Application submitted
          </h3>
          <p className="mt-1.5 text-sm text-slate-500">
            Your application has been received. You can track its status from
            your applications page.
          </p>
          <Button
            className="mt-5 w-full"
            onClick={() => setApplySuccess(false)}
          >
            Done
          </Button>
        </div>
      </Modal>

      <EditDialog
        state={editItem}
        onClose={() => setEditItem(undefined)}
        departments={departments}
        divisions={divisions}
        salaryGrades={salaryGrades}
        vacantItems={vacantItems}
        onSave={async (data, mode) => {
          try {
            if (mode === "create")
              await plantillaPostingService.createPosting(data);
            else await plantillaPostingService.updatePosting(data.id, data);
            toast?.success?.(
              mode === "create" ? "Naipost na." : "Na-update na.",
            );
            setEditItem(undefined);
            loadPostings();
          } catch (err) {
            toast?.error?.(
              err?.response?.data?.message ?? "May error sa pag-save.",
            );
          }
        }}
      />

      <Modal
        open={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        widthClass="max-w-sm"
      >
        {deleteItem && (
          <div className="p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-50 text-rose-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-slate-900">
              Delete posting
            </h3>
            <p className="mt-1.5 text-sm text-slate-500">
              This posting will be removed. This action cannot be undone.
            </p>
            <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
              {deleteItem.positionTitle} · {deleteItem.baseItemNumber}
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setDeleteItem(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${STATUS_STYLES[status]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[status]}`} />
      {status}
    </span>
  );
}
function Th({ children, className = "" }) {
  return (
    <th
      className={`whitespace-nowrap px-4 py-3 text-left font-medium ${className}`}
    >
      {children}
    </th>
  );
}
function Td({ children, className = "" }) {
  return (
    <td className={`px-4 py-3 text-slate-700 ${className}`}>{children}</td>
  );
}

function RowActions({ item, isAdmin, onView, onEdit, onDelete, onApply }) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Button variant="ghost" size="icon" onClick={onView} aria-label="View">
        <Eye className="h-4 w-4" />
      </Button>
      {isAdmin ? (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
            aria-label="Edit"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            aria-label="Delete"
          >
            <Trash2 className="h-4 w-4 text-rose-500" />
          </Button>
        </>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          onClick={onApply}
          aria-label="Apply"
          disabled={item.status === "Closed" || item.status === "Filled"}
        >
          <FileText className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
function TableSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="ml-auto h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
function EmptyState({ onCreate, showCreate }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <BriefcaseBusiness className="h-8 w-8" />
      </div>
      <p className="mt-4 text-sm font-medium text-slate-600">
        No available plantilla items found.
      </p>
      <p className="mt-1 text-xs text-slate-400">
        Try adjusting your search or filters.
      </p>
      {showCreate && (
        <Button className="mt-5" onClick={onCreate}>
          <Plus className="h-4 w-4" />
          Create Posting
        </Button>
      )}
    </div>
  );
}
function Pagination({
  total,
  page,
  pageSize,
  totalPages,
  onPageChange,
  onPageSizeChange,
}) {
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  const pages = useMemo(() => {
    const arr = [];
    const maxShown = 5;
    let from = Math.max(1, page - Math.floor(maxShown / 2));
    let to = Math.min(totalPages, from + maxShown - 1);
    from = Math.max(1, to - maxShown + 1);
    for (let p = from; p <= to; p++) arr.push(p);
    return arr;
  }, [page, totalPages]);
  return (
    <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span>
          Showing {start}–{end} of {total} results
        </span>
        <span className="hidden sm:inline">·</span>
        <span className="hidden items-center gap-1.5 sm:flex">
          Rows per page
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="rounded-md border border-slate-200 bg-white px-1.5 py-1 text-xs"
          >
            {PAGE_SIZE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </span>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Previous
        </Button>
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`h-8 w-8 rounded-lg text-xs font-medium transition-colors ${p === page ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}
          >
            {p}
          </button>
        ))}
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
        >
          Next
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

function ViewDrawer({ item, onClose, isAdmin, onApply }) {
  if (!item) return <DrawerPanel open={false} onClose={onClose} />;
  const docsRequired = DOC_KEYS.filter((d) => item.requiredDocuments[d.key]);
  return (
    <DrawerPanel open={!!item} onClose={onClose}>
      <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-indigo-600">
            {item.baseItemNumber}
          </p>
          <h2 className="mt-0.5 text-lg font-semibold text-slate-900">
            {item.positionTitle}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="space-y-6 px-6 py-5">
        <StatusBadge status={item.status} />
        <Section title="Position Information" icon={Briefcase}>
          <InfoGrid
            rows={[
              ["Position Title", item.positionTitle],
              ["Item Number", item.baseItemNumber],
              ["Salary Grade", item.salaryGrade],
              ["Monthly Salary", formatCurrency(item.monthlySalary)],
              ["Employment Status", item.employmentStatus],
              ["Vacancy Count", item.vacantSlots ?? item.vacancies],
            ]}
          />
        </Section>
        <Section title="Assignment" icon={Building2}>
          <InfoGrid
            rows={[
              ["Office", item.office],
              ["Division", item.division],
              ["Section", item.section || "—"],
              ["Immediate Supervisor", item.immediateSupervisor],
            ]}
          />
        </Section>
        <Section title="Qualification Standards" icon={GraduationCap}>
          <InfoGrid
            stacked
            rows={[
              ["Education", item.qualifications.education || "—"],
              ["Experience", item.qualifications.experience || "—"],
              ["Training", item.qualifications.training || "—"],
              ["Eligibility", item.qualifications.eligibility || "—"],
              ["Competency", item.qualifications.competency || "—"],
            ]}
          />
        </Section>
        <Section title="Job Description" icon={ClipboardList}>
          <div className="max-h-40 overflow-y-auto rounded-lg bg-slate-50 p-3 text-sm leading-relaxed text-slate-600">
            {item.jobDescription}
          </div>
        </Section>
        <Section title="Required Documents" icon={Award}>
          <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {docsRequired.length === 0 && (
              <li className="text-sm text-slate-400">
                No specific documents required.
              </li>
            )}
            {docsRequired.map((d) => (
              <li
                key={d.key}
                className="flex items-center gap-2 text-sm text-slate-600"
              >
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                {d.label}
              </li>
            ))}
          </ul>
        </Section>
        <Section title="Application Information" icon={UserCheck}>
          <InfoGrid
            rows={[
              ["Current Applicants", item.applicants],
              ["Remaining Slots", item.remainingVacancies ?? item.vacantSlots],
              ["Posting Date", formatDate(item.datePosted)],
              ["Closing Date", formatDate(item.closingDate)],
              [
                "Expected Appointment Date",
                formatDate(item.expectedAppointmentDate),
              ],
            ]}
          />
        </Section>
      </div>
      <div className="sticky bottom-0 flex gap-2 border-t border-slate-200 bg-white px-6 py-4">
        <Button variant="secondary" className="flex-1" onClick={onClose}>
          Close
        </Button>
        {!isAdmin && (
          <Button
            className="flex-1"
            onClick={onApply}
            disabled={item.status === "Closed" || item.status === "Filled"}
          >
            <FileText className="h-4 w-4" />
            Apply Now
          </Button>
        )}
      </div>
    </DrawerPanel>
  );
}
function Section({ title, icon: Icon, children }) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <Icon className="h-4 w-4 text-slate-400" />
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}
function InfoGrid({ rows, stacked }) {
  return (
    <dl
      className={`grid gap-x-4 gap-y-2 text-sm ${stacked ? "grid-cols-1" : "grid-cols-2"}`}
    >
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt className="text-xs text-slate-400">{label}</dt>
          <dd className="text-slate-700">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function ApplyDialog({ item, user, onClose, onSuccess }) {
  const [files, setFiles] = useState({});
  const [fileErrors, setFileErrors] = useState({});
  const [notes, setNotes] = useState("");
  const [certified, setCertified] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [attempted, setAttempted] = useState(false);

  const resetLocal = useCallback(() => {
    setFiles({});
    setFileErrors({});
    setNotes("");
    setCertified(false);
    setSubmitting(false);
    setAttempted(false);
  }, []);

  if (!item) return <Modal open={false} onClose={onClose} />;

  const requiredDocs = DOC_KEYS.filter((d) => item.requiredDocuments[d.key]);
  const allRequiredUploaded = requiredDocs.every((d) => files[d.key]);
  const canSubmit = allRequiredUploaded && certified && !submitting;

  const handleFile = (key, file, okType, okSize) => {
    if (!okType) {
      setFileErrors((e) => ({
        ...e,
        [key]: "Only PDF, DOC, or DOCX files are accepted.",
      }));
      return;
    }
    if (!okSize) {
      setFileErrors((e) => ({ ...e, [key]: "File must not exceed 10MB." }));
      return;
    }
    setFileErrors((e) => ({ ...e, [key]: undefined }));
    setFiles((f) => ({ ...f, [key]: file }));
  };

  const handleSubmit = async () => {
    setAttempted(true);
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await plantillaPostingService.applyToPosting(item.id, {
        notes,
        certified,
        documents: files,
      });
      resetLocal();
      onSuccess();
    } catch (err) {
      toast?.error?.(
        err?.response?.data?.message ?? "Hindi na-submit ang application.",
      );
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    resetLocal();
    onClose();
  };
  const employee = user?.employee;

  return (
    <Modal open={!!item} onClose={handleClose} widthClass="max-w-2xl">
      <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white px-6 py-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Apply for Position
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">
            {item.positionTitle} · {item.baseItemNumber}
          </p>
        </div>
        <button
          onClick={handleClose}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="space-y-6 px-6 py-5">
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Employee Information
          </h3>
          <div className="grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3 text-sm">
            <ReadOnlyField
              label="Employee ID"
              value={employee?.employee_id ?? "—"}
            />
            <ReadOnlyField
              label="Name"
              value={employee?.full_name ?? user?.name ?? "—"}
            />
            <ReadOnlyField
              label="Department"
              value={employee?.department?.name ?? "—"}
            />
            <ReadOnlyField label="Position" value={employee?.position ?? "—"} />
            <ReadOnlyField
              label="Employment Status"
              value={employee?.employment_status ?? "—"}
            />
          </div>
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Required Documents
            </h3>
            {attempted && !allRequiredUploaded && (
              <span className="text-xs font-medium text-rose-600">
                Upload all required documents
              </span>
            )}
          </div>
          <div className="space-y-2">
            {requiredDocs.map((d) => (
              <UploadCard
                key={d.key}
                label={d.label}
                file={files[d.key]}
                onFile={(file, okType, okSize) =>
                  handleFile(d.key, file, okType, okSize)
                }
                onRemove={() => setFiles((f) => ({ ...f, [d.key]: undefined }))}
                error={
                  fileErrors[d.key] ||
                  (attempted && !files[d.key]
                    ? "This document is required."
                    : undefined)
                }
              />
            ))}
          </div>
        </div>
        <div>
          <Label>Application Notes</Label>
          <Textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any additional notes for the HR office (optional)"
          />
        </div>
        <label className="flex cursor-pointer items-start gap-2.5">
          <Checkbox checked={certified} onChange={setCertified} />
          <span className="text-sm text-slate-600">
            I certify that the information provided is true and correct.
          </span>
        </label>
        {attempted && !certified && (
          <FieldError>You must certify before submitting.</FieldError>
        )}
      </div>
      <div className="sticky bottom-0 flex justify-end gap-2 border-t border-slate-200 bg-white px-6 py-4">
        <Button variant="secondary" onClick={handleClose} disabled={submitting}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Application"
          )}
        </Button>
      </div>
    </Modal>
  );
}
function ReadOnlyField({ label, value }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-sm font-medium text-slate-700">{value}</p>
    </div>
  );
}

function EditDialog({
  state,
  onClose,
  onSave,
  departments,
  divisions,
  salaryGrades,
  vacantItems,
}) {
  const open = !!state;
  const mode = state?.mode;
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [initializedFor, setInitializedFor] = useState(null);

  const sourceId = state ? (mode === "edit" ? state.data.id : "create") : null;
  if (open && sourceId !== initializedFor) {
    setInitializedFor(sourceId);
    if (mode === "edit") {
      const d = state.data;
      setForm({
        id: d.id,
        base_item_number: d.baseItemNumber,
        title: d.positionTitle,
        display_department_id: d.officeId ?? "",
        display_division_id: d.divisionId ?? "",
        section: d.section,
        salary_grade_id: d.salaryGradeId ?? "",
        monthly_salary: String(d.monthlySalary),
        employment_status: d.employmentStatus,
        vacancies: String(d.vacancies),
        qualification_education: d.qualifications.education,
        qualification_experience: d.qualifications.experience,
        qualification_training: d.qualifications.training,
        qualification_eligibility: d.qualifications.eligibility,
        qualification_competency: d.qualifications.competency,
        job_description: d.jobDescription,
        date_posted: d.datePosted,
        closing_date: d.closingDate,
        expected_appointment_date: d.expectedAppointmentDate || "",
        status: d.status,
        required_documents: { ...d.requiredDocuments },
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }

  if (!open) return <Modal open={false} onClose={onClose} />;

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const setDoc = (key, value) =>
    setForm((f) => ({
      ...f,
      required_documents: { ...f.required_documents, [key]: value },
    }));

  const applyVacantItem = (baseItemNumber) => {
    const vi = vacantItems.find((v) => v.base_item_number === baseItemNumber);
    if (!vi) {
      set("base_item_number", baseItemNumber);
      return;
    }
    setForm((f) => ({
      ...f,
      base_item_number: vi.base_item_number,
      title: vi.title || f.title,
      salary_grade_id: vi.salary_grade_id ?? f.salary_grade_id,
      display_department_id:
        vi.display_department_id ?? f.display_department_id,
      vacancies: f.vacancies || String(vi.vacant_count),
    }));
  };

  const validate = () => {
    const e = {};
    if (!form.base_item_number?.trim())
      e.base_item_number = "Item number is required.";
    if (!form.title?.trim()) e.title = "Position title is required.";
    if (!form.employment_status)
      e.employment_status = "Employment status is required.";
    if (!form.vacancies || Number(form.vacancies) <= 0)
      e.vacancies = "Vacancies must be greater than zero.";
    if (!form.date_posted) e.date_posted = "Posting date is required.";
    if (!form.closing_date) e.closing_date = "Closing date is required.";
    if (
      form.date_posted &&
      form.closing_date &&
      new Date(form.closing_date) < new Date(form.date_posted)
    )
      e.closing_date = "Closing date cannot be earlier than posting date.";
    if (!form.job_description?.trim())
      e.job_description = "Job description is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const payload = {
      ...form,
      display_department_id: form.display_department_id || null,
      display_division_id: form.display_division_id || null,
      salary_grade_id: form.salary_grade_id || null,
      monthly_salary: form.monthly_salary || null,
      vacancies: Number(form.vacancies),
      expected_appointment_date: form.expected_appointment_date || null,
    };
    onSave(payload, mode);
  };

  return (
    <Modal open={open} onClose={onClose} widthClass="max-w-3xl">
      <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white px-6 py-4">
        <h2 className="text-base font-semibold text-slate-900">
          {mode === "create" ? "New Posting" : "Edit Posting"}
        </h2>
        <button
          onClick={onClose}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="space-y-6 px-6 py-5">
        {mode === "create" && (
          <FormSection title="Source Plantilla Item">
            <Label required>Vacant Item</Label>
            <Select
              value={form.base_item_number}
              onChange={applyVacantItem}
              options={vacantItems.map((v) => ({
                value: v.base_item_number,
                label: `${v.base_item_number} — ${v.title} (${v.vacant_count} vacant)`,
              }))}
              placeholder="Select a vacant plantilla item"
            />
            <p className="mt-1 text-[11px] text-slate-400">
              Only items with at least one VACANT slot are listed.
            </p>
            <FieldError>{errors.base_item_number}</FieldError>
          </FormSection>
        )}

        <FormSection title="Position Details">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label required>Position Title</Label>
              <Input
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="e.g. Administrative Officer IV"
              />
              <FieldError>{errors.title}</FieldError>
            </div>
            <div>
              <Label>Office</Label>
              <Select
                value={String(form.display_department_id || "")}
                onChange={(v) => set("display_department_id", v)}
                options={departments.map((d) => ({
                  value: String(d.id),
                  label: d.name,
                }))}
                placeholder="Select office"
              />
            </div>
            <div>
              <Label>Division</Label>
              <Select
                value={String(form.display_division_id || "")}
                onChange={(v) => set("display_division_id", v)}
                options={divisions.map((d) => ({
                  value: String(d.id),
                  label: d.name,
                }))}
                placeholder="Select division"
              />
            </div>
            <div>
              <Label>Section</Label>
              <Input
                value={form.section}
                onChange={(e) => set("section", e.target.value)}
                placeholder="e.g. Records Section"
              />
            </div>
            <div>
              <Label>Salary Grade</Label>
              <Select
                value={String(form.salary_grade_id || "")}
                onChange={(v) => set("salary_grade_id", v)}
                options={salaryGrades.map((sg) => ({
                  value: String(sg.id),
                  label: `SG-${sg.salary_grade}`,
                }))}
                placeholder="Select salary grade"
              />
            </div>
            <div>
              <Label>Monthly Salary</Label>
              <Input
                type="number"
                min="0"
                value={form.monthly_salary}
                onChange={(e) => set("monthly_salary", e.target.value)}
                placeholder="e.g. 38637"
              />
            </div>
            <div>
              <Label required>Employment Status</Label>
              <Select
                value={form.employment_status}
                onChange={(v) => set("employment_status", v)}
                options={EMP_STATUS.map((v) => ({ value: v, label: v }))}
                placeholder="Select status"
              />
              <FieldError>{errors.employment_status}</FieldError>
            </div>
            <div>
              <Label required>Vacancies Offered</Label>
              <Input
                type="number"
                min="1"
                value={form.vacancies}
                onChange={(e) => set("vacancies", e.target.value)}
                placeholder="e.g. 2"
              />
              <FieldError>{errors.vacancies}</FieldError>
            </div>
            <div>
              <Label required>Status</Label>
              <Select
                value={form.status}
                onChange={(v) => set("status", v)}
                options={["Open", "Closing Soon", "Closed", "Filled"].map(
                  (v) => ({ value: v, label: v }),
                )}
                placeholder="Select status"
              />
            </div>
            <div>
              <Label>Immediate Supervisor</Label>
              <Input
                value={form.immediate_supervisor || ""}
                onChange={(e) => set("immediate_supervisor", e.target.value)}
              />
            </div>
          </div>
        </FormSection>

        <FormSection title="Qualification Standards">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>Education</Label>
              <Input
                value={form.qualification_education}
                onChange={(e) => set("qualification_education", e.target.value)}
              />
            </div>
            <div>
              <Label>Experience</Label>
              <Input
                value={form.qualification_experience}
                onChange={(e) =>
                  set("qualification_experience", e.target.value)
                }
              />
            </div>
            <div>
              <Label>Training</Label>
              <Input
                value={form.qualification_training}
                onChange={(e) => set("qualification_training", e.target.value)}
              />
            </div>
            <div>
              <Label>Eligibility</Label>
              <Input
                value={form.qualification_eligibility}
                onChange={(e) =>
                  set("qualification_eligibility", e.target.value)
                }
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Competency</Label>
              <Input
                value={form.qualification_competency}
                onChange={(e) =>
                  set("qualification_competency", e.target.value)
                }
              />
            </div>
          </div>
        </FormSection>

        <FormSection title="Job Description">
          <Textarea
            rows={4}
            value={form.job_description}
            onChange={(e) => set("job_description", e.target.value)}
            placeholder="Describe the duties and responsibilities of this position"
          />
          <FieldError>{errors.job_description}</FieldError>
        </FormSection>

        <FormSection title="Timeline">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <Label required>Posting Date</Label>
              <Input
                type="date"
                value={form.date_posted}
                onChange={(e) => set("date_posted", e.target.value)}
              />
              <FieldError>{errors.date_posted}</FieldError>
            </div>
            <div>
              <Label required>Closing Date</Label>
              <Input
                type="date"
                value={form.closing_date}
                onChange={(e) => set("closing_date", e.target.value)}
              />
              <FieldError>{errors.closing_date}</FieldError>
            </div>
            <div>
              <Label>Expected Appointment Date</Label>
              <Input
                type="date"
                value={form.expected_appointment_date}
                onChange={(e) =>
                  set("expected_appointment_date", e.target.value)
                }
              />
            </div>
          </div>
        </FormSection>

        <FormSection title="Required Documents Checklist">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {DOC_KEYS.map((d) => (
              <Switch
                key={d.key}
                checked={!!form.required_documents[d.key]}
                onChange={(v) => setDoc(d.key, v)}
                label={d.label}
              />
            ))}
          </div>
        </FormSection>
      </div>
      <div className="sticky bottom-0 flex justify-end gap-2 border-t border-slate-200 bg-white px-6 py-4">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          {mode === "create" ? "Save" : "Update"}
        </Button>
      </div>
    </Modal>
  );
}
function FormSection({ title, children }) {
  return (
    <div>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </h3>
      {children}
    </div>
  );
}

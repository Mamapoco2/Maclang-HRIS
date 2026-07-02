import React, { useState, useMemo, useRef, useCallback } from "react";
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
  Sun,
  Moon,
  SlidersHorizontal,
  ChevronUp,
  Check,
} from "lucide-react";

/* -------------------------------------------------------------------------
 * Mock data
 * ---------------------------------------------------------------------- */

const OFFICES = [
  "Office of the Mayor",
  "HR Department",
  "Finance Department",
  "Engineering Office",
  "Health Office",
];
const DIVISIONS = [
  "Administrative Division",
  "Records Division",
  "Budget Division",
  "Planning Division",
  "Operations Division",
];
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

function makeItem(overrides) {
  return {
    id: overrides.id,
    positionNumber: overrides.positionNumber,
    positionTitle: overrides.positionTitle,
    office: overrides.office,
    division: overrides.division,
    section: overrides.section || "General Section",
    salaryGrade: overrides.salaryGrade,
    monthlySalary: overrides.monthlySalary,
    employmentStatus: overrides.employmentStatus,
    vacancies: overrides.vacancies,
    datePosted: overrides.datePosted,
    closingDate: overrides.closingDate,
    expectedAppointmentDate: overrides.expectedAppointmentDate,
    status: overrides.status,
    applicants: overrides.applicants,
    immediateSupervisor: overrides.immediateSupervisor,
    qualifications: overrides.qualifications,
    jobDescription: overrides.jobDescription,
    requiredDocuments: overrides.requiredDocuments,
  };
}

const INITIAL_ITEMS = [
  makeItem({
    id: "PLT-001",
    positionNumber: "OMM-2026-014",
    positionTitle: "Administrative Officer IV",
    office: "Office of the Mayor",
    division: "Administrative Division",
    salaryGrade: "SG-15",
    monthlySalary: 38637,
    employmentStatus: "Permanent",
    vacancies: 2,
    datePosted: "2026-06-10",
    closingDate: "2026-07-10",
    expectedAppointmentDate: "2026-08-01",
    status: "Open",
    applicants: 14,
    immediateSupervisor: "City Administrator",
    qualifications: {
      education: "Bachelor's degree relevant to the job",
      experience: "2 years of relevant experience",
      training: "8 hours of relevant training",
      eligibility: "Career Service (Professional) or its equivalent",
      competency: "Strong organizational and communication skills",
    },
    jobDescription:
      "Supervises the day-to-day administrative operations of the office, coordinates schedules, prepares correspondence and reports, and ensures compliance with office protocols. Serves as a liaison between the office and other departments, monitors supply and resource requests, and assists in the preparation of budget proposals.",
    requiredDocuments: {
      resume: true,
      pds: true,
      transcript: true,
      diploma: true,
      eligibility: true,
      certificates: false,
      others: false,
    },
  }),
  makeItem({
    id: "PLT-002",
    positionNumber: "HRD-2026-007",
    positionTitle: "Human Resource Management Officer I",
    office: "HR Department",
    division: "Records Division",
    salaryGrade: "SG-11",
    monthlySalary: 27000,
    employmentStatus: "Permanent",
    vacancies: 1,
    datePosted: "2026-06-20",
    closingDate: "2026-07-05",
    expectedAppointmentDate: "2026-07-20",
    status: "Closing Soon",
    applicants: 22,
    immediateSupervisor: "HR Division Chief",
    qualifications: {
      education:
        "Bachelor's degree in Psychology, Human Resource Management, or related field",
      experience: "1 year of relevant experience",
      training: "4 hours of relevant training",
      eligibility: "Career Service (Professional) or its equivalent",
      competency: "Knowledge of recruitment and records management",
    },
    jobDescription:
      "Assists in the recruitment, selection, and placement of personnel. Maintains and updates 201 files, processes appointment papers, and provides support in the implementation of HR policies and programs.",
    requiredDocuments: {
      resume: true,
      pds: true,
      transcript: true,
      diploma: true,
      eligibility: true,
      certificates: true,
      others: false,
    },
  }),
  makeItem({
    id: "PLT-003",
    positionNumber: "FIN-2026-003",
    positionTitle: "Accountant II",
    office: "Finance Department",
    division: "Budget Division",
    salaryGrade: "SG-16",
    monthlySalary: 42638,
    employmentStatus: "Permanent",
    vacancies: 1,
    datePosted: "2026-05-15",
    closingDate: "2026-06-15",
    expectedAppointmentDate: "2026-07-01",
    status: "Closed",
    applicants: 31,
    immediateSupervisor: "City Accountant",
    qualifications: {
      education: "Bachelor's degree in Accountancy",
      experience: "1 year of relevant experience",
      training: "4 hours of relevant training",
      eligibility: "CPA or Career Service (Professional)",
      competency: "Proficiency in government accounting standards",
    },
    jobDescription:
      "Reviews and verifies financial transactions, prepares trial balances and financial statements, and ensures accounting records comply with government auditing standards.",
    requiredDocuments: {
      resume: true,
      pds: true,
      transcript: true,
      diploma: true,
      eligibility: true,
      certificates: false,
      others: false,
    },
  }),
  makeItem({
    id: "PLT-004",
    positionNumber: "ENG-2026-011",
    positionTitle: "Engineer I",
    office: "Engineering Office",
    division: "Planning Division",
    salaryGrade: "SG-13",
    monthlySalary: 31320,
    employmentStatus: "Permanent",
    vacancies: 3,
    datePosted: "2026-06-25",
    closingDate: "2026-07-25",
    expectedAppointmentDate: "2026-08-10",
    status: "Open",
    applicants: 9,
    immediateSupervisor: "City Engineer",
    qualifications: {
      education: "Bachelor's degree in Civil Engineering",
      experience: "None required",
      training: "None required",
      eligibility: "RA 1080 (Civil Engineer)",
      competency: "Basic knowledge of structural design and estimation",
    },
    jobDescription:
      "Assists in the preparation of engineering plans, specifications, and cost estimates for infrastructure projects. Conducts field inspections and monitors project progress against approved plans.",
    requiredDocuments: {
      resume: true,
      pds: true,
      transcript: false,
      diploma: true,
      eligibility: true,
      certificates: false,
      others: false,
    },
  }),
  makeItem({
    id: "PLT-005",
    positionNumber: "HLT-2026-002",
    positionTitle: "Nurse II",
    office: "Health Office",
    division: "Operations Division",
    salaryGrade: "SG-16",
    monthlySalary: 42638,
    employmentStatus: "Permanent",
    vacancies: 4,
    datePosted: "2026-06-01",
    closingDate: "2026-06-30",
    expectedAppointmentDate: "2026-07-15",
    status: "Filled",
    applicants: 40,
    immediateSupervisor: "City Health Officer",
    qualifications: {
      education: "Bachelor of Science in Nursing",
      experience: "1 year of relevant experience",
      training: "4 hours of relevant training",
      eligibility: "RA 1080 (Nurse)",
      competency: "Clinical assessment and patient care management",
    },
    jobDescription:
      "Provides direct nursing care and health education to patients. Supervises nursing staff and coordinates with physicians in the implementation of treatment plans.",
    requiredDocuments: {
      resume: true,
      pds: true,
      transcript: true,
      diploma: true,
      eligibility: true,
      certificates: true,
      others: false,
    },
  }),
  makeItem({
    id: "PLT-006",
    positionNumber: "OMM-2026-020",
    positionTitle: "Information Technology Officer I",
    office: "Office of the Mayor",
    division: "Administrative Division",
    salaryGrade: "SG-19",
    monthlySalary: 56289,
    employmentStatus: "Permanent",
    vacancies: 1,
    datePosted: "2026-06-28",
    closingDate: "2026-07-28",
    expectedAppointmentDate: "2026-08-15",
    status: "Open",
    applicants: 5,
    immediateSupervisor: "City Administrator",
    qualifications: {
      education:
        "Bachelor's degree in Information Technology or Computer Science",
      experience: "2 years of relevant experience",
      training: "8 hours of relevant training",
      eligibility: "Career Service (Professional) or IT-related certification",
      competency: "Systems administration and network management",
    },
    jobDescription:
      "Plans, develops, and maintains the local government's information systems and network infrastructure. Provides technical support and recommends upgrades to improve system performance and security.",
    requiredDocuments: {
      resume: true,
      pds: true,
      transcript: true,
      diploma: true,
      eligibility: false,
      certificates: true,
      others: false,
    },
  }),
];

const STATUS_STYLES = {
  Open: "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/30",
  "Closing Soon":
    "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/30",
  Closed:
    "bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-400 dark:ring-rose-500/30",
  Filled:
    "bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-slate-500/10 dark:text-slate-400 dark:ring-slate-500/30",
};

const STATUS_DOT = {
  Open: "bg-emerald-500",
  "Closing Soon": "bg-amber-500",
  Closed: "bg-rose-500",
  Filled: "bg-slate-400",
};

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

function formatCurrency(n) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatDate(d) {
  if (!d) return "—";
  const date = new Date(d + "T00:00:00");
  return date.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/* -------------------------------------------------------------------------
 * Small primitives (shadcn-style, built with Tailwind)
 * ---------------------------------------------------------------------- */

function Button({
  variant = "default",
  size = "md",
  className = "",
  children,
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 disabled:pointer-events-none disabled:opacity-50";
  const variants = {
    default: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm",
    secondary:
      "bg-white text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-600 dark:hover:bg-slate-700",
    ghost:
      "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
    destructive: "bg-rose-600 text-white hover:bg-rose-700 shadow-sm",
    outlineDestructive:
      "bg-white text-rose-600 ring-1 ring-inset ring-rose-200 hover:bg-rose-50 dark:bg-slate-800 dark:text-rose-400 dark:ring-rose-900",
  };
  const sizes = {
    sm: "h-8 px-3 text-xs",
    md: "h-9 px-4",
    icon: "h-9 w-9",
  };
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
      className={`h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 ${className}`}
      {...props}
    />
  );
}

function Textarea({ className = "", ...props }) {
  return (
    <textarea
      className={`w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 ${className}`}
      {...props}
    />
  );
}

function Label({ children, required, className = "" }) {
  return (
    <label
      className={`mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300 ${className}`}
    >
      {children}
      {required && <span className="ml-0.5 text-rose-500">*</span>}
    </label>
  );
}

function FieldError({ children }) {
  if (!children) return null;
  return (
    <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{children}</p>
  );
}

function Select({ value, onChange, options, placeholder, className = "" }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`h-9 w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 pr-8 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 ${className}`}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
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
      className="flex w-full items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700"
    >
      <span className="text-sm text-slate-700 dark:text-slate-200">
        {label}
      </span>
      <span
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
          checked ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-600"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? "translate-x-4.5" : "translate-x-0.5"
          }`}
          style={{
            transform: checked ? "translateX(18px)" : "translateX(2px)",
          }}
        />
      </span>
    </button>
  );
}

function Checkbox({ checked, onChange, id }) {
  return (
    <button
      id={id}
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded border transition-colors ${
        checked
          ? "border-indigo-600 bg-indigo-600 text-white"
          : "border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800"
      }`}
      style={{ height: "18px", width: "18px" }}
    >
      {checked && <Check className="h-3 w-3" strokeWidth={3} />}
    </button>
  );
}

function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-slate-200 dark:bg-slate-700 ${className}`}
    />
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
        className={`relative z-10 max-h-[90vh] w-full ${widthClass} overflow-y-auto rounded-xl bg-white shadow-xl ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700`}
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
        className={`fixed right-0 top-0 h-full w-full max-w-xl transform overflow-y-auto bg-white shadow-2xl transition-transform duration-300 dark:bg-slate-900 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------
 * Stats cards
 * ---------------------------------------------------------------------- */

function StatCard({ icon: Icon, label, value, sub, tone }) {
  const tones = {
    indigo:
      "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400",
    emerald:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
    amber:
      "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
    sky: "bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400",
  };
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {label}
          </p>
          <p className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            {value}
          </p>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            {sub}
          </p>
        </div>
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${tones[tone]}`}
        >
          <Icon
            className="h-4.5 w-4.5"
            style={{ height: "18px", width: "18px" }}
          />
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
          className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
        >
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-2 h-7 w-16" />
          <Skeleton className="mt-2 h-3 w-32" />
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------
 * Upload card
 * ---------------------------------------------------------------------- */

function UploadCard({ label, file, onFile, onRemove, error }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = (files) => {
    const f = files?.[0];
    if (!f) return;
    const okType = /\.(pdf|doc|docx)$/i.test(f.name);
    const okSize = f.size <= 10 * 1024 * 1024;
    onFile(f, okType, okSize);
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
      className={`relative rounded-lg border-2 border-dashed p-3 transition-colors ${
        dragOver
          ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10"
          : error
            ? "border-rose-300 bg-rose-50/50 dark:border-rose-900 dark:bg-rose-500/5"
            : "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50"
      }`}
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
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white text-slate-500 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:ring-slate-700">
            <Paperclip className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-700 dark:text-slate-200">
              {label}
            </p>
            <p className="truncate text-xs text-slate-400 dark:text-slate-500">
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
                className="rounded-md px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-500/10"
              >
                Replace
              </button>
              <button
                type="button"
                onClick={onRemove}
                className="rounded-md p-1.5 text-slate-400 hover:bg-slate-200 hover:text-rose-600 dark:hover:bg-slate-700"
                aria-label={`Remove ${label}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-1 rounded-md bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700"
            >
              <Upload className="h-3.5 w-3.5" />
              Upload
            </button>
          )}
        </div>
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400">
          {error}
        </p>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------
 * Main module
 * ---------------------------------------------------------------------- */

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
const EMPTY_FORM = {
  positionNumber: "",
  positionTitle: "",
  office: "",
  division: "",
  section: "",
  salaryGrade: "",
  monthlySalary: "",
  employmentStatus: "",
  vacancies: "",
  education: "",
  experience: "",
  training: "",
  eligibility: "",
  competency: "",
  jobDescription: "",
  datePosted: "",
  closingDate: "",
  expectedAppointmentDate: "",
  status: "Open",
  docs: {
    resume: true,
    pds: true,
    transcript: false,
    diploma: false,
    eligibility: false,
    certificates: false,
    others: false,
  },
};

export default function AvailablePlantillaItems() {
  const [role, setRole] = useState("admin"); // "admin" | "employee"
  const [dark, setDark] = useState(false);
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [loading, setLoading] = useState(false);

  // filters
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    office: "",
    division: "",
    salaryGrade: "",
    employmentStatus: "",
    status: "",
  });
  const [sortBy, setSortBy] = useState("Newest");
  const [showFilters, setShowFilters] = useState(true);

  // pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // dialogs / drawer
  const [viewItem, setViewItem] = useState(null);
  const [applyItem, setApplyItem] = useState(null);
  const [editItem, setEditItem] = useState(undefined); // undefined = closed, null = create, object = edit
  const [deleteItem, setDeleteItem] = useState(null);
  const [applySuccess, setApplySuccess] = useState(false);

  const salaryGrades = useMemo(
    () => Array.from(new Set(items.map((i) => i.salaryGrade))).sort(),
    [items],
  );

  const filtered = useMemo(() => {
    let list = items.filter((it) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        it.positionTitle.toLowerCase().includes(q) ||
        it.office.toLowerCase().includes(q) ||
        it.salaryGrade.toLowerCase().includes(q) ||
        it.positionNumber.toLowerCase().includes(q);
      const matchesOffice = !filters.office || it.office === filters.office;
      const matchesDivision =
        !filters.division || it.division === filters.division;
      const matchesSG =
        !filters.salaryGrade || it.salaryGrade === filters.salaryGrade;
      const matchesEmp =
        !filters.employmentStatus ||
        it.employmentStatus === filters.employmentStatus;
      const matchesStatus = !filters.status || it.status === filters.status;
      return (
        matchesSearch &&
        matchesOffice &&
        matchesDivision &&
        matchesSG &&
        matchesEmp &&
        matchesStatus
      );
    });

    list = [...list].sort((a, b) => {
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
        case "Newest":
        default:
          return new Date(b.datePosted) - new Date(a.datePosted);
      }
    });

    return list;
  }, [items, search, filters, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const stats = useMemo(() => {
    const totalVacancies = items.reduce((s, i) => s + i.vacancies, 0);
    const open = items.filter((i) => i.status === "Open").length;
    const closingSoon = items.filter((i) => i.status === "Closing Soon").length;
    const totalApplicants = items.reduce((s, i) => s + i.applicants, 0);
    return { totalVacancies, open, closingSoon, totalApplicants };
  }, [items]);

  const resetFilters = () => {
    setSearch("");
    setFilters({
      office: "",
      division: "",
      salaryGrade: "",
      employmentStatus: "",
      status: "",
    });
    setSortBy("Newest");
    setPage(1);
  };

  const refresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 700);
  };

  const handleDelete = () => {
    setItems((prev) => prev.filter((i) => i.id !== deleteItem.id));
    setDeleteItem(null);
  };

  const handleExport = () => {
    const rows = [
      [
        "Position Number",
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
      ...filtered.map((i) => [
        i.positionNumber,
        i.positionTitle,
        i.office,
        i.division,
        i.salaryGrade,
        i.monthlySalary,
        i.employmentStatus,
        i.vacancies,
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
    a.download = "plantilla-items.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={dark ? "dark" : ""}>
      <div className="min-h-full w-full bg-slate-50 font-sans text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
                <BriefcaseBusiness
                  className="h-5.5 w-5.5"
                  style={{ height: 22, width: 22 }}
                />
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
                  Available Plantilla Items
                </h1>
                <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                  View and apply for available plantilla positions.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center rounded-lg border border-slate-200 bg-white p-0.5 text-xs dark:border-slate-800 dark:bg-slate-900">
                <button
                  onClick={() => setRole("employee")}
                  className={`rounded-md px-2.5 py-1.5 font-medium transition-colors ${
                    role === "employee"
                      ? "bg-indigo-600 text-white"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  Employee view
                </button>
                <button
                  onClick={() => setRole("admin")}
                  className={`rounded-md px-2.5 py-1.5 font-medium transition-colors ${
                    role === "admin"
                      ? "bg-indigo-600 text-white"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  Admin view
                </button>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDark((d) => !d)}
                aria-label="Toggle dark mode"
              >
                {dark ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
              {role === "admin" && (
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
                    New Plantilla Item
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
                  sub="Across all plantilla items"
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
          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search position, office, salary grade..."
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
                  ]}
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
                  onClick={refresh}
                  aria-label="Refresh"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                  />
                </Button>
              </div>
            </div>

            {showFilters && (
              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 dark:border-slate-800 sm:grid-cols-3 lg:grid-cols-5">
                <Select
                  value={filters.office}
                  onChange={(v) => {
                    setFilters((f) => ({ ...f, office: v }));
                    setPage(1);
                  }}
                  options={OFFICES}
                  placeholder="Office"
                />
                <Select
                  value={filters.division}
                  onChange={(v) => {
                    setFilters((f) => ({ ...f, division: v }));
                    setPage(1);
                  }}
                  options={DIVISIONS}
                  placeholder="Division"
                />
                <Select
                  value={filters.salaryGrade}
                  onChange={(v) => {
                    setFilters((f) => ({ ...f, salaryGrade: v }));
                    setPage(1);
                  }}
                  options={salaryGrades}
                  placeholder="Salary Grade"
                />
                <Select
                  value={filters.employmentStatus}
                  onChange={(v) => {
                    setFilters((f) => ({ ...f, employmentStatus: v }));
                    setPage(1);
                  }}
                  options={EMP_STATUS}
                  placeholder="Employment Status"
                />
                <Select
                  value={filters.status}
                  onChange={(v) => {
                    setFilters((f) => ({ ...f, status: v }));
                    setPage(1);
                  }}
                  options={["Open", "Closing Soon", "Closed", "Filled"]}
                  placeholder="Vacancy Status"
                />
              </div>
            )}
          </div>

          {/* Table (desktop) / Cards (mobile) */}
          <div className="mt-6">
            {loading ? (
              <TableSkeleton />
            ) : filtered.length === 0 ? (
              <EmptyState
                onCreate={() =>
                  setEditItem({ mode: "create", data: EMPTY_FORM })
                }
                showCreate={role === "admin"}
              />
            ) : (
              <>
                <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:block">
                  <div className="max-h-[560px] overflow-auto">
                    <table className="w-full min-w-[1100px] border-collapse text-left text-sm">
                      <thead className="sticky top-0 z-10 bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                        <tr>
                          <Th>Position No.</Th>
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
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {paged.map((it) => (
                          <tr
                            key={it.id}
                            className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                          >
                            <Td className="font-medium text-slate-700 dark:text-slate-300">
                              {it.positionNumber}
                            </Td>
                            <Td className="max-w-[220px] truncate font-medium text-slate-900 dark:text-white">
                              {it.positionTitle}
                            </Td>
                            <Td className="text-slate-500 dark:text-slate-400">
                              {it.office}
                            </Td>
                            <Td className="text-slate-500 dark:text-slate-400">
                              {it.division}
                            </Td>
                            <Td>{it.salaryGrade}</Td>
                            <Td className="whitespace-nowrap">
                              {formatCurrency(it.monthlySalary)}
                            </Td>
                            <Td className="text-slate-500 dark:text-slate-400">
                              {it.employmentStatus}
                            </Td>
                            <Td>{it.vacancies}</Td>
                            <Td className="whitespace-nowrap text-slate-500 dark:text-slate-400">
                              {formatDate(it.datePosted)}
                            </Td>
                            <Td className="whitespace-nowrap text-slate-500 dark:text-slate-400">
                              {formatDate(it.closingDate)}
                            </Td>
                            <Td>{it.applicants}</Td>
                            <Td>
                              <StatusBadge status={it.status} />
                            </Td>
                            <Td className="text-right">
                              <RowActions
                                item={it}
                                role={role}
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

                {/* Cards (mobile / tablet) */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:hidden">
                  {paged.map((it) => (
                    <div
                      key={it.id}
                      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                            {it.positionTitle}
                          </p>
                          <p className="text-xs text-slate-400 dark:text-slate-500">
                            {it.positionNumber}
                          </p>
                        </div>
                        <StatusBadge status={it.status} />
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5" /> {it.office}
                        </div>
                        <div>SG: {it.salaryGrade}</div>
                        <div className="col-span-2 font-medium text-slate-700 dark:text-slate-300">
                          {formatCurrency(it.monthlySalary)} / mo
                        </div>
                        <div>Vacancies: {it.vacancies}</div>
                        <div>Closes: {formatDate(it.closingDate)}</div>
                      </div>
                      <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="flex-1"
                          onClick={() => setViewItem(it)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View Details
                        </Button>
                        {role === "employee" ? (
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

                {/* Pagination */}
                <Pagination
                  total={filtered.length}
                  page={currentPage}
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

        {/* View details drawer */}
        <ViewDrawer
          item={viewItem}
          onClose={() => setViewItem(null)}
          role={role}
          onApply={() => {
            setApplyItem(viewItem);
            setViewItem(null);
          }}
        />

        {/* Apply dialog */}
        <ApplyDialog
          item={applyItem}
          onClose={() => setApplyItem(null)}
          onSuccess={() => {
            setApplyItem(null);
            setApplySuccess(true);
          }}
        />

        {/* Success dialog */}
        <Modal
          open={applySuccess}
          onClose={() => setApplySuccess(false)}
          widthClass="max-w-sm"
        >
          <div className="p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">
              Application submitted
            </h3>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
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

        {/* Create / Edit dialog */}
        <EditDialog
          state={editItem}
          onClose={() => setEditItem(undefined)}
          onSave={(data, mode) => {
            if (mode === "create") {
              const newItem = makeItem({
                id: `PLT-${String(items.length + 1).padStart(3, "0")}`,
                positionNumber: data.positionNumber,
                positionTitle: data.positionTitle,
                office: data.office,
                division: data.division,
                section: data.section,
                salaryGrade: data.salaryGrade,
                monthlySalary: Number(data.monthlySalary),
                employmentStatus: data.employmentStatus,
                vacancies: Number(data.vacancies),
                datePosted: data.datePosted,
                closingDate: data.closingDate,
                expectedAppointmentDate: data.expectedAppointmentDate,
                status: data.status,
                applicants: 0,
                immediateSupervisor: "—",
                qualifications: {
                  education: data.education,
                  experience: data.experience,
                  training: data.training,
                  eligibility: data.eligibility,
                  competency: data.competency,
                },
                jobDescription: data.jobDescription,
                requiredDocuments: data.docs,
              });
              setItems((prev) => [newItem, ...prev]);
            } else {
              setItems((prev) =>
                prev.map((i) =>
                  i.id === data.id
                    ? {
                        ...i,
                        positionNumber: data.positionNumber,
                        positionTitle: data.positionTitle,
                        office: data.office,
                        division: data.division,
                        section: data.section,
                        salaryGrade: data.salaryGrade,
                        monthlySalary: Number(data.monthlySalary),
                        employmentStatus: data.employmentStatus,
                        vacancies: Number(data.vacancies),
                        datePosted: data.datePosted,
                        closingDate: data.closingDate,
                        expectedAppointmentDate: data.expectedAppointmentDate,
                        status: data.status,
                        qualifications: {
                          education: data.education,
                          experience: data.experience,
                          training: data.training,
                          eligibility: data.eligibility,
                          competency: data.competency,
                        },
                        jobDescription: data.jobDescription,
                        requiredDocuments: data.docs,
                      }
                    : i,
                ),
              );
            }
            setEditItem(undefined);
          }}
        />

        {/* Delete confirmation */}
        <Modal
          open={!!deleteItem}
          onClose={() => setDeleteItem(null)}
          widthClass="max-w-sm"
        >
          {deleteItem && (
            <div className="p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">
                Delete plantilla item
              </h3>
              <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                This plantilla item will be permanently removed. This action
                cannot be undone.
              </p>
              <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {deleteItem.positionTitle} · {deleteItem.positionNumber}
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
    </div>
  );
}

/* -------------------------------------------------------------------------
 * Table bits
 * ---------------------------------------------------------------------- */

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
    <td className={`px-4 py-3 text-slate-700 dark:text-slate-300 ${className}`}>
      {children}
    </td>
  );
}

function RowActions({ item, role, onView, onEdit, onDelete, onApply }) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Button variant="ghost" size="icon" onClick={onView} aria-label="View">
        <Eye className="h-4 w-4" />
      </Button>
      {role === "admin" ? (
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
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
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
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
        <BriefcaseBusiness className="h-8 w-8" />
      </div>
      <p className="mt-4 text-sm font-medium text-slate-600 dark:text-slate-300">
        No available plantilla items found.
      </p>
      <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
        Try adjusting your search or filters.
      </p>
      {showCreate && (
        <Button className="mt-5" onClick={onCreate}>
          <Plus className="h-4 w-4" />
          Create Plantilla Item
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
      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <span>
          Showing {start}–{end} of {total} results
        </span>
        <span className="hidden sm:inline">·</span>
        <span className="hidden items-center gap-1.5 sm:flex">
          Rows per page
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="rounded-md border border-slate-200 bg-white px-1.5 py-1 text-xs dark:border-slate-700 dark:bg-slate-800"
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
            className={`h-8 w-8 rounded-lg text-xs font-medium transition-colors ${
              p === page
                ? "bg-indigo-600 text-white"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
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

/* -------------------------------------------------------------------------
 * View details drawer
 * ---------------------------------------------------------------------- */

function ViewDrawer({ item, onClose, role, onApply }) {
  if (!item) return <DrawerPanel open={false} onClose={onClose} />;
  const slotsRemaining = Math.max(
    0,
    item.vacancies - Math.min(item.applicants, item.vacancies),
  );
  const docsRequired = DOC_KEYS.filter((d) => item.requiredDocuments[d.key]);

  return (
    <DrawerPanel open={!!item} onClose={onClose}>
      <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
            {item.positionNumber}
          </p>
          <h2 className="mt-0.5 text-lg font-semibold text-slate-900 dark:text-white">
            {item.positionTitle}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
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
              ["Position Number", item.positionNumber],
              ["Salary Grade", item.salaryGrade],
              ["Monthly Salary", formatCurrency(item.monthlySalary)],
              ["Employment Status", item.employmentStatus],
              ["Vacancy Count", item.vacancies],
            ]}
          />
        </Section>

        <Section title="Assignment" icon={Building2}>
          <InfoGrid
            rows={[
              ["Office", item.office],
              ["Division", item.division],
              ["Section", item.section],
              ["Immediate Supervisor", item.immediateSupervisor],
            ]}
          />
        </Section>

        <Section title="Qualification Standards" icon={GraduationCap}>
          <InfoGrid
            rows={[
              ["Education", item.qualifications.education],
              ["Experience", item.qualifications.experience],
              ["Training", item.qualifications.training],
              ["Eligibility", item.qualifications.eligibility],
              ["Competency", item.qualifications.competency],
            ]}
            stacked
          />
        </Section>

        <Section title="Job Description" icon={ClipboardList}>
          <div className="max-h-40 overflow-y-auto rounded-lg bg-slate-50 p-3 text-sm leading-relaxed text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
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
                className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"
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
              ["Remaining Slots", slotsRemaining],
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

      <div className="sticky bottom-0 flex gap-2 border-t border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
        <Button variant="secondary" className="flex-1" onClick={onClose}>
          Close
        </Button>
        {role === "employee" && (
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
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
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
        <div key={label} className={stacked ? "" : ""}>
          <dt className="text-xs text-slate-400 dark:text-slate-500">
            {label}
          </dt>
          <dd className="text-slate-700 dark:text-slate-200">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

/* -------------------------------------------------------------------------
 * Apply dialog
 * ---------------------------------------------------------------------- */

const CURRENT_EMPLOYEE = {
  employeeId: "EMP-2021-0456",
  name: "Maria Santos",
  department: "Finance Department",
  position: "Administrative Aide III",
  employmentStatus: "Permanent",
};

function ApplyDialog({ item, onClose, onSuccess }) {
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

  const handleSubmit = () => {
    setAttempted(true);
    if (!canSubmit) return;
    setSubmitting(true);
    setTimeout(() => {
      resetLocal();
      onSuccess();
    }, 1400);
  };

  const handleClose = () => {
    resetLocal();
    onClose();
  };

  return (
    <Modal open={!!item} onClose={handleClose} widthClass="max-w-2xl">
      <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            Apply for Position
          </h2>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            {item.positionTitle} · {item.positionNumber}
          </p>
        </div>
        <button
          onClick={handleClose}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-6 px-6 py-5">
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Employee Information
          </h3>
          <div className="grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-800/60">
            <ReadOnlyField
              label="Employee ID"
              value={CURRENT_EMPLOYEE.employeeId}
            />
            <ReadOnlyField label="Name" value={CURRENT_EMPLOYEE.name} />
            <ReadOnlyField
              label="Department"
              value={CURRENT_EMPLOYEE.department}
            />
            <ReadOnlyField label="Position" value={CURRENT_EMPLOYEE.position} />
            <ReadOnlyField
              label="Employment Status"
              value={CURRENT_EMPLOYEE.employmentStatus}
            />
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Required Documents
            </h3>
            {attempted && !allRequiredUploaded && (
              <span className="text-xs font-medium text-rose-600 dark:text-rose-400">
                Upload all required documents
              </span>
            )}
          </div>
          <div className="space-y-2">
            {(requiredDocs.length ? requiredDocs : DOC_KEYS.slice(0, 2)).map(
              (d) => (
                <UploadCard
                  key={d.key}
                  label={d.label}
                  file={files[d.key]}
                  onFile={(file, okType, okSize) =>
                    handleFile(d.key, file, okType, okSize)
                  }
                  onRemove={() =>
                    setFiles((f) => ({ ...f, [d.key]: undefined }))
                  }
                  error={
                    fileErrors[d.key] ||
                    (attempted && !files[d.key]
                      ? "This document is required."
                      : undefined)
                  }
                />
              ),
            )}
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
          <Checkbox checked={certified} onChange={setCertified} id="certify" />
          <span className="text-sm text-slate-600 dark:text-slate-300">
            I certify that the information provided is true and correct.
          </span>
        </label>
        {attempted && !certified && (
          <FieldError>You must certify before submitting.</FieldError>
        )}
      </div>

      <div className="sticky bottom-0 flex justify-end gap-2 border-t border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
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
      <p className="text-xs text-slate-400 dark:text-slate-500">{label}</p>
      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
        {value}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------
 * Create / Edit dialog
 * ---------------------------------------------------------------------- */

function EditDialog({ state, onClose, onSave }) {
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
        positionNumber: d.positionNumber,
        positionTitle: d.positionTitle,
        office: d.office,
        division: d.division,
        section: d.section,
        salaryGrade: d.salaryGrade,
        monthlySalary: String(d.monthlySalary),
        employmentStatus: d.employmentStatus,
        vacancies: String(d.vacancies),
        education: d.qualifications.education,
        experience: d.qualifications.experience,
        training: d.qualifications.training,
        eligibility: d.qualifications.eligibility,
        competency: d.qualifications.competency,
        jobDescription: d.jobDescription,
        datePosted: d.datePosted,
        closingDate: d.closingDate,
        expectedAppointmentDate: d.expectedAppointmentDate,
        status: d.status,
        docs: { ...d.requiredDocuments },
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }

  if (!open) return <Modal open={false} onClose={onClose} />;

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const setDoc = (key, value) =>
    setForm((f) => ({ ...f, docs: { ...f.docs, [key]: value } }));

  const validate = () => {
    const e = {};
    if (!form.positionNumber?.trim())
      e.positionNumber = "Position number is required.";
    if (!form.positionTitle?.trim())
      e.positionTitle = "Position title is required.";
    if (!form.office) e.office = "Office is required.";
    if (!form.division) e.division = "Division is required.";
    if (!form.salaryGrade?.trim()) e.salaryGrade = "Salary grade is required.";
    else if (!/^SG-\d{1,2}$/i.test(form.salaryGrade.trim()))
      e.salaryGrade = "Use format SG-##, e.g. SG-15.";
    if (!form.monthlySalary || Number(form.monthlySalary) <= 0)
      e.monthlySalary = "Monthly salary must be positive.";
    if (!form.employmentStatus)
      e.employmentStatus = "Employment status is required.";
    if (!form.vacancies || Number(form.vacancies) <= 0)
      e.vacancies = "Vacancies must be greater than zero.";
    if (!form.datePosted) e.datePosted = "Posting date is required.";
    if (!form.closingDate) e.closingDate = "Closing date is required.";
    if (
      form.datePosted &&
      form.closingDate &&
      new Date(form.closingDate) < new Date(form.datePosted)
    ) {
      e.closingDate = "Closing date cannot be earlier than posting date.";
    }
    if (!form.jobDescription?.trim())
      e.jobDescription = "Job description is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave(form, mode);
  };

  return (
    <Modal open={open} onClose={onClose} widthClass="max-w-3xl">
      <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          {mode === "create" ? "New Plantilla Item" : "Edit Plantilla Item"}
        </h2>
        <button
          onClick={onClose}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-6 px-6 py-5">
        <FormSection title="Position Details">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label required>Position Number</Label>
              <Input
                value={form.positionNumber}
                onChange={(e) => set("positionNumber", e.target.value)}
                placeholder="e.g. OMM-2026-014"
              />
              <FieldError>{errors.positionNumber}</FieldError>
            </div>
            <div>
              <Label required>Position Title</Label>
              <Input
                value={form.positionTitle}
                onChange={(e) => set("positionTitle", e.target.value)}
                placeholder="e.g. Administrative Officer IV"
              />
              <FieldError>{errors.positionTitle}</FieldError>
            </div>
            <div>
              <Label required>Office</Label>
              <Select
                value={form.office}
                onChange={(v) => set("office", v)}
                options={OFFICES}
                placeholder="Select office"
              />
              <FieldError>{errors.office}</FieldError>
            </div>
            <div>
              <Label required>Division</Label>
              <Select
                value={form.division}
                onChange={(v) => set("division", v)}
                options={DIVISIONS}
                placeholder="Select division"
              />
              <FieldError>{errors.division}</FieldError>
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
              <Label required>Salary Grade</Label>
              <Input
                value={form.salaryGrade}
                onChange={(e) => set("salaryGrade", e.target.value)}
                placeholder="e.g. SG-15"
              />
              <FieldError>{errors.salaryGrade}</FieldError>
            </div>
            <div>
              <Label required>Monthly Salary</Label>
              <Input
                type="number"
                min="0"
                value={form.monthlySalary}
                onChange={(e) => set("monthlySalary", e.target.value)}
                placeholder="e.g. 38637"
              />
              <FieldError>{errors.monthlySalary}</FieldError>
            </div>
            <div>
              <Label required>Employment Status</Label>
              <Select
                value={form.employmentStatus}
                onChange={(v) => set("employmentStatus", v)}
                options={EMP_STATUS}
                placeholder="Select status"
              />
              <FieldError>{errors.employmentStatus}</FieldError>
            </div>
            <div>
              <Label required>Number of Vacancies</Label>
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
                options={["Open", "Closing Soon", "Closed", "Filled"]}
                placeholder="Select status"
              />
            </div>
          </div>
        </FormSection>

        <FormSection title="Qualification Standards">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>Education</Label>
              <Input
                value={form.education}
                onChange={(e) => set("education", e.target.value)}
              />
            </div>
            <div>
              <Label>Experience</Label>
              <Input
                value={form.experience}
                onChange={(e) => set("experience", e.target.value)}
              />
            </div>
            <div>
              <Label>Training</Label>
              <Input
                value={form.training}
                onChange={(e) => set("training", e.target.value)}
              />
            </div>
            <div>
              <Label>Eligibility</Label>
              <Input
                value={form.eligibility}
                onChange={(e) => set("eligibility", e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Competency</Label>
              <Input
                value={form.competency}
                onChange={(e) => set("competency", e.target.value)}
              />
            </div>
          </div>
        </FormSection>

        <FormSection title="Job Description">
          <Textarea
            rows={4}
            value={form.jobDescription}
            onChange={(e) => set("jobDescription", e.target.value)}
            placeholder="Describe the duties and responsibilities of this position"
          />
          <FieldError>{errors.jobDescription}</FieldError>
        </FormSection>

        <FormSection title="Timeline">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <Label required>Posting Date</Label>
              <Input
                type="date"
                value={form.datePosted}
                onChange={(e) => set("datePosted", e.target.value)}
              />
              <FieldError>{errors.datePosted}</FieldError>
            </div>
            <div>
              <Label required>Closing Date</Label>
              <Input
                type="date"
                value={form.closingDate}
                onChange={(e) => set("closingDate", e.target.value)}
              />
              <FieldError>{errors.closingDate}</FieldError>
            </div>
            <div>
              <Label>Expected Appointment Date</Label>
              <Input
                type="date"
                value={form.expectedAppointmentDate}
                onChange={(e) => set("expectedAppointmentDate", e.target.value)}
              />
            </div>
          </div>
        </FormSection>

        <FormSection title="Required Documents Checklist">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {DOC_KEYS.map((d) => (
              <Switch
                key={d.key}
                checked={!!form.docs[d.key]}
                onChange={(v) => setDoc(d.key, v)}
                label={d.label}
              />
            ))}
          </div>
        </FormSection>
      </div>

      <div className="sticky bottom-0 flex justify-end gap-2 border-t border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
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
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {title}
      </h3>
      {children}
    </div>
  );
}

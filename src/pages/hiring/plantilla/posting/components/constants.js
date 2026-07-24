export const EMP_STATUS = ["Permanent"];
export const DOC_KEYS = [
  { key: "letter_of_intent", label: "Letter of Intent" },
  { key: "pds", label: "Personal Data Sheet (PDS) \u2013 Revised 2025" },
  { key: "work_experience", label: "Work Experience Sheet" },
  { key: "performance_rating", label: "Latest Performance Rating / Appraisal" },
  { key: "eligibility", label: "Eligibility / Licensure" },
  { key: "transcript", label: "Transcript of Records (TOR)" },
  { key: "diploma", label: "Diploma" },
];

export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export const STATUS_STYLES = {
  Open: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  "Closing Soon": "bg-amber-50 text-amber-700 ring-amber-600/20",
  Closed: "bg-rose-50 text-rose-700 ring-rose-600/20",
  Filled: "bg-slate-100 text-slate-600 ring-slate-500/20",
};

export const STATUS_DOT = {
  Open: "bg-emerald-500",
  "Closing Soon": "bg-amber-500",
  Closed: "bg-rose-500",
  Filled: "bg-slate-400",
};

export const EMPTY_FORM = {
  base_item_number: "",
  position_slot_names: [],
  plantilla_position_ids: [],
  title: "",
  display_department_id: "",
  display_division_id: "",
  section: "",
  salary_grade_id: "",
  step_increment_id: "",
  monthly_salary: "",
  annual_salary: "",
  employment_status: "Permanent",
  vacancies: "",
  immediate_supervisor: "",
  qualification_education: "",
  qualification_experience: "",
  qualification_training: "",
  qualification_eligibility: "",
  qualification_competency: "",
  date_posted: "",
  closing_date: "",
  expected_appointment_date: "",
  status: "Open",
  required_documents: {
    letter_of_intent: true,
    pds: true,
    work_experience: true,
    performance_rating: true,
    eligibility: true,
    transcript: true,
    diploma: true,
  },
};
// ── PSB Applications / Interviews ──────────────────────────────────────────
export const APPLICATION_STATUSES = [
  "Pending",
  "Under Review",
  "Approved",
  "Rejected",
];

export const APPLICATION_STATUS_STYLES = {
  Pending: "bg-slate-100 text-slate-600 ring-slate-500/20",
  "Under Review": "bg-amber-50 text-amber-700 ring-amber-600/20",
  Approved: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  Rejected: "bg-rose-50 text-rose-700 ring-rose-600/20",
};

export const APPLICATION_STATUS_DOT = {
  Pending: "bg-slate-400",
  "Under Review": "bg-amber-500",
  Approved: "bg-emerald-500",
  Rejected: "bg-rose-500",
};

export const INTERVIEW_STAGE_STATUS_OPTIONS = [
  "Pending",
  "Scheduled",
  "Passed",
  "Failed",
  "Skipped",
];

export const INTERVIEW_OVERALL_STATUS_OPTIONS = [
  "Pending",
  "Scheduled",
  "In Progress",
  "Completed",
  "Failed",
  "Cancelled",
];

export const INTERVIEW_OVERALL_STYLES = {
  PENDING: "bg-slate-100 text-slate-600 ring-slate-500/20",
  SCHEDULED: "bg-sky-50 text-sky-700 ring-sky-600/20",
  "IN PROGRESS": "bg-amber-50 text-amber-700 ring-amber-600/20",
  COMPLETED: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  FAILED: "bg-rose-50 text-rose-700 ring-rose-600/20",
  CANCELLED: "bg-slate-100 text-slate-500 ring-slate-400/20",
};

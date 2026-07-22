// ─── Table headers ──────────────────────────────────────────────────────────
export const ITEM_HEADERS = [
  "",
  "#",
  "Title",
  "Approved",
  "Filled",
  "Vacant",
  "Unfilled",
  "Actions",
];

export const BASE_POSITION_HEADERS = [
  "Item Number",
  "Position Title",
  "SG",
  "Status",
  "Assigned To",
  "Actions",
];

// ─── Status / type styling ──────────────────────────────────────────────────
export const STATUS_STYLES = {
  FILLED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  VACANT: "bg-amber-50   text-amber-600   border-amber-200",
  UNFILLED: "bg-red-50     text-red-600     border-red-200",
};

export const TYPE_BADGE = {
  OFFICE: "bg-indigo-100 text-indigo-700",
  DIRECTORATE: "bg-purple-100 text-purple-700",
  DIVISION: "bg-teal-100 text-teal-700",
  DEPARTMENT: "bg-blue-100 text-blue-700",
};

export const DEPT_TYPES = ["OFFICE", "DIRECTORATE", "DIVISION", "DEPARTMENT"];

// ─── Dropdown option lists ──────────────────────────────────────────────────
export const ROLE_OPTIONS = [
  "CHIEF",
  "DIRECTOR",
  "ASSISTANT DIRECTOR",
  "OFFICER IN CHARGE",
  "CHAIRMAN",
  "HEAD",
  "SUPERVISOR",
  "STAFF",
];

// ─── Pagination ─────────────────────────────────────────────────────────────
export const PAGE_SIZE = 15;

// ─── Form default values ────────────────────────────────────────────────────
export const itemDefaults = {
  base_item_number: "",
  title: "",
  description: "",
  approved_slots: 1,
  salary_grade_id: "",
  step_increment_id: "",
  display_target: "",
};

export const positionDefaults = {
  position_title: "",
  salary_grade_id: "",
  step_increment_id: "",
  date_of_assumption: "",
  role: "",
  display_target: "",
};

export const assignDefaults = {
  employee_id: "",
  start_date: "",
  salary_grade_id: "",
  step_increment_id: "",
};

export const addSlotDefaults = {
  slots_to_add: 1,
  salary_grade_id: "",
  step_increment_id: "",
  role: "",
  display_department_id: "",
};

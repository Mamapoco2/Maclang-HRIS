export const TABS = [
  { id: "employment", label: "Employment" },
  { id: "pds", label: "Personal Data Sheet" },
];

export const EMPLOYEE_TYPES = [
  { value: "Plantilla", label: "Plantilla" },
  { value: "Contract of Service", label: "Contract of Service" },
  { value: "Consultant", label: "Consultant" },
];

export const EMPLOYEE_TYPE_PREFIXES = {
  Plantilla: "RMBGH-",
  "Contract of Service": "CT-",
  Consultant: "CS-",
};

export const PREFIX_OPTIONS = [
  "MR.",
  "MS.",
  "MRS.",
  "DR.",
  "ENGR.",
  "ATTY.",
  "HON.",
];
export const SUFFIX_OPTIONS = ["JR.", "SR.", "II", "III", "IV"];
export const GENDER_OPTIONS = ["MALE", "FEMALE"];
export const STATUS_OPTIONS = ["ACTIVE", "INACTIVE", "RESIGN"];

export const POSITION_CLASSIFICATION_OPTIONS = [
  "CHIEF",
  "DIRECTOR",
  "ASSISTANT DIRECTOR",
  "OFFICER IN CHARGE",
  "COMMITTEE",
  "CHAIRMAN",
  "HEAD",
  "SUPERVISOR",
  "STAFF",
].map((v) => ({ value: v, label: v }));

export const TITLE_OPTIONS = [
  "MD",
  "RN",
  "RM",
  "CPA",
  "RND",
  "RSW",
  "MAN",
  "DBA",
  "RMT",
  "RPH",
  "RADT",
  "RRT",
  "RTRP",
  "PT",
  "OT",
  "SLP",
  "ND",
  "DMD",
  "DPBS",
  "DPBO",
  "DPBU",
  "DPIM",
  "DPOGS",
  "FPCS",
  "FPSGS",
  "FPAO",
  "FPUA",
  "FPCR",
  "FICS",
  "FPOA",
  "FPALES",
  "MBA",
  "MHM",
  "MMHOA",
  "MPH",
  "MET III",
  "HD TECHNICIAN",
].map((v) => ({ value: v, label: v }));

export const PDS_TABLE_KEYS = [
  "children",
  "edu_elementary",
  "edu_secondary",
  "edu_vocational",
  "edu_college",
  "edu_graduate",
  "eligibilities",
  "work_experiences",
  "voluntary_works",
  "trainings",
  "special_skills",
  "non_academic_distinctions",
  "organization_memberships",
  "references",
];

export const INITIAL_EMPLOYEE_FORM_STATE = {
  employeeNumber: EMPLOYEE_TYPE_PREFIXES.Plantilla,
  rolePosition: [],
  employeeType: "Plantilla",
  status: "",
  designation: [],
  division: "",
  prefix: "",
  firstName: "",
  middleName: "",
  lastName: "",
  suffix: "",
  title: [],
  gender: "",
  department: [],
  plantillaPositionId: "",
  stepIncrementId: "",
  stepNumber: "",
  sgLevel: "",
  annualSalary: "",
  monthlySalary: "",
  salaryOverride: false,
  cosPositionId: "",
  consultantPositionId: "",
};

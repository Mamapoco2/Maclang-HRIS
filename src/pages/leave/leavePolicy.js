import {
  Palmtree,
  CalendarCheck,
  Thermometer,
  Baby,
  Users,
  Star,
  Heart,
  GraduationCap,
  ShieldAlert,
  HeartPulse,
  Sparkles,
  CloudRain,
  Coins,
  LogOut,
  Home,
  Leaf,
  Timer,
} from "lucide-react";

export const LEAVE_TYPES = [
  {
    value: "vacation",
    label: "Vacation Leave",
    color: "#3b82f6",
    bg: "#eff6ff",
    icon: Palmtree,
  },
  {
    value: "mandatory_forced",
    label: "Mandatory / Forced Leave",
    color: "#6366f1",
    bg: "#eef2ff",
    icon: CalendarCheck,
  },
  {
    value: "sick",
    label: "Sick Leave",
    color: "#f59e0b",
    bg: "#fffbeb",
    icon: Thermometer,
  },
  {
    value: "maternity",
    label: "Maternity Leave",
    color: "#ec4899",
    bg: "#fdf2f8",
    icon: Baby,
  },
  {
    value: "paternity",
    label: "Paternity Leave",
    color: "#8b5cf6",
    bg: "#f5f3ff",
    icon: Users,
  },
  {
    value: "special_privilege",
    label: "Special Privilege Leave",
    color: "#06b6d4",
    bg: "#ecfeff",
    icon: Star,
  },
  {
    value: "solo_parent",
    label: "Solo Parent Leave",
    color: "#f97316",
    bg: "#fff7ed",
    icon: Heart,
  },
  {
    value: "study",
    label: "Study Leave",
    color: "#10b981",
    bg: "#ecfdf5",
    icon: GraduationCap,
  },
  {
    value: "vawc",
    label: "VAWC Leave",
    color: "#dc2626",
    bg: "#fef2f2",
    icon: ShieldAlert,
    confidential: true,
  },
  {
    value: "rehabilitation",
    label: "Rehabilitation Leave",
    color: "#14b8a6",
    bg: "#f0fdfa",
    icon: HeartPulse,
  },
  {
    value: "special_women",
    label: "Special Leave Benefits for Women",
    color: "#d946ef",
    bg: "#fdf4ff",
    icon: Sparkles,
  },
  {
    value: "calamity",
    label: "Special Emergency (Calamity) Leave",
    color: "#64748b",
    bg: "#f8fafc",
    icon: CloudRain,
  },
  {
    value: "monetization",
    label: "Monetization of Leave Credits",
    color: "#eab308",
    bg: "#fefce8",
    icon: Coins,
  },
  {
    value: "terminal",
    label: "Terminal Leave",
    color: "#475569",
    bg: "#f1f5f9",
    icon: LogOut,
  },
  {
    value: "adoption",
    label: "Adoption Leave",
    color: "#0ea5e9",
    bg: "#f0f9ff",
    icon: Home,
  },
  {
    value: "wellness",
    label: "Wellness Leave",
    color: "#22c55e",
    bg: "#f0fdf4",
    icon: Leaf,
  },
  {
    value: "compensatory_off",
    label: "Compensatory Off",
    color: "#a855f7",
    bg: "#faf5ff",
    icon: Timer,
  },
];

export const CREDITS_PANEL_LEAVE_CODES = [
  "vacation",
  "sick",
  "wellness",
  "compensatory_off",
];

export const MY_LEAVE_CREDITS_DISPLAY_CODES = [
  ...CREDITS_PANEL_LEAVE_CODES,
  "special_privilege",
];

export const LEAVE_TYPE_MAP = Object.fromEntries(
  LEAVE_TYPES.map((t) => [t.value, t]),
);

const LEAVE_CATEGORY_ORDER = ["Credit-Based Leave", "Entitlement-Based Leave"];

export function groupLeaveTypesByCategory(leaveTypes) {
  if (!Array.isArray(leaveTypes) || !leaveTypes.some((t) => t.category_label)) {
    return null;
  }

  const groups = new Map();
  leaveTypes.forEach((type) => {
    const label = type.category_label || "Other";
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label).push(type);
  });

  const orderedLabels = [
    ...LEAVE_CATEGORY_ORDER.filter((label) => groups.has(label)),
    ...[...groups.keys()].filter(
      (label) => !LEAVE_CATEGORY_ORDER.includes(label),
    ),
  ];

  return orderedLabels.map((label) => ({ label, options: groups.get(label) }));
}

export const LEAVE_STATUSES = {
  DRAFT: "draft",
  FOR_HR_REVIEW: "for_hr_review",
  PENDING_APPROVAL: "pending_approval",
  RETURNED_FOR_REVISION: "returned_for_revision",
  APPROVED: "approved",
  REJECTED: "rejected",
  RETRACTED: "retracted",
  CANCELLED: "cancelled",
  LABELS: {
    draft: "Draft",
    for_hr_review: "For HR Review",
    pending_approval: "Pending Approval",
    returned_for_revision: "Returned for Clarification/Revision",
    approved: "Approved",
    rejected: "Rejected/Disapproved",
    retracted: "Retracted",
    cancelled: "Cancelled",
  },
};

export const STATUS_CONFIG = {
  draft: {
    label: "Draft",
    color: "text-slate-600",
    bg: "bg-slate-50",
    border: "border-slate-200",
    dot: "bg-slate-400",
  },
  for_hr_review: {
    label: "For HR Review",
    color: "text-sky-700",
    bg: "bg-sky-50",
    border: "border-sky-200",
    dot: "bg-sky-500",
  },
  pending_approval: {
    label: "Pending Approval",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    dot: "bg-amber-500",
  },
  returned_for_revision: {
    label: "Returned for Clarification/Revision",
    color: "text-orange-700",
    bg: "bg-orange-50",
    border: "border-orange-200",
    dot: "bg-orange-500",
  },
  approved: {
    label: "Approved",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
  rejected: {
    label: "Rejected/Disapproved",
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
    dot: "bg-red-500",
  },
  retracted: {
    label: "Retracted",
    color: "text-purple-700",
    bg: "bg-purple-50",
    border: "border-purple-200",
    dot: "bg-purple-500",
  },
  cancelled: {
    label: "Cancelled",
    color: "text-gray-600",
    bg: "bg-gray-50",
    border: "border-gray-200",
    dot: "bg-gray-400",
  },
  pending: {
    label: "Pending",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    dot: "bg-amber-500",
  },
};

export const HIDE_DATE_SELECTION = new Set(["monetization"]);

export const LEAVE_DETAIL_FIELDS = {
  vacation: ["destination", "purposeOfTravel"],
  mandatory_forced: [],
  sick: ["hospitalName", "physicianName"],
  maternity: ["expectedDeliveryDate", "numberOfChildren"],
  paternity: [],
  special_privilege: ["specialPurpose", "locationType", "location"],
  solo_parent: [],
  study: ["schoolName", "courseProgram", "studyDuration"],
  vawc: ["caseDescription"],
  rehabilitation: ["natureOfInjury", "rehabDuration"],
  special_women: ["gynecologicalCondition", "surgeryDate", "recoveryPeriod"],
  calamity: ["calamityType", "affectedLocation", "calamityDate"],
  monetization: ["creditsToMonetize", "monetizationJustification"],
  terminal: ["separationType"],
  adoption: ["childName", "placementDate", "adoptionAgency"],
};

export const LEAVE_DESCRIPTIONS = {
  vacation:
    "For planned personal time off — travel, rest, or attending to personal matters. Earned monthly and accumulates if unused.",
  mandatory_forced:
    "A required 5-day annual leave every employee must take from their vacation leave credits to promote employee wellness. Forfeited if not availed within the year.",
  sick: "For absences due to illness, injury, or a medical/dental consultation, whether for the employee or requiring their personal attention.",
  maternity:
    "Paid leave for childbirth or pregnancy-related conditions, granted regardless of civil status or number of children.",
  paternity:
    "For a married male employee to support his legitimate spouse during childbirth or pregnancy-related complications.",
  special_privilege:
    "For personal milestones and circumstances — birthday, wedding anniversary, or other personal/family occasions.",
  solo_parent:
    "For qualified solo parents to attend to parental duties and responsibilities.",
  study:
    "For completing a course of study or taking a board/bar examination relevant to the employee's work.",
  vawc: "For women employees who are victims of violence, to attend to medical, legal, and related concerns. Handled with strict confidentiality.",
  rehabilitation:
    "For recovery from injuries sustained in the actual performance of official duty.",
  special_women:
    "For women employees who undergo surgery for gynecological disorders, to allow for recovery.",
  calamity:
    "For employees directly affected by a natural or man-made calamity in a declared disaster area.",
  monetization:
    "Converts a portion of accumulated, unused vacation/sick leave credits into a cash equivalent, without actually going on leave.",
  terminal:
    "Cashes out all remaining leave credits upon resignation, retirement, or separation from service.",
  adoption:
    "For an employee upon the issuance of a Pre-Adoptive Placement Authority by DSWD in their favor.",
  wellness:
    "For attending to the employee's physical and mental wellbeing — medical/wellness check-ups, therapy sessions, or similar self-care activities.",
  compensatory_off:
    "Time off earned in exchange for approved overtime work rendered, credited and consumed in hours.",
};

export const LEAVE_INFO_NOTICES = {
  vacation: {
    variant: "info",
    title: "Filing Requirement",
    message:
      "Leave should be filed at least 5 days before effectivity whenever possible.",
  },
  mandatory_forced: {
    variant: "info",
    title: "Mandatory Leave Policy",
    message:
      "Annual 5-day mandatory leave. Forfeited if not taken during the year. Availment of vacation leave counts toward this requirement.",
  },
  sick: {
    variant: "warning",
    title: "Document Requirements",
    message:
      "File immediately upon return. Medical certificate required if filed in advance or for more than 5 days. Affidavit required if no medical consultation was made.",
  },
  maternity: {
    variant: "info",
    title: "Maximum Duration",
    message: "Maximum leave duration: 105 days",
  },
  paternity: {
    variant: "info",
    title: "Maximum Duration",
    message: "Maximum leave duration: 7 days",
  },
  special_privilege: {
    variant: "info",
    title: "Filing Requirement",
    message: "File at least 1 week before leave whenever possible.",
  },
  solo_parent: {
    variant: "info",
    title: "Maximum Duration",
    message: "Maximum leave duration: 7 days",
  },
  study: {
    variant: "info",
    title: "Study Leave Policy",
    message:
      "Up to 6 months. Must meet agency internal requirements and have a contract between the agency head and employee.",
  },
  vawc: {
    variant: "confidential",
    title: "Confidential Leave",
    message:
      "This leave type is handled with strict confidentiality. Accepted documents: BPO, TPO, PPO, certification from Punong Barangay/Prosecutor, or Police Report with Medical Certificate.",
  },
  rehabilitation: {
    variant: "info",
    title: "Maximum Duration",
    message:
      "Maximum leave duration: 6 months. Must be filed within 1 week from the time of the accident.",
  },
  special_women: {
    variant: "info",
    title: "Filing Requirement",
    message:
      "File at least 5 days prior to scheduled gynecological surgery (except in emergencies, then immediately upon return). Maximum duration: up to 2 months.",
  },
  calamity: {
    variant: "info",
    title: "Maximum Duration",
    message:
      "Maximum leave duration: 5 days. Must be filed within 30 days from the actual occurrence.",
  },
  monetization: {
    variant: "warning",
    title: "Monetization Policy",
    message:
      "For monetization of 50% or more of accumulated credits, a letter request to the head of the agency stating valid and justifiable reasons is required.",
  },
  terminal: {
    variant: "warning",
    title: "Clearance Required",
    message:
      "For terminal leave, application must be accompanied by clearance from money, property, and work-related accountabilities.",
  },
  adoption: {
    variant: "info",
    title: "Adoption Leave",
    message:
      "Requires authenticated copy of Pre-Adoptive Placement Authority issued by DSWD.",
  },
  wellness: {
    variant: "info",
    title: "Filing Requirement",
    message:
      "File at least 3 days before the intended date whenever possible. Subject to available Wellness Leave credits.",
  },
  compensatory_off: {
    variant: "info",
    title: "Compensatory Off Policy",
    message:
      "Credited in hours from approved overtime rendered. Must be filed against available Compensatory Off credits and used within the period set by HR.",
  },
};

export const LEAVE_REQUIREMENTS = {
  vacation: [
    {
      id: "travel_clearance",
      label: "Travel Authority / Clearance (if abroad)",
    },
  ],
  mandatory_forced: [],
  sick: [
    { id: "medical_certificate", label: "Medical Certificate", required: true },
    { id: "affidavit", label: "Affidavit (if no consultation)" },
  ],
  maternity: [
    { id: "proof_pregnancy", label: "Proof of Pregnancy", required: true },
    { id: "ultrasound", label: "Ultrasound", required: true },
    { id: "doctor_certificate", label: "Doctor Certificate", required: true },
    { id: "cs_form_6a", label: "CS Form No. 6a (if applicable)" },
  ],
  paternity: [
    { id: "birth_certificate", label: "Birth Certificate", required: true },
    {
      id: "marriage_certificate",
      label: "Marriage Certificate",
      required: true,
    },
    { id: "medical_certificate", label: "Medical Certificate", required: true },
  ],
  special_privilege: [],
  solo_parent: [
    {
      id: "solo_parent_id",
      label: "Solo Parent Identification Card",
      required: true,
    },
  ],
  study: [
    { id: "study_contract", label: "Study Leave Contract", required: true },
  ],
  vawc: [
    { id: "bpo", label: "Barangay Protection Order" },
    { id: "tpo", label: "Temporary Protection Order" },
    { id: "ppo", label: "Permanent Protection Order" },
    {
      id: "barangay_cert",
      label: "Certification from Punong Barangay/Prosecutor",
    },
    { id: "police_report", label: "Police Report" },
    { id: "medical_certificate", label: "Medical Certificate" },
  ],
  rehabilitation: [
    {
      id: "accident_report",
      label: "Accident / Police Report",
      required: true,
    },
    { id: "medical_certificate", label: "Medical Certificate", required: true },
    {
      id: "gov_physician_concurrence",
      label: "Government Physician Concurrence",
    },
  ],
  special_women: [
    { id: "medical_certificate", label: "Medical Certificate", required: true },
    { id: "clinical_summary", label: "Clinical Summary", required: true },
    {
      id: "histopathological_report",
      label: "Histopathological Report",
      required: true,
    },
    { id: "operative_report", label: "Operative Report", required: true },
  ],
  calamity: [
    { id: "proof_residency", label: "Proof of Residency", required: true },
    {
      id: "gov_verification",
      label: "Government Verification Document",
      required: true,
    },
  ],
  monetization: [
    {
      id: "letter_request",
      label: "Letter Request to Agency Head",
      required: true,
    },
  ],
  terminal: [
    {
      id: "separation_documents",
      label: "Proof of Resignation/Retirement/Separation",
      required: true,
    },
    {
      id: "clearance",
      label: "Money, Property & Work Clearance",
      required: true,
    },
  ],
  adoption: [
    {
      id: "pre_adoptive_placement",
      label: "Pre-Adoptive Placement Authority (DSWD)",
      required: true,
    },
  ],
  wellness: [],
  compensatory_off: [
    {
      id: "ot_approval",
      label: "Approved Overtime Authorization/DTR (basis for hours credited)",
    },
  ],
};

export const LEAVE_UPLOAD_FIELDS = {
  sick: [{ id: "medical_certificate", label: "Medical Certificate" }],
  maternity: [
    { id: "ultrasound", label: "Ultrasound" },
    { id: "doctor_certificate", label: "Doctor Certificate" },
  ],
  paternity: [
    { id: "birth_certificate", label: "Birth Certificate" },
    { id: "marriage_certificate", label: "Marriage Certificate" },
    { id: "medical_certificate", label: "Medical Certificate" },
  ],
  solo_parent: [{ id: "solo_parent_id", label: "Solo Parent ID" }],
  study: [{ id: "study_contract", label: "Study Leave Contract" }],
  vawc: [
    { id: "vawc_documents", label: "Supporting Documents", multiple: true },
  ],
  rehabilitation: [
    { id: "accident_report", label: "Accident Report" },
    { id: "medical_certificate", label: "Medical Certificate" },
  ],
  special_women: [
    { id: "medical_certificate", label: "Medical Certificate" },
    { id: "clinical_summary", label: "Clinical Summary" },
    { id: "histopathological_report", label: "Histopathological Report" },
    { id: "operative_report", label: "Operative Report" },
  ],
  calamity: [
    { id: "proof_residency", label: "Proof of Residency" },
    { id: "gov_verification", label: "Government Verification Document" },
  ],
  terminal: [{ id: "separation_documents", label: "Separation Documents" }],
  adoption: [
    { id: "pre_adoptive_placement", label: "Pre-Adoptive Placement Authority" },
  ],
};

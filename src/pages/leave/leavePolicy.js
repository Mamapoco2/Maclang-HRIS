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
];

export const LEAVE_TYPE_MAP = Object.fromEntries(
  LEAVE_TYPES.map((t) => [t.value, t]),
);

/** Leave types that do not use the date range section */
export const HIDE_DATE_SELECTION = new Set(["monetization"]);

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
};

/** Document requirements shown in the sidebar checklist */
export const LEAVE_REQUIREMENTS = {
  vacation: [
    { id: "travel_clearance", label: "Travel Authority / Clearance (if abroad)" },
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
    { id: "marriage_certificate", label: "Marriage Certificate", required: true },
    { id: "medical_certificate", label: "Medical Certificate", required: true },
  ],
  special_privilege: [],
  solo_parent: [
    { id: "solo_parent_id", label: "Solo Parent Identification Card", required: true },
  ],
  study: [
    { id: "study_contract", label: "Study Leave Contract", required: true },
  ],
  vawc: [
    { id: "bpo", label: "Barangay Protection Order" },
    { id: "tpo", label: "Temporary Protection Order" },
    { id: "ppo", label: "Permanent Protection Order" },
    { id: "barangay_cert", label: "Certification from Punong Barangay/Prosecutor" },
    { id: "police_report", label: "Police Report" },
    { id: "medical_certificate", label: "Medical Certificate" },
  ],
  rehabilitation: [
    { id: "accident_report", label: "Accident / Police Report", required: true },
    { id: "medical_certificate", label: "Medical Certificate", required: true },
    { id: "gov_physician_concurrence", label: "Government Physician Concurrence" },
  ],
  special_women: [
    { id: "medical_certificate", label: "Medical Certificate", required: true },
    { id: "clinical_summary", label: "Clinical Summary", required: true },
    { id: "histopathological_report", label: "Histopathological Report", required: true },
    { id: "operative_report", label: "Operative Report", required: true },
  ],
  calamity: [
    { id: "proof_residency", label: "Proof of Residency", required: true },
    { id: "gov_verification", label: "Government Verification Document", required: true },
  ],
  monetization: [
    { id: "letter_request", label: "Letter Request to Agency Head", required: true },
  ],
  terminal: [
    { id: "separation_documents", label: "Proof of Resignation/Retirement/Separation", required: true },
    { id: "clearance", label: "Money, Property & Work Clearance", required: true },
  ],
  adoption: [
    { id: "pre_adoptive_placement", label: "Pre-Adoptive Placement Authority (DSWD)", required: true },
  ],
};

/** Upload field definitions keyed by leave type */
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
  vawc: [{ id: "vawc_documents", label: "Supporting Documents", multiple: true }],
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
  adoption: [{ id: "pre_adoptive_placement", label: "Pre-Adoptive Placement Authority" }],
};

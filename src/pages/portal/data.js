import {
  CalendarDays,
  FileText,
  FlaskConical,
  CreditCard,
  Stethoscope,
  Siren,
  Droplets,
  Clock,
  Megaphone,
  Bed,
  HeartPulse,
  Building2,
  Smile,
  Baby,
  Bone,
  Brain,
  Scan,
  Pill,
  Activity,
} from "lucide-react";

export const HOSPITAL = {
  name: "Rosario Maclang Bautista General Hospital",
  short: "RMBGH",
  tagline: "Quality • Compassionate • Accessible",
  email: "rmbgh@quezoncity.gov.ph", // TODO: replace with real contact details
  phone: "8835-2560",
  emergency: "(000) 000-0000",
  address: "IBP Road Batasan Hills, Quezon City, Philippines",
  hours: "OPD: Mon - Fri, 8:00 AM - 5:00 PM  |  Emergency: 24/7",
};

// Staff-only systems shown in the navbar "Staff Access" menu.
// TODO: set ICS `to` to the real ICS address (full https:// URL opens in a new tab; "/path" stays in this app).
export const STAFF_SYSTEMS = [
  {
    key: "hris",
    short: "HRIS",
    name: "Human Resource Information System",
    desc: "Leave, attendance, hiring, trainings, 201 files",
    to: "/login",
    icon: "users",
  },
  {
    key: "ics",
    short: "ICS",
    name: "Internal Communication System",
    desc: "Memos, messages, announcements for staff",
    to: "https://ics.rmbgh.gov.ph",
    icon: "messages",
  },
];

export const NAV = [
  { label: "Home", to: "/portal", end: true },
  {
    label: "About",
    to: "/portal/about",
    children: ["Mission & Vision", "Hospital Leadership", "History"],
  },
  {
    label: "Services",
    to: "/portal/services",
    children: [
      "Outpatient (OPD)",
      "Emergency",
      "Laboratory & Imaging",
      "Pharmacy",
    ],
  },
  {
    label: "Patients",
    to: "/portal/statistics",
    children: [
      "Hospital Statistics",
      "Price List",
      "PhilHealth",
      "Patient's Rights",
    ],
  },
  {
    label: "News",
    to: "/portal/news",
    children: ["Advisories", "Programs", "Events"],
  },
  { label: "Contact", to: "/portal/contact" },
];

export const QUICK_SERVICES = [
  {
    icon: CalendarDays,
    title: "Book an Appointment",
    desc: "Schedule an OPD consultation",
    to: "/portal/services",
  },
  {
    icon: FileText,
    title: "Request Medical Records",
    desc: "Certificates, abstracts, results",
    to: "/portal/services/medical-records",
  },
  {
    icon: FlaskConical,
    title: "Laboratory & Imaging",
    desc: "Tests, X-ray, ultrasound, CT",
    to: "/portal/services",
  },
  {
    icon: CreditCard,
    title: "Billing & PhilHealth",
    desc: "Pay bills and check coverage",
    to: "/portal/services",
  },
  {
    icon: Stethoscope,
    title: "Find a Doctor",
    desc: "Specialists and clinic schedules",
    to: "/portal/services",
  },
];

export const NEWS = [
  {
    tag: "Program",
    color: "bg-[#0a7cd8]",
    date: "Oct 12, 2026",
    title: "Free Dental and Wellness Check-up for Employees' Families",
    tone: "from-sky-200 to-emerald-200",
  },
  {
    tag: "Update",
    color: "bg-[#f59e0b]",
    date: "Oct 10, 2026",
    title: "New Dialysis Unit Now Accepting Patients",
    tone: "from-amber-200 to-stone-300",
  },
  {
    tag: "Event",
    color: "bg-[#7c3aed]",
    date: "Oct 8, 2026",
    title: "Free Medical Mission for All Residents",
    tone: "from-sky-200 to-indigo-200",
  },
];

export const ANNOUNCEMENTS = [
  {
    icon: Siren,
    tint: "bg-red-100 text-red-600",
    title: "Dengue Advisory",
    date: "October 12, 2026",
  },
  {
    icon: Clock,
    tint: "bg-red-100 text-red-600",
    title: "Revised OPD Schedule",
    date: "October 11, 2026",
  },
  {
    icon: Droplets,
    tint: "bg-blue-100 text-blue-700",
    title: "Blood Donation Drive",
    date: "October 10, 2026",
  },
  {
    icon: Megaphone,
    tint: "bg-blue-100 text-blue-700",
    title: "Vaccination Schedule",
    date: "October 8, 2026",
  },
];

export const STATS = [
  { icon: Bed, value: "200", label: "Bed Capacity" },
  { icon: Stethoscope, value: "150+", label: "Doctors & Specialists" },
  { icon: Building2, value: "25", label: "Departments" },
  { icon: Smile, value: "98%", label: "Patient Satisfaction" },
];

export const SERVICE_CATEGORIES = [
  {
    icon: Stethoscope,
    title: "Outpatient (OPD)",
    desc: "Consultations and clinics",
    to: "/portal/services/medical-records",
  },
  {
    icon: Siren,
    title: "Emergency Room",
    desc: "24/7 emergency care",
    to: "/portal/services/medical-records",
  },
  {
    icon: Scan,
    title: "Laboratory & Imaging",
    desc: "Diagnostics, X-ray, ultrasound",
    to: "/portal/services/medical-records",
  },
  {
    icon: Baby,
    title: "Maternal & Child Health",
    desc: "OB-GYN, pediatrics, newborn care",
    to: "/portal/services/medical-records",
  },
  {
    icon: Bone,
    title: "Surgery & Orthopedics",
    desc: "Operating room and rehab",
    to: "/portal/services/medical-records",
  },
  {
    icon: Pill,
    title: "Pharmacy",
    desc: "Prescriptions and medicines",
    to: "/portal/services/medical-records",
  },
  {
    icon: HeartPulse,
    title: "Cardiology",
    desc: "Heart care and ECG",
    to: "/portal/services/medical-records",
  },
  {
    icon: Brain,
    title: "Neurology & Mental Health",
    desc: "Neuro and psychiatric care",
    to: "/portal/services/medical-records",
  },
  {
    icon: Activity,
    title: "Dialysis",
    desc: "Renal care unit",
    to: "/portal/services/medical-records",
  },
];

// Sample figures (patients per month) — connect to real census data later.
export const CENSUS = [
  { m: "Jan", actual: 5200, planned: 5000 },
  { m: "Feb", actual: 4800, planned: 5000 },
  { m: "Mar", actual: 5600, planned: 5200 },
  { m: "Apr", actual: 5100, planned: 5200 },
  { m: "May", actual: 5900, planned: 5400 },
  { m: "Jun", actual: 5300, planned: 5400 },
  { m: "Jul", actual: 6200, planned: 5600 },
  { m: "Aug", actual: 5800, planned: 5600 },
  { m: "Sep", actual: 6000, planned: 5800 },
  { m: "Oct", actual: 5700, planned: 5800 },
  { m: "Nov", actual: 6500, planned: 6000 },
  { m: "Dec", actual: 6300, planned: 6000 },
];

export const FOOTER_LINKS = {
  quick: [
    ["Home", "/portal"],
    ["About Us", "/portal/about"],
    ["Services", "/portal/services"],
    ["News and Advisories", "/portal/news"],
    ["Contact Us", "/portal/contact"],
  ],
  gov: [
    ["Hospital Statistics", "/portal/statistics"],
    ["Price List", "/portal/statistics"],
    ["PhilHealth Information", "/portal/statistics"],
    ["Annual Reports", "/portal/statistics"],
    ["Patient's Charter", "/portal/statistics"],
  ],
};

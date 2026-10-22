export { HOSPITAL, STATS, CENSUS } from "../shared/hospital";

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
  HeartPulse,
  Baby,
  Bone,
  Brain,
  Scan,
  Pill,
  Activity,
} from "lucide-react";

export const NAV = [
  { label: "Home", to: "/patients", end: true },
  {
    label: "About",
    to: "/patients/about",
    children: ["Mission & Vision", "Hospital Leadership", "History"],
  },
  {
    label: "Services",
    to: "/patients/services",
    children: [
      "Outpatient (OPD)",
      "Emergency",
      "Laboratory & Imaging",
      "Pharmacy",
    ],
  },
  {
    label: "Patients",
    to: "/patients/statistics",
    children: [
      "Hospital Statistics",
      "Price List",
      "PhilHealth",
      "Patient's Rights",
    ],
  },
  {
    label: "News",
    to: "/patients/news",
    children: ["Advisories", "Programs", "Events"],
  },
  { label: "Contact", to: "/patients/contact" },
];

export const QUICK_SERVICES = [
  {
    icon: CalendarDays,
    title: "Book an Appointment",
    desc: "Schedule an OPD consultation",
    to: "/patients/services",
  },
  {
    icon: FileText,
    title: "Request Medical Records",
    desc: "Certificates, abstracts, results",
    to: "/patients/services/medical-records",
  },
  {
    icon: FlaskConical,
    title: "Laboratory & Imaging",
    desc: "Tests, X-ray, ultrasound, CT",
    to: "/patients/services",
  },
  {
    icon: CreditCard,
    title: "Billing & PhilHealth",
    desc: "Pay bills and check coverage",
    to: "/patients/services",
  },
  {
    icon: Stethoscope,
    title: "Find a Doctor",
    desc: "Specialists and clinic schedules",
    to: "/patients/services",
  },
];

export const NEWS = [
  {
    tag: "Program",
    color: "bg-[#0a7cd8]",
    date: "Oct 12, 2026",
    title: "Free Blood Pressure and Wellness Screening for Residents",
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

export const SERVICE_CATEGORIES = [
  {
    icon: Stethoscope,
    title: "Outpatient (OPD)",
    desc: "Consultations and clinics",
    to: "/patients/services/medical-records",
  },
  {
    icon: Siren,
    title: "Emergency Room",
    desc: "24/7 emergency care",
    to: "/patients/services/medical-records",
  },
  {
    icon: Scan,
    title: "Laboratory & Imaging",
    desc: "Diagnostics, X-ray, ultrasound",
    to: "/patients/services/medical-records",
  },
  {
    icon: Baby,
    title: "Maternal & Child Health",
    desc: "OB-GYN, pediatrics, newborn care",
    to: "/patients/services/medical-records",
  },
  {
    icon: Bone,
    title: "Surgery & Orthopedics",
    desc: "Operating room and rehab",
    to: "/patients/services/medical-records",
  },
  {
    icon: Pill,
    title: "Pharmacy",
    desc: "Prescriptions and medicines",
    to: "/patients/services/medical-records",
  },
  {
    icon: HeartPulse,
    title: "Cardiology",
    desc: "Heart care and ECG",
    to: "/patients/services/medical-records",
  },
  {
    icon: Brain,
    title: "Neurology & Mental Health",
    desc: "Neuro and psychiatric care",
    to: "/patients/services/medical-records",
  },
  {
    icon: Activity,
    title: "Dialysis",
    desc: "Renal care unit",
    to: "/patients/services/medical-records",
  },
];

export const FOOTER_LINKS = {
  quick: [
    ["Home", "/patients"],
    ["About Us", "/patients/about"],
    ["Services", "/patients/services"],
    ["News and Advisories", "/patients/news"],
    ["Contact Us", "/patients/contact"],
  ],
  gov: [
    ["Hospital Statistics", "/patients/statistics"],
    ["Price List", "/patients/statistics"],
    ["PhilHealth Information", "/patients/statistics"],
    ["Annual Reports", "/patients/statistics"],
    ["Patient's Charter", "/patients/statistics"],
  ],
};

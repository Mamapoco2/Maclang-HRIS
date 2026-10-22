import {
  ClipboardCheck,
  Droplets,
  FileText,
  GraduationCap,
  Megaphone,
  MessagesSquare,
  Siren,
  Target,
  Users,
} from "lucide-react";

export { HOSPITAL } from "../shared/hospital";

// Systems employees sign in to.
// TODO: set the real ICS address (full https:// URL opens in a new tab; "/path" stays in this app).
export const STAFF_SYSTEMS = [
  {
    key: "hris",
    short: "HRIS",
    name: "Human Resource Information System",
    desc: "Leave, attendance, trainings, performance, 201 files",
    to: "/", // RootRedirect sends the signed-in user to their first accessible HRIS page
    icon: Users,
  },
  {
    key: "ics",
    short: "ICS",
    name: "Internal Communication System",
    desc: "Memos, messages, and announcements for staff",
    to: "https://ics.rmbgh.gov.ph",
    icon: MessagesSquare,
  },
];

export const NAV = [
  { label: "Home", to: "/portal", end: true },
  { label: "Announcements", to: "/portal#announcements" },
  { label: "Statistics", to: "/portal/statistics" },
];

// Targets are existing app routes; PermissionRoute still decides what each user can open.
export const QUICK_LINKS = [
  { icon: FileText, title: "Leave Requests", desc: "File and track your leave", to: "/leaveRequest" },
  { icon: ClipboardCheck, title: "Attendance & DTR", desc: "Daily time records", to: "/dtrRecords" },
  { icon: Target, title: "Performance (IPCR)", desc: "Your performance commitments", to: "/IPCR" },
  { icon: GraduationCap, title: "Trainings", desc: "Your trainings and certificates", to: "/trainings" },
  { icon: Megaphone, title: "Announcements", desc: "Official memos and circulars", to: "/Announcement" },
  { icon: MessagesSquare, title: "Messages", desc: "Staff inbox in ICS", to: "https://ics.rmbgh.gov.ph" },
];

// Sample content — replace with real data from ICS.
export const STAFF_NEWS = [
  {
    tag: "Program",
    color: "bg-[#0a7cd8]",
    date: "Oct 12, 2026",
    title: "Free Dental and Wellness Check-up for Employees' Families",
    tone: "from-sky-200 to-emerald-200",
  },
  {
    tag: "HR",
    color: "bg-[#f59e0b]",
    date: "Oct 10, 2026",
    title: "Year-End Performance Evaluation Opens November 1",
    tone: "from-amber-200 to-stone-300",
  },
  {
    tag: "Safety",
    color: "bg-[#7c3aed]",
    date: "Oct 8, 2026",
    title: "Updated Infection Control Protocol for All Wards",
    tone: "from-sky-200 to-indigo-200",
  },
];

export const STAFF_ANNOUNCEMENTS = [
  { icon: Siren, tint: "bg-red-100 text-red-600", title: "Dengue Advisory for Staff", date: "October 12, 2026" },
  { icon: Droplets, tint: "bg-blue-100 text-blue-700", title: "Employee Blood Donation Drive", date: "October 10, 2026" },
  { icon: Megaphone, tint: "bg-blue-100 text-blue-700", title: "Flu Vaccination for Employees", date: "October 8, 2026" },
];

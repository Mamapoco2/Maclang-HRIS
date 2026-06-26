import {
  LogIn,
  User,
  FileText,
  BarChart2,
  Settings,
  KeyRound,
  Link,
  ShieldAlert,
  Download,
  Activity,
} from "lucide-react";

// ─── BADGE STYLES ────────────────────────────────────────────────────────────

export const STATUS_STYLES = {
  success:
    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
  failed:
    "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20",
  warning:
    "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
  pending:
    "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
};

export const SEVERITY_STYLES = {
  low: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20",
  medium:
    "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
  high: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20",
  critical:
    "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20",
};

// ─── MODULE ICONS / COLORS ─────────────────────────────────────────────────────

export const MODULE_ICONS = {
  AUTH: LogIn,
  USER: User,
  PROJECT: FileText,
  BILLING: BarChart2,
  SETTINGS: Settings,
  APIKEY: KeyRound,
  WEBHOOK: Link,
  PERMISSION: KeyRound,
  SECURITY: ShieldAlert,
  REPORT: Download,
  INTEGRATION: Activity,
};

export const MODULE_COLORS = {
  AUTH: "bg-blue-500",
  USER: "bg-violet-500",
  PROJECT: "bg-emerald-500",
  BILLING: "bg-amber-500",
  SETTINGS: "bg-indigo-500",
  APIKEY: "bg-cyan-500",
  WEBHOOK: "bg-pink-500",
  PERMISSION: "bg-orange-500",
  SECURITY: "bg-rose-500",
  REPORT: "bg-teal-500",
  INTEGRATION: "bg-sky-500",
};

// ─── CHART COLORS ───────────────────────────────────────────────────────────────

export const CHART_COLORS = [
  "#6366f1",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
];

// ─── MISC ───────────────────────────────────────────────────────────────────────

export const TABS = ["Logs", "Timeline", "Analytics"];

export const COLS = [
  "Timestamp",
  "User",
  "Action",
  "Module",
  "Subject",
  "IP Address",
  "Status",
  "Severity",
  "Actions",
];

export const EMPTY_FILTERS = {
  search: "",
  module: "",
  username: "",
  status: "",
  severity: "",
};

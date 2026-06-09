import { useState, useEffect, useMemo } from "react";
import {
  GraduationCap,
  Users,
  CheckCircle,
  CheckCircle2,
  Clock3,
  AlertCircle,
  AlertTriangle,
  Search,
  Filter,
  Download,
  RefreshCw,
  MoreHorizontal,
  Mail,
  Smartphone,
  MessageSquare,
  FileSpreadsheet,
  FileText,
  Activity,
  PlayCircle,
  Circle,
  X,
  ChevronDown,
  ChevronUp,
  Eye,
  Bell,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MODULES = [
  "Company Introduction",
  "Policies and Procedures",
  "Security Awareness",
  "Workplace Conduct",
  "Benefits Overview",
  "System Training",
];

const EMPLOYEES = [
  {
    id: "EMP-1001",
    name: "James Reyes",
    email: "james.reyes@company.com",
    department: "IT",
    position: "Software Engineer",
    progress: 100,
    status: "Completed",
    startedDate: "2025-05-20",
    lastActivity: "2025-05-28",
    overdue: false,
    hireDate: "2025-05-15",
    manager: "Sarah Kim",
    modules: MODULES.map((name, i) => ({
      name,
      completed: true,
      progress: 100,
      completionDate: `2025-05-${20 + i}`,
    })),
    timeline: [
      { date: "2025-05-20", event: "Started orientation", icon: "play" },
      {
        date: "2025-05-21",
        event: "Completed Company Introduction",
        icon: "check",
      },
      {
        date: "2025-05-23",
        event: "Completed Security Awareness",
        icon: "check",
      },
      { date: "2025-05-28", event: "Finished all modules", icon: "check" },
    ],
  },
  {
    id: "EMP-1002",
    name: "Maria Santos",
    email: "maria.santos@company.com",
    department: "Finance",
    position: "Senior Accountant",
    progress: 67,
    status: "In Progress",
    startedDate: "2025-06-01",
    lastActivity: "2025-06-08",
    overdue: false,
    hireDate: "2025-05-28",
    manager: "Carlos Rivera",
    modules: MODULES.map((name, i) => ({
      name,
      completed: i < 4,
      progress: i < 4 ? 100 : i === 4 ? 40 : 0,
      completionDate: i < 4 ? `2025-06-0${i + 1}` : null,
    })),
    timeline: [
      { date: "2025-06-01", event: "Started orientation", icon: "play" },
      {
        date: "2025-06-02",
        event: "Completed Company Introduction",
        icon: "check",
      },
      {
        date: "2025-06-05",
        event: "Viewed Benefits Overview material",
        icon: "view",
      },
      {
        date: "2025-06-08",
        event: "In progress: Benefits Overview",
        icon: "activity",
      },
    ],
  },
  {
    id: "EMP-1003",
    name: "Kevin Lim",
    email: "kevin.lim@company.com",
    department: "HR",
    position: "HR Coordinator",
    progress: 33,
    status: "In Progress",
    startedDate: "2025-06-03",
    lastActivity: "2025-06-06",
    overdue: false,
    hireDate: "2025-06-01",
    manager: "Grace Tan",
    modules: MODULES.map((name, i) => ({
      name,
      completed: i < 2,
      progress: i < 2 ? 100 : i === 2 ? 60 : 0,
      completionDate: i < 2 ? `2025-06-0${i + 3}` : null,
    })),
    timeline: [
      { date: "2025-06-03", event: "Started orientation", icon: "play" },
      {
        date: "2025-06-04",
        event: "Completed Company Introduction",
        icon: "check",
      },
      {
        date: "2025-06-06",
        event: "Viewing Policies and Procedures",
        icon: "view",
      },
    ],
  },
  {
    id: "EMP-1004",
    name: "Aisha Patel",
    email: "aisha.patel@company.com",
    department: "Marketing",
    position: "Brand Strategist",
    progress: 0,
    status: "Not Started",
    startedDate: null,
    lastActivity: null,
    overdue: false,
    hireDate: "2025-06-05",
    manager: "Tom Ward",
    modules: MODULES.map((name) => ({
      name,
      completed: false,
      progress: 0,
      completionDate: null,
    })),
    timeline: [],
  },
  {
    id: "EMP-1005",
    name: "Daniel Cruz",
    email: "daniel.cruz@company.com",
    department: "Operations",
    position: "Operations Analyst",
    progress: 17,
    status: "Overdue",
    startedDate: "2025-05-25",
    lastActivity: "2025-05-27",
    overdue: true,
    hireDate: "2025-05-20",
    manager: "Lisa Chen",
    modules: MODULES.map((name, i) => ({
      name,
      completed: i === 0,
      progress: i === 0 ? 100 : 0,
      completionDate: i === 0 ? "2025-05-26" : null,
    })),
    timeline: [
      { date: "2025-05-25", event: "Started orientation", icon: "play" },
      {
        date: "2025-05-26",
        event: "Completed Company Introduction",
        icon: "check",
      },
      { date: "2025-05-27", event: "Last activity recorded", icon: "activity" },
    ],
  },
  {
    id: "EMP-1006",
    name: "Sophie Nguyen",
    email: "sophie.nguyen@company.com",
    department: "IT",
    position: "DevOps Engineer",
    progress: 83,
    status: "In Progress",
    startedDate: "2025-06-02",
    lastActivity: "2025-06-09",
    overdue: false,
    hireDate: "2025-05-30",
    manager: "Sarah Kim",
    modules: MODULES.map((name, i) => ({
      name,
      completed: i < 5,
      progress: i < 5 ? 100 : 70,
      completionDate: i < 5 ? `2025-06-0${i + 2}` : null,
    })),
    timeline: [
      { date: "2025-06-02", event: "Started orientation", icon: "play" },
      { date: "2025-06-04", event: "Completed first 3 modules", icon: "check" },
      {
        date: "2025-06-09",
        event: "Working on System Training",
        icon: "activity",
      },
    ],
  },
  {
    id: "EMP-1007",
    name: "Marcus Johnson",
    email: "marcus.johnson@company.com",
    department: "Finance",
    position: "Financial Analyst",
    progress: 0,
    status: "Not Started",
    startedDate: null,
    lastActivity: null,
    overdue: true,
    hireDate: "2025-06-04",
    manager: "Carlos Rivera",
    modules: MODULES.map((name) => ({
      name,
      completed: false,
      progress: 0,
      completionDate: null,
    })),
    timeline: [],
  },
  {
    id: "EMP-1008",
    name: "Elena Torres",
    email: "elena.torres@company.com",
    department: "Marketing",
    position: "Content Manager",
    progress: 100,
    status: "Completed",
    startedDate: "2025-05-22",
    lastActivity: "2025-05-30",
    overdue: false,
    hireDate: "2025-05-18",
    manager: "Tom Ward",
    modules: MODULES.map((name, i) => ({
      name,
      completed: true,
      progress: 100,
      completionDate: `2025-05-${22 + i}`,
    })),
    timeline: [
      { date: "2025-05-22", event: "Started orientation", icon: "play" },
      { date: "2025-05-28", event: "Completed all modules", icon: "check" },
    ],
  },
];

const TREND_DATA = [
  { week: "Week 1", completions: 3 },
  { week: "Week 2", completions: 5 },
  { week: "Week 3", completions: 4 },
  { week: "Week 4", completions: 8 },
  { week: "Week 5", completions: 6 },
  { week: "Week 6", completions: 10 },
];

const DEPT_DATA = [
  { department: "IT", completion: 90 },
  { department: "Finance", completion: 55 },
  { department: "HR", completion: 33 },
  { department: "Marketing", completion: 67 },
  { department: "Operations", completion: 17 },
];

const DEPARTMENTS = ["All", "IT", "Finance", "HR", "Marketing", "Operations"];
const STATUSES = ["All", "Completed", "In Progress", "Not Started", "Overdue"];
const CHART_COLORS = {
  Completed: "#1D9E75",
  "In Progress": "#378ADD",
  "Not Started": "#888780",
  Overdue: "#E24B4A",
};

// ─── Utility ──────────────────────────────────────────────────────────────────
function getInitials(name) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function daysSince(dateStr) {
  if (!dateStr) return null;
  const diff = (new Date() - new Date(dateStr)) / (1000 * 60 * 60 * 24);
  return Math.floor(diff);
}

function StatusBadge({ status }) {
  const config =
    {
      Completed: {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
        icon: <CheckCircle className="w-3 h-3" />,
      },
      "In Progress": {
        bg: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-200",
        icon: <Clock3 className="w-3 h-3" />,
      },
      "Not Started": {
        bg: "bg-gray-100",
        text: "text-gray-600",
        border: "border-gray-200",
        icon: <Circle className="w-3 h-3" />,
      },
      Overdue: {
        bg: "bg-red-50",
        text: "text-red-700",
        border: "border-red-200",
        icon: <AlertTriangle className="w-3 h-3" />,
      },
    }[status] || {};
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}
    >
      {config.icon}
      {status}
    </span>
  );
}

function Avatar({ name, size = "md" }) {
  const sz = size === "sm" ? "w-7 h-7 text-xs" : "w-9 h-9 text-sm";
  const colors = [
    "bg-blue-100 text-blue-700",
    "bg-emerald-100 text-emerald-700",
    "bg-purple-100 text-purple-700",
    "bg-amber-100 text-amber-700",
    "bg-rose-100 text-rose-700",
  ];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div
      className={`${sz} ${color} rounded-full flex items-center justify-center font-semibold shrink-0`}
    >
      {getInitials(name)}
    </div>
  );
}

function ProgressBar({ value, showLabel = true }) {
  const color =
    value === 100
      ? "bg-emerald-500"
      : value > 50
        ? "bg-blue-500"
        : value > 0
          ? "bg-amber-500"
          : "bg-gray-200";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-gray-500 w-8 text-right">{value}%</span>
      )}
    </div>
  );
}

// ─── Stats Cards ──────────────────────────────────────────────────────────────
function StatsCards({ employees }) {
  const total = employees.length;
  const completed = employees.filter((e) => e.status === "Completed").length;
  const inProgress = employees.filter((e) => e.status === "In Progress").length;
  const notStarted = employees.filter(
    (e) => e.status === "Not Started" || e.status === "Overdue",
  ).length;

  const stats = [
    {
      label: "Total Employees",
      value: total,
      pct: "100%",
      icon: <Users className="w-4 h-4" />,
      color: "text-gray-600 bg-gray-50",
      trend: "+2 this week",
    },
    {
      label: "Completed",
      value: completed,
      pct: `${Math.round((completed / total) * 100)}%`,
      icon: <CheckCircle className="w-4 h-4" />,
      color: "text-emerald-600 bg-emerald-50",
      trend: `${Math.round((completed / total) * 100)}% completion rate`,
    },
    {
      label: "In Progress",
      value: inProgress,
      pct: `${Math.round((inProgress / total) * 100)}%`,
      icon: <Clock3 className="w-4 h-4" />,
      color: "text-blue-600 bg-blue-50",
      trend: "Active this week",
    },
    {
      label: "Needs Attention",
      value: notStarted,
      pct: `${Math.round((notStarted / total) * 100)}%`,
      icon: <AlertCircle className="w-4 h-4" />,
      color: "text-rose-600 bg-rose-50",
      trend: "Requires follow-up",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm"
        >
          <div className="flex items-start justify-between mb-3">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {s.label}
            </p>
            <span className={`p-1.5 rounded-lg ${s.color}`}>{s.icon}</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{s.value}</p>
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-gray-400">{s.trend}</p>
            <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded">
              {s.pct}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Filters ──────────────────────────────────────────────────────────────────
function Filters({
  search,
  setSearch,
  dept,
  setDept,
  status,
  setStatus,
  onReset,
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-48 border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            className="bg-transparent text-sm flex-1 outline-none placeholder:text-gray-400"
            placeholder="Search employee name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch("")}>
              <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
        <select
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
          value={dept}
          onChange={(e) => setDept(e.target.value)}
        >
          {DEPARTMENTS.map((d) => (
            <option key={d} value={d}>
              {d === "All" ? "All Departments" : d}
            </option>
          ))}
        </select>
        <select
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s === "All" ? "All Statuses" : s}
            </option>
          ))}
        </select>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4" /> Reset
        </button>
      </div>
    </div>
  );
}

// ─── Employee Details Sheet ───────────────────────────────────────────────────
function EmployeeDetailsSheet({ employee, onClose }) {
  if (!employee) return null;
  const timelineIcons = {
    play: <PlayCircle className="w-4 h-4 text-blue-500" />,
    check: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
    view: <FileText className="w-4 h-4 text-purple-500" />,
    activity: <Activity className="w-4 h-4 text-amber-500" />,
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-white h-full shadow-2xl overflow-y-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <Avatar name={employee.name} />
            <div>
              <p className="font-semibold text-gray-900 text-sm">
                {employee.name}
              </p>
              <p className="text-xs text-gray-500">{employee.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 p-6 space-y-6">
          {/* Employee Info */}
          <section>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Employee Information
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                ["Department", employee.department],
                ["Position", employee.position],
                ["Hire Date", employee.hireDate],
                ["Manager", employee.manager],
                ["Email", employee.email],
                ["Status", null],
              ].map(([label, val]) => (
                <div key={label} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                  {label === "Status" ? (
                    <StatusBadge status={employee.status} />
                  ) : (
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {val}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Overall Progress */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Overall Progress
              </h3>
              <span className="text-lg font-bold text-gray-900">
                {employee.progress}%
              </span>
            </div>
            <ProgressBar value={employee.progress} showLabel={false} />
          </section>

          {/* Modules */}
          <section>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Orientation Modules
            </h3>
            <div className="space-y-2">
              {employee.modules.map((mod) => (
                <div
                  key={mod.name}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  {mod.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-gray-300 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {mod.name}
                    </p>
                    {mod.completionDate && (
                      <p className="text-xs text-gray-400">
                        Completed {mod.completionDate}
                      </p>
                    )}
                    {!mod.completed && mod.progress > 0 && (
                      <p className="text-xs text-blue-500">
                        {mod.progress}% in progress
                      </p>
                    )}
                  </div>
                  {!mod.completed && (
                    <span className="text-xs font-semibold text-gray-500">
                      {mod.progress}%
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Timeline */}
          {employee.timeline.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Activity Timeline
              </h3>
              <div className="space-y-3">
                {employee.timeline.map((item, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0">
                        {timelineIcons[item.icon]}
                      </div>
                      {i < employee.timeline.length - 1 && (
                        <div className="w-px h-4 bg-gray-200 mt-1" />
                      )}
                    </div>
                    <div className="pt-1">
                      <p className="text-sm text-gray-800">{item.event}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {item.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {employee.timeline.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <Circle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No activity recorded yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Attention Employees ──────────────────────────────────────────────────────
function AttentionEmployees({ employees, onViewDetails }) {
  const attention = employees.filter(
    (e) =>
      e.overdue ||
      (e.status === "Not Started" && daysSince(e.hireDate) >= 3) ||
      (e.lastActivity && daysSince(e.lastActivity) >= 2),
  );
  if (!attention.length) return null;

  return (
    <div className="bg-white rounded-xl border border-red-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-5 bg-red-50 border-b border-red-100">
        <AlertTriangle className="w-4 h-4 text-red-600" />
        <h2 className="text-sm font-semibold text-red-800">
          Employees Requiring Attention
        </h2>
        <span className="ml-auto text-xs bg-red-100 text-red-700 font-semibold px-2 py-0.5 rounded-full">
          {attention.length}
        </span>
      </div>
      <div className="divide-y divide-gray-50">
        {attention.map((emp) => (
          <div
            key={emp.id}
            className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-colors"
          >
            <Avatar name={emp.name} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{emp.name}</p>
              <p className="text-xs text-gray-400">
                {emp.department} · {emp.position}
              </p>
            </div>
            <div className="text-right shrink-0">
              <StatusBadge status={emp.status} />
              <p className="text-xs text-gray-400 mt-0.5">
                {emp.lastActivity
                  ? `Last active ${daysSince(emp.lastActivity)}d ago`
                  : `Not started · hired ${daysSince(emp.hireDate)}d ago`}
              </p>
            </div>
            <button
              onClick={() => onViewDetails(emp)}
              className="p-1.5 hover:bg-red-50 rounded-lg text-red-400 hover:text-red-600 transition-colors"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Reminder Actions ─────────────────────────────────────────────────────────
function ReminderActions() {
  const [sent, setSent] = useState({});
  const actions = [
    {
      key: "email",
      label: "Send Reminder Email",
      icon: <Mail className="w-4 h-4" />,
      color: "text-blue-600 bg-blue-50 hover:bg-blue-100 border-blue-200",
    },
    {
      key: "teams",
      label: "Send Teams Notification",
      icon: <MessageSquare className="w-4 h-4" />,
      color:
        "text-purple-600 bg-purple-50 hover:bg-purple-100 border-purple-200",
    },
    {
      key: "sms",
      label: "Send SMS Reminder",
      icon: <Smartphone className="w-4 h-4" />,
      color:
        "text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border-emerald-200",
    },
    {
      key: "report",
      label: "Generate Compliance Report",
      icon: <FileSpreadsheet className="w-4 h-4" />,
      color: "text-amber-600 bg-amber-50 hover:bg-amber-100 border-amber-200",
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <h2 className="text-sm font-semibold text-gray-700 mb-4">
        Quick Actions
      </h2>
      <div className="grid grid-cols-2 gap-2">
        {actions.map((a) => (
          <button
            key={a.key}
            onClick={() => {
              setSent((s) => ({ ...s, [a.key]: true }));
              setTimeout(
                () => setSent((s) => ({ ...s, [a.key]: false })),
                2000,
              );
            }}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-medium transition-all ${a.color} ${sent[a.key] ? "opacity-60" : ""}`}
          >
            {sent[a.key] ? <CheckCircle2 className="w-4 h-4" /> : a.icon}
            {sent[a.key] ? "Sent!" : a.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Charts ───────────────────────────────────────────────────────────────────
function OrientationCharts({ employees }) {
  const pieData = [
    {
      name: "Completed",
      value: employees.filter((e) => e.status === "Completed").length,
    },
    {
      name: "In Progress",
      value: employees.filter((e) => e.status === "In Progress").length,
    },
    {
      name: "Not Started",
      value: employees.filter((e) => e.status === "Not Started").length,
    },
    {
      name: "Overdue",
      value: employees.filter((e) => e.status === "Overdue").length,
    },
  ].filter((d) => d.value > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">
          Completion Overview
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
            >
              {pieData.map((entry) => (
                <Cell key={entry.name} fill={CHART_COLORS[entry.name]} />
              ))}
            </Pie>
            <Tooltip formatter={(v, n) => [v, n]} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center">
          {pieData.map((d) => (
            <span
              key={d.name}
              className="flex items-center gap-1.5 text-xs text-gray-500"
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: CHART_COLORS[d.name] }}
              />
              {d.name}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">
          Weekly Completion Trend
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={TREND_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="week" tick={{ fontSize: 10, fill: "#9ca3af" }} />
            <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="completions"
              stroke="#378ADD"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">
          Completion by Department
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={DEPT_DATA} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              type="number"
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: "#9ca3af" }}
              tickFormatter={(v) => `${v}%`}
            />
            <YAxis
              type="category"
              dataKey="department"
              tick={{ fontSize: 10, fill: "#9ca3af" }}
              width={70}
            />
            <Tooltip formatter={(v) => `${v}%`} />
            <Bar dataKey="completion" fill="#1D9E75" radius={[0, 3, 3, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── Table Row Actions ────────────────────────────────────────────────────────
function RowActions({ employee, onViewDetails }) {
  const [open, setOpen] = useState(false);
  const items = [
    "View Details",
    "View Orientation Logs",
    "Send Reminder",
    "Mark as Reviewed",
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
      >
        <MoreHorizontal className="w-4 h-4 text-gray-400" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1 overflow-hidden">
            {items.map((item) => (
              <button
                key={item}
                onClick={() => {
                  setOpen(false);
                  if (item === "View Details") onViewDetails(employee);
                }}
                className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {item}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main Table ───────────────────────────────────────────────────────────────
function OrientationTable({ employees, onViewDetails }) {
  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);
  const PER_PAGE = 5;

  const sorted = useMemo(() => {
    return [...employees].sort((a, b) => {
      const av = a[sortKey] ?? "";
      const bv = b[sortKey] ?? "";
      return sortDir === "asc" ? (av < bv ? -1 : 1) : av > bv ? -1 : 1;
    });
  }, [employees, sortKey, sortDir]);

  const pages = Math.ceil(sorted.length / PER_PAGE);
  const visible = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function toggleSort(key) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  }

  const SortIcon = ({ k }) =>
    sortKey === k ? (
      sortDir === "asc" ? (
        <ChevronUp className="w-3 h-3" />
      ) : (
        <ChevronDown className="w-3 h-3" />
      )
    ) : (
      <ChevronDown className="w-3 h-3 opacity-30" />
    );

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {[
                ["id", "ID", "w-24"],
                ["name", "Employee", "min-w-44"],
                ["department", "Dept", "w-24"],
                ["position", "Position", "min-w-36"],
                ["progress", "Progress", "min-w-36"],
                ["startedDate", "Started", "w-28"],
                ["lastActivity", "Last Active", "w-28"],
                ["status", "Status", "w-32"],
              ].map(([k, label, cls]) => (
                <th
                  key={k}
                  onClick={() => toggleSort(k)}
                  className={`${cls} text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700 select-none`}
                >
                  <span className="flex items-center gap-1">
                    {label}
                    <SortIcon k={k} />
                  </span>
                </th>
              ))}
              <th className="w-12 px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {visible.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  className="text-center py-12 text-gray-400 text-sm"
                >
                  No employees match your filters
                </td>
              </tr>
            )}
            {visible.map((emp) => (
              <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-xs text-gray-500 font-mono">
                  {emp.id}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={emp.name} />
                    <div>
                      <p className="font-medium text-gray-900 text-sm leading-tight">
                        {emp.name}
                      </p>
                      <p className="text-xs text-gray-400 leading-tight">
                        {emp.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium">
                    {emp.department}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-600">
                  {emp.position}
                </td>
                <td className="px-4 py-3 min-w-36">
                  <ProgressBar value={emp.progress} />
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  {emp.startedDate || <span className="text-gray-300">—</span>}
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  {emp.lastActivity || <span className="text-gray-300">—</span>}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={emp.status} />
                </td>
                <td className="px-4 py-3">
                  <RowActions employee={emp} onViewDetails={onViewDetails} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pages > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50">
          <span className="text-xs text-gray-500">
            {sorted.length} employees
          </span>
          <div className="flex gap-1">
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-7 h-7 rounded text-xs font-medium transition-colors ${p === page ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-200"}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function OrientationMonitoring() {
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("All");
  const [status, setStatus] = useState("All");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const filtered = useMemo(() => {
    return EMPLOYEES.filter((e) => {
      const q = search.toLowerCase();
      if (
        q &&
        !e.name.toLowerCase().includes(q) &&
        !e.id.toLowerCase().includes(q)
      )
        return false;
      if (dept !== "All" && e.department !== dept) return false;
      if (status !== "All" && e.status !== status) return false;
      return true;
    });
  }, [search, dept, status]);

  function handleRefresh() {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      setLastRefreshed(new Date());
    }, 1200);
  }

  return (
    <div className="h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-screen mx-auto px-6 py-5 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">
                Orientation Monitoring
              </h1>
              <p className="text-xs text-gray-500 leading-tight">
                Track employee orientation completion status
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 hidden sm:block">
              Last refreshed{" "}
              {lastRefreshed.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors"
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
            <button className="flex items-center gap-1.5 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg px-3 py-2 transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-screen mx-auto px-4 py-6 space-y-5">
        <StatsCards employees={EMPLOYEES} />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="xl:col-span-2">
            <AttentionEmployees
              employees={EMPLOYEES}
              onViewDetails={setSelectedEmployee}
            />
          </div>
          <ReminderActions />
        </div>

        <Filters
          search={search}
          setSearch={setSearch}
          dept={dept}
          setDept={setDept}
          status={status}
          setStatus={setStatus}
          onReset={() => {
            setSearch("");
            setDept("All");
            setStatus("All");
          }}
        />

        <OrientationTable
          employees={filtered}
          onViewDetails={setSelectedEmployee}
        />

        <OrientationCharts employees={EMPLOYEES} />
      </div>

      {/* Detail Sheet */}
      {selectedEmployee && (
        <EmployeeDetailsSheet
          employee={selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
        />
      )}
    </div>
  );
}

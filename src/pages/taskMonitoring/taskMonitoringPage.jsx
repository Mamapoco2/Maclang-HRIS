import { useState, useCallback, useRef } from "react";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Zap,
  FolderKanban,
  BarChart3,
  Users,
  Target,
  Calendar,
  Flag,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Plus,
  Edit2,
  Trash2,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Bell,
  Activity,
  AlertTriangle,
  Timer,
  Star,
  Tag,
  User,
  Layers,
  GitBranch,
  RefreshCw,
  CheckSquare,
  Square,
  MoreHorizontal,
  X,
  Send,
  Circle,
  Flame,
  ArrowRight,
  Shield,
  BookOpen,
  Award,
  Coffee,
  PieChart,
  Inbox,
  MessageSquare,
} from "lucide-react";

// ── Mock Data ─────────────────────────────────────────────────────────────────

const TEAM = [
  {
    id: 1,
    name: "Alex Kim",
    role: "Frontend Dev",
    avatar: "AK",
    color: "#6366f1",
  },
  {
    id: 2,
    name: "Sarah Chen",
    role: "Backend Dev",
    avatar: "SC",
    color: "#8b5cf6",
  },
  { id: 3, name: "Marcus Lee", role: "DevOps", avatar: "ML", color: "#06b6d4" },
  {
    id: 4,
    name: "Priya Patel",
    role: "QA Engineer",
    avatar: "PP",
    color: "#10b981",
  },
  {
    id: 5,
    name: "Jordan West",
    role: "Product",
    avatar: "JW",
    color: "#f59e0b",
  },
  {
    id: 6,
    name: "Dana Torres",
    role: "Designer",
    avatar: "DT",
    color: "#ef4444",
  },
];

const PROJECTS = [
  "Atlas Platform",
  "Nova API",
  "Orbit Dashboard",
  "Pulse Analytics",
  "Nexus Integration",
];
const SPRINTS = ["Sprint 23", "Sprint 24", "Sprint 25 (Current)", "Sprint 26"];
const LABELS = [
  "frontend",
  "backend",
  "api",
  "ui",
  "bug",
  "feature",
  "performance",
  "security",
  "docs",
];

const TASKS = [
  {
    id: "AT-101",
    title: "Implement OAuth2 token refresh",
    desc: "Auto-refresh expired tokens silently",
    project: "Atlas Platform",
    assignee: 2,
    priority: "Critical",
    status: "In Progress",
    sprint: "Sprint 25 (Current)",
    points: 8,
    due: "2026-06-12",
    created: "2026-05-20",
    labels: ["backend", "security"],
    progress: 65,
  },
  {
    id: "AT-102",
    title: "Design system token migration",
    desc: "Migrate legacy CSS vars to new token set",
    project: "Orbit Dashboard",
    assignee: 6,
    priority: "High",
    status: "Review",
    sprint: "Sprint 25 (Current)",
    points: 5,
    due: "2026-06-15",
    created: "2026-05-21",
    labels: ["ui", "frontend"],
    progress: 90,
  },
  {
    id: "AT-103",
    title: "CI/CD pipeline optimization",
    desc: "Reduce build time from 18min to under 8min",
    project: "Nova API",
    assignee: 3,
    priority: "High",
    status: "Done",
    sprint: "Sprint 25 (Current)",
    points: 13,
    due: "2026-06-10",
    created: "2026-05-18",
    labels: ["performance"],
    progress: 100,
  },
  {
    id: "AT-104",
    title: "Payment webhook handler",
    desc: "Handle Stripe events for subscriptions",
    project: "Atlas Platform",
    assignee: 2,
    priority: "Critical",
    status: "Blocked",
    sprint: "Sprint 25 (Current)",
    points: 8,
    due: "2026-06-08",
    created: "2026-05-15",
    labels: ["backend", "api"],
    progress: 30,
  },
  {
    id: "AT-105",
    title: "Mobile nav accessibility audit",
    desc: "WCAG 2.1 AA compliance for nav",
    project: "Orbit Dashboard",
    assignee: 4,
    priority: "Medium",
    status: "Testing",
    sprint: "Sprint 25 (Current)",
    points: 3,
    due: "2026-06-18",
    created: "2026-05-22",
    labels: ["frontend", "ui"],
    progress: 80,
  },
  {
    id: "AT-106",
    title: "Data export CSV/XLSX",
    desc: "Bulk export filtered table data",
    project: "Pulse Analytics",
    assignee: 1,
    priority: "Medium",
    status: "To Do",
    sprint: "Sprint 25 (Current)",
    points: 5,
    due: "2026-06-20",
    created: "2026-05-23",
    labels: ["feature", "backend"],
    progress: 0,
  },
  {
    id: "AT-107",
    title: "API rate limiting middleware",
    desc: "Per-tenant rate limiting with Redis",
    project: "Nova API",
    assignee: 2,
    priority: "High",
    status: "In Progress",
    sprint: "Sprint 25 (Current)",
    points: 8,
    due: "2026-06-22",
    created: "2026-05-24",
    labels: ["backend", "performance"],
    progress: 45,
  },
  {
    id: "AT-108",
    title: "Onboarding tour redesign",
    desc: "Interactive walkthrough for new users",
    project: "Atlas Platform",
    assignee: 6,
    priority: "Low",
    status: "Backlog",
    sprint: "Sprint 26",
    points: 13,
    due: "2026-07-05",
    created: "2026-05-25",
    labels: ["ui", "feature"],
    progress: 0,
  },
  {
    id: "AT-109",
    title: "Notification digest emails",
    desc: "Daily/weekly digest of activity",
    project: "Nexus Integration",
    assignee: 5,
    priority: "Medium",
    status: "To Do",
    sprint: "Sprint 26",
    points: 5,
    due: "2026-07-08",
    created: "2026-05-26",
    labels: ["feature", "backend"],
    progress: 0,
  },
  {
    id: "AT-110",
    title: "Search index performance",
    desc: "Elasticsearch query optimisation",
    project: "Pulse Analytics",
    assignee: 3,
    priority: "High",
    status: "Backlog",
    sprint: "Sprint 26",
    points: 8,
    due: "2026-07-10",
    created: "2026-05-27",
    labels: ["performance", "backend"],
    progress: 0,
  },
  {
    id: "AT-111",
    title: "Multi-tenant SSO setup",
    desc: "SAML2 integration per org",
    project: "Nexus Integration",
    assignee: 2,
    priority: "Critical",
    status: "Blocked",
    sprint: "Sprint 25 (Current)",
    points: 13,
    due: "2026-06-05",
    created: "2026-05-10",
    labels: ["security", "backend"],
    progress: 20,
  },
  {
    id: "AT-112",
    title: "Dashboard widget drag-drop",
    desc: "Reorderable widgets via DnD",
    project: "Orbit Dashboard",
    assignee: 1,
    priority: "Medium",
    status: "In Progress",
    sprint: "Sprint 25 (Current)",
    points: 8,
    due: "2026-06-25",
    created: "2026-05-28",
    labels: ["frontend", "ui"],
    progress: 55,
  },
];

const ACTIVITIES = [
  {
    id: 1,
    icon: Plus,
    color: "#6366f1",
    user: "Marcus Lee",
    action: "created task",
    task: "AT-112",
    detail: "Dashboard widget drag-drop",
    time: "2 min ago",
  },
  {
    id: 2,
    icon: Edit2,
    color: "#8b5cf6",
    user: "Sarah Chen",
    action: "updated status to In Progress",
    task: "AT-107",
    detail: "API rate limiting middleware",
    time: "14 min ago",
  },
  {
    id: 3,
    icon: Flag,
    color: "#ef4444",
    user: "Jordan West",
    action: "changed priority to Critical",
    task: "AT-111",
    detail: "Multi-tenant SSO setup",
    time: "31 min ago",
  },
  {
    id: 4,
    icon: User,
    color: "#06b6d4",
    user: "Priya Patel",
    action: "assigned task to",
    task: "AT-105",
    detail: "Mobile nav accessibility audit",
    time: "1 hr ago",
  },
  {
    id: 5,
    icon: MessageSquare,
    color: "#10b981",
    user: "Alex Kim",
    action: "commented on",
    task: "AT-112",
    detail: "Blocked on pointer-events iOS bug",
    time: "2 hr ago",
  },
  {
    id: 6,
    icon: CheckCircle2,
    color: "#10b981",
    user: "Marcus Lee",
    action: "completed task",
    task: "AT-103",
    detail: "CI/CD pipeline optimization",
    time: "3 hr ago",
  },
  {
    id: 7,
    icon: Zap,
    color: "#f59e0b",
    user: "System",
    action: "Sprint 25 started",
    task: null,
    detail: "42 story points committed",
    time: "1 day ago",
  },
  {
    id: 8,
    icon: AlertCircle,
    color: "#ef4444",
    user: "Sarah Chen",
    action: "marked as Blocked",
    task: "AT-104",
    detail: "Payment webhook handler",
    time: "1 day ago",
  },
];

const PROJECT_STATUS = [
  {
    name: "Atlas Platform",
    completion: 68,
    open: 24,
    closed: 52,
    blocked: 2,
    members: [1, 2, 5, 6],
    deadline: "2026-08-15",
    health: "On Track",
    risk: "Low",
  },
  {
    name: "Nova API",
    completion: 81,
    open: 11,
    closed: 47,
    blocked: 0,
    members: [2, 3, 4],
    deadline: "2026-07-30",
    health: "Ahead",
    risk: "Low",
  },
  {
    name: "Orbit Dashboard",
    completion: 55,
    open: 31,
    closed: 38,
    blocked: 1,
    members: [1, 4, 6],
    deadline: "2026-09-01",
    health: "At Risk",
    risk: "Medium",
  },
  {
    name: "Pulse Analytics",
    completion: 44,
    open: 38,
    closed: 30,
    blocked: 3,
    members: [1, 3, 5],
    deadline: "2026-10-01",
    health: "Behind",
    risk: "High",
  },
  {
    name: "Nexus Integration",
    completion: 29,
    open: 55,
    closed: 22,
    blocked: 4,
    members: [2, 3, 4, 5],
    deadline: "2026-11-15",
    health: "Behind",
    risk: "High",
  },
];

const WORKLOAD = [
  {
    memberId: 1,
    assigned: 8,
    completed: 19,
    workload: 72,
    capacity: 85,
    contribution: 18,
  },
  {
    memberId: 2,
    assigned: 12,
    completed: 23,
    workload: 95,
    capacity: 100,
    contribution: 28,
  },
  {
    memberId: 3,
    assigned: 6,
    completed: 17,
    workload: 58,
    capacity: 70,
    contribution: 14,
  },
  {
    memberId: 4,
    assigned: 5,
    completed: 21,
    workload: 45,
    capacity: 60,
    contribution: 12,
  },
  {
    memberId: 5,
    assigned: 9,
    completed: 14,
    workload: 82,
    capacity: 90,
    contribution: 16,
  },
  {
    memberId: 6,
    assigned: 7,
    completed: 11,
    workload: 63,
    capacity: 75,
    contribution: 12,
  },
];

const KANBAN_COLS = [
  "Backlog",
  "To Do",
  "In Progress",
  "Review",
  "Testing",
  "Done",
];

const PRIORITY_CFG = {
  Critical: { color: "#ef4444", bg: "rgba(239,68,68,0.1)", icon: Flame },
  High: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", icon: AlertTriangle },
  Medium: { color: "#6366f1", bg: "rgba(99,102,241,0.1)", icon: ArrowRight },
  Low: { color: "#10b981", bg: "rgba(16,185,129,0.1)", icon: ChevronDown },
};

const STATUS_CFG = {
  Backlog: { color: "#6b7280", bg: "rgba(107,114,128,0.1)" },
  "To Do": { color: "#6366f1", bg: "rgba(99,102,241,0.1)" },
  "In Progress": { color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  Review: { color: "#8b5cf6", bg: "rgba(139,92,246,0.1)" },
  Testing: { color: "#06b6d4", bg: "rgba(6,182,212,0.1)" },
  Done: { color: "#10b981", bg: "rgba(16,185,129,0.1)" },
  Blocked: { color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
};

const COL_COLORS = {
  Backlog: "#6b7280",
  "To Do": "#6366f1",
  "In Progress": "#f59e0b",
  Review: "#8b5cf6",
  Testing: "#06b6d4",
  Done: "#10b981",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const getMember = (id) => TEAM.find((t) => t.id === id);
const daysOverdue = (due) => {
  const d = Math.floor((new Date() - new Date(due)) / 86400000);
  return d > 0 ? d : 0;
};
const daysUntil = (due) => Math.ceil((new Date(due) - new Date()) / 86400000);
const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

// ── Shared Components ─────────────────────────────────────────────────────────

function Avatar({ member, size = 28 }) {
  const s = { width: size, height: size, fontSize: size * 0.36 };
  if (!member)
    return (
      <div
        style={s}
        className="rounded-full bg-gray-500 flex items-center justify-center font-semibold text-white shrink-0"
      >
        ?
      </div>
    );
  return (
    <div
      style={{
        ...s,
        background: member.color,
        border: "2px solid var(--color-background-primary,#fff)",
      }}
      className="rounded-full flex items-center justify-center font-semibold text-white shrink-0"
    >
      {member.avatar}
    </div>
  );
}

function ProgressBar({ value, color = "#6366f1", height = 6 }) {
  return (
    <div
      className="w-full rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700"
      style={{ height }}
    >
      <div
        style={{
          width: `${Math.min(100, value)}%`,
          background: color,
          height: "100%",
          borderRadius: 999,
          transition: "width 0.5s ease",
        }}
      />
    </div>
  );
}

function PriorityBadge({ priority }) {
  const cfg = PRIORITY_CFG[priority] || {};
  const Icon = cfg.icon || Circle;
  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded whitespace-nowrap"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      <Icon size={10} />
      {priority}
    </span>
  );
}

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || {};
  return (
    <span
      className="text-xs font-semibold px-2 py-0.5 rounded whitespace-nowrap"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {status}
    </span>
  );
}

function SectionHeader({ title, subtitle, actions }) {
  return (
    <div className="flex items-start justify-between mb-5 gap-3">
      <div>
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 tracking-tight m-0">
          {title}
        </h2>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

function Card({ children, className = "", style: s = {} }) {
  return (
    <div
      className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 ${className}`}
      style={s}
    >
      {children}
    </div>
  );
}

function IconBtn({ icon: Icon, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 text-xs font-medium bg-transparent cursor-pointer transition-colors"
    >
      <Icon size={13} />
      {label && <span>{label}</span>}
    </button>
  );
}

// ── Module 1: Executive Overview ──────────────────────────────────────────────

function KPICard({
  icon: Icon,
  label,
  value,
  trend,
  desc,
  trendUp,
  color = "#6366f1",
}) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 relative overflow-hidden hover:border-gray-400 dark:hover:border-gray-600 hover:shadow-md transition-all cursor-default">
      <div
        className="absolute -top-5 -right-5 w-20 h-20 rounded-full opacity-10"
        style={{ background: color }}
      />
      <div className="flex items-start justify-between mb-2.5">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: color + "20" }}
        >
          <Icon size={18} style={{ color }} />
        </div>
        <span
          className={`flex items-center gap-1 text-xs font-semibold ${trendUp ? "text-emerald-500" : "text-red-500"}`}
        >
          {trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {trend}
        </span>
      </div>
      <div className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 leading-tight">
        {value}
      </div>
      <div className="text-xs font-semibold text-gray-500 mt-1">{label}</div>
      <div className="text-xs text-gray-400 mt-0.5">{desc}</div>
    </div>
  );
}

function ExecutiveOverview() {
  const kpis = [
    {
      icon: Layers,
      label: "Total Tasks",
      value: "284",
      trend: "+12%",
      trendUp: true,
      desc: "Across all projects",
      color: "#6366f1",
    },
    {
      icon: CheckCircle2,
      label: "Completed",
      value: "189",
      trend: "+8%",
      trendUp: true,
      desc: "Tasks resolved",
      color: "#10b981",
    },
    {
      icon: Clock,
      label: "In Progress",
      value: "47",
      trend: "+3%",
      trendUp: true,
      desc: "Actively worked on",
      color: "#f59e0b",
    },
    {
      icon: XCircle,
      label: "Blocked",
      value: "11",
      trend: "+2",
      trendUp: false,
      desc: "Needs immediate action",
      color: "#ef4444",
    },
    {
      icon: AlertCircle,
      label: "Overdue",
      value: "18",
      trend: "-5%",
      trendUp: false,
      desc: "Past due date",
      color: "#f97316",
    },
    {
      icon: Target,
      label: "Sprint Rate",
      value: "74%",
      trend: "+6%",
      trendUp: true,
      desc: "Sprint 25 completion",
      color: "#8b5cf6",
    },
    {
      icon: Zap,
      label: "Team Velocity",
      value: "42 SP",
      trend: "+9%",
      trendUp: true,
      desc: "Avg story points/sprint",
      color: "#06b6d4",
    },
    {
      icon: FolderKanban,
      label: "Active Projects",
      value: "5",
      trend: "0%",
      trendUp: true,
      desc: "Running workstreams",
      color: "#ec4899",
    },
  ];
  return (
    <section>
      <SectionHeader
        title="Executive Overview"
        subtitle="Key performance indicators across all active projects"
      />
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
        {kpis.map((k) => (
          <KPICard key={k.label} {...k} />
        ))}
      </div>
    </section>
  );
}

// ── Module 2: Sprint Health ───────────────────────────────────────────────────

function SprintHealth() {
  const sprint = {
    name: "Sprint 25",
    goal: "Complete OAuth2 integration and ship Orbit Dashboard v2.1",
    start: "2026-06-02",
    end: "2026-06-16",
    total: 42,
    completed: 31,
    blocked: 3,
  };
  const remaining = sprint.total - sprint.completed;
  const pct = Math.round((sprint.completed / sprint.total) * 100);
  const daysLeft = daysUntil(sprint.end);
  const totalDays = Math.ceil(
    (new Date(sprint.end) - new Date(sprint.start)) / 86400000,
  );
  const daysPct = Math.round(((totalDays - daysLeft) / totalDays) * 100);

  return (
    <Card>
      <SectionHeader
        title="Sprint Health"
        subtitle="Sprint 25 · Jun 2 – Jun 16, 2026"
        actions={
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-100 text-emerald-600">
            Active
          </span>
        }
      />
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4 border-l-4 border-indigo-500">
        <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest m-0">
          Sprint Goal
        </p>
        <p className="text-sm text-gray-800 dark:text-gray-200 mt-1 m-0">
          {sprint.goal}
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          {
            label: "Days Remaining",
            value: daysLeft,
            sub: `of ${totalDays} days`,
            color: daysLeft <= 2 ? "#ef4444" : "#f59e0b",
          },
          {
            label: "Points Done",
            value: sprint.completed,
            sub: `of ${sprint.total} SP`,
            color: "#10b981",
          },
          {
            label: "Points Left",
            value: remaining,
            sub: "story points",
            color: "#6366f1",
          },
          {
            label: "Blocked",
            value: sprint.blocked,
            sub: "tasks",
            color: "#ef4444",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center"
          >
            <div
              className="text-xl font-bold tracking-tight"
              style={{ color: s.color }}
            >
              {s.value}
            </div>
            <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-0.5">
              {s.label}
            </div>
            <div className="text-xs text-gray-400">{s.sub}</div>
          </div>
        ))}
      </div>
      <div className="mb-3">
        <div className="flex justify-between text-xs font-semibold text-gray-500 mb-1.5">
          <span>Story Points Progress</span>
          <span
            style={{ color: pct >= 70 ? "#10b981" : "#f59e0b" }}
            className="font-bold"
          >
            {pct}%
          </span>
        </div>
        <ProgressBar
          value={pct}
          color={pct >= 70 ? "#10b981" : "#f59e0b"}
          height={10}
        />
      </div>
      <div>
        <div className="flex justify-between text-xs font-semibold text-gray-500 mb-1.5">
          <span>Timeline Progress</span>
          <span
            style={{ color: daysPct > pct ? "#ef4444" : "#10b981" }}
            className="font-bold"
          >
            {daysPct}%
          </span>
        </div>
        <ProgressBar
          value={daysPct}
          color={daysPct > pct ? "#ef4444" : "#6366f1"}
          height={10}
        />
        {daysPct > pct && (
          <p className="flex items-center gap-1 text-xs text-red-500 mt-1.5">
            <AlertTriangle size={11} />
            Timeline ahead of story point completion — at risk
          </p>
        )}
      </div>
    </Card>
  );
}

// ── Module 3: Kanban Board ────────────────────────────────────────────────────

function KanbanCard({ task, isDragging, onDragStart }) {
  const pCfg = PRIORITY_CFG[task.priority] || {};
  const PIcon = pCfg.icon || Circle;
  const member = getMember(task.assignee);
  return (
    <div
      draggable
      onDragStart={onDragStart}
      className={`bg-white dark:bg-gray-900 border rounded-lg p-3 transition-all select-none hover:shadow-md ${isDragging ? "opacity-50" : ""} cursor-grab active:cursor-grabbing border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500`}
    >
      <div className="flex justify-between items-start mb-1.5">
        <span className="text-xs font-bold text-gray-400 tracking-wider">
          {task.id}
        </span>
        <span
          className="flex items-center gap-1 text-xs font-semibold"
          style={{ color: pCfg.color }}
        >
          <PIcon size={10} />
          {task.priority}
        </span>
      </div>
      <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 leading-snug mb-1.5 m-0">
        {task.title}
      </p>
      <p className="text-xs text-gray-500 leading-snug mb-2 m-0 line-clamp-2">
        {task.desc}
      </p>
      {task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {task.labels.map((l) => (
            <span
              key={l}
              className="text-xs font-bold px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 uppercase tracking-wide"
              style={{ fontSize: 9 }}
            >
              {l}
            </span>
          ))}
        </div>
      )}
      {task.status === "In Progress" && task.progress > 0 && (
        <div className="mb-2">
          <ProgressBar value={task.progress} color="#6366f1" height={3} />
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Avatar member={member} size={20} />
          <span className="text-xs text-gray-400">
            {member?.name.split(" ")[0]}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Calendar size={9} />
            {formatDate(task.due)}
          </span>
          <span
            className="text-xs font-bold text-purple-500 bg-purple-100 dark:bg-purple-900/30 px-1.5 py-0.5 rounded"
            style={{ fontSize: 10 }}
          >
            {task.points}p
          </span>
        </div>
      </div>
    </div>
  );
}

function KanbanBoard({ tasks, onOpenModal }) {
  const [cols, setCols] = useState(() => {
    const m = {};
    KANBAN_COLS.forEach((c) => {
      m[c] = tasks.filter((t) => t.status === c);
    });
    return m;
  });
  const dragTask = useRef(null);
  const dragFrom = useRef(null);
  const [dragId, setDragId] = useState(null);
  const [dropCol, setDropCol] = useState(null);

  const handleDragStart = (task, col) => {
    dragTask.current = task;
    dragFrom.current = col;
    setDragId(task.id);
  };
  const handleDrop = (col) => {
    if (!dragTask.current || dragFrom.current === col) {
      setDragId(null);
      setDropCol(null);
      return;
    }
    setCols((prev) => {
      const next = { ...prev };
      next[dragFrom.current] = next[dragFrom.current].filter(
        (t) => t.id !== dragTask.current.id,
      );
      next[col] = [...next[col], { ...dragTask.current, status: col }];
      return next;
    });
    setDragId(null);
    setDropCol(null);
  };

  return (
    <div>
      <SectionHeader
        title="Kanban Board"
        subtitle="Sprint 25 · Drag tasks between columns"
        actions={
          <IconBtn icon={Plus} label="Add Task" onClick={() => onOpenModal()} />
        }
      />
      <div className="flex gap-3 overflow-x-auto pb-2">
        {KANBAN_COLS.map((col) => {
          const colTasks = cols[col] || [];
          const isDrop = dropCol === col;
          const colColor = COL_COLORS[col];
          return (
            <div
              key={col}
              className="min-w-[220px] max-w-[240px] shrink-0"
              onDragOver={(e) => {
                e.preventDefault();
                setDropCol(col);
              }}
              onDragLeave={() => setDropCol(null)}
              onDrop={() => handleDrop(col)}
            >
              <div className="flex items-center justify-between mb-2.5 px-0.5">
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: colColor }}
                  />
                  <span className="text-xs font-bold text-gray-900 dark:text-gray-100">
                    {col}
                  </span>
                </div>
                <span className="text-xs font-bold text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                  {colTasks.length}
                </span>
              </div>
              <div
                className="min-h-28 rounded-lg p-2 flex flex-col gap-2 transition-all"
                style={{
                  background: isDrop
                    ? colColor + "10"
                    : "var(--color-background-secondary,#f9fafb)",
                  border: isDrop
                    ? `1.5px dashed ${colColor}`
                    : "1px solid #e5e7eb",
                }}
              >
                {colTasks.length === 0 && (
                  <div className="text-center py-8 text-xs text-gray-400">
                    Drop here
                  </div>
                )}
                {colTasks.map((task) => (
                  <KanbanCard
                    key={task.id}
                    task={task}
                    isDragging={dragId === task.id}
                    onDragStart={() => handleDragStart(task, col)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Module 4: Task Table ──────────────────────────────────────────────────────

function TaskTable({ tasks, onOpenModal }) {
  const [search, setSearch] = useState("");
  const [sortCol, setSortCol] = useState("id");
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(new Set());
  const [filterPriority, setFilterPriority] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const PAGE_SIZE = 6;

  const filtered = tasks.filter((t) => {
    const q = search.toLowerCase();
    return (
      (!q ||
        t.id.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        t.project.toLowerCase().includes(q)) &&
      (filterPriority === "All" || t.priority === filterPriority) &&
      (filterStatus === "All" || t.status === filterStatus)
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    let av = a[sortCol],
      bv = b[sortCol];
    if (typeof av === "string") {
      av = av.toLowerCase();
      bv = bv.toLowerCase();
    }
    return av < bv
      ? sortDir === "asc"
        ? -1
        : 1
      : av > bv
        ? sortDir === "asc"
          ? 1
          : -1
        : 0;
  });

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const toggleSort = (col) => {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortCol(col);
      setSortDir("asc");
    }
  };
  const toggleSelect = (id) =>
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  const toggleAll = () =>
    setSelected((prev) =>
      prev.size === paginated.length
        ? new Set()
        : new Set(paginated.map((t) => t.id)),
    );

  const SortBtn = ({ col, label }) => (
    <button
      onClick={() => toggleSort(col)}
      className={`flex items-center gap-1 bg-transparent border-0 cursor-pointer text-xs p-0 whitespace-nowrap ${sortCol === col ? "text-gray-900 dark:text-gray-100 font-bold" : "text-gray-500 font-semibold"}`}
    >
      {label}
      {sortCol === col ? (
        sortDir === "asc" ? (
          <ChevronUp size={10} />
        ) : (
          <ChevronDown size={10} />
        )
      ) : (
        <ArrowUpDown size={10} />
      )}
    </button>
  );

  const selectCls =
    "h-8 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-500 text-xs px-2";

  return (
    <div>
      <SectionHeader
        title="Task Monitoring"
        subtitle={`${filtered.length} tasks · filtered view`}
        actions={
          <>
            <IconBtn
              icon={Plus}
              label="New Task"
              onClick={() => onOpenModal()}
            />
            {selected.size > 0 && (
              <IconBtn icon={Trash2} label={`Delete (${selected.size})`} />
            )}
          </>
        }
      />
      <div className="flex gap-2.5 mb-3.5 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search
            size={13}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search tasks…"
            className="w-full pl-8 pr-2.5 h-8 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400"
          />
        </div>
        <select
          value={filterPriority}
          onChange={(e) => {
            setFilterPriority(e.target.value);
            setPage(1);
          }}
          className={selectCls}
        >
          <option>All</option>
          {Object.keys(PRIORITY_CFG).map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            setPage(1);
          }}
          className={selectCls}
        >
          <option>All</option>
          {Object.keys(STATUS_CFG).map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="p-2 text-left w-8">
                <button
                  onClick={toggleAll}
                  className="bg-transparent border-0 cursor-pointer flex text-gray-500"
                >
                  {selected.size === paginated.length &&
                  paginated.length > 0 ? (
                    <CheckSquare size={14} />
                  ) : (
                    <Square size={14} />
                  )}
                </button>
              </th>
              {[
                ["id", "ID"],
                ["title", "Title"],
                ["project", "Project"],
                ["assignee", "Assignee"],
                ["priority", "Priority"],
                ["status", "Status"],
                ["points", "SP"],
                ["due", "Due"],
              ].map(([col, label]) => (
                <th
                  key={col}
                  className="p-2 text-left font-semibold text-gray-500 whitespace-nowrap"
                >
                  <SortBtn col={col} label={label} />
                </th>
              ))}
              <th className="p-2" />
            </tr>
          </thead>
          <tbody>
            {paginated.map((task) => {
              const member = getMember(task.assignee);
              const isOverdue =
                daysOverdue(task.due) > 0 && task.status !== "Done";
              return (
                <tr
                  key={task.id}
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  style={{
                    background: selected.has(task.id)
                      ? "rgba(99,102,241,0.04)"
                      : undefined,
                  }}
                >
                  <td className="p-2">
                    <button
                      onClick={() => toggleSelect(task.id)}
                      className="bg-transparent border-0 cursor-pointer flex"
                    >
                      {selected.has(task.id) ? (
                        <CheckSquare size={14} color="#6366f1" />
                      ) : (
                        <Square size={14} className="text-gray-400" />
                      )}
                    </button>
                  </td>
                  <td className="p-2 font-bold text-indigo-500 whitespace-nowrap">
                    {task.id}
                  </td>
                  <td className="p-2 max-w-48">
                    <p className="m-0 font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {task.title}
                    </p>
                  </td>
                  <td className="p-2 text-gray-500 whitespace-nowrap">
                    {task.project}
                  </td>
                  <td className="p-2">
                    <div className="flex items-center gap-1.5">
                      <Avatar member={member} size={20} />
                      <span className="text-gray-500 whitespace-nowrap">
                        {member?.name.split(" ")[0]}
                      </span>
                    </div>
                  </td>
                  <td className="p-2">
                    <PriorityBadge priority={task.priority} />
                  </td>
                  <td className="p-2">
                    <StatusBadge status={task.status} />
                  </td>
                  <td className="p-2 font-bold text-purple-500 text-center">
                    {task.points}
                  </td>
                  <td
                    className={`p-2 whitespace-nowrap ${isOverdue ? "text-red-500 font-bold" : "text-gray-500"}`}
                  >
                    {isOverdue && (
                      <AlertCircle size={11} className="inline mr-1" />
                    )}
                    {formatDate(task.due)}
                  </td>
                  <td className="p-2">
                    <button
                      onClick={() => onOpenModal(task)}
                      className="bg-transparent border-0 cursor-pointer text-gray-400 hover:text-gray-700 flex p-0.5"
                    >
                      <Edit2 size={13} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between mt-3.5 pt-3 border-t border-gray-100 dark:border-gray-800">
        <span className="text-xs text-gray-400">
          Page {page} of {totalPages} · {filtered.length} results
        </span>
        <div className="flex gap-1.5">
          {[
            [
              "Prev",
              <ChevronLeft size={12} />,
              () => setPage((p) => Math.max(1, p - 1)),
              page === 1,
            ],
            [
              "Next",
              <ChevronRight size={12} />,
              () => setPage((p) => Math.min(totalPages, p + 1)),
              page === totalPages,
            ],
          ].map(([label, icon, fn, disabled], i) => (
            <button
              key={label}
              onClick={fn}
              disabled={disabled}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-700 text-xs text-gray-500 bg-transparent transition-opacity ${disabled ? "opacity-40 cursor-default" : "cursor-pointer hover:border-gray-400"}`}
            >
              {i === 0 && icon}
              {label}
              {i === 1 && icon}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Module 5: Project Status ──────────────────────────────────────────────────

function ProjectStatusOverview() {
  const HEALTH_CFG = {
    Ahead: { color: "#10b981", bg: "rgba(16,185,129,0.1)" },
    "On Track": { color: "#6366f1", bg: "rgba(99,102,241,0.1)" },
    "At Risk": { color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
    Behind: { color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
  };
  const RISK_CFG = { Low: "#10b981", Medium: "#f59e0b", High: "#ef4444" };

  return (
    <div>
      <SectionHeader
        title="Project Status"
        subtitle="Health and progress across all active workstreams"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
        {PROJECT_STATUS.map((p) => {
          const hCfg = HEALTH_CFG[p.health] || {};
          return (
            <Card key={p.name} className="!p-4">
              <div className="flex justify-between items-start mb-2.5">
                <div>
                  <p className="m-0 text-sm font-bold text-gray-900 dark:text-gray-100">
                    {p.name}
                  </p>
                  <p className="m-0 mt-0.5 text-xs text-gray-400 flex items-center gap-1">
                    <Calendar size={10} />
                    Due {formatDate(p.deadline)}
                  </p>
                </div>
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{ background: hCfg.bg, color: hCfg.color }}
                >
                  {p.health}
                </span>
              </div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-gray-500">
                  Completion
                </span>
                <span
                  className="text-sm font-extrabold"
                  style={{ color: hCfg.color }}
                >
                  {p.completion}%
                </span>
              </div>
              <ProgressBar value={p.completion} color={hCfg.color} height={8} />
              <div className="grid grid-cols-3 gap-2 my-3">
                {[
                  ["Open", p.open, "#6366f1"],
                  ["Closed", p.closed, "#10b981"],
                  ["Blocked", p.blocked, "#ef4444"],
                ].map(([k, v, c]) => (
                  <div
                    key={k}
                    className="text-center bg-gray-50 dark:bg-gray-800 rounded-lg py-1.5"
                  >
                    <div className="text-base font-bold" style={{ color: c }}>
                      {v}
                    </div>
                    <div className="text-xs text-gray-400 font-semibold">
                      {k}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex">
                  {p.members.map((id, i) => (
                    <div key={id} style={{ marginLeft: i === 0 ? 0 : -6 }}>
                      <Avatar member={getMember(id)} size={22} />
                    </div>
                  ))}
                </div>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{
                    color: RISK_CFG[p.risk],
                    background: RISK_CFG[p.risk] + "20",
                  }}
                >
                  Risk: {p.risk}
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ── Module 6: Team Workload ───────────────────────────────────────────────────

function TeamWorkload() {
  return (
    <div>
      <SectionHeader
        title="Team Workload"
        subtitle="Capacity utilization and sprint contribution"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
        {WORKLOAD.map((w) => {
          const member = getMember(w.memberId);
          const overloaded = w.workload > 90;
          const utilColor =
            w.workload >= 90
              ? "#ef4444"
              : w.workload >= 70
                ? "#f59e0b"
                : "#10b981";
          return (
            <Card key={w.memberId} className="!p-4">
              <div className="flex items-center gap-3 mb-3.5">
                <Avatar member={member} size={38} />
                <div className="flex-1 min-w-0">
                  <p className="m-0 text-sm font-bold text-gray-900 dark:text-gray-100">
                    {member?.name}
                  </p>
                  <p className="m-0 mt-0.5 text-xs text-gray-500">
                    {member?.role}
                  </p>
                </div>
                {overloaded && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-500">
                    Overloaded
                  </span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {[
                  ["Assigned", w.assigned, "#6366f1"],
                  ["Done", w.completed, "#10b981"],
                  ["Contrib.", w.contribution + "%", "#8b5cf6"],
                ].map(([k, v, c]) => (
                  <div
                    key={k}
                    className="text-center bg-gray-50 dark:bg-gray-800 rounded-lg py-1.5"
                  >
                    <div className="text-base font-bold" style={{ color: c }}>
                      {v}
                    </div>
                    <div className="text-xs text-gray-400 font-semibold">
                      {k}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-xs font-semibold text-gray-500 mb-1">
                  <span>Workload</span>
                  <span style={{ color: utilColor }}>{w.workload}%</span>
                </div>
                <ProgressBar value={w.workload} color={utilColor} height={6} />
              </div>
              <div>
                <div className="flex justify-between text-xs font-semibold text-gray-500 mb-1">
                  <span>Capacity</span>
                  <span>{w.capacity}%</span>
                </div>
                <ProgressBar value={w.capacity} color="#6366f1" height={4} />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ── Module 7: Analytics ───────────────────────────────────────────────────────

function ChartCanvas({ id, height = 220 }) {
  return (
    <div className="relative w-full" style={{ height }}>
      <canvas id={id} role="img" aria-label={`Chart ${id}`} />
    </div>
  );
}

function Analytics() {
  const loaded = useRef(false);
  const setupCharts = useCallback((node) => {
    if (!node || loaded.current) return;
    loaded.current = true;
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js";
    script.onload = () => {
      const C = window.Chart;
      const base = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
      };
      new C(document.getElementById("chart-status"), {
        type: "doughnut",
        data: {
          labels: [
            "Done",
            "In Progress",
            "To Do",
            "Blocked",
            "Backlog",
            "Review",
            "Testing",
          ],
          datasets: [
            {
              data: [189, 47, 18, 11, 12, 4, 3],
              backgroundColor: [
                "#10b981",
                "#f59e0b",
                "#6366f1",
                "#ef4444",
                "#6b7280",
                "#8b5cf6",
                "#06b6d4",
              ],
              borderWidth: 0,
              hoverOffset: 4,
            },
          ],
        },
        options: { ...base, cutout: "68%" },
      });
      new C(document.getElementById("chart-priority"), {
        type: "bar",
        data: {
          labels: ["Critical", "High", "Medium", "Low"],
          datasets: [
            {
              data: [28, 67, 119, 70],
              backgroundColor: ["#ef4444", "#f59e0b", "#6366f1", "#10b981"],
              borderRadius: 5,
              borderSkipped: false,
            },
          ],
        },
        options: {
          ...base,
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: "#888", font: { size: 11 } },
            },
            y: {
              grid: { color: "rgba(128,128,128,0.1)" },
              ticks: { color: "#888", font: { size: 11 } },
            },
          },
        },
      });
      new C(document.getElementById("chart-velocity"), {
        type: "line",
        data: {
          labels: ["S19", "S20", "S21", "S22", "S23", "S24", "S25"],
          datasets: [
            {
              label: "Committed",
              data: [38, 40, 42, 39, 44, 41, 42],
              borderColor: "#6366f1",
              backgroundColor: "rgba(99,102,241,0.08)",
              fill: true,
              tension: 0.4,
              pointRadius: 4,
              borderWidth: 2,
            },
            {
              label: "Completed",
              data: [34, 37, 40, 38, 41, 39, 31],
              borderColor: "#10b981",
              backgroundColor: "rgba(16,185,129,0.08)",
              fill: true,
              tension: 0.4,
              pointRadius: 4,
              borderDash: [4, 4],
              borderWidth: 2,
            },
          ],
        },
        options: {
          ...base,
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: "#888", font: { size: 11 } },
            },
            y: {
              grid: { color: "rgba(128,128,128,0.1)" },
              ticks: { color: "#888", font: { size: 11 } },
            },
          },
        },
      });
      new C(document.getElementById("chart-burndown"), {
        type: "line",
        data: {
          labels: [
            "Day 1",
            "2",
            "3",
            "4",
            "5",
            "6",
            "7",
            "8",
            "9",
            "10",
            "11",
            "12",
            "13",
            "14",
          ],
          datasets: [
            {
              label: "Ideal",
              data: [42, 39, 36, 33, 30, 27, 24, 21, 18, 15, 12, 9, 6, 3, 0],
              borderColor: "#6b7280",
              borderDash: [4, 4],
              tension: 0,
              pointRadius: 0,
              borderWidth: 1.5,
            },
            {
              label: "Actual",
              data: [
                42,
                41,
                40,
                38,
                37,
                36,
                35,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
              ],
              borderColor: "#6366f1",
              backgroundColor: "rgba(99,102,241,0.06)",
              fill: true,
              tension: 0.3,
              pointRadius: 3,
              borderWidth: 2,
            },
          ],
        },
        options: {
          ...base,
          scales: {
            x: {
              grid: { display: false },
              ticks: {
                color: "#888",
                font: { size: 10 },
                autoSkip: true,
                maxRotation: 0,
              },
            },
            y: {
              grid: { color: "rgba(128,128,128,0.1)" },
              ticks: { color: "#888", font: { size: 11 } },
            },
          },
        },
      });
    };
    document.head.appendChild(script);
  }, []);

  const Legend = ({ items }) => (
    <div className="flex flex-wrap gap-2.5 mb-3">
      {items.map(([label, color]) => (
        <span
          key={label}
          className="flex items-center gap-1.5 text-xs text-gray-500"
        >
          <span
            className="w-2 h-2 rounded-sm shrink-0"
            style={{ background: color }}
          />
          {label}
        </span>
      ))}
    </div>
  );

  return (
    <div ref={setupCharts}>
      <SectionHeader
        title="Task Analytics"
        subtitle="Sprint 25 performance metrics and trend analysis"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <Card>
          <p className="text-xs font-bold text-gray-500 mb-3 m-0">
            Status Distribution
          </p>
          <Legend
            items={[
              ["Done", "#10b981"],
              ["In Progress", "#f59e0b"],
              ["To Do", "#6366f1"],
              ["Blocked", "#ef4444"],
              ["Backlog", "#6b7280"],
            ]}
          />
          <ChartCanvas id="chart-status" height={160} />
        </Card>
        <Card>
          <p className="text-xs font-bold text-gray-500 mb-3 m-0">
            Priority Distribution
          </p>
          <Legend
            items={[
              ["Critical", "#ef4444"],
              ["High", "#f59e0b"],
              ["Medium", "#6366f1"],
              ["Low", "#10b981"],
            ]}
          />
          <ChartCanvas id="chart-priority" height={160} />
        </Card>
        <Card>
          <p className="text-xs font-bold text-gray-500 mb-3 m-0">
            Sprint Velocity
          </p>
          <Legend
            items={[
              ["Committed", "#6366f1"],
              ["Completed", "#10b981"],
            ]}
          />
          <ChartCanvas id="chart-velocity" height={160} />
        </Card>
        <Card>
          <p className="text-xs font-bold text-gray-500 mb-3 m-0">
            Burndown Chart · Sprint 25
          </p>
          <Legend
            items={[
              ["Ideal", "#6b7280"],
              ["Actual", "#6366f1"],
            ]}
          />
          <ChartCanvas id="chart-burndown" height={160} />
        </Card>
      </div>
    </div>
  );
}

// ── Module 8: Activity Feed ───────────────────────────────────────────────────

function ActivityFeed() {
  return (
    <Card>
      <SectionHeader
        title="Recent Activity"
        subtitle="Live feed of team actions"
      />
      <div className="flex flex-col">
        {ACTIVITIES.map((a, i) => {
          const Icon = a.icon;
          const isLast = i === ACTIVITIES.length - 1;
          return (
            <div
              key={a.id}
              className={`flex gap-3 relative ${isLast ? "" : "pb-4"}`}
            >
              {!isLast && (
                <div className="absolute left-[15px] top-[30px] bottom-0 w-px bg-gray-100 dark:bg-gray-800" />
              )}
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10"
                style={{ background: a.color + "20" }}
              >
                <Icon size={13} style={{ color: a.color }} />
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <p className="m-0 text-xs text-gray-800 dark:text-gray-200 leading-snug">
                  <span className="font-bold">{a.user}</span>{" "}
                  <span className="text-gray-500">{a.action}</span>
                  {a.task && (
                    <>
                      <span className="font-bold text-indigo-500">
                        {" "}
                        {a.task}
                      </span>
                    </>
                  )}
                </p>
                <p className="m-0 mt-0.5 text-xs text-gray-400">
                  {a.detail} · {a.time}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ── Module 9: Overdue & Blocked ───────────────────────────────────────────────

function OverdueBlocked({ tasks, onOpenModal }) {
  const overdue = tasks.filter(
    (t) => daysOverdue(t.due) > 0 && t.status !== "Done",
  );
  const blocked = tasks.filter((t) => t.status === "Blocked");
  const blockReasons = {
    "AT-104": "Stripe API key not provisioned",
    "AT-111": "SSO vendor contract pending legal review",
  };
  const impactMap = { "AT-104": "High", "AT-111": "Critical" };

  return (
    <div>
      <SectionHeader
        title="Overdue & Blocked"
        subtitle="Tasks requiring immediate attention"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Overdue */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle size={15} color="#f59e0b" />
            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
              Overdue Tasks
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-500">
              {overdue.length}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {overdue.map((t) => {
              const days = daysOverdue(t.due);
              const member = getMember(t.assignee);
              return (
                <div
                  key={t.id}
                  className="rounded-lg p-3 border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900/30"
                >
                  <div className="flex justify-between items-start mb-1.5">
                    <div>
                      <span className="text-xs font-bold text-indigo-500">
                        {t.id}
                      </span>
                      <p className="m-0 mt-0.5 text-xs font-semibold text-gray-900 dark:text-gray-100">
                        {t.title}
                      </p>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-500 whitespace-nowrap">
                      {days}d overdue
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Avatar member={member} size={18} />
                      <span className="text-xs text-gray-500">
                        {member?.name}
                      </span>
                    </div>
                    <div className="flex gap-1.5">
                      <PriorityBadge priority={t.priority} />
                      <button
                        onClick={() => onOpenModal(t)}
                        className="text-xs font-semibold px-2 py-0.5 rounded border border-gray-200 dark:border-gray-700 bg-transparent text-gray-500 cursor-pointer hover:border-gray-400"
                      >
                        Reassign
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {/* Blocked */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <XCircle size={15} color="#ef4444" />
            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
              Blocked Tasks
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-500">
              {blocked.length}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {blocked.map((t) => {
              const member = getMember(t.assignee);
              const impact = impactMap[t.id] || "Medium";
              const iColor =
                impact === "Critical"
                  ? "#ef4444"
                  : impact === "High"
                    ? "#f59e0b"
                    : "#6366f1";
              return (
                <div
                  key={t.id}
                  className="rounded-lg p-3 border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900/30"
                >
                  <div className="flex justify-between items-start mb-1.5">
                    <div>
                      <span className="text-xs font-bold text-indigo-500">
                        {t.id}
                      </span>
                      <p className="m-0 mt-0.5 text-xs font-semibold text-gray-900 dark:text-gray-100">
                        {t.title}
                      </p>
                    </div>
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
                      style={{ color: iColor, background: iColor + "20" }}
                    >
                      Impact: {impact}
                    </span>
                  </div>
                  <p className="m-0 mb-2 text-xs text-gray-500 italic">
                    {blockReasons[t.id] || "Dependency unresolved"}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Avatar member={member} size={18} />
                      <span className="text-xs text-gray-500">
                        {member?.name}
                      </span>
                    </div>
                    <button
                      onClick={() => onOpenModal(t)}
                      className="text-xs font-semibold px-2 py-0.5 rounded border border-red-300 bg-transparent text-red-500 cursor-pointer hover:bg-red-100"
                    >
                      Unblock
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Module 10: Upcoming Deadlines ─────────────────────────────────────────────

function UpcomingDeadlines({ tasks }) {
  const todayTasks = tasks.filter(
    (t) => daysUntil(t.due) === 0 && t.status !== "Done",
  );
  const weekTasks = tasks.filter((t) => {
    const d = daysUntil(t.due);
    return d > 0 && d <= 7 && t.status !== "Done";
  });
  const urgency = (days) => {
    if (days === 0)
      return {
        label: "Due today",
        color: "#ef4444",
        bg: "rgba(239,68,68,0.1)",
      };
    if (days <= 2)
      return {
        label: `${days}d left`,
        color: "#f97316",
        bg: "rgba(249,115,22,0.1)",
      };
    if (days <= 5)
      return {
        label: `${days}d left`,
        color: "#f59e0b",
        bg: "rgba(245,158,11,0.1)",
      };
    return {
      label: `${days}d left`,
      color: "#6366f1",
      bg: "rgba(99,102,241,0.1)",
    };
  };
  const TaskRow = ({ task }) => {
    const d = daysUntil(task.due),
      u = urgency(d),
      member = getMember(task.assignee);
    return (
      <div className="flex items-center gap-3 py-2 border-b border-gray-100 dark:border-gray-800">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: u.bg }}
        >
          <Timer size={14} style={{ color: u.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="m-0 text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">
            {task.title}
          </p>
          <p className="m-0 mt-0.5 text-xs text-gray-400">
            {task.id} · {task.project}
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Avatar member={member} size={20} />
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ background: u.bg, color: u.color }}
          >
            {u.label}
          </span>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <SectionHeader
        title="Upcoming Deadlines"
        subtitle="Tasks and milestones due soon"
      />
      {todayTasks.length > 0 && (
        <>
          <div className="flex items-center gap-1.5 mb-2">
            <AlertTriangle size={12} color="#ef4444" />
            <span className="text-xs font-bold text-red-500 uppercase tracking-widest">
              Due Today
            </span>
          </div>
          {todayTasks.map((t) => (
            <TaskRow key={t.id} task={t} />
          ))}
          <div className="h-4" />
        </>
      )}
      <div className="flex items-center gap-1.5 mb-2">
        <Calendar size={12} color="#f59e0b" />
        <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">
          This Week
        </span>
      </div>
      {weekTasks.length === 0 ? (
        <p className="text-xs text-gray-400">No deadlines this week.</p>
      ) : (
        weekTasks
          .sort((a, b) => daysUntil(a.due) - daysUntil(b.due))
          .map((t) => <TaskRow key={t.id} task={t} />)
      )}
      <div className="mt-3.5 p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/30">
        <div className="flex items-center gap-2">
          <Star size={13} color="#6366f1" />
          <span className="text-xs font-bold text-indigo-500">
            Sprint 25 ends Jun 16
          </span>
          <span className="text-xs text-gray-400 ml-auto">
            {daysUntil("2026-06-16")} days remaining
          </span>
        </div>
      </div>
    </Card>
  );
}

// ── Module 11: Create/Edit Task Modal ─────────────────────────────────────────

function TaskModal({ task, onClose, onSave }) {
  const isEdit = !!task;
  const [form, setForm] = useState({
    title: task?.title || "",
    desc: task?.desc || "",
    project: task?.project || PROJECTS[0],
    assignee: task?.assignee || 1,
    priority: task?.priority || "Medium",
    status: task?.status || "To Do",
    sprint: task?.sprint || "Sprint 25 (Current)",
    points: task?.points || 3,
    labels: task?.labels || [],
    due: task?.due || "",
  });
  const [errors, setErrors] = useState({});
  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: null }));
  };
  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.due) e.due = "Due date is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };
  const handleSave = () => {
    if (validate()) {
      onSave({ ...task, ...form });
      onClose();
    }
  };
  const toggleLabel = (l) =>
    set(
      "labels",
      form.labels.includes(l)
        ? form.labels.filter((x) => x !== l)
        : [...form.labels, l],
    );

  const inputCls =
    "w-full px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400 box-border";

  const Field = ({ label, error, children }) => (
    <div className="mb-3.5">
      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1 m-0">{error}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 w-full max-w-xl max-h-[90vh] overflow-auto p-6">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100 m-0">
            {isEdit ? `Edit ${task.id}` : "Create New Task"}
          </h2>
          <button
            onClick={onClose}
            className="bg-transparent border-0 cursor-pointer text-gray-400 hover:text-gray-700 flex p-1"
          >
            <X size={18} />
          </button>
        </div>
        <Field label="Title" error={errors.title}>
          <input
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="What needs to be done?"
            className={`${inputCls} ${errors.title ? "border-red-400" : ""}`}
          />
        </Field>
        <Field label="Description">
          <textarea
            value={form.desc}
            onChange={(e) => set("desc", e.target.value)}
            placeholder="Add details, context, or acceptance criteria…"
            rows={3}
            className={`${inputCls} resize-y`}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Project">
            <select
              value={form.project}
              onChange={(e) => set("project", e.target.value)}
              className={inputCls}
            >
              {PROJECTS.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </Field>
          <Field label="Assignee">
            <select
              value={form.assignee}
              onChange={(e) => set("assignee", Number(e.target.value))}
              className={inputCls}
            >
              {TEAM.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Priority">
            <select
              value={form.priority}
              onChange={(e) => set("priority", e.target.value)}
              className={inputCls}
            >
              {Object.keys(PRIORITY_CFG).map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </Field>
          <Field label="Status">
            <select
              value={form.status}
              onChange={(e) => set("status", e.target.value)}
              className={inputCls}
            >
              {Object.keys(STATUS_CFG).map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Sprint">
            <select
              value={form.sprint}
              onChange={(e) => set("sprint", e.target.value)}
              className={inputCls}
            >
              {SPRINTS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Story Points">
            <select
              value={form.points}
              onChange={(e) => set("points", Number(e.target.value))}
              className={inputCls}
            >
              {[1, 2, 3, 5, 8, 13, 21].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Due Date" error={errors.due}>
          <input
            type="date"
            value={form.due}
            onChange={(e) => set("due", e.target.value)}
            className={`${inputCls} ${errors.due ? "border-red-400" : ""}`}
          />
        </Field>
        <Field label="Labels">
          <div className="flex flex-wrap gap-1.5">
            {LABELS.map((l) => {
              const active = form.labels.includes(l);
              return (
                <button
                  key={l}
                  onClick={() => toggleLabel(l)}
                  className={`text-xs px-2.5 py-1 rounded border cursor-pointer transition-all ${active ? "border-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 font-bold" : "border-gray-200 dark:border-gray-700 bg-transparent text-gray-500 hover:border-gray-400"}`}
                >
                  {l}
                </button>
              );
            })}
          </div>
        </Field>
        <div className="flex justify-end gap-2 mt-2 pt-4 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-gray-500 text-xs font-semibold cursor-pointer hover:border-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg border-0 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold cursor-pointer transition-colors"
          >
            <Send size={12} />
            {isEdit ? "Save Changes" : "Create Task"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── App Shell ─────────────────────────────────────────────────────────────────

const MODULES = [
  "Overview",
  "Sprint",
  "Kanban",
  "Tasks",
  "Projects",
  "Team",
  "Analytics",
  "Activity",
  "Overdue",
  "Deadlines",
];

export default function App() {
  const [tasks, setTasks] = useState(TASKS);
  const [modal, setModal] = useState(null);
  const [activeSection, setActiveSection] = useState("all");

  const openModal = (task = null) => setModal({ task });
  const closeModal = () => setModal(null);
  const saveTask = (updated) => {
    if (updated.id) {
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } else {
      const newId = `AT-${200 + tasks.length}`;
      setTasks((prev) => [
        {
          ...updated,
          id: newId,
          created: new Date().toISOString().slice(0, 10),
          progress: 0,
        },
        ...prev,
      ]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 sticky top-0 z-50">
        <div className="max-w-screen mx-auto flex items-center justify-between h-14">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center">
              <GitBranch size={14} color="#fff" />
            </div>
            <span className="text-sm font-extrabold tracking-tight">
              TaskFlow
            </span>
            <span className="text-xs font-semibold bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">
              Enterprise
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => openModal()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold border-0 cursor-pointer transition-colors"
            >
              <Plus size={13} />
              New Task
            </button>
          </div>
        </div>
        {/* Nav tabs */}
        <div className="max-w-screen mx-auto flex overflow-x-auto">
          {[
            ["all", "All Modules"],
            ...MODULES.map((m) => [m.toLowerCase(), m]),
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveSection(key)}
              className={`px-3.5 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-all bg-transparent cursor-pointer ${activeSection === key ? "border-indigo-500 text-indigo-500 font-bold" : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-screen mx-auto p-6 flex flex-col gap-10">
        {(activeSection === "all" || activeSection === "overview") && (
          <ExecutiveOverview />
        )}
        {(activeSection === "all" || activeSection === "sprint") && (
          <SprintHealth />
        )}
        {(activeSection === "all" || activeSection === "kanban") && (
          <Card>
            <KanbanBoard tasks={tasks} onOpenModal={openModal} />
          </Card>
        )}
        {(activeSection === "all" || activeSection === "tasks") && (
          <Card>
            <TaskTable tasks={tasks} onOpenModal={openModal} />
          </Card>
        )}
        {(activeSection === "all" || activeSection === "projects") && (
          <ProjectStatusOverview />
        )}
        {(activeSection === "all" || activeSection === "team") && (
          <TeamWorkload />
        )}
        {(activeSection === "all" || activeSection === "analytics") && (
          <Analytics />
        )}
        {(activeSection === "all" ||
          activeSection === "activity" ||
          activeSection === "deadlines") && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
            {(activeSection === "all" || activeSection === "activity") && (
              <ActivityFeed />
            )}
            {(activeSection === "all" || activeSection === "deadlines") && (
              <UpcomingDeadlines tasks={tasks} />
            )}
          </div>
        )}
        {(activeSection === "all" || activeSection === "overdue") && (
          <OverdueBlocked tasks={tasks} onOpenModal={openModal} />
        )}
      </div>

      {modal && (
        <TaskModal task={modal.task} onClose={closeModal} onSave={saveTask} />
      )}
    </div>
  );
}

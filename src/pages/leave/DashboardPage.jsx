import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "./PageHeader";
import { StatCard } from "./StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { StatusBadge, LeaveTypeBadge } from "./StatusBadge";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { formatDate } from "./utils";
import { initializeAutoYearlyUpdate } from "@/services/holidayService";
import {
  LEAVE_REQUESTS,
  HOLIDAYS,
  MONTHLY_TRENDS,
  LEAVE_TYPE_PIE,
  ACTIVITIES,
  LEAVE_BALANCES,
  CURRENT_USER,
} from "./mockData";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Palmtree,
  Plus,
  ArrowRight,
  Gift,
  Thermometer,
  BarChart3,
  PieChartIcon,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";

const COLORS = [
  "#6366f1",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#8b5cf6",
  "#6b7280",
];

const pendingCount = LEAVE_REQUESTS.filter(
  (r) => r.status === "pending",
).length;
const approvedCount = LEAVE_REQUESTS.filter(
  (r) => r.status === "approved",
).length;
const rejectedCount = LEAVE_REQUESTS.filter(
  (r) => r.status === "rejected",
).length;

const userBalance = LEAVE_BALANCES.find(
  (b) => b.employeeId === CURRENT_USER.id,
);
const vacationRemaining = userBalance
  ? userBalance.vacation.total -
    userBalance.vacation.used +
    userBalance.vacation.carryForward
  : 0;
const sickRemaining = userBalance
  ? userBalance.sick.total - userBalance.sick.used + userBalance.sick.carryForward
  : 0;

export default function DashboardPage({ onNavigate: onNavigateProp }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [holidays, setHolidays] = useState(HOLIDAYS);

  const onNavigate = (page) => {
    const routes = {
      "new-request": "/NewLeaveRequest",
      requests: "/leaveRequest",
      balances: "/leaveBalance",
      approvals: "/leaveApproval",
    };
    if (onNavigateProp) onNavigateProp(page);
    else navigate(routes[page] || "/leaveDashboard");
  };

  useEffect(() => {
    const cleanup = initializeAutoYearlyUpdate((updatedHolidays) => {
      const currentYear = updatedHolidays.currentYear;
      const nextYear = updatedHolidays.nextYear;
      const allHolidays = [
        ...(updatedHolidays[currentYear] ?? []),
        ...(updatedHolidays[nextYear] ?? []),
      ];
      setHolidays(allHolidays);
    });

    return () => cleanup();
  }, []);

  const upcomingHolidays = holidays
    .filter((h) => new Date(h.date) >= new Date())
    .slice(0, 4);

  return (
    <div className="p-5 ">
      <PageHeader
        title="Leave Dashboard"
        description={`Here is what's happening today.`}
        actions={
          <Button onClick={() => onNavigate("new-request")} size="sm">
            <Plus className="w-4 h-4" />
            New Request
          </Button>
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-[var(--muted)] p-1 rounded-lg w-fit">
        {["overview", "team", "analytics"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all capitalize ${
              activeTab === tab
                ? "bg-[var(--card)] text-[var(--foreground)] shadow-sm"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <OverviewTab
          onNavigate={onNavigate}
          upcomingHolidays={upcomingHolidays}
        />
      )}
      {activeTab === "team" && <TeamTab />}
      {activeTab === "analytics" && <AnalyticsTab />}
    </div>
  );
}

function OverviewTab({ onNavigate, upcomingHolidays }) {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Vacation Leave Balance"
          value={`${vacationRemaining} days`}
          subtitle={`of ${userBalance?.vacation.total ?? 21} total`}
          icon={Palmtree}
          color="indigo"
          className="animate-fade-in stagger-1"
        />
        <StatCard
          title="Sick Leave Balance"
          value={`${sickRemaining} days`}
          subtitle={`of ${userBalance?.sick.total ?? 15} total`}
          icon={Thermometer}
          color="amber"
          className="animate-fade-in stagger-2"
        />
        <StatCard
          title="Pending Requests"
          value={pendingCount}
          subtitle="Awaiting approval"
          icon={Clock}
          color="amber"
          className="animate-fade-in stagger-3"
        />
        <StatCard
          title="Approved Requests"
          value={approvedCount}
          subtitle="This year"
          icon={CheckCircle2}
          color="emerald"
          className="animate-fade-in stagger-4"
        />
        <StatCard
          title="Rejected Requests"
          value={rejectedCount}
          subtitle="This year"
          icon={XCircle}
          color="red"
          className="animate-fade-in stagger-5 col-span-2 lg:col-span-1"
        />
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="animate-fade-in">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Leave Usage Overview</CardTitle>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                  Monthly leave usage this year
                </p>
              </div>
              <BarChart3 className="w-4 h-4 text-[var(--muted-foreground)]" />
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart
                data={MONTHLY_TRENDS}
                margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="vacation" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="sick" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="vacation"
                  stroke="#3b82f6"
                  fill="url(#vacation)"
                  strokeWidth={2}
                  name="Vacation"
                />
                <Area
                  type="monotone"
                  dataKey="sick"
                  stroke="#f59e0b"
                  fill="url(#sick)"
                  strokeWidth={2}
                  name="Sick"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="animate-fade-in">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Leave Distribution by Type</CardTitle>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                  Breakdown of leave availed this year
                </p>
              </div>
              <PieChartIcon className="w-4 h-4 text-[var(--muted-foreground)]" />
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={LEAVE_TYPE_PIE}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {LEAVE_TYPE_PIE.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: "11px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="animate-fade-in stagger-4 max-w-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Upcoming Holidays</CardTitle>
            <Gift className="w-4 h-4 text-[var(--muted-foreground)]" />
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {upcomingHolidays.length > 0 ? (
            upcomingHolidays.map((h) => {
              const dateObj = new Date(h.date);
              const day = dateObj.toLocaleDateString("en-US", {
                weekday: "short",
              });
              const month = dateObj
                .toLocaleDateString("en-US", { month: "short" })
                .toUpperCase();
              const num = dateObj.getDate();

              return (
                <div
                  key={h.id ?? h.date}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-[var(--muted)]/50 hover:bg-[var(--muted)] transition-colors group"
                >
                  <div className="flex flex-col items-center justify-center w-11 h-11 rounded-lg bg-[var(--primary)]/10 flex-shrink-0">
                    <span className="text-[10px] font-semibold text-[var(--primary)] leading-none">
                      {month}
                    </span>
                    <span className="text-lg font-bold text-[var(--primary)] leading-tight">
                      {num}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--foreground)] truncate">
                      {h.name ?? h.localName}
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {day}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${
                      h.type === "public" || h.types?.includes("Public")
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                        : "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400"
                    }`}
                  >
                    {h.type ?? (h.types?.[0] || "holiday")}
                  </span>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-[var(--muted-foreground)] text-center py-4">
              No upcoming holidays
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card className="animate-fade-in stagger-5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Activities</CardTitle>
              <button
                onClick={() => onNavigate("requests")}
                className="text-xs text-[var(--primary)] hover:underline flex items-center gap-1"
              >
                View all <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {ACTIVITIES.map((a) => (
              <div key={a.id} className="flex items-start gap-3">
                <Avatar name={a.employee} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[var(--foreground)]">
                    <span className="font-semibold">{a.employee}</span>{" "}
                    <span className="text-[var(--muted-foreground)]">
                      {a.action}
                    </span>{" "}
                    {a.target}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                    {a.time}
                  </p>
                </div>
                <div
                  className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${a.type === "approved" ? "bg-emerald-500" : a.type === "rejected" ? "bg-red-500" : "bg-amber-500"}`}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* My Leave Balance Quick View */}
        <Card className="animate-fade-in stagger-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>My Leave Balance</CardTitle>
              <button
                onClick={() => onNavigate("balances")}
                className="text-xs text-[var(--primary)] hover:underline flex items-center gap-1"
              >
                Details <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                label: "Vacation Leave",
                used: userBalance?.vacation.used ?? 5,
                total: userBalance?.vacation.total ?? 21,
                color: "#3b82f6",
              },
              {
                label: "Sick Leave",
                used: userBalance?.sick.used ?? 1,
                total: userBalance?.sick.total ?? 15,
                color: "#f59e0b",
              },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-[var(--foreground)]">
                    {item.label}
                  </span>
                  <span className="text-xs text-[var(--muted-foreground)]">
                    {item.used}/{item.total} days
                  </span>
                </div>
                <div className="h-2 bg-[var(--muted)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${(item.used / item.total) * 100}%`,
                      background: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-2"
              onClick={() => onNavigate("new-request")}
            >
              <Plus className="w-4 h-4" /> Apply for Leave
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function TeamTab() {
  const teamLeaves = LEAVE_REQUESTS.filter(
    (r) => r.status === "approved" || r.status === "pending",
  );
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Team on Leave</CardTitle>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
            Current and upcoming approved leaves
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {teamLeaves.map((req) => (
              <div
                key={req.id}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-[var(--muted)]/50 transition-colors"
              >
                <Avatar name={req.employeeName} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-[var(--foreground)]">
                      {req.employeeName}
                    </p>
                    <span className="text-xs text-[var(--muted-foreground)]">
                      •
                    </span>
                    <span className="text-xs text-[var(--muted-foreground)]">
                      {req.department}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                    {formatDate(req.startDate)} — {formatDate(req.endDate)} ·{" "}
                    {req.days} days
                  </p>
                </div>
                <LeaveTypeBadge type={req.leaveType} />
                <StatusBadge status={req.status} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AnalyticsTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Leave by Type</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={LEAVE_TYPE_PIE}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {LEAVE_TYPE_PIE.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: "12px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Monthly Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={MONTHLY_TRENDS.slice(0, 6)} margin={{ left: -20 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Bar
                dataKey="vacation"
                stackId="a"
                fill="#6366f1"
                radius={[0, 0, 0, 0]}
                name="Vacation"
              />
              <Bar dataKey="sick" stackId="a" fill="#f59e0b" name="Sick" />
              <Bar
                dataKey="emergency"
                stackId="a"
                fill="#ef4444"
                radius={[4, 4, 0, 0]}
                name="Emergency"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

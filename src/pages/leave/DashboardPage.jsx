import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "./PageHeader";
import { StatCard } from "./StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { StatusBadge, LeaveTypeBadge } from "./StatusBadge";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { formatDate } from "./utils";
import { initializeAutoYearlyUpdate } from "@/services/holidayService";
import { useAuth } from "@/hooks/useAuth";
import LeaveApi from "@/services/leaveApiService";
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

export default function DashboardPage({ onNavigate: onNavigateProp }) {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const canViewOrgDashboard = hasPermission("leave.dashboard.view");

  const [activeTab, setActiveTab] = useState("overview");
  const [holidays, setHolidays] = useState([]);

  const [personal, setPersonal] = useState(null);
  const [overview, setOverview] = useState(null);
  const [activities, setActivities] = useState([]);
  const [teamRequests, setTeamRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const loadDashboard = useCallback(() => {
    setLoading(true);
    setError(null);

    const year = new Date().getFullYear();

    const tasks = [
      LeaveApi.getPersonalDashboard(year).catch(() => null),
      canViewOrgDashboard
        ? LeaveApi.getOverviewDashboard(year).catch(() => null)
        : Promise.resolve(null),
      canViewOrgDashboard
        ? LeaveApi.getActivityFeed(8).catch(() => [])
        : Promise.resolve([]),
      canViewOrgDashboard
        ? LeaveApi.listRequests({ per_page: 50 }).catch(() => ({ data: [] }))
        : Promise.resolve({ data: [] }),
    ];

    Promise.all(tasks)
      .then(([personalRes, overviewRes, activityRes, teamRes]) => {
        setPersonal(personalRes);
        setOverview(overviewRes);
        setActivities(activityRes ?? []);
        setTeamRequests(
          (teamRes.data ?? []).filter(
            (r) => r.status === "approved" || r.status === "pending",
          ),
        );
      })
      .catch(() => setError("Failed to load dashboard data."))
      .finally(() => setLoading(false));
  }, [canViewOrgDashboard]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

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

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={loadDashboard} className="underline font-medium">
            Retry
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-[var(--muted)] p-1 rounded-lg w-fit">
        {(canViewOrgDashboard
          ? ["overview", "team", "analytics"]
          : ["overview"]
        ).map((tab) => (
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
          personal={personal}
          overview={overview}
          activities={activities}
          loading={loading}
        />
      )}
      {activeTab === "team" && (
        <TeamTab teamRequests={teamRequests} loading={loading} />
      )}
      {activeTab === "analytics" && <AnalyticsTab overview={overview} />}
    </div>
  );
}

function OverviewTab({
  onNavigate,
  upcomingHolidays,
  personal,
  overview,
  activities,
  loading,
}) {
  const findBalance = (code) =>
    personal?.balances?.find((b) => b.leave_type === code);
  const vacationBalance = findBalance("vacation");
  const sickBalance = findBalance("sick");

  const pendingCount = overview?.pending_count ?? personal?.pending_count ?? 0;
  const approvedCount =
    overview?.approved_count ?? personal?.approved_count ?? 0;
  const rejectedCount =
    overview?.rejected_count ?? personal?.rejected_count ?? 0;

  const monthlyTrends = (overview?.monthly_trends ?? []).map((m) => ({
    month: m.month,
    ...m.breakdown,
  }));
  const leaveTypeDistribution = overview?.leave_type_distribution ?? [];

  const recentActivities = activities.map((log) => {
    const actionLabels = {
      submitted: "submitted a request for",
      finalized_approved: "was approved for",
      finalized_rejected: "was rejected for",
    };
    const typeMap = {
      submitted: "pending",
      finalized_approved: "approved",
      finalized_rejected: "rejected",
    };
    return {
      id: log.id,
      employee: log.leave_request?.employee?.full_name ?? "—",
      action: actionLabels[log.action] ?? log.action,
      target: log.leave_request?.leave_type?.name ?? "",
      time: formatDate(log.created_at),
      type: typeMap[log.action] ?? "pending",
    };
  });

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Vacation Leave Balance"
          value={vacationBalance ? `${vacationBalance.available} days` : "—"}
          subtitle={
            vacationBalance
              ? `${vacationBalance.used} used this year`
              : loading
                ? "Loading..."
                : "No employee record"
          }
          icon={Palmtree}
          color="indigo"
          className="animate-fade-in stagger-1"
        />
        <StatCard
          title="Sick Leave Balance"
          value={sickBalance ? `${sickBalance.available} days` : "—"}
          subtitle={
            sickBalance
              ? `${sickBalance.used} used this year`
              : loading
                ? "Loading..."
                : "No employee record"
          }
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
                data={monthlyTrends}
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
                  data={leaveTypeDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {leaveTypeDistribution.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.color ?? COLORS[i % COLORS.length]}
                    />
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
            {recentActivities.length === 0 ? (
              <p className="text-sm text-[var(--muted-foreground)] text-center py-4">
                No recent activity
              </p>
            ) : (
              recentActivities.map((a) => (
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
              ))
            )}
          </CardContent>
        </Card>

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
                used: vacationBalance?.used ?? 0,
                total:
                  (vacationBalance?.used ?? 0) +
                  (vacationBalance?.available ?? 0),
                color: "#3b82f6",
              },
              {
                label: "Sick Leave",
                used: sickBalance?.used ?? 0,
                total: (sickBalance?.used ?? 0) + (sickBalance?.available ?? 0),
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
                      width: `${item.total > 0 ? (item.used / item.total) * 100 : 0}%`,
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

function TeamTab({ teamRequests = [], loading }) {
  const teamLeaves = teamRequests.map((r) => ({
    id: r.id,
    employeeName: r.employee?.name ?? "—",
    department: r.employee?.department ?? "—",
    leaveType: r.leave_type?.code ?? "—",
    startDate: r.start_date,
    endDate: r.end_date,
    days: r.total_days,
    status: r.status,
  }));

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
            {loading ? (
              <p className="text-sm text-[var(--muted-foreground)] text-center py-4">
                Loading...
              </p>
            ) : teamLeaves.length === 0 ? (
              <p className="text-sm text-[var(--muted-foreground)] text-center py-4">
                No team members on leave
              </p>
            ) : (
              teamLeaves.map((req) => (
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
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AnalyticsTab({ overview }) {
  const leaveTypeDistribution = overview?.leave_type_distribution ?? [];
  const monthlyTrends = (overview?.monthly_trends ?? []).map((m) => ({
    month: m.month,
    ...m.breakdown,
  }));

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
                data={leaveTypeDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {leaveTypeDistribution.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.color ?? COLORS[i % COLORS.length]}
                  />
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
            <BarChart data={monthlyTrends.slice(0, 6)} margin={{ left: -20 }}>
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

import { useEffect, useState, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { employeeService } from "@/services/employeeService";

import LineChartComponent from "./lineChart";
import BarChartComponent from "./barChart";
import PieChartComponent from "./pieChart";
import DoughnutChartComponent from "./doughnutChart";

function useCountUp(target, duration = 1200) {
  const [display, setDisplay] = useState(0);
  const raf = useRef(null);

  useEffect(() => {
    if (target === null || target === undefined) return;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplay(Math.round(target * eased));
      if (progress < 1) raf.current = requestAnimationFrame(tick);
    };

    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);

  return display;
}

// ─── employee stats hook ──────────────────────────────────────────────────────
function useEmployeeStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    employeeService
      .getAllEmployees()
      .then((res) => {
        const list = res.data ?? [];
        const now = new Date();

        const total = list.length;
        const newHires = list.filter((e) => {
          const start = e.primaryAssignment?.start_date;
          if (!start) return false;
          const d = new Date(start);
          return (
            d.getMonth() === now.getMonth() &&
            d.getFullYear() === now.getFullYear()
          );
        }).length;
        const active = list.filter(
          (e) => e.primaryAssignment && !e.primaryAssignment.end_date,
        ).length;

        setStats({ total, newHires, active });
      })
      .catch(() => setStats({ total: 0, newHires: 0, active: 0 }))
      .finally(() => setLoading(false));
  }, []);

  return { stats, loading };
}

// ─── animated KPI card ────────────────────────────────────────────────────────
function KpiCard({ label, value, staticValue, change, up, loading }) {
  const animated = useCountUp(loading || value === undefined ? null : value);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold">
          {loading && value === undefined ? (
            <span className="inline-block h-9 w-20 animate-pulse rounded bg-muted" />
          ) : staticValue ? (
            staticValue
          ) : (
            <span key={value}>{animated.toLocaleString()}</span>
          )}
        </p>
        <p className={`text-xs mt-1 ${up ? "text-green-600" : "text-red-600"}`}>
          {change}
        </p>
      </CardContent>
    </Card>
  );
}

// ─── dashboard ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { stats, loading } = useEmployeeStats();

  const cards = [
    {
      label: "Total Employees",
      value: stats?.total,
      change: "+12 this month",
      up: true,
    },
    {
      label: "New Hires",
      value: stats?.newHires,
      change: "This month",
      up: true,
    },
    {
      label: "Active Employees",
      value: stats?.active,
      change: "With active assignment",
      up: true,
    },
    {
      label: "Employee Turnover Rate",
      staticValue: "4.8%",
      change: "-0.6% this quarter",
      up: true,
    },
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          HR Analytics Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of workforce, recruitment, and employee performance.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <KpiCard key={card.label} {...card} loading={loading} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 grid-cols-1 xl:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold mb-1">Employee Growth Trend</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Total employees for the last 3 months
          </p>
          <LineChartComponent />
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-1">
            Job Applications per Month
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            January – June 2024
          </p>
          <BarChartComponent />
        </div>
      </div>

      {/* Distribution + Insights */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <div>
          <h2 className="text-lg font-semibold mb-1">
            Employee Application Distribution
          </h2>
          <p className="text-sm text-muted-foreground mb-4">By department</p>
          <PieChartComponent />
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-1">Recruitment Sources</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Breakdown by hiring channel
          </p>
          <DoughnutChartComponent />
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">HR Insights</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>• Employee headcount increased steadily this quarter.</p>
            <p>
              • Retention rate improved by{" "}
              <span className="text-green-600">+3.5%</span>.
            </p>
            <p>• Recruitment from referrals increased.</p>
            <p>• Resignations declined compared to last month.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

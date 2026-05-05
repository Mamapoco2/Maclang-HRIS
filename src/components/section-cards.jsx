// src/pages/dashboard/SectionCards.jsx
import { useEffect, useState, useRef } from "react";
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { Users, Stethoscope, ClipboardList, UserCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { employeeService } from "@/services/employeeService";

// ─── department name sets (matched against e.departments[].name) ──────────────

const MEDICAL_DEPT_NAMES = new Set([
  "ANATOMIC AND CLINICAL LABORATORY",
  "BLOOD BANK",
  "CLINICAL DEPARTMENTS",
  "CLINICAL NURSING",
  "DELIVERY ROOM",
  "DENTAL SERVICES",
  "DEPARTMENT OF PATHOLOGY",
  "DEPARTMENT OF RADIOLOGY",
  "EMERGENCY MEDICINE DEPARTMENT",
  "HEALTH INFORMATION MANAGEMENT",
  "HUMAN MILK BANK",
  "INTENSIVE CARE",
  "MEDICAL SERVICE",
  "CENTRAL SUPPLY AND STERILIZATION",
  "MEDICAL CENTER CHIEF",
]);

const ADMIN_DEPT_NAMES = new Set([
  "ACCOUNTING",
  "ADMITTING",
  "BILLING AND CLAIMS",
  "BUDGET",
  "CASH MANAGEMENT",
  "FACILITIES MANAGEMENT",
  "ENGINEERING",
  "HOUSEKEEPING/LAUNDRY",
  "HUMAN RESOURCE MANAGEMENT",
  "MATERIALS MANAGEMENT",
]);

const isInDeptSet = (employee, nameSet) =>
  employee.departments?.some((d) => nameSet.has(d.name?.toUpperCase()));

// ─── animated counter hook ────────────────────────────────────────────────────
function useCountUp(target, duration = 1200) {
  const [display, setDisplay] = useState(0);
  const raf = useRef(null);

  useEffect(() => {
    if (target === null || target === undefined) return;
    const start = performance.now();

    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(target * eased));
      if (progress < 1) raf.current = requestAnimationFrame(tick);
    };

    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);

  return display;
}

// ─── stats hook ───────────────────────────────────────────────────────────────
function useDashboardStats() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await employeeService.getAllEmployees();
        const list = res.data ?? [];

        const total = list.length;
        const medical = list.filter((e) =>
          isInDeptSet(e, MEDICAL_DEPT_NAMES),
        ).length;
        const admin = list.filter((e) =>
          isInDeptSet(e, ADMIN_DEPT_NAMES),
        ).length;
        const plantilla = list.filter(
          (e) => e.employment_type === "Plantilla",
        ).length;

        setStats({ total, medical, admin, plantilla });
      } catch (err) {
        setError(err);
      }
    };
    load();
  }, []);

  return { stats, error };
}

// ─── stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, trend, trendLabel, sub }) {
  const isUp = trend >= 0;
  const animated = useCountUp(value);

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription className="flex items-center gap-1.5">
          {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" />}
          {label}
        </CardDescription>

        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          <span key={value}>{animated.toLocaleString()}</span>
        </CardTitle>

        <CardAction>
          <Badge variant="outline">
            {isUp ? (
              <IconTrendingUp className="mr-1 h-3 w-3" />
            ) : (
              <IconTrendingDown className="mr-1 h-3 w-3" />
            )}
            {isUp ? "+" : ""}
            {trend}%
          </Badge>
        </CardAction>
      </CardHeader>

      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="line-clamp-1 flex gap-2 font-medium">
          {trendLabel}
          {isUp ? (
            <IconTrendingUp className="size-4" />
          ) : (
            <IconTrendingDown className="size-4" />
          )}
        </div>
        <div className="text-muted-foreground">{sub}</div>
      </CardFooter>
    </Card>
  );
}

// ─── main export ──────────────────────────────────────────────────────────────
export function SectionCards() {
  const { stats } = useDashboardStats();

  const cards = [
    {
      label: "All Employees",
      value: stats?.total ?? 0,
      icon: Users,
      trend: 12.5,
      trendLabel: "Trending up this month",
      sub: "Total headcount across all departments",
    },
    {
      label: "Plantilla Positions",
      value: stats?.plantilla ?? 0,
      icon: UserCheck,
      trend: 8,
      trendLabel: "Steady growth this quarter",
      sub: "Filled plantilla items",
    },
    {
      label: "Medical Staff",
      value: stats?.medical ?? 0,
      icon: Stethoscope,
      trend: -20,
      trendLabel: "Down 20% this period",
      sub: "Acquisition needs attention",
    },
    {
      label: "Administrative Staff",
      value: stats?.admin ?? 0,
      icon: ClipboardList,
      trend: 12.5,
      trendLabel: "Strong retention",
      sub: "Engagement exceeds targets",
    },
  ];

  return (
    <div className="*:data-[slot=card]:from-primary/5 grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {cards.map((card) => (
        <StatCard key={card.label} {...card} />
      ))}
    </div>
  );
}

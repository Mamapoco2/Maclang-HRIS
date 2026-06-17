// src/pages/manpower/overViewPage.jsx
import { useEffect, useState, useRef } from "react";
import SummaryCard from "./components/statCards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { manpowerService } from "../../services/manpowerService";
import { employeeService } from "@/services/employeeService";

// ─── count-up hook ────────────────────────────────────────────────────────────
function useCountUp(target, duration = 1200) {
  const [display, setDisplay] = useState(0);
  const raf = useRef(null);

  useEffect(() => {
    if (!target) return;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(target * eased));
      if (progress < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);

  return display;
}

function AnimatedSummaryCard({ title, value }) {
  const animated = useCountUp(value);
  return <SummaryCard title={title} value={animated} />;
}

// ─── gender card ──────────────────────────────────────────────────────────────
function GenderCard({ male, female }) {
  const animMale = useCountUp(male);
  const animFemale = useCountUp(female);
  const total = male + female;
  const malePct = total > 0 ? (male / total) * 100 : 50;
  const femalePct = total > 0 ? (female / total) * 100 : 50;

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm flex flex-col justify-between gap-3">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        Male to Female Staff
      </p>

      <div className="flex gap-2">
        {/* Male */}
        <div className="flex-1 rounded-lg dark:bg-blue-950/40 px-3 py-2.5 text-center">
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 tabular-nums">
            {animMale}
          </p>
          <div className="flex items-center justify-center gap-1 mt-1">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            <p className="text-xs text-muted-foreground">Male</p>
          </div>
          {total > 0 && (
            <p className="text-[10px] text-blue-500 dark:text-blue-400 mt-0.5 font-medium">
              {malePct.toFixed(1)}%
            </p>
          )}
        </div>

        {/* Female */}
        <div className="flex-1 rounded-lg dark:bg-pink-950/40 px-3 py-2.5 text-center">
          <p className="text-2xl font-bold text-pink-500 dark:text-pink-400 tabular-nums">
            {animFemale}
          </p>
          <div className="flex items-center justify-center gap-1 mt-1">
            <span className="h-2 w-2 rounded-full bg-pink-500" />
            <p className="text-xs text-muted-foreground">Female</p>
          </div>
          {total > 0 && (
            <p className="text-[10px] text-pink-500 dark:text-pink-400 mt-0.5 font-medium">
              {femalePct.toFixed(1)}%
            </p>
          )}
        </div>
      </div>

      {/* Split bar */}
      {total > 0 && (
        <div className="w-full h-1.5 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 flex">
          <div
            className="bg-blue-500 h-full rounded-l-full transition-all duration-700"
            style={{ width: `${malePct}%` }}
          />
          <div
            className="bg-pink-400 h-full rounded-r-full transition-all duration-700"
            style={{ width: `${femalePct}%` }}
          />
        </div>
      )}
    </div>
  );
}

// ─── main ─────────────────────────────────────────────────────────────────────
export default function OverviewTab() {
  const [counts, setCounts] = useState({
    plantilla: 0,
    cos: 0,
    consultant: 0,
  });
  const [gender, setGender] = useState({ male: 0, female: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch manpower counts in parallel
        const [plantilla, cos, consultant] = await Promise.all([
          manpowerService.getPlantillaCount(),
          manpowerService.getCosCount(),
          manpowerService.getConsultantCount(),
        ]);

        setCounts({
          plantilla: plantilla ?? 0,
          cos: cos ?? 0,
          consultant: consultant ?? 0,
        });

        // Fetch gender count
        employeeService
          .getGenderCount()
          .then((genderData) => {
            setGender({
              male: genderData?.male ?? 0,
              female: genderData?.female ?? 0,
            });
          })
          .catch((err) => console.error("Gender count error:", err));
      } catch (err) {
        console.error("Failed to fetch manpower counts:", err);
        setError(err?.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const manpowerData = [
    { name: "Plantilla", value: counts.plantilla, color: "var(--chart-1)" },
    { name: "COS", value: counts.cos, color: "var(--chart-2)" },
    { name: "Consultant", value: counts.consultant, color: "var(--chart-3)" },
  ];

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p className="font-semibold">Error loading overview data</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 ">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Manpower Mapping Overview
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Government manpower application and approval statistics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
        <AnimatedSummaryCard
          title="Total number of plantilla employees"
          value={counts.plantilla}
        />
        <AnimatedSummaryCard
          title="Total number of COS employees"
          value={counts.cos}
        />
        <AnimatedSummaryCard
          title="Total number of consultant employees"
          value={counts.consultant}
        />
        <GenderCard male={gender.male} female={gender.female} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Workforce Distribution by Employment Type
          </CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-400">Loading chart...</div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={manpowerData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {manpowerData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

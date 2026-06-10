import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { CheckCircle } from "lucide-react";
import { SectionCard } from "./SharedComponents";
import { EMPLOYEE_PROFILES } from "../data";

export default function EmployeeTab() {
  const emp = EMPLOYEE_PROFILES[0];
  return (
    <div className="space-y-6">
      {/* Profile header — matches the sticky header's white/slate-800 card style */}
      <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-lg font-bold border border-blue-100 dark:border-blue-800/60">
          {emp.name
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-slate-800 dark:text-white">
            {emp.name}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {emp.role} · {emp.dept}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {emp.completion}%
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Overall Completion
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard
          title="Skill Progress"
          subtitle="Current proficiency per skill area"
        >
          <div className="space-y-4">
            {emp.skills.map((s) => (
              <div key={s.skill}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    {s.skill}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 tabular-nums">
                    {s.score}%
                  </span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${s.score}%`,
                      background: `hsl(${220 + s.score / 2}, 70%, 55%)`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Competency Radar"
          subtitle="Holistic skill dimension view"
        >
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={emp.radar}>
              <PolarGrid stroke="#e2e8f0" strokeOpacity={0.5} />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fontSize: 12, fill: "#94a3b8" }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tick={false}
                axisLine={false}
              />
              <Radar
                name={emp.name}
                dataKey="A"
                stroke="#2563eb"
                fill="#2563eb"
                fillOpacity={0.2}
                strokeWidth={2}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.08)",
                  fontSize: 12,
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      <SectionCard
        title="Training Timeline"
        subtitle="Progress through assigned learning path"
      >
        <div className="relative">
          <div className="absolute left-[17px] top-0 bottom-0 w-0.5 bg-slate-100 dark:bg-slate-700" />
          <div className="space-y-3">
            {emp.timeline.map((t, i) => (
              <div key={i} className="flex items-start gap-4 pl-10 relative">
                <div
                  className={`absolute left-3 top-3 -translate-x-1/2 w-3 h-3 rounded-full border-2 transition-colors ${
                    t.done
                      ? "bg-blue-600 border-blue-600 dark:bg-blue-500 dark:border-blue-500"
                      : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                  }`}
                />
                <div
                  className={`flex-1 rounded-xl p-3 ${
                    t.done
                      ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50"
                      : "bg-slate-50 dark:bg-slate-700/30 border border-slate-100 dark:border-slate-700/50"
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <p
                      className={`text-sm font-semibold leading-snug ${
                        t.done
                          ? "text-blue-700 dark:text-blue-300"
                          : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      {t.event}
                    </p>
                    <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0">
                      {t.date}
                    </span>
                  </div>
                  {t.done && (
                    <p className="text-xs text-blue-500 dark:text-blue-400 mt-1 flex items-center gap-1">
                      <CheckCircle size={11} /> Completed
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

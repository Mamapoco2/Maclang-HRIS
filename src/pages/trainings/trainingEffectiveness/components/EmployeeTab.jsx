// ============================================================
// Employee Performance Tab
// ============================================================

import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, ResponsiveContainer } from "recharts";
import { CheckCircle } from "lucide-react";
import { SectionCard } from "./SharedComponents";
import { EMPLOYEE_PROFILES } from "../data";

export default function EmployeeTab() {
  const emp = EMPLOYEE_PROFILES[0];
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-700 dark:text-indigo-300 text-lg font-bold">
          {emp.name.split(" ").map((n) => n[0]).join("")}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">{emp.name}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">{emp.role} · {emp.dept}</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{emp.completion}%</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Overall Completion</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Skill Progress Bars" subtitle="Current proficiency per skill area">
          <div className="space-y-3">
            {emp.skills.map((s) => (
              <div key={s.skill}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{s.skill}</span>
                  <span className="text-slate-500 dark:text-slate-400">{s.score}%</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-indigo-500" style={{ width: `${s.score}%`, background: `hsl(${220 + s.score / 2}, 70%, 55%)` }} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Competency Radar" subtitle="Holistic skill dimension view">
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={emp.radar}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: "#94a3b8" }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar name={emp.name} dataKey="A" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.25} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none" }} />
            </RadarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      <SectionCard title="Training Timeline" subtitle="Progress through assigned learning path">
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-100 dark:bg-slate-700" />
          <div className="space-y-4">
            {emp.timeline.map((t, i) => (
              <div key={i} className="flex items-start gap-4 pl-10 relative">
                <div className={`absolute left-2.5 -translate-x-1/2 w-3 h-3 rounded-full border-2 ${t.done ? "bg-indigo-600 border-indigo-600" : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"}`} />
                <div className={`flex-1 rounded-xl p-3 ${t.done ? "bg-indigo-50 dark:bg-indigo-900/20" : "bg-slate-50 dark:bg-slate-700/30"}`}>
                  <div className="flex justify-between">
                    <p className={`text-sm font-semibold ${t.done ? "text-indigo-700 dark:text-indigo-300" : "text-slate-500 dark:text-slate-400"}`}>{t.event}</p>
                    <span className="text-xs text-slate-400 dark:text-slate-500">{t.date}</span>
                  </div>
                  {t.done && (
                    <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-0.5 flex items-center gap-1">
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

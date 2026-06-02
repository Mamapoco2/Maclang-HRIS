// ============================================================
// AI Insights Tab
// ============================================================

import { Brain, AlertTriangle, Award, Target, Lightbulb } from "lucide-react";
import { AI_INSIGHTS } from "../data";

const ICON_MAP = { AlertTriangle, Award, Target, Lightbulb };

const COLOR_MAP = {
  rose: { bg: "bg-rose-50 dark:bg-rose-900/20", icon: "text-rose-500", border: "border-rose-200 dark:border-rose-800", btn: "bg-rose-600 hover:bg-rose-700" },
  emerald: { bg: "bg-emerald-50 dark:bg-emerald-900/20", icon: "text-emerald-500", border: "border-emerald-200 dark:border-emerald-800", btn: "bg-emerald-600 hover:bg-emerald-700" },
  amber: { bg: "bg-amber-50 dark:bg-amber-900/20", icon: "text-amber-500", border: "border-amber-200 dark:border-amber-800", btn: "bg-amber-600 hover:bg-amber-700" },
  sky: { bg: "bg-sky-50 dark:bg-sky-900/20", icon: "text-sky-500", border: "border-sky-200 dark:border-sky-800", btn: "bg-sky-600 hover:bg-sky-700" },
};

export default function AIInsightsTab() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-2xl p-4">
        <Brain size={24} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
        <div>
          <p className="font-semibold text-indigo-800 dark:text-indigo-200">AI Analysis Engine</p>
          <p className="text-sm text-indigo-600 dark:text-indigo-400">Powered by pattern recognition across training data, skill assessments, and performance metrics.</p>
        </div>
        <span className="ml-auto shrink-0 px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-full flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Live
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {AI_INSIGHTS.map((ins) => {
          const c = COLOR_MAP[ins.color];
          const Icon = ICON_MAP[ins.iconName];
          return (
            <div key={ins.id} className={`rounded-2xl border ${c.border} ${c.bg} p-5 space-y-3`}>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                  <Icon size={18} className={c.icon} />
                </div>
                <p className="font-semibold text-slate-800 dark:text-white text-sm">{ins.title}</p>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{ins.detail}</p>
              <button className={`text-xs text-white font-semibold px-3 py-1.5 rounded-lg ${c.btn} transition-colors`}>{ins.action}</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

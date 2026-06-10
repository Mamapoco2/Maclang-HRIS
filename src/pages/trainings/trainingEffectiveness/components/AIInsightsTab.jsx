import { Brain, AlertTriangle, Award, Target, Lightbulb } from "lucide-react";
import { AI_INSIGHTS } from "../data";

const ICON_MAP = { AlertTriangle, Award, Target, Lightbulb };

const COLOR_MAP = {
  rose: {
    bg: "bg-rose-50 dark:bg-rose-900/20",
    icon: "text-rose-500",
    border: "border-rose-100 dark:border-rose-800/60",
    iconBg:
      "bg-white dark:bg-slate-800 border border-rose-100 dark:border-rose-800/50",
    btn: "bg-rose-600 hover:bg-rose-700 dark:bg-rose-700 dark:hover:bg-rose-600",
  },
  emerald: {
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    icon: "text-emerald-500",
    border: "border-emerald-100 dark:border-emerald-800/60",
    iconBg:
      "bg-white dark:bg-slate-800 border border-emerald-100 dark:border-emerald-800/50",
    btn: "bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600",
  },
  amber: {
    bg: "bg-amber-50 dark:bg-amber-900/20",
    icon: "text-amber-500",
    border: "border-amber-100 dark:border-amber-800/60",
    iconBg:
      "bg-white dark:bg-slate-800 border border-amber-100 dark:border-amber-800/50",
    btn: "bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600",
  },
  sky: {
    bg: "bg-sky-50 dark:bg-sky-900/20",
    icon: "text-sky-500",
    border: "border-sky-100 dark:border-sky-800/60",
    iconBg:
      "bg-white dark:bg-slate-800 border border-sky-100 dark:border-sky-800/50",
    btn: "bg-sky-600 hover:bg-sky-700 dark:bg-sky-700 dark:hover:bg-sky-600",
  },
};

export default function AIInsightsTab() {
  return (
    <div className="space-y-4">
      {/* Engine banner — same card language as header */}
      <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-blue-100 dark:border-blue-800/60 shadow-sm p-4 flex items-center gap-3">
        <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 rounded-xl border border-blue-100 dark:border-blue-800/50 shrink-0">
          <Brain size={20} className="text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-800 dark:text-white text-sm">
            AI Analysis Engine
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Powered by pattern recognition across training data, skill
            assessments, and performance metrics.
          </p>
        </div>
        <span className="ml-auto shrink-0 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold rounded-full flex items-center gap-1.5 border border-emerald-100 dark:border-emerald-800/50">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          Live
        </span>
      </div>

      {/* Insight cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {AI_INSIGHTS.map((ins) => {
          const c = COLOR_MAP[ins.color] ?? COLOR_MAP.sky;
          const Icon = ICON_MAP[ins.iconName];
          return (
            <div
              key={ins.id}
              className={`bg-white dark:bg-slate-800/80 rounded-2xl border ${c.border} shadow-sm p-5 space-y-3 hover:shadow-md transition-shadow`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-xl shadow-sm shrink-0 ${c.iconBg}`}
                >
                  <Icon size={18} className={c.icon} />
                </div>
                <p className="font-semibold text-slate-800 dark:text-white text-sm leading-snug pt-0.5">
                  {ins.title}
                </p>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {ins.detail}
              </p>
              <button
                className={`text-xs text-white font-semibold px-3 py-1.5 rounded-lg ${c.btn} transition-colors`}
              >
                {ins.action}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

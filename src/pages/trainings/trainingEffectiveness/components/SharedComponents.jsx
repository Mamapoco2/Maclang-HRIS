import {
  Sun,
  Moon,
  ArrowUpRight,
  ArrowDownRight,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

export function ThemeToggle({ dark, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
      aria-label="Toggle theme"
    >
      {dark ? (
        <Sun size={18} className="text-amber-400" />
      ) : (
        <Moon size={18} className="text-slate-500" />
      )}
    </button>
  );
}

export function KPICard({ label, value, change, icon: Icon, color }) {
  const colorMap = {
    indigo: {
      bg: "bg-blue-50 dark:bg-blue-900/20",
      icon: "text-blue-600 dark:text-blue-400",
      border: "border-blue-100 dark:border-blue-800/60",
    },
    emerald: {
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      icon: "text-emerald-600 dark:text-emerald-400",
      border: "border-emerald-100 dark:border-emerald-800/60",
    },
    amber: {
      bg: "bg-amber-50 dark:bg-amber-900/20",
      icon: "text-amber-600 dark:text-amber-400",
      border: "border-amber-100 dark:border-amber-800/60",
    },
    sky: {
      bg: "bg-sky-50 dark:bg-sky-900/20",
      icon: "text-sky-600 dark:text-sky-400",
      border: "border-sky-100 dark:border-sky-800/60",
    },
    violet: {
      bg: "bg-violet-50 dark:bg-violet-900/20",
      icon: "text-violet-600 dark:text-violet-400",
      border: "border-violet-100 dark:border-violet-800/60",
    },
  };
  const c = colorMap[color] ?? colorMap.indigo;
  const positive = change > 0;
  return (
    <div
      className={`bg-white dark:bg-slate-800/80 rounded-2xl border ${c.border} p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow`}
    >
      <div className="flex items-center justify-between">
        <div className={`${c.bg} p-2.5 rounded-xl`}>
          <Icon size={20} className={c.icon} />
        </div>
        <span
          className={`text-xs font-medium flex items-center gap-0.5 ${positive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400"}`}
        >
          {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {positive ? "+" : ""}
          {change}
        </span>
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800 dark:text-white">
          {value}
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          {label}
        </p>
      </div>
    </div>
  );
}

export function SectionCard({ title, subtitle, children, className = "" }) {
  return (
    <div
      className={`bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 ${className}`}
    >
      {(title || subtitle) && (
        <div className="mb-5">
          {title && (
            <h3 className="text-base font-semibold text-slate-800 dark:text-white">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

export function TabBar({ tabs, active, onChange }) {
  return (
    <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1 rounded-2xl w-fit">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            active === tab.id
              ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
        >
          {tab.icon && <tab.icon size={15} />}
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export function SortIcon({ sortKey, k, sortDir }) {
  return (
    <span className="inline-flex flex-col ml-1 opacity-60">
      <ChevronUp
        size={10}
        className={
          sortKey === k && sortDir === "asc"
            ? "text-blue-500 opacity-100"
            : "text-slate-400"
        }
      />
      <ChevronDown
        size={10}
        className={
          sortKey === k && sortDir === "desc"
            ? "text-blue-500 opacity-100"
            : "text-slate-400"
        }
      />
    </span>
  );
}

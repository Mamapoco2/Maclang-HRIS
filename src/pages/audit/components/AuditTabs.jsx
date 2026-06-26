import { TABS } from "../../../utils/constants";

export const AuditTabs = ({ tab, onChange, total }) => (
  <div className="flex items-center border-b border-slate-200 dark:border-slate-800 px-4">
    {TABS.map((t) => (
      <button
        key={t}
        onClick={() => onChange(t)}
        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${tab === t ? "border-violet-600 text-violet-600 dark:text-violet-400" : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"}`}
      >
        {t}
        {t === "Logs" && (
          <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
            {total}
          </span>
        )}
      </button>
    ))}
  </div>
);

import { RefreshCw, Download } from "lucide-react";

export const AuditHeader = ({ dark, onToggleDark, onRefresh, loading, onExport }) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
        Audit Logs
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
        Monitor and review all system activities, user actions, and
        security events.
      </p>
    </div>
    <div className="flex items-center gap-2 flex-wrap">
      <button
        onClick={onToggleDark}
        className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
      >
        {dark ? "☀ Light" : "☾ Dark"}
      </button>
      <button
        onClick={onRefresh}
        className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />{" "}
        Refresh
      </button>
      <button
        onClick={onExport}
        className="flex items-center gap-1.5 px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-medium transition-colors"
      >
        <Download className="w-3.5 h-3.5" /> Export Logs
      </button>
    </div>
  </div>
);

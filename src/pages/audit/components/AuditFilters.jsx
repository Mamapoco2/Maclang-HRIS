import { memo } from "react";
import { Search, Filter, X } from "lucide-react";
import { SelectFilter } from "./SelectFilter";

export const AuditFilters = memo(
  ({
    filters,
    onChange,
    onApply,
    onReset,
    loading,
    moduleOptions,
    userOptions,
  }) => (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <div className="relative sm:col-span-2 xl:col-span-2">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by username, action, IP…"
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && onApply()}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-colors"
          />
        </div>
        <SelectFilter
          label="Module"
          options={moduleOptions}
          value={filters.module}
          onChange={(v) => onChange({ ...filters, module: v })}
        />
        <SelectFilter
          label="User"
          options={userOptions}
          value={filters.username}
          onChange={(v) => onChange({ ...filters, username: v })}
        />
        <SelectFilter
          label="Status"
          options={["success", "failed", "warning", "pending"]}
          value={filters.status}
          onChange={(v) => onChange({ ...filters, status: v })}
        />
        <SelectFilter
          label="Severity"
          options={["low", "medium", "high", "critical"]}
          value={filters.severity}
          onChange={(v) => onChange({ ...filters, severity: v })}
        />
      </div>
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={onApply}
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          <Filter className="w-3.5 h-3.5" /> Apply Filters
        </button>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors"
        >
          <X className="w-3.5 h-3.5" /> Reset
        </button>
      </div>
    </div>
  ),
);

AuditFilters.displayName = "AuditFilters";

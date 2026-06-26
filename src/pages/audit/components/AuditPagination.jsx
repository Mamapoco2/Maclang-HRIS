import { useMemo, memo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const AuditPagination = memo(
  ({ total, page, perPage, onPage, onPerPage }) => {
    const totalPages = Math.ceil(total / perPage);
    const start = (page - 1) * perPage + 1;
    const end = Math.min(page * perPage, total);
    const pages = useMemo(() => {
      if (totalPages <= 7)
        return Array.from({ length: totalPages }, (_, i) => i + 1);
      if (page <= 4) return [1, 2, 3, 4, 5, "...", totalPages];
      if (page >= totalPages - 3)
        return [
          1,
          "...",
          totalPages - 4,
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages,
        ];
      return [1, "...", page - 1, page, page + 1, "...", totalPages];
    }, [page, totalPages]);

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>
            Showing {start.toLocaleString()}–{end.toLocaleString()} of{" "}
            {total.toLocaleString()} logs
          </span>
          <select
            value={perPage}
            onChange={(e) => {
              onPerPage(Number(e.target.value));
              onPage(1);
            }}
            className="ml-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-violet-500"
          >
            {[10, 25, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n} rows
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPage(page - 1)}
            disabled={page === 1}
            className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          </button>
          {pages.map((p, i) =>
            p === "..." ? (
              <span key={`e-${i}`} className="px-2 text-slate-400 text-xs">
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onPage(p)}
                className={`w-7 h-7 rounded-md text-xs font-medium transition-colors ${page === p ? "bg-violet-600 text-white" : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"}`}
              >
                {p}
              </button>
            ),
          )}
          <button
            onClick={() => onPage(page + 1)}
            disabled={page === totalPages}
            className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Next"
          >
            <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          </button>
        </div>
      </div>
    );
  },
);

AuditPagination.displayName = "AuditPagination";

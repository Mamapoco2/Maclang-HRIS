import { memo } from "react";
import { SearchX } from "lucide-react";
import { Skeleton } from "./Badges";
import { AuditTableRow } from "./AuditTableRow";
import { COLS } from "@/utils/constants";

export const AuditTable = memo(({ logs, onView, loading }) => {
  if (loading)
    return (
      <div className="space-y-2 p-4">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );

  if (!logs.length)
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
          <SearchX className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-1">
          No audit logs found
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Try adjusting your filters or search criteria.
        </p>
      </div>
    );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[960px]">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
            {COLS.map((c) => (
              <th
                key={c}
                className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <AuditTableRow key={log.id} log={log} onView={onView} />
          ))}
        </tbody>
      </table>
    </div>
  );
});

AuditTable.displayName = "AuditTable";

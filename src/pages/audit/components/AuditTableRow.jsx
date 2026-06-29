import { useState, useCallback, memo } from "react";
import { Globe, Eye, Copy, CheckCircle2 } from "lucide-react";
import { Avatar, StatusBadge, SeverityBadge } from "./Badges";
import { fmt, fmtRel } from "@/utils/formatters";

export const AuditTableRow = memo(({ log, onView }) => {
  const [copied, setCopied] = useState(false);
  const copyId = useCallback(
    (e) => {
      e.stopPropagation();
      navigator.clipboard.writeText(String(log.id)).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    },
    [log.id],
  );

  return (
    <tr
      className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
      onClick={() => onView(log)}
    >
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="text-xs font-medium text-slate-700 dark:text-slate-300">
          {fmt(log.timestamp)}
        </div>
        <div className="text-xs text-slate-400 mt-0.5">
          {fmtRel(log.timestamp)}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Avatar name={log.username} />
          <div className="min-w-0">
            <div className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate max-w-[110px]">
              {log.username}
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded tracking-wide whitespace-nowrap">
          {log.action}
        </span>
      </td>
      <td className="px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400">
        {log.module}
      </td>
      <td className="px-4 py-3">
        <div className="text-xs text-slate-600 dark:text-slate-400 truncate max-w-[120px]">
          {log.subjectLabel ?? log.subjectType?.split("\\").pop() ?? "—"}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-mono">
          <Globe className="w-3 h-3 shrink-0" />
          {log.ipAddress}
        </div>
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={log.status} />
      </td>
      <td className="px-4 py-3">
        <SeverityBadge severity={log.severity} />
      </td>
      <td className="px-4 py-3">
        <div
          className="flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => onView(log)}
            className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            aria-label="View details"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={copyId}
            className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            aria-label="Copy ID"
          >
            {copied ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </td>
    </tr>
  );
});

AuditTableRow.displayName = "AuditTableRow";

import { memo } from "react";
import { Activity } from "lucide-react";
import { StatusBadge } from "./Badges";
import { MODULE_ICONS, MODULE_COLORS } from "@/utils/constants";
import { fmtRel } from "@/utils/formatters";

export const AuditTimeline = memo(({ logs }) => (
  <div className="space-y-0">
    {logs.slice(0, 20).map((log, i) => {
      const Icon = MODULE_ICONS[log.module] || Activity;
      const color = MODULE_COLORS[log.module] || "bg-slate-500";
      return (
        <div key={log.id} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full ${color} flex items-center justify-center shrink-0 mt-1`}
            >
              <Icon className="w-4 h-4 text-white" />
            </div>
            {i < 19 && (
              <div className="w-0.5 flex-1 bg-slate-200 dark:bg-slate-700 my-1" />
            )}
          </div>
          <div className="pb-5 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {log.username}
              </span>
              <span className="text-xs font-mono text-slate-500">
                {log.action}
              </span>
              <StatusBadge status={log.status} />
              <span className="text-xs text-slate-400 ml-auto whitespace-nowrap">
                {fmtRel(log.timestamp)}
              </span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {log.subjectType?.split("\\").pop() ?? "—"} · {log.ipAddress}
            </div>
          </div>
        </div>
      );
    })}
  </div>
));

AuditTimeline.displayName = "AuditTimeline";

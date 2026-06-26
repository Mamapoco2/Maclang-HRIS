import { useMemo, memo } from "react";
import {
  FileText,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Skeleton } from "./Badges";

export const AuditStats = memo(({ logs, loading }) => {
  const stats = useMemo(() => {
    const total = logs.length;
    const success = logs.filter((l) => l.status === "success").length;
    const failed = logs.filter((l) => l.status === "failed").length;
    const alerts = logs.filter(
      (l) => l.severity === "high" || l.severity === "critical",
    ).length;
    return [
      {
        label: "Total Events",
        value: total,
        icon: FileText,
        trend: "+12.4%",
        up: true,
        color: "text-violet-600 dark:text-violet-400",
        bg: "bg-violet-500/10",
      },
      {
        label: "Successful Actions",
        value: success,
        icon: CheckCircle2,
        trend: "+8.1%",
        up: true,
        color: "text-emerald-600 dark:text-emerald-400",
        bg: "bg-emerald-500/10",
      },
      {
        label: "Failed Actions",
        value: failed,
        icon: XCircle,
        trend: "-3.2%",
        up: false,
        color: "text-red-600 dark:text-red-400",
        bg: "bg-red-500/10",
      },
      {
        label: "Security Alerts",
        value: alerts,
        icon: ShieldAlert,
        trend: "+5.7%",
        up: true,
        color: "text-amber-600 dark:text-amber-400",
        bg: "bg-amber-500/10",
      },
    ];
  }, [logs]);

  if (loading)
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5"
          >
            <Skeleton className="h-4 w-24 mb-3" />
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>
    );

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => {
        const Icon = s.icon,
          TrendIcon = s.up ? TrendingUp : TrendingDown;
        return (
          <div
            key={s.label}
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 rounded-lg ${s.bg}`}>
                <Icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <span
                className={`flex items-center gap-1 text-xs font-medium ${s.up ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}
              >
                <TrendIcon className="w-3 h-3" />
                {s.trend}
              </span>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-0.5">
              {s.value.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {s.label}
            </div>
          </div>
        );
      })}
    </div>
  );
});

AuditStats.displayName = "AuditStats";

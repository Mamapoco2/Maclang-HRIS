import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export function StatCard({ title, value, subtitle, icon: Icon, trend, trendValue, color = "indigo", className, loading }) {
  const colorMap = {
    indigo: { bg: "bg-indigo-50 dark:bg-indigo-950/30", icon: "text-indigo-600 dark:text-indigo-400", border: "border-indigo-100 dark:border-indigo-900/50" },
    emerald: { bg: "bg-emerald-50 dark:bg-emerald-950/30", icon: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-100 dark:border-emerald-900/50" },
    amber: { bg: "bg-amber-50 dark:bg-amber-950/30", icon: "text-amber-600 dark:text-amber-400", border: "border-amber-100 dark:border-amber-900/50" },
    red: { bg: "bg-red-50 dark:bg-red-950/30", icon: "text-red-600 dark:text-red-400", border: "border-red-100 dark:border-red-900/50" },
    violet: { bg: "bg-violet-50 dark:bg-violet-950/30", icon: "text-violet-600 dark:text-violet-400", border: "border-violet-100 dark:border-violet-900/50" },
  };
  const c = colorMap[color] || colorMap.indigo;

  if (loading) {
    return (
      <div className={cn("bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 animate-pulse", className)}>
        <div className="flex items-start justify-between mb-4">
          <div className="h-4 bg-[var(--muted)] rounded w-24" />
          <div className="w-10 h-10 bg-[var(--muted)] rounded-lg" />
        </div>
        <div className="h-8 bg-[var(--muted)] rounded w-16 mb-2" />
        <div className="h-3 bg-[var(--muted)] rounded w-32" />
      </div>
    );
  }

  return (
    <div className={cn(
      "bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 hover:shadow-md transition-all duration-200 animate-fade-in",
      className
    )}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm font-medium text-[var(--muted-foreground)]">{title}</p>
        {Icon && (
          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center border", c.bg, c.border)}>
            <Icon className={cn("w-5 h-5", c.icon)} />
          </div>
        )}
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold text-[var(--foreground)] tracking-tight">{value}</p>
          {subtitle && <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{subtitle}</p>}
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
            trend === "up" ? "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400" :
            trend === "down" ? "text-red-700 bg-red-50 dark:bg-red-950/40 dark:text-red-400" :
            "text-gray-600 bg-gray-50 dark:bg-gray-900/40 dark:text-gray-400"
          )}>
            {trend === "up" ? <TrendingUp className="w-3 h-3" /> :
             trend === "down" ? <TrendingDown className="w-3 h-3" /> :
             <Minus className="w-3 h-3" />}
            {trendValue}
          </div>
        )}
      </div>
    </div>
  );
}

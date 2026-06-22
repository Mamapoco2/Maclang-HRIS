import { Info, AlertTriangle, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

const VARIANTS = {
  info: {
    icon: Info,
    container:
      "bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-100",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  warning: {
    icon: AlertTriangle,
    container:
      "bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-100",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  confidential: {
    icon: ShieldAlert,
    container:
      "bg-red-50 border-red-300 text-red-900 dark:bg-red-950/40 dark:border-red-800 dark:text-red-100",
    iconColor: "text-red-600 dark:text-red-400",
  },
};

export function InformationAlertCard({
  title,
  message,
  variant = "info",
  badge,
  className,
}) {
  const config = VARIANTS[variant] || VARIANTS.info;
  const Icon = config.icon;

  return (
    <div
      role="note"
      className={cn(
        "flex gap-3 p-4 rounded-xl border",
        config.container,
        className,
      )}
    >
      <Icon className={cn("w-5 h-5 flex-shrink-0 mt-0.5", config.iconColor)} />
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold">{title}</p>
          {badge && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-red-600 text-white dark:bg-red-700">
              {badge}
            </span>
          )}
        </div>
        <p className="text-xs leading-relaxed opacity-90">{message}</p>
      </div>
    </div>
  );
}

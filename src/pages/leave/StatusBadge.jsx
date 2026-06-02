import { cn } from "@/lib/utils";
import { STATUS_CONFIG } from "./mockData";

export function StatusBadge({ status, size = "md" }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium rounded-full border",
        config.color,
        config.bg,
        config.border,
        size === "sm" ? "text-xs px-2 py-0.5" : "text-xs px-2.5 py-1",
      )}
    >
      <span
        className={cn(
          "rounded-full flex-shrink-0",
          config.dot,
          size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2",
        )}
      />
      {config.label}
    </span>
  );
}

export function LeaveTypeBadge({ type }) {
  const colors = {
    vacation: "text-indigo-700 bg-indigo-50 border-indigo-200",
    sick: "text-amber-700 bg-amber-50 border-amber-200",
    emergency: "text-red-700 bg-red-50 border-red-200",
    maternity: "text-pink-700 bg-pink-50 border-pink-200",
    paternity: "text-violet-700 bg-violet-50 border-violet-200",
    unpaid: "text-gray-700 bg-gray-50 border-gray-200",
  };
  const labels = {
    vacation: "Vacation",
    sick: "Sick",
    emergency: "Emergency",
    maternity: "Maternity",
    paternity: "Paternity",
    unpaid: "Unpaid",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border",
        colors[type] || colors.vacation,
      )}
    >
      {labels[type] || type}
    </span>
  );
}

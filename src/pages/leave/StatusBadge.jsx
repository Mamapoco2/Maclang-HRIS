import { cn } from "@/lib/utils";
import { STATUS_CONFIG } from "./mockData";
import { LEAVE_TYPE_MAP } from "./leavePolicy";

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
  const typeConfig = LEAVE_TYPE_MAP[type];
  if (typeConfig) {
    return (
      <span
        className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border"
        style={{
          color: typeConfig.color,
          backgroundColor: typeConfig.bg,
          borderColor: `${typeConfig.color}33`,
        }}
      >
        {typeConfig.label}
      </span>
    );
  }

  const fallback = {
    emergency: { label: "Emergency", color: "#ef4444", bg: "#fef2f2" },
    unpaid: { label: "Unpaid", color: "#6b7280", bg: "#f9fafb" },
  };
  const fb = fallback[type] || { label: type, color: "#6366f1", bg: "#eef2ff" };

  return (
    <span
      className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border"
      style={{ color: fb.color, backgroundColor: fb.bg, borderColor: `${fb.color}33` }}
    >
      {fb.label}
    </span>
  );
}

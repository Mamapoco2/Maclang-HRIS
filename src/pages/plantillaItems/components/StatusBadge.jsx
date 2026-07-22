import { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { STATUS_STYLES } from "../helpers/constants";

function StatusBadgeImpl({ status }) {
  const key = status?.toUpperCase();
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-xs font-semibold capitalize px-2 py-0.5",
        STATUS_STYLES[key] ?? "bg-slate-50 text-slate-500 border-slate-200",
      )}
    >
      {status?.toLowerCase() ?? "—"}
    </Badge>
  );
}

export const StatusBadge = memo(StatusBadgeImpl);

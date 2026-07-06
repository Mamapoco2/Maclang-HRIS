import { Badge } from "@/components/ui/badge";
import { PRIORITY_CONFIG } from "../constants";

const VARIANT_CLASSES = {
  normal: "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-100",
  important: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50",
  urgent: "bg-red-50 text-red-700 border-red-200 hover:bg-red-50",
};

export function PriorityBadge({ priority }) {
  const cfg = PRIORITY_CONFIG[priority];
  const Icon = cfg.icon;
  return (
    <Badge
      variant="outline"
      className={`gap-1 font-medium ${VARIANT_CLASSES[priority]}`}
    >
      <Icon size={11} />
      {cfg.label}
    </Badge>
  );
}

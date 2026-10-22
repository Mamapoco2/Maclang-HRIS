import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_STYLES = {
  Active: {
    badge:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
  Inactive: {
    badge: "border-border bg-muted text-muted-foreground",
    dot: "bg-muted-foreground/50",
  },
  Resign: {
    badge:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/60 dark:text-red-300",
    dot: "bg-red-500",
  },
};

// `status` is one of "Active" | "Inactive" | "Resign" (any casing).
export function StatusBadge({ status, className }) {
  const key = String(status ?? "").toLowerCase();
  const name =
    key === "active" ? "Active" : key === "resign" ? "Resign" : "Inactive";
  const style = STATUS_STYLES[name];

  return (
    <Badge
      variant="outline"
      className={cn("gap-1.5 rounded-full font-medium", style.badge, className)}
    >
      <span className={cn("size-1.5 rounded-full", style.dot)} />
      {name}
    </Badge>
  );
}

import { cn } from "./utils";
import { ChevronRight } from "lucide-react";

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  className,
}) {
  return (
    <div className={cn("mb-6", className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1 text-xs text-[var(--muted-foreground)] mb-2">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="w-3 h-3" />}
              <span
                className={
                  i === breadcrumbs.length - 1
                    ? "text-[var(--foreground)] font-medium"
                    : "hover:text-[var(--foreground)] cursor-pointer transition-colors"
                }
              >
                {crumb}
              </span>
            </span>
          ))}
        </nav>
      )}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-[var(--muted-foreground)] mt-1">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>
        )}
      </div>
    </div>
  );
}

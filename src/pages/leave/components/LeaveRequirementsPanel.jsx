import { CheckCircle2, Circle, AlertCircle, FileText } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/Card";
import { LEAVE_REQUIREMENTS, LEAVE_TYPE_MAP } from "../leavePolicy";
import { cn } from "@/lib/utils";

export function LeaveRequirementsPanel({ leaveType, uploadedFiles = {} }) {
  const requirements = LEAVE_REQUIREMENTS[leaveType] || [];
  const typeConfig = LEAVE_TYPE_MAP[leaveType];

  if (!leaveType) {
    return (
      <Card className="sticky top-5">
        <CardHeader>
          <CardTitle className="text-base">Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--muted-foreground)]">
            Select a leave type to view required documents and filing guidelines.
          </p>
        </CardContent>
      </Card>
    );
  }

  const fulfilledCount = requirements.filter(
    (r) => uploadedFiles[r.id],
  ).length;

  return (
    <Card className="sticky top-5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">Requirements</CardTitle>
          {requirements.length > 0 && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[var(--muted)] text-[var(--muted-foreground)]">
              {fulfilledCount}/{requirements.length}
            </span>
          )}
        </div>
        {typeConfig && (
          <p className="text-xs text-[var(--muted-foreground)] mt-1">
            {typeConfig.label}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {requirements.length === 0 ? (
          <div className="flex items-start gap-2 text-sm text-[var(--muted-foreground)]">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>No additional documents required for this leave type.</span>
          </div>
        ) : (
          <ul className="space-y-2.5" aria-label="Document requirements checklist">
            {requirements.map((req) => {
              const uploaded = uploadedFiles[req.id];
              return (
                <li
                  key={req.id}
                  className={cn(
                    "flex items-start gap-2.5 p-2.5 rounded-lg transition-colors",
                    uploaded
                      ? "bg-emerald-50/80 dark:bg-emerald-950/20"
                      : "bg-[var(--muted)]/40",
                  )}
                >
                  {uploaded ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="w-4 h-4 text-[var(--muted-foreground)] flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-sm",
                        uploaded
                          ? "text-emerald-800 dark:text-emerald-200 font-medium"
                          : "text-[var(--foreground)]",
                      )}
                    >
                      {req.label}
                      {req.required && !uploaded && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </p>
                    {uploaded && (
                      <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5 flex items-center gap-1 truncate">
                        <FileText className="w-3 h-3 flex-shrink-0" />
                        {uploaded.name}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <div className="pt-3 border-t border-[var(--border)]">
          <p className="text-[10px] uppercase tracking-wide font-semibold text-[var(--muted-foreground)] mb-2">
            General Policy
          </p>
          <ul className="space-y-1.5 text-xs text-[var(--muted-foreground)]">
            <li className="flex items-start gap-1.5">
              <span className="w-1 h-1 rounded-full bg-[var(--muted-foreground)] mt-1.5 flex-shrink-0" />
              Applications must be accomplished in at least duplicate.
            </li>
            <li className="flex items-start gap-1.5">
              <span className="w-1 h-1 rounded-full bg-[var(--muted-foreground)] mt-1.5 flex-shrink-0" />
              Clearance required for leave of 30+ calendar days and terminal leave.
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

import { CheckCircle2, XCircle, Clock3, MinusCircle } from "lucide-react";

const STEP_STATUS_CONFIG = {
  approved: {
    label: "Approved",
    icon: CheckCircle2,
    text: "text-emerald-700 dark:text-emerald-400",
    bg: "bg-emerald-100 dark:bg-emerald-950/40",
    ring: "ring-emerald-500",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    text: "text-red-700 dark:text-red-400",
    bg: "bg-red-100 dark:bg-red-950/40",
    ring: "ring-red-500",
  },
  pending: {
    label: "Pending",
    icon: Clock3,
    text: "text-amber-700 dark:text-amber-400",
    bg: "bg-amber-100 dark:bg-amber-950/40",
    ring: "ring-amber-500",
  },
  skipped: {
    label: "Skipped",
    icon: MinusCircle,
    text: "text-[var(--muted-foreground)]",
    bg: "bg-[var(--muted)]",
    ring: "ring-[var(--border)]",
  },
};

function stepConfig(status) {
  return STEP_STATUS_CONFIG[status] ?? STEP_STATUS_CONFIG.pending;
}

function sortSteps(steps) {
  return [...(steps ?? [])].sort((a, b) => a.step_order - b.step_order);
}

function approverLabel(step) {
  if (step.approver?.name) return step.approver.name;
  if (step.status === "pending") return "Pending";
  return "Unassigned";
}

function chipLabel(step) {
  if (step.approver?.name) return step.approver.name;
  return step.label ?? `Step ${step.step_order}`;
}

function formatActedAt(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ApprovalStepsInline({
  steps,
  currentStepOrder,
  className = "",
}) {
  const sorted = sortSteps(steps);

  if (sorted.length === 0) {
    return (
      <span
        className={`text-xs text-[var(--muted-foreground)] italic ${className}`}
      >
        No approval workflow configured
      </span>
    );
  }

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {sorted.map((step) => {
        const config = stepConfig(step.status);
        const Icon = config.icon;
        const isCurrent =
          step.status === "pending" && step.step_order === currentStepOrder;
        const name = approverLabel(step);

        return (
          <div
            key={step.id ?? step.step_order}
            title={`${step.label ?? `Step ${step.step_order}`}: ${config.label} — ${name}`}
            className={`flex items-start gap-1.5 rounded-md px-1.5 py-1 text-[11px] ${config.bg} ${config.text} ${
              isCurrent ? `ring-2 ${config.ring}` : ""
            }`}
          >
            <Icon className="w-3 h-3 flex-shrink-0 mt-0.5" />
            <span className="leading-snug break-words">
              <span className="font-medium">
                {step.label ?? `Step ${step.step_order}`}:
              </span>{" "}
              {name}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function ApprovalStepsTimeline({
  steps,
  currentStepOrder,
  className = "",
}) {
  const sorted = sortSteps(steps);

  if (sorted.length === 0) {
    return (
      <p
        className={`text-sm text-[var(--muted-foreground)] italic ${className}`}
      >
        No approval workflow is configured for this leave request.
      </p>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div className="absolute left-4 top-1 bottom-1 w-0.5 bg-[var(--border)]" />
      <div className="space-y-4">
        {sorted.map((step) => {
          const config = stepConfig(step.status);
          const Icon = config.icon;
          const isCurrent =
            step.status === "pending" && step.step_order === currentStepOrder;
          const actedAt = formatActedAt(step.acted_at);

          return (
            <div
              key={step.id ?? step.step_order}
              className="flex gap-3 relative"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 relative z-10 ${config.bg} ${
                  isCurrent ? `ring-2 ${config.ring}` : ""
                }`}
              >
                <Icon className={`w-4 h-4 ${config.text}`} />
              </div>
              <div className="flex-1 min-w-0 pb-1">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-[var(--foreground)]">
                    {step.label ?? `Step ${step.step_order}`}
                  </p>
                  <span className={`text-xs font-medium ${config.text}`}>
                    {isCurrent ? "Awaiting action" : config.label}
                  </span>
                </div>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                  {approverLabel(step)}
                </p>
                {actedAt && (
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {actedAt}
                  </p>
                )}
                {step.remarks && (
                  <p className="text-xs text-[var(--foreground)] italic mt-1 bg-[var(--muted)] rounded-lg px-2 py-1">
                    “{step.remarks}”
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ApprovalStepsTimeline;

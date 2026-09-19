import { Fragment } from "react";
import { Wallet } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { LEAVE_TYPE_MAP, groupLeaveTypesByCategory } from "../leavePolicy";
import { cn } from "@/lib/utils";

function formatCredit(value, unit) {
  const amount = Number.isFinite(value) ? value : 0;
  const formatted = Number(amount.toFixed(2)).toString();
  const label = unit === "hours" ? "hour" : "day";
  return `${formatted} ${label}${amount === 1 ? "" : "s"}`;
}

function formatEntitlementCap(maxDays) {
  if (maxDays == null) return "Entitlement-based";
  return `Up to ${maxDays} day${maxDays === 1 ? "" : "s"}`;
}

function buildRow(serverType, balances) {
  const localConfig = LEAVE_TYPE_MAP[serverType.code];
  const isCreditBased = Boolean(serverType.requires_balance_check);
  const record = balances.find(
    (b) =>
      b.leave_type?.code === serverType.code ||
      b.leave_type_id === serverType.id,
  );

  return {
    code: serverType.code,
    label: serverType.name ?? localConfig?.label ?? serverType.code,
    unit: record?.leave_type?.unit ?? serverType.unit ?? "days",
    isCreditBased,
    available: record ? Number(record.available) : 0,
    hasRecord: Boolean(record),
    maxDays: serverType.max_days ?? null,
    color: localConfig?.color ?? serverType.color ?? "#64748b",
  };
}

export function LeaveCreditsPanel({
  leaveTypes = [],
  balances = [],
  loading = false,
  selectedLeaveType = null,
}) {
  const groups = groupLeaveTypesByCategory(leaveTypes) ?? [
    { label: null, options: leaveTypes },
  ];

  const rowGroups = groups
    .map((group) => ({
      label: group.label,
      rows: group.options.map((serverType) => buildRow(serverType, balances)),
    }))
    .filter((group) => group.rows.length > 0);

  const hasRows = rowGroups.some((group) => group.rows.length > 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Wallet className="w-4 h-4 text-[var(--primary)]" />
          <CardTitle className="text-base">Current Leave Credits</CardTitle>
        </div>
        <p className="text-xs text-[var(--muted-foreground)] mt-1">
          Your available balance as of today
        </p>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="py-6 text-center text-sm text-[var(--muted-foreground)]">
            Loading your leave credits...
          </div>
        ) : !hasRows ? (
          <div className="py-6 text-center text-sm text-[var(--muted-foreground)]">
            No leave credits to show for your employment type yet.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left font-medium text-xs text-[var(--muted-foreground)] px-4 py-2">
                  Leave Type
                </th>
                <th className="text-right font-medium text-xs text-[var(--muted-foreground)] px-4 py-2">
                  Available Credit
                </th>
              </tr>
            </thead>
            <tbody>
              {rowGroups.map((group) => (
                <Fragment key={group.label ?? "leave-credits-flat"}>
                  {group.label && (
                    <tr>
                      <td
                        colSpan={2}
                        className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--muted-foreground)]"
                      >
                        {group.label}
                      </td>
                    </tr>
                  )}
                  {group.rows.map((row) => (
                    <tr
                      key={row.code}
                      className={cn(
                        "border-b border-[var(--border)] last:border-0 transition-colors",
                        selectedLeaveType === row.code &&
                          "bg-[var(--primary)]/5",
                      )}
                    >
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: row.color }}
                          />
                          <span className="font-medium text-[var(--foreground)]">
                            {row.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        {row.isCreditBased ? (
                          <span
                            className={cn(
                              "font-semibold",
                              row.available <= 0
                                ? "text-red-600 dark:text-red-400"
                                : "text-[var(--foreground)]",
                            )}
                          >
                            {formatCredit(row.available, row.unit)}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--muted)] text-[var(--muted-foreground)]">
                            {formatEntitlementCap(row.maxDays)}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        )}
        <p className="text-[11px] text-[var(--muted-foreground)] px-4 py-3 border-t border-[var(--border)]">
          Balances update automatically based on approved leave records.
          Entitlement-based leaves show their maximum allowable duration per
          qualifying event and aren't deducted from a running balance. Filing a
          credit-based leave type with 0 available credit may be rejected during
          approval.
        </p>
      </CardContent>
    </Card>
  );
}

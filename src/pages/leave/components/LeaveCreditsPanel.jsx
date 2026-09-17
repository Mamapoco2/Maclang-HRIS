import { Wallet } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { CREDITS_PANEL_LEAVE_CODES, LEAVE_TYPE_MAP } from "../leavePolicy";
import { cn } from "@/lib/utils";

function formatCredit(value, unit) {
  const amount = Number.isFinite(value) ? value : 0;
  const formatted = Number(amount.toFixed(2)).toString();
  const label = unit === "hours" ? "hour" : "day";
  return `${formatted} ${label}${amount === 1 ? "" : "s"}`;
}

export function LeaveCreditsPanel({
  leaveTypes = [],
  balances = [],
  loading = false,
  selectedLeaveType = null,
}) {
  const rows = CREDITS_PANEL_LEAVE_CODES.map((code) => {
    const serverType = leaveTypes.find((t) => t.code === code);
    const localConfig = LEAVE_TYPE_MAP[code];
    const record = balances.find(
      (b) => b.leave_type?.code === code || b.leave_type_id === serverType?.id,
    );

    return {
      code,
      label: serverType?.name ?? localConfig?.label ?? code,
      unit: record?.leave_type?.unit ?? serverType?.unit ?? "days",
      available: record ? Number(record.available) : 0,
      hasRecord: Boolean(record),
      color: localConfig?.color ?? serverType?.color ?? "#64748b",
    };
  });

  return (
    <Card className="sticky top-5">
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
              {rows.map((row) => (
                <tr
                  key={row.code}
                  className={cn(
                    "border-b border-[var(--border)] last:border-0 transition-colors",
                    selectedLeaveType === row.code && "bg-[var(--primary)]/5",
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <p className="text-[11px] text-[var(--muted-foreground)] px-4 py-3 border-t border-[var(--border)]">
          Balances update automatically based on approved leave records. Filing
          a leave type with 0 available credit may be rejected during approval.
        </p>
      </CardContent>
    </Card>
  );
}

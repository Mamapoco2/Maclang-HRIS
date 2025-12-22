import LeaveList from "./LeaveList";
import { calculateLeaveBalance } from "/src/lib/leaveAccrual";

export default function LeaveDashboard() {
  // 🔹 Mock employee data (replace later with API)
  const employee = {
    appointmentDate: "2024-01-01",
    usedVL: 3, // already used
    usedSL: 1,
  };

  const balances = calculateLeaveBalance(employee);

  return (
    <div className="p-6 space-y-8">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Leave Benefits
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Civil Service Commission (CSC)–governed leave benefits for government
          hospital employees. Leave credits accrue monthly (1.25 days per month)
          and are subject to approval.
        </p>
      </div>

      {/* Summary Section */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">
            Vacation Leave Balance
          </p>
          <p className="text-xl font-semibold">
            {balances.vl.toFixed(2)} days
          </p>
          <p className="text-xs text-muted-foreground">
            Accrues 1.25 / month
          </p>
        </div>

        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">
            Sick Leave Balance
          </p>
          <p className="text-xl font-semibold">
            {balances.sl.toFixed(2)} days
          </p>
          <p className="text-xs text-muted-foreground">
            Accrues 1.25 / month
          </p>
        </div>

        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">
            Wellness Leave
          </p>
          <p className="text-xl font-semibold">
            Up to 5 days
          </p>
          <p className="text-xs text-muted-foreground">
            Non-cumulative
          </p>
        </div>

        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">
            Special Privilege Leave
          </p>
          <p className="text-xl font-semibold">
            Up to 3 days
          </p>
          <p className="text-xs text-muted-foreground">
            Non-cumulative
          </p>
        </div>
      </div>

      {/* Leave Cards */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">
          Available Leave Types
        </h2>

        <LeaveList balances={balances} />
      </section>
    </div>
  );
}

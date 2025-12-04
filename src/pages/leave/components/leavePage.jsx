import LeaveTable from "./leaveTable";
import LeaveCardKpi from "./leaveCardKpi";

export default function LeaveModule() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Leave Management</h1>
      <LeaveCardKpi />
      <LeaveTable />
    </div>
  );
}

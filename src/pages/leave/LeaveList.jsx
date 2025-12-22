import LeaveCard from "./LeaveCard";
import { leaveTypes } from "./leaveTypes"

export default function LeaveList() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {leaveTypes.map((leave) => (
        <LeaveCard key={leave.code} leave={leave} />
      ))}
    </div>
  );
}

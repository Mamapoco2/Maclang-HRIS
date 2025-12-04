import { SummaryCard } from "./summaryCard";
import ApplicantsCalendar from "./applicantsCalendar";

export default function ApplicantsPage() {
  return (
    <div className="p-6 grid gap-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Applicants"
          value="150"
          trend="+12%"
          status="Trending up this month"
        />
        <SummaryCard
          title="Interviews Scheduled This Week"
          value="95"
          trend="+8%"
          status="Approvals Increasing"
        />
        <SummaryCard
          title="Pending Documents"
          value="27"
          trend="-5%"
          status="Requires Review"
        />
        <SummaryCard
          title="No-Show Applicants"
          value={3}
          trend="+20%"
          status="Increase Observed"
        />
      </div>
      <ApplicantsCalendar />
    </div>
  );
}

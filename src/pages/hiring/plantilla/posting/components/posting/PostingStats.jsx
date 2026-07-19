import React, { useMemo } from "react";
import { Briefcase, CheckCircle2, Clock, Users } from "lucide-react";
import { StatCard, StatsSkeleton } from "../StatCard";

export function PostingStats({ items, loading }) {
  const stats = useMemo(
    () => ({
      totalVacancies: items.reduce(
        (s, i) => s + (i.vacantSlots ?? i.vacancies),
        0,
      ),
      open: items.filter((i) => i.status === "Open").length,
      closingSoon: items.filter((i) => i.status === "Closing Soon").length,
      totalApplicants: items.reduce((s, i) => s + i.applicants, 0),
    }),
    [items],
  );

  if (loading) return <StatsSkeleton />;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        icon={Briefcase}
        label="Total Vacancies"
        value={stats.totalVacancies}
        sub="Across all postings"
        tone="indigo"
      />
      <StatCard
        icon={CheckCircle2}
        label="Open Positions"
        value={stats.open}
        sub="Currently accepting applicants"
        tone="emerald"
      />
      <StatCard
        icon={Clock}
        label="Closing Soon"
        value={stats.closingSoon}
        sub="Closing within the week"
        tone="amber"
      />
      <StatCard
        icon={Users}
        label="Total Applicants"
        value={stats.totalApplicants}
        sub="Submitted applications"
        tone="sky"
      />
    </div>
  );
}

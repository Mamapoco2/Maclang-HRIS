import { useContext, useEffect, useState } from "react";
import { plantillaPostingService } from "@/services/plantillaPostingService";
import { IconLoader2 } from "@tabler/icons-react";
import { SummaryCard } from "../application/components/overview/summaryCard";
import PsbApplicantsCalendar from "./components/psbApplicantsCalendar";
import { AuthContext } from "@/context/AuthContext";

export default function ApplicantsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const { hasRole } = useContext(AuthContext);
  const canViewSummary =
    hasRole("SuperAdmin") || hasRole("Admin") || hasRole("HR");

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    const data = await plantillaPostingService.getAllApplications();
    setApplications(data);
    setLoading(false);
  };

  const summary = {
    total: applications.length,
    pending: applications.filter((a) => a.status === "Pending").length,
    underReview: applications.filter((a) => a.status === "Under Review").length,
    approved: applications.filter((a) => a.status === "Approved").length,
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <IconLoader2 size={24} className="animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="grid gap-6 p-6">
      {canViewSummary && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <SummaryCard
            title="Total Applications"
            value={summary.total}
            status="All PSB Applications"
          />
          <SummaryCard
            title="Pendings"
            value={summary.pending}
            status="Awaiting Initial Review"
          />
          <SummaryCard
            title="Under Review"
            value={summary.underReview}
            status="Currently Being Evaluated"
          />
          <SummaryCard
            title="Approved"
            value={summary.approved}
            status="Successfully Approved"
          />
        </div>
      )}

      <PsbApplicantsCalendar applications={applications} onRefresh={loadAll} />
    </div>
  );
}

import { useEffect, useState } from "react";
import { CalendarDays, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IconLoader2 } from "@tabler/icons-react";
import { plantillaPostingService } from "@/services/plantillaPostingService";
import { SummaryCard } from "../application/components/overview/summaryCard";
import PsbApplicantsCalendar from "./components/psbApplicantsCalendar";
import ApplicationsTable from "../application/components/overview/applicationsTable";

export default function ApplicantsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("calendar");

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    const data = await plantillaPostingService.getAllApplications();
    setApplications(data);
    setLoading(false);
  };

  const updateApplication = (id, patch) => {
    setApplications((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    );
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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <SummaryCard
          title="TOTAL APPLICATIONS"
          value={summary.total}
          status="ALL PSB APPLICATIONS"
        />
        <SummaryCard
          title="PENDING"
          value={summary.pending}
          status="AWAITING INITIAL REVIEW"
        />
        <SummaryCard
          title="UNDER REVIEW"
          value={summary.underReview}
          status="CURRENTLY BEING EVALUATED"
        />
        <SummaryCard
          title="APPROVED"
          value={summary.approved}
          status="SUCCESSFULLY APPROVED"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Applicant List
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="mt-4">
          <PsbApplicantsCalendar
            applications={applications}
            onRefresh={loadAll}
          />
        </TabsContent>

        <TabsContent value="list" className="mt-4">
          <ApplicationsTable
            applications={applications}
            onUpdate={updateApplication}
            showSummary={false}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

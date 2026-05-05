import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SummaryCard } from "./summaryCard";
import { ApplicantsTable } from "../../application/components/overview/applicationsTable";
import ApplicantsCalendar from "./applicantsCalendar";
import {
  getApplicants,
  getApplicantsSummary,
  updateApplicant,
  deleteApplicant,
} from "@/services/hiringService";
import { toast } from "sonner";

export default function ApplicantsPage() {
  const [applicants, setApplicants] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("calendar");

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    const [listRes, summaryRes] = await Promise.all([
      getApplicants(),
      getApplicantsSummary(),
    ]);
    setApplicants(listRes.data ?? []);
    setSummary(summaryRes);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this applicant?")) return;
    try {
      await deleteApplicant(id);
      toast.success("Applicant deleted.");
      await loadAll();
    } catch {
      toast.error("Failed to delete applicant.");
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateApplicant(id, { status });
      setApplicants((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status } : a)),
      );
      toast.success("Status updated.");
    } catch {
      toast.error("Failed to update status.");
    }
  };

  return (
    <div className="p-6 grid gap-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Applicants"
          value={summary.total ?? 0}
          trend=""
          status="All applicants"
        />
        <SummaryCard
          title="For Interview"
          value={summary.for_interview ?? 0}
          trend=""
          status="Scheduled for interview"
        />
        <SummaryCard
          title="Hired"
          value={summary.hired ?? 0}
          trend=""
          status="Successfully hired"
        />
        <SummaryCard
          title="No Show"
          value={summary.no_show ?? 0}
          trend=""
          status="Did not appear"
        />
      </div>

      {/* Tabs — Calendar (default) + List with Onboard button */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="list">Applicants List</TabsTrigger>
        </TabsList>

        {/* Calendar Tab */}
        <TabsContent value="calendar" className="mt-4">
          <ApplicantsCalendar />
        </TabsContent>

        {/* List Tab — with status change + onboard button */}
        <TabsContent value="list" className="mt-4">
          <ApplicantsTable
            applicants={applicants}
            loading={loading}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
            onRefresh={loadAll}
            showOnboardButton={true}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

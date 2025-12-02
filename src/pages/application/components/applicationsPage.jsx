import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { SummaryCard } from "./summaryCard";
import { ApplicantForm } from "./applicationsForm";
import { ApplicantsTable } from "./applicationsTable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ApplicantsModule() {
  const [showForm, setShowForm] = useState(false);
  const [applicants, setApplicants] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    source: "",
    documents: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setApplicants([...applicants, { ...form, id: Date.now() }]);
    setForm({ name: "", email: "", source: "", documents: "" });
    setShowForm(false);
  };

  return (
    <div className="p-6 grid gap-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Applicants"
          value={applicants.length}
          trend="+12%"
          status="Trending up this month"
        />
        <SummaryCard
          title="Approved Applicants"
          value={applicants.filter((a) => a.documents).length}
          trend="+8%"
          status="Increasing approvals"
        />
        <SummaryCard
          title="Pending Documents"
          value={applicants.filter((a) => !a.documents).length}
          trend="-5%"
          status="Needs review"
        />
        <SummaryCard
          title="New This Month"
          value={3}
          trend="+20%"
          status="Growth observed"
        />
      </div>

      <div className="w-full flex justify-end">
        <Button className="w-fit" onClick={() => setShowForm(true)}>
          + Add Application
        </Button>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Applicant</DialogTitle>
          </DialogHeader>
          <ApplicantForm
            form={form}
            setForm={setForm}
            onSubmit={handleSubmit}
          />
        </DialogContent>
      </Dialog>

      <ApplicantsTable applicants={applicants} />
    </div>
  );
}

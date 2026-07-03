import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { SummaryCard } from "./summaryCard";
import { ApplicantForm } from "./applicationsForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import {
  getApplicants,
  getApplicantsSummary,
  createApplicant,
} from "@/services/hiringService";
import { toast } from "sonner";
import { IconLoader2 } from "@tabler/icons-react";

const STATUS_BG = {
  "FOR INTERVIEW": "bg-blue-50 text-blue-700 border-blue-200",
  HIRED: "bg-green-50 text-green-700 border-green-200",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
  "NO SHOW": "bg-orange-50 text-orange-700 border-orange-200",
  PENDING: "bg-gray-100 text-gray-600 border-gray-200",
};

const EMPTY_FORM = {
  first_name: "",
  last_name: "",
  email: "",
  age: "",
  phone: "",
  address: "",
  birthdate: "",
  source: "",
  position: "",
  department: "",
  date_applied: "",
  submission: "",
  status: "FOR INTERVIEW",
  remarks: "",
  documents: "",
};

export default function ApplicationsPage() {
  const [showForm, setShowForm] = useState(false);
  const [applicants, setApplicants] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const documents = form.documents
        ? form.documents
            .split(",")
            .map((d) => d.trim())
            .filter(Boolean)
        : [];
      await createApplicant({ ...form, documents });
      toast.success("APPLICATION SUBMITTED SUCCESSFULLY.");
      setForm(EMPTY_FORM);
      setShowForm(false);
      await loadAll();
    } catch (err) {
      toast.error(
        err?.response?.data?.message ?? "FAILED TO SUBMIT APPLICATION.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 grid gap-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard
          title="TOTAL APPLICATIONS"
          value={summary.total ?? 0}
          status="ALL SUBMITTED APPLICATIONS"
        />
        <SummaryCard
          title="FOR INTERVIEW"
          value={summary.for_interview ?? 0}
          status="SCHEDULED FOR INTERVIEW"
        />
        <SummaryCard
          title="HIRED"
          value={summary.hired ?? 0}
          status="SUCCESSFULLY HIRED"
        />
        <SummaryCard
          title="NO SHOW"
          value={summary.no_show ?? 0}
          status="DID NOT APPEAR"
        />
      </div>

      <div className="flex justify-end">
        <Button onClick={() => setShowForm(true)}>+ ADD APPLICATION</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-16">
              <IconLoader2 size={24} className="animate-spin text-gray-400" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>NAME</TableHead>
                  <TableHead>EMAIL</TableHead>
                  <TableHead>POSITION</TableHead>
                  <TableHead>DEPARTMENT</TableHead>
                  <TableHead>DATE APPLIED</TableHead>
                  <TableHead>SOURCE</TableHead>
                  <TableHead>STATUS</TableHead>
                  <TableHead>DOCUMENTS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applicants.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="py-14 text-center text-sm text-gray-400"
                    >
                      NO APPLICATIONS YET.
                    </TableCell>
                  </TableRow>
                ) : (
                  applicants.map((a) => (
                    <TableRow key={a.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium uppercase">
                        {a.full_name}
                      </TableCell>
                      <TableCell className="uppercase">{a.email}</TableCell>
                      <TableCell className="uppercase">{a.position}</TableCell>
                      <TableCell className="uppercase">
                        {a.department}
                      </TableCell>
                      <TableCell className="uppercase">
                        {a.date_applied ?? "—"}
                      </TableCell>
                      <TableCell className="uppercase">
                        {a.source ?? "—"}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full border ${STATUS_BG[(a.status ?? "").toUpperCase()] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}
                        >
                          {(a.status ?? "").toUpperCase()}
                        </span>
                      </TableCell>
                      <TableCell>
                        {a.documents?.length > 0 ? (
                          <span className="text-xs text-gray-600 uppercase">
                            {a.documents.length} DOC
                            {a.documents.length > 1 ? "S" : ""}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 italic">
                            NONE
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>SUBMIT APPLICATION</DialogTitle>
          </DialogHeader>
          <ApplicantForm
            form={form}
            setForm={setForm}
            onSubmit={handleSubmit}
            saving={saving}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

import React, { useCallback, useEffect, useState } from "react";
import { X, Download, CalendarClock, FileText } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/api";
import { plantillaPostingService } from "@/services/plantillaPostingService";
import { DrawerPanel, Skeleton } from "./ui";
import { ApplicationStatusBadge, InterviewStatusBadge } from "./TableParts";
import { formatDate } from "./utils";

function employeeName(employee) {
  if (!employee) return "—";
  return (
    employee.full_name ||
    [employee.first_name, employee.last_name].filter(Boolean).join(" ") ||
    "—"
  );
}

// Read-only summary of one applicant. No actions here — scheduling and
// reviewing happen from the main applications table; this drawer is just
// for looking someone up quickly from the posting.
function ApplicationCard({ application, onDownload }) {
  const isDecided =
    application.status === "Completed" || application.status === "Rejected";
  const interviewCompleted =
    application.interview?.overall_status?.toUpperCase() === "COMPLETED";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">
            {employeeName(application.employee)}
          </p>
          <p className="text-xs text-slate-400">
            {application.employee?.employee_number ?? "—"} · Submitted{" "}
            {formatDate(application.submitted_at?.slice(0, 10))}
          </p>
        </div>
        <ApplicationStatusBadge status={application.status} />
      </div>

      <div className="mt-3 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
        <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
          <CalendarClock className="h-3.5 w-3.5" />
          Interview
        </span>
        <InterviewStatusBadge status={application.interview?.overall_status} />
      </div>

      {application.notes && (
        <p className="mt-3 text-xs text-slate-500">
          <span className="font-medium text-slate-600">Notes: </span>
          {application.notes}
        </p>
      )}

      {application.remarks && (
        <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
          <span className="font-medium">HR Remarks: </span>
          {application.remarks}
        </p>
      )}

      {application.documents?.length > 0 && (
        <div className="mt-3 space-y-1 border-t border-slate-100 pt-3">
          {application.documents.map((doc) => (
            <button
              key={doc.id}
              onClick={() => onDownload(doc)}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs text-slate-600 hover:bg-slate-50"
            >
              <FileText className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              <span className="truncate">{doc.original_filename}</span>
              <Download className="ml-auto h-3.5 w-3.5 shrink-0 text-slate-400" />
            </button>
          ))}
        </div>
      )}

      {!isDecided && !interviewCompleted && (
        <p className="mt-3 border-t border-slate-100 pt-3 text-[11px] text-slate-400">
          The interview must be completed before this application can be
          approved.
        </p>
      )}
    </div>
  );
}

export function ApplicationsDrawer({ posting, onClose }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!posting) return;
    setLoading(true);
    try {
      const data = await plantillaPostingService.getApplicationsForPosting(
        posting.id,
      );
      setApplications(data);
    } finally {
      setLoading(false);
    }
  }, [posting]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDownload = async (doc) => {
    try {
      const res = await api.get(
        plantillaPostingService.documentDownloadUrl(doc.id),
        { responseType: "blob" },
      );
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.original_filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast?.error?.("Failed to download the file.");
    }
  };

  return (
    <DrawerPanel open={!!posting} onClose={onClose}>
      <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-indigo-600">
            {posting?.baseItemNumber}
          </p>
          <h2 className="mt-0.5 text-lg font-semibold text-slate-900">
            Applicants — {posting?.positionTitle}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-3 px-6 py-5">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-slate-200 bg-white p-4"
            >
              <Skeleton className="h-4 w-40" />
              <Skeleton className="mt-2 h-3 w-24" />
              <Skeleton className="mt-3 h-8 w-full" />
            </div>
          ))
        ) : applications.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-400">
            No one has applied to this posting yet.
          </p>
        ) : (
          applications.map((application) => (
            <ApplicationCard
              key={application.id}
              application={application}
              onDownload={handleDownload}
            />
          ))
        )}
      </div>
    </DrawerPanel>
  );
}

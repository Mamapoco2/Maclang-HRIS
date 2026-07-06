import React, { useCallback, useEffect, useState } from "react";
import {
  X,
  Loader2,
  Download,
  CalendarClock,
  ClipboardCheck,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/api/api";
import { plantillaPostingService } from "@/services/plantillaPostingService";
import { Button, DrawerPanel, Skeleton } from "./ui";
import { ApplicationStatusBadge, InterviewStatusBadge } from "./TableParts";
import { InterviewDialog } from "./InterviewDialog";
import { ReviewApplicationDialog } from "./ReviewApplicationDialog";
import { formatDate } from "./utils";

function employeeName(employee) {
  if (!employee) return "—";
  return (
    employee.full_name ||
    [employee.first_name, employee.last_name].filter(Boolean).join(" ") ||
    "—"
  );
}

function ApplicationCard({
  application,
  onScheduleInterview,
  onReview,
  onDownload,
}) {
  const canApprove =
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
        <span className="text-xs font-medium text-slate-500">Interview</span>
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
        <div className="mt-3 space-y-1">
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

      <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
        <Button
          variant="secondary"
          size="sm"
          className="flex-1"
          onClick={() => onScheduleInterview(application)}
        >
          <CalendarClock className="h-3.5 w-3.5" />
          {application.interview ? "Update Interview" : "Schedule Interview"}
        </Button>
        <Button
          size="sm"
          className="flex-1"
          onClick={() => onReview(application)}
          disabled={
            application.status === "Approved" ||
            application.status === "Rejected"
          }
        >
          <ClipboardCheck className="h-3.5 w-3.5" />
          Review
        </Button>
      </div>

      {!canApprove && application.status === "Pending" && (
        <p className="mt-2 text-[11px] text-slate-400">
          Kailangan munang maging COMPLETED ang interview bago maaprubahan.
        </p>
      )}
    </div>
  );
}

export function ApplicationsDrawer({ posting, onClose, onChanged }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [interviewTarget, setInterviewTarget] = useState(null);
  const [reviewTarget, setReviewTarget] = useState(null);

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
      toast?.error?.("Hindi ma-download ang file.");
    }
  };

  const handleAfterChange = () => {
    load();
    onChanged?.();
  };

  return (
    <>
      <DrawerPanel open={!!posting} onClose={onClose}>
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-indigo-600">
              {posting?.baseItemNumber}
            </p>
            <h2 className="mt-0.5 text-lg font-semibold text-slate-900">
              Applications — {posting?.positionTitle}
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
              Wala pang nag-a-apply sa posting na ito.
            </p>
          ) : (
            applications.map((application) => (
              <ApplicationCard
                key={application.id}
                application={application}
                onScheduleInterview={setInterviewTarget}
                onReview={setReviewTarget}
                onDownload={handleDownload}
              />
            ))
          )}
        </div>
      </DrawerPanel>

      <InterviewDialog
        application={interviewTarget}
        onClose={() => setInterviewTarget(null)}
        onSaved={() => {
          setInterviewTarget(null);
          handleAfterChange();
        }}
      />

      <ReviewApplicationDialog
        application={reviewTarget}
        onClose={() => setReviewTarget(null)}
        onSaved={() => {
          setReviewTarget(null);
          handleAfterChange();
        }}
      />
    </>
  );
}

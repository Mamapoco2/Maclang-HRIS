import { useEffect, useState } from "react";
import {
  Award,
  GraduationCap,
  ClipboardCheck,
  BookOpen,
  Briefcase,
  MessageSquare,
  Building2,
  FileText,
  AlertTriangle,
  Download,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import api from "@/api/api";
import { plantillaPostingService } from "@/services/plantillaPostingService";

function formatDate(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatCurrency(value) {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  if (Number.isNaN(n)) return null;
  return `\u20B1${n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function SectionCard({ icon: Icon, title, requirement, children, isEmpty }) {
  return (
    <div className="rounded-lg border border-slate-200">
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 bg-slate-50/60 px-4 py-2.5">
        <div className="flex items-center gap-2 text-slate-700">
          <Icon className="h-4 w-4 shrink-0 text-slate-400" />
          <span className="text-sm font-medium">{title}</span>
        </div>
        {requirement && (
          <p className="max-w-[60%] text-right text-xs text-slate-500">
            Requirement: <span className="text-slate-600">{requirement}</span>
          </p>
        )}
      </div>
      <div className="px-4 py-3">
        {isEmpty ? (
          <p className="text-sm italic text-slate-400">
            No {title.toLowerCase()} records on file in the applicant's PDS.
          </p>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

async function handleDownload(doc) {
  try {
    const res = await api.get(
      plantillaPostingService.documentDownloadUrl(doc.id),
      { responseType: "blob" },
    );
    const url = URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.download = doc.original_filename || "document";
    link.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    toast.error(
      err?.response?.status === 403
        ? "Not authorized to download this file."
        : "Failed to download file.",
    );
  }
}

export default function ApplicantQualificationView({ applicationId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!applicationId) {
      setData(null);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    plantillaPostingService
      .getApplicantQualifications(applicationId, { signal: controller.signal })
      .then((result) => setData(result))
      .catch((err) => {
        if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED")
          return;
        console.error("getApplicantQualifications:", err);
        setError(
          err?.response?.data?.message ??
            "Failed to load this applicant's qualifications.",
        );
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [applicationId]);

  if (loading) {
    return (
      <div className="flex h-full flex-col gap-4 bg-white px-6 py-5">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 bg-white px-6 text-center">
        <AlertTriangle className="h-6 w-6 text-amber-500" />
        <p className="text-sm text-slate-600">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-full items-center justify-center bg-white text-sm text-slate-400">
        Select an applicant to view their qualifications.
      </div>
    );
  }

  const {
    applicant,
    position,
    qualifications,
    documents,
    remarks,
    pds_on_file,
  } = data;

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-6 py-5">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Comparative assessment
          </p>
          <h2 className="mt-1 truncate text-xl font-serif text-slate-900">
            {applicant?.name ?? "—"}
          </h2>
          <p className="text-sm text-slate-500">
            {applicant?.present_position ?? "No current position on record"}
            {applicant?.employee_number
              ? ` \u00B7 ${applicant.employee_number}`
              : ""}
          </p>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close"
          >
            &times;
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        {!pds_on_file && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              This applicant has no Personal Data Sheet (PDS) records on file
              yet. The sections below will be empty until their PDS is
              completed.
            </p>
          </div>
        )}

        {/* Position to be filled reference */}
        {position && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-slate-700">
              <Building2 className="h-4 w-4" />
              <p className="text-sm font-medium">Position to be filled</p>
            </div>
            <p className="mt-1 font-serif text-base text-slate-900">
              {position.title ?? "—"}
            </p>
            <p className="text-xs text-slate-500">
              {position.item_no ? `Item no: ${position.item_no}` : null}
              {position.salary_grade
                ? ` \u00B7 ${position.salary_grade}`
                : null}
              {formatCurrency(position.monthly_salary)
                ? ` \u00B7 ${formatCurrency(position.monthly_salary)}/mo`
                : null}
            </p>
            {position.office && (
              <p className="mt-0.5 text-xs text-slate-500">{position.office}</p>
            )}
          </div>
        )}

        {/* Qualification sections */}
        <div className="mt-5 space-y-3">
          <SectionCard
            icon={Award}
            title="Eligibility"
            requirement={position?.requirements?.eligibility}
            isEmpty={!qualifications?.eligibility?.length}
          >
            <ul className="space-y-2">
              {qualifications?.eligibility?.map((row) => (
                <li key={row.id} className="text-sm text-slate-800">
                  <p className="font-medium">{row.eligibility}</p>
                  <p className="text-xs text-slate-500">
                    {[
                      row.rating ? `Rating: ${row.rating}` : null,
                      row.exam_date
                        ? `Exam: ${formatDate(row.exam_date)}`
                        : null,
                      row.place,
                      row.license_no ? `License No. ${row.license_no}` : null,
                      row.valid_until
                        ? `Valid until ${formatDate(row.valid_until)}`
                        : null,
                    ]
                      .filter(Boolean)
                      .join(" \u00B7 ")}
                  </p>
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard
            icon={ClipboardCheck}
            title="Performance"
            requirement={null}
          >
            <p className="text-sm italic text-slate-400">
              {qualifications?.performance?.message ??
                "Performance rating is not yet available."}
            </p>
          </SectionCard>

          <SectionCard
            icon={GraduationCap}
            title="Education"
            requirement={position?.requirements?.education}
            isEmpty={!qualifications?.education?.length}
          >
            <ul className="space-y-2">
              {qualifications?.education?.map((row) => (
                <li key={row.id} className="text-sm text-slate-800">
                  <p className="font-medium">
                    {row.degree || row.level || "—"}
                    {row.honors ? ` — ${row.honors}` : ""}
                  </p>
                  <p className="text-xs text-slate-500">
                    {[
                      row.school,
                      row.year_graduated
                        ? `Graduated ${row.year_graduated}`
                        : null,
                    ]
                      .filter(Boolean)
                      .join(" \u00B7 ")}
                  </p>
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard
            icon={BookOpen}
            title="Training"
            requirement={position?.requirements?.training}
            isEmpty={!qualifications?.training?.length}
          >
            <ul className="space-y-2">
              {qualifications?.training?.map((row) => (
                <li key={row.id} className="text-sm text-slate-800">
                  <p className="font-medium">{row.title}</p>
                  <p className="text-xs text-slate-500">
                    {[
                      row.hours ? `${row.hours} hours` : null,
                      row.type,
                      row.sponsored_by,
                      row.date_from
                        ? `${formatDate(row.date_from)}${row.date_to ? ` \u2013 ${formatDate(row.date_to)}` : ""}`
                        : null,
                    ]
                      .filter(Boolean)
                      .join(" \u00B7 ")}
                  </p>
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard
            icon={Briefcase}
            title="Experience"
            requirement={position?.requirements?.experience}
            isEmpty={!qualifications?.experience?.length}
          >
            <ul className="space-y-2">
              {qualifications?.experience?.map((row) => (
                <li key={row.id} className="text-sm text-slate-800">
                  <p className="font-medium">{row.position}</p>
                  <p className="text-xs text-slate-500">
                    {[
                      row.department,
                      row.appointment_status,
                      row.date_from
                        ? `${formatDate(row.date_from)}${row.date_to ? ` \u2013 ${formatDate(row.date_to)}` : " \u2013 Present"}`
                        : null,
                      formatCurrency(row.monthly_salary),
                    ]
                      .filter(Boolean)
                      .join(" \u00B7 ")}
                  </p>
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>

        {/* Remarks */}
        <div className="mt-5">
          <div className="flex items-center gap-2 text-slate-700">
            <MessageSquare className="h-4 w-4" />
            <p className="text-sm font-medium">Remarks</p>
          </div>
          <p className="mt-1.5 rounded-lg border border-slate-200 bg-white p-3 text-sm leading-relaxed text-slate-700">
            {remarks || "No remarks recorded for this application yet."}
          </p>
        </div>

        {/* Source documents */}
        {documents?.length > 0 && (
          <div className="mt-5">
            <div className="flex items-center gap-2 text-slate-700">
              <FileText className="h-4 w-4" />
              <p className="text-sm font-medium">Submitted documents</p>
            </div>
            <ul className="mt-1.5 space-y-1.5">
              {documents.map((doc) => (
                <li key={doc.id}>
                  <button
                    onClick={() => handleDownload(doc)}
                    className="flex items-center gap-1.5 text-sm text-indigo-600 hover:underline"
                  >
                    <Download className="h-3.5 w-3.5" />
                    {doc.original_filename}
                    <Badge variant="outline" className="ml-1">
                      {doc.key}
                    </Badge>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

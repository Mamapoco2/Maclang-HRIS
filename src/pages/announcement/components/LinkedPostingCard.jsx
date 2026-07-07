import { useEffect, useState } from "react";
import {
  Briefcase,
  MapPin,
  Users,
  Calendar,
  ExternalLink,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { plantillaPostingService } from "@/services/plantillaPostingService";
import { formatFullDate } from "../utils";

// Shows a compact "linked job opening" banner on an announcement card.
// Clicking it opens a modal with the full posting details, fetched live
// from plantilla-postings so it always reflects current vacancy status.
export function LinkedPostingCard({ postingId }) {
  const [posting, setPosting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (!postingId) return;
    let cancelled = false;
    setLoading(true);
    setError(false);
    plantillaPostingService
      .getPosting(postingId)
      .then((data) => {
        if (!cancelled) setPosting(data);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [postingId]);

  if (!postingId) return null;

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-400">
        <Loader2 size={13} className="animate-spin" /> Loading linked job
        opening…
      </div>
    );
  }

  if (error || !posting) {
    return (
      <div className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-400">
        This announcement is linked to a job opening, but its details couldn't
        be loaded.
      </div>
    );
  }

  const title = posting.title ?? posting.position_title;
  const deptRaw = posting.department ?? posting.office ?? posting.dept;
  const dept =
    typeof deptRaw === "string"
      ? deptRaw
      : (deptRaw?.name ?? deptRaw?.code ?? null);
  const vacancies =
    posting.vacancies ?? posting.number_of_vacancies ?? posting.slots;
  const deadline =
    posting.deadline ?? posting.closing_date ?? posting.application_deadline;

  return (
    <>
      <button
        onClick={() => setShowDetails(true)}
        className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-50 transition-colors group"
      >
        <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
          <Briefcase size={16} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
            Linked job opening
          </p>
          <p className="text-sm font-semibold text-slate-800 truncate">
            {title}
          </p>
          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
            {dept && (
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <MapPin size={10} /> {dept}
              </span>
            )}
            {vacancies != null && (
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Users size={10} /> {vacancies}{" "}
                {vacancies === 1 ? "slot" : "slots"}
              </span>
            )}
            {deadline && (
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Calendar size={10} /> Apply by{" "}
                {formatFullDate(new Date(deadline))}
              </span>
            )}
          </div>
        </div>
        <ExternalLink
          size={14}
          className="text-blue-400 flex-shrink-0 group-hover:text-blue-600"
        />
      </button>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Briefcase size={16} className="text-blue-600" />
              </div>
              {title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm text-slate-600">
            {dept && (
              <p>
                <span className="font-semibold text-slate-700">
                  Office/Department:{" "}
                </span>
                {dept}
              </p>
            )}
            {posting.item_number && (
              <p>
                <span className="font-semibold text-slate-700">
                  Item number:{" "}
                </span>
                {typeof posting.item_number === "string" ||
                typeof posting.item_number === "number"
                  ? posting.item_number
                  : (posting.item_number?.item_number ??
                    posting.item_number?.code ??
                    posting.item_number?.name)}
              </p>
            )}
            {posting.salary_grade && (
              <p>
                <span className="font-semibold text-slate-700">
                  Salary grade:{" "}
                </span>
                {typeof posting.salary_grade === "string" ||
                typeof posting.salary_grade === "number"
                  ? posting.salary_grade
                  : (posting.salary_grade?.grade ??
                    posting.salary_grade?.name ??
                    posting.salary_grade?.code)}
              </p>
            )}
            {vacancies != null && (
              <p>
                <span className="font-semibold text-slate-700">
                  Vacancies:{" "}
                </span>
                {vacancies}
              </p>
            )}
            {deadline && (
              <p>
                <span className="font-semibold text-slate-700">
                  Application deadline:{" "}
                </span>
                {formatFullDate(new Date(deadline))}
              </p>
            )}
            {(posting.qualifications || posting.description) && (
              <div>
                <p className="font-semibold text-slate-700 mb-1">
                  Qualifications
                </p>
                <p className="whitespace-pre-line">
                  {posting.qualifications ?? posting.description}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  MapPin,
  Users,
  Calendar,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { plantillaPostingService } from "@/services/plantillaPostingService";
import { formatFullDate } from "../utils";

const PLANTILLA_POSTING_ROUTE = "/hiring/plantilla/positions";

export function LinkedPostingCard({ postingId }) {
  const navigate = useNavigate();
  const [posting, setPosting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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

  const title = posting.title;
  const dept = posting.department?.name ?? posting.division?.name ?? null;
  const vacancies = posting.vacant_slots ?? posting.vacancies;
  const deadline = posting.closing_date;

  const goToPosting = () => {
    if (!posting.base_item_number) return;
    navigate(
      `${PLANTILLA_POSTING_ROUTE}?item=${encodeURIComponent(posting.base_item_number)}`,
    );
  };

  return (
    <button
      onClick={goToPosting}
      className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-50 transition-colors group"
    >
      <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
        <Briefcase size={16} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
          Linked job opening
        </p>
        <p className="text-sm font-semibold text-slate-800 truncate">{title}</p>
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
      <span className="text-xs font-medium text-blue-500 flex items-center gap-1 flex-shrink-0 group-hover:text-blue-700">
        View posting <ArrowRight size={13} />
      </span>
    </button>
  );
}

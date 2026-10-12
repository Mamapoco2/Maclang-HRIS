import { useEffect, useState } from "react";
import { History, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { plantillaPositionService } from "@/services/plantillaService";

const EVENT_STYLES = {
  ASSIGNED: {
    label: "Assigned",
    cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  PROMOTED: {
    label: "Promoted",
    cls: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  TRANSFERRED: {
    label: "Transferred in",
    cls: "bg-sky-50 text-sky-700 border-sky-200",
  },
  VACATED: {
    label: "Vacated",
    cls: "bg-amber-50 text-amber-600 border-amber-200",
  },
};

const FALLBACK_EVENT_STYLE = {
  cls: "bg-slate-50 text-slate-500 border-slate-200",
};

function relatedText(event) {
  const label = event.related_position?.label;
  if (!label) return null;
  return event.event_type === "VACATED"
    ? `Moved to item ${label}`
    : `From item ${label}`;
}

function applicationText(application) {
  if (!application) return null;
  const item = application.position_slot_name || application.base_item_number;
  const parts = [item ? `Applied for item ${item}` : "Applied via posting"];
  if (application.posting_title) parts.push(application.posting_title);
  return parts.join(" - ");
}

function HistoryEvent({ event }) {
  const style = EVENT_STYLES[event.event_type] ?? FALLBACK_EVENT_STYLE;
  const related = relatedText(event);
  const applied = applicationText(event.application);

  return (
    <li className="rounded-lg border border-slate-200 bg-white px-4 py-3 space-y-1.5">
      <div className="flex items-center justify-between gap-3">
        <Badge
          variant="outline"
          className={cn("text-xs font-semibold px-2 py-0.5", style.cls)}
        >
          {style.label ?? event.event_type}
        </Badge>
        <span className="font-mono text-xs text-slate-400">
          {event.effective_date}
        </span>
      </div>

      <p className="text-sm font-medium text-slate-800 uppercase">
        {event.employee_name ?? "Unknown employee"}
      </p>

      {related && <p className="text-xs text-slate-500">{related}</p>}
      {applied && <p className="text-xs text-slate-500">{applied}</p>}
      {event.remarks && (
        <p className="text-xs text-slate-400">{event.remarks}</p>
      )}
    </li>
  );
}

export function PositionHistoryDialog({ open, onOpenChange, position }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open || !position?.id) return undefined;

    let cancelled = false;
    setLoading(true);
    setError(null);
    setEvents([]);

    plantillaPositionService
      .getPositionHistory(position.id)
      .then((res) => {
        if (!cancelled) setEvents(res?.data ?? []);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err?.response?.data?.message ?? "Failed to load slot history.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, position?.id]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] bg-white border border-gray-200 shadow-lg p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-gray-100">
          <DialogTitle className="flex items-center gap-2.5 text-gray-900 font-semibold text-sm">
            <span className="flex items-center justify-center w-7 h-7 rounded-md bg-gray-100 text-gray-600">
              <History size={13} />
            </span>
            Slot History
            {position?.position_slot_name && (
              <span className="font-mono text-indigo-600 ml-1">
                {position.position_slot_name}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-400">
              <Loader2 size={16} className="animate-spin" />
              Loading history
            </div>
          ) : error ? (
            <p className="py-10 text-center text-sm text-red-500">{error}</p>
          ) : events.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">
              No history recorded for this slot yet.
            </p>
          ) : (
            <ul className="space-y-2.5">
              {events.map((event) => (
                <HistoryEvent key={event.id} event={event} />
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

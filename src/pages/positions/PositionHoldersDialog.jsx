import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Users } from "lucide-react";

export default function PositionHoldersDialog({
  open,
  onOpenChange,
  position,
  service,
  label,
}) {
  const [holders, setHolders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const positionId = position?.id;

  useEffect(() => {
    if (!open || !positionId || !service) return undefined;

    let cancelled = false;
    setLoading(true);
    setError(null);
    setHolders([]);

    service
      .getEmployees(positionId)
      .then((res) => {
        if (cancelled) return;
        setHolders(Array.isArray(res) ? res : (res.data ?? []));
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          err?.response?.data?.message ?? "Failed to load employees.",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, positionId, service]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] bg-white border border-gray-200 p-0 overflow-hidden rounded-xl gap-0">
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-gray-100 text-left">
          <DialogTitle className="text-base font-semibold text-gray-900 uppercase">
            {position?.title}
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-400">
            {label} position holders
            {!loading && !error && ` · ${holders.length}`}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="space-y-3 px-6 py-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-full rounded" />
              ))}
            </div>
          ) : error ? (
            <div
              role="alert"
              className="flex items-center gap-2 px-6 py-6 text-xs text-red-600"
            >
              <AlertTriangle size={14} className="shrink-0" />
              {error}
            </div>
          ) : holders.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-6 py-12 text-gray-400">
              <Users size={32} className="opacity-30" />
              <p className="text-sm font-medium">
                No employees assigned to this position
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {holders.map((emp, idx) => (
                <li key={emp.id} className="flex items-start gap-3 px-6 py-3">
                  <span className="w-5 pt-0.5 text-center font-mono text-[11px] text-gray-300">
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-800 uppercase">
                      {emp.full_name || "No name"}
                    </p>
                    <p className="truncate text-[11px] text-gray-400">
                      {[emp.employee_number, emp.departments?.join(", ")]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

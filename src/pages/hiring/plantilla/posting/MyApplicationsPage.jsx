import React, { useCallback, useEffect, useState } from "react";
import { ClipboardList, Building2 } from "lucide-react";
import { toast } from "sonner";
import { plantillaPostingService } from "@/services/plantillaPostingService";
import {
  ApplicationStatusBadge,
  InterviewStatusBadge,
  TableSkeleton,
} from "./components/TableParts";
import { formatDate } from "./components/utils";

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await plantillaPostingService.getMyApplications();
      setApplications(data);
    } catch (err) {
      console.error(err);
      toast?.error?.("Hindi ma-load ang mga application mo.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="min-h-full w-full bg-slate-50 font-sans text-slate-900 antialiased">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
            <ClipboardList style={{ height: 22, width: 22 }} />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
              My Applications
            </h1>
            <p className="mt-0.5 text-sm text-slate-500">
              Track the status of your plantilla posting applications.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {loading ? (
            <TableSkeleton />
          ) : applications.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <p className="text-sm font-medium text-slate-600">
                Wala ka pang na-a-apply na plantilla position.
              </p>
            </div>
          ) : (
            applications.map((app) => (
              <div
                key={app.id}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {app.posting?.title ?? "—"}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-400">
                      <Building2 className="h-3.5 w-3.5" />
                      {app.posting?.department?.name ??
                        app.posting?.division?.name ??
                        "—"}
                    </p>
                  </div>
                  <ApplicationStatusBadge status={app.status} />
                </div>

                <div className="mt-3 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                  <span className="text-xs font-medium text-slate-500">
                    Interview Status
                  </span>
                  <InterviewStatusBadge
                    status={app.interview?.overall_status}
                  />
                </div>

                <p className="mt-3 text-xs text-slate-400">
                  Submitted {formatDate(app.submitted_at?.slice(0, 10))}
                </p>

                {app.remarks && (
                  <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                    <span className="font-medium">HR Remarks: </span>
                    {app.remarks}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

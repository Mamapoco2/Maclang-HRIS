import { useEffect, useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import { candidateName } from "../psbUtils";
import ApplicantQualificationView from "./applicantQualificationView";

const DELIBERATION_STATUS = "For Initial Deliberation";

export default function ComparativeAssessmentPage({ applications }) {
  const [selectedId, setSelectedId] = useState(null);

  const deliberationApplications = useMemo(
    () => applications.filter((a) => a.status === DELIBERATION_STATUS),
    [applications],
  );

  useEffect(() => {
    if (deliberationApplications.length === 0) {
      setSelectedId(null);
      return;
    }

    if (!deliberationApplications.some((a) => a.id === selectedId)) {
      setSelectedId(deliberationApplications[0].id);
    }
  }, [deliberationApplications]);

  return (
    <div className="mt-2 mx-auto flex w-full h-[calc(100vh-14rem)] min-h-[32rem] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex w-72 shrink-0 flex-col border-r border-slate-200 bg-slate-50">
        <div className="border-b border-slate-200 px-4 py-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Interview tab
          </p>
          <p className="mt-1 text-sm font-medium text-slate-800">
            Applicants for deliberation
          </p>
          <p className="text-xs text-slate-500">
            {deliberationApplications.length} applicant
            {deliberationApplications.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {deliberationApplications.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-slate-400">
              No applicants are currently for initial deliberation.
            </p>
          ) : (
            deliberationApplications.map((a) => {
              const isActive = a.id === selectedId;
              return (
                <button
                  key={a.id}
                  onClick={() => setSelectedId(a.id)}
                  className={`flex w-full items-center justify-between gap-2 border-b border-slate-100 px-4 py-3 text-left transition-colors ${
                    isActive ? "bg-white" : "hover:bg-white/60"
                  }`}
                >
                  <div className="min-w-0">
                    <p
                      className={`truncate text-sm font-medium ${
                        isActive ? "text-slate-900" : "text-slate-700"
                      }`}
                    >
                      {candidateName(a.employee)}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {a.posting?.title ?? "—"}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {a.posting?.base_item_number
                        ? `Item no: ${a.posting.base_item_number}`
                        : null}
                    </p>
                  </div>
                  <ChevronRight
                    className={`h-4 w-4 shrink-0 ${isActive ? "text-slate-500" : "text-slate-300"}`}
                  />
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right: Applicant qualification view */}
      <div className="flex-1 overflow-hidden">
        <ApplicantQualificationView applicationId={selectedId} />
      </div>
    </div>
  );
}

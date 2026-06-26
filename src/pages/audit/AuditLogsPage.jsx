import { useState, useMemo, useCallback } from "react";
import { useAuditLogs } from "@/hooks/useAuditLogs";
import { EMPTY_FILTERS } from "@/utils/constants";

import { AuditHeader } from "./components/AuditHeader";
import { AuditTabs } from "./components/AuditTabs";
import { AuditStats } from "./components/AuditStats";
import { AuditFilters } from "./components/AuditFilters";
import { AuditTable } from "./components/AuditTable";
import { AuditPagination } from "./components/AuditPagination";
import { AuditTimeline } from "./components/AuditTimeline";
import { AuditCharts } from "./components/AuditCharts";
import { AuditDetailsSheet } from "./components/AuditDetailsSheet";
import { ExportModal } from "./components/ExportModal";
import { ErrorState } from "./components/ErrorState";

export default function AuditLogs() {
  const [dark, setDark] = useState(false);
  const [tab, setTab] = useState("Logs");
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [applied, setApplied] = useState(EMPTY_FILTERS);
  const [selected, setSelected] = useState(null);
  const [showExport, setShowExport] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);

  const { logs, total, loading, error, refetch } = useAuditLogs({
    appliedFilters: applied,
    page,
    perPage,
  });

  // Derive unique filter options from the current page of data.
  // For large datasets you may want a separate /audit-logs/meta endpoint instead.
  const moduleOptions = useMemo(
    () => [...new Set(logs.map((l) => l.module))].sort(),
    [logs],
  );
  const userOptions = useMemo(
    () => [...new Set(logs.map((l) => l.username))].sort(),
    [logs],
  );

  const handleApply = useCallback(() => {
    setApplied(filters);
    setPage(1);
  }, [filters]);
  const handleReset = useCallback(() => {
    setFilters(EMPTY_FILTERS);
    setApplied(EMPTY_FILTERS);
    setPage(1);
  }, []);

  return (
    <div className={dark ? "dark" : ""}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6 space-y-5">
          <AuditHeader
            dark={dark}
            onToggleDark={() => setDark((d) => !d)}
            onRefresh={refetch}
            loading={loading}
            onExport={() => setShowExport(true)}
          />

          <AuditStats logs={logs} loading={loading} />

          <AuditFilters
            filters={filters}
            onChange={setFilters}
            onApply={handleApply}
            onReset={handleReset}
            loading={loading}
            moduleOptions={moduleOptions}
            userOptions={userOptions}
          />

          {/* Card */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <AuditTabs tab={tab} onChange={setTab} total={total} />

            {error ? (
              <ErrorState message={error} onRetry={refetch} />
            ) : tab === "Logs" ? (
              <>
                <AuditTable
                  logs={logs}
                  onView={setSelected}
                  loading={loading}
                />
                {!loading && total > 0 && (
                  <AuditPagination
                    total={total}
                    page={page}
                    perPage={perPage}
                    onPage={setPage}
                    onPerPage={setPerPage}
                  />
                )}
              </>
            ) : tab === "Timeline" ? (
              <div className="p-6">
                <AuditTimeline logs={logs} />
              </div>
            ) : (
              <div className="p-5">
                <AuditCharts logs={logs} />
              </div>
            )}
          </div>
        </div>

        {selected && (
          <AuditDetailsSheet log={selected} onClose={() => setSelected(null)} />
        )}
        {showExport && <ExportModal onClose={() => setShowExport(false)} />}
      </div>
    </div>
  );
}

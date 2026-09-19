import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import { PageHeader } from "./PageHeader";
import { Card } from "@/components/ui/Card";
import { StatusBadge, LeaveTypeBadge } from "./StatusBadge";
import LeaveApi from "@/services/leaveApiService";
import { LeaveRequestModal } from "./components/LeaveRequestModal";
import { CancelRequestModal } from "./components/CancelRequestModal";
import { RetractRequestModal } from "./components/RetractRequestModal";
import { ResubmitRequestModal } from "./components/ResubmitRequestModal";
import { DeleteDraftModal } from "./components/DeleteDraftModal";
import { ApprovalStepsInline } from "./components/ApprovalTrail";
import { LEAVE_TYPES, LEAVE_STATUSES } from "./leavePolicy";
import { formatDate, downloadCSV } from "./utils";
import {
  Search,
  Download,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Columns3,
  MessageSquareWarning,
  XCircle,
  RotateCcw,
  Undo2,
  Pencil,
  Trash2,
} from "lucide-react";

const CANCELLABLE_STATUSES = [
  LEAVE_STATUSES.FOR_HR_REVIEW,
  LEAVE_STATUSES.PENDING_APPROVAL,
  LEAVE_STATUSES.RETURNED_FOR_REVISION,
];

const RETRACTABLE_STATUSES = [LEAVE_STATUSES.APPROVED];

const RESUBMITTABLE_STATUSES = [LEAVE_STATUSES.RETURNED_FOR_REVISION];

function mapRequestToRow(r) {
  const pendingStep = r.approval_steps?.find(
    (s) => s.step_order === r.current_step_order && s.status === "pending",
  );
  const lastActedStep = [...(r.approval_steps ?? [])]
    .reverse()
    .find((s) => s.status !== "pending");
  const approverStep = pendingStep ?? lastActedStep;

  return {
    id: r.id,
    employee: r.employee,
    leaveType: r.leave_type?.code ?? "—",
    startDate: r.start_date,
    endDate: r.end_date,
    days: r.total_days,
    status: r.status,
    rejectionReason:
      r.status === LEAVE_STATUSES.REJECTED
        ? (lastActedStep?.remarks ?? null)
        : undefined,
    dateFiled: r.submitted_at ?? r.created_at,
    approverName: approverStep?.approver?.name ?? "—",
    reason: r.reason,
    details: r.details,
    isHalfDay: r.is_half_day,
    documents: r.documents,
    approvalSteps: r.approval_steps ?? [],
    currentStepOrder: r.current_step_order,
    cancellationReason: r.cancellation_reason ?? null,
    retractionReason: r.retraction_reason ?? null,
    returnReason: r.return_reason ?? null,
  };
}

export default function RequestsPage({ onNavigate }) {
  const navigate = useNavigate();

  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [columnVisibility, setColumnVisibility] = useState({});
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [retractTarget, setRetractTarget] = useState(null);
  const [resubmitTarget, setResubmitTarget] = useState(null);
  const [deleteDraftTarget, setDeleteDraftTarget] = useState(null);
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const [actionError, setActionError] = useState(null);

  const loadRequests = useCallback(() => {
    setLoading(true);
    setError(null);
    LeaveApi.listRequests({ per_page: 100 })
      .then((res) => {
        setRequests((res.data ?? []).map(mapRequestToRow));
      })
      .catch((err) => {
        setError(
          err?.response?.data?.message || "Failed to load your leave requests.",
        );
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleCancelSubmit = useCallback(
    (reason) => {
      if (!cancelTarget) return;
      setActionSubmitting(true);
      setActionError(null);
      LeaveApi.cancelRequest(cancelTarget.id, reason)
        .then(() => {
          setCancelTarget(null);
          loadRequests();
        })
        .catch((err) => {
          setActionError(
            err?.response?.data?.message ||
              "Failed to cancel this leave request.",
          );
        })
        .finally(() => setActionSubmitting(false));
    },
    [cancelTarget, loadRequests],
  );

  const handleRetractSubmit = useCallback(
    (reason) => {
      if (!retractTarget) return;
      setActionSubmitting(true);
      setActionError(null);
      LeaveApi.retractRequest(retractTarget.id, reason)
        .then(() => {
          setRetractTarget(null);
          loadRequests();
        })
        .catch((err) => {
          setActionError(
            err?.response?.data?.message ||
              "Failed to retract this leave request.",
          );
        })
        .finally(() => setActionSubmitting(false));
    },
    [retractTarget, loadRequests],
  );

  const handleResubmitSubmit = useCallback(() => {
    if (!resubmitTarget) return;
    setActionSubmitting(true);
    setActionError(null);
    LeaveApi.resubmitRequest(resubmitTarget.id)
      .then(() => {
        setResubmitTarget(null);
        loadRequests();
      })
      .catch((err) => {
        setActionError(
          err?.response?.data?.message ||
            "Failed to resubmit this leave request.",
        );
      })
      .finally(() => setActionSubmitting(false));
  }, [resubmitTarget, loadRequests]);

  const handleDeleteDraftSubmit = useCallback(() => {
    if (!deleteDraftTarget) return;
    setActionSubmitting(true);
    setActionError(null);
    LeaveApi.deleteDraft(deleteDraftTarget.id)
      .then(() => {
        setDeleteDraftTarget(null);
        loadRequests();
      })
      .catch((err) => {
        setActionError(
          err?.response?.data?.message || "Failed to delete this draft.",
        );
      })
      .finally(() => setActionSubmitting(false));
  }, [deleteDraftTarget, loadRequests]);

  const goToEditDraft = useCallback(
    (id) => navigate(`/NewLeaveRequest?draft=${id}`),
    [navigate],
  );

  const isDraft = useCallback((status) => status === LEAVE_STATUSES.DRAFT, []);

  const canCancel = useCallback(
    (status) => CANCELLABLE_STATUSES.includes(status),
    [],
  );

  const canRetract = useCallback(
    (status) => RETRACTABLE_STATUSES.includes(status),
    [],
  );

  const canResubmit = useCallback(
    (status) => RESUBMITTABLE_STATUSES.includes(status),
    [],
  );

  const filteredData = useMemo(() => {
    return requests.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (typeFilter !== "all" && r.leaveType !== typeFilter) return false;
      if (globalFilter) {
        const q = globalFilter.toLowerCase();
        const haystack = [r.leaveType, r.status, r.reason, r.approverName]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [requests, statusFilter, typeFilter, globalFilter]);

  const handleExport = useCallback(() => {
    const data = filteredData.map((r) => ({
      "Leave Type": r.leaveType,
      "Date Range": `${formatDate(r.startDate)} - ${formatDate(r.endDate)}`,
      Days: r.days,
      Status: r.status,
      "Date Filed": r.dateFiled,
      "Current Approver": r.approverName,
    }));
    downloadCSV(data, "my-leave-requests.csv");
  }, [filteredData]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "leaveType",
        header: "Leave Type",
        cell: ({ getValue }) => (
          <div className="flex justify-center">
            <LeaveTypeBadge type={getValue()} />
          </div>
        ),
      },
      {
        id: "dateRange",
        header: "Date Range",
        cell: ({ row }) => (
          <div className="flex justify-center text-sm text-[var(--foreground)]">
            {row.original.startDate
              ? `${formatDate(row.original.startDate)} - ${formatDate(row.original.endDate)}`
              : "—"}
          </div>
        ),
      },
      {
        accessorKey: "days",
        header: "Days",
        cell: ({ getValue }) => (
          <div className="flex justify-center text-sm text-[var(--foreground)]">
            {getValue() ?? "—"}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => (
          <div className="flex justify-center">
            <StatusBadge status={getValue()} />
          </div>
        ),
      },
      {
        accessorKey: "dateFiled",
        header: "Date Filed",
        cell: ({ getValue }) => (
          <div className="flex justify-center">
            <span className="text-sm text-[var(--muted-foreground)]">
              {formatDate(getValue())}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "approverName",
        header: "Current Approver",
        cell: ({ getValue }) => (
          <div className="flex justify-center text-sm text-[var(--foreground)]">
            {getValue()}
          </div>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) =>
          isDraft(row.original.status) ? (
            <div className="flex items-center justify-center gap-1">
              <button
                onClick={() => goToEditDraft(row.original.id)}
                className="p-1.5 rounded-lg hover:bg-[var(--muted)] text-[var(--muted-foreground)] transition-colors"
                title="Edit Draft"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDeleteDraftTarget(row.original)}
                className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                title="Delete Draft"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-1">
              <button
                onClick={() => setViewTarget(row.original)}
                className="p-1.5 rounded-lg hover:bg-[var(--muted)] text-[var(--muted-foreground)] transition-colors"
                title="View"
              >
                <Eye className="w-4 h-4" />
              </button>
              {canCancel(row.original.status) && (
                <button
                  onClick={() => setCancelTarget(row.original)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                  title="Cancel"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              )}
              {canRetract(row.original.status) && (
                <button
                  onClick={() => setRetractTarget(row.original)}
                  className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600 transition-colors"
                  title="Retract"
                >
                  <Undo2 className="w-4 h-4" />
                </button>
              )}
              {canResubmit(row.original.status) && (
                <button
                  onClick={() => setResubmitTarget(row.original)}
                  className="p-1.5 rounded-lg hover:bg-orange-50 text-orange-600 transition-colors"
                  title="Resubmit"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          ),
      },
    ],
    [canCancel, canRetract, canResubmit, isDraft, goToEditDraft],
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { columnVisibility },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <div className="p-4 md:p-6 space-y-4">
      <PageHeader
        title="My Leave Requests"
        description="Track and manage your submitted leave applications"
      />

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      <Card className="p-0 overflow-hidden">
        {/* Filters toolbar */}
        <div className="flex flex-wrap items-center gap-2 p-4 border-b border-[var(--border)]">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
            <input
              type="text"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search leave requests..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]"
          >
            <option value="all">All Statuses</option>
            {Object.entries(LEAVE_STATUSES.LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]"
          >
            <option value="all">All Types</option>
            {LEAVE_TYPES.map((t) => (
              <option key={t.code} value={t.code}>
                {t.label}
              </option>
            ))}
          </select>

          <div className="relative">
            <button
              onClick={() => setShowColumnMenu((v) => !v)}
              className="flex items-center gap-2 px-3 py-2 text-sm border border-[var(--border)] rounded-lg hover:bg-[var(--muted)] transition-colors text-[var(--foreground)]"
            >
              <Columns3 className="w-4 h-4" />
              <span className="hidden sm:inline">Columns</span>
            </button>
            {showColumnMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-xl z-20 p-2 animate-fade-in">
                {table
                  .getAllLeafColumns()
                  .filter((c) => c.id !== "actions")
                  .map((col) => (
                    <label
                      key={col.id}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[var(--muted)] cursor-pointer text-sm text-[var(--foreground)]"
                    >
                      <input
                        type="checkbox"
                        checked={col.getIsVisible()}
                        onChange={col.getToggleVisibilityHandler()}
                        className="rounded"
                      />
                      {col.columnDef.header?.toString()}
                    </label>
                  ))}
              </div>
            )}
          </div>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-[var(--border)] rounded-lg hover:bg-[var(--muted)] transition-colors text-[var(--foreground)]"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className="border-b border-[var(--border)]">
                  {hg.headers.map((header) => (
                    <th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className={`px-4 py-3 text-center text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider bg-[var(--muted)]/30 ${header.column.getCanSort() ? "cursor-pointer select-none hover:text-[var(--foreground)]" : ""}`}
                    >
                      <div className="flex items-center justify-center gap-1">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {header.column.getCanSort() && (
                          <span className="text-[var(--muted-foreground)]">
                            {header.column.getIsSorted() === "asc" ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : header.column.getIsSorted() === "desc" ? (
                              <ChevronDown className="w-3 h-3" />
                            ) : (
                              <ChevronsUpDown className="w-3 h-3 opacity-40" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-16 text-center"
                  >
                    <p className="text-sm text-[var(--muted-foreground)]">
                      Loading your leave requests…
                    </p>
                  </td>
                </tr>
              ) : table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row, i) => (
                  <tr
                    key={row.id}
                    className="border-b border-[var(--border)] hover:bg-[var(--muted)]/30 transition-colors animate-fade-in"
                    style={{ animationDelay: `${i * 0.04}s` }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3.5">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-16 text-center"
                  >
                    <p className="text-sm text-[var(--muted-foreground)]">
                      You haven't filed any leave requests yet
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-[var(--border)] flex items-center justify-between flex-wrap gap-3">
          <p className="text-xs text-[var(--muted-foreground)]">
            Showing{" "}
            {table.getState().pagination.pageIndex *
              table.getState().pagination.pageSize +
              1}
            –
            {Math.min(
              (table.getState().pagination.pageIndex + 1) *
                table.getState().pagination.pageSize,
              filteredData.length,
            )}{" "}
            of {filteredData.length} results
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--muted)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-[var(--foreground)]" />
            </button>
            {Array.from({ length: table.getPageCount() }, (_, i) => (
              <button
                key={i}
                onClick={() => table.setPageIndex(i)}
                className={`w-8 h-8 text-sm rounded-lg border transition-colors ${
                  table.getState().pagination.pageIndex === i
                    ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                    : "border-[var(--border)] hover:bg-[var(--muted)] text-[var(--foreground)]"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--muted)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-[var(--foreground)]" />
            </button>
          </div>
        </div>
      </Card>

      {/* View request modal (CS Form 6 replica) */}
      {viewTarget && (
        <LeaveRequestModal
          request={viewTarget}
          onClose={() => setViewTarget(null)}
        />
      )}

      {cancelTarget && (
        <CancelRequestModal
          request={cancelTarget}
          submitting={actionSubmitting}
          onClose={() => {
            setCancelTarget(null);
            setActionError(null);
          }}
          onSave={handleCancelSubmit}
        />
      )}

      {retractTarget && (
        <RetractRequestModal
          request={retractTarget}
          submitting={actionSubmitting}
          onClose={() => {
            setRetractTarget(null);
            setActionError(null);
          }}
          onSave={handleRetractSubmit}
        />
      )}

      {resubmitTarget && (
        <ResubmitRequestModal
          request={resubmitTarget}
          submitting={actionSubmitting}
          onClose={() => {
            setResubmitTarget(null);
            setActionError(null);
          }}
          onSave={handleResubmitSubmit}
        />
      )}

      {deleteDraftTarget && (
        <DeleteDraftModal
          request={deleteDraftTarget}
          submitting={actionSubmitting}
          onClose={() => {
            setDeleteDraftTarget(null);
            setActionError(null);
          }}
          onSave={handleDeleteDraftSubmit}
        />
      )}

      {actionError && (
        <div
          className="fixed bottom-4 right-4 z-[60] max-w-sm rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-lg"
          role="alert"
        >
          {actionError}
        </div>
      )}
    </div>
  );
}

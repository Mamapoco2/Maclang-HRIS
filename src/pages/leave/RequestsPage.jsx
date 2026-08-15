import { useState, useMemo, useEffect, useCallback } from "react";
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
import { ApprovalStepsInline } from "./components/ApprovalTrail";
import { LEAVE_TYPES } from "./leavePolicy";
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
} from "lucide-react";

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
      r.status === "rejected" ? (lastActedStep?.remarks ?? null) : undefined,
    appliedDate: r.submitted_at ?? r.created_at,
    approverName: approverStep?.approver?.name ?? "—",
    reason: r.reason,
    details: r.details,
    isHalfDay: r.is_half_day,
    documents: r.documents,
    approvalSteps: r.approval_steps ?? [],
    currentStepOrder: r.current_step_order,
  };
}

export default function RequestsPage({ onNavigate }) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [columnVisibility, setColumnVisibility] = useState({});
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);

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

  const filteredData = useMemo(() => {
    return requests.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (typeFilter !== "all" && r.leaveType !== typeFilter) return false;
      if (globalFilter) {
        const q = globalFilter.toLowerCase();
        return r.leaveType.toLowerCase().includes(q);
      }
      return true;
    });
  }, [requests, statusFilter, typeFilter, globalFilter]);

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
          <div className="text-center">
            <p className="text-sm text-[var(--foreground)]">
              {formatDate(row.original.startDate)}
            </p>
            <p className="text-xs text-[var(--muted-foreground)]">
              to {formatDate(row.original.endDate)}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "days",
        header: "Days",
        cell: ({ getValue }) => (
          <div className="flex justify-center">
            <span className="text-sm font-semibold text-[var(--foreground)]">
              {getValue()}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row, getValue }) => (
          <div className="flex flex-col items-center gap-1">
            <StatusBadge status={getValue()} />
            {getValue() === "rejected" && row.original.rejectionReason && (
              <span
                title={row.original.rejectionReason}
                className="flex items-center gap-1 text-xs text-red-600 max-w-[160px] truncate"
              >
                <MessageSquareWarning className="w-3 h-3 shrink-0" />
                {row.original.rejectionReason}
              </span>
            )}
          </div>
        ),
      },
      {
        accessorKey: "appliedDate",
        header: "Applied",
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
        cell: ({ row }) => (
          <div className="flex flex-col items-center gap-1.5 max-w-[260px] mx-auto">
            <ApprovalStepsInline
              steps={row.original.approvalSteps}
              currentStepOrder={row.original.currentStepOrder}
              className="justify-center"
            />
          </div>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center justify-center gap-1">
            <button
              onClick={() => setViewTarget(row.original)}
              className="p-1.5 rounded-lg hover:bg-[var(--muted)] text-[var(--muted-foreground)] transition-colors"
              title="View"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    [],
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
    initialState: { pagination: { pageSize: 8 } },
  });

  const handleExport = () => {
    const data = filteredData.map((r) => ({
      "Leave Type": r.leaveType,
      "Start Date": r.startDate,
      "End Date": r.endDate,
      Days: r.days,
      Status: r.status,
      "Rejection Reason": r.rejectionReason ?? "",
      Applied: r.appliedDate,
      "Current Approver": r.approverName,
    }));
    downloadCSV(data, "my-leave-requests.csv");
  };

  return (
    <div className="p-5">
      <PageHeader
        title="My Leave Requests"
        description="Track the leave requests you've filed and their approval status"
      />

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-sm text-red-700 dark:text-red-400 flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={loadRequests}
            className="text-xs font-medium underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Summary pills */}
      <div className="flex gap-3 mb-5 flex-wrap">
        {[
          { label: "All", value: "all", count: requests.length },
          {
            label: "Pending",
            value: "pending",
            count: requests.filter((r) => r.status === "pending").length,
          },
          {
            label: "Approved",
            value: "approved",
            count: requests.filter((r) => r.status === "approved").length,
          },
          {
            label: "Rejected",
            value: "rejected",
            count: requests.filter((r) => r.status === "rejected").length,
          },
        ].map((s) => (
          <button
            key={s.value}
            onClick={() => setStatusFilter(s.value)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
              statusFilter === s.value
                ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                : "bg-[var(--card)] text-[var(--muted-foreground)] border-[var(--border)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
            }`}
          >
            {s.label}
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${statusFilter === s.value ? "bg-white/20" : "bg-[var(--muted)]"}`}
            >
              {s.count}
            </span>
          </button>
        ))}
      </div>

      <Card>
        {/* Toolbar */}
        <div className="p-4 border-b border-[var(--border)] flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
            <input
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search by leave type..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-[var(--muted)] border-0 rounded-lg outline-none focus:ring-2 focus:ring-[var(--ring)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-[var(--muted)] border-0 rounded-lg outline-none focus:ring-2 focus:ring-[var(--ring)] text-[var(--foreground)] cursor-pointer"
          >
            <option value="all">All Types</option>
            {LEAVE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>

          <div className="relative">
            <button
              onClick={() => setShowColumnMenu((v) => !v)}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-[var(--muted)] rounded-lg hover:bg-[var(--border)] transition-colors text-[var(--foreground)]"
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
    </div>
  );
}

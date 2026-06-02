import { useState, useMemo } from "react";
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
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { useToast } from "./Toast";
import { LEAVE_REQUESTS, LEAVE_TYPES } from "./mockData";
import { formatDate, downloadCSV } from "./utils";
import {
  Search,
  Filter,
  Download,
  Plus,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Check,
  X,
  SlidersHorizontal,
  Columns3,
} from "lucide-react";

export default function RequestsPage({ onNavigate }) {
  const { toast } = useToast();
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [columnVisibility, setColumnVisibility] = useState({});
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [requests, setRequests] = useState(LEAVE_REQUESTS);

  const filteredData = useMemo(() => {
    return requests.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (typeFilter !== "all" && r.leaveType !== typeFilter) return false;
      if (globalFilter) {
        const q = globalFilter.toLowerCase();
        return (
          r.employeeName.toLowerCase().includes(q) ||
          r.department.toLowerCase().includes(q) ||
          r.leaveType.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [requests, statusFilter, typeFilter, globalFilter]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "employeeName",
        header: "Employee",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Avatar name={row.original.employeeName} size="sm" />
            <div className="text-center">
              <p className="text-sm font-semibold text-[var(--foreground)]">
                {row.original.employeeName}
              </p>
              <p className="text-xs text-[var(--muted-foreground)]">
                {row.original.department}
              </p>
            </div>
          </div>
        ),
      },
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
        cell: ({ getValue }) => (
          <div className="flex justify-center">
            <StatusBadge status={getValue()} />
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
        header: "Approver",
        cell: ({ getValue }) => (
          <div className="flex justify-center">
            <span className="text-sm text-[var(--foreground)]">
              {getValue()}
            </span>
          </div>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center justify-center gap-1">
            <button
              onClick={() => onNavigate("approvals")}
              className="p-1.5 rounded-lg hover:bg-[var(--muted)] text-[var(--muted-foreground)] transition-colors"
              title="View"
            >
              <Eye className="w-4 h-4" />
            </button>
            {row.original.status === "pending" && (
              <>
                <button
                  onClick={() => handleAction(row.original.id, "approved")}
                  className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-emerald-600 transition-colors"
                  title="Approve"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleAction(row.original.id, "rejected")}
                  className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 transition-colors"
                  title="Reject"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        ),
      },
    ],
    [],
  );

  const handleAction = (id, status) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r)),
    );
    toast({
      title: status === "approved" ? "Request Approved" : "Request Rejected",
      description: `Leave request has been ${status}.`,
      variant: status === "approved" ? "success" : "destructive",
    });
  };

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
      Employee: r.employeeName,
      Department: r.department,
      "Leave Type": r.leaveType,
      "Start Date": r.startDate,
      "End Date": r.endDate,
      Days: r.days,
      Status: r.status,
      Applied: r.appliedDate,
      Approver: r.approverName,
    }));
    downloadCSV(data, "leave-requests.csv");
    toast({
      title: "Export Successful",
      description: "CSV file has been downloaded.",
      variant: "success",
    });
  };

  return (
    <div className="p-5">
      <PageHeader
        title="Leave Requests"
        description="Manage and track all employee leave requests"
        actions={
          <Button onClick={() => onNavigate("new-request")} size="sm">
            <Plus className="w-4 h-4" /> New Request
          </Button>
        }
      />

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
              placeholder="Search by name, department..."
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
              {table.getRowModel().rows.length > 0 ? (
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
                      No leave requests found
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
    </div>
  );
}

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Bug,
  Lightbulb,
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Search,
  X,
  RotateCcw,
  ArrowUpDown,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { getReports, updateReport } from "@/services/bugService";

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  open: {
    label: "Open",
    icon: Circle,
    className: "bg-slate-100 text-slate-700 border-slate-200",
  },
  in_progress: {
    label: "In Progress",
    icon: Clock,
    className: "bg-amber-100 text-amber-700 border-amber-200",
  },
  resolved: {
    label: "Resolved",
    icon: CheckCircle2,
    className: "bg-green-100 text-green-700 border-green-200",
  },
};

const SEVERITY_CONFIG = {
  critical: {
    label: "Critical",
    className: "bg-red-100 text-red-700 border-red-200",
  },
  high: {
    label: "High",
    className: "bg-orange-100 text-orange-700 border-orange-200",
  },
  medium: {
    label: "Medium",
    className: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  low: {
    label: "Low",
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
};

const TYPE_CONFIG = {
  bug: {
    label: "Bug",
    icon: Bug,
    className: "bg-red-100 text-red-700 border-red-200",
  },
  improvement: {
    label: "Improvement",
    icon: Lightbulb,
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
};

const CATEGORIES = [
  "UI / UX",
  "Authentication",
  "Performance",
  "Dashboard",
  "API",
  "Mobile",
  "Notifications",
  "Billing",
  "Other",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Fetch every page of reports from the paginated API.
 * The backend paginates at 25 per page; without this, stat card totals
 * are wrong and filters miss records beyond the first page.
 *
 * Abort signal is passed through so in-flight fetches cancel on unmount.
 */
async function fetchAllReports(signal) {
  let page = 1;
  let lastPage = 1;
  const all = [];

  do {
    // getReports passes params straight to axios, which serialises them as query strings
    const data = await getReports({ page, per_page: 100 }, { signal });

    // Support both paginated envelope { data: [], meta: { last_page } }
    // and plain array responses (unlikely in this codebase but defensive).
    if (Array.isArray(data)) {
      all.push(...data);
      break;
    }

    all.push(...(data.data ?? []));
    lastPage = data.meta?.last_page ?? 1;
    page += 1;
  } while (page <= lastPage);

  return all;
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status];
  if (!cfg) return null;
  const Icon = cfg.icon;
  return (
    <Badge
      className={`flex items-center gap-1 text-xs font-medium border ${cfg.className} hover:${cfg.className}`}
    >
      <Icon className="w-3 h-3" />
      {cfg.label}
    </Badge>
  );
}

// ─── Sort Icon (extracted — not defined inside render) ────────────────────────

function SortIcon({ field, sortField, sortDir }) {
  if (sortField !== field)
    return (
      <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground/50 ml-1 inline" />
    );
  return sortDir === "asc" ? (
    <ChevronUp className="w-3.5 h-3.5 ml-1 inline" />
  ) : (
    <ChevronDown className="w-3.5 h-3.5 ml-1 inline" />
  );
}

// ─── Stat Cards ───────────────────────────────────────────────────────────────

function StatCards({ reports }) {
  const total = reports.length;
  const open = reports.filter((r) => r.status === "open").length;
  const inProgress = reports.filter((r) => r.status === "in_progress").length;
  const resolved = reports.filter((r) => r.status === "resolved").length;
  const critical = reports.filter(
    (r) => r.severity === "critical" && r.status !== "resolved",
  ).length;

  const stats = [
    { label: "Total reports", value: total, color: "text-foreground" },
    { label: "Open", value: open, color: "text-slate-600" },
    { label: "In progress", value: inProgress, color: "text-amber-600" },
    { label: "Resolved", value: resolved, color: "text-green-600" },
    { label: "Critical open", value: critical, color: "text-red-600" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
      {stats.map(({ label, value, color }) => (
        <div
          key={label}
          className="rounded-lg bg-muted/40 border border-border p-3"
        >
          <p className="text-xs text-muted-foreground mb-1">{label}</p>
          <p className={`text-2xl font-semibold ${color}`}>{value}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function ReportDetailModal({ report, open, onOpenChange, onStatusChange }) {
  if (!report) return null;

  const typeCfg = TYPE_CONFIG[report.type];
  const TypeIcon = typeCfg.icon;
  const isResolved = report.status === "resolved";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-start gap-3">
            <div
              className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                report.type === "bug" ? "bg-red-100" : "bg-blue-100"
              }`}
            >
              <TypeIcon
                className={`w-4 h-4 ${
                  report.type === "bug" ? "text-red-600" : "text-blue-600"
                }`}
              />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-base font-semibold leading-snug">
                {report.subject}
              </DialogTitle>
              <DialogDescription className="mt-1 text-xs text-muted-foreground">
                #{report.id} · Submitted by {report.user?.username ?? "Unknown"}{" "}
                on {formatDate(report.created_at)}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 space-y-4">
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={report.status} />
            <Badge
              className={`text-xs font-medium border ${typeCfg.className} hover:${typeCfg.className}`}
            >
              {typeCfg.label}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {report.category}
            </Badge>
            {report.severity && (
              <Badge
                className={`text-xs font-medium border ${
                  SEVERITY_CONFIG[report.severity].className
                } hover:${SEVERITY_CONFIG[report.severity].className}`}
              >
                <AlertTriangle className="w-3 h-3 mr-1" />
                {SEVERITY_CONFIG[report.severity].label}
              </Badge>
            )}
          </div>

          <Separator />

          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1.5">
              Description
            </p>
            <p className="text-sm leading-relaxed">{report.description}</p>
          </div>

          {report.resolved_at && (
            <>
              <Separator />
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle2 className="w-4 h-4" />
                <span>Resolved on {formatDateTime(report.resolved_at)}</span>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-between border-t px-6 py-4 gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          <div className="flex gap-2">
            {report.status === "open" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  onStatusChange(report.id, "in_progress");
                  onOpenChange(false);
                }}
              >
                <Clock className="w-3.5 h-3.5 mr-1.5" />
                Mark in progress
              </Button>
            )}
            {isResolved ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  onStatusChange(report.id, "open");
                  onOpenChange(false);
                }}
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                Reopen
              </Button>
            ) : (
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => {
                  onStatusChange(report.id, "resolved");
                  onOpenChange(false);
                }}
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                Mark as fixed
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Module ──────────────────────────────────────────────────────────────

export default function ReportsModule() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [sortField, setSortField] = useState("created_at");
  const [sortDir, setSortDir] = useState("desc");
  const [selectedReport, setSelectedReport] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // ── Fetch ────────────────────────────────────────────────────────────────

  const fetchReports = useCallback(async (signal) => {
    setLoading(true);
    setError(null);
    try {
      const all = await fetchAllReports(signal);
      setReports(all);
    } catch (err) {
      // Ignore AbortError from cleanup — it's not a real error.
      if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") return;
      console.error(err);
      setError("Failed to load reports. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Create an AbortController so we can cancel in-flight requests on unmount
    // or when the effect re-runs (axios supports { signal } from AbortController).
    const controller = new AbortController();
    fetchReports(controller.signal);
    return () => controller.abort();
  }, [fetchReports]);

  // ── Filtering & sorting ──────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let rows = [...reports];

    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.subject.toLowerCase().includes(q) ||
          r.user?.username?.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q),
      );
    }
    if (filterType !== "all") rows = rows.filter((r) => r.type === filterType);
    if (filterStatus !== "all")
      rows = rows.filter((r) => r.status === filterStatus);
    if (filterCategory !== "all")
      rows = rows.filter((r) => r.category === filterCategory);
    if (filterSeverity !== "all")
      rows = rows.filter((r) => r.severity === filterSeverity);

    rows.sort((a, b) => {
      let av, bv;
      if (sortField === "user.username") {
        av = a.user?.username ?? "";
        bv = b.user?.username ?? "";
      } else {
        av = a[sortField] ?? "";
        bv = b[sortField] ?? "";
      }
      if (sortField === "created_at" || sortField === "resolved_at") {
        av = av ? new Date(av).getTime() : 0;
        bv = bv ? new Date(bv).getTime() : 0;
      }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return rows;
  }, [
    reports,
    search,
    filterType,
    filterStatus,
    filterCategory,
    filterSeverity,
    sortField,
    sortDir,
  ]);

  // ── Actions ──────────────────────────────────────────────────────────────

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const handleStatusChange = useCallback(
    async (id, newStatus) => {
      // Optimistic update — update local state immediately for snappy UX
      const previous = reports.find((r) => r.id === id);
      const optimisticPayload = {
        status: newStatus,
        // Set resolved_at client-side so the Release Manager's unassigned
        // list orders correctly before the next full refresh.
        resolved_at: newStatus === "resolved" ? new Date().toISOString() : null,
      };

      setReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...optimisticPayload } : r)),
      );
      // Keep modal in sync if it's open for this report
      setSelectedReport((prev) =>
        prev?.id === id ? { ...prev, ...optimisticPayload } : prev,
      );

      setUpdatingId(id);
      try {
        await updateReport(id, optimisticPayload);
        const labels = {
          resolved: "Marked as fixed",
          open: "Reopened",
          in_progress: "Marked in progress",
        };
        toast.success(labels[newStatus] ?? "Status updated.");
      } catch (err) {
        console.error(err);
        // Roll back on failure
        setReports((prev) =>
          prev.map((r) => (r.id === id ? { ...r, ...previous } : r)),
        );
        setSelectedReport((prev) =>
          prev?.id === id ? { ...prev, ...previous } : prev,
        );
        toast.error("Failed to update status. Please try again.");
      } finally {
        setUpdatingId(null);
      }
    },
    [reports],
  );

  const handleRowClick = (report) => {
    setSelectedReport(report);
    setModalOpen(true);
  };

  const hasActiveFilters =
    filterType !== "all" ||
    filterStatus !== "all" ||
    filterCategory !== "all" ||
    filterSeverity !== "all" ||
    search.trim();

  const clearFilters = () => {
    setSearch("");
    setFilterType("all");
    setFilterStatus("all");
    setFilterCategory("all");
    setFilterSeverity("all");
  };

  // ── Loading / error states ────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <p className="text-sm">Loading reports…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="outline" size="sm" onClick={() => fetchReports()}>
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 space-y-6">
      {/* ── Page header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Reports</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track and resolve bug reports and improvement requests.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => fetchReports()}>
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
          Refresh
        </Button>
      </div>

      {/* ── Stat cards ── */}
      <StatCards reports={reports} />

      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search reports..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9 text-sm"
          />
        </div>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="h-9 text-sm w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="h-9 text-sm w-[130px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="bug">Bug</SelectItem>
            <SelectItem value="improvement">Improvement</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterSeverity} onValueChange={setFilterSeverity}>
          <SelectTrigger className="h-9 text-sm w-[130px]">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All severities</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="h-9 text-sm w-[150px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-9 text-sm text-muted-foreground"
          >
            <X className="w-3.5 h-3.5 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* ── Table ── */}
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-8 text-xs">#</TableHead>
              <TableHead
                className="text-xs cursor-pointer select-none"
                onClick={() => handleSort("subject")}
              >
                Subject{" "}
                <SortIcon
                  field="subject"
                  sortField={sortField}
                  sortDir={sortDir}
                />
              </TableHead>
              <TableHead className="text-xs w-[100px]">Type</TableHead>
              <TableHead className="text-xs w-[110px]">Category</TableHead>
              <TableHead className="text-xs w-[90px]">Severity</TableHead>
              <TableHead className="text-xs w-[110px]">Status</TableHead>
              <TableHead
                className="text-xs w-[120px] cursor-pointer select-none"
                onClick={() => handleSort("user.username")}
              >
                Reporter{" "}
                <SortIcon
                  field="user.username"
                  sortField={sortField}
                  sortDir={sortDir}
                />
              </TableHead>
              <TableHead
                className="text-xs w-[110px] cursor-pointer select-none"
                onClick={() => handleSort("created_at")}
              >
                Submitted{" "}
                <SortIcon
                  field="created_at"
                  sortField={sortField}
                  sortDir={sortDir}
                />
              </TableHead>
              <TableHead className="text-xs w-[100px] text-right">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center py-12 text-sm text-muted-foreground"
                >
                  No reports match your current filters.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((report) => {
                const typeCfg = TYPE_CONFIG[report.type];
                const TypeIcon = typeCfg.icon;
                const isResolved = report.status === "resolved";
                const isUpdating = updatingId === report.id;

                return (
                  <TableRow
                    key={report.id}
                    className={`cursor-pointer transition-colors ${
                      isResolved ? "opacity-60" : ""
                    } ${isUpdating ? "pointer-events-none opacity-50" : ""}`}
                    onClick={() => handleRowClick(report)}
                  >
                    <TableCell className="text-xs text-muted-foreground font-mono">
                      {report.id}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-start gap-2 min-w-0">
                        <TypeIcon
                          className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${
                            report.type === "bug"
                              ? "text-red-500"
                              : "text-blue-500"
                          }`}
                        />
                        <span
                          className={`text-sm font-medium line-clamp-1 ${
                            isResolved
                              ? "line-through text-muted-foreground"
                              : ""
                          }`}
                        >
                          {report.subject}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`text-xs border ${typeCfg.className} hover:${typeCfg.className}`}
                      >
                        {typeCfg.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {report.category}
                    </TableCell>
                    <TableCell>
                      {report.severity ? (
                        <Badge
                          className={`text-xs border ${
                            SEVERITY_CONFIG[report.severity].className
                          } hover:${SEVERITY_CONFIG[report.severity].className}`}
                        >
                          {SEVERITY_CONFIG[report.severity].label}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={report.status} />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {report.user?.username ?? "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(report.created_at)}
                    </TableCell>
                    <TableCell
                      className="text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {isResolved ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-muted-foreground"
                          disabled={isUpdating}
                          onClick={() => handleStatusChange(report.id, "open")}
                        >
                          <RotateCcw className="w-3 h-3 mr-1" />
                          Reopen
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-green-600 hover:text-green-700 hover:bg-green-50"
                          disabled={isUpdating}
                          onClick={() =>
                            handleStatusChange(report.id, "resolved")
                          }
                        >
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Fix
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── Footer count ── */}
      {filtered.length > 0 && (
        <p className="text-xs text-muted-foreground text-right">
          Showing {filtered.length} of {reports.length} report
          {reports.length !== 1 ? "s" : ""}
        </p>
      )}

      {/* ── Detail modal ── */}
      <ReportDetailModal
        report={selectedReport}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}

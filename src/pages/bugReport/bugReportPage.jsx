import { useState, useMemo } from "react";
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
  Filter,
  X,
  RotateCcw,
  ArrowUpDown,
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

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_REPORTS = [
  {
    id: 1,
    subject: "Login button unresponsive on iOS Safari",
    description:
      "When tapping the login button on iOS Safari 17, nothing happens. The form submits fine on Chrome and Firefox. Expected to be redirected to the dashboard after login.",
    type: "bug",
    category: "Authentication",
    severity: "critical",
    status: "open",
    submitted_by: "Maria Santos",
    created_at: "2025-08-01T08:14:00Z",
    resolved_at: null,
  },
  {
    id: 2,
    subject: "Dashboard charts not loading after timezone change",
    description:
      "After switching my account timezone to UTC+8, the revenue charts on the dashboard show a blank area. The data table below still loads correctly. Refreshing does not fix it.",
    type: "bug",
    category: "Dashboard",
    severity: "high",
    status: "in_progress",
    submitted_by: "James Reyes",
    created_at: "2025-08-03T11:45:00Z",
    resolved_at: null,
  },
  {
    id: 3,
    subject: "Add keyboard shortcut to open report modal",
    description:
      "It would be useful to open the report issue modal via a keyboard shortcut like Ctrl+Shift+R so power users don't have to reach for the mouse every time they spot a bug.",
    type: "improvement",
    category: "UI / UX",
    severity: null,
    status: "open",
    submitted_by: "Lena Cruz",
    created_at: "2025-08-05T09:00:00Z",
    resolved_at: null,
  },
  {
    id: 4,
    subject: "API rate limit error not surfaced in UI",
    description:
      "When the API rate limit is hit, the frontend shows a generic error toast instead of a specific message telling the user to wait before retrying. This causes confusion.",
    type: "bug",
    category: "API",
    severity: "medium",
    status: "resolved",
    submitted_by: "Carlos Tan",
    created_at: "2025-07-28T14:22:00Z",
    resolved_at: "2025-08-06T10:00:00Z",
  },
  {
    id: 5,
    subject: "Notification bell badge count resets on page refresh",
    description:
      "The unread notification count shown on the bell icon goes back to zero after refreshing the page even when there are unread notifications. It repopulates after a few seconds.",
    type: "bug",
    category: "Notifications",
    severity: "low",
    status: "resolved",
    submitted_by: "Ana Villanueva",
    created_at: "2025-07-30T16:10:00Z",
    resolved_at: "2025-08-04T09:30:00Z",
  },
  {
    id: 6,
    subject: "Optimize billing page load time",
    description:
      "The billing page takes 4–6 seconds to load on first visit. Most of the delay appears to be from unoptimized invoice list queries. Pagination or lazy loading would help significantly.",
    type: "improvement",
    category: "Billing",
    severity: null,
    status: "in_progress",
    submitted_by: "Miguel Orozco",
    created_at: "2025-08-02T13:00:00Z",
    resolved_at: null,
  },
  {
    id: 7,
    subject: "Mobile sidebar overlaps main content on small screens",
    description:
      "On screens narrower than 375px the open sidebar overlaps the main content area without a backdrop or close affordance, making the page unusable until the user rotates the device.",
    type: "bug",
    category: "Mobile",
    severity: "high",
    status: "open",
    submitted_by: "Rachel Kim",
    created_at: "2025-08-07T07:55:00Z",
    resolved_at: null,
  },
  {
    id: 8,
    subject: "Add bulk status update for reports",
    description:
      "Admins currently have to open each report individually to change its status. A checkbox selection with a bulk action dropdown would save significant time when triaging many reports at once.",
    type: "improvement",
    category: "UI / UX",
    severity: null,
    status: "open",
    submitted_by: "Derek Lim",
    created_at: "2025-08-08T10:30:00Z",
    resolved_at: null,
  },
];

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
  low: { label: "Low", className: "bg-blue-100 text-blue-700 border-blue-200" },
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

  const handleMarkFixed = () => {
    onStatusChange(report.id, "resolved");
    onOpenChange(false);
  };

  const handleReopen = () => {
    onStatusChange(report.id, "open");
    onOpenChange(false);
  };

  const handleMarkInProgress = () => {
    onStatusChange(report.id, "in_progress");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-start gap-3">
            <div
              className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${report.type === "bug" ? "bg-red-100" : "bg-blue-100"}`}
            >
              <TypeIcon
                className={`w-4 h-4 ${report.type === "bug" ? "text-red-600" : "text-blue-600"}`}
              />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-base font-semibold leading-snug">
                {report.subject}
              </DialogTitle>
              <DialogDescription className="mt-1 text-xs text-muted-foreground">
                #{report.id} · Submitted by {report.submitted_by} on{" "}
                {formatDate(report.created_at)}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 space-y-4">
          {/* Badges row */}
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
                className={`text-xs font-medium border ${SEVERITY_CONFIG[report.severity].className} hover:${SEVERITY_CONFIG[report.severity].className}`}
              >
                <AlertTriangle className="w-3 h-3 mr-1" />
                {SEVERITY_CONFIG[report.severity].label}
              </Badge>
            )}
          </div>

          <Separator />

          {/* Description */}
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

        {/* Footer actions */}
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
                onClick={handleMarkInProgress}
              >
                <Clock className="w-3.5 h-3.5 mr-1.5" />
                Mark in progress
              </Button>
            )}
            {isResolved ? (
              <Button size="sm" variant="outline" onClick={handleReopen}>
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                Reopen
              </Button>
            ) : (
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={handleMarkFixed}
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
  const [reports, setReports] = useState(MOCK_REPORTS);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [sortField, setSortField] = useState("created_at");
  const [sortDir, setSortDir] = useState("desc");
  const [selectedReport, setSelectedReport] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // ── Filtering & sorting ──────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let rows = [...reports];

    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.subject.toLowerCase().includes(q) ||
          r.submitted_by.toLowerCase().includes(q) ||
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
      let av = a[sortField] ?? "";
      let bv = b[sortField] ?? "";
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

  const handleStatusChange = (id, newStatus) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: newStatus,
              resolved_at:
                newStatus === "resolved" ? new Date().toISOString() : null,
            }
          : r,
      ),
    );
    const labels = {
      resolved: "Marked as fixed",
      open: "Reopened",
      in_progress: "Marked in progress",
    };
    toast.success(labels[newStatus] ?? "Status updated.");
  };

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

  // ── Sort icon ─────────────────────────────────────────────────────────────

  const SortIcon = ({ field }) => {
    if (sortField !== field)
      return (
        <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground/50 ml-1 inline" />
      );
    return sortDir === "asc" ? (
      <ChevronUp className="w-3.5 h-3.5 ml-1 inline" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5 ml-1 inline" />
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* ── Page header ── */}
      <div>
        <h1 className="text-xl font-semibold">Reports</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Track and resolve bug reports and improvement requests.
        </p>
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
                Subject <SortIcon field="subject" />
              </TableHead>
              <TableHead className="text-xs w-[100px]">Type</TableHead>
              <TableHead className="text-xs w-[110px]">Category</TableHead>
              <TableHead className="text-xs w-[90px]">Severity</TableHead>
              <TableHead className="text-xs w-[110px]">Status</TableHead>
              <TableHead
                className="text-xs w-[120px] cursor-pointer select-none"
                onClick={() => handleSort("submitted_by")}
              >
                Reporter <SortIcon field="submitted_by" />
              </TableHead>
              <TableHead
                className="text-xs w-[110px] cursor-pointer select-none"
                onClick={() => handleSort("created_at")}
              >
                Submitted <SortIcon field="created_at" />
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

                return (
                  <TableRow
                    key={report.id}
                    className={`cursor-pointer transition-colors ${isResolved ? "opacity-60" : ""}`}
                    onClick={() => handleRowClick(report)}
                  >
                    <TableCell className="text-xs text-muted-foreground font-mono">
                      {report.id}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-start gap-2 min-w-0">
                        <TypeIcon
                          className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${report.type === "bug" ? "text-red-500" : "text-blue-500"}`}
                        />
                        <span
                          className={`text-sm font-medium line-clamp-1 ${isResolved ? "line-through text-muted-foreground" : ""}`}
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
                          className={`text-xs border ${SEVERITY_CONFIG[report.severity].className} hover:${SEVERITY_CONFIG[report.severity].className}`}
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
                      {report.submitted_by}
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

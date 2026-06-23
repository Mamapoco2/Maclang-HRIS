import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Bug,
  Lightbulb,
  Plus,
  Rocket,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  Tag,
  FileText,
  Trash2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  fetchReleases,
  fetchUnassignedReports,
  createRelease,
  deleteRelease,
} from "@/services/releaseService";

// ─── Config ───────────────────────────────────────────────────────────────────

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Extract the first human-readable error message from an axios error response.
 * Handles Laravel 422 validation error shapes and generic API errors.
 */
function describeError(error, fallback) {
  const data = error?.response?.data;
  if (!data) return fallback;

  // Laravel 422: { message: "...", errors: { field: ["msg"] } }
  if (error.response?.status === 422 && data.errors) {
    const firstField = Object.keys(data.errors)[0];
    return data.errors[firstField]?.[0] ?? data.message ?? fallback;
  }

  return data.message ?? fallback;
}

// ─── Report Section (extracted — not defined inside modal render) ─────────────

/**
 * Renders a labeled group of selectable reports inside the Create Release modal.
 * Defined at module level to prevent recreation on every modal re-render.
 */
function ReportSection({
  label,
  icon: Icon,
  color,
  items,
  selected,
  onToggle,
}) {
  if (items.length === 0) return null;

  return (
    <div>
      <div
        className={`flex items-center gap-2 mb-2 text-sm font-medium ${color}`}
      >
        <Icon className="w-4 h-4" />
        {label}
      </div>
      <div className="space-y-1">
        {items.map((r) => (
          <label
            key={r.id}
            className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
          >
            <Checkbox
              checked={selected.includes(r.id)}
              onCheckedChange={() => onToggle(r.id)}
              className="mt-0.5"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium leading-snug">{r.subject}</p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-xs text-muted-foreground">
                  {r.category}
                </span>
                {r.severity && (
                  <Badge
                    className={`text-xs border ${SEVERITY_CONFIG[r.severity].className} hover:${SEVERITY_CONFIG[r.severity].className}`}
                  >
                    {SEVERITY_CONFIG[r.severity].label}
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  resolved {formatDate(r.resolved_at)}
                </span>
              </div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}

// ─── Create Release Modal ─────────────────────────────────────────────────────

function CreateReleaseModal({
  open,
  onOpenChange,
  availableReports,
  onPublished,
}) {
  const [version, setVersion] = useState("");
  const [selected, setSelected] = useState([]);
  const [isPublishing, setIsPublishing] = useState(false);

  // Reset form state whenever the modal is reopened.
  useEffect(() => {
    if (open) {
      setVersion("");
      setSelected([]);
    }
  }, [open]);

  const toggle = useCallback(
    (id) =>
      setSelected((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
      ),
    [],
  );

  const handlePublish = async () => {
    const trimmedVersion = version.trim();
    if (!trimmedVersion) {
      toast.error("Version number is required.");
      return;
    }
    if (selected.length === 0) {
      toast.error("Select at least one resolved report to include.");
      return;
    }

    setIsPublishing(true);
    try {
      const { data: release } = await createRelease({
        version: trimmedVersion,
        report_ids: selected,
      });
      onPublished(release);
      onOpenChange(false);
      toast.success(`Version ${release.version} published to What's New.`);
    } catch (error) {
      toast.error(describeError(error, "Failed to publish release."));
    } finally {
      setIsPublishing(false);
    }
  };

  const bugs = availableReports.filter((r) => r.type === "bug");
  const improvements = availableReports.filter((r) => r.type === "improvement");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
              <Rocket className="w-4 h-4 text-green-600" />
            </div>
            <DialogTitle className="text-base font-semibold">
              Publish New Release
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground mt-1">
            Group resolved reports into a version and publish to What's New.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-5 space-y-5">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">
              Version number <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Tag className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="e.g. 4.4.0"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                className="pl-8"
                disabled={isPublishing}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">
              Include resolved reports <span className="text-red-500">*</span>
            </Label>
            <p className="text-xs text-muted-foreground mb-3">
              {selected.length} of {availableReports.length} selected
            </p>

            {availableReports.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No unassigned resolved reports available.
              </div>
            ) : (
              <div className="space-y-4">
                <ReportSection
                  label="Bug Fixes"
                  icon={Bug}
                  color="text-red-600"
                  items={bugs}
                  selected={selected}
                  onToggle={toggle}
                />
                <ReportSection
                  label="Improvements"
                  icon={Lightbulb}
                  color="text-blue-600"
                  items={improvements}
                  selected={selected}
                  onToggle={toggle}
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between border-t px-6 py-4 gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPublishing}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePublish}
            disabled={isPublishing || selected.length === 0 || !version.trim()}
            className="bg-green-600 hover:bg-green-700 text-white min-w-[140px]"
          >
            {isPublishing ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" /> Publishing...
              </>
            ) : (
              <>
                <Rocket className="w-4 h-4 mr-2" /> Publish Release
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Delete Confirmation Dialog ───────────────────────────────────────────────

function DeleteReleaseDialog({
  release,
  open,
  onOpenChange,
  onConfirm,
  isDeleting,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100">
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <DialogTitle className="text-base font-semibold">
              Delete release?
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground">
            <strong>{release?.title}</strong> will be removed from What's New.
            The {release?.reports?.length ?? 0} report
            {release?.reports?.length !== 1 ? "s" : ""} will return to the
            unassigned pool. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
            className="min-w-[100px]"
          >
            {isDeleting ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              "Delete"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Release Card ─────────────────────────────────────────────────────────────

function ReleaseCard({ release, onDeleteClick, isDeleting }) {
  const [expanded, setExpanded] = useState(false);
  const bugs = release.reports.filter((r) => r.type === "bug");
  const improvements = release.reports.filter((r) => r.type === "improvement");

  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
            <Rocket className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold">{release.title}</p>
              <Badge className="text-xs bg-green-100 text-green-700 border-green-200 hover:bg-green-100 border">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Published
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {formatDate(release.date)} · {release.reports.length} item
              {release.reports.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => setExpanded((e) => !e)}
          >
            {expanded ? (
              <ChevronUp className="w-3.5 h-3.5 mr-1" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 mr-1" />
            )}
            {expanded ? "Hide" : "View"}
          </Button>
          {/* Triggers confirmation dialog — not an immediate delete */}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={() => onDeleteClick(release)}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
          </Button>
        </div>
      </div>

      {expanded && (
        <>
          <Separator />
          <div className="px-5 py-4 space-y-4">
            {bugs.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2 text-sm font-medium text-red-600">
                  <Bug className="w-4 h-4" /> Bug Fixes
                </div>
                <ul className="space-y-1 ml-6">
                  {bugs.map((r) => (
                    <li key={r.id} className="text-sm text-muted-foreground">
                      <span className="mr-2 text-muted-foreground/50">•</span>
                      {r.subject}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {improvements.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2 text-sm font-medium text-blue-600">
                  <Lightbulb className="w-4 h-4" /> Improvements
                </div>
                <ul className="space-y-1 ml-6">
                  {improvements.map((r) => (
                    <li key={r.id} className="text-sm text-muted-foreground">
                      <span className="mr-2 text-muted-foreground/50">•</span>
                      {r.subject}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Error State ──────────────────────────────────────────────────────────────

function ErrorState({ message, onRetry }) {
  return (
    <div className="rounded-lg border border-dashed border-red-200 bg-red-50 p-8 text-center">
      <AlertTriangle className="w-5 h-5 text-red-500 mx-auto mb-2" />
      <p className="text-sm text-red-700 mb-3">{message}</p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
        Retry
      </Button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ReleaseManager() {
  const [releases, setReleases] = useState([]);
  const [unassignedReports, setUnassignedReports] = useState([]);
  const [createOpen, setCreateOpen] = useState(false);

  // Delete confirmation state
  const [releaseToDelete, setReleaseToDelete] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [releasesState, setReleasesState] = useState("loading"); // loading | ready | error
  const [reportsState, setReportsState] = useState("loading");
  const [releasesError, setReleasesError] = useState(null);
  const [reportsError, setReportsError] = useState(null);

  const loadReleases = useCallback(async () => {
    setReleasesState("loading");
    setReleasesError(null);
    try {
      const { data } = await fetchReleases();
      setReleases(data);
      setReleasesState("ready");
    } catch (error) {
      setReleasesError(describeError(error, "Failed to load releases."));
      setReleasesState("error");
    }
  }, []);

  const loadUnassignedReports = useCallback(async () => {
    setReportsState("loading");
    setReportsError(null);
    try {
      const { data } = await fetchUnassignedReports();
      setUnassignedReports(data);
      setReportsState("ready");
    } catch (error) {
      setReportsError(
        describeError(error, "Failed to load unassigned reports."),
      );
      setReportsState("error");
    }
  }, []);

  useEffect(() => {
    loadReleases();
    loadUnassignedReports();
  }, [loadReleases, loadUnassignedReports]);

  // The backend is the source of truth for which reports are unassigned —
  // refetch both after a publish to avoid client/server drift.
  const handlePublished = useCallback(() => {
    loadReleases();
    loadUnassignedReports();
  }, [loadReleases, loadUnassignedReports]);

  // Stage the release for deletion; confirmation dialog handles the actual call.
  const handleDeleteClick = useCallback((release) => {
    setReleaseToDelete(release);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!releaseToDelete) return;

    setDeletingId(releaseToDelete.id);
    try {
      await deleteRelease(releaseToDelete.id);
      toast.success("Release removed.");
      setReleaseToDelete(null);
      await Promise.all([loadReleases(), loadUnassignedReports()]);
    } catch (error) {
      toast.error(describeError(error, "Failed to delete release."));
    } finally {
      setDeletingId(null);
    }
  }, [releaseToDelete, loadReleases, loadUnassignedReports]);

  const totalItemsShipped = useMemo(
    () => releases.reduce((sum, r) => sum + r.reports.length, 0),
    [releases],
  );

  return (
    <div className="p-6 space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Release Manager</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Group resolved reports into versioned releases for What's New.
          </p>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white"
          size="sm"
          // Only block if reports are still loading (we need the list for the modal)
          disabled={reportsState === "loading"}
        >
          <Plus className="w-4 h-4 mr-1.5" />
          New Release
        </Button>
      </div>

      {/* ── Stat strip ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: "Published releases",
            value: releasesState === "ready" ? releases.length : "—",
            color: "text-green-600",
          },
          {
            label: "Unassigned resolved",
            value: reportsState === "ready" ? unassignedReports.length : "—",
            color: "text-amber-600",
          },
          {
            label: "Total items shipped",
            value: releasesState === "ready" ? totalItemsShipped : "—",
            color: "text-foreground",
          },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-lg bg-muted/40 border p-3">
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            <p className={`text-2xl font-semibold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── Unassigned resolved reports ── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-medium">
            Resolved — not yet in a release
          </h2>
          {reportsState === "ready" && (
            <Badge variant="outline" className="text-xs">
              {unassignedReports.length}
            </Badge>
          )}
        </div>

        {reportsState === "loading" && (
          <div className="rounded-lg border p-8 text-center text-sm text-muted-foreground">
            Loading resolved reports...
          </div>
        )}

        {reportsState === "error" && (
          <ErrorState message={reportsError} onRetry={loadUnassignedReports} />
        )}

        {reportsState === "ready" && unassignedReports.length === 0 && (
          <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            All resolved reports have been assigned to a release.
          </div>
        )}

        {reportsState === "ready" && unassignedReports.length > 0 && (
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="text-xs">#</TableHead>
                  <TableHead className="text-xs">Subject</TableHead>
                  <TableHead className="text-xs w-[100px]">Type</TableHead>
                  <TableHead className="text-xs w-[110px]">Category</TableHead>
                  <TableHead className="text-xs w-[90px]">Severity</TableHead>
                  <TableHead className="text-xs w-[120px]">Resolved</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unassignedReports.map((r) => {
                  const typeCfg =
                    TYPE_CONFIG[r.type] ?? TYPE_CONFIG.improvement;
                  const TypeIcon = typeCfg.icon;
                  return (
                    <TableRow key={r.id}>
                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {r.id}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-start gap-2">
                          <TypeIcon
                            className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${
                              r.type === "bug"
                                ? "text-red-500"
                                : "text-blue-500"
                            }`}
                          />
                          <span className="text-sm font-medium">
                            {r.subject}
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
                        {r.category}
                      </TableCell>
                      <TableCell>
                        {r.severity ? (
                          <Badge
                            className={`text-xs border ${SEVERITY_CONFIG[r.severity].className} hover:${SEVERITY_CONFIG[r.severity].className}`}
                          >
                            {SEVERITY_CONFIG[r.severity].label}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            —
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDate(r.resolved_at)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* ── Published releases ── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Rocket className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-medium">Published Releases</h2>
          {releasesState === "ready" && (
            <Badge variant="outline" className="text-xs">
              {releases.length}
            </Badge>
          )}
        </div>

        {releasesState === "loading" && (
          <div className="rounded-lg border p-8 text-center text-sm text-muted-foreground">
            Loading releases...
          </div>
        )}

        {releasesState === "error" && (
          <ErrorState message={releasesError} onRetry={loadReleases} />
        )}

        {releasesState === "ready" && releases.length === 0 && (
          <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            No releases yet. Click <strong>New Release</strong> to publish your
            first one.
          </div>
        )}

        {releasesState === "ready" && releases.length > 0 && (
          <div className="space-y-3">
            {releases.map((release) => (
              <ReleaseCard
                key={release.id}
                release={release}
                onDeleteClick={handleDeleteClick}
                isDeleting={deletingId === release.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Create modal ── */}
      <CreateReleaseModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        availableReports={unassignedReports}
        onPublished={handlePublished}
      />

      {/* ── Delete confirmation dialog ── */}
      <DeleteReleaseDialog
        release={releaseToDelete}
        open={!!releaseToDelete}
        onOpenChange={(open) => {
          if (!open) setReleaseToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        isDeleting={!!deletingId}
      />
    </div>
  );
}

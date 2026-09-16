import { useMemo, useState } from "react";
import { PageHeader } from "./PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { StatusBadge, LeaveTypeBadge } from "./StatusBadge";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from "./Dialog";
import { useToast } from "./Toast";
import { useAuth } from "@/hooks/useAuth";
import { useLeaveApprovals } from "@/hooks/useLeaveApprovals";
import { formatDate } from "./utils";
import {
  CheckCircle,
  XCircle,
  Ban,
  MessageSquare,
  Clock,
  Filter,
  CheckCheck,
  Eye,
} from "lucide-react";

// Roles that can act on requests. Employees without one of these get a
// read-only view of the same list.
const APPROVER_ROLES = new Set(["admin", "hr", "manager", "supervisor"]);

function canUserApprove(user) {
  return user?.employee?.is_approver === true || APPROVER_ROLES.has(user?.role);
}

function daysSince(dateStr) {
  if (!dateStr) return null;
  const diffMs = Date.now() - new Date(dateStr).getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

function mapToRow(r) {
  const pendingStep = r.approval_steps?.find(
    (s) => s.step_order === r.current_step_order && s.status === "pending",
  );
  const lastActedStep = [...(r.approval_steps ?? [])]
    .reverse()
    .find((s) => s.status !== "pending");
  const approverStep = pendingStep ?? lastActedStep;

  const remarks =
    r.status === "cancelled"
      ? (r.cancellation_reason ?? null)
      : (lastActedStep?.remarks ?? null);

  return {
    id: r.id,
    employeeName: r.employee?.name ?? "—",
    department: r.employee?.department ?? "—",
    leaveType: r.leave_type?.code ?? "—",
    startDate: r.start_date,
    endDate: r.end_date,
    days: r.total_days,
    status: r.status,
    reason: r.reason,
    appliedDate: r.submitted_at ?? r.created_at,
    approverName: approverStep?.approver?.name ?? "—",
    remarks,
    cancellationReason: r.cancellation_reason ?? null,
    rescheduledTo: r.rescheduled_to ?? null,
    rescheduledFrom: r.rescheduled_from ?? null,
  };
}

export default function ApprovalsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const canManageApprovals = canUserApprove(user);

  const {
    pending: pendingRaw,
    recentDecisions: recentRaw,
    loading,
    error,
    refetch,
    approve,
    reject,
    bulkApprove,
  } = useLeaveApprovals();

  const pending = useMemo(() => pendingRaw.map(mapToRow), [pendingRaw]);
  const recent = useMemo(
    () => recentRaw.map(mapToRow).slice(0, 5),
    [recentRaw],
  );

  const [leaveTypeFilter, setLeaveTypeFilter] = useState("all");
  const leaveTypeOptions = useMemo(
    () => Array.from(new Set(pending.map((r) => r.leaveType))).sort(),
    [pending],
  );
  const filteredPending = useMemo(
    () =>
      leaveTypeFilter === "all"
        ? pending
        : pending.filter((r) => r.leaveType === leaveTypeFilter),
    [pending, leaveTypeFilter],
  );

  const [selected, setSelected] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [actionDialog, setActionDialog] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [detailOpen, setDetailOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleAction = async (id, action) => {
    setSubmitting(true);
    try {
      if (action === "approved") {
        await approve(id, remarks || null);
      } else {
        await reject(id, remarks || "Rejected");
      }
      setActionDialog(null);
      setRemarks("");
      setDetailOpen(false);
      toast({
        title: action === "approved" ? "Request Approved" : "Request Rejected",
        description: `Leave request has been ${action} successfully.`,
        variant: action === "approved" ? "success" : "destructive",
      });
    } catch (err) {
      toast({
        title: "Action failed",
        description:
          err?.response?.data?.message || "Could not process this request.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkApprove = async () => {
    if (!selectedIds.length) return;
    setSubmitting(true);
    try {
      const res = await bulkApprove(selectedIds);
      const approvedCount = (res.approved ?? []).length;
      const skippedCount = Object.keys(res.skipped ?? {}).length;
      toast({
        title: `${approvedCount} Request${approvedCount === 1 ? "" : "s"} Approved`,
        description:
          skippedCount > 0
            ? `${skippedCount} request(s) could not be approved — check the pending list.`
            : "All selected requests have been approved.",
        variant: skippedCount > 0 ? "warning" : "success",
      });
      setSelectedIds([]);
    } catch (err) {
      toast({
        title: "Bulk approve failed",
        description: err?.response?.data?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    setSelectedIds(
      selectedIds.length === filteredPending.length
        ? []
        : filteredPending.map((r) => r.id),
    );
  };

  const openDetail = (req) => {
    setSelected(req);
    setDetailOpen(true);
  };

  return (
    <div className="p-4 sm:p-5">
      <PageHeader
        title="Approval Workflow"
        description={
          canManageApprovals
            ? "Review and manage leave request approvals"
            : "View the status of leave requests awaiting approval"
        }
        actions={
          canManageApprovals &&
          selectedIds.length > 0 && (
            <Button onClick={handleBulkApprove} size="sm" disabled={submitting}>
              <CheckCheck className="w-4 h-4" />
              Approve {selectedIds.length} Selected
            </Button>
          )
        }
      />

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-sm text-red-700 dark:text-red-400 flex items-center justify-between gap-3">
          <span>Failed to load approvals.</span>
          <button
            onClick={refetch}
            className="text-xs font-medium underline hover:no-underline whitespace-nowrap"
          >
            Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-[var(--foreground)]">
              Pending Approvals
              <span className="ml-2 px-2 py-0.5 text-xs bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 rounded-full">
                {filteredPending.length}
              </span>
            </h2>

            <div className="flex items-center gap-3">
              {leaveTypeOptions.length > 1 && (
                <label className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
                  <Filter className="w-3.5 h-3.5" aria-hidden="true" />
                  <span className="sr-only">Filter by leave type</span>
                  <select
                    value={leaveTypeFilter}
                    onChange={(e) => {
                      setLeaveTypeFilter(e.target.value);
                      setSelectedIds([]);
                    }}
                    className="bg-transparent border border-[var(--border)] rounded-md px-2 py-1 text-xs text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--ring)]"
                  >
                    <option value="all">All types</option>
                    {leaveTypeOptions.map((code) => (
                      <option key={code} value={code}>
                        {code}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              {canManageApprovals && filteredPending.length > 0 && (
                <label className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={
                      selectedIds.length === filteredPending.length &&
                      filteredPending.length > 0
                    }
                    onChange={toggleSelectAll}
                    className="rounded"
                    aria-label="Select all pending requests"
                  />
                  Select all
                </label>
              )}
            </div>
          </div>

          {loading ? (
            <div
              className="space-y-3"
              role="status"
              aria-label="Loading approvals"
            >
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse h-24 rounded-xl bg-[var(--muted)]"
                />
              ))}
            </div>
          ) : filteredPending.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <p className="text-base font-semibold text-[var(--foreground)]">
                  All caught up!
                </p>
                <p className="text-sm text-[var(--muted-foreground)] mt-1">
                  {pending.length === 0
                    ? "No pending approvals at this time."
                    : "No pending approvals match this filter."}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredPending.map((req) => {
              const pendingDays = daysSince(req.appliedDate);
              return (
                <Card key={req.id} hover className="animate-fade-in">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3 sm:gap-4">
                      {canManageApprovals && (
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(req.id)}
                          onChange={() => toggleSelect(req.id)}
                          className="mt-1 rounded"
                          aria-label={`Select request from ${req.employeeName}`}
                        />
                      )}
                      <Avatar name={req.employeeName} size="md" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-bold text-[var(--foreground)]">
                            {req.employeeName}
                          </p>
                          <span className="text-xs text-[var(--muted-foreground)]">
                            ·
                          </span>
                          <span className="text-xs text-[var(--muted-foreground)]">
                            {req.department}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <LeaveTypeBadge type={req.leaveType} />
                          <span className="text-xs text-[var(--muted-foreground)]">
                            {formatDate(req.startDate)} →{" "}
                            {formatDate(req.endDate)} · {req.days} days
                          </span>
                        </div>
                        <p className="text-xs text-[var(--muted-foreground)] mt-2 line-clamp-1">
                          {req.reason}
                        </p>
                        <p className="text-[10px] text-[var(--muted-foreground)] mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" aria-hidden="true" />
                          Applied {formatDate(req.appliedDate)}
                          {pendingDays !== null && pendingDays > 0 && (
                            <span
                              className={
                                pendingDays >= 3
                                  ? "text-amber-600 dark:text-amber-400 font-medium"
                                  : ""
                              }
                            >
                              · {pendingDays}d pending
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openDetail(req)}
                            className="p-2 rounded-lg hover:bg-[var(--muted)] text-[var(--muted-foreground)] transition-colors text-xs border border-[var(--border)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                            aria-label={`View details for ${req.employeeName}`}
                          >
                            <Eye className="w-3.5 h-3.5 sm:hidden" />
                            <span className="hidden sm:inline">View</span>
                          </button>
                          {canManageApprovals && (
                            <>
                              <button
                                onClick={() =>
                                  setActionDialog({
                                    id: req.id,
                                    action: "approved",
                                  })
                                }
                                className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                                aria-label={`Approve request from ${req.employeeName}`}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() =>
                                  setActionDialog({
                                    id: req.id,
                                    action: "rejected",
                                  })
                                }
                                className="p-2 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 hover:bg-red-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                                aria-label={`Reject request from ${req.employeeName}`}
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        <div>
          <h2 className="text-base font-semibold text-[var(--foreground)] mb-4">
            Recent Decisions
          </h2>
          <Card>
            <CardContent className="p-4">
              {recent.length === 0 ? (
                <p className="text-sm text-[var(--muted-foreground)] text-center py-6">
                  No recent decisions yet.
                </p>
              ) : (
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-[var(--border)]" />
                  <div className="space-y-5">
                    {recent.map((req) => (
                      <div key={req.id} className="flex gap-4 relative">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 relative z-10 ${
                            req.status === "approved"
                              ? "bg-emerald-100 dark:bg-emerald-950/40"
                              : req.status === "cancelled"
                                ? "bg-slate-100 dark:bg-slate-800/40"
                                : "bg-red-100 dark:bg-red-950/40"
                          }`}
                        >
                          {req.status === "approved" ? (
                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                          ) : req.status === "cancelled" ? (
                            <Ban className="w-4 h-4 text-slate-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 pb-2">
                          <p className="text-sm font-semibold text-[var(--foreground)]">
                            {req.employeeName}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <LeaveTypeBadge type={req.leaveType} />
                            <StatusBadge status={req.status} size="sm" />
                          </div>
                          <p className="text-xs text-[var(--muted-foreground)] mt-1">
                            {req.days} days · {formatDate(req.startDate)}
                          </p>
                          {req.remarks && (
                            <div className="flex items-start gap-1.5 mt-1.5">
                              <MessageSquare className="w-3 h-3 text-[var(--muted-foreground)] mt-0.5 flex-shrink-0" />
                              <p className="text-xs text-[var(--muted-foreground)] italic">
                                "{req.remarks}"
                              </p>
                            </div>
                          )}
                          {req.rescheduledTo && (
                            <p className="text-xs text-blue-600 mt-1">
                              → Moved to{" "}
                              {formatDate(req.rescheduledTo.start_date)}
                              {req.rescheduledTo.end_date !==
                              req.rescheduledTo.start_date
                                ? ` – ${formatDate(req.rescheduledTo.end_date)}`
                                : ""}{" "}
                              ({req.rescheduledTo.request_number})
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {canManageApprovals && (
        <Dialog
          open={!!actionDialog}
          onClose={() => setActionDialog(null)}
          className="max-w-md"
        >
          <DialogHeader onClose={() => setActionDialog(null)}>
            <DialogTitle>
              {actionDialog?.action === "approved"
                ? "Approve Leave Request"
                : "Reject Leave Request"}
            </DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <p className="text-sm text-[var(--muted-foreground)]">
              {actionDialog?.action === "approved"
                ? "Are you sure you want to approve this leave request?"
                : "Please provide a reason for rejecting this request."}
            </p>
            <div>
              <label
                htmlFor="approval-remarks"
                className="text-sm font-medium text-[var(--foreground)] block mb-1.5"
              >
                Remarks{" "}
                {actionDialog?.action === "rejected" && (
                  <span className="text-red-500">*</span>
                )}
              </label>
              <textarea
                id="approval-remarks"
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder={
                  actionDialog?.action === "approved"
                    ? "Optional note to employee..."
                    : "Reason for rejection..."
                }
                className="w-full px-3 py-2.5 text-sm bg-[var(--background)] border border-[var(--border)] rounded-lg outline-none focus:ring-2 focus:ring-[var(--ring)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] resize-none"
              />
              {actionDialog?.action === "rejected" &&
                isRemarksEmpty(remarks) && (
                  <p className="text-xs text-red-500 mt-1">
                    A reason is required to reject a request.
                  </p>
                )}
            </div>
          </DialogBody>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setActionDialog(null)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              variant={
                actionDialog?.action === "approved" ? "success" : "destructive"
              }
              onClick={() =>
                handleAction(actionDialog?.id, actionDialog?.action)
              }
              disabled={
                submitting ||
                (actionDialog?.action === "rejected" && isRemarksEmpty(remarks))
              }
            >
              {submitting
                ? "Processing…"
                : actionDialog?.action === "approved"
                  ? "Approve"
                  : "Reject"}
            </Button>
          </DialogFooter>
        </Dialog>
      )}

      {selected && (
        <Dialog
          open={detailOpen}
          onClose={() => setDetailOpen(false)}
          className="max-w-lg"
        >
          <DialogHeader onClose={() => setDetailOpen(false)}>
            <DialogTitle>Leave Request Details</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-[var(--muted)]/50 rounded-xl">
              <Avatar name={selected.employeeName} size="lg" />
              <div>
                <p className="font-bold text-[var(--foreground)]">
                  {selected.employeeName}
                </p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {selected.department}
                </p>
              </div>
              <StatusBadge status={selected.status} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  label: "Leave Type",
                  value: <LeaveTypeBadge type={selected.leaveType} />,
                },
                { label: "Duration", value: `${selected.days} days` },
                { label: "From", value: formatDate(selected.startDate) },
                { label: "To", value: formatDate(selected.endDate) },
                {
                  label: "Applied On",
                  value: formatDate(selected.appliedDate),
                },
                { label: "Approver", value: selected.approverName },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-xs text-[var(--muted-foreground)] mb-1">
                    {item.label}
                  </p>
                  <div className="text-sm font-medium text-[var(--foreground)]">
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs text-[var(--muted-foreground)] mb-1">
                Reason
              </p>
              <p className="text-sm text-[var(--foreground)] bg-[var(--muted)] p-3 rounded-lg">
                {selected.reason}
              </p>
            </div>
          </DialogBody>
          <DialogFooter>
            {canManageApprovals && selected.status === "pending" && (
              <>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setActionDialog({ id: selected.id, action: "rejected" });
                    setDetailOpen(false);
                  }}
                >
                  <XCircle className="w-4 h-4" /> Reject
                </Button>
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => {
                    setActionDialog({ id: selected.id, action: "approved" });
                    setDetailOpen(false);
                  }}
                >
                  <CheckCircle className="w-4 h-4" /> Approve
                </Button>
              </>
            )}
            <Button variant="outline" onClick={() => setDetailOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </Dialog>
      )}
    </div>
  );
}

function isRemarksEmpty(remarks) {
  return !remarks || remarks.trim() === "";
}

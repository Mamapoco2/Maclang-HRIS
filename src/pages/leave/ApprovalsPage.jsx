import { useState } from "react";
import { PageHeader } from "./PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
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
import { LEAVE_REQUESTS } from "./mockData";
import { formatDate } from "./utils";
import {
  CheckCircle,
  XCircle,
  MessageSquare,
  Clock,
  Filter,
  CheckCheck,
} from "lucide-react";

export default function ApprovalsPage() {
  const { toast } = useToast();
  const [requests, setRequests] = useState(LEAVE_REQUESTS);
  const [selected, setSelected] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [actionDialog, setActionDialog] = useState(null); // {id, action}
  const [remarks, setRemarks] = useState("");
  const [detailOpen, setDetailOpen] = useState(false);

  const pending = requests.filter((r) => r.status === "pending");
  const recent = requests.filter((r) => r.status !== "pending").slice(0, 5);

  const handleAction = (id, action) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: action,
              remarks:
                remarks || (action === "approved" ? "Approved" : "Rejected"),
            }
          : r,
      ),
    );
    setActionDialog(null);
    setRemarks("");
    toast({
      title: action === "approved" ? "Request Approved" : "Request Rejected",
      description: `Leave request has been ${action} successfully.`,
      variant: action === "approved" ? "success" : "destructive",
    });
  };

  const handleBulkApprove = () => {
    if (!selectedIds.length) return;
    setRequests((prev) =>
      prev.map((r) =>
        selectedIds.includes(r.id) ? { ...r, status: "approved" } : r,
      ),
    );
    toast({
      title: `${selectedIds.length} Requests Approved`,
      description: "All selected requests have been approved.",
      variant: "success",
    });
    setSelectedIds([]);
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    setSelectedIds(
      selectedIds.length === pending.length ? [] : pending.map((r) => r.id),
    );
  };

  return (
    <div className="p-5">
      <PageHeader
        title="Approval Workflow"
        description="Review and manage leave request approvals"
        actions={
          selectedIds.length > 0 && (
            <Button onClick={handleBulkApprove} size="sm">
              <CheckCheck className="w-4 h-4" />
              Approve {selectedIds.length} Selected
            </Button>
          )
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Approvals */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-[var(--foreground)]">
              Pending Approvals
              <span className="ml-2 px-2 py-0.5 text-xs bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 rounded-full">
                {pending.length}
              </span>
            </h2>
            {pending.length > 0 && (
              <label className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedIds.length === pending.length}
                  onChange={toggleSelectAll}
                  className="rounded"
                />
                Select all
              </label>
            )}
          </div>

          {pending.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <p className="text-base font-semibold text-[var(--foreground)]">
                  All caught up!
                </p>
                <p className="text-sm text-[var(--muted-foreground)] mt-1">
                  No pending approvals at this time.
                </p>
              </CardContent>
            </Card>
          ) : (
            pending.map((req) => (
              <Card key={req.id} hover className="animate-fade-in">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(req.id)}
                      onChange={() => toggleSelect(req.id)}
                      className="mt-1 rounded"
                    />
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
                      <p className="text-[10px] text-[var(--muted-foreground)] mt-1">
                        Applied {formatDate(req.appliedDate)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setSelected(req);
                            setDetailOpen(true);
                          }}
                          className="p-2 rounded-lg hover:bg-[var(--muted)] text-[var(--muted-foreground)] transition-colors text-xs border border-[var(--border)]"
                          title="View Details"
                        >
                          View
                        </button>
                        <button
                          onClick={() =>
                            setActionDialog({ id: req.id, action: "approved" })
                          }
                          className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 transition-colors"
                          title="Approve"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            setActionDialog({ id: req.id, action: "rejected" })
                          }
                          className="p-2 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 hover:bg-red-100 transition-colors"
                          title="Reject"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Timeline / Recent */}
        <div>
          <h2 className="text-base font-semibold text-[var(--foreground)] mb-4">
            Recent Decisions
          </h2>
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-[var(--border)]" />
                <div className="space-y-5">
                  {recent.map((req) => (
                    <div key={req.id} className="flex gap-4 relative">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 relative z-10 ${
                          req.status === "approved"
                            ? "bg-emerald-100 dark:bg-emerald-950/40"
                            : "bg-red-100 dark:bg-red-950/40"
                        }`}
                      >
                        {req.status === "approved" ? (
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 pb-2">
                        <p className="text-sm font-semibold text-[var(--foreground)]">
                          {req.employeeName}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
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
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action Dialog */}
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
            <label className="text-sm font-medium text-[var(--foreground)] block mb-1.5">
              Remarks{" "}
              {actionDialog?.action === "rejected" && (
                <span className="text-red-500">*</span>
              )}
            </label>
            <textarea
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
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => setActionDialog(null)}>
            Cancel
          </Button>
          <Button
            variant={
              actionDialog?.action === "approved" ? "success" : "destructive"
            }
            onClick={() => handleAction(actionDialog?.id, actionDialog?.action)}
          >
            {actionDialog?.action === "approved" ? "Approve" : "Reject"}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Detail Drawer */}
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
            {selected.status === "pending" && (
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

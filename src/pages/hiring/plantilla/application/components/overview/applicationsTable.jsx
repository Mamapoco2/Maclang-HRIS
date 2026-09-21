import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { IconNotes } from "@tabler/icons-react";
import { toast } from "sonner";
import { plantillaPostingService } from "@/services/plantillaPostingService";
import { SummaryCard } from "./summaryCard";
import {
  candidateName,
  APPLICATION_STATUS_OPTIONS,
  APPLICATION_STATUS_BG,
  formatLabel,
  isBackwardStatusTransition,
} from "../psbUtils";

const IN_PROGRESS_STATUSES = [
  "Initial Review/Evaluation",
  "For Initial Deliberation",
  "Scheduled for Interview",
  "For HRMPSB Compliance",
  "For HRMPSB Deliberation",
];

function interviewBadgeClass(status) {
  const s = status?.toUpperCase() ?? "";
  if (!s) return "border-gray-200 bg-gray-50 text-gray-400";
  if (s.includes("COMPLETE"))
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (s.includes("REJECT") || s.includes("FAIL"))
    return "border-rose-200 bg-rose-50 text-rose-700";
  if (
    s.includes("PROGRESS") ||
    s.includes("SCHEDULE") ||
    s.includes("ONGOING")
  ) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }
  return "border-gray-200 bg-gray-50 text-gray-500";
}

export default function ApplicationsTable({
  applications,
  onUpdate,
  showSummary = true,
}) {
  const [remarksDraft, setRemarksDraft] = useState({});
  const [pendingChange, setPendingChange] = useState(null);
  const [reversalReason, setReversalReason] = useState("");
  const [savingChange, setSavingChange] = useState(false);

  const summary = {
    total: applications.length,
    pending: applications.filter((a) => a.status === "Pending").length,
    inProgress: applications.filter((a) =>
      IN_PROGRESS_STATUSES.includes(a.status),
    ).length,
    completed: applications.filter((a) => a.status === "Completed").length,
  };

  const applyStatusChange = async (application, status, reason = null) => {
    try {
      const updated = await plantillaPostingService.reviewApplication(
        application.id,
        { status, remarks: application.remarks ?? null, reason },
      );
      onUpdate(application.id, updated);
      toast.success("Application updated.");
      return true;
    } catch (err) {
      const message =
        err?.response?.data?.errors?.reason?.[0] ||
        err?.response?.data?.errors?.status?.[0] ||
        err?.response?.data?.message ||
        "Failed to update application.";
      toast.error(message);
      return false;
    }
  };

  const handleStatusChange = (application, status) => {
    if (status === application.status) return;

    setReversalReason("");
    setPendingChange({
      application,
      status,
      isBackward: isBackwardStatusTransition(application.status, status),
    });
  };

  const handleConfirmChange = async () => {
    if (!pendingChange) return;

    if (pendingChange.isBackward && !reversalReason.trim()) {
      toast.error("Please provide a reason for sending this back.");
      return;
    }

    setSavingChange(true);
    const ok = await applyStatusChange(
      pendingChange.application,
      pendingChange.status,
      pendingChange.isBackward ? reversalReason.trim() : null,
    );
    setSavingChange(false);

    if (ok) {
      setPendingChange(null);
      setReversalReason("");
    }
  };

  const handleSaveRemarks = async (application) => {
    const remarks = remarksDraft[application.id] ?? application.remarks ?? "";
    try {
      const updated = await plantillaPostingService.reviewApplication(
        application.id,
        { status: application.status, remarks },
      );
      onUpdate(application.id, updated);
      toast.success("Remarks saved.");
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Failed to save remarks.");
    }
  };

  return (
    <div className="grid gap-6">
      {showSummary && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <SummaryCard
            title="Total Applications"
            value={summary.total}
            status="All PSB applications"
          />
          <SummaryCard
            title="Pending"
            value={summary.pending}
            status="Awaiting initial review"
          />
          <SummaryCard
            title="In Progress"
            value={summary.inProgress}
            status="Somewhere in the review pipeline"
          />
          <SummaryCard
            title="Completed"
            value={summary.completed}
            status="Successfully completed"
          />
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Candidate</TableHead>
                <TableHead>Item No.</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Interview</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Remarks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-14 text-center text-sm text-gray-400"
                  >
                    No PSB applications found.
                  </TableCell>
                </TableRow>
              ) : (
                applications.map((application) => {
                  const canComplete =
                    application.interview?.overall_status?.toUpperCase() ===
                    "COMPLETED";
                  return (
                    <TableRow key={application.id}>
                      <TableCell className="font-medium">
                        {candidateName(application.employee)}
                      </TableCell>
                      <TableCell>
                        {application.posting?.base_item_number ?? "—"}
                      </TableCell>
                      <TableCell>{application.posting?.title ?? "—"}</TableCell>
                      <TableCell>
                        {application.submitted_at?.slice(0, 10) ?? "—"}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-block w-fit whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium ${interviewBadgeClass(application.interview?.overall_status)}`}
                        >
                          {formatLabel(application.interview?.overall_status) ||
                            "No interview"}
                        </span>
                      </TableCell>
                      <TableCell className="min-w-[13rem]">
                        <Select
                          value={application.status}
                          onValueChange={(val) =>
                            handleStatusChange(application, val)
                          }
                        >
                          <SelectTrigger className="h-7 w-fit min-w-[11rem] max-w-full border-0 p-0 text-xs shadow-none focus:ring-0">
                            <SelectValue>
                              <span
                                className={`inline-block whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium ${APPLICATION_STATUS_BG[application.status] ?? APPLICATION_STATUS_BG.Pending}`}
                              >
                                {application.status}
                              </span>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {APPLICATION_STATUS_OPTIONS.map((s) => (
                              <SelectItem
                                key={s}
                                value={s}
                                className="text-xs whitespace-nowrap"
                              >
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {application.status !== "Completed" && !canComplete && (
                          <p className="mt-1 text-[10px] text-gray-400">
                            Needs completed interview to mark as Completed
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 gap-1 px-2 text-xs"
                            >
                              <IconNotes size={13} />
                              {application.remarks ? "View" : "Add"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-72 p-3" align="start">
                            <Textarea
                              rows={3}
                              defaultValue={application.remarks ?? ""}
                              onChange={(e) =>
                                setRemarksDraft((d) => ({
                                  ...d,
                                  [application.id]: e.target.value,
                                }))
                              }
                              placeholder="Remarks for the employee"
                            />
                            <Button
                              size="sm"
                              className="mt-2 w-full"
                              onClick={() => handleSaveRemarks(application)}
                            >
                              Save remarks
                            </Button>
                          </PopoverContent>
                        </Popover>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog
        open={!!pendingChange}
        onOpenChange={(open) => {
          if (!open) {
            setPendingChange(null);
            setReversalReason("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pendingChange?.isBackward
                ? "Send application back a stage?"
                : "Confirm status change?"}
            </DialogTitle>
            <DialogDescription>
              {pendingChange && (
                <>
                  Moving{" "}
                  <span className="font-medium text-gray-700">
                    {candidateName(pendingChange.application.employee)}
                  </span>{" "}
                  from{" "}
                  <span className="font-medium text-gray-700">
                    {pendingChange.application.status}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium text-gray-700">
                    {pendingChange.status}
                  </span>
                  .
                  {pendingChange.isBackward
                    ? " This sends the application back to an earlier stage — please record why, for the PSB record."
                    : " Are you sure?"}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          {pendingChange?.isBackward && (
            <Textarea
              rows={3}
              value={reversalReason}
              onChange={(e) => setReversalReason(e.target.value)}
              placeholder="e.g. Deliberation found a missing eligibility document; sending back for initial review."
              autoFocus
            />
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setPendingChange(null);
                setReversalReason("");
              }}
              disabled={savingChange}
            >
              No
            </Button>
            <Button
              onClick={handleConfirmChange}
              disabled={
                savingChange ||
                (pendingChange?.isBackward && !reversalReason.trim())
              }
            >
              {savingChange ? "Saving..." : "Yes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

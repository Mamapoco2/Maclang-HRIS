import { useCallback, useEffect, useMemo, useState } from "react";
import {
  approveChangeOff,
  getChangeOffs,
  rejectChangeOff,
  requestChangeOff,
} from "@/services/scheduleService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { errorMessage, formatShift, formatWhen } from "./scheduleHelpers";

const BTN_PRIMARY = "bg-blue-600 text-white hover:bg-blue-700";

const SELECT_CLASS =
  "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

const TEXTAREA_CLASS =
  "w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

const STATUS_META = {
  pending: { label: "Pending", className: "border-amber-400 text-amber-700" },
  approved: {
    label: "Approved",
    className: "border-emerald-400 text-emerald-700",
  },
  rejected: { label: "Rejected", className: "border-red-400 text-red-700" },
};

const EMPTY_FORM = { employeeId: "", workDate: "", shiftId: "", reason: "" };

export default function ChangeOffPanel({
  data,
  month,
  year,
  hasUnsavedChanges,
  onApplied,
}) {
  const departmentId = data.department.id;
  const scheduleId = data.schedule?.id ?? null;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [dialogError, setDialogError] = useState("");
  const [requestOpen, setRequestOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [approveTarget, setApproveTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [remarks, setRemarks] = useState("");

  const load = useCallback(async () => {
    try {
      setItems(await getChangeOffs({ departmentId, month, year }));
      setError("");
    } catch (err) {
      console.error(err);
      setError(errorMessage(err, "Failed to load change-offs"));
    } finally {
      setLoading(false);
    }
  }, [departmentId, month, year]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  const shiftsById = useMemo(
    () => new Map(data.shifts.map((shift) => [shift.id, shift])),
    [data.shifts],
  );

  const currentShift = useMemo(() => {
    if (!form.employeeId || !form.workDate) return null;

    const entry = data.entries.find(
      (row) =>
        row.employee_id === Number(form.employeeId) &&
        row.work_date === form.workDate,
    );

    return entry ? (shiftsById.get(entry.shift_id) ?? null) : null;
  }, [data.entries, form.employeeId, form.workDate, shiftsById]);

  const selectableShifts = data.shifts.filter((shift) => shift.is_active);

  const openRequest = () => {
    setForm(EMPTY_FORM);
    setDialogError("");
    setRequestOpen(true);
  };

  const canSubmitRequest =
    form.employeeId && form.workDate && form.shiftId && form.reason.trim();

  const runAction = async (action, successMessage) => {
    setBusy(true);
    setDialogError("");
    try {
      await action();
      setNotice(successMessage);
      return true;
    } catch (err) {
      console.error(err);
      setDialogError(errorMessage(err, "Something went wrong."));
      return false;
    } finally {
      setBusy(false);
    }
  };

  const handleRequest = async () => {
    const ok = await runAction(
      () =>
        requestChangeOff(scheduleId, {
          employeeId: Number(form.employeeId),
          workDate: form.workDate,
          shiftId: Number(form.shiftId),
          reason: form.reason.trim(),
        }),
      "Change-off filed. Another head or scheduler needs to approve it.",
    );

    if (ok) {
      setRequestOpen(false);
      await load();
    }
  };

  const handleApprove = async () => {
    const ok = await runAction(
      () => approveChangeOff(approveTarget.id),
      "Change-off approved and applied to the schedule and DTR.",
    );

    if (ok) {
      setApproveTarget(null);
      await Promise.all([load(), onApplied()]);
    }
  };

  const handleReject = async () => {
    const ok = await runAction(
      () => rejectChangeOff(rejectTarget.id, remarks.trim()),
      "Change-off rejected.",
    );

    if (ok) {
      setRejectTarget(null);
      await load();
    }
  };

  return (
    <section className="flex flex-col gap-3 rounded-md border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4 className="text-base font-bold">Change-offs</h4>
          <p className="text-sm text-muted-foreground">
            Shift changes on an approved schedule. The department head or a
            scheduler approves them; HR can view them.
          </p>
        </div>
        {data.can_request_change_off && (
          <Button type="button" className={BTN_PRIMARY} onClick={openRequest}>
            File change-off
          </Button>
        )}
      </div>

      {notice && (
        <p role="status" className="text-sm font-semibold text-blue-700">
          {notice}
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading change-offs…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No change-offs for this cutoff.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Change</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Filed by</TableHead>
                <TableHead>Decided by</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const meta = STATUS_META[item.status] ?? STATUS_META.pending;

                return (
                  <TableRow key={item.id}>
                    <TableCell className="whitespace-nowrap">
                      {item.employee.name}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {item.work_date}
                    </TableCell>
                    <TableCell className="text-xs">
                      {formatShift(item.from_shift)}
                      <span aria-hidden="true"> → </span>
                      <span className="sr-only"> to </span>
                      {formatShift(item.to_shift)}
                    </TableCell>
                    <TableCell className="max-w-[220px] whitespace-normal text-xs">
                      {item.reason}
                      {item.decision_remarks && (
                        <span className="block text-red-700">
                          Rejected: {item.decision_remarks}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={meta.className}>
                        {meta.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                      {item.requested_by ?? "-"}
                      <span className="block text-muted-foreground">
                        {formatWhen(item.requested_at)}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs">
                      {item.decided_by ?? "-"}
                      <span className="block text-muted-foreground">
                        {formatWhen(item.decided_at)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {item.can_decide && (
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={busy}
                            onClick={() => {
                              setDialogError("");
                              setRemarks("");
                              setRejectTarget(item);
                            }}
                          >
                            Reject
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            className={BTN_PRIMARY}
                            disabled={busy || hasUnsavedChanges}
                            title={
                              hasUnsavedChanges
                                ? "Save or discard your schedule edits first"
                                : undefined
                            }
                            onClick={() => {
                              setDialogError("");
                              setApproveTarget(item);
                            }}
                          >
                            Approve
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog
        open={requestOpen}
        onOpenChange={(open) => {
          if (!busy) setRequestOpen(open);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>File change-off</DialogTitle>
            <DialogDescription>
              Someone else, not you, has to approve it. It only changes the
              schedule once approved.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <Label htmlFor="change-off-employee">Employee</Label>
              <select
                id="change-off-employee"
                className={SELECT_CLASS}
                value={form.employeeId}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, employeeId: e.target.value }))
                }
              >
                <option value="">Select employee</option>
                {data.staff.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="change-off-date">Date</Label>
              <Input
                id="change-off-date"
                type="date"
                min={data.period.start}
                max={data.period.end}
                value={form.workDate}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, workDate: e.target.value }))
                }
              />
              {form.employeeId && form.workDate && (
                <p className="text-xs text-muted-foreground">
                  Current shift: {formatShift(currentShift)}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="change-off-shift">New shift</Label>
              <select
                id="change-off-shift"
                className={SELECT_CLASS}
                value={form.shiftId}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, shiftId: e.target.value }))
                }
              >
                <option value="">Select shift</option>
                {selectableShifts.map((shift) => (
                  <option key={shift.id} value={shift.id}>
                    {formatShift(shift)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="change-off-reason">Reason</Label>
              <textarea
                id="change-off-reason"
                rows={3}
                maxLength={500}
                className={TEXTAREA_CLASS}
                value={form.reason}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, reason: e.target.value }))
                }
              />
            </div>

            {dialogError && (
              <p role="alert" className="text-sm text-red-600">
                {dialogError}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => setRequestOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className={BTN_PRIMARY}
              disabled={busy || !canSubmitRequest}
              onClick={handleRequest}
            >
              {busy ? "Filing…" : "File change-off"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={approveTarget !== null}
        onOpenChange={(open) => {
          if (!open && !busy) setApproveTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve this change-off?</AlertDialogTitle>
            <AlertDialogDescription>
              {approveTarget && (
                <>
                  {approveTarget.employee.name} on {approveTarget.work_date}:{" "}
                  {formatShift(approveTarget.from_shift)} to{" "}
                  {formatShift(approveTarget.to_shift)}. It applies to the
                  schedule and any existing DTR record right away, and HR does
                  not review it afterwards.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {dialogError && (
            <p role="alert" className="text-sm text-red-600">
              {dialogError}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={busy}
              onClick={(e) => {
                e.preventDefault();
                handleApprove();
              }}
            >
              Approve
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={rejectTarget !== null}
        onOpenChange={(open) => {
          if (!open && !busy) setRejectTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject change-off</DialogTitle>
            <DialogDescription>
              The schedule stays as it is. Tell the requester why.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="change-off-reject-remarks">Reason for rejecting</Label>
            <textarea
              id="change-off-reject-remarks"
              rows={3}
              maxLength={500}
              className={TEXTAREA_CLASS}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
            {dialogError && (
              <p role="alert" className="text-sm text-red-600">
                {dialogError}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => setRejectTarget(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className={BTN_PRIMARY}
              disabled={busy || !remarks.trim()}
              onClick={handleReject}
            >
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

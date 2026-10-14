import { useCallback, useEffect, useState } from "react";
import {
  assignScheduler,
  getSchedulers,
  removeScheduler,
} from "@/services/scheduleService";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
import { errorMessage } from "./scheduleHelpers";

const BTN_PRIMARY = "bg-blue-600 text-white hover:bg-blue-700";

const SELECT_CLASS =
  "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

export default function SchedulersPanel({ data }) {
  const departmentId = data.department.id;
  const headEmployeeId = data.department.head_employee_id;
  const canManage = data.can_manage_schedulers;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [employeeId, setEmployeeId] = useState("");
  const [removeTarget, setRemoveTarget] = useState(null);

  const load = useCallback(async () => {
    try {
      setItems(await getSchedulers(departmentId));
      setError("");
    } catch (err) {
      console.error(err);
      setError(errorMessage(err, "Failed to load schedulers"));
    } finally {
      setLoading(false);
    }
  }, [departmentId]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  const assignedIds = new Set(items.map((item) => item.employee.id));
  const candidates = data.staff.filter(
    (member) => member.id !== headEmployeeId && !assignedIds.has(member.id),
  );

  const handleAssign = async () => {
    setBusy(true);
    setError("");
    try {
      await assignScheduler({
        departmentId,
        employeeId: Number(employeeId),
      });
      setEmployeeId("");
      await load();
    } catch (err) {
      console.error(err);
      setError(errorMessage(err, "Failed to assign the scheduler"));
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async () => {
    setBusy(true);
    setError("");
    try {
      await removeScheduler(removeTarget.id);
      setRemoveTarget(null);
      await load();
    } catch (err) {
      console.error(err);
      setError(errorMessage(err, "Failed to remove the scheduler"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="flex flex-col gap-3 rounded-md border p-4">
      <div>
        <h4 className="text-base font-bold">Schedulers</h4>
        <p className="text-sm text-muted-foreground">
          Schedulers can edit, submit and approve change-offs for this
          department, like the head. They cannot approve their own.
        </p>
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading schedulers…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No schedulers assigned yet.
        </p>
      ) : (
        <ul className="flex flex-col divide-y rounded-md border">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
            >
              <span>
                <strong>{item.employee.name}</strong>
                <span className="block text-xs text-muted-foreground">
                  Since {item.started_at}
                  {item.assigned_by && <> · assigned by {item.assigned_by}</>}
                </span>
              </span>
              {canManage && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={() => setRemoveTarget(item)}
                >
                  Remove
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}

      {canManage && (
        <div className="flex flex-wrap items-end gap-2">
          <div className="flex min-w-[220px] flex-1 flex-col gap-1">
            <Label htmlFor="scheduler-employee">Add scheduler</Label>
            <select
              id="scheduler-employee"
              className={SELECT_CLASS}
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
            >
              <option value="">Select employee</option>
              {candidates.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>
          <Button
            type="button"
            className={BTN_PRIMARY}
            disabled={busy || !employeeId}
            onClick={handleAssign}
          >
            Add
          </Button>
        </div>
      )}

      <AlertDialog
        open={removeTarget !== null}
        onOpenChange={(open) => {
          if (!open && !busy) setRemoveTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this scheduler?</AlertDialogTitle>
            <AlertDialogDescription>
              {removeTarget?.employee.name} will no longer be able to edit this
              department&apos;s schedule or decide change-offs.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={busy}
              onClick={(e) => {
                e.preventDefault();
                handleRemove();
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

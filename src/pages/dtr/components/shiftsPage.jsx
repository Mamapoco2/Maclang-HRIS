import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  getShifts,
  createShift,
  updateShift,
  deleteShift,
} from "@/services/shiftService";
import DtrAuditLogSheet from "./DtrAuditLogSheet";
import { PermissionGate } from "@/components/PermissionGate";
import { PERMISSIONS } from "@/constants/permissions";
import { AuthContext } from "@/context/authContext";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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

const BTN_PRIMARY = "bg-blue-600 text-white hover:bg-blue-700";

const SELECT_CLASS =
  "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

const SHIFT_NAME_OPTIONS = [
  "Regular Shift",
  "Morning Shift",
  "Afternoon Shift",
  "Night Shift",
];

const GRACE_MINUTES = 15;

const EMPTY_FORM = {
  name: "",
  start_time: "",
  end_time: "",
  is_default: false,
  is_active: true,
};

function formatTime12h(value) {
  if (!value) return "";
  const match = String(value).match(/^(\d{1,2}):(\d{2})/);
  if (!match) return String(value);
  const hours = Number(match[1]);
  const suffix = hours >= 12 ? "PM" : "AM";
  return `${String(hours % 12 || 12).padStart(2, "0")}:${match[2]} ${suffix}`;
}

function formatRange(start, end) {
  return `${formatTime12h(start)} - ${formatTime12h(end)}`;
}

const SHARED_FILTER = "shared";

function departmentLabel(shift) {
  return shift.department?.name ?? "All departments";
}

function errorMessage(err, fallback) {
  const validation = err?.response?.data?.errors
    ? Object.values(err.response.data.errors)[0]?.[0]
    : null;
  return validation || err?.response?.data?.message || err?.message || fallback;
}

export default function ShiftsPage({ embedded = false, onChanged }) {
  const auth = useContext(AuthContext);
  const isAdmin = auth?.hasPermission(PERMISSIONS.DTR_MANAGE) ?? false;
  const [shifts, setShifts] = useState([]);
  const [headDepartments, setHeadDepartments] = useState([]);
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [auditOpen, setAuditOpen] = useState(false);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 3500);
    return () => clearTimeout(timer);
  }, [notice]);

  const loadShifts = useCallback(async () => {
    try {
      setError("");
      const result = await getShifts();
      setShifts(result.shifts);
      setHeadDepartments(result.departments);
    } catch (err) {
      console.error(err);
      setError(errorMessage(err, "Failed to load shifts"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadShifts();
  }, [loadShifts]);

  const departmentOptions = useMemo(() => {
    const byId = new Map();
    shifts.forEach((shift) => {
      if (shift.department) byId.set(shift.department.id, shift.department);
    });
    return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [shifts]);

  const visibleShifts = useMemo(() => {
    const filtered = shifts.filter((shift) => {
      if (!departmentFilter) return true;
      if (departmentFilter === SHARED_FILTER) return !shift.department;
      return String(shift.department?.id) === departmentFilter;
    });

    return filtered
      .map((shift, index) => ({ shift, index }))
      .sort((a, b) => {
        const nameA = a.shift.department?.name ?? "";
        const nameB = b.shift.department?.name ?? "";
        return nameA.localeCompare(nameB) || a.index - b.index;
      })
      .map(({ shift }) => shift);
  }, [shifts, departmentFilter]);

  const handleSave = async (id, values) => {
    if (id) {
      await updateShift(id, values);
      setNotice("Shift updated");
    } else {
      await createShift(values);
      setNotice("Shift added");
    }
    setEditing(null);
    setAdding(false);
    await loadShifts();
    onChanged?.();
  };

  const confirmDelete = async () => {
    try {
      await deleteShift(deleting.id);
      setDeleting(null);
      setDeleteError("");
      setNotice("Shift deleted");
      await loadShifts();
      onChanged?.();
    } catch (err) {
      setDeleteError(errorMessage(err, "Could not delete the shift."));
    }
  };

  return (
    <div
      className={`flex flex-col gap-10 text-foreground ${embedded ? "" : "p-4 md:p-7"}`}
    >
      <section>
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="mb-1.5 text-2xl font-bold tracking-tight">
              Shift types
            </h2>
            <p className="max-w-[60ch] text-sm leading-relaxed text-muted-foreground">
              {isAdmin
                ? "Shifts for all departments are added here. Shifts added by a department head are available only to that department and are listed under it. "
                : "Shifts for all departments are set by HR. A shift you add is available only to your department. "}
              Late, undertime and overtime on the DTR are computed against the
              scheduled shift. Dates without an approved schedule use the
              default shift.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 max-md:w-full">
            <PermissionGate permission={PERMISSIONS.DTR_AUDIT_VIEW}>
              <Button
                type="button"
                variant="outline"
                className="max-md:w-full"
                onClick={() => setAuditOpen(true)}
              >
                Audit log
              </Button>
              <DtrAuditLogSheet
                open={auditOpen}
                onOpenChange={setAuditOpen}
                scope="shift"
                title="Shift type audit log"
                description="Who added, edited or deleted shift types."
                searchPlaceholder="Shift name"
              />
            </PermissionGate>
            <Button
              type="button"
              className={`${BTN_PRIMARY} max-md:w-full`}
              onClick={() => setAdding(true)}
            >
              Add shift
            </Button>
          </div>
        </header>

        {isAdmin && departmentOptions.length > 0 && (
          <div className="mb-4 w-full sm:w-72">
            <Label htmlFor="shift-department-filter">Department</Label>
            <select
              id="shift-department-filter"
              className={SELECT_CLASS}
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="">All shifts</option>
              <option value={SHARED_FILTER}>All departments only</option>
              {departmentOptions.map((department) => (
                <option key={department.id} value={String(department.id)}>
                  {department.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {notice && (
          <p role="status" className="mb-4 text-sm font-semibold text-blue-700">
            {notice}
          </p>
        )}

        {loading && (
          <div className="py-4 text-muted-foreground">Loading shifts…</div>
        )}
        {error && (
          <div
            role="alert"
            className="my-3 rounded-md border border-red-300 px-4 py-3 text-sm text-red-600"
          >
            {error}
          </div>
        )}

        {!loading && !error && (
          <Table className="min-w-[760px]">
            <TableHeader>
              <TableRow className="border-b-2 border-blue-600 hover:bg-transparent">
                <TableHead className="text-blue-700">Name</TableHead>
                <TableHead className="text-blue-700">Department</TableHead>
                <TableHead className="text-blue-700">Hours</TableHead>
                <TableHead className="text-blue-700">Grace</TableHead>
                <TableHead className="text-blue-700">Scheduled days</TableHead>
                <TableHead className="text-blue-700">Status</TableHead>
                <TableHead className="text-right text-blue-700">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleShifts.map((shift) => (
                <TableRow key={shift.id} className="hover:bg-transparent">
                  <TableCell className="font-semibold">{shift.name}</TableCell>
                  <TableCell>{departmentLabel(shift)}</TableCell>
                  <TableCell className="whitespace-nowrap tabular-nums">
                    {formatRange(shift.start_time, shift.end_time)}
                    {shift.crosses_midnight && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        ends next day
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {shift.grace_minutes} min
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {shift.scheduled_count}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1.5">
                      {shift.is_default && (
                        <Badge
                          variant="outline"
                          className="border-blue-600 text-blue-700"
                        >
                          Default
                        </Badge>
                      )}
                      {!shift.is_active && (
                        <Badge
                          variant="outline"
                          className="border-amber-600 text-amber-700"
                        >
                          Inactive
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {shift.can_edit && (
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          size="sm"
                          className={BTN_PRIMARY}
                          onClick={() => setEditing(shift)}
                          aria-label={`Edit ${shift.name}`}
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setDeleteError("");
                            setDeleting(shift);
                          }}
                          aria-label={`Delete ${shift.name}`}
                        >
                          Delete
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}

              {visibleShifts.length === 0 && (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={7}>
                    <div className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
                      <strong className="text-base text-foreground">
                        No shifts yet
                      </strong>
                      <span>
                        Add a shift, then mark one as the default for dates
                        without an approved schedule.
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </section>

      {(adding || editing) && (
        <ShiftDialog
          isAdmin={isAdmin}
          shift={editing}
          shifts={shifts}
          departments={headDepartments}
          onClose={() => {
            setAdding(false);
            setEditing(null);
          }}
          onSave={handleSave}
        />
      )}

      <AlertDialog
        open={!!deleting}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this shift?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting?.name} will be removed. A shift that is already
              scheduled or used in attendance records cannot be deleted;
              deactivate it instead.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && (
            <p role="alert" className="text-sm text-red-600">
              {deleteError}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ShiftDialog({ isAdmin, shift, shifts, departments, onClose, onSave }) {
  const [form, setForm] = useState(
    shift
      ? {
          name: shift.name,
          start_time: shift.start_time,
          end_time: shift.end_time,
          is_default: shift.is_default,
          is_active: shift.is_active,
        }
      : { ...EMPTY_FORM, department_id: departments[0]?.id ?? "" },
  );
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const setField = (field) => (value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const submit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!form.name.trim()) return setErr("Shift name is required.");
    if (!form.start_time || !form.end_time) {
      return setErr("Start and end time are required.");
    }
    if (form.start_time === form.end_time) {
      return setErr("End time must be different from start time.");
    }
    if (form.is_default && !form.is_active) {
      return setErr("The default shift must be active.");
    }

    try {
      setSaving(true);
      await onSave(shift?.id ?? null, {
        name: form.name.trim(),
        start_time: form.start_time,
        end_time: form.end_time,
        is_default: form.is_default,
        is_active: form.is_active,
        ...(!isAdmin && !shift && form.department_id
          ? { department_id: Number(form.department_id) }
          : {}),
      });
    } catch (err2) {
      setErr(errorMessage(err2, "Could not save the shift. Try again."));
      setSaving(false);
    }
  };

  const scopeDepartmentId = shift?.department?.id ?? null;
  const takenNames = new Set(
    shifts
      .filter(
        (row) =>
          row.id !== shift?.id &&
          (scopeDepartmentId === null ||
            !row.department ||
            row.department.id === scopeDepartmentId),
      )
      .map((row) => row.name.trim().toLowerCase()),
  );
  const nameOptions = SHIFT_NAME_OPTIONS.filter(
    (name) => !takenNames.has(name.toLowerCase()),
  );
  if (shift && !nameOptions.includes(shift.name)) {
    nameOptions.unshift(shift.name);
  }

  const crossesMidnight =
    !!form.start_time && !!form.end_time && form.end_time < form.start_time;

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !saving) onClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <form onSubmit={submit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>{shift ? "Edit shift" : "Add shift"}</DialogTitle>
            <DialogDescription>
              Changes apply to new time ins. Existing attendance records keep
              the shift they were recorded with.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="shift-name">Name</Label>
            {isAdmin ? (
              <select
                id="shift-name"
                value={form.name}
                onChange={(e) => setField("name")(e.target.value)}
                className={SELECT_CLASS}
                autoFocus
                required
              >
                <option value="">Select shift name</option>
                {nameOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            ) : (
              <Input
                id="shift-name"
                value={form.name}
                maxLength={60}
                placeholder="e.g. Early Morning Shift"
                onChange={(e) => setField("name")(e.target.value)}
                autoFocus
                required
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="shift-start">Start</Label>
              <Input
                id="shift-start"
                type="time"
                value={form.start_time}
                onChange={(e) => setField("start_time")(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="shift-end">End</Label>
              <Input
                id="shift-end"
                type="time"
                value={form.end_time}
                onChange={(e) => setField("end_time")(e.target.value)}
                required
              />
              {crossesMidnight && (
                <span className="text-xs text-muted-foreground">
                  Ends the next day.
                </span>
              )}
            </div>
          </div>

          {!isAdmin && !shift && departments.length > 1 && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="shift-department">Department</Label>
              <select
                id="shift-department"
                value={form.department_id}
                onChange={(e) => setField("department_id")(e.target.value)}
                className={SELECT_CLASS}
                required
              >
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            {shift
              ? `Available to: ${departmentLabel(shift)}.`
              : isAdmin
                ? "Available to all departments."
                : departments.length === 1
                  ? `Available only to ${departments[0].name}.`
                  : "Available only to the selected department."}
          </p>

          <p className="text-xs text-muted-foreground">
            Grace period is {GRACE_MINUTES} minutes for all shifts. Arriving
            within it is not counted as late.
          </p>

          {isAdmin && (
            <div className="flex items-center gap-2">
              <Checkbox
                id="shift-default"
                checked={form.is_default}
                onCheckedChange={(checked) =>
                  setField("is_default")(checked === true)
                }
              />
              <Label htmlFor="shift-default">
                Default shift for dates without an approved schedule
              </Label>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Checkbox
              id="shift-active"
              checked={form.is_active}
              onCheckedChange={(checked) =>
                setField("is_active")(checked === true)
              }
            />
            <Label htmlFor="shift-active">Active</Label>
          </div>

          {err && (
            <p role="alert" className="text-sm text-red-600">
              {err}
            </p>
          )}

          <DialogFooter className="gap-2 max-sm:flex-col-reverse">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" className={BTN_PRIMARY} disabled={saving}>
              {saving ? "Saving…" : "Save shift"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
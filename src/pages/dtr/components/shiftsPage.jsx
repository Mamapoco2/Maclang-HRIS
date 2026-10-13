import { useCallback, useEffect, useState } from "react";
import {
  getShifts,
  createShift,
  updateShift,
  deleteShift,
  getShiftAssignments,
  assignShift,
} from "@/services/shiftService";
import { useDebounce } from "@/hooks/useDebounce";
import DtrAuditLogSheet from "./DtrAuditLogSheet";
import { PermissionGate } from "@/components/PermissionGate";
import { PERMISSIONS } from "@/constants/permissions";

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

const ASSIGNMENTS_PER_PAGE = 10;

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

function errorMessage(err, fallback) {
  const validation = err?.response?.data?.errors
    ? Object.values(err.response.data.errors)[0]?.[0]
    : null;
  return validation || err?.response?.data?.message || err?.message || fallback;
}

export default function ShiftsPage() {
  const [shifts, setShifts] = useState([]);
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
      setShifts(await getShifts());
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
  };

  const confirmDelete = async () => {
    try {
      await deleteShift(deleting.id);
      setDeleting(null);
      setDeleteError("");
      setNotice("Shift deleted");
      await loadShifts();
    } catch (err) {
      setDeleteError(errorMessage(err, "Could not delete the shift."));
    }
  };

  return (
    <div className="flex flex-col gap-10 p-4 text-foreground md:p-7">
      <section>
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="mb-1.5 text-2xl font-bold tracking-tight">
              Work shifts
            </h2>
            <p className="max-w-[60ch] text-sm leading-relaxed text-muted-foreground">
              Late, undertime and overtime on the DTR are computed against the
              shift an employee is assigned to. Employees without an assigned
              shift use the default shift.
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
                title="Work shift audit log"
                description="Who added, edited, deleted or assigned shifts."
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
                <TableHead className="text-blue-700">Hours</TableHead>
                <TableHead className="text-blue-700">Grace</TableHead>
                <TableHead className="text-blue-700">Employees</TableHead>
                <TableHead className="text-blue-700">Status</TableHead>
                <TableHead className="text-right text-blue-700">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shifts.map((shift) => (
                <TableRow key={shift.id} className="hover:bg-transparent">
                  <TableCell className="font-semibold">{shift.name}</TableCell>
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
                    {shift.employees_count}
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
                  </TableCell>
                </TableRow>
              ))}

              {shifts.length === 0 && (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={6}>
                    <div className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
                      <strong className="text-base text-foreground">
                        No shifts yet
                      </strong>
                      <span>
                        Add a shift, then mark one as the default for employees
                        without an assignment.
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </section>

      <AssignmentsSection
        shifts={shifts}
        onAssigned={(count) => {
          setNotice(`Updated ${count} employee${count === 1 ? "" : "s"}`);
          loadShifts();
        }}
      />

      {(adding || editing) && (
        <ShiftDialog
          shift={editing}
          shifts={shifts}
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
              assigned or used in attendance records cannot be deleted;
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

function ShiftDialog({ shift, shifts, onClose, onSave }) {
  const [form, setForm] = useState(
    shift
      ? {
          name: shift.name,
          start_time: shift.start_time,
          end_time: shift.end_time,
          is_default: shift.is_default,
          is_active: shift.is_active,
        }
      : EMPTY_FORM,
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
      });
    } catch (err2) {
      setErr(errorMessage(err2, "Could not save the shift. Try again."));
      setSaving(false);
    }
  };

  const takenNames = new Set(
    shifts
      .filter((row) => row.id !== shift?.id)
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

          <p className="text-xs text-muted-foreground">
            Grace period is {GRACE_MINUTES} minutes for all shifts. Arriving
            within it is not counted as late.
          </p>

          <div className="flex items-center gap-2">
            <Checkbox
              id="shift-default"
              checked={form.is_default}
              onCheckedChange={(checked) =>
                setField("is_default")(checked === true)
              }
            />
            <Label htmlFor="shift-default">
              Default shift for employees without an assignment
            </Label>
          </div>
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

function AssignmentsSection({ shifts, onAssigned }) {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(() => new Set());
  const [targetShift, setTargetShift] = useState("");
  const [shiftFilter, setShiftFilter] = useState("");
  const [sort, setSort] = useState({ column: "name", direction: "asc" });
  const [applying, setApplying] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const debouncedSearch = useDebounce(search.trim(), 400);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const result = await getShiftAssignments({
          q: debouncedSearch || undefined,
          shift: shiftFilter || undefined,
          sort: sort.column,
          direction: sort.direction,
          page,
          perPage: ASSIGNMENTS_PER_PAGE,
        });
        if (!active) return;
        setRows(result.rows);
        setLastPage(result.lastPage);
        setTotal(result.total);
      } catch (err) {
        console.error(err);
        if (active) setError(errorMessage(err, "Failed to load employees"));
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [debouncedSearch, shiftFilter, sort, page, refreshKey]);

  const changeShiftFilter = (value) => {
    setShiftFilter(value);
    setPage(1);
  };

  const toggleSort = (column) => {
    setSort((prev) => ({
      column,
      direction:
        prev.column === column && prev.direction === "asc" ? "desc" : "asc",
    }));
    setPage(1);
  };

  const allSelected = rows.length > 0 && rows.every((r) => selected.has(r.id));

  const toggleAll = (checked) => {
    setSelected((prev) => {
      const next = new Set(prev);
      rows.forEach((r) => (checked ? next.add(r.id) : next.delete(r.id)));
      return next;
    });
  };

  const toggleOne = (id, checked) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const apply = async () => {
    if (selected.size === 0) return;
    try {
      setApplying(true);
      setError("");
      const count = await assignShift(
        Array.from(selected),
        targetShift ? Number(targetShift) : null,
      );
      setSelected(new Set());
      setRefreshKey((k) => k + 1);
      onAssigned(count);
    } catch (err) {
      setError(errorMessage(err, "Could not update assignments."));
    } finally {
      setApplying(false);
    }
  };

  const activeShifts = shifts.filter((shift) => shift.is_active);

  return (
    <section>
      <header className="mb-4">
        <h2 className="mb-1.5 text-2xl font-bold tracking-tight">
          Employee assignments
        </h2>
        <p className="max-w-[60ch] text-sm leading-relaxed text-muted-foreground">
          Select employees, choose a shift and apply. Choose the default option
          to remove an assignment.
        </p>
      </header>

      <div className="mb-4 flex flex-wrap items-end gap-3 border-b pb-4">
        <div className="flex min-w-[220px] flex-1 flex-col gap-1.5">
          <Label htmlFor="assign-search">Employee</Label>
          <Input
            id="assign-search"
            type="search"
            placeholder="Search by name or employee number"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent"
          />
        </div>
        <div className="flex min-w-[220px] flex-col gap-1.5 max-md:flex-1">
          <Label htmlFor="assign-filter">Filter by shift</Label>
          <select
            id="assign-filter"
            value={shiftFilter}
            onChange={(e) => changeShiftFilter(e.target.value)}
            className={SELECT_CLASS}
          >
            <option value="">All shifts</option>
            <option value="none">No assigned shift (uses default)</option>
            {shifts.map((shift) => (
              <option key={shift.id} value={shift.id}>
                {shift.name}
                {shift.is_active ? "" : " (inactive)"}
              </option>
            ))}
          </select>
        </div>
        <div className="flex min-w-[220px] flex-col gap-1.5 max-md:flex-1">
          <Label htmlFor="assign-shift">Assign to shift</Label>
          <select
            id="assign-shift"
            value={targetShift}
            onChange={(e) => setTargetShift(e.target.value)}
            className={SELECT_CLASS}
          >
            <option value="">Use default shift</option>
            {activeShifts.map((shift) => (
              <option key={shift.id} value={shift.id}>
                {shift.name} ({formatRange(shift.start_time, shift.end_time)})
              </option>
            ))}
          </select>
        </div>
        <Button
          type="button"
          className={BTN_PRIMARY}
          disabled={applying || selected.size === 0}
          onClick={apply}
        >
          {applying ? "Applying…" : `Apply to ${selected.size} selected`}
        </Button>
      </div>

      {error && (
        <div
          role="alert"
          className="my-3 rounded-md border border-red-300 px-4 py-3 text-sm text-red-600"
        >
          {error}
        </div>
      )}

      {loading && (
        <div className="py-4 text-muted-foreground">Loading employees…</div>
      )}

      {!loading && (
        <>
          <Table className="min-w-[760px]">
            <TableHeader>
              <TableRow className="border-b-2 border-blue-600 hover:bg-transparent">
                <TableHead className="w-10">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={(checked) => toggleAll(checked === true)}
                    aria-label="Select all on this page"
                  />
                </TableHead>
                <SortableHead
                  column="employee_number"
                  sort={sort}
                  onSort={toggleSort}
                >
                  Employee no.
                </SortableHead>
                <SortableHead column="name" sort={sort} onSort={toggleSort}>
                  Name
                </SortableHead>
                <SortableHead
                  column="assigned_shift"
                  sort={sort}
                  onSort={toggleSort}
                >
                  Assigned shift
                </SortableHead>
                <TableHead className="text-blue-700">Applies</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-transparent">
                  <TableCell>
                    <Checkbox
                      checked={selected.has(row.id)}
                      onCheckedChange={(checked) =>
                        toggleOne(row.id, checked === true)
                      }
                      aria-label={`Select ${row.name}`}
                    />
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {row.employee_number}
                  </TableCell>
                  <TableCell className="font-semibold">{row.name}</TableCell>
                  <TableCell>
                    {row.assigned_shift ? (
                      row.assigned_shift.name
                    ) : (
                      <span className="text-muted-foreground">None</span>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {row.effective_shift ? (
                      <span className="tabular-nums">
                        {row.effective_shift.name} (
                        {formatRange(
                          row.effective_shift.start,
                          row.effective_shift.end,
                        )}
                        )
                        {row.uses_default && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            default
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">No shift</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}

              {rows.length === 0 && (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={5}>
                    <div className="py-10 text-center text-muted-foreground">
                      No employees found
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {total} employee{total === 1 ? "" : "s"}
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="tabular-nums">
                Page {page} of {lastPage}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page >= lastPage}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

function SortableHead({ column, sort, onSort, children }) {
  const active = sort.column === column;
  const ariaSort = active
    ? sort.direction === "asc"
      ? "ascending"
      : "descending"
    : "none";

  return (
    <TableHead className="text-blue-700" aria-sort={ariaSort}>
      <button
        type="button"
        onClick={() => onSort(column)}
        className="inline-flex items-center gap-1 hover:underline"
      >
        {children}
        <span aria-hidden="true" className={active ? "" : "opacity-40"}>
          {active ? (sort.direction === "asc" ? "\u2191" : "\u2193") : "\u2195"}
        </span>
      </button>
    </TableHead>
  );
}
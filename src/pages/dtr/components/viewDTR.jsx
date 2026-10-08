import { useEffect, useMemo, useState } from "react";
import {
  getAttendanceRecords,
  updateAttendanceRecord,
  createAttendanceRecord,
} from "@/services/attendanceService";
import AuthImage from "./AuthImage";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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

/* ---------- helpers ---------- */

function formatTime12h(value) {
  if (!value) return "";
  const match = String(value).match(/^(\d{1,2}):(\d{2})/);
  if (!match) return String(value);
  const hours = Number(match[1]);
  if (hours > 23) return String(value);
  const suffix = hours >= 12 ? "PM" : "AM";
  return `${String(hours % 12 || 12).padStart(2, "0")}:${match[2]} ${suffix}`;
}

// "2026-10-08" -> "Thu, Oct 8, 2026" (parsed manually to avoid timezone shifts)
function formatDate(value) {
  if (!value) return "-";
  const m = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return String(value);
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// "08:30:00" -> "08:30" for <input type="time">
const toTimeInput = (v) => (v ? String(v).slice(0, 5) : "");
const toDateInput = (v) => (v ? String(v).slice(0, 10) : "");

function initials(name = "") {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "?"
  );
}

// Only buttons get a background color.
const BTN_PRIMARY = "bg-blue-600 text-white hover:bg-blue-700";

// Table cell classes: normal table on desktop, stacked label/value rows on mobile.
const CELL =
  "max-md:flex max-md:items-center max-md:justify-between max-md:gap-3 max-md:px-0 max-md:py-2 max-md:text-right before:content-[attr(data-label)] before:text-xs before:font-semibold before:text-muted-foreground md:before:content-none";

/* ---------- main component ---------- */

export default function ViewDTR() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [editing, setEditing] = useState(null); // record being edited
  const [adding, setAdding] = useState(false); // add-record dialog open
  const [refreshKey, setRefreshKey] = useState(0); // bump to refetch the list
  const [notice, setNotice] = useState(""); // success message

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 3500);
    return () => clearTimeout(t);
  }, [notice]);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getAttendanceRecords({ from: dateFrom, to: dateTo });
        setRecords(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError(err?.message || "Failed to load attendance records");
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, [dateFrom, dateTo, refreshKey]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return records.filter((record) => {
      const matchesName = !q || (record.name || "").toLowerCase().includes(q);
      const recordDate = record.date ? new Date(record.date) : null;
      const fromDate = dateFrom ? new Date(dateFrom) : null;
      const toDate = dateTo ? new Date(dateTo) : null;
      if (toDate) toDate.setHours(23, 59, 59, 999);
      const matchesFrom = !fromDate || (recordDate && recordDate >= fromDate);
      const matchesTo = !toDate || (recordDate && recordDate <= toDate);
      return matchesName && matchesFrom && matchesTo;
    });
  }, [records, search, dateFrom, dateTo]);

  const hasFilters = search || dateFrom || dateTo;
  const clearFilters = () => {
    setSearch("");
    setDateFrom("");
    setDateTo("");
  };

  /* ---------- actions ---------- */

  const handleSave = async (id, values) => {
    // updateAttendanceRecord expects FormData (it adds _method=PUT itself).
    // Empty strings reach Laravel as null, which clears the time.
    const formData = new FormData();
    formData.append("date", values.date);
    formData.append("time_in", values.time_in || "");
    formData.append("time_out", values.time_out || "");

    const response = await updateAttendanceRecord(id, formData);
    const serverRecord =
      response?.data && typeof response.data === "object" ? response.data : {};

    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...values, ...serverRecord } : r)),
    );
    setEditing(null);
    setNotice("Attendance record updated");
  };

  const handleCreate = async (formData) => {
    await createAttendanceRecord(formData);
    setAdding(false);
    setRefreshKey((k) => k + 1); // refetch so photo flags and ids come from the server
    setNotice("Attendance record added");
  };

  /* ---------- render ---------- */

  return (
    <div className="p-4 text-foreground md:p-7">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="mb-1.5 text-2xl font-bold tracking-tight">
            Attendance records
          </h2>
          <p className="max-w-[56ch] text-sm leading-relaxed text-muted-foreground">
            Review daily time in and time out with photo proof. Edit an entry
            when something was logged wrong, or add one that was missed.
          </p>
        </div>
        <Button
          type="button"
          className={`${BTN_PRIMARY} max-md:w-full`}
          onClick={() => setAdding(true)}
        >
          Add attendance
        </Button>
      </header>

      {notice && (
        <p role="status" className="mb-4 text-sm font-semibold text-blue-700">
          {notice}
        </p>
      )}

      <div className="mb-2 flex flex-wrap items-end gap-3 border-b pb-4">
        <div className="flex min-w-[220px] flex-1 flex-col gap-1.5">
          <Label htmlFor="dtr-search">Employee</Label>
          <Input
            id="dtr-search"
            type="search"
            placeholder="Search by name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent"
          />
        </div>
        <div className="flex flex-col gap-1.5 max-md:flex-1">
          <Label htmlFor="dtr-from">From</Label>
          <Input
            id="dtr-from"
            type="date"
            value={dateFrom}
            max={dateTo || undefined}
            onChange={(e) => setDateFrom(e.target.value)}
            className="bg-transparent"
          />
        </div>
        <div className="flex flex-col gap-1.5 max-md:flex-1">
          <Label htmlFor="dtr-to">To</Label>
          <Input
            id="dtr-to"
            type="date"
            value={dateTo}
            min={dateFrom || undefined}
            onChange={(e) => setDateTo(e.target.value)}
            className="bg-transparent"
          />
        </div>
        {hasFilters && (
          <Button type="button" variant="ghost" onClick={clearFilters}>
            Clear filters
          </Button>
        )}
      </div>

      {loading && (
        <div className="py-4 text-muted-foreground">Loading records…</div>
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
        <Table className="min-w-[900px] max-md:block max-md:min-w-0">
          <TableHeader className="max-md:hidden">
            <TableRow className="border-b-2 border-blue-600 hover:bg-transparent">
              <TableHead className="text-blue-700">Employee</TableHead>
              <TableHead className="text-blue-700">Date</TableHead>
              <TableHead className="text-blue-700">Time in</TableHead>
              <TableHead className="text-blue-700">Time out</TableHead>
              <TableHead className="text-blue-700">Status</TableHead>
              <TableHead className="text-right text-blue-700">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="max-md:block">
            {filtered.map((record) => {
              const complete = record.time_in && record.time_out;
              return (
                <TableRow
                  key={record.id}
                  className="hover:bg-transparent max-md:block max-md:border-b-2 max-md:py-3"
                >
                  <TableCell data-label="Employee" className={CELL}>
                    <div className="flex items-center gap-2.5">
                      <span
                        aria-hidden="true"
                        className="grid size-9 shrink-0 place-items-center rounded-full border border-blue-600 text-xs font-bold text-blue-700"
                      >
                        {initials(record.name)}
                      </span>
                      <span className="font-semibold">{record.name}</span>
                    </div>
                  </TableCell>
                  <TableCell
                    data-label="Date"
                    className={`${CELL} whitespace-nowrap tabular-nums`}
                  >
                    {formatDate(record.date)}
                  </TableCell>
                  <TableCell data-label="Time in" className={CELL}>
                    <PunchCell
                      time={record.time_in}
                      hasImage={record.has_time_in_image}
                      id={record.id}
                      type="in"
                      alt={`${record.name} time in`}
                    />
                  </TableCell>
                  <TableCell data-label="Time out" className={CELL}>
                    <PunchCell
                      time={record.time_out}
                      hasImage={record.has_time_out_image}
                      id={record.id}
                      type="out"
                      alt={`${record.name} time out`}
                    />
                  </TableCell>
                  <TableCell data-label="Status" className={CELL}>
                    <Badge
                      variant="outline"
                      className={
                        complete
                          ? "border-blue-600 text-blue-700"
                          : "border-amber-600 text-amber-700"
                      }
                    >
                      {complete
                        ? "Complete"
                        : record.time_in
                          ? "No time out"
                          : "No time in"}
                    </Badge>
                  </TableCell>
                  <TableCell
                    data-label="Actions"
                    className="text-right max-md:block max-md:px-0 max-md:pt-3 max-md:text-left"
                  >
                    <Button
                      type="button"
                      size="sm"
                      className={`${BTN_PRIMARY} max-md:h-10 max-md:w-full`}
                      onClick={() => setEditing(record)}
                      aria-label={`Edit record for ${record.name}`}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}

            {filtered.length === 0 && (
              <TableRow className="hover:bg-transparent max-md:block">
                <TableCell colSpan={6} className="max-md:block">
                  <div className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
                    <strong className="text-base text-foreground">
                      No attendance records found
                    </strong>
                    <span>
                      {hasFilters
                        ? "Try a different name or widen the date range."
                        : "Records will show up here once employees time in."}
                    </span>
                    {hasFilters && (
                      <Button
                        type="button"
                        variant="outline"
                        className="mt-2"
                        onClick={clearFilters}
                      >
                        Clear filters
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      {editing && (
        <EditDialog
          record={editing}
          onClose={() => setEditing(null)}
          onSave={handleSave}
        />
      )}

      {adding && (
        <AddDialog onClose={() => setAdding(false)} onCreate={handleCreate} />
      )}
    </div>
  );
}

/* ---------- time + photo cell ---------- */

function PunchCell({ time, hasImage, id, type, alt }) {
  return (
    <div className="flex items-center gap-3">
      {hasImage ? (
        <AuthImage
          attendanceId={id}
          type={type}
          alt={alt}
          style={PHOTO_STYLE}
        />
      ) : (
        <span className="grid size-14 shrink-0 place-items-center rounded-[10px] border border-dashed p-1 text-center text-[11px] leading-tight text-muted-foreground">
          No photo
        </span>
      )}
      <span className="whitespace-nowrap font-semibold tabular-nums">
        {formatTime12h(time) || "-"}
      </span>
    </div>
  );
}

/* ---------- edit dialog ---------- */

function EditDialog({ record, onClose, onSave }) {
  const [date, setDate] = useState(toDateInput(record.date));
  const [timeIn, setTimeIn] = useState(toTimeInput(record.time_in));
  const [timeOut, setTimeOut] = useState(toTimeInput(record.time_out));
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const changed =
    date !== toDateInput(record.date) ||
    timeIn !== toTimeInput(record.time_in) ||
    timeOut !== toTimeInput(record.time_out);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!date) return setErr("Choose a date.");
    if (!timeIn && !timeOut)
      return setErr("Enter at least a time in or a time out.");
    if (timeIn && timeOut && timeOut <= timeIn) {
      return setErr("Time out must be later than time in.");
    }
    try {
      setSaving(true);
      await onSave(record.id, {
        date,
        time_in: timeIn || null,
        time_out: timeOut || null,
      });
    } catch (e2) {
      setErr(e2?.message || "Could not save changes. Try again.");
      setSaving(false);
    }
  };

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
            <DialogTitle>Edit attendance record</DialogTitle>
            <DialogDescription>{record.name}</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-date">Date</Label>
            <Input
              id="edit-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-in">Time in</Label>
              <Input
                id="edit-in"
                type="time"
                value={timeIn}
                onChange={(e) => setTimeIn(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-out">Time out</Label>
              <Input
                id="edit-out"
                type="time"
                value={timeOut}
                onChange={(e) => setTimeOut(e.target.value)}
              />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Photos stay attached to this record. Clear a time to remove it.
          </p>
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
            <Button
              type="submit"
              className={BTN_PRIMARY}
              disabled={saving || !changed}
            >
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- add dialog ---------- */

function AddDialog({ onClose, onCreate }) {
  const [employeeNumber, setEmployeeNumber] = useState("");
  const [date, setDate] = useState(new Date().toLocaleDateString("en-CA")); // YYYY-MM-DD, local
  const [timeIn, setTimeIn] = useState("");
  const [timeOut, setTimeOut] = useState("");
  const [timeInImage, setTimeInImage] = useState(null);
  const [timeOutImage, setTimeOutImage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!employeeNumber.trim()) return setErr("Enter the employee number.");
    if (!date) return setErr("Choose a date.");
    if (!timeIn && !timeOut)
      return setErr("Enter at least a time in or a time out.");
    if (timeIn && timeOut && timeOut <= timeIn) {
      return setErr("Time out must be later than time in.");
    }

    const formData = new FormData();
    formData.append("employee_number", employeeNumber.trim());
    formData.append("date", date);
    if (timeIn) formData.append("time_in", timeIn);
    if (timeOut) formData.append("time_out", timeOut);
    if (timeInImage) formData.append("time_in_image", timeInImage);
    if (timeOutImage) formData.append("time_out_image", timeOutImage);

    try {
      setSaving(true);
      await onCreate(formData);
    } catch (e2) {
      const firstValidation = e2?.response?.data?.errors
        ? Object.values(e2.response.data.errors)[0]?.[0]
        : null;
      setErr(
        firstValidation ||
          e2?.response?.data?.message ||
          e2?.message ||
          "Could not add the record. Try again.",
      );
      setSaving(false);
    }
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !saving) onClose();
      }}
    >
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-md">
        <form onSubmit={submit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Add attendance record</DialogTitle>
            <DialogDescription>
              Use this for an entry that was missed at the kiosk.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="add-emp">Employee number</Label>
            <Input
              id="add-emp"
              type="text"
              value={employeeNumber}
              onChange={(e) => setEmployeeNumber(e.target.value)}
              autoFocus
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="add-date">Date</Label>
            <Input
              id="add-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="add-in">Time in</Label>
              <Input
                id="add-in"
                type="time"
                value={timeIn}
                onChange={(e) => setTimeIn(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="add-out">Time out</Label>
              <Input
                id="add-out"
                type="time"
                value={timeOut}
                onChange={(e) => setTimeOut(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="add-in-img">Time in photo (optional)</Label>
              <Input
                id="add-in-img"
                type="file"
                accept="image/*"
                onChange={(e) => setTimeInImage(e.target.files?.[0] || null)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="add-out-img">Time out photo (optional)</Label>
              <Input
                id="add-out-img"
                type="file"
                accept="image/*"
                onChange={(e) => setTimeOutImage(e.target.files?.[0] || null)}
              />
            </div>
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
              {saving ? "Adding…" : "Add record"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- AuthImage style ---------- */

const PHOTO_STYLE = {
  width: 56,
  height: 56,
  objectFit: "cover",
  borderRadius: 10,
  flexShrink: 0,
};

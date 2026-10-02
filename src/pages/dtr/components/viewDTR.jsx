import { useEffect, useState } from "react";
import {
  getAttendanceRecords,
  createAttendanceRecord,
  updateAttendanceRecord,
} from "@/services/attendanceService";
import { useAuthenticatedImage } from "@/hooks/useAuthenticatedImage";
import { useDebounce } from "@/hooks/useDebounce";

export default function ViewDTR() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // null = closed, {} = add, record = edit
  const [formRecord, setFormRecord] = useState(null);
  const [toast, setToast] = useState("");

  const debouncedSearch = useDebounce(search.trim(), 400);

  useEffect(() => {
    let isMounted = true;

    const fetchRecords = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getAttendanceRecords({
          from: dateFrom || undefined,
          to: dateTo || undefined,
          q: debouncedSearch || undefined,
        });
        if (isMounted) setRecords(data);
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setError(
            err?.response?.data?.message || "Failed to load attendance records",
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchRecords();

    return () => {
      isMounted = false;
    };
  }, [debouncedSearch, dateFrom, dateTo, refreshKey]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const hasActiveFilters = search || dateFrom || dateTo;

  const clearFilters = () => {
    setSearch("");
    setDateFrom("");
    setDateTo("");
  };

  const handleSaved = (message) => {
    setFormRecord(null);
    setToast(message);
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-screen">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
              Attendance Records
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Time in / time out with separate employee photos
            </p>
          </div>
          <button
            type="button"
            onClick={() => setFormRecord({})}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add attendance
          </button>
        </div>

        {/* Filters */}
        <div className="mb-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:flex-wrap">
            <div className="flex-1 min-w-[220px]">
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Search employee
              </label>
              <div className="relative">
                <svg
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            <div className="min-w-[160px]">
              <label className="mb-1 block text-xs font-medium text-slate-600">
                From
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div className="min-w-[160px]">
              <label className="mb-1 block text-xs font-medium text-slate-600">
                To
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 active:bg-slate-100"
              >
                Clear filters
              </button>
            )}
          </div>

          {!loading && !error && (
            <p className="mt-3 text-xs text-slate-500">
              Showing{" "}
              <span className="font-medium text-slate-700">
                {records.length}
              </span>{" "}
              records
            </p>
          )}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="rounded-xl border border-slate-200 bg-white p-10 shadow-sm">
            <div className="flex flex-col items-center justify-center gap-3 text-slate-500">
              <Spinner className="h-6 w-6 text-indigo-500" />
              <span className="text-sm">Loading records...</span>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm">
            <svg
              className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Table */}
        {!loading && !error && (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1060px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    {[
                      "Name",
                      "Date",
                      "Time In",
                      "Time In Photo",
                      "Time Out",
                      "Time Out Photo",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500"
                      >
                        {h}
                      </th>
                    ))}
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {records.map((record) => (
                    <tr
                      key={record.id}
                      className="transition-colors hover:bg-slate-50"
                    >
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-800">
                        {record.name}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                        {record.date}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm">
                        <TimeBadge value={record.time_in} tone="in" />
                      </td>
                      <td className="px-4 py-3">
                        <PhotoThumb
                          attendanceId={record.id}
                          type="in"
                          available={record.has_time_in_image}
                          alt={`${record.name} time in`}
                          onPreview={(src) =>
                            setPreviewImage({
                              src,
                              label: `${record.name} — Time In (${record.date})`,
                            })
                          }
                        />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm">
                        <TimeBadge value={record.time_out} tone="out" />
                      </td>
                      <td className="px-4 py-3">
                        <PhotoThumb
                          attendanceId={record.id}
                          type="out"
                          available={record.has_time_out_image}
                          alt={`${record.name} time out`}
                          onPreview={(src) =>
                            setPreviewImage({
                              src,
                              label: `${record.name} — Time Out (${record.date})`,
                            })
                          }
                        />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => setFormRecord(record)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        >
                          <svg
                            className="h-3.5 w-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"
                            />
                          </svg>
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}

                  {records.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-12">
                        <div className="flex flex-col items-center justify-center gap-2 text-center">
                          <svg
                            className="h-10 w-10 text-slate-300"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          <p className="text-sm font-medium text-slate-500">
                            No attendance records found
                          </p>
                          <p className="text-xs text-slate-400">
                            Try adjusting your filters, or add a new record
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit modal */}
      {formRecord && (
        <AttendanceFormModal
          record={formRecord}
          onClose={() => setFormRecord(null)}
          onSaved={handleSaved}
        />
      )}

      {/* Image preview modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="max-w-lg overflow-hidden rounded-xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={previewImage.src}
              alt={previewImage.label}
              className="max-h-[70vh] w-full object-contain bg-slate-100"
            />
            <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">
              <span className="text-sm text-slate-600">
                {previewImage.label}
              </span>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-[60] rounded-lg bg-slate-900 px-4 py-2.5 text-sm text-white shadow-lg"
        >
          {toast}
        </div>
      )}
    </div>
  );
}

/* ---------- Add / Edit form ---------- */

function toTimeInput(value) {
  if (!value) return "";
  const match = String(value).match(/^(\d{1,2}):(\d{2})/);
  return match ? `${match[1].padStart(2, "0")}:${match[2]}` : "";
}

function AttendanceFormModal({ record, onClose, onSaved }) {
  const isEdit = Boolean(record?.id);

  const [form, setForm] = useState({
    name: record?.name || "",
    date: record?.date || new Date().toISOString().slice(0, 10),
    time_in: toTimeInput(record?.time_in),
    time_out: toTimeInput(record?.time_out),
  });
  const [timeInFile, setTimeInFile] = useState(null);
  const [timeOutFile, setTimeOutFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && !saving && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, saving]);

  const setField = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async () => {
    setFormError("");

    if (!form.name.trim()) return setFormError("Enter the employee's name.");
    if (!form.date) return setFormError("Choose a date.");
    if (!form.time_in && !form.time_out)
      return setFormError("Enter a time in or a time out.");
    if (form.time_in && form.time_out && form.time_out < form.time_in)
      return setFormError("Time out must be later than time in.");

    const payload = new FormData();
    payload.append("name", form.name.trim());
    payload.append("date", form.date);
    payload.append("time_in", form.time_in);
    payload.append("time_out", form.time_out);
    if (timeInFile) payload.append("time_in_image", timeInFile);
    if (timeOutFile) payload.append("time_out_image", timeOutFile);

    try {
      setSaving(true);
      if (isEdit) {
        await updateAttendanceRecord(record.id, payload);
        onSaved("Attendance updated");
      } else {
        await createAttendanceRecord(payload);
        onSaved("Attendance added");
      }
    } catch (err) {
      console.error(err);
      setFormError(
        err?.response?.data?.message ||
          `Failed to ${isEdit ? "update" : "add"} attendance`,
      );
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4"
      onClick={() => !saving && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="attendance-form-title"
        className="w-full max-w-lg rounded-xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-slate-100 px-5 py-4">
          <h3
            id="attendance-form-title"
            className="text-lg font-semibold text-slate-900"
          >
            {isEdit ? "Edit attendance" : "Add attendance"}
          </h3>
          <p className="mt-0.5 text-sm text-slate-500">
            {isEdit
              ? "Update the times or replace a photo."
              : "Record a time in and time out for an employee."}
          </p>
        </div>

        <div className="space-y-4 px-5 py-4">
          <Field label="Employee name">
            <input
              type="text"
              value={form.name}
              onChange={setField("name")}
              placeholder="e.g. Juan Dela Cruz"
              className={inputClass}
              autoFocus
            />
          </Field>

          <Field label="Date">
            <input
              type="date"
              value={form.date}
              onChange={setField("date")}
              className={inputClass}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-3">
              <Field label="Time in">
                <input
                  type="time"
                  value={form.time_in}
                  onChange={setField("time_in")}
                  className={inputClass}
                />
              </Field>
              <PhotoField
                label="Time in photo"
                file={timeInFile}
                onChange={setTimeInFile}
                existingUrlPath={
                  isEdit && record.has_time_in_image
                    ? `/dtr/attendances/${record.id}/image/in`
                    : null
                }
              />
            </div>

            <div className="space-y-3">
              <Field label="Time out">
                <input
                  type="time"
                  value={form.time_out}
                  onChange={setField("time_out")}
                  className={inputClass}
                />
              </Field>
              <PhotoField
                label="Time out photo"
                file={timeOutFile}
                onChange={setTimeOutFile}
                existingUrlPath={
                  isEdit && record.has_time_out_image
                    ? `/dtr/attendances/${record.id}/image/out`
                    : null
                }
              />
            </div>
          </div>

          {formError && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {formError}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {saving && <Spinner className="h-4 w-4 text-white" />}
            {saving ? "Saving..." : isEdit ? "Save changes" : "Add attendance"}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100";

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-600">
        {label}
      </label>
      {children}
    </div>
  );
}

function PhotoField({ label, file, onChange, existingUrlPath }) {
  const { url: existingSrc } = useAuthenticatedImage(existingUrlPath);
  const [localSrc, setLocalSrc] = useState(null);

  useEffect(() => {
    if (!file) {
      setLocalSrc(null);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setLocalSrc(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const shown = localSrc || existingSrc;

  return (
    <div>
      <span className="mb-1 block text-xs font-medium text-slate-600">
        {label}
      </span>
      <div className="flex items-center gap-3">
        {shown ? (
          <img
            src={shown}
            alt={label}
            className="h-16 w-16 rounded-lg border border-slate-200 object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-[10px] text-slate-400">
            No image
          </div>
        )}
        <label className="cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 focus-within:ring-2 focus-within:ring-indigo-200">
          {shown ? "Replace" : "Upload"}
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => onChange(e.target.files?.[0] || null)}
          />
        </label>
      </div>
    </div>
  );
}

function Spinner({ className }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}

/* ---------- Existing helpers ---------- */

function formatTime12h(value) {
  if (!value) return "";
  const match = String(value).match(/^(\d{1,2}):(\d{2})/);
  if (!match) return String(value);
  const hours = Number(match[1]);
  if (hours > 23) return String(value);
  const suffix = hours >= 12 ? "PM" : "AM";
  return `${String(hours % 12 || 12).padStart(2, "0")}:${match[2]} ${suffix}`;
}

function TimeBadge({ value, tone }) {
  if (!value) {
    return <span className="text-slate-400">—</span>;
  }

  const toneClasses =
    tone === "in"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
      : "bg-amber-50 text-amber-700 ring-amber-600/20";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${toneClasses}`}
    >
      {formatTime12h(value)}
    </span>
  );
}

function PhotoThumb({ attendanceId, type, available, alt, onPreview }) {
  const { url: src, loading } = useAuthenticatedImage(
    available ? `/dtr/attendances/${attendanceId}/image/${type}` : null,
  );

  if (!available || (!loading && !src)) {
    return (
      <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-[10px] text-slate-400">
        No image
      </div>
    );
  }

  if (loading) {
    return <div className="h-16 w-16 animate-pulse rounded-lg bg-slate-100" />;
  }

  return (
    <button
      type="button"
      onClick={() => onPreview(src)}
      className="group relative h-16 w-16 overflow-hidden rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
    >
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
      />
      <span className="absolute inset-0 hidden items-center justify-center bg-black/30 text-[10px] font-medium text-white group-hover:flex">
        View
      </span>
    </button>
  );
}

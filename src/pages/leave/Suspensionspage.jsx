import { useState, useEffect, useCallback } from "react";
import { PageHeader } from "./PageHeader";
import { Card } from "@/components/ui/Card";
import LeaveApi from "@/services/leaveApiService";
import { formatDate } from "./utils";
import { IconLoader2, IconAlertTriangle } from "@tabler/icons-react";

export default function SuspensionsPage() {
  const [suspensions, setSuspensions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    LeaveApi.listSuspensions()
      .then((data) => setSuspensions(data ?? []))
      .catch((err) =>
        setError(
          err?.response?.data?.message || "Failed to load work suspensions.",
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function handleSubmit(e) {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    if (!startDate || !endDate) {
      setFormError("Please pick both a start and end date.");
      return;
    }
    if (endDate < startDate) {
      setFormError("End date can't be before the start date.");
      return;
    }
    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      setFormError("Please provide a reason for the suspension.");
      return;
    }

    setSubmitting(true);
    LeaveApi.declareSuspension({ startDate, endDate, reason: trimmedReason })
      .then((res) => {
        setSuccessMessage(res?.message ?? "Suspension declared.");
        setStartDate("");
        setEndDate("");
        setReason("");
        load();
      })
      .catch((err) => {
        setFormError(
          err?.response?.data?.message || "Failed to declare suspension.",
        );
      })
      .finally(() => setSubmitting(false));
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="Work Suspensions"
        description="Declare a suspension (weather, holiday, etc.) and notify employees whose approved leave overlaps it."
      />

      <Card className="p-5">
        <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">
          Declare a new suspension
        </h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">
                Start date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">
                End date
              </label>
              <input
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">
              Reason
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Class and work suspension due to Typhoon..."
              rows={3}
              className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            />
          </div>

          {formError && (
            <p className="flex items-center gap-1.5 text-sm text-red-600">
              <IconAlertTriangle size={16} /> {formError}
            </p>
          )}
          {successMessage && (
            <p className="text-sm text-emerald-600">{successMessage}</p>
          )}

          <div>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-[#16324A] text-white hover:bg-[#16324A]/90 transition-colors disabled:opacity-50"
            >
              {submitting ? "Declaring…" : "Declare suspension & notify"}
            </button>
          </div>
        </form>
      </Card>

      <Card className="p-5">
        <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">
          Past suspensions
        </h3>

        {loading ? (
          <div className="flex items-center justify-center py-10 text-[var(--muted-foreground)]">
            <IconLoader2 size={18} className="mr-2 animate-spin" /> Loading…
          </div>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : suspensions.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)]">
            No suspensions have been declared yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-[var(--muted-foreground)] border-b border-[var(--border)]">
                  <th className="py-2 pr-4">Dates</th>
                  <th className="py-2 pr-4">Reason</th>
                  <th className="py-2 pr-4">Employees notified</th>
                  <th className="py-2 pr-4">Declared by</th>
                </tr>
              </thead>
              <tbody>
                {suspensions.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-[var(--border)] last:border-0"
                  >
                    <td className="py-2 pr-4 whitespace-nowrap">
                      {formatDate(s.start_date)}
                      {s.end_date !== s.start_date &&
                        ` – ${formatDate(s.end_date)}`}
                    </td>
                    <td className="py-2 pr-4 max-w-[320px] truncate">
                      {s.reason}
                    </td>
                    <td className="py-2 pr-4">
                      {s.affected_leave_requests_count}
                    </td>
                    <td className="py-2 pr-4 text-[var(--muted-foreground)]">
                      {s.created_by?.username ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

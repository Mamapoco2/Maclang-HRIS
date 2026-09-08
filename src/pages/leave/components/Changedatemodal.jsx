import { useState } from "react";

export function ChangeDateModal({ request, onClose, onSave, submitting }) {
  const [startDate, setStartDate] = useState(request?.startDate ?? "");
  const [endDate, setEndDate] = useState(request?.endDate ?? "");
  const [reason, setReason] = useState("");
  const [error, setError] = useState(null);

  function handleSubmit(e) {
    e.preventDefault();

    if (!startDate || !endDate) {
      setError("Please pick both a start and end date.");
      return;
    }
    if (endDate < startDate) {
      setError("End date can't be before the start date.");
      return;
    }
    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      setError("Please provide a reason for changing the date.");
      return;
    }

    onSave({ startDate, endDate, reason: trimmedReason });
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--card)",
          borderRadius: 14,
          border: "1px solid var(--border)",
          width: "100%",
          maxWidth: 420,
          padding: 20,
          boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
        }}
      >
        <p
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: "var(--foreground)",
            margin: "0 0 2px",
          }}
        >
          Change leave date
        </p>
        <p
          style={{
            fontSize: 12,
            color: "var(--muted-foreground)",
            margin: "0 0 4px",
          }}
        >
          {request?.leaveType}
          {request?.startDate ? ` · Currently ${request.startDate}` : ""}
          {request?.endDate && request?.endDate !== request?.startDate
            ? ` – ${request.endDate}`
            : ""}
        </p>
        <p
          style={{
            fontSize: 11,
            color: "var(--muted-foreground)",
            margin: "0 0 16px",
            fontStyle: "italic",
          }}
        >
          This cancels the current request and files a new one with the dates
          below. The new request will need approval again.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <div style={{ flex: 1 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--muted-foreground)",
                  marginBottom: 4,
                }}
              >
                New start date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (error) setError(null);
                }}
                className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div style={{ flex: 1 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--muted-foreground)",
                  marginBottom: 4,
                }}
              >
                New end date
              </label>
              <input
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  if (error) setError(null);
                }}
                className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          <label
            style={{
              display: "block",
              fontSize: 11,
              fontWeight: 600,
              color: "var(--muted-foreground)",
              marginBottom: 4,
            }}
          >
            Reason for the change
          </label>
          <textarea
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (error) setError(null);
            }}
            placeholder="e.g. Moving my trip a week later…"
            rows={3}
            className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          />

          {error && (
            <p style={{ fontSize: 12, color: "#dc2626", margin: "8px 0 0" }}>
              {error}
            </p>
          )}

          <div
            style={{
              display: "flex",
              gap: 8,
              justifyContent: "flex-end",
              marginTop: 16,
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-3 py-2 text-sm rounded-lg border border-[var(--border)] hover:bg-[var(--muted)] transition-colors disabled:opacity-50"
              style={{ color: "var(--foreground)" }}
            >
              Never mind
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-3 py-2 text-sm rounded-lg transition-colors disabled:opacity-50"
              style={{
                background: "#16324A",
                color: "#fff",
                border: "none",
                cursor: submitting ? "default" : "pointer",
              }}
            >
              {submitting ? "Submitting…" : "Submit new dates"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChangeDateModal;

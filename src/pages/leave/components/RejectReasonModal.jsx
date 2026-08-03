import { useState } from "react";

// Local-only for now — swap onSave to call your API (e.g. requestService.reject(id, reason))
// once a backend endpoint exists.

export function RejectReasonModal({ request, onClose, onSave }) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState(null);

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = reason.trim();
    if (!trimmed) {
      setError("Please provide a reason for rejecting this request.");
      return;
    }
    onSave(trimmed);
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
          maxWidth: 400,
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
          Reject leave request
        </p>
        <p
          style={{
            fontSize: 12,
            color: "var(--muted-foreground)",
            margin: "0 0 16px",
          }}
        >
          {request?.employeeName}
          {request?.leaveType ? ` · ${request.leaveType}` : ""}
        </p>

        <form onSubmit={handleSubmit}>
          <label
            style={{
              display: "block",
              fontSize: 11,
              fontWeight: 600,
              color: "var(--muted-foreground)",
              marginBottom: 4,
            }}
          >
            Reason for rejection
          </label>
          <textarea
            autoFocus
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (error) setError(null);
            }}
            placeholder="e.g. Insufficient leave balance, overlaps with a blackout period…"
            rows={4}
            className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
          />

          {error && (
            <p style={{ fontSize: 12, color: "#dc2626", margin: "8px 0 0" }}>
              {error}
            </p>
          )}

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-sm rounded-lg border border-[var(--border)] hover:bg-[var(--muted)] transition-colors"
              style={{ color: "var(--foreground)" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-2 text-sm rounded-lg transition-colors"
              style={{ background: "#dc2626", color: "#fff", border: "none", cursor: "pointer" }}
            >
              Reject request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

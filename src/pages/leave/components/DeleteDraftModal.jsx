import { useState } from "react";

export function DeleteDraftModal({ request, onClose, onSave, submitting }) {
  const [error, setError] = useState(null);

  function handleConfirm() {
    setError(null);
    onSave();
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
          Delete draft
        </p>
        <p
          style={{
            fontSize: 12,
            color: "var(--muted-foreground)",
            margin: "0 0 16px",
          }}
        >
          {request?.leaveType}
          {request?.startDate ? ` · ${request.startDate}` : ""}
          {request?.endDate && request?.endDate !== request?.startDate
            ? ` – ${request.endDate}`
            : ""}
        </p>

        <p
          style={{
            fontSize: 13,
            color: "var(--foreground)",
            margin: "0 0 16px",
          }}
        >
          This draft has not been filed yet. Deleting it cannot be undone.
        </p>

        {error && (
          <p style={{ fontSize: 12, color: "#dc2626", margin: "0 0 8px" }}>
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
            type="button"
            onClick={handleConfirm}
            disabled={submitting}
            className="px-3 py-2 text-sm rounded-lg transition-colors disabled:opacity-50"
            style={{
              background: "#dc2626",
              color: "#fff",
              border: "none",
              cursor: submitting ? "default" : "pointer",
            }}
          >
            {submitting ? "Deleting…" : "Delete draft"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteDraftModal;

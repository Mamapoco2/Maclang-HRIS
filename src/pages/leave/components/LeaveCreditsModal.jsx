import { useState } from "react";
import { LEAVE_TYPES } from "../mockData";

function empName(e) {
  return (
    e.name ?? e.full_name ?? `${e.first_name ?? ""} ${e.last_name ?? ""}`.trim()
  );
}

// ─── Add / edit leave credits modal ──────────────────────────────────────────
// Local-only for now — swap the onSave handler for a leaveService call once
// the backend endpoint exists (e.g. leaveService.upsertCredits(employeeId, payload)).

export function LeaveCreditsModal({
  employee,
  existing,
  editingType,
  onClose,
  onSave,
}) {
  const isEdit = Boolean(editingType);
  const usedTypes = new Set(Object.keys(existing ?? {}));

  const [leaveType, setLeaveType] = useState(
    editingType ??
      LEAVE_TYPES.find((t) => !usedTypes.has(t.value))?.value ??
      LEAVE_TYPES[0]?.value,
  );
  const [total, setTotal] = useState(
    editingType ? String(existing[editingType].total) : "",
  );
  const [used, setUsed] = useState(
    editingType ? String(existing[editingType].used) : "0",
  );
  const [carryForward, setCarryForward] = useState(
    editingType ? String(existing[editingType].carryForward ?? 0) : "0",
  );
  const [error, setError] = useState(null);

  const availableTypes = isEdit
    ? LEAVE_TYPES
    : LEAVE_TYPES.filter((t) => !usedTypes.has(t.value));

  function handleSubmit(e) {
    e.preventDefault();
    const totalNum = Number(total);
    const usedNum = Number(used);
    const carryNum = Number(carryForward);

    if (!leaveType) {
      setError("Choose a leave type.");
      return;
    }
    if (!Number.isFinite(totalNum) || totalNum <= 0) {
      setError("Total credits must be a positive number.");
      return;
    }
    if (!Number.isFinite(usedNum) || usedNum < 0) {
      setError("Used credits can't be negative.");
      return;
    }
    if (!Number.isFinite(carryNum) || carryNum < 0) {
      setError("Carried-forward credits can't be negative.");
      return;
    }
    if (usedNum > totalNum + carryNum) {
      setError("Used credits can't exceed total + carried-forward credits.");
      return;
    }

    onSave(leaveType, {
      total: totalNum,
      used: usedNum,
      carryForward: carryNum,
    });
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
          maxWidth: 380,
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
          {isEdit ? "Edit leave credits" : "Add leave credits"}
        </p>
        <p
          style={{
            fontSize: 12,
            color: "var(--muted-foreground)",
            margin: "0 0 16px",
          }}
        >
          {empName(employee)}
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <label
              style={{
                display: "block",
                fontSize: 11,
                fontWeight: 600,
                color: "var(--muted-foreground)",
                marginBottom: 4,
              }}
            >
              Leave type
            </label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              disabled={isEdit}
              className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-60"
            >
              {availableTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 8,
              marginBottom: 12,
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--muted-foreground)",
                  marginBottom: 4,
                }}
              >
                Total credits
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={total}
                onChange={(e) => setTotal(e.target.value)}
                placeholder="e.g. 18"
                className="w-full px-2 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--muted-foreground)",
                  marginBottom: 4,
                }}
              >
                Used
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={used}
                onChange={(e) => setUsed(e.target.value)}
                className="w-full px-2 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--muted-foreground)",
                  marginBottom: 4,
                }}
              >
                Carry fwd
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={carryForward}
                onChange={(e) => setCarryForward(e.target.value)}
                className="w-full px-2 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          </div>

          {error && (
            <p style={{ fontSize: 12, color: "#dc2626", margin: "0 0 12px" }}>
              {error}
            </p>
          )}

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
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
              style={{
                background: "#6366f1",
                color: "#fff",
                border: "none",
                cursor: "pointer",
              }}
            >
              {isEdit ? "Save changes" : "Add credits"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { useState } from "react";

function empName(e) {
  return (
    e.name ?? e.full_name ?? `${e.first_name ?? ""} ${e.last_name ?? ""}`.trim()
  );
}

// ─── Add / edit leave credits modal ──────────────────────────────────────────
export function LeaveCreditsModal({
  employee,
  leaveTypes,
  existing,
  editingType,
  onClose,
  onSave,
}) {
  const isEdit = editingType != null;
  const usedTypeIds = new Set(Object.keys(existing ?? {}).map(Number));

  const existingForEdit = isEdit ? existing?.[editingType] : null;

  const [leaveTypeId, setLeaveTypeId] = useState(
    editingType ??
      leaveTypes.find((t) => !usedTypeIds.has(t.id))?.id ??
      leaveTypes[0]?.id,
  );
  const [total, setTotal] = useState(
    existingForEdit
      ? String((existingForEdit.used ?? 0) + (existingForEdit.available ?? 0))
      : "",
  );
  const [used, setUsed] = useState(
    existingForEdit ? String(existingForEdit.used ?? 0) : "0",
  );
  const [carryForward, setCarryForward] = useState(
    existingForEdit ? String(existingForEdit.carry_forward_in ?? 0) : "0",
  );
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const availableTypes = isEdit
    ? leaveTypes
    : leaveTypes.filter((t) => !usedTypeIds.has(t.id));

  async function handleSubmit(e) {
    e.preventDefault();
    const totalNum = Number(total);
    const usedNum = Number(used);
    const carryNum = Number(carryForward);

    if (!leaveTypeId) {
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

    setError(null);
    setSaving(true);
    try {
      await onSave(leaveTypeId, {
        total: totalNum,
        used: usedNum,
        carryForward: carryNum,
      });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.errors?.used?.[0] ||
          "Failed to save credits. Please try again.",
      );
      setSaving(false);
    }
  }

  return (
    <div
      onClick={saving ? undefined : onClose}
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
              value={leaveTypeId}
              onChange={(e) => setLeaveTypeId(Number(e.target.value))}
              disabled={isEdit || saving}
              className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-60"
            >
              {availableTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
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
                disabled={saving}
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
                disabled={saving}
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
                disabled={saving}
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
              disabled={saving}
              className="px-3 py-2 text-sm rounded-lg border border-[var(--border)] hover:bg-[var(--muted)] transition-colors disabled:opacity-60"
              style={{ color: "var(--foreground)" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-3 py-2 text-sm rounded-lg transition-colors disabled:opacity-60"
              style={{
                background: "#6366f1",
                color: "#fff",
                border: "none",
                cursor: saving ? "default" : "pointer",
              }}
            >
              {saving ? "Saving…" : isEdit ? "Save changes" : "Add credits"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { useState, useEffect, useCallback } from "react";
import {
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Info,
  Zap,
} from "lucide-react";
import { contractService } from "../../../services/contractService";

// ─── Constants ────────────────────────────────────────────────────────────────

const RENEWAL_MONTH_OPTIONS = [
  { value: "JUNE", label: "June 1  (mid-year)" },
  { value: "DECEMBER", label: "December 1  (year-end)" },
  { value: "", label: "Both  (June 1 & December 1)" },
];

// ─── Small helpers ────────────────────────────────────────────────────────────

function StatusPill({ enabled }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full
        text-xs font-semibold border
        ${
          enabled
            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : "bg-slate-100 text-slate-500 border-slate-200"
        }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          enabled ? "bg-emerald-500" : "bg-slate-400"
        }`}
      />
      {enabled ? "Enabled" : "Disabled"}
    </span>
  );
}

function NextDateBadge({ endDate, enabled }) {
  if (!enabled || !endDate)
    return <span className="text-xs text-slate-400">—</span>;

  const next = new Date(endDate);
  next.setDate(next.getDate() + 1);

  return (
    <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
      {next.toLocaleDateString("en-PH", {
        year: "numeric",
        month: "short",
        day: "2-digit",
      })}
    </span>
  );
}

function InfoRow({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 border-b border-slate-100 last:border-0">
      <span className="text-xs font-medium text-slate-500 shrink-0">
        {label}
      </span>
      <div className="flex items-center gap-2 text-right">{children}</div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AutoRenewalPanel({ contract, toast, onUpdated }) {
  // ── Form state ────────────────────────────────────────────────────────────
  const [enabled, setEnabled] = useState(false);
  const [month, setMonth] = useState(""); // "" = both windows
  const [duration, setDuration] = useState(6); // fixed, read-only

  // ── UI state ──────────────────────────────────────────────────────────────
  const [saving, setSaving] = useState(false);
  const [manualLoading, setManualLoading] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [confirmManual, setConfirmManual] = useState(false);

  // Sync form whenever contract prop changes (e.g. after onUpdated)
  useEffect(() => {
    if (!contract) return;
    setEnabled(contract.auto_renewal_enabled ?? false);
    setMonth(contract.auto_renewal_month ?? "");
    setDuration(contract.auto_renewal_duration_months ?? 6);
    setDirty(false);
  }, [contract?.id]);

  // Dirty tracking
  useEffect(() => {
    if (!contract) return;
    const serverMonth = contract.auto_renewal_month ?? "";
    setDirty(
      enabled !== (contract.auto_renewal_enabled ?? false) ||
        month !== serverMonth ||
        duration !== (contract.auto_renewal_duration_months ?? 6),
    );
  }, [enabled, month, duration, contract]);

  // ── Save settings ─────────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    if (!contract?.id) return;
    setSaving(true);
    try {
      const updated = await contractService.updateAutoRenewal(contract.id, {
        auto_renewal_enabled: enabled,
        auto_renewal_duration_months: duration,
        auto_renewal_month: month === "" ? null : month,
      });
      setDirty(false);
      toast.add(
        enabled ? "Auto-renewal enabled." : "Auto-renewal disabled.",
        "success",
      );
      onUpdated?.(updated);
    } catch (err) {
      toast.add(
        err?.response?.data?.message ??
          "Failed to update auto-renewal settings.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  }, [contract?.id, enabled, duration, month, toast, onUpdated]);

  // ── Manual renew ──────────────────────────────────────────────────────────
  const handleManualRenew = useCallback(async () => {
    if (!contract?.id) return;
    setManualLoading(true);
    setConfirmManual(false);
    try {
      const renewed = await contractService.manualRenew(contract.id);
      toast.add(
        `Contract renewed — new period starts ${new Date(
          renewed.start_date,
        ).toLocaleDateString("en-PH", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        })}.`,
        "success",
      );
      onUpdated?.(renewed);
    } catch (err) {
      toast.add(
        err?.response?.data?.message ?? "Manual renewal failed.",
        "error",
      );
    } finally {
      setManualLoading(false);
    }
  }, [contract?.id, toast, onUpdated]);

  if (!contract) return null;

  const selectCls =
    "px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white " +
    "text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/20 " +
    "focus:border-violet-400 disabled:opacity-50 disabled:cursor-not-allowed";

  const isOriginal = (contract.renewal_generation ?? 0) === 0;

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
      {/* ── Header ── */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-violet-50">
            <RefreshCw className="w-4 h-4 text-violet-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800">
              Automatic Contract Renewal
            </h3>
            <p className="text-xs text-slate-400">
              Renews every 6 months — June 1 &amp; December 1
            </p>
          </div>
        </div>
        <StatusPill enabled={enabled} />
      </div>

      {/* ── Body ── */}
      <div className="px-6 py-5 space-y-5">
        {/* Toggle */}
        <button
          type="button"
          className="w-full flex items-center justify-between gap-4 text-left group"
          onClick={() => setEnabled((v) => !v)}
        >
          <div>
            <p className="text-sm font-medium text-slate-700">
              Enable auto-renewal for this contract
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              A new 6-month contract is created automatically on the next June 1
              or December 1.
            </p>
          </div>
          {enabled ? (
            <ToggleRight className="w-9 h-9 text-violet-600 shrink-0 group-hover:scale-105 transition-transform" />
          ) : (
            <ToggleLeft className="w-9 h-9 text-slate-300 shrink-0 group-hover:scale-105 transition-transform" />
          )}
        </button>

        {/* Config — only when enabled */}
        {enabled && (
          <div className="pl-4 border-l-2 border-violet-100 space-y-0">
            <InfoRow label="Renewal Window">
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className={selectCls}
              >
                {RENEWAL_MONTH_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </InfoRow>

            <InfoRow label="Duration">
              <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                6 months (fixed by LGU policy)
              </span>
            </InfoRow>

            <InfoRow label="Next Renewal Start">
              <NextDateBadge endDate={contract.end_date} enabled={enabled} />
            </InfoRow>

            {/* ── FIX: isOriginal computed above with correct operator precedence ── */}
            <InfoRow label="Renewal Generation">
              <span className="text-xs text-slate-600">
                {isOriginal
                  ? "Original contract"
                  : `Auto-renewal #${contract.renewal_generation}`}
              </span>
            </InfoRow>
          </div>
        )}

        {/* Info banner */}
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-blue-50 border border-blue-100">
          <Info className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
          <p className="text-xs text-blue-700 leading-relaxed">
            The scheduler runs at{" "}
            <strong>12:00 AM on June 1 and December 1</strong>. The current
            contract is marked <em>Expired</em>, a new 6-month contract is
            created, and the employee receives a notification via email and
            in-app alert.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            onClick={handleSave}
            disabled={!dirty || saving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 text-white
              text-sm font-medium hover:bg-violet-700 disabled:opacity-50
              disabled:cursor-not-allowed transition-colors"
          >
            {saving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5" />
            )}
            {saving ? "Saving…" : "Save Settings"}
          </button>

          {enabled && !confirmManual && (
            <button
              type="button"
              onClick={() => setConfirmManual(true)}
              disabled={manualLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200
                text-sm text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              Manual Renew Now
            </button>
          )}

          {confirmManual && (
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg
              border border-amber-200 bg-amber-50 flex-wrap"
            >
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="text-xs text-amber-800 font-medium">
                This immediately expires the current contract and creates a new
                one.
              </span>
              <button
                type="button"
                onClick={handleManualRenew}
                disabled={manualLoading}
                className="flex items-center gap-1 px-3 py-1 rounded bg-amber-600
                  text-white text-xs font-medium hover:bg-amber-700"
              >
                {manualLoading ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Zap className="w-3 h-3" />
                )}
                Confirm
              </button>
              <button
                type="button"
                onClick={() => setConfirmManual(false)}
                className="px-3 py-1 rounded border border-amber-300 text-xs
                  text-amber-700 hover:bg-amber-100"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

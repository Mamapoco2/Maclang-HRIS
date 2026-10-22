import { useState, useEffect, useCallback } from "react";
import { CheckCircle2, AlertCircle, Loader2, Info, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { contractService } from "../../../services/contractService";

// "" means both windows. Radix Select cannot use an empty value, so "BOTH" stands in for it.
const RENEWAL_MONTH_OPTIONS = [
  { value: "JUNE", label: "June 1 (mid-year)" },
  { value: "DECEMBER", label: "December 1 (year-end)" },
  { value: "BOTH", label: "Both (June 1 and December 1)" },
];

function Row({ label, children }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}

function nextStart(endDate) {
  if (!endDate) return "—";
  const next = new Date(endDate);
  next.setDate(next.getDate() + 1);
  return next.toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "2-digit" });
}

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

  const isOriginal = (contract.renewal_generation ?? 0) === 0;

  return (
    <>
      <Card className="min-w-0">
        <CardHeader>
          <CardTitle>Automatic renewal</CardTitle>
          <CardDescription>Renews every 6 months, on June 1 and December 1.</CardDescription>
          <CardAction>
            <Badge
              variant="outline"
              className={cn(
                "gap-1.5 border-transparent font-medium",
                enabled ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "bg-muted text-muted-foreground",
              )}
            >
              <span className={cn("size-1.5 rounded-full", enabled ? "bg-emerald-500" : "bg-muted-foreground/60")} />
              {enabled ? "On" : "Off"}
            </Badge>
          </CardAction>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
            <div className="space-y-1">
              <label htmlFor="auto-renewal-switch" className="text-sm font-medium">
                Renew this contract automatically
              </label>
              <p className="text-sm text-muted-foreground">
                A new 6-month contract is created on the next June 1 or December 1.
              </p>
            </div>
            <Switch id="auto-renewal-switch" checked={enabled} onCheckedChange={setEnabled} />
          </div>

          {enabled && (
            <div className="divide-y rounded-lg border px-4">
              <Row label="Renewal window">
                <Select value={month === "" ? "BOTH" : month} onValueChange={(v) => setMonth(v === "BOTH" ? "" : v)}>
                  <SelectTrigger className="w-60">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RENEWAL_MONTH_OPTIONS.map(({ value, label }) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Row>
              <Row label="Duration">
                <Badge variant="secondary">6 months, set by LGU policy</Badge>
              </Row>
              <Row label="Next renewal starts">
                <span className="text-sm font-medium">{nextStart(contract.end_date)}</span>
              </Row>
              <Row label="Renewal generation">
                <span className="text-sm">{isOriginal ? "Original contract" : `Auto-renewal #${contract.renewal_generation}`}</span>
              </Row>
            </div>
          )}

          <Alert>
            <Info />
            <AlertDescription>
              The scheduler runs at 12:00 AM on June 1 and December 1. It marks the current contract as Expired,
              creates a new 6-month contract, and notifies the employee by email and in-app alert.
            </AlertDescription>
          </Alert>

          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={handleSave} disabled={!dirty || saving}>
              {saving ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
              {saving ? "Saving..." : "Save changes"}
            </Button>
            {enabled && (
              <Button variant="outline" onClick={() => setConfirmManual(true)} disabled={manualLoading}>
                {manualLoading ? <Loader2 className="animate-spin" /> : <Zap />}
                Renew now
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={confirmManual} onOpenChange={setConfirmManual}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="size-5 text-amber-600" /> Renew this contract now?
            </DialogTitle>
            <DialogDescription>
              This expires the current contract immediately and creates a new one. It cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmManual(false)}>
              Cancel
            </Button>
            <Button onClick={handleManualRenew} disabled={manualLoading}>
              Renew now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

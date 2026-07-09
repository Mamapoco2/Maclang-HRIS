import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { plantillaPostingService } from "@/services/plantillaPostingService";
import { candidateName } from "../psbUtils";

// Mirrors ScheduleInterviewDialog's contract: `target` is
// { application, field } or null, `onClose` closes without saving,
// `onSaved(updatedInterview)` is called once the reason is stored.
export default function CancelInterviewDialog({ target, onClose, onSaved }) {
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  const open = Boolean(target);

  useEffect(() => {
    if (target) {
      setReason(target.application?.interview?.hr_cancellation_reason ?? "");
    }
  }, [target]);

  const handleSave = async () => {
    if (!target) return;
    setSaving(true);
    try {
      const updated = await plantillaPostingService.saveApplicationInterview(
        target.application.id,
        {
          [target.field]: "CANCELLED",
          hr_cancellation_reason: reason.trim(),
        },
      );
      toast.success("Interview cancelled.");
      onSaved(updated);
    } catch (err) {
      toast.error(
        err?.response?.data?.message ?? "Failed to cancel interview.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cancel interview</DialogTitle>
        </DialogHeader>

        {target && (
          <p className="text-sm text-gray-500">
            {candidateName(target.application.employee)} — HR interview
          </p>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-600">
            Reason for cancellation
          </label>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Candidate withdrew, conflicting schedule, position on hold…"
            rows={4}
            autoFocus
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Back
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || reason.trim().length === 0}
            className="bg-red-600 hover:bg-red-700"
          >
            {saving ? "Cancelling…" : "Confirm cancellation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

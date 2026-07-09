import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { IconLoader2 } from "@tabler/icons-react";
import { toast } from "sonner";
import { plantillaPostingService } from "@/services/plantillaPostingService";

const STAGE_FIELD = {
  hr: "hr_scheduled_at",
  head: "head_scheduled_at",
  final: "final_scheduled_at",
};

const STAGE_LABEL = {
  hr: "HR Interview",
  head: "Department Head Interview",
  final: "Final Interview (PSB)",
};

function toDatetimeLocal(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function RescheduleInterviewDialog({
  target,
  onClose,
  onSaved,
}) {
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!target) return;
    const field = STAGE_FIELD[target.stage];
    setValue(toDatetimeLocal(target.application.interview?.[field]));
  }, [target?.application?.id, target?.stage]);

  if (!target) return null;

  const field = STAGE_FIELD[target.stage];

  const handleSave = async () => {
    if (saving || !value) return;
    setSaving(true);
    try {
      await plantillaPostingService.saveApplicationInterview(
        target.application.id,
        { [field]: value },
      );
      toast.success("INTERVIEW RESCHEDULED.");
      onSaved();
    } catch (err) {
      toast.error(
        err?.response?.data?.message?.toUpperCase() ?? "FAILED TO RESCHEDULE.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={!!target}
      onOpenChange={(open) => !open && !saving && onClose()}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>
            RESCHEDULE — {STAGE_LABEL[target.stage]?.toUpperCase()}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label>NEW SCHEDULE</Label>
            <Input
              type="datetime-local"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            CANCEL
          </Button>
          <Button onClick={handleSave} disabled={saving || !value}>
            {saving && <IconLoader2 size={14} className="mr-2 animate-spin" />}
            {saving ? "SAVING..." : "SAVE"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

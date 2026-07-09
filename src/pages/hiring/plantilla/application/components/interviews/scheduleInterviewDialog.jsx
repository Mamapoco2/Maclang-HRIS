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

const STAGE_LABEL = {
  hr_status: "HR Interview",
};

const SCHEDULE_FIELD = {
  hr_status: "hr_scheduled_at",
};

function toDatetimeLocal(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function ScheduleInterviewDialog({ target, onClose, onSaved }) {
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!target) return;
    const scheduleField = SCHEDULE_FIELD[target.field];
    setValue(toDatetimeLocal(target.application.interview?.[scheduleField]));
  }, [target?.application?.id, target?.field]);

  if (!target) return null;

  const scheduleField = SCHEDULE_FIELD[target.field];

  const handleSave = async () => {
    if (saving || !value) return;
    setSaving(true);
    try {
      const updated = await plantillaPostingService.saveApplicationInterview(
        target.application.id,
        {
          [target.field]: "SCHEDULED",
          [scheduleField]: value,
        },
      );
      toast.success("INTERVIEW SCHEDULED.");
      onSaved(updated);
    } catch (err) {
      toast.error(
        err?.response?.data?.message?.toUpperCase() ??
          "FAILED TO SCHEDULE INTERVIEW.",
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
            SCHEDULE — {STAGE_LABEL[target.field]?.toUpperCase()}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label>DATE AND TIME</Label>
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
            {saving ? "SAVING..." : "SAVE SCHEDULE"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

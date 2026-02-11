import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateTimePicker } from "../components/datetimePicker";

/* ===================== EDIT MODAL ===================== */
export default function EditTrainingModal({
  training,
  open,
  onOpenChange,
  onSave,
}) {
  const [form, setForm] = useState(null);

  // Time states
  const [startHours, setStartHours] = useState("12");
  const [startMinutes, setStartMinutes] = useState("00");
  const [startAmPm, setStartAmPm] = useState("AM");

  const [endHours, setEndHours] = useState("12");
  const [endMinutes, setEndMinutes] = useState("00");
  const [endAmPm, setEndAmPm] = useState("AM");

  /* ---------- Load training ---------- */
  useEffect(() => {
    if (!training) return;

    const start = training.startDate ? new Date(training.startDate) : null;
    const end = training.endDate ? new Date(training.endDate) : null;

    setForm({
      ...training,
      eventStartDateTime: start,
      eventEndDateTime: end,
      status: training.status || "published",
    });
  }, [training]);

  /* ---------- Sync start time ---------- */
  useEffect(() => {
    if (!form?.eventStartDateTime) return;
    const d = new Date(form.eventStartDateTime);
    let h = parseInt(startHours);
    if (startAmPm === "PM" && h < 12) h += 12;
    if (startAmPm === "AM" && h === 12) h = 0;
    d.setHours(h);
    d.setMinutes(parseInt(startMinutes));
    setForm((p) => ({ ...p, eventStartDateTime: d }));
  }, [startHours, startMinutes, startAmPm]);

  /* ---------- Sync end time ---------- */
  useEffect(() => {
    if (!form?.eventEndDateTime) return;
    const d = new Date(form.eventEndDateTime);
    let h = parseInt(endHours);
    if (endAmPm === "PM" && h < 12) h += 12;
    if (endAmPm === "AM" && h === 12) h = 0;
    d.setHours(h);
    d.setMinutes(parseInt(endMinutes));
    setForm((p) => ({ ...p, eventEndDateTime: d }));
  }, [endHours, endMinutes, endAmPm]);

  if (!form) return null;

  /* ---------- Duration ---------- */
  const getDuration = () => {
    if (!form.eventStartDateTime || !form.eventEndDateTime) return "";
    const mins =
      (form.eventEndDateTime - form.eventStartDateTime) / 60000;
    if (mins <= 0) return "";
    const h = Math.floor(mins / 60);
    const m = Math.floor(mins % 60);
    return `${h}h ${m}m`;
  };

  /* ---------- SAVE ---------- */
  const handleSave = () => {
    onSave({
      ...form,
      startDate: form.eventStartDateTime,
      endDate: form.eventEndDateTime,
      duration: getDuration(),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit Training</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <Input
            placeholder="Training Title"
            value={form.title}
            onChange={(e) =>
              setForm({ ...form, title: e.target.value })
            }
          />

          <Textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />

          <Input
            placeholder="Department"
            value={form.department}
            onChange={(e) =>
              setForm({ ...form, department: e.target.value })
            }
          />

          <Input
            placeholder="Instructor"
            value={form.instructor}
            onChange={(e) =>
              setForm({ ...form, instructor: e.target.value })
            }
          />

          <Input
            placeholder="Category"
            value={form.category}
            onChange={(e) =>
              setForm({ ...form, category: e.target.value })
            }
          />

          <Input
            placeholder="Event Address"
            value={form.eventAddress}
            onChange={(e) =>
              setForm({ ...form, eventAddress: e.target.value })
            }
          />

          {/* ---------- Start & End DateTime (1/2 each) ---------- */}
          <div className="flex gap-2">
            <DateTimePicker
              label="Start Date & Time"
              date={form.eventStartDateTime}
              setDate={(d) =>
                setForm({ ...form, eventStartDateTime: d })
              }
              hours={startHours}
              minutes={startMinutes}
              ampm={startAmPm}
              setHours={setStartHours}
              setMinutes={setStartMinutes}
              setAmPm={setStartAmPm}
            />

            <DateTimePicker
              label="End Date & Time"
              date={form.eventEndDateTime}
              setDate={(d) =>
                setForm({ ...form, eventEndDateTime: d })
              }
              hours={endHours}
              minutes={endMinutes}
              ampm={endAmPm}
              setHours={setEndHours}
              setMinutes={setEndMinutes}
              setAmPm={setEndAmPm}
            />
          </div>

          <Input value={getDuration()} disabled />

          {/* ---------- STATUS ---------- */}
          <Select
            value={form.status}
            onValueChange={(v) =>
              setForm({ ...form, status: v })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="published">Ongoing</SelectItem>
              <SelectItem value="draft">Finished</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

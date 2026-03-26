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
import { IconLoader2 } from "@tabler/icons-react";
import { DateTimePicker } from "../components/datetimePicker";

export default function EditTrainingModal({
  training,
  open,
  onOpenChange,
  onSave,
}) {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const [startHours, setStartHours] = useState("12");
  const [startMinutes, setStartMinutes] = useState("00");
  const [startAmPm, setStartAmPm] = useState("AM");
  const [endHours, setEndHours] = useState("12");
  const [endMinutes, setEndMinutes] = useState("00");
  const [endAmPm, setEndAmPm] = useState("AM");

  // ── Load training into form ───────────────────────────────────────────────
  useEffect(() => {
    if (!training) return;
    const start = training.startDate ? new Date(training.startDate) : null;
    const end = training.endDate ? new Date(training.endDate) : null;

    // Seed AM/PM pickers from the existing dates
    if (start) {
      const h = start.getHours();
      setStartAmPm(h >= 12 ? "PM" : "AM");
      setStartHours(String(h % 12 || 12));
      setStartMinutes(String(start.getMinutes()).padStart(2, "0"));
    }
    if (end) {
      const h = end.getHours();
      setEndAmPm(h >= 12 ? "PM" : "AM");
      setEndHours(String(h % 12 || 12));
      setEndMinutes(String(end.getMinutes()).padStart(2, "0"));
    }

    setErrors({});
    setForm({
      ...training,
      eventStartDateTime: start,
      eventEndDateTime: end,
      status: training.status || "active",
      // Normalise: show empty string when 0 so the placeholder is visible
      maxParticipants:
        training.maxParticipants > 0 ? String(training.maxParticipants) : "",
    });
  }, [training]);

  // ── Sync start time ───────────────────────────────────────────────────────
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

  // ── Sync end time ─────────────────────────────────────────────────────────
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

  // ── Duration ──────────────────────────────────────────────────────────────
  const getDuration = () => {
    if (!form.eventStartDateTime || !form.eventEndDateTime) return "";
    const mins = (form.eventEndDateTime - form.eventStartDateTime) / 60000;
    if (mins <= 0) return "";
    const d = Math.floor(mins / (24 * 60));
    const h = Math.floor((mins % (24 * 60)) / 60);
    const m = Math.floor(mins % 60);
    return [d > 0 ? `${d}d` : null, h > 0 ? `${h}h` : null, `${m}m`]
      .filter(Boolean)
      .join(" ");
  };

  // ── Validate ──────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (
      form.maxParticipants !== "" &&
      (isNaN(Number(form.maxParticipants)) || Number(form.maxParticipants) < 1)
    ) {
      e.maxParticipants = "Must be a positive number.";
    }
    return e;
  };

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});

    try {
      setSaving(true);
      await onSave({
        ...form,
        startDate: form.eventStartDateTime,
        endDate: form.eventEndDateTime,
        duration: getDuration(),
        // Send 0 when left blank (backend treats 0 as "no limit")
        maxParticipants:
          form.maxParticipants !== "" ? Number(form.maxParticipants) : 0,
      });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
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
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <Textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <Input
            placeholder="Department"
            value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
          />
          <Input
            placeholder="Instructor"
            value={form.instructor}
            onChange={(e) => setForm({ ...form, instructor: e.target.value })}
          />
          <Input
            placeholder="Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
          <Input
            placeholder="Event Address"
            value={form.eventAddress}
            onChange={(e) => setForm({ ...form, eventAddress: e.target.value })}
          />

          {/* Mode of Training */}
          <Select
            value={form.trainingMode ?? ""}
            onValueChange={(v) => setForm({ ...form, trainingMode: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Mode of Training" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="face-to-face">Face to Face</SelectItem>
            </SelectContent>
          </Select>

          {/* Max Participants */}
          <div>
            <Input
              type="number"
              min={1}
              placeholder="Max Participants (optional — leave blank for no limit)"
              value={form.maxParticipants}
              onChange={(e) => {
                setForm({ ...form, maxParticipants: e.target.value });
                if (errors.maxParticipants)
                  setErrors((p) => ({ ...p, maxParticipants: null }));
              }}
            />
            {errors.maxParticipants && (
              <p className="text-xs text-red-500 mt-1">
                {errors.maxParticipants}
              </p>
            )}
          </div>

          {/* Date & Time */}
          <div className="flex gap-2">
            <DateTimePicker
              label="Start Date & Time"
              date={form.eventStartDateTime}
              setDate={(d) => setForm({ ...form, eventStartDateTime: d })}
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
              setDate={(d) => setForm({ ...form, eventEndDateTime: d })}
              hours={endHours}
              minutes={endMinutes}
              ampm={endAmPm}
              setHours={setEndHours}
              setMinutes={setEndMinutes}
              setAmPm={setEndAmPm}
            />
          </div>

          {/* Duration (auto-computed) */}
          <Input
            value={getDuration()}
            disabled
            placeholder="Duration (auto-computed)"
          />

          {/* Status */}
          <Select
            value={form.status}
            onValueChange={(v) => setForm({ ...form, status: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="ongoing">Ongoing</SelectItem>
              <SelectItem value="finished">Finished</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DialogFooter className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Close
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <IconLoader2 size={14} className="animate-spin mr-1" />}
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

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
import { DateTimePicker } from "./datetimePicker";

// ── Helpers ───────────────────────────────────────────────────────────────────
function buildDateTime(date, hours, minutes, ampm) {
  if (!date) return null;
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  let h = parseInt(hours, 10);
  if (ampm === "PM" && h < 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  return new Date(year, month, day, h, parseInt(minutes, 10), 0, 0);
}

function getDuration(start, end) {
  if (!start || !end) return "";
  const mins = (end - start) / 60000;
  if (mins <= 0) return "";
  const d = Math.floor(mins / (24 * 60));
  const h = Math.floor((mins % (24 * 60)) / 60);
  const m = Math.floor(mins % 60);
  return [d > 0 ? `${d}d` : null, h > 0 ? `${h}h` : null, `${m}m`]
    .filter(Boolean)
    .join(" ");
}

// ✅ Auto-compute status from two Date objects
function computeStatus(start, end) {
  if (!start || !end) return "draft";
  const now = new Date();
  if (now < start) return "upcoming";
  if (now >= start && now <= end) return "ongoing";
  return "finished";
}

const FormField = ({ label, error, children }) => (
  <div className="space-y-1">
    {label && (
      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
        {label}
      </p>
    )}
    {children}
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

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

  // ── Initialize from training prop ────────────────────────────────────────
  useEffect(() => {
    if (!training) return;
    const start = training.startDate ? new Date(training.startDate) : null;
    const end = training.endDate ? new Date(training.endDate) : null;

    if (start) {
      const h = start.getHours();
      setStartAmPm(h >= 12 ? "PM" : "AM");
      setStartHours(String(h % 12 || 12));
      setStartMinutes(String(start.getMinutes()).padStart(2, "0"));
    } else {
      setStartHours("12");
      setStartMinutes("00");
      setStartAmPm("AM");
    }

    if (end) {
      const h = end.getHours();
      setEndAmPm(h >= 12 ? "PM" : "AM");
      setEndHours(String(h % 12 || 12));
      setEndMinutes(String(end.getMinutes()).padStart(2, "0"));
    } else {
      setEndHours("12");
      setEndMinutes("00");
      setEndAmPm("AM");
    }

    setErrors({});
    setForm({
      ...training,
      startDate: start
        ? new Date(start.getFullYear(), start.getMonth(), start.getDate())
        : null,
      endDate: end
        ? new Date(end.getFullYear(), end.getMonth(), end.getDate())
        : null,
      status: training.status || "draft",
      maxParticipants:
        training.maxParticipants > 0 ? String(training.maxParticipants) : "",
    });
  }, [training]);

  if (!form) return null;

  const getFinalStart = () =>
    buildDateTime(form.startDate, startHours, startMinutes, startAmPm);
  const getFinalEnd = () =>
    buildDateTime(form.endDate, endHours, endMinutes, endAmPm);

  // ✅ Called whenever date or time parts change — updates status automatically
  const recomputeStatus = (start, end) => {
    if (form.status === "cancelled") return; // don't override a manual cancel
    const auto = computeStatus(start, end);
    setForm((prev) => ({ ...prev, status: auto }));
  };

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

  const handleSave = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    const start = getFinalStart();
    const end = getFinalEnd();
    try {
      setSaving(true);
      await onSave({
        ...form,
        startDate: start,
        endDate: end,
        duration: getDuration(start, end),
        maxParticipants:
          form.maxParticipants !== "" ? Number(form.maxParticipants) : 0,
      });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  const previewStart = getFinalStart();
  const previewEnd = getFinalEnd();

  const inputClass =
    "h-9 text-sm border-gray-200 bg-white rounded-lg focus:border-gray-400 placeholder:text-gray-400";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0 rounded-xl overflow-hidden border-gray-200 gap-0">
        <DialogHeader className="px-6 py-4 border-b border-gray-100">
          <DialogTitle className="text-base font-semibold text-gray-900">
            Edit Training
          </DialogTitle>
          <p className="text-xs text-gray-400 mt-0.5">
            Update the details for this training program.
          </p>
        </DialogHeader>

        <div className="px-6 py-4 space-y-3 max-h-[65vh] overflow-y-auto">
          <FormField label="Title">
            <Input
              className={inputClass}
              placeholder="Training title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </FormField>

          <FormField label="Description">
            <Textarea
              className="text-sm border-gray-200 bg-white rounded-lg resize-none placeholder:text-gray-400"
              rows={3}
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Department">
              <Input
                className={inputClass}
                placeholder="Department"
                value={form.department}
                onChange={(e) =>
                  setForm({ ...form, department: e.target.value })
                }
              />
            </FormField>
            <FormField label="Instructor">
              <Input
                className={inputClass}
                placeholder="Instructor"
                value={form.instructor}
                onChange={(e) =>
                  setForm({ ...form, instructor: e.target.value })
                }
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Category">
              <Input
                className={inputClass}
                placeholder="Category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </FormField>
            <FormField label="Max Participants" error={errors.maxParticipants}>
              <Input
                className={inputClass}
                type="number"
                min={1}
                placeholder="No limit"
                value={form.maxParticipants}
                onChange={(e) => {
                  setForm({ ...form, maxParticipants: e.target.value });
                  if (errors.maxParticipants)
                    setErrors((p) => ({ ...p, maxParticipants: null }));
                }}
              />
            </FormField>
          </div>

          <FormField label="Event Address">
            <Input
              className={inputClass}
              placeholder="Event address"
              value={form.eventAddress}
              onChange={(e) =>
                setForm({ ...form, eventAddress: e.target.value })
              }
            />
          </FormField>

          <FormField label="Mode of Training">
            <Select
              value={form.trainingMode ?? ""}
              onValueChange={(v) => setForm({ ...form, trainingMode: v })}
            >
              <SelectTrigger className="h-9 text-sm border-gray-200 rounded-lg">
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="face-to-face">Face to Face</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Schedule">
            <div className="flex gap-2">
              <DateTimePicker
                label="Start Date & Time"
                date={form.startDate}
                setDate={(d) => {
                  setForm((prev) => ({ ...prev, startDate: d }));
                  // ✅ Re-compute status when start date changes
                  const end = getFinalEnd();
                  recomputeStatus(
                    buildDateTime(d, startHours, startMinutes, startAmPm),
                    end,
                  );
                }}
                hours={startHours}
                minutes={startMinutes}
                ampm={startAmPm}
                setHours={(h) => {
                  setStartHours(h);
                  recomputeStatus(
                    buildDateTime(form.startDate, h, startMinutes, startAmPm),
                    getFinalEnd(),
                  );
                }}
                setMinutes={(m) => {
                  const padded = String(m).padStart(2, "0");
                  setStartMinutes(padded);
                  recomputeStatus(
                    buildDateTime(
                      form.startDate,
                      startHours,
                      padded,
                      startAmPm,
                    ),
                    getFinalEnd(),
                  );
                }}
                setAmPm={(a) => {
                  setStartAmPm(a);
                  recomputeStatus(
                    buildDateTime(form.startDate, startHours, startMinutes, a),
                    getFinalEnd(),
                  );
                }}
              />
              <DateTimePicker
                label="End Date & Time"
                date={form.endDate}
                setDate={(d) => {
                  setForm((prev) => ({ ...prev, endDate: d }));
                  // ✅ Re-compute status when end date changes
                  recomputeStatus(
                    getFinalStart(),
                    buildDateTime(d, endHours, endMinutes, endAmPm),
                  );
                }}
                hours={endHours}
                minutes={endMinutes}
                ampm={endAmPm}
                setHours={(h) => {
                  setEndHours(h);
                  recomputeStatus(
                    getFinalStart(),
                    buildDateTime(form.endDate, h, endMinutes, endAmPm),
                  );
                }}
                setMinutes={(m) => {
                  const padded = String(m).padStart(2, "0");
                  setEndMinutes(padded);
                  recomputeStatus(
                    getFinalStart(),
                    buildDateTime(form.endDate, endHours, padded, endAmPm),
                  );
                }}
                setAmPm={(a) => {
                  setEndAmPm(a);
                  recomputeStatus(
                    getFinalStart(),
                    buildDateTime(form.endDate, endHours, endMinutes, a),
                  );
                }}
              />
            </div>
          </FormField>

          <FormField label="Duration (auto-computed)">
            <Input
              className={`${inputClass} bg-gray-50 text-gray-400`}
              value={getDuration(previewStart, previewEnd)}
              disabled
              placeholder="Auto-computed from dates"
            />
          </FormField>

          {/* ✅ Status — pre-filled automatically, still manually overridable */}
          <FormField label="Status">
            <Select
              value={form.status}
              onValueChange={(v) => setForm({ ...form, status: v })}
            >
              <SelectTrigger className="h-9 text-sm border-gray-200 rounded-lg">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="ongoing">Ongoing</SelectItem>
                <SelectItem value="finished">Finished</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[11px] text-gray-400 mt-1">
              Auto-filled based on schedule. You can still override it manually.
            </p>
          </FormField>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-gray-100 gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
            className="rounded-lg border-gray-200 text-gray-600 h-9"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-gray-900 hover:bg-gray-800 text-white h-9 gap-1.5"
          >
            {saving && <IconLoader2 size={14} className="animate-spin" />}
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

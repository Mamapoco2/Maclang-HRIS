import React, { useState, useEffect } from "react";
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
import api from "../../../api/api";

// ── Helper: combine a date + 12h time parts into a single Date ───────────────
function buildDateTime(date, hours, minutes, ampm) {
  if (!date) return null;
  // Use explicit local year/month/day to avoid any UTC-to-local shift
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  let h = parseInt(hours, 10);
  if (ampm === "PM" && h < 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  // Build entirely from local parts — no timezone drift possible
  return new Date(year, month, day, h, parseInt(minutes, 10), 0, 0);
}

// ── Helper: compute duration string from two Date objects ────────────────────
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

export default function TrainingForm({ onSubmit }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    department: "",
    instructor: "",
    category: "",
    eventAddress: "",
    // Store only the calendar date (no time baked in)
    startDate: null,
    endDate: null,
    trainingMode: "",
    maxParticipants: "",
  });

  // Time parts stored separately — never merged back into the date during typing
  const [startHours, setStartHours] = useState("12");
  const [startMinutes, setStartMinutes] = useState("00");
  const [startAmPm, setStartAmPm] = useState("AM");
  const [endHours, setEndHours] = useState("12");
  const [endMinutes, setEndMinutes] = useState("00");
  const [endAmPm, setEndAmPm] = useState("AM");

  const [departments, setDepartments] = useState([]);
  const [loadingDepts, setLoadingDepts] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setLoadingDepts(true);
    api
      .get("/departments")
      .then((res) => setDepartments(res.data.data || res.data || []))
      .catch(console.error)
      .finally(() => setLoadingDepts(false));
  }, []);

  // ── Compute final datetimes only when needed (no useEffect mutation) ──────
  const getFinalStart = () =>
    buildDateTime(form.startDate, startHours, startMinutes, startAmPm);
  const getFinalEnd = () =>
    buildDateTime(form.endDate, endHours, endMinutes, endAmPm);

  const validate = () => {
    const e = {};
    const start = getFinalStart();
    const end = getFinalEnd();
    if (!form.title.trim()) e.title = "Title is required.";
    if (!start) e.startDate = "Start date is required.";
    if (!end) e.endDate = "End date is required.";
    if (start && end && end <= start)
      e.endDate = "End date must be after start date.";
    if (
      form.maxParticipants !== "" &&
      (isNaN(Number(form.maxParticipants)) || Number(form.maxParticipants) < 1)
    ) {
      e.maxParticipants = "Must be a positive number.";
    }
    return e;
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});

    const start = getFinalStart();
    const end = getFinalEnd();

    try {
      setSubmitting(true);
      await onSubmit({
        title: form.title,
        description: form.description,
        department: form.department,
        instructor: form.instructor,
        category: form.category,
        eventAddress: form.eventAddress,
        trainingMode: form.trainingMode,
        startDate: start,
        endDate: end,
        duration: getDuration(start, end),
        maxParticipants:
          form.maxParticipants !== "" ? Number(form.maxParticipants) : 0,
      });

      // Reset
      setForm({
        title: "",
        description: "",
        department: "",
        instructor: "",
        category: "",
        eventAddress: "",
        startDate: null,
        endDate: null,
        trainingMode: "",
        maxParticipants: "",
      });
      setStartHours("12");
      setStartMinutes("00");
      setStartAmPm("AM");
      setEndHours("12");
      setEndMinutes("00");
      setEndAmPm("AM");
    } catch (err) {
      console.error("Failed to submit training:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const field = (key) => ({
    value: form[key],
    onChange: (e) => {
      setForm((p) => ({ ...p, [key]: e.target.value }));
      if (errors[key]) setErrors((p) => ({ ...p, [key]: null }));
    },
  });

  // For preview in the disabled duration field
  const previewStart = getFinalStart();
  const previewEnd = getFinalEnd();

  return (
    <div className="space-y-3 max-w-md">
      <div>
        <Input placeholder="Training Title *" {...field("title")} />
        {errors.title && (
          <p className="text-xs text-red-500 mt-1">{errors.title}</p>
        )}
      </div>

      <Textarea placeholder="Description" {...field("description")} />

      <div>
        <Select
          value={form.department}
          onValueChange={(v) => {
            setForm((p) => ({ ...p, department: v }));
            if (errors.department)
              setErrors((p) => ({ ...p, department: null }));
          }}
          disabled={loadingDepts}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={
                loadingDepts ? "Loading departments..." : "Select Department"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {departments.map((dept) => (
              <SelectItem key={dept.id} value={dept.name}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.department && (
          <p className="text-xs text-red-500 mt-1">{errors.department}</p>
        )}
      </div>

      <Input placeholder="Instructor" {...field("instructor")} />
      <Input placeholder="Category" {...field("category")} />

      <Select
        value={form.trainingMode}
        onValueChange={(v) => setForm((p) => ({ ...p, trainingMode: v }))}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select Mode of Training" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="online">Online</SelectItem>
          <SelectItem value="face-to-face">Face to Face</SelectItem>
        </SelectContent>
      </Select>

      <Input placeholder="Event Address" {...field("eventAddress")} />

      <div>
        <Input
          type="number"
          min={1}
          placeholder="Max Participants (optional)"
          {...field("maxParticipants")}
        />
        {errors.maxParticipants && (
          <p className="text-xs text-red-500 mt-1">{errors.maxParticipants}</p>
        )}
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <DateTimePicker
            label="Start Date & Time *"
            date={form.startDate}
            setDate={(d) => {
              // Store only the raw date — time is handled by the separate state
              setForm((p) => ({ ...p, startDate: d }));
              if (errors.startDate)
                setErrors((p) => ({ ...p, startDate: null }));
            }}
            hours={startHours}
            minutes={startMinutes}
            ampm={startAmPm}
            setHours={setStartHours}
            setMinutes={(m) => setStartMinutes(String(m).padStart(2, "0"))}
            setAmPm={setStartAmPm}
          />
          {errors.startDate && (
            <p className="text-xs text-red-500 mt-1">{errors.startDate}</p>
          )}
        </div>

        <div className="flex-1">
          <DateTimePicker
            label="End Date & Time *"
            date={form.endDate}
            setDate={(d) => {
              setForm((p) => ({ ...p, endDate: d }));
              if (errors.endDate) setErrors((p) => ({ ...p, endDate: null }));
            }}
            hours={endHours}
            minutes={endMinutes}
            ampm={endAmPm}
            setHours={setEndHours}
            setMinutes={(m) => setEndMinutes(String(m).padStart(2, "0"))}
            setAmPm={setEndAmPm}
          />
          {errors.endDate && (
            <p className="text-xs text-red-500 mt-1">{errors.endDate}</p>
          )}
        </div>
      </div>

      <Input
        value={getDuration(previewStart, previewEnd)}
        disabled
        placeholder="Duration (auto-computed)"
      />

      <Button
        type="button"
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full"
      >
        {submitting ? (
          <>
            <IconLoader2 size={14} className="animate-spin mr-2" />
            Adding...
          </>
        ) : (
          "Add Training"
        )}
      </Button>
    </div>
  );
}

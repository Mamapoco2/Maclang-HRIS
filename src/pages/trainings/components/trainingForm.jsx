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
import { DateTimePicker } from "../components/datetimePicker";
import api from "../../../api/api";

export default function TrainingForm({ onSubmit }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    department: "",
    instructor: "",
    category: "",
    eventAddress: "",
    eventStartDateTime: null,
    eventEndDateTime: null,
    trainingMode: "",
    maxParticipants: "",
  });

  const [departments, setDepartments] = useState([]);
  const [loadingDepts, setLoadingDepts] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const [startHours, setStartHours] = useState("12");
  const [startMinutes, setStartMinutes] = useState("00");
  const [startAmPm, setStartAmPm] = useState("AM");
  const [endHours, setEndHours] = useState("12");
  const [endMinutes, setEndMinutes] = useState("00");
  const [endAmPm, setEndAmPm] = useState("AM");

  // ── Fetch departments ────────────────────────────────────────────────────
  useEffect(() => {
    setLoadingDepts(true);
    api
      .get("/departments")
      .then((res) => setDepartments(res.data.data || res.data || []))
      .catch(console.error)
      .finally(() => setLoadingDepts(false));
  }, []);

  // ── Sync start time ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!form.eventStartDateTime) return;
    const d = new Date(form.eventStartDateTime);
    let h = parseInt(startHours);
    if (startAmPm === "PM" && h < 12) h += 12;
    if (startAmPm === "AM" && h === 12) h = 0;
    d.setHours(h);
    d.setMinutes(parseInt(startMinutes));
    setForm((p) => ({ ...p, eventStartDateTime: d }));
  }, [startHours, startMinutes, startAmPm]);

  // ── Sync end time ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!form.eventEndDateTime) return;
    const d = new Date(form.eventEndDateTime);
    let h = parseInt(endHours);
    if (endAmPm === "PM" && h < 12) h += 12;
    if (endAmPm === "AM" && h === 12) h = 0;
    d.setHours(h);
    d.setMinutes(parseInt(endMinutes));
    setForm((p) => ({ ...p, eventEndDateTime: d }));
  }, [endHours, endMinutes, endAmPm]);

  // ── Duration ─────────────────────────────────────────────────────────────
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

  // ── Validate ─────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required.";
    if (!form.eventStartDateTime) e.startDate = "Start date is required.";
    if (!form.eventEndDateTime) e.endDate = "End date is required.";
    if (
      form.eventStartDateTime &&
      form.eventEndDateTime &&
      form.eventEndDateTime <= form.eventStartDateTime
    ) {
      e.endDate = "End date must be after start date.";
    }
    if (
      form.maxParticipants !== "" &&
      (isNaN(Number(form.maxParticipants)) || Number(form.maxParticipants) < 1)
    ) {
      e.maxParticipants = "Must be a positive number.";
    }
    return e;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});

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
        startDate: form.eventStartDateTime,
        endDate: form.eventEndDateTime,
        duration: getDuration(),
        maxParticipants:
          form.maxParticipants !== "" ? Number(form.maxParticipants) : 0,
      });

      // Reset form on success
      setForm({
        title: "",
        description: "",
        department: "",
        instructor: "",
        category: "",
        eventAddress: "",
        eventStartDateTime: null,
        eventEndDateTime: null,
        trainingMode: "",
        maxParticipants: "",
      });
    } catch (err) {
      console.error("Failed to submit training:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Helper ────────────────────────────────────────────────────────────────
  const field = (key) => ({
    value: form[key],
    onChange: (e) => {
      setForm((p) => ({ ...p, [key]: e.target.value }));
      if (errors[key]) setErrors((p) => ({ ...p, [key]: null }));
    },
  });

  return (
    <div className="space-y-3 max-w-md">
      {/* Title */}
      <div>
        <Input placeholder="Training Title *" {...field("title")} />
        {errors.title && (
          <p className="text-xs text-red-500 mt-1">{errors.title}</p>
        )}
      </div>

      {/* Description */}
      <Textarea placeholder="Description" {...field("description")} />

      {/* Department — connected to /api/departments */}
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

      {/* Instructor */}
      <Input placeholder="Instructor" {...field("instructor")} />

      {/* Category */}
      <Input placeholder="Category" {...field("category")} />

      {/* Mode of Training */}
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

      {/* Event Address */}
      <Input placeholder="Event Address" {...field("eventAddress")} />

      {/* Max Participants */}
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

      {/* Start & End DateTime */}
      <div className="flex gap-2">
        <div className="flex-1">
          <DateTimePicker
            label="Start Date & Time *"
            date={form.eventStartDateTime}
            setDate={(d) => {
              setForm((p) => ({ ...p, eventStartDateTime: d }));
              if (errors.startDate)
                setErrors((p) => ({ ...p, startDate: null }));
            }}
            hours={startHours}
            minutes={startMinutes}
            ampm={startAmPm}
            setHours={setStartHours}
            setMinutes={setStartMinutes}
            setAmPm={setStartAmPm}
          />
          {errors.startDate && (
            <p className="text-xs text-red-500 mt-1">{errors.startDate}</p>
          )}
        </div>

        <div className="flex-1">
          <DateTimePicker
            label="End Date & Time *"
            date={form.eventEndDateTime}
            setDate={(d) => {
              setForm((p) => ({ ...p, eventEndDateTime: d }));
              if (errors.endDate) setErrors((p) => ({ ...p, endDate: null }));
            }}
            hours={endHours}
            minutes={endMinutes}
            ampm={endAmPm}
            setHours={setEndHours}
            setMinutes={setEndMinutes}
            setAmPm={setEndAmPm}
          />
          {errors.endDate && (
            <p className="text-xs text-red-500 mt-1">{errors.endDate}</p>
          )}
        </div>
      </div>

      {/* Duration (auto-computed) */}
      <Input
        value={getDuration()}
        disabled
        placeholder="Duration (auto-computed)"
      />

      {/* Submit */}
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

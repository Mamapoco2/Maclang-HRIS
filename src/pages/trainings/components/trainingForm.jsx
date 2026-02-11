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
import { DateTimePicker } from "../components/datetimePicker";

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
  });

  // Time states
  const [startHours, setStartHours] = useState("12");
  const [startMinutes, setStartMinutes] = useState("00");
  const [startAmPm, setStartAmPm] = useState("AM");

  const [endHours, setEndHours] = useState("12");
  const [endMinutes, setEndMinutes] = useState("00");
  const [endAmPm, setEndAmPm] = useState("AM");

  // Sync start time
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

  // Sync end time
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

  // Duration
  const getDuration = () => {
    if (!form.eventStartDateTime || !form.eventEndDateTime) return "";
    const mins = (form.eventEndDateTime - form.eventStartDateTime) / 60000;
    if (mins <= 0) return "";
    const d = Math.floor(mins / (24 * 60));
    const h = Math.floor((mins % (24 * 60)) / 60);
    const m = Math.floor(mins % 60);
    return `${d}d ${h}h ${m}m`;
  };

  const handleSubmit = () => {
    if (!form.title || !form.eventStartDateTime || !form.eventEndDateTime)
      return;

    onSubmit({
      id: Date.now().toString(),
      ...form,
      startDate: form.eventStartDateTime,
      endDate: form.eventEndDateTime,
      duration: getDuration(),
      progress: 0,
      participants: [],
      status: "active", // ✅ DEFAULT STATUS (not user-controlled)
    });

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
    });
  };

  return (
    <div className="space-y-3 max-w-md">
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

      <Select
        value={form.trainingMode}
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

      <Input
        placeholder="Event Address"
        value={form.eventAddress}
        onChange={(e) => setForm({ ...form, eventAddress: e.target.value })}
      />

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

      <Input value={getDuration()} disabled placeholder="Duration" />

      <Button onClick={handleSubmit} className="w-full">
        Add Training
      </Button>
    </div>
  );
}

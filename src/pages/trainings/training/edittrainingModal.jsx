import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

function buildDateTime(date, hours, minutes, ampm) {
  if (!date) return null;
  const year = date.getFullYear(),
    month = date.getMonth(),
    day = date.getDate();
  let h = parseInt(hours, 10);
  if (ampm === "PM" && h < 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  return new Date(year, month, day, h, parseInt(minutes, 10), 0, 0);
}

function getDuration(start, end) {
  if (!start || !end) return "";
  const mins = (end - start) / 60000;
  if (mins <= 0) return "";
  const d = Math.floor(mins / (24 * 60)),
    h = Math.floor((mins % (24 * 60)) / 60),
    m = Math.floor(mins % 60);
  return [d > 0 ? `${d}d` : null, h > 0 ? `${h}h` : null, `${m}m`]
    .filter(Boolean)
    .join(" ");
}

function parseTimeFromDate(dateVal) {
  if (!dateVal) return { hours: "12", minutes: "00", ampm: "AM" };
  const d = new Date(dateVal);
  let h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return {
    hours: String(h).padStart(2, "0"),
    minutes: String(m).padStart(2, "0"),
    ampm,
  };
}

const inputClass =
  "w-full h-9 px-3 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400 transition-all";
const labelClass =
  "text-[10px] font-semibold text-gray-400 uppercase tracking-wider";

function Field({ label, error, children }) {
  return (
    <div className="space-y-1.5">
      {label && <label className={labelClass}>{label}</label>}
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export default function EditTrainingModal({
  training,
  open,
  onOpenChange,
  onSave,
}) {
  const [form, setForm] = useState({
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
    status: "",
    progress: 0,
  });
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

  // Populate form when training changes
  useEffect(() => {
    if (!training) return;
    const start = training.startDate ? new Date(training.startDate) : null;
    const end = training.endDate ? new Date(training.endDate) : null;
    const st = parseTimeFromDate(start);
    const et = parseTimeFromDate(end);

    setForm({
      title: training.title ?? "",
      description: training.description ?? "",
      department: training.department ?? "",
      instructor: training.instructor ?? "",
      category: training.category ?? "",
      eventAddress: training.eventAddress ?? training.event_address ?? "",
      startDate: start,
      endDate: end,
      trainingMode: training.trainingMode ?? training.training_mode ?? "",
      maxParticipants:
        training.maxParticipants ?? training.max_participants ?? "",
      status: training.status ?? "",
      progress: training.progress ?? 0,
    });
    setStartHours(st.hours);
    setStartMinutes(st.minutes);
    setStartAmPm(st.ampm);
    setEndHours(et.hours);
    setEndMinutes(et.minutes);
    setEndAmPm(et.ampm);
  }, [training]);

  useEffect(() => {
    setLoadingDepts(true);
    api
      .get("/departments")
      .then((res) => setDepartments(res.data.data || res.data || []))
      .catch(console.error)
      .finally(() => setLoadingDepts(false));
  }, []);

  const getFinalStart = () =>
    buildDateTime(form.startDate, startHours, startMinutes, startAmPm);
  const getFinalEnd = () =>
    buildDateTime(form.endDate, endHours, endMinutes, endAmPm);

  const validate = () => {
    const e = {};
    const start = getFinalStart(),
      end = getFinalEnd();
    if (!form.title.trim()) e.title = "Title is required.";
    if (!start) e.startDate = "Start date is required.";
    if (!end) e.endDate = "End date is required.";
    if (start && end && end <= start)
      e.endDate = "End date must be after start date.";
    if (
      form.maxParticipants !== "" &&
      (isNaN(Number(form.maxParticipants)) || Number(form.maxParticipants) < 1)
    )
      e.maxParticipants = "Must be a positive number.";
    return e;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    const start = getFinalStart(),
      end = getFinalEnd();
    try {
      setSubmitting(true);
      await onSave({
        id: training.id,
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
        status: form.status,
        progress: form.progress,
      });
    } catch (err) {
      console.error("Failed to update training:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const f = (key) => ({
    value: form[key],
    onChange: (e) => {
      setForm((p) => ({ ...p, [key]: e.target.value }));
      if (errors[key]) setErrors((p) => ({ ...p, [key]: null }));
    },
  });

  const previewStart = getFinalStart(),
    previewEnd = getFinalEnd();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl border border-gray-100 shadow-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold text-gray-900">
            Edit Training Program
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Field label="Title *" error={errors.title}>
            <input
              className={inputClass}
              placeholder="Training title"
              {...f("title")}
            />
          </Field>

          <Field label="Description">
            <textarea
              className={`${inputClass} h-auto py-2 resize-none`}
              rows={3}
              placeholder="Description"
              {...f("description")}
            />
          </Field>

          <Field label="Department" error={errors.department}>
            <Select
              value={form.department}
              onValueChange={(v) => {
                setForm((p) => ({ ...p, department: v }));
                if (errors.department)
                  setErrors((p) => ({ ...p, department: null }));
              }}
              disabled={loadingDepts}
            >
              <SelectTrigger className="h-9 text-sm border-gray-200 bg-gray-50 rounded-lg focus:ring-2 focus:ring-blue-500">
                <SelectValue
                  placeholder={
                    loadingDepts ? "Loading..." : "Select Department"
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
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Instructor">
              <input
                className={inputClass}
                placeholder="Instructor"
                {...f("instructor")}
              />
            </Field>
            <Field label="Category">
              <input
                className={inputClass}
                placeholder="Category"
                {...f("category")}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Mode of Training">
              <Select
                value={form.trainingMode}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, trainingMode: v }))
                }
              >
                <SelectTrigger className="h-9 text-sm border-gray-200 bg-gray-50 rounded-lg">
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="face-to-face">Face to Face</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Max Participants" error={errors.maxParticipants}>
              <input
                type="number"
                min={1}
                className={inputClass}
                placeholder="No limit"
                {...f("maxParticipants")}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Status">
              <Select
                value={form.status}
                onValueChange={(v) => setForm((p) => ({ ...p, status: v }))}
              >
                <SelectTrigger className="h-9 text-sm border-gray-200 bg-gray-50 rounded-lg">
                  <SelectValue placeholder="Select status" />
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
            </Field>
            <Field label="Progress (%)">
              <input
                type="number"
                min={0}
                max={100}
                className={inputClass}
                placeholder="0"
                value={form.progress}
                onChange={(e) =>
                  setForm((p) => ({ ...p, progress: Number(e.target.value) }))
                }
              />
            </Field>
          </div>

          <Field label="Event Address">
            <input
              className={inputClass}
              placeholder="Event address"
              {...f("eventAddress")}
            />
          </Field>

          <div className="space-y-1.5">
            <label className={labelClass}>Schedule</label>
            <div className="flex gap-2">
              <div className="flex-1">
                <DateTimePicker
                  label="Start Date & Time *"
                  date={form.startDate}
                  setDate={(d) => {
                    setForm((p) => ({ ...p, startDate: d }));
                    if (errors.startDate)
                      setErrors((p) => ({ ...p, startDate: null }));
                  }}
                  hours={startHours}
                  minutes={startMinutes}
                  ampm={startAmPm}
                  setHours={setStartHours}
                  setMinutes={(m) =>
                    setStartMinutes(String(m).padStart(2, "0"))
                  }
                  setAmPm={setStartAmPm}
                />
                {errors.startDate && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.startDate}
                  </p>
                )}
              </div>
              <div className="flex-1">
                <DateTimePicker
                  label="End Date & Time *"
                  date={form.endDate}
                  setDate={(d) => {
                    setForm((p) => ({ ...p, endDate: d }));
                    if (errors.endDate)
                      setErrors((p) => ({ ...p, endDate: null }));
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
          </div>

          <Field label="Duration (auto-computed)">
            <input
              className={`${inputClass} bg-gray-100 text-gray-400 cursor-not-allowed`}
              value={getDuration(previewStart, previewEnd)}
              disabled
              placeholder="Auto-computed from dates"
            />
          </Field>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full h-9 flex items-center justify-center gap-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
          >
            {submitting ? (
              <>
                <IconLoader2 size={14} className="animate-spin" /> Saving…
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

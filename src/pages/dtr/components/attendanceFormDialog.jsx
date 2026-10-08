import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthenticatedImage } from "@/hooks/useAuthenticatedImage";
import {
  createAttendanceRecord,
  updateAttendanceRecord,
} from "@/services/attendanceService";
import EmployeePicker from "./employeePicker";

const MAX_PHOTO_BYTES = 2_000_000;
const PHOTO_TYPES = ["image/jpeg", "image/png"];

const SERVER_FIELD_MAP = {
  employee_id: "employee",
  work_date: "date",
  time_in: "timeIn",
  time_out: "timeOut",
  time_out_date: "timeOut",
  time_in_image: "inFile",
  time_out_image: "outFile",
};

const FOCUS_ORDER = ["employee", "date", "timeIn", "timeOut"];

function todayString() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function addOneDay(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  const next = new Date(year, month - 1, day + 1);
  const m = String(next.getMonth() + 1).padStart(2, "0");
  const d = String(next.getDate()).padStart(2, "0");
  return `${next.getFullYear()}-${m}-${d}`;
}

function to12h(value) {
  const match = /^(\d{2}):(\d{2})/.exec(value || "");
  if (!match) return "";
  const hours = Number(match[1]);
  const suffix = hours >= 12 ? "PM" : "AM";
  return `${String(hours % 12 || 12).padStart(2, "0")}:${match[2]} ${suffix}`;
}

function buildInitialForm(record) {
  if (!record) {
    return {
      employee: null,
      date: todayString(),
      timeIn: "",
      timeOut: "",
      nextDay: false,
      inFile: null,
      outFile: null,
    };
  }

  return {
    employee: {
      id: record.employee_id,
      name: record.name,
      employee_number: record.employee_number,
    },
    date: record.date,
    timeIn: (record.time_in || "").slice(0, 5),
    timeOut: (record.time_out || "").slice(0, 5),
    nextDay: Boolean(
      record.time_out_date && record.time_out_date !== record.date,
    ),
    inFile: null,
    outFile: null,
  };
}

function validatePhoto(file) {
  if (!file) return "";
  if (!PHOTO_TYPES.includes(file.type))
    return "Photo must be a JPG or PNG image.";
  if (file.size > MAX_PHOTO_BYTES) return "Photo must be smaller than 2 MB.";
  return "";
}

function validateForm(form, record) {
  const errors = {};

  if (!record && !form.employee)
    errors.employee = "Enter a valid employee number.";

  if (!form.date) errors.date = "Date is required.";
  else if (form.date > todayString())
    errors.date = "Date cannot be in the future.";

  if (!form.timeIn) errors.timeIn = "Time in is required.";

  if (!form.timeOut) {
    if (record?.time_out) {
      errors.timeOut = "Time out cannot be removed once it has been recorded.";
    } else if (form.outFile) {
      errors.timeOut = "Add a time out before attaching a time out photo.";
    } else if (form.nextDay) {
      errors.timeOut = "Enter a time out or untick the next-day option.";
    }
  } else if (form.timeIn && !form.nextDay && form.timeOut <= form.timeIn) {
    errors.timeOut = "Time out must be later than time in.";
  }

  const inPhotoError = validatePhoto(form.inFile);
  if (inPhotoError) errors.inFile = inPhotoError;

  const outPhotoError = validatePhoto(form.outFile);
  if (outPhotoError) errors.outFile = outPhotoError;

  return errors;
}

function buildFormData(form, record) {
  const data = new FormData();

  if (!record) data.append("employee_id", form.employee.id);
  data.append("work_date", form.date);
  data.append("time_in", form.timeIn);

  if (form.timeOut) {
    data.append("time_out", form.timeOut);
    data.append(
      "time_out_date",
      form.nextDay ? addOneDay(form.date) : form.date,
    );
  }

  if (form.inFile) data.append("time_in_image", form.inFile);
  if (form.outFile) data.append("time_out_image", form.outFile);

  return data;
}

function mapServerErrors(serverErrors) {
  const mapped = {};
  Object.entries(serverErrors).forEach(([field, messages]) => {
    const key = SERVER_FIELD_MAP[field];
    if (key && !mapped[key])
      mapped[key] = Array.isArray(messages) ? messages[0] : messages;
  });
  return mapped;
}

function FieldError({ message }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1 text-xs text-destructive">
      {message}
    </p>
  );
}

function PhotoField({
  label,
  file,
  existingPath,
  error,
  disabled,
  onSelect,
  onClear,
}) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const { url: existingUrl } = useAuthenticatedImage(
    file ? null : existingPath,
  );

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return undefined;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const src = preview || existingUrl;
  const hasPhoto = Boolean(src);

  const handleChange = (e) => {
    const selected = e.target.files?.[0] || null;
    e.target.value = "";
    if (selected) onSelect(selected);
  };

  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-1.5 flex items-center gap-3">
        {hasPhoto ? (
          <img
            src={src}
            alt={label}
            className="h-16 w-16 rounded-lg border object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-dashed bg-muted/40 text-[10px] text-muted-foreground">
            No image
          </div>
        )}
        <div className="flex flex-col items-start gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
          >
            {hasPhoto ? "Replace" : "Upload"}
          </Button>
          {file && (
            <button
              type="button"
              disabled={disabled}
              onClick={onClear}
              className="text-xs text-muted-foreground underline-offset-2 hover:underline"
            >
              Remove new photo
            </button>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png"
          className="hidden"
          onChange={handleChange}
        />
      </div>
      <FieldError message={error} />
    </div>
  );
}

export default function AttendanceFormDialog({
  record = null,
  onClose,
  onSaved,
}) {
  const isEdit = Boolean(record);
  const [initialForm] = useState(() => buildInitialForm(record));
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  const isDirty =
    form.employee?.id !== initialForm.employee?.id ||
    form.date !== initialForm.date ||
    form.timeIn !== initialForm.timeIn ||
    form.timeOut !== initialForm.timeOut ||
    form.nextDay !== initialForm.nextDay ||
    form.inFile !== null ||
    form.outFile !== null;

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  };

  const setPhoto = (key, file) => {
    const problem = validatePhoto(file);
    if (problem) {
      setErrors((prev) => ({ ...prev, [key]: problem }));
      return;
    }
    setField(key, file);
  };

  const requestClose = () => {
    if (saving) return;
    if (isDirty) {
      setNotice({ type: "discard" });
      return;
    }
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const found = validateForm(form, record);
    setErrors(found);

    const firstInvalid = FOCUS_ORDER.find((key) => found[key]);
    if (firstInvalid) {
      document.getElementById(`dtr-${firstInvalid}`)?.focus();
      return;
    }
    if (Object.keys(found).length > 0) return;

    setNotice({ type: "confirm" });
  };

  const save = async () => {
    setSaving(true);

    try {
      const payload = buildFormData(form, record);
      if (isEdit) await updateAttendanceRecord(record.id, payload);
      else await createAttendanceRecord(payload);

      toast.success(
        isEdit ? "Attendance record updated." : "Attendance record added.",
      );
      setNotice(null);
      onSaved();
    } catch (err) {
      const status = err?.response?.status;
      const data = err?.response?.data;

      if (status === 422 && data?.errors) {
        setErrors(mapServerErrors(data.errors));
        setNotice(null);
        toast.error(data.message || "Please fix the highlighted fields.");
      } else if (!err?.response) {
        setNotice({
          type: "error",
          title: "Connection problem",
          message:
            "Could not reach the server. Check your connection and try again.",
        });
      } else {
        setNotice({
          type: "error",
          title: status === 409 ? "Duplicate record" : "Unable to save",
          message:
            data?.message ||
            "Something went wrong while saving. Please try again.",
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const summary = [
    form.employee?.name,
    form.date,
    form.timeIn && `In ${to12h(form.timeIn)}`,
    form.timeOut &&
      `Out ${to12h(form.timeOut)}${form.nextDay ? " (next day)" : ""}`,
  ]
    .filter(Boolean)
    .join(" · ");

  const alertContent = {
    confirm: {
      title: isEdit ? "Save changes?" : "Add attendance record?",
      description: `${summary}. This will be recorded as a manual entry.`,
      cancel: "Review",
      action: isEdit ? "Save changes" : "Add attendance",
      onAction: (e) => {
        e.preventDefault();
        save();
      },
    },
    discard: {
      title: "Discard changes?",
      description:
        "You have unsaved changes. If you close now, they will be lost.",
      cancel: "Keep editing",
      action: "Discard",
      destructive: true,
      onAction: () => {
        setNotice(null);
        onClose();
      },
    },
    error: {
      title: notice?.title,
      description: notice?.message,
      action: "OK",
      onAction: () => setNotice(null),
    },
  }[notice?.type];

  return (
    <>
      <Dialog open onOpenChange={(open) => !open && requestClose()}>
        <DialogContent
          className="sm:max-w-xl"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>
              {isEdit ? "Edit attendance" : "Add attendance"}
            </DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Update the times or replace a photo."
                : "Record a time in and time out for an employee."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <Label htmlFor="dtr-employee">Employee number</Label>
              <div className="mt-1.5">
                <EmployeePicker
                  id="dtr-employee"
                  value={form.employee}
                  onChange={(employee) => setField("employee", employee)}
                  invalid={Boolean(errors.employee)}
                  disabled={isEdit || saving}
                />
              </div>
              <FieldError message={errors.employee} />
            </div>

            <div>
              <Label htmlFor="dtr-date">Date</Label>
              <Input
                id="dtr-date"
                type="date"
                className="mt-1.5"
                value={form.date}
                max={todayString()}
                onChange={(e) => setField("date", e.target.value)}
                aria-invalid={Boolean(errors.date)}
                disabled={saving}
              />
              <FieldError message={errors.date} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dtr-timeIn">Time in</Label>
                <Input
                  id="dtr-timeIn"
                  type="time"
                  className="mt-1.5"
                  value={form.timeIn}
                  onChange={(e) => setField("timeIn", e.target.value)}
                  aria-invalid={Boolean(errors.timeIn)}
                  disabled={saving}
                />
                <FieldError message={errors.timeIn} />
              </div>
              <div>
                <Label htmlFor="dtr-timeOut">Time out</Label>
                <Input
                  id="dtr-timeOut"
                  type="time"
                  className="mt-1.5"
                  value={form.timeOut}
                  onChange={(e) => setField("timeOut", e.target.value)}
                  aria-invalid={Boolean(errors.timeOut)}
                  disabled={saving}
                />
                <FieldError message={errors.timeOut} />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.nextDay}
                onChange={(e) => setField("nextDay", e.target.checked)}
                disabled={saving}
              />
              Time out is on the next day (night shift)
            </label>

            <div className="grid grid-cols-2 gap-4">
              <PhotoField
                label="Time in photo"
                file={form.inFile}
                existingPath={
                  record?.has_time_in_image
                    ? `/dtr/attendances/${record.id}/image/in?v=${record.photo_version ?? ""}`
                    : null
                }
                error={errors.inFile}
                disabled={saving}
                onSelect={(file) => setPhoto("inFile", file)}
                onClear={() => setField("inFile", null)}
              />
              <PhotoField
                label="Time out photo"
                file={form.outFile}
                existingPath={
                  record?.has_time_out_image
                    ? `/dtr/attendances/${record.id}/image/out?v=${record.photo_version ?? ""}`
                    : null
                }
                error={errors.outFile}
                disabled={saving}
                onSelect={(file) => setPhoto("outFile", file)}
                onClear={() => setField("outFile", null)}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={requestClose}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {isEdit ? "Save changes" : "Add attendance"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(notice)}
        onOpenChange={(open) => !open && !saving && setNotice(null)}
      >
        {alertContent && (
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{alertContent.title}</AlertDialogTitle>
              <AlertDialogDescription>
                {alertContent.description}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              {alertContent.cancel && (
                <AlertDialogCancel disabled={saving}>
                  {alertContent.cancel}
                </AlertDialogCancel>
              )}
              <AlertDialogAction
                disabled={saving}
                onClick={alertContent.onAction}
                className={
                  alertContent.destructive
                    ? "bg-red-600 hover:bg-red-700"
                    : undefined
                }
              >
                {saving && notice?.type === "confirm"
                  ? "Saving..."
                  : alertContent.action}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        )}
      </AlertDialog>
    </>
  );
}

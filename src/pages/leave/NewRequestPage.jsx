import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { PageHeader } from "./PageHeader";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FormField, Input, Textarea, Select } from "./FormField";
import { useToast } from "./Toast";
import { LEAVE_TYPES, EMPLOYEES, CURRENT_USER } from "./mockData";
import { Upload, AlertCircle, Info, CalendarDays } from "lucide-react";
import { daysBetween, formatDate } from "./utils";

const schema = z
  .object({
    employeeId: z.string().min(1, "Employee is required"),
    leaveType: z.string().min(1, "Leave type is required"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    reason: z
      .string()
      .min(10, "Reason must be at least 10 characters")
      .max(500, "Max 500 characters"),
    emergencyContact: z.string().optional(),
    halfDay: z.boolean().optional(),
  })
  .refine((d) => new Date(d.endDate) >= new Date(d.startDate), {
    message: "End date cannot be before start date",
    path: ["endDate"],
  });

export default function NewRequestPage({ onNavigate }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [halfDay, setHalfDay] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [attachment, setAttachment] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { employeeId: CURRENT_USER.id, halfDay: false },
  });

  const startDate = watch("startDate");
  const endDate = watch("endDate");
  const reason = watch("reason") || "";
  const days =
    startDate && endDate && new Date(endDate) >= new Date(startDate)
      ? halfDay
        ? 0.5
        : daysBetween(startDate, endDate)
      : 0;

  const onSubmit = async (data) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    toast({
      title: "Leave Request Submitted",
      description: "Your request is pending approval.",
      variant: "success",
    });
    reset();
    onNavigate("requests");
  };

  return (
    <div className="p-5">
      <PageHeader
        title="Apply for Leave"
        description="Submit a new leave request for approval"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="lg:col-span-2 space-y-5"
        >
          <Card>
            <CardHeader>
              <CardTitle>Leave Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                label="Employee"
                required
                error={errors.employeeId?.message}
              >
                <Select {...register("employeeId")} error={!!errors.employeeId}>
                  <option value="">Select employee</option>
                  {EMPLOYEES.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} — {e.department}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField
                label="Leave Type"
                required
                error={errors.leaveType?.message}
              >
                <Select {...register("leaveType")} error={!!errors.leaveType}>
                  <option value="">Select leave type</option>
                  {LEAVE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </Select>
              </FormField>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="Start Date"
                  required
                  error={errors.startDate?.message}
                >
                  <Input
                    type="date"
                    {...register("startDate")}
                    error={!!errors.startDate}
                  />
                </FormField>
                <FormField
                  label="End Date"
                  required
                  error={errors.endDate?.message}
                >
                  <Input
                    type="date"
                    {...register("endDate")}
                    error={!!errors.endDate}
                    min={startDate || undefined}
                  />
                </FormField>
              </div>

              {/* Half Day Toggle */}
              <div className="flex items-center justify-between p-3 rounded-lg border border-[var(--border)] bg-[var(--muted)]/30">
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)]">
                    Half Day
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    Apply for only half a working day
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setHalfDay((v) => !v)}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${halfDay ? "bg-[var(--primary)]" : "bg-[var(--border)]"}`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${halfDay ? "translate-x-5" : "translate-x-0"}`}
                  />
                </button>
              </div>

              <FormField
                label="Reason"
                required
                error={errors.reason?.message}
                hint={`${reason.length}/500 characters`}
              >
                <Textarea
                  rows={4}
                  placeholder="Please describe the reason for your leave request..."
                  {...register("reason")}
                  error={!!errors.reason}
                />
              </FormField>

              <FormField
                label="Emergency Contact"
                hint="Optional – contact person during your leave"
              >
                <Input
                  placeholder="Name and phone number"
                  {...register("emergencyContact")}
                />
              </FormField>
            </CardContent>
          </Card>

          {/* Attachment */}
          <Card>
            <CardHeader>
              <CardTitle>Attachment</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const file = e.dataTransfer.files[0];
                  if (file) setAttachment(file);
                }}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
                  dragOver
                    ? "border-[var(--primary)] bg-[var(--accent)]"
                    : "border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--muted)]/30"
                }`}
                onClick={() => document.getElementById("file-input").click()}
              >
                <input
                  id="file-input"
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={(e) => setAttachment(e.target.files[0])}
                />
                <Upload className="w-8 h-8 text-[var(--muted-foreground)] mx-auto mb-3" />
                {attachment ? (
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)]">
                      {attachment.name}
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {(attachment.size / 1024).toFixed(1)} KB
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAttachment(null);
                      }}
                      className="text-xs text-red-600 mt-1 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-medium text-[var(--foreground)]">
                      Drop files here or click to upload
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)] mt-1">
                      PDF, JPG, PNG, DOC up to 10MB
                    </p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button type="submit" loading={loading} className="flex-1">
              Submit Leave Request
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onNavigate("requests")}
            >
              Cancel
            </Button>
          </div>
        </form>

        {/* Summary Card */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-[var(--primary)]" />
                <CardTitle>Request Summary</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {days > 0 ? (
                <div className="text-center p-4 bg-[var(--accent)] rounded-xl">
                  <p className="text-4xl font-bold text-[var(--primary)]">
                    {days}
                  </p>
                  <p className="text-sm text-[var(--muted-foreground)] mt-1">
                    {days === 1 ? "day" : "days"} requested
                  </p>
                </div>
              ) : (
                <div className="text-center p-4 bg-[var(--muted)] rounded-xl">
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Select dates to preview
                  </p>
                </div>
              )}
              {startDate && (
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--muted-foreground)]">From</span>
                  <span className="font-medium">{formatDate(startDate)}</span>
                </div>
              )}
              {endDate && (
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--muted-foreground)]">To</span>
                  <span className="font-medium">{formatDate(endDate)}</span>
                </div>
              )}
              {halfDay && (
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--muted-foreground)]">Type</span>
                  <span className="font-medium">Half Day</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Policy Info */}
          <Card>
            <CardContent className="pt-5">
              <div className="flex gap-2">
                <Info className="w-4 h-4 text-[var(--primary)] flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-[var(--foreground)]">
                    Leave Policy
                  </p>
                  {[
                    "Submit requests at least 3 days in advance",
                    "Medical certificate required for sick leave > 3 days",
                    "Emergency leaves need manager confirmation",
                    "Unused vacation is carried forward up to 5 days",
                  ].map((p, i) => (
                    <p
                      key={i}
                      className="text-xs text-[var(--muted-foreground)] flex items-start gap-1.5"
                    >
                      <span className="w-1 h-1 rounded-full bg-[var(--muted-foreground)] mt-1.5 flex-shrink-0" />
                      {p}
                    </p>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Available Balance */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Available Balance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Vacation", remaining: 16, total: 21 },
                { label: "Sick", remaining: 14, total: 15 },
                { label: "Emergency", remaining: 5, total: 5 },
              ].map((b) => (
                <div key={b.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[var(--muted-foreground)]">
                      {b.label}
                    </span>
                    <span className="font-medium text-[var(--foreground)]">
                      {b.remaining}/{b.total}
                    </span>
                  </div>
                  <div className="h-1.5 bg-[var(--muted)] rounded-full">
                    <div
                      className="h-full bg-[var(--primary)] rounded-full"
                      style={{ width: `${(b.remaining / b.total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

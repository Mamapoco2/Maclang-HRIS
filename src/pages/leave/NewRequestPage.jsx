import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "./PageHeader";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FormField, Input, Textarea, Select } from "./FormField";
import { useToast } from "./Toast";
import { LEAVE_TYPES, CURRENT_USER, LEAVE_BALANCES } from "./mockData";
import {
  LEAVE_TYPE_MAP,
  HIDE_DATE_SELECTION,
} from "./leavePolicy";
import { LeaveTypeFields } from "./components/LeaveTypeFields";
import { LeaveRequirementsPanel } from "./components/LeaveRequirementsPanel";
import { CalendarDays, User, Building2, Briefcase } from "lucide-react";
import { daysBetween, formatDate } from "./utils";

export default function NewRequestPage({ onNavigate }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploads, setUploads] = useState({});
  const [vawcFiles, setVawcFiles] = useState([]);

  const goTo = (page) => {
    const routes = {
      requests: "/leaveRequest",
      dashboard: "/leaveDashboard",
    };
    if (onNavigate) onNavigate(page);
    else navigate(routes[page] || "/leaveDashboard");
  };

  const employee = CURRENT_USER;
  const balance = LEAVE_BALANCES.find((b) => b.employeeId === employee.id);

  const {
    register,
    handleSubmit,
    watch,
    reset,
  } = useForm({
    defaultValues: {
      leaveType: "",
      startDate: "",
      endDate: "",
      reason: "",
      destination: "within_ph",
      locationType: "within_ph",
    },
  });

  const leaveType = watch("leaveType");
  const startDate = watch("startDate");
  const endDate = watch("endDate");
  const reason = watch("reason") || "";
  const hideDates = HIDE_DATE_SELECTION.has(leaveType);
  const typeConfig = LEAVE_TYPE_MAP[leaveType];

  const days =
    !hideDates && startDate && endDate && new Date(endDate) >= new Date(startDate)
      ? daysBetween(startDate, endDate)
      : hideDates && leaveType === "monetization"
        ? watch("creditsToMonetize") || "—"
        : 0;

  const setUpload = (key, file) => {
    setUploads((prev) => {
      const next = { ...prev };
      if (file) next[key] = file;
      else delete next[key];
      return next;
    });
  };

  const uploadedFilesForPanel = { ...uploads };
  if (leaveType === "vawc" && vawcFiles.length > 0) {
    vawcFiles.forEach((f, i) => {
      uploadedFilesForPanel[`vawc_${i}`] = f;
    });
    uploadedFilesForPanel.bpo = vawcFiles[0];
  }

  const onSubmit = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    toast({
      title: "Leave Request Submitted",
      description: "Your request is pending approval.",
      variant: "success",
    });
    reset();
    setUploads({});
    setVawcFiles([]);
    goTo("requests");
  };

  const LeaveTypeIcon = typeConfig?.icon;

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Leave Application"
        description="Submit a leave request in accordance with CSC leave policies"
        breadcrumbs={["Leave Management", "Apply for Leave"]}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <form onSubmit={handleSubmit(onSubmit)} className="xl:col-span-2 space-y-5">
          {/* Employee Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[var(--primary)]" />
                <CardTitle>Employee Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[var(--muted)]/40 border border-[var(--border)]">
                <div>
                  <p className="text-xs text-[var(--muted-foreground)] mb-0.5">Full Name</p>
                  <p className="text-sm font-semibold">{employee.name}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--muted-foreground)] mb-0.5 flex items-center gap-1">
                    <Building2 className="w-3 h-3" /> Department
                  </p>
                  <p className="text-sm font-semibold">{employee.department}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--muted-foreground)] mb-0.5 flex items-center gap-1">
                    <Briefcase className="w-3 h-3" /> Designation
                  </p>
                  <p className="text-sm font-semibold">{employee.designation}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--muted-foreground)] mb-0.5">Email</p>
                  <p className="text-sm font-semibold truncate">{employee.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Leave Details */}
          <Card>
            <CardHeader>
              <CardTitle>Leave Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField label="Leave Type" required>
                <Select {...register("leaveType")}>
                  <option value="">Select leave type</option>
                  {LEAVE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </Select>
              </FormField>

              {typeConfig && LeaveTypeIcon && (
                <div
                  className="flex items-center gap-2 p-2.5 rounded-lg text-sm"
                  style={{ backgroundColor: typeConfig.bg, color: typeConfig.color }}
                >
                  <LeaveTypeIcon className="w-4 h-4" />
                  <span className="font-medium">{typeConfig.label}</span>
                </div>
              )}

              {!hideDates && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label="Start Date" required>
                      <Input type="date" {...register("startDate")} />
                    </FormField>
                    <FormField label="End Date" required>
                      <Input
                        type="date"
                        {...register("endDate")}
                        min={startDate || undefined}
                      />
                    </FormField>
                  </div>

                  <FormField label="Number of Days" hint="Auto-calculated from date range">
                    <Input
                      readOnly
                      value={days > 0 ? `${days} day${days !== 1 ? "s" : ""}` : "—"}
                      className="bg-[var(--muted)]/50 cursor-not-allowed"
                    />
                  </FormField>
                </>
              )}

              <FormField
                label="Reason for Leave"
                required={leaveType !== "monetization"}
                hint={`${reason.length}/500 characters`}
              >
                <Textarea
                  rows={4}
                  maxLength={500}
                  placeholder="Please describe the reason for your leave request..."
                  {...register("reason")}
                />
              </FormField>

              <LeaveTypeFields
                leaveType={leaveType}
                register={register}
                uploads={uploads}
                setUpload={setUpload}
                setMultiUpload={setVawcFiles}
                vawcFiles={vawcFiles}
              />
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button type="submit" loading={loading} className="flex-1">
              Submit Leave Request
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => goTo("requests")}
            >
              Cancel
            </Button>
          </div>
        </form>

        {/* Right Sidebar */}
        <div className="space-y-4">
          <LeaveRequirementsPanel
            leaveType={leaveType}
            uploadedFiles={uploadedFilesForPanel}
          />

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-[var(--primary)]" />
                <CardTitle className="text-base">Leave Summary</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {!hideDates && days > 0 ? (
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/30 rounded-xl">
                  <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                    {days}
                  </p>
                  <p className="text-sm text-[var(--muted-foreground)] mt-1">
                    {days === 1 ? "day" : "days"} requested
                  </p>
                </div>
              ) : hideDates && leaveType === "monetization" ? (
                <div className="text-center p-4 bg-amber-50 dark:bg-amber-950/30 rounded-xl">
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    {watch("creditsToMonetize") || "—"}
                  </p>
                  <p className="text-sm text-[var(--muted-foreground)] mt-1">
                    credits to monetize
                  </p>
                </div>
              ) : (
                <div className="text-center p-4 bg-[var(--muted)] rounded-xl">
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {hideDates ? "No date range required" : "Select dates to preview"}
                  </p>
                </div>
              )}
              {startDate && !hideDates && (
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--muted-foreground)]">From</span>
                  <span className="font-medium">{formatDate(startDate)}</span>
                </div>
              )}
              {endDate && !hideDates && (
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--muted-foreground)]">To</span>
                  <span className="font-medium">{formatDate(endDate)}</span>
                </div>
              )}
              {typeConfig && (
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--muted-foreground)]">Type</span>
                  <span className="font-medium text-right max-w-[60%] truncate">
                    {typeConfig.label}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {balance && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Available Balance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "Vacation", data: balance.vacation, color: "#3b82f6" },
                  { label: "Sick", data: balance.sick, color: "#f59e0b" },
                ].map((b) => {
                  const remaining = b.data.total - b.data.used + b.data.carryForward;
                  return (
                    <div key={b.label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[var(--muted-foreground)]">{b.label}</span>
                        <span className="font-medium">
                          {remaining}/{b.data.total}
                        </span>
                      </div>
                      <div className="h-1.5 bg-[var(--muted)] rounded-full">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min((remaining / b.data.total) * 100, 100)}%`,
                            background: b.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

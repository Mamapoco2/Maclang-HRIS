import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "./PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FormField, Input, Textarea, Select } from "./FormField";
import { useToast } from "./Toast";
import { useAuth } from "@/hooks/useAuth";
import LeaveApi from "@/services/leaveApiService";
import {
  LEAVE_TYPE_MAP,
  HIDE_DATE_SELECTION,
  LEAVE_DETAIL_FIELDS,
} from "./leavePolicy";
import { LeaveTypeFields } from "./components/LeaveTypeFields";
import { LeaveRequirementsPanel } from "./components/LeaveRequirementsPanel";
import {
  CalendarDays,
  User,
  Building2,
  Briefcase,
  Loader2,
} from "lucide-react";
import { daysBetween, formatDate } from "./utils";

function extractErrorMessage(err, fallback) {
  const response = err?.response;
  if (!response) return fallback;
  const errors = response.data?.errors;
  if (errors && typeof errors === "object") {
    const firstField = Object.keys(errors)[0];
    const firstMessage = errors[firstField]?.[0];
    if (firstMessage) return firstMessage;
  }
  return response.data?.message || fallback;
}

export default function NewRequestPage({ onNavigate }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const employee = user?.employee ?? null;

  const [loading, setLoading] = useState(false);
  const [uploads, setUploads] = useState({});
  const [vawcFiles, setVawcFiles] = useState([]);

  const [leaveTypes, setLeaveTypes] = useState([]);
  const [typesLoading, setTypesLoading] = useState(true);
  const [typesError, setTypesError] = useState(null);

  const [balances, setBalances] = useState([]);
  const [balancesLoading, setBalancesLoading] = useState(true);

  const goTo = (page) => {
    const routes = {
      requests: "/leaveRequest",
      dashboard: "/leaveDashboard",
    };
    if (onNavigate) onNavigate(page);
    else navigate(routes[page] || "/leaveDashboard");
  };

  // ─── Load active/eligible leave types for this employee ──────────────────
  useEffect(() => {
    let cancelled = false;

    LeaveApi.listTypes()
      .then((data) => {
        if (!cancelled) setLeaveTypes(data ?? []);
      })
      .catch((err) => {
        if (!cancelled) {
          setTypesError(
            extractErrorMessage(err, "Failed to load leave types."),
          );
        }
      })
      .finally(() => {
        if (!cancelled) setTypesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // ─── Load this employee's balances for the current year ──────────────────
  useEffect(() => {
    if (!employee?.id) {
      setBalancesLoading(false);
      return;
    }

    let cancelled = false;
    setBalancesLoading(true);

    LeaveApi.getMyBalances(employee.id, new Date().getFullYear())
      .then((data) => {
        if (!cancelled) setBalances(data ?? []);
      })
      .catch(() => {
        if (!cancelled) setBalances([]);
      })
      .finally(() => {
        if (!cancelled) setBalancesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [employee?.id]);

  const { register, handleSubmit, watch, reset } = useForm({
    defaultValues: {
      leaveType: "",
      startDate: "",
      endDate: "",
      isHalfDay: false,
      reason: "",
      destination: "within_ph",
      locationType: "within_ph",
    },
  });

  const leaveType = watch("leaveType");
  const startDate = watch("startDate");
  const endDate = watch("endDate");
  const isHalfDay = watch("isHalfDay");
  const reason = watch("reason") || "";
  const hideDates = HIDE_DATE_SELECTION.has(leaveType);

  // Server-provided leave type record (id, code, color, max_days, ...)
  const serverType = useMemo(
    () => leaveTypes.find((t) => t.code === leaveType) ?? null,
    [leaveTypes, leaveType],
  );
  // Local presentation config (icon, bg, notices) keyed by the same code.
  const typeConfig = LEAVE_TYPE_MAP[leaveType];

  const days =
    !hideDates &&
    startDate &&
    endDate &&
    new Date(endDate) >= new Date(startDate)
      ? isHalfDay
        ? 0.5
        : daysBetween(startDate, endDate)
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

  const onSubmit = async (formValues) => {
    if (!employee?.id) {
      toast({
        title: "No linked employee record",
        description: "Your account isn't linked to an employee profile yet.",
        variant: "error",
      });
      return;
    }

    if (!serverType) {
      toast({
        title: "Select a leave type",
        description: "Please choose a valid, active leave type.",
        variant: "error",
      });
      return;
    }

    const detailKeys = LEAVE_DETAIL_FIELDS[leaveType] ?? [];
    const details = detailKeys.reduce((acc, key) => {
      const value = formValues[key];
      if (value !== undefined && value !== null && value !== "") {
        acc[key] = value;
      }
      return acc;
    }, {});

    const fields = {
      employee_id: employee.id,
      leave_type_id: serverType.id,
      start_date: hideDates ? undefined : formValues.startDate,
      end_date: hideDates ? undefined : formValues.endDate,
      is_half_day: hideDates ? undefined : !!formValues.isHalfDay,
      reason: formValues.reason,
      details,
    };

    setLoading(true);
    try {
      await LeaveApi.submitRequest(fields, uploads, vawcFiles);
      toast({
        title: "Leave Request Submitted",
        description: "Your request is pending approval.",
        variant: "success",
      });
      reset();
      setUploads({});
      setVawcFiles([]);
      goTo("requests");
    } catch (err) {
      toast({
        title: "Submission Failed",
        description: extractErrorMessage(
          err,
          "Something went wrong while submitting your request.",
        ),
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const LeaveTypeIcon = typeConfig?.icon;

  const balanceRows = useMemo(() => {
    return leaveTypes.map((t) => {
      const record = balances.find(
        (b) => b.leave_type?.code === t.code || b.leave_type_id === t.id,
      );
      const available = record ? Number(record.available) : 0;
      const used = record ? Number(record.used) : 0;
      return {
        code: t.code,
        label: t.name,
        color: t.color || "#3b82f6",
        available,
        used,
        total: available + used,
      };
    });
  }, [leaveTypes, balances]);

  return (
    <div className="p-4 md:p-6 max-w-screeen mx-auto">
      <PageHeader
        title="Leave Application"
        description="Submit a leave request in accordance with CSC leave policies"
      />

      {typesError && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          {typesError}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="xl:col-span-2 space-y-5"
        >
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
                  <p className="text-xs text-[var(--muted-foreground)] mb-0.5">
                    Full Name
                  </p>
                  <p className="text-sm font-semibold">
                    {employee?.full_name ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--muted-foreground)] mb-0.5 flex items-center gap-1">
                    <Building2 className="w-3 h-3" /> Department
                  </p>
                  <p className="text-sm font-semibold">
                    {employee?.department?.name ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--muted-foreground)] mb-0.5 flex items-center gap-1">
                    <Briefcase className="w-3 h-3" /> Designation
                  </p>
                  <p className="text-sm font-semibold">
                    {employee?.position ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--muted-foreground)] mb-0.5">
                    Email
                  </p>
                  <p className="text-sm font-semibold truncate">
                    {user?.email ?? "—"}
                  </p>
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
                <Select {...register("leaveType")} disabled={typesLoading}>
                  <option value="">
                    {typesLoading
                      ? "Loading leave types..."
                      : "Select leave type"}
                  </option>
                  {leaveTypes.map((t) => (
                    <option key={t.id} value={t.code}>
                      {t.name}
                    </option>
                  ))}
                </Select>
              </FormField>

              {typeConfig && LeaveTypeIcon && (
                <div
                  className="flex items-center gap-2 p-2.5 rounded-lg text-sm"
                  style={{
                    backgroundColor: typeConfig.bg,
                    color: typeConfig.color,
                  }}
                >
                  <LeaveTypeIcon className="w-4 h-4" />
                  <span className="font-medium">{typeConfig.label}</span>
                  {serverType?.max_days != null && (
                    <span className="ml-auto text-xs opacity-75">
                      Max {serverType.max_days} day
                      {serverType.max_days === 1 ? "" : "s"}
                    </span>
                  )}
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

                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      {...register("isHalfDay")}
                      className="accent-[var(--primary)]"
                    />
                    Half-day leave
                  </label>

                  <FormField
                    label="Number of Days"
                    hint="Auto-calculated from date range"
                  >
                    <Input
                      readOnly
                      value={
                        days > 0 ? `${days} day${days !== 1 ? "s" : ""}` : "—"
                      }
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
            <Button type="submit" disabled={loading} className="flex-1">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
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
                    {hideDates
                      ? "No date range required"
                      : "Select dates to preview"}
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

          {balancesLoading ? (
            <Card>
              <CardContent className="py-6 text-center text-sm text-[var(--muted-foreground)]">
                Loading balances...
              </CardContent>
            </Card>
          ) : (
            balanceRows.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Available Balance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {balanceRows.map((b) => (
                    <div key={b.code}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[var(--muted-foreground)]">
                          {b.label}
                        </span>
                        <span className="font-medium">
                          {b.available}/{b.total}
                        </span>
                      </div>
                      <div className="h-1.5 bg-[var(--muted)] rounded-full">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${b.total > 0 ? Math.min((b.available / b.total) * 100, 100) : 0}%`,
                            background: b.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )
          )}
        </div>
      </div>
    </div>
  );
}

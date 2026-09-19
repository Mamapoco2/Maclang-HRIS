import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { PageHeader } from "./PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FormField, Input, Textarea, Select } from "./FormField";
import { useAuth } from "@/hooks/useAuth";
import LeaveApi from "@/services/leaveApiService";
import {
  LEAVE_TYPE_MAP,
  HIDE_DATE_SELECTION,
  LEAVE_DETAIL_FIELDS,
  groupLeaveTypesByCategory,
} from "./leavePolicy";
import { LeaveTypeFields } from "./components/LeaveTypeFields";
import { LeaveRequirementsPanel } from "./components/LeaveRequirementsPanel";
import { LeaveCreditsPanel } from "./components/LeaveCreditsPanel";
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
  const [searchParams] = useSearchParams();
  const draftId = searchParams.get("draft");
  const { user } = useAuth();
  const employee = user?.employee ?? null;

  const [loading, setLoading] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [uploads, setUploads] = useState({});
  const [vawcFiles, setVawcFiles] = useState([]);

  const [leaveTypes, setLeaveTypes] = useState([]);
  const [typesLoading, setTypesLoading] = useState(true);
  const [typesError, setTypesError] = useState(null);

  const [balances, setBalances] = useState([]);
  const [balancesLoading, setBalancesLoading] = useState(true);

  const [loadingDraft, setLoadingDraft] = useState(false);
  const [draftLoadError, setDraftLoadError] = useState(null);

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

  const { register, handleSubmit, watch, reset, getValues } = useForm({
    defaultValues: {
      leaveType: "",
      startDate: "",
      endDate: "",
      reason: "",
      destination: "within_ph",
      locationType: "within_ph",
    },
  });

  // ─── Load an existing draft into the form when ?draft=<id> is present ────
  useEffect(() => {
    if (!draftId) return;

    let cancelled = false;
    setLoadingDraft(true);
    setDraftLoadError(null);

    LeaveApi.getRequest(draftId)
      .then((data) => {
        if (cancelled) return;
        const details =
          data?.details && typeof data.details === "object" ? data.details : {};
        reset({
          leaveType: data?.leave_type?.code || "",
          startDate: data?.start_date || "",
          endDate: data?.end_date || "",
          reason: data?.reason || "",
          destination: "within_ph",
          locationType: "within_ph",
          ...details,
        });
      })
      .catch((err) => {
        if (!cancelled) {
          setDraftLoadError(
            extractErrorMessage(err, "Failed to load your draft."),
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingDraft(false);
      });

    return () => {
      cancelled = true;
    };
  }, [draftId, reset]);

  const leaveType = watch("leaveType");
  const startDate = watch("startDate");
  const endDate = watch("endDate");
  const reason = watch("reason") || "";
  const hideDates = HIDE_DATE_SELECTION.has(leaveType);

  const serverType = useMemo(
    () => leaveTypes.find((t) => t.code === leaveType) ?? null,
    [leaveTypes, leaveType],
  );
  const leaveTypeGroups = useMemo(
    () => groupLeaveTypesByCategory(leaveTypes),
    [leaveTypes],
  );
  const typeConfig = LEAVE_TYPE_MAP[leaveType];

  const days =
    !hideDates &&
    startDate &&
    endDate &&
    new Date(endDate) >= new Date(startDate)
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

  // ─── Shape form values into the payload the API expects ─────────────────
  const buildFields = (formValues) => {
    const detailKeys = LEAVE_DETAIL_FIELDS[formValues.leaveType] || [];
    const details = {};
    detailKeys.forEach((key) => {
      const value = formValues[key];
      if (value !== undefined && value !== "") details[key] = value;
    });

    return {
      employee_id: employee?.id,
      leave_type_id: serverType?.id,
      start_date: hideDates ? undefined : formValues.startDate,
      end_date: hideDates ? undefined : formValues.endDate,
      reason: formValues.reason,
      details,
    };
  };

  const onSubmit = async (formValues) => {
    if (!employee?.id) {
      toast.error("No linked employee record", {
        description: "Your account isn't linked to an employee profile yet.",
      });
      return;
    }

    if (!serverType) {
      toast.error("Select a leave type", {
        description: "Please choose a valid, active leave type.",
      });
      return;
    }

    const fields = buildFields(formValues);

    setLoading(true);
    try {
      if (draftId) {
        await LeaveApi.submitDraft(draftId, fields, uploads, vawcFiles);
      } else {
        await LeaveApi.submitRequest(fields, uploads, vawcFiles);
      }
      toast.success("Leave Request Submitted", {
        description: "Your request is pending approval.",
      });
      reset();
      setUploads({});
      setVawcFiles([]);
      goTo("requests");
    } catch (err) {
      toast.error("Submission Failed", {
        description: extractErrorMessage(
          err,
          "Something went wrong while submitting your request.",
        ),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!employee?.id) {
      toast.error("No linked employee record", {
        description: "Your account isn't linked to an employee profile yet.",
      });
      return;
    }

    if (!serverType) {
      toast.error("Select a leave type", {
        description: "Please choose a leave type before saving a draft.",
      });
      return;
    }

    const fields = buildFields(getValues());

    setSavingDraft(true);
    try {
      if (draftId) {
        await LeaveApi.updateDraft(draftId, fields, uploads, vawcFiles);
        toast.success("Draft updated");
      } else {
        await LeaveApi.saveDraft(fields, uploads, vawcFiles);
        toast.success("Draft saved", {
          description: "You can continue this later from My Leave Requests.",
        });
      }
      goTo("requests");
    } catch (err) {
      toast.error("Failed to save draft", {
        description: extractErrorMessage(
          err,
          "Something went wrong while saving your draft.",
        ),
      });
    } finally {
      setSavingDraft(false);
    }
  };

  const LeaveTypeIcon = typeConfig?.icon;

  return (
    <div className="p-4 md:p-6 max-w-screeen mx-auto">
      <PageHeader
        title={draftId ? "Continue Draft" : "Leave Application"}
        description={
          draftId
            ? "Finish filling out your saved draft, then submit it for approval."
            : "Submit a leave request in accordance with CSC leave policies"
        }
      />

      {typesError && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          {typesError}
        </div>
      )}

      {draftLoadError && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          {draftLoadError}
        </div>
      )}

      {loadingDraft && (
        <div className="mb-4 p-3 rounded-lg bg-[var(--muted)] border border-[var(--border)] text-sm text-[var(--muted-foreground)] flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading your draft…
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
                    {Array.isArray(employee?.position_designation)
                      ? employee.position_designation
                          .filter(Boolean)
                          .join(", ") || "—"
                      : (employee?.position_designation ?? "—")}
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
                  {leaveTypeGroups
                    ? leaveTypeGroups.map((group) => (
                        <optgroup key={group.label} label={group.label}>
                          {group.options.map((t) => (
                            <option key={t.id} value={t.code}>
                              {t.name}
                            </option>
                          ))}
                        </optgroup>
                      ))
                    : leaveTypes.map((t) => (
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
            <Button
              type="submit"
              disabled={loading || savingDraft || loadingDraft}
              className="flex-1"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Submit Leave Request
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={loading || savingDraft || loadingDraft}
              onClick={handleSaveDraft}
            >
              {savingDraft && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save as Draft
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
        <div className="xl:col-span-1 space-y-4">
          <LeaveRequirementsPanel
            leaveType={leaveType}
            uploadedFiles={uploadedFilesForPanel}
            serverType={serverType}
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

          <LeaveCreditsPanel
            leaveTypes={leaveTypes}
            balances={balances}
            loading={typesLoading || balancesLoading}
            selectedLeaveType={leaveType}
          />
        </div>
      </div>
    </div>
  );
}

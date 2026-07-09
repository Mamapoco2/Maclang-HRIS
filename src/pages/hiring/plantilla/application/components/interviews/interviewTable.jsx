import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarClock, MessageSquareText } from "lucide-react";
import { toast } from "sonner";
import { plantillaPostingService } from "@/services/plantillaPostingService";
import ScheduleInterviewDialog from "./scheduleInterviewDialog";
import CancelInterviewDialog from "./cancelInterviewDialog";
import {
  candidateName,
  formatLabel,
  STAGE_STATUS,
  OVERALL_STATUS,
  STAGE_COLORS,
} from "../psbUtils";

const SCHEDULE_FIELD = {
  hr_status: "hr_scheduled_at",
};

// Statuses that need extra input before they can be saved, and which
// field on the interview record holds that extra input.
const CANCEL_FIELD = {
  hr_status: "hr_cancellation_reason",
};

const STAGE_LABELS = {
  hr_status: "Initial review",
};

// Dot color per status, following the pipeline from the notes:
// Pending -> Scheduled -> In Progress -> Passed/Failed, with
// Cancelled and No Show as exit states.
const STAGE_DOT_COLORS = {
  PENDING: "bg-gray-300",
  SCHEDULED: "bg-blue-400",
  "IN PROGRESS": "bg-amber-400",
  PASSED: "bg-emerald-500",
  FAILED: "bg-red-500",
  CANCELLED: "bg-red-400",
  "NO SHOW": "bg-slate-400",
  SKIPPED: "bg-gray-300",
};

function formatScheduledAt(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function InterviewTable({ applications, onUpdate }) {
  const [scheduleTarget, setScheduleTarget] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const columnCount = 5;

  const handleFieldChange = async (application, field, value) => {
    if (value === "SCHEDULED" && SCHEDULE_FIELD[field]) {
      setScheduleTarget({ application, field });
      return;
    }

    if (value === "CANCELLED" && CANCEL_FIELD[field]) {
      setCancelTarget({ application, field });
      return;
    }

    try {
      const updated = await plantillaPostingService.saveApplicationInterview(
        application.id,
        { [field]: value },
      );
      onUpdate(application.id, { interview: updated });
      toast.success("Interview updated.");
    } catch (err) {
      toast.error(
        err?.response?.data?.message ?? "Failed to update interview.",
      );
    }
  };

  const handleScheduled = (updatedInterview) => {
    onUpdate(scheduleTarget.application.id, { interview: updatedInterview });
    setScheduleTarget(null);
  };

  const handleCancelled = (updatedInterview) => {
    onUpdate(cancelTarget.application.id, { interview: updatedInterview });
    setCancelTarget(null);
  };

  return (
    <Card>
      <CardContent className="p-4">
        <Table>
          <TableHeader>
            {/* Group header clarifies that HR is a stage of the pipeline,
                not just an unrelated field */}
            <TableRow className="border-b-0 bg-gray-50/60 hover:bg-gray-50/60">
              <TableHead colSpan={3} />
              <TableHead
                colSpan={1}
                className="border-l border-gray-200 pb-0 text-center text-[10px] font-semibold tracking-wide text-gray-400"
              >
                INTERVIEW STAGE
              </TableHead>
              <TableHead className="pb-0" />
            </TableRow>
            <TableRow className="bg-gray-50">
              <TableHead>Candidate</TableHead>
              <TableHead>Position Title</TableHead>
              <TableHead>Plantilla Item No.</TableHead>
              {Object.values(STAGE_LABELS).map((label, i) => (
                <TableHead
                  key={label}
                  className={`text-center ${i === 0 ? "border-l border-gray-200" : ""}`}
                >
                  {label}
                </TableHead>
              ))}
              <TableHead>Overall Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columnCount}
                  className="py-14 text-center text-sm text-gray-400"
                >
                  No applications found.
                </TableCell>
              </TableRow>
            ) : (
              applications.map((application) => {
                const interview = application.interview;
                return (
                  <TableRow key={application.id}>
                    <TableCell className="font-medium">
                      {candidateName(application.employee)}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {application.posting?.base_item_number ?? "—"}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {application.posting?.title ?? "—"}
                    </TableCell>

                    {["hr_status"].map((field, i) => {
                      const currentStatus = interview?.[field]?.toUpperCase();
                      const scheduledAt =
                        currentStatus === "SCHEDULED"
                          ? formatScheduledAt(
                              interview?.[SCHEDULE_FIELD[field]],
                            )
                          : null;
                      const cancellationReason =
                        currentStatus === "CANCELLED"
                          ? interview?.[CANCEL_FIELD[field]]
                          : null;
                      return (
                        <TableCell
                          key={field}
                          className={`text-center ${i === 0 ? "border-l border-gray-100" : ""}`}
                        >
                          <div className="flex flex-col items-center gap-0.5">
                            <Select
                              value={currentStatus ?? ""}
                              onValueChange={(val) =>
                                handleFieldChange(application, field, val)
                              }
                            >
                              <SelectTrigger className="h-7 w-32 justify-center gap-1.5 border-0 p-0 text-xs shadow-none focus:ring-0 [&>svg]:hidden">
                                <SelectValue placeholder="Pending">
                                  <span className="flex items-center gap-1.5">
                                    <span
                                      className={`h-1.5 w-1.5 rounded-full ${STAGE_DOT_COLORS[currentStatus] ?? "bg-gray-300"}`}
                                    />
                                    <span
                                      className={`font-medium ${STAGE_COLORS[currentStatus] ?? "text-gray-400"}`}
                                    >
                                      {currentStatus
                                        ? formatLabel(currentStatus)
                                        : "Pending"}
                                    </span>
                                  </span>
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                {STAGE_STATUS.map((s) => (
                                  <SelectItem
                                    key={s}
                                    value={s}
                                    className="text-xs"
                                  >
                                    {formatLabel(s)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            {scheduledAt && (
                              <button
                                onClick={() =>
                                  setScheduleTarget({ application, field })
                                }
                                className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-indigo-600 hover:underline"
                              >
                                <CalendarClock className="h-3 w-3" />
                                {scheduledAt}
                              </button>
                            )}

                            {currentStatus === "CANCELLED" && (
                              <button
                                onClick={() =>
                                  setCancelTarget({ application, field })
                                }
                                title={cancellationReason || "Add a reason"}
                                className="flex max-w-[8rem] items-center gap-1 text-[10px] text-gray-400 hover:text-red-600 hover:underline"
                              >
                                <MessageSquareText className="h-3 w-3 shrink-0" />
                                <span className="truncate">
                                  {cancellationReason || "Add reason"}
                                </span>
                              </button>
                            )}
                          </div>
                        </TableCell>
                      );
                    })}

                    <TableCell>
                      <Select
                        value={interview?.overall_status?.toUpperCase() ?? ""}
                        onValueChange={(val) =>
                          handleFieldChange(application, "overall_status", val)
                        }
                      >
                        <SelectTrigger className="h-7 w-32 border-0 p-0 text-xs shadow-none focus:ring-0">
                          <SelectValue placeholder="Pending">
                            <span
                              className={`font-medium ${STAGE_COLORS[interview?.overall_status?.toUpperCase()] ?? "text-gray-400"}`}
                            >
                              {interview?.overall_status
                                ? formatLabel(interview.overall_status)
                                : "Pending"}
                            </span>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {OVERALL_STATUS.map((s) => (
                            <SelectItem key={s} value={s} className="text-xs">
                              {formatLabel(s)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>

      <ScheduleInterviewDialog
        target={scheduleTarget}
        onClose={() => setScheduleTarget(null)}
        onSaved={handleScheduled}
      />

      <CancelInterviewDialog
        target={cancelTarget}
        onClose={() => setCancelTarget(null)}
        onSaved={handleCancelled}
      />
    </Card>
  );
}

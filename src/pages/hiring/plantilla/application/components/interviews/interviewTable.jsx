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
import { toast } from "sonner";
import { plantillaPostingService } from "@/services/plantillaPostingService";
import ScheduleInterviewDialog from "./scheduleInterviewDialog";
import {
  candidateName,
  STAGE_STATUS,
  OVERALL_STATUS,
  STAGE_COLORS,
} from "../psbUtils";

const SCHEDULE_FIELD = {
  hr_status: "hr_scheduled_at",
  head_status: "head_scheduled_at",
  final_status: "final_scheduled_at",
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

  const handleFieldChange = async (application, field, value) => {
    if (value === "SCHEDULED" && SCHEDULE_FIELD[field]) {
      setScheduleTarget({ application, field });
      return;
    }

    try {
      const updated = await plantillaPostingService.saveApplicationInterview(
        application.id,
        { [field]: value },
      );
      onUpdate(application.id, { interview: updated });
      toast.success("INTERVIEW UPDATED.");
    } catch (err) {
      toast.error(
        err?.response?.data?.message?.toUpperCase() ??
          "FAILED TO UPDATE INTERVIEW.",
      );
    }
  };

  const handleScheduled = (updatedInterview) => {
    onUpdate(scheduleTarget.application.id, { interview: updatedInterview });
    setScheduleTarget(null);
  };

  return (
    <Card>
      <CardContent className="p-4">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>CANDIDATE</TableHead>
              <TableHead>ITEM NO.</TableHead>
              <TableHead>POSITION</TableHead>
              <TableHead>HR</TableHead>
              <TableHead>HEAD</TableHead>
              <TableHead>FINAL</TableHead>
              <TableHead>OVERALL STATUS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-14 text-center text-sm text-gray-400"
                >
                  NO APPLICATIONS FOUND.
                </TableCell>
              </TableRow>
            ) : (
              applications.map((application) => {
                const interview = application.interview;
                return (
                  <TableRow key={application.id}>
                    <TableCell className="font-medium uppercase">
                      {candidateName(application.employee)}
                    </TableCell>
                    <TableCell className="uppercase">
                      {application.posting?.base_item_number ?? "—"}
                    </TableCell>
                    <TableCell className="uppercase">
                      {application.posting?.title ?? "—"}
                    </TableCell>

                    {["hr_status", "head_status", "final_status"].map(
                      (field) => {
                        const currentStatus = interview?.[field]?.toUpperCase();
                        const scheduledAt =
                          currentStatus === "SCHEDULED"
                            ? formatScheduledAt(
                                interview?.[SCHEDULE_FIELD[field]],
                              )
                            : null;
                        return (
                          <TableCell key={field}>
                            <Select
                              value={currentStatus ?? ""}
                              onValueChange={(val) =>
                                handleFieldChange(application, field, val)
                              }
                            >
                              <SelectTrigger className="h-7 w-36 border-0 p-0 text-xs shadow-none focus:ring-0">
                                <SelectValue placeholder="—">
                                  <span
                                    className={`text-xs font-medium ${STAGE_COLORS[currentStatus] ?? "text-gray-400"}`}
                                  >
                                    {currentStatus || "—"}
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
                                    {s}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {scheduledAt && (
                              <button
                                onClick={() =>
                                  setScheduleTarget({ application, field })
                                }
                                className="mt-0.5 block text-[10px] text-gray-400 hover:text-indigo-600 hover:underline"
                              >
                                {scheduledAt}
                              </button>
                            )}
                          </TableCell>
                        );
                      },
                    )}

                    <TableCell>
                      <Select
                        value={interview?.overall_status?.toUpperCase() ?? ""}
                        onValueChange={(val) =>
                          handleFieldChange(application, "overall_status", val)
                        }
                      >
                        <SelectTrigger className="h-7 w-32 border-0 p-0 text-xs shadow-none focus:ring-0">
                          <SelectValue placeholder="—">
                            <span
                              className={`text-xs font-medium ${STAGE_COLORS[interview?.overall_status?.toUpperCase()] ?? "text-gray-400"}`}
                            >
                              {interview?.overall_status?.toUpperCase() || "—"}
                            </span>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {OVERALL_STATUS.map((s) => (
                            <SelectItem key={s} value={s} className="text-xs">
                              {s}
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
    </Card>
  );
}

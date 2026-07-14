import { useEffect, useRef, useState } from "react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  IconLoader2,
  IconFileText,
  IconDownload,
  IconNotes,
} from "@tabler/icons-react";
import { toast } from "sonner";
import api from "@/api/api";
import { plantillaPostingService } from "@/services/plantillaPostingService";
import { getEcho } from "@/lib/echo";
import { SummaryCard } from "./overview/summaryCard";
import {
  candidateName,
  formatLabel,
  STAGE_STATUS,
  OVERALL_STATUS,
  APPLICATION_STATUS_OPTIONS,
  STAGE_COLORS,
  APPLICATION_STATUS_BG,
} from "../psbUtils";

const IN_PROGRESS_STATUSES = APPLICATION_STATUS_OPTIONS.filter(
  (s) =>
    s !== "Initial Review/Evaluation" && s !== "Completed" && s !== "Rejected",
);

export default function PsbApplicationsTable() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [remarksDraft, setRemarksDraft] = useState({});
  const channelRef = useRef(null);

  useEffect(() => {
    loadData();

    const echo = getEcho();
    channelRef.current = echo
      .channel("plantilla-application-interviews")
      .listen(".plantilla_application_interview.updated", (e) => {
        const updated = e.interview;
        setApplications((prev) =>
          prev.map((a) =>
            a.id === updated.plantilla_posting_application_id
              ? { ...a, interview: updated }
              : a,
          ),
        );
      });

    return () => {
      channelRef.current?.stopListening(
        ".plantilla_application_interview.updated",
      );
      echo.leave("plantilla-application-interviews");
    };
  }, []);

  const loadData = async () => {
    setLoading(true);
    const data = await plantillaPostingService.getAllApplications();
    setApplications(data);
    setLoading(false);
  };

  const summary = {
    total: applications.length,
    initialReview: applications.filter(
      (a) => a.status === "Initial Review/Evaluation",
    ).length,
    inProgress: applications.filter((a) =>
      IN_PROGRESS_STATUSES.includes(a.status),
    ).length,
    completed: applications.filter((a) => a.status === "Completed").length,
  };

  const handleInterviewFieldChange = async (application, field, value) => {
    try {
      const updated = await plantillaPostingService.saveApplicationInterview(
        application.id,
        { [field]: value },
      );
      setApplications((prev) =>
        prev.map((a) =>
          a.id === application.id ? { ...a, interview: updated } : a,
        ),
      );
      toast.success("Interview updated.");
    } catch (err) {
      toast.error(
        err?.response?.data?.message ?? "Failed to update interview.",
      );
    }
  };

  const handleStatusChange = async (application, status) => {
    try {
      const updated = await plantillaPostingService.reviewApplication(
        application.id,
        { status, remarks: application.remarks ?? null },
      );
      setApplications((prev) =>
        prev.map((a) => (a.id === application.id ? updated : a)),
      );
      toast.success("Application updated.");
    } catch (err) {
      const message =
        err?.response?.data?.errors?.status?.[0] ||
        err?.response?.data?.message ||
        "Failed to update application.";
      toast.error(message);
    }
  };

  const handleSaveRemarks = async (application) => {
    const remarks = remarksDraft[application.id] ?? application.remarks ?? "";
    try {
      const updated = await plantillaPostingService.reviewApplication(
        application.id,
        { status: application.status, remarks },
      );
      setApplications((prev) =>
        prev.map((a) => (a.id === application.id ? updated : a)),
      );
      toast.success("Remarks saved.");
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Failed to save remarks.");
    }
  };

  const handleDownload = async (doc) => {
    try {
      const res = await api.get(
        plantillaPostingService.documentDownloadUrl(doc.id),
        { responseType: "blob" },
      );
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.original_filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to download file.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <IconLoader2 size={24} className="animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="grid gap-6 p-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <SummaryCard
          title="Total Applications"
          value={summary.total}
          status="All PSB applications"
        />
        <SummaryCard
          title="Initial Review"
          value={summary.initialReview}
          status="Awaiting initial review"
        />
        <SummaryCard
          title="In Progress"
          value={summary.inProgress}
          status="Deliberation or interview stage"
        />
        <SummaryCard
          title="Completed"
          value={summary.completed}
          status="Successfully completed"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Candidate</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Plantilla Item No.</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>HR</TableHead>
                <TableHead>Head</TableHead>
                <TableHead>Final</TableHead>
                <TableHead>Overall</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Documents</TableHead>
                <TableHead>Remarks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={11}
                    className="py-14 text-center text-sm text-gray-400"
                  >
                    No PSB applications found.
                  </TableCell>
                </TableRow>
              ) : (
                applications.map((application) => {
                  const interview = application.interview;
                  const canComplete =
                    interview?.overall_status?.toUpperCase() === "COMPLETED";
                  return (
                    <TableRow key={application.id}>
                      <TableCell className="font-medium">
                        {candidateName(application.employee)}
                      </TableCell>
                      <TableCell>
                        {application.posting?.base_item_number ?? "—"}
                      </TableCell>
                      <TableCell>{application.posting?.title ?? "—"}</TableCell>
                      <TableCell>
                        {application.submitted_at?.slice(0, 10) ?? "—"}
                      </TableCell>

                      {["hr_status", "head_status", "final_status"].map(
                        (field) => (
                          <TableCell key={field}>
                            <Select
                              value={interview?.[field]?.toUpperCase() ?? ""}
                              onValueChange={(val) =>
                                handleInterviewFieldChange(
                                  application,
                                  field,
                                  val,
                                )
                              }
                            >
                              <SelectTrigger className="h-7 w-32 border-0 p-0 text-xs shadow-none focus:ring-0">
                                <SelectValue placeholder="—">
                                  <span
                                    className={`text-xs font-medium ${STAGE_COLORS[interview?.[field]?.toUpperCase()] ?? "text-gray-400"}`}
                                  >
                                    {formatLabel(interview?.[field]) || "—"}
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
                          </TableCell>
                        ),
                      )}

                      <TableCell>
                        <Select
                          value={interview?.overall_status?.toUpperCase() ?? ""}
                          onValueChange={(val) =>
                            handleInterviewFieldChange(
                              application,
                              "overall_status",
                              val,
                            )
                          }
                        >
                          <SelectTrigger className="h-7 w-32 border-0 p-0 text-xs shadow-none focus:ring-0">
                            <SelectValue placeholder="—">
                              <span
                                className={`text-xs font-medium ${STAGE_COLORS[interview?.overall_status?.toUpperCase()] ?? "text-gray-400"}`}
                              >
                                {formatLabel(interview?.overall_status) || "—"}
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

                      <TableCell>
                        <Select
                          value={application.status}
                          onValueChange={(val) =>
                            handleStatusChange(application, val)
                          }
                        >
                          <SelectTrigger className="h-7 w-40 border-0 p-0 text-xs shadow-none focus:ring-0">
                            <SelectValue>
                              <span
                                className={`rounded-full border px-2 py-0.5 text-xs font-medium ${APPLICATION_STATUS_BG[application.status] ?? APPLICATION_STATUS_BG["Initial Review/Evaluation"]}`}
                              >
                                {application.status}
                              </span>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {APPLICATION_STATUS_OPTIONS.map((s) => (
                              <SelectItem
                                key={s}
                                value={s}
                                disabled={s === "Completed" && !canComplete}
                                className="text-xs"
                              >
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {application.status !== "Completed" &&
                          application.status !== "Rejected" &&
                          !canComplete && (
                            <p className="mt-1 text-[10px] text-gray-400">
                              Needs completed interview to mark complete
                            </p>
                          )}
                      </TableCell>

                      <TableCell>
                        {application.documents?.length > 0 ? (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 gap-1 px-2 text-xs"
                              >
                                <IconFileText size={13} />
                                {application.documents.length} Doc
                                {application.documents.length > 1 ? "s" : ""}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-64 p-1" align="start">
                              {application.documents.map((doc) => (
                                <button
                                  key={doc.id}
                                  onClick={() => handleDownload(doc)}
                                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs hover:bg-gray-50"
                                >
                                  <IconFileText
                                    size={13}
                                    className="shrink-0 text-gray-400"
                                  />
                                  <span className="truncate">
                                    {doc.original_filename}
                                  </span>
                                  <IconDownload
                                    size={13}
                                    className="ml-auto shrink-0 text-gray-400"
                                  />
                                </button>
                              ))}
                            </PopoverContent>
                          </Popover>
                        ) : (
                          <span className="text-xs italic text-gray-400">
                            None
                          </span>
                        )}
                      </TableCell>

                      <TableCell>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 gap-1 px-2 text-xs"
                            >
                              <IconNotes size={13} />
                              {application.remarks ? "View" : "Add"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-72 p-3" align="start">
                            <Textarea
                              rows={3}
                              defaultValue={application.remarks ?? ""}
                              onChange={(e) =>
                                setRemarksDraft((d) => ({
                                  ...d,
                                  [application.id]: e.target.value,
                                }))
                              }
                              placeholder="Remarks for the employee"
                            />
                            <Button
                              size="sm"
                              className="mt-2 w-full"
                              onClick={() => handleSaveRemarks(application)}
                            >
                              Save remarks
                            </Button>
                          </PopoverContent>
                        </Popover>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

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

const STAGE_STATUS = ["PENDING", "SCHEDULED", "PASSED", "FAILED", "SKIPPED"];
const OVERALL_STATUS = [
  "PENDING",
  "SCHEDULED",
  "IN PROGRESS",
  "COMPLETED",
  "FAILED",
  "CANCELLED",
];
const APPLICATION_STATUS = ["Under Review", "Approved", "Rejected"];

const STAGE_COLORS = {
  PASSED: "text-green-600",
  COMPLETED: "text-green-600",
  SCHEDULED: "text-blue-600",
  PENDING: "text-gray-400",
  FAILED: "text-red-600",
  SKIPPED: "text-gray-400",
  CANCELLED: "text-red-600",
  "IN PROGRESS": "text-amber-600",
};

const APPLICATION_STATUS_BG = {
  Pending: "bg-gray-100 text-gray-600 border-gray-200",
  "Under Review": "bg-amber-50 text-amber-700 border-amber-200",
  Approved: "bg-green-50 text-green-700 border-green-200",
  Rejected: "bg-red-50 text-red-700 border-red-200",
};

function candidateName(employee) {
  if (!employee) return "—";
  return (
    employee.full_name ||
    [employee.first_name, employee.last_name].filter(Boolean).join(" ") ||
    "—"
  );
}

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
    pending: applications.filter((a) => a.status === "Pending").length,
    underReview: applications.filter((a) => a.status === "Under Review").length,
    approved: applications.filter((a) => a.status === "Approved").length,
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
      toast.success("INTERVIEW UPDATED.");
    } catch (err) {
      toast.error(
        err?.response?.data?.message?.toUpperCase() ??
          "FAILED TO UPDATE INTERVIEW.",
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
      toast.success("APPLICATION UPDATED.");
    } catch (err) {
      const message =
        err?.response?.data?.errors?.status?.[0] ||
        err?.response?.data?.message ||
        "FAILED TO UPDATE APPLICATION.";
      toast.error(message.toUpperCase());
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
      toast.success("REMARKS SAVED.");
    } catch (err) {
      toast.error(
        err?.response?.data?.message?.toUpperCase() ??
          "FAILED TO SAVE REMARKS.",
      );
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
      toast.error("FAILED TO DOWNLOAD FILE.");
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
          title="TOTAL APPLICATIONS"
          value={summary.total}
          status="ALL PSB APPLICATIONS"
        />
        <SummaryCard
          title="PENDING"
          value={summary.pending}
          status="AWAITING INITIAL REVIEW"
        />
        <SummaryCard
          title="UNDER REVIEW"
          value={summary.underReview}
          status="CURRENTLY BEING EVALUATED"
        />
        <SummaryCard
          title="APPROVED"
          value={summary.approved}
          status="SUCCESSFULLY APPROVED"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>CANDIDATE</TableHead>
                <TableHead>ITEM NO.</TableHead>
                <TableHead>POSITION</TableHead>
                <TableHead>SUBMITTED</TableHead>
                <TableHead>HR</TableHead>
                <TableHead>HEAD</TableHead>
                <TableHead>FINAL</TableHead>
                <TableHead>OVERALL</TableHead>
                <TableHead>STATUS</TableHead>
                <TableHead>DOCUMENTS</TableHead>
                <TableHead>REMARKS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={11}
                    className="py-14 text-center text-sm text-gray-400"
                  >
                    NO PSB APPLICATIONS FOUND.
                  </TableCell>
                </TableRow>
              ) : (
                applications.map((application) => {
                  const interview = application.interview;
                  const canApprove =
                    interview?.overall_status?.toUpperCase() === "COMPLETED";
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
                      <TableCell className="uppercase">
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
                                    {interview?.[field]?.toUpperCase() || "—"}
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
                                {interview?.overall_status?.toUpperCase() ||
                                  "—"}
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

                      <TableCell>
                        {application.status === "Pending" ? (
                          <span
                            className={`inline-block w-fit rounded-full border px-2 py-0.5 text-xs font-medium ${APPLICATION_STATUS_BG.Pending}`}
                          >
                            PENDING
                          </span>
                        ) : (
                          <Select
                            value={application.status}
                            onValueChange={(val) =>
                              handleStatusChange(application, val)
                            }
                          >
                            <SelectTrigger className="h-7 w-36 border-0 p-0 text-xs shadow-none focus:ring-0">
                              <SelectValue>
                                <span
                                  className={`rounded-full border px-2 py-0.5 text-xs font-medium ${APPLICATION_STATUS_BG[application.status] ?? APPLICATION_STATUS_BG.Pending}`}
                                >
                                  {application.status.toUpperCase()}
                                </span>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {APPLICATION_STATUS.map((s) => (
                                <SelectItem
                                  key={s}
                                  value={s}
                                  className="text-xs"
                                >
                                  {s.toUpperCase()}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                        {application.status !== "Approved" && !canApprove && (
                          <p className="mt-1 text-[10px] text-gray-400">
                            NEEDS COMPLETED INTERVIEW TO APPROVE
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
                                {application.documents.length} DOC
                                {application.documents.length > 1 ? "S" : ""}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-64 p-1" align="start">
                              {application.documents.map((doc) => (
                                <button
                                  key={doc.id}
                                  onClick={() => handleDownload(doc)}
                                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs uppercase hover:bg-gray-50"
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
                            NONE
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
                              {application.remarks ? "VIEW" : "ADD"}
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
                              placeholder="REMARKS FOR THE EMPLOYEE"
                            />
                            <Button
                              size="sm"
                              className="mt-2 w-full"
                              onClick={() => handleSaveRemarks(application)}
                            >
                              SAVE REMARKS
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

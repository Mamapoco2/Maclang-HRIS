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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { IconNotes } from "@tabler/icons-react";
import { toast } from "sonner";
import { plantillaPostingService } from "@/services/plantillaPostingService";
import { SummaryCard } from "./summaryCard";
import {
  candidateName,
  APPLICATION_STATUS_OPTIONS,
  APPLICATION_STATUS_BG,
  formatLabel,
} from "../psbUtils";

export default function ApplicationsTable({
  applications,
  onUpdate,
  showSummary = true,
}) {
  const [remarksDraft, setRemarksDraft] = useState({});

  const summary = {
    total: applications.length,
    pending: applications.filter((a) => a.status === "Pending").length,
    underReview: applications.filter((a) => a.status === "Under Review").length,
    approved: applications.filter((a) => a.status === "Approved").length,
  };

  const handleStatusChange = async (application, status) => {
    try {
      const updated = await plantillaPostingService.reviewApplication(
        application.id,
        { status, remarks: application.remarks ?? null },
      );
      onUpdate(application.id, updated);
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
      onUpdate(application.id, updated);
      toast.success("Remarks saved.");
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Failed to save remarks.");
    }
  };

  return (
    <div className="grid gap-6">
      {showSummary && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <SummaryCard
            title="Total Applications"
            value={summary.total}
            status="All PSB applications"
          />
          <SummaryCard
            title="Pending"
            value={summary.pending}
            status="Awaiting initial review"
          />
          <SummaryCard
            title="Under Review"
            value={summary.underReview}
            status="Currently being evaluated"
          />
          <SummaryCard
            title="Approved"
            value={summary.approved}
            status="Successfully approved"
          />
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Candidate</TableHead>
                <TableHead>Item No.</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Interview</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Remarks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-14 text-center text-sm text-gray-400"
                  >
                    No PSB applications found.
                  </TableCell>
                </TableRow>
              ) : (
                applications.map((application) => {
                  const canApprove =
                    application.interview?.overall_status?.toUpperCase() ===
                    "COMPLETED";
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
                      <TableCell className="text-xs text-gray-500">
                        {formatLabel(application.interview?.overall_status) ||
                          "No interview"}
                      </TableCell>
                      <TableCell>
                        {application.status === "Pending" ? (
                          <span
                            className={`inline-block w-fit rounded-full border px-2 py-0.5 text-xs font-medium ${APPLICATION_STATUS_BG.Pending}`}
                          >
                            Pending
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
                                  {application.status}
                                </span>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {APPLICATION_STATUS_OPTIONS.map((s) => (
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
                        )}
                        {application.status !== "Approved" && !canApprove && (
                          <p className="mt-1 text-[10px] text-gray-400">
                            Needs completed interview to approve
                          </p>
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

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
import { IconLoader2 } from "@tabler/icons-react";
import { getInterviews, updateInterview } from "@/services/hiringService";
import { getEcho } from "@/lib/echo";
import { toast } from "sonner";

const STAGE_STATUS = ["PENDING", "SCHEDULED", "COMPLETED", "NO SHOW"];

const STATUS_COLORS = {
  COMPLETED: "text-green-600",
  SCHEDULED: "text-blue-600",
  PENDING: "text-gray-400",
  "NO SHOW": "text-red-600",
};

const computeOverallStatus = ({ hr_status, head_status, final_status }) => {
  const statuses = [hr_status, head_status, final_status];

  if (statuses.includes("NO SHOW")) return "NO SHOW";
  if (statuses.every((s) => s === "COMPLETED")) return "COMPLETED";
  if (statuses.some((s) => s === "SCHEDULED" || s === "COMPLETED"))
    return "SCHEDULED";
  return "PENDING";
};

const normalizeInterview = (i) => ({
  ...i,
  hr_status: (i.hr_status ?? "PENDING").toUpperCase(),
  head_status: (i.head_status ?? "PENDING").toUpperCase(),
  final_status: (i.final_status ?? "PENDING").toUpperCase(),
  overall_status: (i.overall_status ?? "PENDING").toUpperCase(),
});

export default function InterviewTable() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingKey, setUpdatingKey] = useState(null);
  const channelRef = useRef(null);

  useEffect(() => {
    loadData();

    const echo = getEcho();
    channelRef.current = echo
      .channel("interviews")
      .listen(".interview.updated", (e) => {
        const updated = e.interview;
        if (!updated?.applicant_id) return;
        setInterviews((prev) =>
          prev.map((i) =>
            i.applicant_id === updated.applicant_id
              ? normalizeInterview({ ...i, ...updated })
              : i,
          ),
        );
      });

    return () => {
      channelRef.current?.stopListening(".interview.updated");
      echo.leave("interviews");
    };
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getInterviews();
      const list = Array.isArray(data) ? data : [];

      if (!Array.isArray(data)) {
        console.error("getInterviews() did not return an array:", data);
      }

      setInterviews(list.map(normalizeInterview));
    } catch (err) {
      console.error("loadData (interviews) failed:", err);
      toast.error("HINDI MA-LOAD ANG MGA INTERVIEW.");
      setInterviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStageUpdate = async (interview, field, value) => {
    const upperValue = value.toUpperCase();
    const updateKey = `${interview.id}-${field}`;

    const previousSnapshot = interview;

    setUpdatingKey(updateKey);

    const merged = { ...interview, [field]: upperValue };
    const newOverallStatus = computeOverallStatus(merged);

    setInterviews((prev) =>
      prev.map((i) =>
        i.id === interview.id
          ? { ...i, [field]: upperValue, overall_status: newOverallStatus }
          : i,
      ),
    );

    try {
      const updated = await updateInterview(interview.applicant_id, {
        [field]: upperValue,
        overall_status: newOverallStatus,
      });

      setInterviews((prev) =>
        prev.map((i) => {
          if (i.id !== interview.id) return i;
          return normalizeInterview({
            ...i,
            ...updated,
            [field]: upperValue,
            overall_status: newOverallStatus,
          });
        }),
      );

      toast.success("INTERVIEW UPDATED.");
    } catch (err) {
      console.error("handleStageUpdate failed:", err);

      // Rollback on failure
      setInterviews((prev) =>
        prev.map((i) => (i.id === interview.id ? previousSnapshot : i)),
      );

      toast.error("FAILED TO UPDATE INTERVIEW.");
    } finally {
      setUpdatingKey(null);
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
    <Card>
      <CardContent className="p-4">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>CANDIDATE</TableHead>
              <TableHead>HR</TableHead>
              <TableHead>HEAD</TableHead>
              <TableHead>FINAL</TableHead>
              <TableHead>OVERALL STATUS</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {interviews.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-14 text-center text-sm text-gray-400"
                >
                  NO INTERVIEWS FOUND.
                </TableCell>
              </TableRow>
            ) : (
              interviews.map((interview) => (
                <TableRow key={interview.id}>
                  <TableCell className="font-medium">
                    {interview.applicant?.full_name?.toUpperCase() ?? "—"}
                  </TableCell>

                  {["hr_status", "head_status", "final_status"].map((field) => {
                    const updateKey = `${interview.id}-${field}`;
                    const isUpdating = updatingKey === updateKey;

                    return (
                      <TableCell key={field}>
                        <Select
                          value={interview[field]}
                          disabled={isUpdating}
                          onValueChange={(val) =>
                            handleStageUpdate(interview, field, val)
                          }
                        >
                          <SelectTrigger className="h-7 w-36 text-xs border-0 p-0 shadow-none focus:ring-0">
                            <SelectValue>
                              <span
                                className={`text-xs font-medium ${
                                  STATUS_COLORS[interview[field]] ?? ""
                                } ${isUpdating ? "opacity-50" : ""}`}
                              >
                                {interview[field]}
                              </span>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {STAGE_STATUS.map((s) => (
                              <SelectItem key={s} value={s} className="text-xs">
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    );
                  })}

                  <TableCell>
                    <span
                      className={`text-xs font-medium ${
                        STATUS_COLORS[interview.overall_status] ??
                        "text-gray-600"
                      }`}
                    >
                      {interview.overall_status}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

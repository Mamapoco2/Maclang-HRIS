import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { IconLoader2, IconTrash, IconArrowRight } from "@tabler/icons-react";
import { useState } from "react";
import { moveToOnboarding } from "@/services/hiringService";
import { toast } from "sonner";

const STATUS_OPTIONS = [
  "FOR INTERVIEW",
  "HIRED",
  "REJECTED",
  "NO SHOW",
  "PENDING",
];

const STATUS_BG = {
  "FOR INTERVIEW": "bg-blue-50 text-blue-700 border-blue-200",
  HIRED: "bg-green-50 text-green-700 border-green-200",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
  "NO SHOW": "bg-orange-50 text-orange-700 border-orange-200",
  PENDING: "bg-gray-100 text-gray-600 border-gray-200",
};

export function ApplicantsTable({
  applicants = [],
  loading = false,
  onDelete,
  onStatusChange,
  onRefresh,
  showOnboardButton = false,
}) {
  const [movingId, setMovingId] = useState(null);

  const handleMoveToOnboarding = async (applicant) => {
    if (
      !confirm(
        `MOVE ${applicant.full_name.toUpperCase()} TO ONBOARDING?\n\nThis will:\n• Mark them as HIRED\n• Create an onboarding record\n• Create a draft contract`,
      )
    )
      return;
    setMovingId(applicant.id);
    try {
      const res = await moveToOnboarding(applicant.id);
      toast.success(
        res.message?.toUpperCase() ?? "MOVED TO ONBOARDING SUCCESSFULLY.",
      );
      onRefresh?.();
    } catch (err) {
      toast.error(
        err?.response?.data?.message?.toUpperCase() ??
          "FAILED TO MOVE TO ONBOARDING.",
      );
    } finally {
      setMovingId(null);
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
      <CardContent className="p-0">
        <Table className="w-full text-left">
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>NAME</TableHead>
              <TableHead>EMAIL</TableHead>
              <TableHead>POSITION</TableHead>
              <TableHead>CONTACT</TableHead>
              <TableHead>DEPARTMENT</TableHead>
              <TableHead>DATE APPLIED</TableHead>
              <TableHead>SUBMISSION</TableHead>
              <TableHead>STATUS</TableHead>
              <TableHead>DOCUMENTS</TableHead>
              <TableHead>LINKED TO</TableHead>
              <TableHead>REMARKS</TableHead>
              <TableHead className="text-right">ACTIONS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applicants.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={12}
                  className="py-14 text-center text-sm text-gray-400"
                >
                  NO APPLICANTS FOUND.
                </TableCell>
              </TableRow>
            ) : (
              applicants.map((a) => (
                <TableRow key={a.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium uppercase">
                    {a.full_name}
                  </TableCell>
                  <TableCell className="uppercase">{a.email}</TableCell>
                  <TableCell className="uppercase">{a.position}</TableCell>
                  <TableCell className="uppercase">{a.phone}</TableCell>
                  <TableCell className="uppercase">{a.department}</TableCell>
                  <TableCell className="uppercase">
                    {a.date_applied ?? "—"}
                  </TableCell>
                  <TableCell className="uppercase">
                    {a.submission ?? "—"}
                  </TableCell>

                  <TableCell>
                    <Select
                      value={(a.status ?? "").toUpperCase()}
                      onValueChange={(val) => onStatusChange?.(a.id, val)}
                    >
                      <SelectTrigger className="h-7 w-36 text-xs border-0 p-0 shadow-none focus:ring-0">
                        <SelectValue>
                          <span
                            className={`font-medium text-xs px-2 py-0.5 rounded-full border ${STATUS_BG[(a.status ?? "").toUpperCase()] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}
                          >
                            {(a.status ?? "").toUpperCase()}
                          </span>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((s) => (
                          <SelectItem key={s} value={s} className="text-xs">
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>

                  <TableCell>
                    {a.documents?.length > 0 ? (
                      <ul className="list-disc list-inside text-xs uppercase">
                        {a.documents.map((doc) => (
                          <li key={doc.id}>{doc.name}</li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-gray-400 text-xs italic">NONE</span>
                    )}
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {a.onboarding ? (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 inline-block w-fit">
                          ✓ ONBOARDING
                        </span>
                      ) : null}
                      {a.contract ? (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 inline-block w-fit">
                          ✓ CONTRACT
                        </span>
                      ) : null}
                      {!a.onboarding && !a.contract && (
                        <span className="text-xs text-gray-400 italic">—</span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="uppercase">
                    {a.remarks ?? "—"}
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {showOnboardButton && !a.onboarding && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMoveToOnboarding(a)}
                          disabled={movingId === a.id}
                          className="h-7 text-xs px-2 border-purple-200 text-purple-700 hover:bg-purple-50 gap-1"
                        >
                          {movingId === a.id ? (
                            <IconLoader2 size={11} className="animate-spin" />
                          ) : (
                            <IconArrowRight size={11} />
                          )}
                          ONBOARD
                        </Button>
                      )}
                      {showOnboardButton && a.onboarding && (
                        <span className="text-[10px] text-purple-500 font-medium px-2">
                          ✓ ONBOARDED
                        </span>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDelete?.(a.id)}
                        className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <IconTrash size={14} />
                      </Button>
                    </div>
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

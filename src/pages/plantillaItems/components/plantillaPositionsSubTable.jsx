import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PositionModal, AssignEmployeeModal } from "./plantillaItemModal";
import DeleteConfirmModal from "./deleteConfirmationModal";
import { plantillaPositionService } from "../../../services/plantillaService";

const STATUS_STYLES = {
  FILLED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  VACANT: "bg-amber-50   text-amber-600   border-amber-200",
  UNFILLED: "bg-red-50     text-red-600     border-red-200",
};

const HEADERS = [
  "Item No.",
  "Position Title",
  "SG",
  "Step",
  "Status",
  "Assigned To",
  "Actions",
];

function StatusBadge({ status }) {
  const key = status?.toUpperCase();
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-xs font-semibold capitalize px-2 py-0.5",
        STATUS_STYLES[key] ?? "bg-slate-50 text-slate-500 border-slate-200",
      )}
    >
      {status?.toLowerCase() ?? "—"}
    </Badge>
  );
}

export default function PositionsSubTable({ item, onRefresh }) {
  const positions = item.positions ?? [];

  const [editPos, setEditPos] = useState(null);
  const [deletePos, setDeletePos] = useState(null);
  const [assignPos, setAssignPos] = useState(null);

  const handleDelete = async () => {
    await plantillaPositionService.deletePosition(deletePos.id);
    toast.success("Slot removed.");
    setDeletePos(null);
    onRefresh();
  };

  return (
    <>
      <div className="bg-slate-50/70 border-t border-slate-100 px-4 py-3">
        <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                {HEADERS.map((h) => (
                  <TableHead
                    key={h}
                    className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 py-2.5 text-center whitespace-nowrap"
                  >
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {positions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={HEADERS.length}
                    className="text-center py-8 text-xs text-slate-400"
                  >
                    No slots provisioned yet.
                  </TableCell>
                </TableRow>
              ) : (
                positions.map((pos) => {
                  const statusKey = (
                    pos.computed_status ?? pos.status
                  )?.toUpperCase();

                  const canDelete =
                    statusKey !== "FILLED" && statusKey !== "UNFILLED";
                  const canAssign = statusKey === "VACANT";

                  // Resolve active employee name from nested assignments
                  const activeEmployee = pos.assignments?.[0]?.employee;
                  const employeeName = activeEmployee
                    ? [
                        activeEmployee.prefix,
                        activeEmployee.first_name,
                        activeEmployee.last_name,
                        activeEmployee.suffix,
                      ]
                        .filter(Boolean)
                        .join(" ")
                    : null;

                  return (
                    <TableRow
                      key={pos.id}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      {/* Item No. */}
                      <TableCell className="text-center">
                        <div className="font-mono text-xs font-semibold text-indigo-600">
                          {pos.item_number}
                        </div>
                      </TableCell>

                      {/* Position. */}
                      <TableCell className="text-sm text-slate-600 text-center font-mono">
                        {pos.position_title}
                      </TableCell>

                      {/* SG — now per position, not inherited from parent item */}
                      <TableCell className="text-sm text-slate-600 text-center font-mono">
                        {pos.salary_grade?.salary_grade
                          ? `SG ${pos.salary_grade.salary_grade}`
                          : "—"}
                      </TableCell>

                      {/* Step */}
                      <TableCell className="text-sm text-slate-600 text-center">
                        {pos.step_increment?.step ? (
                          `Step ${pos.step_increment.step}`
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </TableCell>

                      {/* Status */}
                      <TableCell className="text-center">
                        <StatusBadge
                          status={pos.computed_status ?? pos.status}
                        />
                      </TableCell>

                      {/* Assigned To */}
                      <TableCell className="text-center">
                        {employeeName ? (
                          <span className="text-xs text-slate-700 font-medium">
                            {employeeName}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          {/* Assign employee — VACANT only */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 disabled:opacity-30"
                            disabled={!canAssign}
                            onClick={() => setAssignPos(pos)}
                            title={
                              canAssign
                                ? "Assign employee"
                                : "Only vacant slots can be assigned"
                            }
                          >
                            <UserPlus size={12} />
                          </Button>

                          {/* Edit step / date */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                            onClick={() => setEditPos(pos)}
                            title="Edit slot"
                          >
                            <Pencil size={12} />
                          </Button>

                          {/* Delete — VACANT only */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-slate-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-30"
                            disabled={!canDelete}
                            onClick={() => setDeletePos(pos)}
                            title={
                              canDelete
                                ? "Remove slot"
                                : "Cannot remove a filled or unfilled slot"
                            }
                          >
                            <Trash2 size={12} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Edit step/date modal */}
      <PositionModal
        open={!!editPos}
        onOpenChange={(v) => {
          if (!v) setEditPos(null);
        }}
        item={item}
        position={editPos}
        onSuccess={() => {
          setEditPos(null);
          onRefresh();
        }}
      />

      {/* Assign employee modal */}
      <AssignEmployeeModal
        open={!!assignPos}
        onOpenChange={(v) => {
          if (!v) setAssignPos(null);
        }}
        item={item}
        position={assignPos}
        onSuccess={() => {
          setAssignPos(null);
          onRefresh();
        }}
      />

      {/* Delete confirm modal */}
      <DeleteConfirmModal
        open={!!deletePos}
        onOpenChange={(v) => {
          if (!v) setDeletePos(null);
        }}
        item={deletePos}
        onConfirm={handleDelete}
      />
    </>
  );
}

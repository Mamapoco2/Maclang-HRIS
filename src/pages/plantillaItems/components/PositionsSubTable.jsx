import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { plantillaPositionService } from "@/services/plantillaService";
import { getPositionHeaders, itemHasSteps } from "../helpers/plantillaHelpers";
import { getAssignedToDisplay } from "../helpers/formatters";
import { StatusBadge } from "./StatusBadge";
import { PositionModal } from "./PositionModal";
import DeleteConfirmModal from "./DeleteConfirmModal";

export function PositionsSubTable({ item, onRefresh }) {
  const positions = item.positions ?? [];

  const showStep = itemHasSteps(positions);
  const positionHeaders = getPositionHeaders(showStep);

  const [editPos, setEditPos] = useState(null);
  const [deletePos, setDeletePos] = useState(null);

  const handleDelete = useCallback(async () => {
    try {
      await plantillaPositionService.deletePosition(deletePos.id);
      toast.success("Slot removed.");
      setDeletePos(null);
      onRefresh();
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Failed to remove slot.");
    }
  }, [deletePos, onRefresh]);

  return (
    <>
      <div className="bg-slate-50/70 border-t border-slate-100 px-4 py-3">
        <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                {positionHeaders.map((h) => (
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
                    colSpan={positionHeaders.length}
                    className="text-center py-8 text-xs text-slate-400"
                  >
                    No slots provisioned yet.
                  </TableCell>
                </TableRow>
              ) : (
                positions.map((pos) => {
                  const statusKey = (pos.status ?? "").toUpperCase();
                  const canDelete =
                    statusKey !== "FILLED" && statusKey !== "UNFILLED";
                  const assignedTo = getAssignedToDisplay(pos);

                  return (
                    <TableRow
                      key={pos.id}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      <TableCell className="text-center">
                        <div className="font-mono text-xs font-semibold text-indigo-600">
                          {item.base_item_number}-{pos.slot_number}
                        </div>
                      </TableCell>

                      <TableCell className="text-sm text-slate-600 text-center uppercase">
                        {pos.position_title ?? item.title ?? (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </TableCell>

                      <TableCell className="text-sm text-slate-600 text-center font-mono uppercase">
                        {pos.salary_grade?.salary_grade ? (
                          `SG ${pos.salary_grade.salary_grade}`
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </TableCell>

                      {showStep && (
                        <TableCell className="text-sm text-slate-600 text-center uppercase">
                          {pos.step_increment?.step ? (
                            `Step ${pos.step_increment.step}`
                          ) : (
                            <span className="text-slate-300 text-xs">—</span>
                          )}
                        </TableCell>
                      )}

                      <TableCell className="text-center">
                        <StatusBadge status={pos.status} />
                      </TableCell>

                      <TableCell className="text-center">
                        {assignedTo !== "—" ? (
                          <span className="text-xs text-slate-700 font-medium">
                            {assignedTo}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </TableCell>

                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                            onClick={() => setEditPos(pos)}
                            title="Edit slot"
                          >
                            <Pencil size={12} />
                          </Button>
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

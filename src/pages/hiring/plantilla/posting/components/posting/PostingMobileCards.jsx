import React from "react";
import { Eye, Building2, Users, Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "../ui";
import { StatusBadge } from "../TableParts";
import { formatCurrency, formatDate } from "../utils";
import { formatPositionSlotNumbers } from "./postingHelpers";

export function PostingMobileCards({
  items,
  isAdmin,
  onView,
  onEdit,
  onDelete,
  onApply,
  onViewApplications,
  editLoadingId,
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:hidden">
      {items.map((it) => (
        <div
          key={it.id}
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">
                {it.positionTitle}
              </p>
              <p className="text-xs text-slate-400">
                {it.baseItemNumber}
                {" · Slot: "}
                {formatPositionSlotNumbers(it)}
              </p>
            </div>
            <StatusBadge status={it.status} />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-y-1.5 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5" /> {it.office}
            </div>
            <div>SG: {it.salaryGrade}</div>
            <div className="col-span-2 font-medium text-slate-700">
              {formatCurrency(it.monthlySalary)} / mo
            </div>
            <div>Vacancies: {it.vacantSlots ?? it.vacancies}</div>
            <div>Closes: {formatDate(it.closingDate)}</div>
          </div>
          <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
            <Button
              variant="secondary"
              size="sm"
              className="flex-1"
              onClick={() => onView(it)}
            >
              <Eye className="h-3.5 w-3.5" />
              View Details
            </Button>
            {!isAdmin ? (
              <Button
                size="sm"
                className="flex-1"
                onClick={() => onApply(it)}
                disabled={
                  it.status === "Closed" ||
                  it.status === "Filled" ||
                  it.alreadyApplied
                }
              >
                {it.alreadyApplied ? "Already Applied" : "Apply"}
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onViewApplications(it)}
                  aria-label="View Applications"
                >
                  <Users className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(it)}
                  disabled={editLoadingId === it.id}
                  aria-label="Edit"
                >
                  {editLoadingId === it.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Pencil className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(it)}
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4 text-rose-500" />
                </Button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

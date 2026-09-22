import React from "react";

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { StatusBadge, RowActions } from "../TableParts";
import { formatCurrency, formatDate } from "../utils";
import { formatPositionSlotNumbers } from "./postingHelpers";

export function PostingTable({
  items,
  isAdmin,
  canViewClosingDate = false,
  onView,
  onEdit,
  onDelete,
  onApply,
  onViewApplications,
  editLoadingId,
}) {
  return (
    <div className="hidden min-w-0 max-w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:block">
      <div className="max-h-[560px] w-full max-w-full overflow-x-auto overflow-y-auto">
        <Table className="w-full min-w-[1050px] border-collapse text-left text-sm">
          <TableHeader className="sticky top-0 z-10 bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500">
            <TableRow className="hover:bg-transparent">
              <TableHead>Item Number</TableHead>
              <TableHead>Position Title</TableHead>
              <TableHead>Office</TableHead>
              <TableHead>Division</TableHead>
              <TableHead>Salary Grade</TableHead>
              <TableHead>Monthly Salary</TableHead>
              <TableHead>Date Posted</TableHead>

              {/* Closing Date */}
              {canViewClosingDate && <TableHead>Closing Date</TableHead>}

              {/* Deadline */}
              <TableHead>Deadline</TableHead>

              <TableHead>Applicants</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-slate-100">
            {items.map((it) => (
              <TableRow
                key={it.id}
                className="transition-colors hover:bg-slate-50"
              >
                <TableCell className="font-medium text-slate-700">
                  {formatPositionSlotNumbers(it)}
                </TableCell>

                <TableCell className="max-w-[260px] whitespace-normal break-words font-medium text-slate-900">
                  {it.positionTitle}
                </TableCell>

                <TableCell className="text-slate-500">{it.office}</TableCell>

                <TableCell className="text-slate-500">{it.division}</TableCell>

                <TableCell>{it.salaryGrade}</TableCell>

                <TableCell className="whitespace-nowrap">
                  {formatCurrency(it.monthlySalary)}
                </TableCell>

                <TableCell className="whitespace-nowrap text-slate-500">
                  {formatDate(it.datePosted)}
                </TableCell>

                {/* Closing Date */}
                {canViewClosingDate && (
                  <TableCell className="whitespace-nowrap text-slate-500">
                    {formatDate(it.closingDate)}
                  </TableCell>
                )}

                {/* Deadline */}
                <TableCell className="whitespace-nowrap text-slate-500">
                  {formatDate(it.applicationDeadline)}
                </TableCell>

                <TableCell>{it.applicants}</TableCell>

                <TableCell>
                  <StatusBadge status={it.status} />
                </TableCell>

                <TableCell className="text-right">
                  <RowActions
                    item={it}
                    isAdmin={isAdmin}
                    onView={() => onView(it)}
                    onEdit={() => onEdit(it)}
                    onDelete={() => onDelete(it)}
                    onApply={() => onApply(it)}
                    onViewApplications={() => onViewApplications(it)}
                    editLoading={editLoadingId === it.id}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

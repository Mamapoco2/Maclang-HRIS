import React from "react";
import { Th, Td, StatusBadge, RowActions } from "../TableParts";
import { formatCurrency, formatDate } from "../utils";
import { formatPositionSlotNumbers } from "./postingHelpers";

export function PostingTable({
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
    <div className="hidden min-w-0 max-w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:block">
      <div className="max-h-[560px] w-full max-w-full overflow-x-auto overflow-y-auto">
        <table className="w-full min-w-[1100px] border-collapse text-left text-sm">
          <thead className="sticky top-0 z-10 bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500">
            <tr>
              <Th>Item No.</Th>
              <Th>Position Slot Name</Th>
              <Th>Position Title</Th>
              <Th>Office</Th>
              <Th>Division</Th>
              <Th>Salary Grade</Th>
              <Th>Monthly Salary</Th>
              <Th>Employment Status</Th>
              <Th>Vacancies</Th>
              <Th>Date Posted</Th>
              <Th>Closing Date</Th>
              <Th>Applicants</Th>
              <Th>Status</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((it) => (
              <tr key={it.id} className="transition-colors hover:bg-slate-50">
                <Td className="font-medium text-slate-700">
                  {it.baseItemNumber}
                </Td>
                <Td className="font-medium text-slate-700">
                  {formatPositionSlotNumbers(it)}
                </Td>
                <Td className="max-w-[220px] truncate font-medium text-slate-900">
                  {it.positionTitle}
                </Td>
                <Td className="text-slate-500">{it.office}</Td>
                <Td className="text-slate-500">{it.division}</Td>
                <Td>{it.salaryGrade}</Td>
                <Td className="whitespace-nowrap">
                  {formatCurrency(it.monthlySalary)}
                </Td>
                <Td className="text-slate-500">{it.employmentStatus}</Td>
                <Td>{it.vacantSlots ?? it.vacancies}</Td>
                <Td className="whitespace-nowrap text-slate-500">
                  {formatDate(it.datePosted)}
                </Td>
                <Td className="whitespace-nowrap text-slate-500">
                  {formatDate(it.closingDate)}
                </Td>
                <Td>{it.applicants}</Td>
                <Td>
                  <StatusBadge status={it.status} />
                </Td>
                <Td className="text-right">
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
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

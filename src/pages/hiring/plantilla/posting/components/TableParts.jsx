import React, { useMemo } from "react";
import {
  Eye,
  Pencil,
  Trash2,
  FileText,
  CheckCircle2,
  Plus,
  ChevronLeft,
  ChevronRight,
  BriefcaseBusiness,
  Users,
} from "lucide-react";
import { Button, Skeleton } from "./ui";
import {
  STATUS_STYLES,
  STATUS_DOT,
  PAGE_SIZE_OPTIONS,
  APPLICATION_STATUS_STYLES,
  APPLICATION_STATUS_DOT,
  INTERVIEW_OVERALL_STYLES,
} from "./constants";

export function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${STATUS_STYLES[status]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[status]}`} />
      {status}
    </span>
  );
}

export function ApplicationStatusBadge({ status }) {
  const style =
    APPLICATION_STATUS_STYLES[status] || APPLICATION_STATUS_STYLES.Pending;
  const dot = APPLICATION_STATUS_DOT[status] || APPLICATION_STATUS_DOT.Pending;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${style}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {status}
    </span>
  );
}

export function InterviewStatusBadge({ status }) {
  if (!status) {
    return (
      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500 ring-1 ring-inset ring-slate-400/20">
        No Interview
      </span>
    );
  }
  const key = status.toUpperCase();
  const style =
    INTERVIEW_OVERALL_STYLES[key] || INTERVIEW_OVERALL_STYLES.PENDING;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${style}`}
    >
      {status}
    </span>
  );
}

export function Th({ children, className = "" }) {
  return (
    <th
      className={`whitespace-nowrap px-4 py-3 text-left font-medium ${className}`}
    >
      {children}
    </th>
  );
}

export function Td({ children, className = "" }) {
  return (
    <td className={`px-4 py-3 text-slate-700 ${className}`}>{children}</td>
  );
}

export function RowActions({
  item,
  isAdmin,
  onView,
  onEdit,
  onDelete,
  onApply,
  onViewApplications,
}) {
  const applyDisabled =
    item.status === "Closed" || item.status === "Filled" || item.alreadyApplied;

  return (
    <div className="flex items-center justify-end gap-1">
      <Button variant="ghost" size="icon" onClick={onView} aria-label="View">
        <Eye className="h-4 w-4" />
      </Button>
      {isAdmin ? (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={onViewApplications}
            aria-label="View Applications"
          >
            <Users className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
            aria-label="Edit"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            aria-label="Delete"
          >
            <Trash2 className="h-4 w-4 text-rose-500" />
          </Button>
        </>
      ) : item.alreadyApplied ? (
        <Button
          variant="ghost"
          size="icon"
          disabled
          aria-label="Already Applied"
          title="Naka-apply ka na sa position na ito"
        >
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          onClick={onApply}
          aria-label="Apply"
          disabled={applyDisabled}
        >
          <FileText className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="ml-auto h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function EmptyState({ onCreate, showCreate }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <BriefcaseBusiness className="h-8 w-8" />
      </div>
      <p className="mt-4 text-sm font-medium text-slate-600">
        No available plantilla items found.
      </p>
      <p className="mt-1 text-xs text-slate-400">
        Try adjusting your search or filters.
      </p>
      {showCreate && (
        <Button className="mt-5" onClick={onCreate}>
          <Plus className="h-4 w-4" />
          Create Posting
        </Button>
      )}
    </div>
  );
}

export function Pagination({
  total,
  page,
  pageSize,
  totalPages,
  onPageChange,
  onPageSizeChange,
}) {
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  const pages = useMemo(() => {
    const arr = [];
    const maxShown = 5;
    let from = Math.max(1, page - Math.floor(maxShown / 2));
    let to = Math.min(totalPages, from + maxShown - 1);
    from = Math.max(1, to - maxShown + 1);
    for (let p = from; p <= to; p++) arr.push(p);
    return arr;
  }, [page, totalPages]);
  return (
    <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span>
          Showing {start}–{end} of {total} results
        </span>
        <span className="hidden sm:inline">·</span>
        <span className="hidden items-center gap-1.5 sm:flex">
          Rows per page
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="rounded-md border border-slate-200 bg-white px-1.5 py-1 text-xs"
          >
            {PAGE_SIZE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </span>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Previous
        </Button>
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`h-8 w-8 rounded-lg text-xs font-medium transition-colors ${p === page ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}
          >
            {p}
          </button>
        ))}
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
        >
          Next
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

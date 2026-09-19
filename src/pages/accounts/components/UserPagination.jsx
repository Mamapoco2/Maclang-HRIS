import { memo, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PER_PAGE_OPTIONS, getVisiblePages } from "@/utils/userManagement";

function UserPagination({ meta, onPage, onPerPage, disabled = false }) {
  const { currentPage, lastPage, perPage, total } = meta;

  const pages = useMemo(
    () => getVisiblePages(currentPage, lastPage),
    [currentPage, lastPage],
  );

  if (total === 0) return null;

  const start = (currentPage - 1) * perPage + 1;
  const end = Math.min(currentPage * perPage, total);

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-100 px-5 py-3 sm:flex-row">
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span>
          Showing {start.toLocaleString()}–{end.toLocaleString()} of{" "}
          {total.toLocaleString()} users
        </span>
        <select
          value={perPage}
          disabled={disabled}
          onChange={(e) => onPerPage(Number(e.target.value))}
          aria-label="Rows per page"
          className="ml-2 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {PER_PAGE_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {n} rows
            </option>
          ))}
        </select>
      </div>

      <nav className="flex items-center gap-1" aria-label="Pagination">
        <button
          type="button"
          onClick={() => onPage(currentPage - 1)}
          disabled={disabled || currentPage <= 1}
          aria-label="Previous page"
          className="rounded-md p-1.5 text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`gap-${i}`} className="px-2 text-xs text-gray-400">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPage(p)}
              disabled={disabled}
              aria-label={`Page ${p}`}
              aria-current={p === currentPage ? "page" : undefined}
              className={`h-7 w-7 rounded-md text-xs font-medium transition-colors disabled:cursor-not-allowed ${
                p === currentPage
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {p}
            </button>
          ),
        )}

        <button
          type="button"
          onClick={() => onPage(currentPage + 1)}
          disabled={disabled || currentPage >= lastPage}
          aria-label="Next page"
          className="rounded-md p-1.5 text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </nav>
    </div>
  );
}

export default memo(UserPagination);

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const pageRange = (current, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const delta = 2;
  const left = Math.max(2, current - delta);
  const right = Math.min(total - 1, current + delta);
  const pages = [1];
  if (left > 2) pages.push("...");
  for (let i = left; i <= right; i++) pages.push(i);
  if (right < total - 1) pages.push("...");
  pages.push(total);
  return pages;
};

export default function EmployeePagination({
  pagination,
  loading,
  perPage,
  onPageChange,
}) {
  const [jumpPage, setJumpPage] = useState("");
  const { current_page: current, last_page: last, total } = pagination;

  const from = total === 0 ? 0 : (current - 1) * perPage + 1;
  const to = Math.min(current * perPage, total);

  const handleJump = (e) => {
    e.preventDefault();
    const p = parseInt(jumpPage);
    if (!isNaN(p) && p >= 1 && p <= last) {
      onPageChange(p);
      setJumpPage("");
    }
  };

  const atStart = current === 1 || loading;
  const atEnd = current === last || loading;

  return (
    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-sm text-muted-foreground">
        Showing{" "}
        <span className="font-medium text-foreground">
          {from}-{to}
        </span>{" "}
        of <span className="font-medium text-foreground">{total}</span>{" "}
        employees
      </p>

      <div className="flex flex-wrap items-center justify-center gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-8"
          onClick={() => onPageChange(1)}
          disabled={atStart}
          aria-label="First page"
        >
          <ChevronsLeft className="size-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-8"
          onClick={() => onPageChange(current - 1)}
          disabled={atStart}
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" />
        </Button>

        <div className="hidden items-center gap-1.5 md:flex">
          {pageRange(current, last).map((p, i) =>
            p === "..." ? (
              <span
                key={`gap-${i}`}
                className="px-1 text-sm text-muted-foreground"
              >
                ...
              </span>
            ) : (
              <Button
                key={p}
                type="button"
                variant={p === current ? "default" : "outline"}
                size="icon"
                className="size-8 text-xs"
                onClick={() => p !== current && onPageChange(p)}
                disabled={loading}
                aria-label={`Page ${p}`}
                aria-current={p === current ? "page" : undefined}
              >
                {p}
              </Button>
            ),
          )}
        </div>

        <span className="px-2 text-sm text-muted-foreground md:hidden">
          Page {current} of {last}
        </span>

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-8"
          onClick={() => onPageChange(current + 1)}
          disabled={atEnd}
          aria-label="Next page"
        >
          <ChevronRight className="size-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-8"
          onClick={() => onPageChange(last)}
          disabled={atEnd}
          aria-label="Last page"
        >
          <ChevronsRight className="size-4" />
        </Button>

        {last > 1 && (
          <form onSubmit={handleJump} className="ml-2 flex items-center gap-1.5">
            <Input
              type="number"
              min={1}
              max={last}
              value={jumpPage}
              onChange={(e) => setJumpPage(e.target.value)}
              placeholder="Go to"
              aria-label="Go to page"
              className="h-8 w-20 text-center text-xs"
            />
            <Button
              type="submit"
              variant="outline"
              size="sm"
              className="h-8 px-3 text-xs"
            >
              Go
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

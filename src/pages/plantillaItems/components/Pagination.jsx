import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildPageList } from "../helpers/plantillaHelpers";

export function Pagination({ safePage, totalPages, totalItems, pageSize, onPageChange }) {
  const pageList = buildPageList(totalPages, safePage);

  return (
    <div className="flex items-center justify-between px-1">
      <p className="text-xs text-slate-400">
        Showing{" "}
        <span className="font-medium text-slate-600">
          {(safePage - 1) * pageSize + 1}–
          {Math.min(safePage * pageSize, totalItems)}
        </span>{" "}
        of <span className="font-medium text-slate-600">{totalItems}</span>{" "}
        items
      </p>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(Math.max(1, safePage - 1))}
          disabled={safePage === 1}
        >
          <ChevronDown size={14} className="rotate-90" />
        </Button>

        {pageList.map((p, idx) =>
          p === "…" ? (
            <span key={`ellipsis-${idx}`} className="px-1 text-xs text-slate-400">
              …
            </span>
          ) : (
            <Button
              key={`page-${p}`}
              size="icon"
              variant={safePage === p ? "default" : "outline"}
              onClick={() => onPageChange(p)}
              className="h-8 w-8 text-xs"
            >
              {p}
            </Button>
          ),
        )}

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(Math.min(totalPages, safePage + 1))}
          disabled={safePage === totalPages}
        >
          <ChevronDown size={14} className="-rotate-90" />
        </Button>
      </div>
    </div>
  );
}

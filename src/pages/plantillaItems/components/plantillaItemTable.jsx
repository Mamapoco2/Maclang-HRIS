import { useState, useEffect, Fragment } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, ChevronRight, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";
import PositionsSubTable from "./plantillaPositionsSubTable";

const HEADERS = [
  "",
  "#",
  "Title",
  "Approved",
  "Filled",
  "Vacant",
  "Unfilled",
  "",
];
const PAGE_SIZE = 15;

function TableSkeleton() {
  return Array.from({ length: 8 }).map((_, i) => (
    <TableRow key={i}>
      {HEADERS.map((_, j) => (
        <TableCell key={j}>
          <Skeleton className="h-4 w-full rounded" />
        </TableCell>
      ))}
    </TableRow>
  ));
}

export default function PlantillaItemTable({
  items,
  loading,
  search,
  onRefresh,
}) {
  const [expanded, setExpanded] = useState(new Set());
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [items]);

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = items.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const toggleExpand = (id) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              {HEADERS.map((h, i) => (
                <TableHead
                  key={i}
                  className="text-xs font-semibold uppercase tracking-widest text-slate-400 py-3.5 whitespace-nowrap text-center"
                >
                  {h}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableSkeleton />
            ) : paginated.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={HEADERS.length}
                  className="text-center py-16"
                >
                  <div className="flex flex-col items-center gap-3 text-slate-400">
                    <ClipboardList size={36} className="opacity-30" />
                    <p className="text-sm font-medium">
                      {search
                        ? "No items match your search"
                        : "No plantilla items yet"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((item, idx) => {
                const isOpen = expanded.has(item.id);
                const globalIdx = (safePage - 1) * PAGE_SIZE + idx + 1;
                const filledCnt = item.filled_count ?? 0;
                const vacantCnt = item.vacant_count ?? 0;
                const unfilledCnt = item.unfilled_count ?? 0;

                return (
                  <Fragment key={item.id}>
                    <TableRow
                      className={cn(
                        "cursor-pointer hover:bg-slate-50/80 transition-colors",
                        isOpen && "bg-slate-50",
                      )}
                      onClick={() => toggleExpand(item.id)}
                    >
                      <TableCell className="w-10 text-center">
                        {isOpen ? (
                          <ChevronDown
                            size={14}
                            className="text-slate-400 mx-auto"
                          />
                        ) : (
                          <ChevronRight
                            size={14}
                            className="text-slate-400 mx-auto"
                          />
                        )}
                      </TableCell>

                      <TableCell className="text-xs text-slate-300 font-mono text-center w-10">
                        {globalIdx}
                      </TableCell>

                      <TableCell className="text-left">
                        <div className="font-medium text-slate-800 text-sm uppercase">
                          {item.title}
                        </div>
                        {item.description && (
                          <div className="text-xs text-slate-400 mt-0.5">
                            {item.description}
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="text-center font-mono text-sm font-semibold text-slate-700">
                        {item.approved_slots}
                      </TableCell>

                      <TableCell className="text-center">
                        <span
                          className={cn(
                            "font-mono text-sm font-semibold",
                            filledCnt > 0
                              ? "text-emerald-600"
                              : "text-slate-300",
                          )}
                        >
                          {filledCnt}
                        </span>
                      </TableCell>

                      <TableCell className="text-center">
                        <span
                          className={cn(
                            "font-mono text-sm font-semibold",
                            vacantCnt > 0 ? "text-amber-500" : "text-slate-300",
                          )}
                        >
                          {vacantCnt}
                        </span>
                      </TableCell>

                      <TableCell className="text-center">
                        <span
                          className={cn(
                            "font-mono text-sm font-semibold",
                            unfilledCnt > 0 ? "text-red-500" : "text-slate-300",
                          )}
                        >
                          {unfilledCnt}
                        </span>
                      </TableCell>

                      <TableCell
                        className="w-12"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </TableRow>

                    {isOpen && (
                      <TableRow className="hover:bg-transparent">
                        <TableCell colSpan={HEADERS.length} className="p-0">
                          <PositionsSubTable
                            item={item}
                            onRefresh={onRefresh}
                          />
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {!loading && items.length > PAGE_SIZE && (
        <div className="flex items-center justify-between px-1">
          <p className="text-xs text-slate-400">
            Showing{" "}
            <span className="font-medium text-slate-600">
              {(safePage - 1) * PAGE_SIZE + 1}–
              {Math.min(safePage * PAGE_SIZE, items.length)}
            </span>{" "}
            of{" "}
            <span className="font-medium text-slate-600">{items.length}</span>{" "}
            items
          </p>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
            >
              <ChevronDown size={14} className="rotate-90" />
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (p) =>
                  p === 1 || p === totalPages || Math.abs(p - safePage) <= 1,
              )
              .reduce((acc, p, i, arr) => {
                if (i > 0 && p - arr[i - 1] > 1) acc.push("…");
                acc.push(p);
                return acc;
              }, [])
              .map((p, idx) =>
                p === "…" ? (
                  <span
                    key={`ellipsis-${idx}`}
                    className="px-1 text-xs text-slate-400"
                  >
                    …
                  </span>
                ) : (
                  <Button
                    key={`page-${p}`}
                    size="icon"
                    variant={safePage === p ? "default" : "outline"}
                    onClick={() => setPage(p)}
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
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
            >
              <ChevronDown size={14} className="-rotate-90" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

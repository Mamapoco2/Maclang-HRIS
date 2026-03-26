import { useState, useEffect } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Pencil, ClipboardList, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_STYLES = {
  FILLED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  UNFILLED: "bg-orange-50  text-orange-600  border-orange-200",
  VACANT: "bg-red-50     text-red-600     border-red-200",
};

const HEADERS = [
  "#",
  "Item No.",
  "Title",
  "SG",
  "Step",
  "Monthly Salary",
  "Annual Salary",
  "Status",
  "Actions",
];

const PAGE_SIZE = 10;

const formatCurrency = (val) =>
  val != null
    ? `₱${Number(val).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`
    : "—";

function TableSkeleton() {
  return Array.from({ length: PAGE_SIZE }).map((_, i) => (
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
  onEdit,
  search = "",
}) {
  const [page, setPage] = useState(1);

  // Reset to page 1 whenever the items array changes (refresh or search)
  useEffect(() => {
    setPage(1);
  }, [items]);

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = items.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              {HEADERS.map((h) => (
                <TableHead
                  key={h}
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
                        : "No plantilla items found"}
                    </p>
                    <p className="text-xs text-slate-300">
                      {search
                        ? "Try a different keyword"
                        : 'Click "Add Item" to create one'}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((item, index) => {
                const statusKey = item.status?.toUpperCase();
                const globalIndex = (safePage - 1) * PAGE_SIZE + index + 1;

                return (
                  <TableRow
                    key={item.id}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <TableCell className="text-xs text-slate-300 font-mono text-center w-10">
                      {globalIndex}
                    </TableCell>
                    <TableCell className="font-mono text-xs font-semibold text-indigo-600 tracking-wide text-center">
                      {item.item_number}
                    </TableCell>
                    <TableCell className="font-medium text-slate-700 text-sm max-w-xs text-center">
                      <span className="line-clamp-2">{item.title}</span>
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm text-center">
                      {item.salary_grade?.salary_grade ??
                        item.salary_grade_id ??
                        "—"}
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm text-center">
                      {item.step_increment?.step ?? "—"}
                    </TableCell>
                    <TableCell className="text-slate-600 text-sm font-mono whitespace-nowrap text-center">
                      {formatCurrency(
                        item.step_increment?.monthly_salary ??
                          item.salary_grade?.monthly_salary,
                      )}
                    </TableCell>
                    <TableCell className="text-slate-600 text-sm font-mono whitespace-nowrap text-center">
                      {formatCurrency(
                        item.step_increment?.annual_salary ??
                          item.salary_grade?.annual_salary,
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs font-semibold capitalize px-2.5 py-0.5 select-none",
                          STATUS_STYLES[statusKey] ??
                            "bg-slate-50 text-slate-500 border-slate-200",
                        )}
                      >
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                        onClick={() => onEdit(item)}
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {!loading && items.length > 0 && (
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
              className="h-8 w-8 border-gray-200 text-slate-400 hover:text-slate-700 disabled:opacity-40"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
            >
              <ChevronLeft size={14} />
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (p) =>
                  p === 1 || p === totalPages || Math.abs(p - safePage) <= 1,
              )
              .reduce((acc, p, idx, arr) => {
                if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
                acc.push(p);
                return acc;
              }, [])
              .map((p, idx) =>
                p === "..." ? (
                  <span
                    key={`ellipsis-${idx}`}
                    className="text-xs text-slate-400 px-1"
                  >
                    ...
                  </span>
                ) : (
                  <Button
                    key={p}
                    variant={safePage === p ? "default" : "outline"}
                    size="icon"
                    className={cn(
                      "h-8 w-8 text-xs border-gray-200",
                      safePage === p
                        ? "bg-gray-900 hover:bg-black text-white border-gray-900"
                        : "text-slate-500 hover:text-slate-700",
                    )}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </Button>
                ),
              )}

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-gray-200 text-slate-400 hover:text-slate-700 disabled:opacity-40"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
            >
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

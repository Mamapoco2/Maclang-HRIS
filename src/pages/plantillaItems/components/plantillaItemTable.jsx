import { useCallback, useEffect, useMemo, useState, Fragment } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, ClipboardList, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ITEM_HEADERS, PAGE_SIZE } from "../helpers/constants";
import { sortItems, getPagination } from "../helpers/plantillaHelpers";
import { TableSkeleton } from "./TableSkeleton";
import { PositionsSubTable } from "./PositionsSubTable";
import { AddSlotModal } from "./AddSlotModal";
import { Pagination } from "./Pagination";

export default function PlantillaItemTable({ items, loading, search, onRefresh }) {
  const [expanded, setExpanded] = useState(new Set());
  const [page, setPage] = useState(1);
  const [addSlotItem, setAddSlotItem] = useState(null);

  const sorted = useMemo(() => sortItems(items), [items]);

  useEffect(() => {
    setPage(1);
  }, [items]);

  const { totalPages, safePage, paginated } = useMemo(
    () => getPagination(sorted, page, PAGE_SIZE),
    [sorted, page],
  );

  const toggleExpand = useCallback(
    (id) =>
      setExpanded((prev) => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
      }),
    [],
  );

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              {ITEM_HEADERS.map((h, i) => (
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
                <TableCell colSpan={ITEM_HEADERS.length} className="text-center py-16">
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
              paginated.map((item) => {
                const isOpen = expanded.has(item.id);
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
                          <ChevronDown size={14} className="text-slate-400 mx-auto" />
                        ) : (
                          <ChevronRight size={14} className="text-slate-400 mx-auto" />
                        )}
                      </TableCell>

                      <TableCell className="text-xs text-slate-300 font-mono text-center w-10">
                        {item.base_item_number}
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
                            filledCnt > 0 ? "text-emerald-600" : "text-slate-300",
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
                        className="w-20 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                          title="Add slot"
                          onClick={() => setAddSlotItem(item)}
                        >
                          <Plus size={14} />
                        </Button>
                      </TableCell>
                    </TableRow>

                    {isOpen && (
                      <TableRow className="hover:bg-transparent">
                        <TableCell colSpan={ITEM_HEADERS.length} className="p-0">
                          <PositionsSubTable item={item} onRefresh={onRefresh} />
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

      {!loading && sorted.length > PAGE_SIZE && (
        <Pagination
          safePage={safePage}
          totalPages={totalPages}
          totalItems={sorted.length}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      )}

      <AddSlotModal
        open={!!addSlotItem}
        onOpenChange={(v) => {
          if (!v) setAddSlotItem(null);
        }}
        item={addSlotItem}
        onSuccess={() => {
          setAddSlotItem(null);
          onRefresh();
        }}
      />
    </div>
  );
}

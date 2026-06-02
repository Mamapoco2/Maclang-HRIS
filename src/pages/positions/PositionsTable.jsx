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
import { Skeleton } from "@/components/ui/skeleton";
import { Pencil, Trash2, ChevronDown, ClipboardList } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import PositionFormModal from "./PositionFormModal";
import DeletePositionDialog from "./DeletePositionDialog";

const HEADERS = ["#", "Title", "Actions"];
const PAGE_SIZE = 15;

function TableSkeleton() {
  return Array.from({ length: 6 }).map((_, i) => (
    <TableRow key={i}>
      {HEADERS.map((_, j) => (
        <TableCell key={j}>
          <Skeleton className="h-4 w-full rounded" />
        </TableCell>
      ))}
    </TableRow>
  ));
}

/**
 * Reusable positions table for COS and Consultant pages.
 *
 * Props
 * ─────
 * positions    array
 * loading      boolean
 * search       string
 * service      { update, remove }
 * label        "COS" | "Consultant"
 * onRefresh    () => void
 */
export default function PositionsTable({
  positions,
  loading,
  search,
  service,
  label,
  onRefresh,
}) {
  const [page, setPage] = useState(1);
  const [editPos, setEditPos] = useState(null);
  const [deletePos, setDeletePos] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [positions]);

  const totalPages = Math.max(1, Math.ceil(positions.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = positions.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const handleDelete = async () => {
    if (!deletePos) return;
    setDeleting(true);
    try {
      await service.remove(deletePos.id);
      toast.success(`${label} position deleted.`);
      setDeletePos(null);
      onRefresh();
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Failed to delete position.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="space-y-3">
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                {HEADERS.map((h) => (
                  <TableHead
                    key={h}
                    className={cn(
                      "text-xs font-semibold uppercase tracking-widest text-slate-400 py-3.5 whitespace-nowrap",
                      h === "Actions" ? "text-center" : "text-left",
                      h === "#" && "w-12 text-center",
                    )}
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
                          ? "No positions match your search"
                          : `No ${label} positions yet`}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((pos, idx) => {
                  const globalIdx = (safePage - 1) * PAGE_SIZE + idx + 1;
                  return (
                    <TableRow
                      key={pos.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {/* Row number */}
                      <TableCell className="text-xs text-slate-300 font-mono text-center w-12">
                        {globalIdx}
                      </TableCell>

                      {/* Title */}
                      <TableCell className="text-left">
                        <span className="font-medium text-slate-800 text-sm uppercase">
                          {pos.title}
                        </span>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                            onClick={() => setEditPos(pos)}
                            title="Edit position"
                          >
                            <Pencil size={12} />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-slate-400 hover:text-red-600 hover:bg-red-50"
                            onClick={() => setDeletePos(pos)}
                            title="Delete position"
                          >
                            <Trash2 size={12} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {!loading && positions.length > PAGE_SIZE && (
          <div className="flex items-center justify-between px-1">
            <p className="text-xs text-slate-400">
              Showing{" "}
              <span className="font-medium text-slate-600">
                {(safePage - 1) * PAGE_SIZE + 1}–
                {Math.min(safePage * PAGE_SIZE, positions.length)}
              </span>{" "}
              of{" "}
              <span className="font-medium text-slate-600">
                {positions.length}
              </span>{" "}
              positions
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

      {/* Edit modal */}
      <PositionFormModal
        open={!!editPos}
        onOpenChange={(v) => {
          if (!v) setEditPos(null);
        }}
        position={editPos}
        service={service}
        label={label}
        onSuccess={() => {
          setEditPos(null);
          onRefresh();
        }}
      />

      {/* Delete dialog */}
      <DeletePositionDialog
        open={!!deletePos}
        onOpenChange={(v) => {
          if (!v) setDeletePos(null);
        }}
        position={deletePos}
        loading={deleting}
        onConfirm={handleDelete}
        label={label}
      />
    </>
  );
}

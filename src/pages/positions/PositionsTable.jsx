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

const PAGE_SIZE = 15;

function TypeBadge({ type }) {
  if (type === "cos")
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700">
        COS
      </span>
    );
  if (type === "consultant")
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-violet-50 text-violet-700">
        Consultant
      </span>
    );
  return null;
}

function TableSkeleton({ cols }) {
  return Array.from({ length: 6 }).map((_, i) => (
    <TableRow key={i}>
      {Array.from({ length: cols }).map((_, j) => (
        <TableCell key={j}>
          <Skeleton className="h-4 w-full rounded" />
        </TableCell>
      ))}
    </TableRow>
  ));
}

export default function PositionsTable({
  positions,
  loading,
  search,
  showTypeColumn = false,
  cosService,
  consultantService,
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

  const resolveService = (pos) => {
    if (service) return service;
    if (!pos) return null;
    return pos._type === "consultant" ? consultantService : cosService;
  };
  const resolveLabel = (pos) => {
    if (label) return label;
    if (!pos) return "";
    return pos._type === "consultant" ? "Consultant" : "COS";
  };

  const handleDelete = async () => {
    if (!deletePos) return;
    const svc = resolveService(deletePos);
    if (!svc) {
      toast.error("Unable to determine which service to use for deletion.");
      return;
    }
    setDeleting(true);
    try {
      await svc.remove(deletePos.id);
      toast.success(`${resolveLabel(deletePos)} position deleted.`);
      setDeletePos(null);
      onRefresh();
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Failed to delete position.");
    } finally {
      setDeleting(false);
    }
  };

  const headers = showTypeColumn
    ? ["#", "Title", "Type", "Actions"]
    : ["#", "Title", "Actions"];

  return (
    <>
      <div className="space-y-3">
        <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                {headers.map((h) => (
                  <TableHead
                    key={h}
                    className={cn(
                      "text-[10px] font-semibold uppercase tracking-widest text-gray-400 py-3 whitespace-nowrap",
                      h === "Actions" ? "text-center" : "text-left",
                      h === "#" && "w-10 text-center",
                    )}
                  >
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableSkeleton cols={headers.length} />
              ) : paginated.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={headers.length}
                    className="text-center py-16"
                  >
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                      <ClipboardList size={36} className="opacity-30" />
                      <p className="text-sm font-medium">
                        {search
                          ? "No positions match your search"
                          : "No positions yet"}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((pos, idx) => {
                  const globalIdx = (safePage - 1) * PAGE_SIZE + idx + 1;
                  return (
                    <TableRow
                      key={`${pos._type ?? "pos"}-${pos.id}`}
                      className="hover:bg-gray-50 transition-colors border-t border-gray-100"
                    >
                      <TableCell className="text-[11px] text-gray-300 font-mono text-center w-10">
                        {globalIdx}
                      </TableCell>

                      <TableCell className="text-left">
                        <span className="font-medium text-gray-800 text-sm uppercase">
                          {pos.title}
                        </span>
                      </TableCell>

                      {showTypeColumn && (
                        <TableCell>
                          <TypeBadge type={pos._type} />
                        </TableCell>
                      )}

                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50"
                            onClick={() => setEditPos(pos)}
                            title="Edit position"
                          >
                            <Pencil size={12} />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-gray-400 hover:text-red-500 hover:bg-red-50"
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

          {/* Pagination footer */}
          {!loading && positions.length > PAGE_SIZE && (
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-100 bg-gray-50">
              <p className="text-[11px] text-gray-400">
                Showing{" "}
                <span className="font-medium text-gray-600">
                  {(safePage - 1) * PAGE_SIZE + 1}–
                  {Math.min(safePage * PAGE_SIZE, positions.length)}
                </span>{" "}
                of{" "}
                <span className="font-medium text-gray-600">
                  {positions.length}
                </span>{" "}
                positions
              </p>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 border-gray-200"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                >
                  <ChevronDown size={13} className="rotate-90" />
                </Button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (p) =>
                      p === 1 ||
                      p === totalPages ||
                      Math.abs(p - safePage) <= 1,
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
                        className="px-1 text-xs text-gray-400"
                      >
                        …
                      </span>
                    ) : (
                      <Button
                        key={`page-${p}`}
                        size="icon"
                        variant={safePage === p ? "default" : "outline"}
                        onClick={() => setPage(p)}
                        className={cn(
                          "h-7 w-7 text-xs border-gray-200",
                          safePage === p &&
                            "bg-blue-600 hover:bg-blue-700 border-blue-600",
                        )}
                      >
                        {p}
                      </Button>
                    ),
                  )}

                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 border-gray-200"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                >
                  <ChevronDown size={13} className="-rotate-90" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit modal */}
      <PositionFormModal
        open={!!editPos}
        onOpenChange={(v) => {
          if (!v) setEditPos(null);
        }}
        position={editPos}
        service={resolveService(editPos)}
        label={resolveLabel(editPos)}
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
        label={resolveLabel(deletePos)}
      />
    </>
  );
}

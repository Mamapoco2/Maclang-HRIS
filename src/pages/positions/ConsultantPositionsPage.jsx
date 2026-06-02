import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, LayoutList } from "lucide-react";
import { toast } from "sonner";
import { consultantPositionService } from "../../services/positionService";

// Shared components live under cos/components — re-export or import directly
import PositionsTable from "./PositionsTable";
import PositionFormModal from "./PositionFormModal";

export default function ConsultantPositionsPage() {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const fetchPositions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await consultantPositionService.getAll({ per_page: 500 });
      setPositions(Array.isArray(data) ? data : (data.data ?? []));
    } catch {
      toast.error("Failed to load Consultant positions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPositions();
  }, [fetchPositions]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return positions;
    return positions.filter(
      (p) =>
        p.title?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q),
    );
  }, [positions, search]);

  return (
    <div className="min-h-screen bg-white">
      <div className="p-3 sm:p-4 md:p-6 space-y-4 md:space-y-5">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
              Consultant Positions
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
              {loading
                ? "Loading…"
                : search
                  ? `${filtered.length} result${filtered.length !== 1 ? "s" : ""} for "${search}"`
                  : `${positions.length} position${positions.length !== 1 ? "s" : ""} total`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative flex-1 sm:flex-none">
              <Search
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search positions…"
                className="pl-8 h-9 w-full sm:w-52 text-sm border-gray-200"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            <Button
              onClick={() => setShowAdd(true)}
              className="bg-gray-900 hover:bg-black text-white text-sm h-9 px-3 sm:px-4 shrink-0"
            >
              <Plus size={14} className="mr-1.5" />
              Add Position
            </Button>
          </div>
        </div>

        {/* Stat card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
          <div className="rounded-lg border border-gray-200 bg-white px-4 py-4 flex items-center gap-4">
            <div className="shrink-0 rounded-md p-2.5 text-violet-500 bg-violet-50">
              <LayoutList size={16} strokeWidth={2} />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 font-mono leading-none">
                {loading ? "—" : positions.length}
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-widest font-medium">
                Total Positions
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <PositionsTable
          positions={filtered}
          loading={loading}
          search={search}
          service={consultantPositionService}
          label="Consultant"
          onRefresh={fetchPositions}
        />
      </div>

      {/* Add modal */}
      <PositionFormModal
        open={showAdd}
        onOpenChange={setShowAdd}
        position={null}
        service={consultantPositionService}
        label="Consultant"
        onSuccess={fetchPositions}
      />
    </div>
  );
}

import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, LayoutList, UserCheck, Clock } from "lucide-react";
import { toast } from "sonner";
import { cosPositionService } from "../../services/positionService";
import PositionsTable from "./PositionsTable";
import PositionFormModal from "./PositionFormModal";

export default function CosPositionsPage() {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const fetchPositions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await cosPositionService.getAll({ per_page: 500 });
      setPositions(Array.isArray(data) ? data : (data.data ?? []));
    } catch {
      toast.error("Failed to load COS positions.");
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

  const thisMonthCount = useMemo(() => {
    const now = new Date();
    return positions.filter((p) => {
      if (!p.created_at) return false;
      const d = new Date(p.created_at);
      return (
        d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      );
    }).length;
  }, [positions]);

  return (
    <div className="min-h-screen bg-white">
      {/* ── Header bar ── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
            <LayoutList size={20} strokeWidth={2} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-gray-900 leading-tight">
              COS Positions
            </h1>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Manage Contract of Service position titles
            </p>
          </div>
        </div>

        <Button
          onClick={() => setShowAdd(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm h-9 px-4 shrink-0"
        >
          <Plus size={14} className="mr-1.5" />
          Add Position
        </Button>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 px-6 py-5">
        <div className="rounded-xl border border-gray-100 bg-white px-4 py-4 flex items-center gap-3">
          <div className="shrink-0 w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
            <LayoutList size={16} strokeWidth={2} className="text-blue-600" />
          </div>
          <div>
            <div className="text-2xl font-semibold text-gray-900 font-mono leading-none">
              {loading ? "—" : positions.length}
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-widest font-medium">
              Total Positions
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white px-4 py-4 flex items-center gap-3">
          <div className="shrink-0 w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
            <UserCheck size={16} strokeWidth={2} className="text-green-600" />
          </div>
          <div>
            <div className="text-2xl font-semibold text-gray-900 font-mono leading-none">
              {loading ? "—" : positions.length}
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-widest font-medium">
              Active Positions
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white px-4 py-4 flex items-center gap-3">
          <div className="shrink-0 w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
            <Clock size={16} strokeWidth={2} className="text-amber-500" />
          </div>
          <div>
            <div className="text-2xl font-semibold text-gray-900 font-mono leading-none">
              {loading ? "—" : thisMonthCount}
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-widest font-medium">
              Added This Month
            </div>
          </div>
        </div>
      </div>

      {/* ── Table section ── */}
      <div className="px-6 pb-8">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-semibold text-gray-900">COS Positions</p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {loading
                ? "Loading…"
                : search
                  ? `${filtered.length} result${filtered.length !== 1 ? "s" : ""} for "${search}"`
                  : `${positions.length} position${positions.length !== 1 ? "s" : ""} total`}
            </p>
          </div>

          <div className="relative">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search positions…"
              className="pl-8 h-9 w-48 text-sm border-gray-200"
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
        </div>

        <PositionsTable
          positions={filtered}
          loading={loading}
          search={search}
          service={cosPositionService}
          label="COS"
          onRefresh={fetchPositions}
        />
      </div>

      <PositionFormModal
        open={showAdd}
        onOpenChange={setShowAdd}
        position={null}
        service={cosPositionService}
        label="COS"
        onSuccess={fetchPositions}
      />
    </div>
  );
}

import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  LayoutList,
  CheckCircle2,
  CircleDashed,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import PlantillaItemTable from "./components/plantillaItemTable";
import { AddItemModal } from "./components/plantillaItemModal";
import { plantillaItemService } from "../../services/plantillaService";

const STAT_CARDS = [
  {
    label: "Total Items",
    key: "total_items",
    icon: LayoutList,
    cls: "text-blue-500 bg-blue-50",
  },
  {
    label: "Filled",
    key: "filled",
    icon: CheckCircle2,
    cls: "text-emerald-500 bg-emerald-50",
  },
  {
    label: "Vacant",
    key: "vacant",
    icon: CircleDashed,
    cls: "text-amber-500 bg-amber-50",
  },
  {
    label: "Unfilled",
    key: "unfilled",
    icon: AlertCircle,
    cls: "text-red-500 bg-red-50",
  },
];

export default function PlantillaItemsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showAddItem, setShowAddItem] = useState(false);

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await plantillaItemService.getPlantillaItems();
      setItems(Array.isArray(data) ? data : (data.data ?? []));
    } catch {
      toast.error("Failed to load plantilla items.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // ── Stats — derived from nested positions ────────────────────────────────
  const stats = useMemo(() => {
    const all = items.flatMap((i) => i.positions ?? []);
    const status = (p) => (p.computed_status ?? p.status ?? "").toUpperCase();
    return {
      total_items: items.length,
      filled: all.filter((p) => status(p) === "FILLED").length,
      vacant: all.filter((p) => status(p) === "VACANT").length,
      unfilled: all.filter((p) => status(p) === "UNFILLED").length,
    };
  }, [items]);

  // ── Search filter ────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.title?.toLowerCase().includes(q) ||
        item.base_item_number?.toString().includes(q),
    );
  }, [items, search]);

  return (
    <div className="min-h-screen bg-white">
      <div className="p-3 sm:p-4 md:p-6 space-y-4 md:space-y-5">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
              Plantilla Items
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
              {loading
                ? "Loading…"
                : search
                  ? `${filtered.length} result${filtered.length !== 1 ? "s" : ""} for "${search}"`
                  : `${items.length} items · ${items.reduce((s, i) => s + (i.positions?.length ?? 0), 0)} total slots`}
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
                placeholder="Search items…"
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
              onClick={() => setShowAddItem(true)}
              className="bg-gray-900 hover:bg-black text-white text-sm h-9 px-3 sm:px-4 shrink-0"
            >
              <Plus size={14} className="mr-1.5" />
              Add Item
            </Button>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          {STAT_CARDS.map(({ label, key, icon: Icon, cls }) => (
            <div
              key={key}
              className="rounded-lg border border-gray-200 bg-white px-3 sm:px-4 py-3 sm:py-4 flex items-center gap-3 sm:gap-4"
            >
              <div className={`shrink-0 rounded-md p-2 sm:p-2.5 ${cls}`}>
                <Icon size={16} strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <div className="text-xl sm:text-2xl font-bold text-gray-900 font-mono leading-none">
                  {stats[key]}
                </div>
                <div className="text-[10px] sm:text-xs text-gray-400 mt-0.5 uppercase tracking-widest font-medium truncate">
                  {label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <PlantillaItemTable
          items={filtered}
          loading={loading}
          search={search}
          onRefresh={fetchItems}
        />
      </div>

      <AddItemModal
        open={showAddItem}
        onOpenChange={setShowAddItem}
        onSuccess={fetchItems}
      />
    </div>
  );
}

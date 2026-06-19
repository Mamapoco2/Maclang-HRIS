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
    iconCls: "text-blue-600",
    bgCls: "bg-blue-50",
  },
  {
    label: "Filled",
    key: "filled",
    icon: CheckCircle2,
    iconCls: "text-emerald-600",
    bgCls: "bg-emerald-50",
  },
  {
    label: "Vacant",
    key: "vacant",
    icon: CircleDashed,
    iconCls: "text-amber-500",
    bgCls: "bg-amber-50",
  },
  {
    label: "Unfilled",
    key: "unfilled",
    icon: AlertCircle,
    iconCls: "text-red-500",
    bgCls: "bg-red-50",
  },
];

export default function PlantillaItemsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showAddItem, setShowAddItem] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await plantillaItemService.getPlantillaItems();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load plantilla items.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

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
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center shrink-0">
            <LayoutList size={20} strokeWidth={2} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-gray-900 leading-tight">
              Plantilla Positions
            </h1>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Manage plantilla items, slots, and assignments
            </p>
          </div>
        </div>

        <Button
          onClick={() => setShowAddItem(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm h-9 px-4 shrink-0"
        >
          <Plus size={14} className="mr-1.5" />
          Add Item
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 px-6 py-5">
        {STAT_CARDS.map(({ label, key, icon: Icon, iconCls, bgCls }) => (
          <div
            key={key}
            className="rounded-xl border border-gray-100 bg-white px-4 py-4 flex items-center gap-3"
          >
            <div
              className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${bgCls}`}
            >
              <Icon size={16} strokeWidth={2} className={iconCls} />
            </div>
            <div className="min-w-0">
              <div className="text-2xl font-semibold text-gray-900 font-mono leading-none">
                {loading ? "—" : stats[key]}
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-widest font-medium truncate">
                {label}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="px-6 pb-8">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-semibold text-gray-900">
              Plantilla Items
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {loading
                ? "Loading…"
                : search
                  ? `${filtered.length} result${filtered.length !== 1 ? "s" : ""} for "${search}"`
                  : `${items.length} item${items.length !== 1 ? "s" : ""} · ${items.reduce((s, i) => s + (i.positions?.length ?? 0), 0)} total slots`}
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
              placeholder="Search items…"
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

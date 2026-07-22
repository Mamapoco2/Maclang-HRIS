import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, LayoutList } from "lucide-react";
import PlantillaItemTable from "./components/PlantillaItemTable";
import { AddItemModal } from "./components/AddItemModal";
import { StatisticsCards } from "./components/StatisticsCards";
import { usePlantillaItems } from "./hooks/usePlantillaItems";

export default function PlantillaItemsPage() {
  const { items, filtered, loading, search, setSearch, stats, refresh } =
    usePlantillaItems();
  const [showAddItem, setShowAddItem] = useState(false);

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

      <StatisticsCards stats={stats} loading={loading} />

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
          onRefresh={refresh}
        />
      </div>

      <AddItemModal
        open={showAddItem}
        onOpenChange={setShowAddItem}
        onSuccess={refresh}
      />
    </div>
  );
}

import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import PlantillaItemTable from "./components/plantillaItemTable";
import PlantillaItemModal from "./components/plantillaItemModal";
import { plantillaItemService } from "../../services/plantillaService";

const STAT_CARDS = [
  { label: "Total Items", key: "total" },
  { label: "Filled", key: "FILLED" },
  { label: "Unfilled", key: "UNFILLED" },
  { label: "Vacant", key: "VACANT" },
];

export default function PlantillaItemsPage() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [tableLoading, setTableLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");

  const stats = {
    total: items.length,
    FILLED: items.filter((i) => i.status?.toUpperCase() === "FILLED").length,
    UNFILLED: items.filter((i) => i.status?.toUpperCase() === "UNFILLED")
      .length,
    VACANT: items.filter((i) => i.status?.toUpperCase() === "VACANT").length,
  };

  const fetchItems = useCallback(async () => {
    setTableLoading(true);
    try {
      const data = await plantillaItemService.getPlantillaItems();
      setItems(Array.isArray(data) ? data : (data.data ?? []));
    } catch {
      toast.error("Failed to load plantilla items.");
    } finally {
      setTableLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.item_number?.toString().toLowerCase().includes(q) ||
        item.title?.toLowerCase().includes(q) ||
        item.status?.toLowerCase().includes(q),
    );
  }, [items, search]);

  const openAdd = () => {
    setSelected(null);
    setShowForm(true);
  };

  const openEdit = (item) => {
    setSelected(item);
    setShowForm(true);
  };

  const handleSubmit = async (data) => {
    setFormLoading(true);
    try {
      if (data.id) {
        await plantillaItemService.updatePlantillaItem(data.id, data);
        toast.success("Plantilla item updated.");
      } else {
        await plantillaItemService.createPlantillaItem(data);
        toast.success("Plantilla item added.");
      }
      setShowForm(false);
      await fetchItems();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="min-h-cover max-h-screen bg-white">
      <div className="p-3 sm:p-4 md:p-6 space-y-4 md:space-y-5">
        {/* Page Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
              Plantilla Items
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
              {tableLoading
                ? "Loading..."
                : search
                  ? `${filteredItems.length} result${filteredItems.length !== 1 ? "s" : ""} for "${search}"`
                  : `${items.length} total`}
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
                placeholder="Search items..."
                className="pl-8 h-9 w-full sm:w-48 md:w-56 text-sm border-gray-200 focus-visible:ring-gray-300 focus-visible:ring-1"
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
              className="bg-gray-900 hover:bg-black text-white text-sm h-9 px-3 sm:px-4 shrink-0"
              onClick={openAdd}
            >
              <Plus size={14} className="mr-1 sm:mr-1.5" />
              Add Item
            </Button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          {STAT_CARDS.map(({ label, key }) => (
            <div
              key={key}
              className="rounded-lg border border-gray-200 bg-white px-3 sm:px-4 md:px-5 py-3 sm:py-4"
            >
              <div className="text-xl sm:text-2xl font-bold text-gray-900 font-mono">
                {stats[key]}
              </div>
              <div className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1 uppercase tracking-widest font-medium">
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
          <PlantillaItemTable
            items={filteredItems}
            loading={tableLoading}
            onEdit={openEdit}
            search={search}
          />
        </div>
      </div>

      <PlantillaItemModal
        open={showForm}
        onOpenChange={setShowForm}
        item={selected}
        loading={formLoading}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { plantillaItemService } from "@/services/plantillaService";
import { computeItemStats, filterItemsBySearch } from "../helpers/plantillaHelpers";

/**
 * Owns the plantilla items list: fetch/refresh, the search query, the
 * search-filtered view, and the stat-card totals. Extracted verbatim from
 * PlantillaItemsPage.jsx so the page component only wires state to markup.
 */
export function usePlantillaItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

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

  const stats = useMemo(() => computeItemStats(items), [items]);

  const filtered = useMemo(
    () => filterItemsBySearch(items, search),
    [items, search],
  );

  return {
    items,
    filtered,
    loading,
    search,
    setSearch,
    stats,
    refresh: fetchItems,
  };
}

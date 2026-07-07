import { useMemo, useState } from "react";
import { Megaphone, Search, Plus, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useToast, Toaster } from "./components/Toast";
import { SkeletonCard } from "./components/SkeletonCard";
import { AnnouncementCard } from "./components/AnnouncementCard";
import { CreateModal } from "./components/CreateModal";
import { FilterPopover } from "./components/FilterPopover";
import { SortControl } from "./components/SortControl";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { useAuth } from "@/hooks/useAuth";
import { useDebounce } from "@/hooks/useDebounce";
import { AnnouncementsApi } from "@/services/announcements";
import { mapAnnouncement } from "@/lib/announcementMapper";

export default function HRISAnnouncementPage() {
  const { hasPermission, user: currentUser } = useAuth();
  const canManage = hasPermission("announcements.manage");

  const canCreate =
    currentUser?.roles?.includes?.("SuperAdmin") ||
    currentUser?.roles?.includes?.("HR");

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 350);
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState("newest");
  const [showCreate, setShowCreate] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const { toast } = useToast();

  const {
    items,
    loading,
    error,
    hasMore,
    loadMore,
    patchItem,
    removeItem,
    prependItem,
    refetch,
  } = useAnnouncements({
    archived: showArchived,
    search: debouncedQuery,
    filters,
    sort,
  });

  const unreadCount = useMemo(
    () => items.filter((a) => a.unread && !a.archived).length,
    [items],
  );

  async function handleCreate(formData) {
    try {
      const created = await AnnouncementsApi.create(formData);
      prependItem(mapAnnouncement(created));
      toast("Announcement published", "📣");
      setShowCreate(false);
    } catch (e) {
      toast(
        e.response?.data?.message ?? "Failed to publish announcement",
        "⚠️",
      );
    }
  }

  async function handlePin(id) {
    const optimistic = items.find((a) => a.id === id);
    patchItem(id, { pinned: !optimistic.pinned });
    try {
      await AnnouncementsApi.togglePin(id);
      toast(optimistic.pinned ? "Unpinned" : "Pinned to top", "📌");
    } catch {
      patchItem(id, { pinned: optimistic.pinned });
      toast("Couldn't update pin status", "⚠️");
    }
  }

  async function handleArchive(id) {
    try {
      await AnnouncementsApi.toggleArchive(id);
      removeItem(id);
      toast(showArchived ? "Unarchived" : "Archived", "🗂️");
    } catch {
      toast("Couldn't update archive status", "⚠️");
    }
  }

  async function handleUpdateAnn(id, formData) {
    try {
      const updated = await AnnouncementsApi.update(id, formData);
      patchItem(id, mapAnnouncement(updated));
      toast("Announcement updated", "✏️");
    } catch (e) {
      toast(e.response?.data?.message ?? "Failed to update", "⚠️");
    }
  }

  async function handleDelete(id) {
    try {
      await AnnouncementsApi.destroy(id);
      removeItem(id);
      toast("Announcement deleted", "🗑️");
    } catch {
      toast("Couldn't delete announcement", "⚠️");
    }
  }

  return (
    <TooltipProvider>
      <div className="h-full flex flex-col" style={{ background: "#F8FAFC" }}>
        <div className="bg-white border-b border-slate-200 shadow-sm flex-shrink-0">
          <div className="px-4 sm:px-6 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm shadow-blue-200">
                  <Megaphone size={18} className="text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="font-bold text-slate-900 text-lg leading-tight">
                      Company Announcements
                    </h1>
                    {unreadCount > 0 && !showArchived && (
                      <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative flex-1 sm:flex-none sm:w-52">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                  <Input
                    className="pl-9 bg-slate-50"
                    placeholder="Search…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
                <FilterPopover
                  filters={filters}
                  onChange={setFilters}
                  onClear={() => setFilters({})}
                />
                <SortControl value={sort} onChange={setSort} />
                {canCreate && (
                  <Button
                    onClick={() => setShowCreate(true)}
                    className="gap-2 flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus size={13} />
                    <span className="hidden sm:inline">New</span>
                  </Button>
                )}
              </div>
            </div>

            <Tabs
              value={showArchived ? "archived" : "active"}
              onValueChange={(v) => setShowArchived(v === "archived")}
              className="mt-3 pt-3 border-t border-slate-100"
            >
              <TabsList className="bg-transparent p-0 h-auto gap-3">
                <TabsTrigger
                  value="active"
                  className="px-0 pb-0.5 text-xs font-semibold rounded-none border-0 border-b-2 border-transparent shadow-none ring-0 focus-visible:ring-0 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600"
                >
                  Active
                </TabsTrigger>
                <TabsTrigger
                  value="archived"
                  className="px-0 pb-0.5 text-xs font-semibold rounded-none border-0 border-b-2 border-transparent shadow-none ring-0 focus-visible:ring-0 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600"
                >
                  <Archive size={11} /> Archived
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
          <div className="max-w-screen mx-auto space-y-4">
            {error && (
              <div className="text-center py-10 text-sm text-red-600">
                Failed to load announcements.{" "}
                <button className="underline" onClick={refetch}>
                  Retry
                </button>
              </div>
            )}
            {loading && items.length === 0 ? (
              Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
            ) : items.length === 0 ? (
              <div className="text-center py-20">
                <h3 className="font-bold text-slate-700 text-lg mb-2">
                  {showArchived
                    ? "No archived announcements"
                    : "No announcements yet"}
                </h3>
              </div>
            ) : (
              items.map((ann) => (
                <AnnouncementCard
                  key={ann.id}
                  ann={ann}
                  canManage={canManage}
                  onPin={handlePin}
                  onArchive={handleArchive}
                  onUpdateAnn={handleUpdateAnn}
                  onDelete={handleDelete}
                  onMarkedRead={(id) => patchItem(id, { unread: false })}
                  toast={toast}
                />
              ))
            )}
            {!loading && hasMore && (
              <div className="text-center pt-2">
                <Button variant="outline" onClick={loadMore}>
                  Load more
                </Button>
              </div>
            )}
            {loading && items.length > 0 && (
              <div className="text-center text-xs text-slate-400">
                Loading more…
              </div>
            )}
          </div>
        </div>

        {showCreate && (
          <CreateModal
            onClose={() => setShowCreate(false)}
            onCreate={handleCreate}
          />
        )}
        <Toaster position="bottom-right" richColors />
      </div>
    </TooltipProvider>
  );
}

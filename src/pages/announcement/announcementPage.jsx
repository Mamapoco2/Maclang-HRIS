import { useState, useMemo } from "react";
import { Megaphone, Search, Plus, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TooltipProvider } from "@/components/ui/tooltip";
import { INITIAL_ANNOUNCEMENTS } from "./constants";
import { useToast, Toaster } from "./components/Toast";
import { SkeletonCard } from "./components/SkeletonCard";
import { AnnouncementCard } from "./components/AnnouncementCard";
import { CreateModal } from "./components/CreateModal";
import { FilterPopover } from "./components/FilterPopover";
import { SortControl } from "./components/SortControl";

export default function HRISAnnouncementPage() {
  const [announcements, setAnnouncements] = useState(INITIAL_ANNOUNCEMENTS);
  const [loading] = useState(false);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState("newest");
  const [showCreate, setShowCreate] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const { toast } = useToast();

  const unreadCount = announcements.filter(
    (a) => a.unread && !a.archived,
  ).length;

  const processed = useMemo(() => {
    let list = announcements.filter((a) =>
      showArchived ? a.archived : !a.archived,
    );
    const q = query.toLowerCase();
    if (q)
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.author.dept.toLowerCase().includes(q) ||
          a.author.name.toLowerCase().includes(q),
      );
    if (filters.priorities?.length)
      list = list.filter((a) => filters.priorities.includes(a.priority));
    if (filters.departments?.length)
      list = list.filter((a) => filters.departments.includes(a.author.dept));
    if (filters.pinned) list = list.filter((a) => a.pinned);
    if (filters.unread) list = list.filter((a) => a.unread);

    list = [...list].sort((a, b) => {
      if (sort === "oldest") return a.postedAt - b.postedAt;
      if (sort === "reactions") {
        const ra = Object.values(a.reactions || {}).reduce((s, v) => s + v, 0);
        const rb = Object.values(b.reactions || {}).reduce((s, v) => s + v, 0);
        return rb - ra;
      }
      if (sort === "views") return b.views - a.views;
      return b.postedAt - a.postedAt;
    });

    // Pinned always float on top (unless in archive view)
    if (!showArchived) {
      const pinned = list.filter((a) => a.pinned);
      const rest = list.filter((a) => !a.pinned);
      list = [...pinned, ...rest];
    }

    return list;
  }, [announcements, query, filters, sort, showArchived]);

  function update(fn) {
    setAnnouncements((prev) => prev.map(fn));
  }

  function handleCreate(ann) {
    setAnnouncements((prev) => [ann, ...prev]);
    toast("Announcement published", "📣");
  }
  function handleUpdateComments(annId, comments) {
    update((a) => (a.id === annId ? { ...a, comments } : a));
  }
  function handlePin(id) {
    update((a) => (a.id === id ? { ...a, pinned: !a.pinned } : a));
  }
  function handleArchive(id) {
    update((a) => (a.id === id ? { ...a, archived: !a.archived } : a));
  }
  function handleUpdateAnn(updated) {
    update((a) => (a.id === updated.id ? updated : a));
  }

  return (
    <TooltipProvider>
      <div className="h-full flex flex-col" style={{ background: "#F8FAFC" }}>
        {/* Header */}
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
                  <p className="text-xs text-slate-400 leading-tight">
                    {announcements.filter((a) => !a.archived).length} active
                    announcements
                  </p>
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
                <Button
                  onClick={() => setShowCreate(true)}
                  className="gap-2 flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus size={13} />
                  <span className="hidden sm:inline">New</span>
                </Button>
              </div>
            </div>

            {/* Archive toggle */}
            <Tabs
              value={showArchived ? "archived" : "active"}
              onValueChange={(v) => setShowArchived(v === "archived")}
              className="mt-3 pt-3 border-t border-slate-100"
            >
              <TabsList className="bg-transparent p-0 h-auto gap-3">
                <TabsTrigger
                  value="active"
                  className=" px-0 pb-0.5 text-xs font-semibold rounded-none border-0 border-b-2 border-transparent shadow-none ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  Active
                </TabsTrigger>
                <TabsTrigger
                  value="archived"
                  className=" px-0 pb-0.5 text-xs font-semibold rounded-none border-0 border-b-2 border-transparent shadow-none ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  <Archive size={11} /> Archived (
                  {announcements.filter((a) => a.archived).length})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Feed */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
          <div className="max-w-screen mx-auto space-y-4">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
            ) : processed.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-5">
                  {showArchived ? (
                    <Archive size={36} className="text-slate-300" />
                  ) : (
                    <Megaphone size={36} className="text-slate-300" />
                  )}
                </div>
                <h3 className="font-bold text-slate-700 text-lg mb-2">
                  {query || Object.values(filters).some(Boolean)
                    ? "No results found"
                    : showArchived
                      ? "No archived announcements"
                      : "No announcements yet"}
                </h3>
                <p className="text-sm text-slate-400 max-w-xs mx-auto">
                  {query || Object.values(filters).some(Boolean)
                    ? "Try adjusting your search or filters."
                    : showArchived
                      ? "Archived announcements will appear here."
                      : "Check back soon."}
                </p>
                {(query || Object.values(filters).some(Boolean)) && (
                  <Button
                    variant="link"
                    className="mt-4 text-sm"
                    onClick={() => {
                      setQuery("");
                      setFilters({});
                    }}
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            ) : (
              processed.map((ann) => (
                <AnnouncementCard
                  key={ann.id}
                  ann={ann}
                  onUpdateComments={handleUpdateComments}
                  onPin={handlePin}
                  onArchive={handleArchive}
                  onUpdateAnn={handleUpdateAnn}
                  toast={toast}
                />
              ))
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

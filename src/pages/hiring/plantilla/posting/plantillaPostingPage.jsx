import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useContext,
} from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle2, Filter, X } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/api";
import { plantillaPostingService } from "@/services/plantillaPostingService";
import { AuthContext } from "@/context/authContext";
import { hasPermission } from "@/lib/authHelpers";
import { PERMISSIONS } from "@/constants/permissions";

import { Button, Modal } from "./components/ui";
import { TableSkeleton, EmptyState, Pagination } from "./components/TableParts";
import { ViewDrawer } from "./components/ViewDrawer";
import { ApplyDialog } from "./components/ApplyDialog";
import { ApplicationsDrawer } from "./components/ApplicationsDrawer";
import { normalisePosting } from "./components/utils";

import { PostingHeader } from "./components/posting/PostingHeader";
import { PostingStats } from "./components/posting/PostingStats";
import { PostingFilters } from "./components/posting/PostingFilters";
import { PostingTable } from "./components/posting/PostingTable";
import { PostingMobileCards } from "./components/posting/PostingMobileCards";
import { DeletePostingModal } from "./components/posting/DeletePostingModal";
import { CreatePostingDialog } from "./components/posting/CreatePostingDialog";
import { EditPostingDialog } from "./components/posting/EditPostingDialog";
import { extractPostedBaseItemNumbers } from "./components/posting/postingHelpers";

const SEARCH_DEBOUNCE_MS = 350;
const ALL_POSTINGS_FETCH_LIMIT = 1000;

const EMPTY_FILTERS = {
  department_id: "",
  division_id: "",
  salary_grade_id: "",
  employment_status: "",
  status: "",
};

export default function PlantillaPostingPage() {
  const { user, hasRole } = useContext(AuthContext) || {};
  const [searchParams, setSearchParams] = useSearchParams();

  const isAdmin = hasPermission(user, PERMISSIONS.PLANTILLA_POSTINGS_MANAGE);
  const canViewSummary =
    hasRole("SuperAdmin") || hasRole("Admin") || hasRole("HR");

  // ── List data ────────────────────────────────────────────────────────
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [salaryGrades, setSalaryGrades] = useState([]);
  const [vacantItems, setVacantItems] = useState([]);
  const [postedBaseItemNumbers, setPostedBaseItemNumbers] = useState(
    () => new Set(),
  );

  // ── Search / filter / sort / page ───────────────────────────────────
  const linkedItemParam = searchParams.get("item") || "";
  const [pinnedItem, setPinnedItem] = useState(linkedItemParam || null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [sortBy, setSortBy] = useState("Newest");
  const [showFilters, setShowFilters] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const clearPinnedItem = useCallback(() => setPinnedItem(null), []);

  // ── Dialog / drawer state ───────────────────────────────────────────
  const [viewItem, setViewItem] = useState(null);
  const [applyItem, setApplyItem] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPosting, setEditingPosting] = useState(null);
  const [editLoadingId, setEditLoadingId] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [applicationsPosting, setApplicationsPosting] = useState(null);

  useEffect(() => {
    if (linkedItemParam) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete("item");
          return next;
        },
        { replace: true },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [search]);

  const loadPostings = useCallback(
    async (signal) => {
      setLoading(true);
      try {
        const params = pinnedItem
          ? { page: 1, per_page: pageSize, search: pinnedItem }
          : {
              page,
              per_page: pageSize,
              search: debouncedSearch || undefined,
              department_id: filters.department_id || undefined,
              division_id: filters.division_id || undefined,
              salary_grade_id: filters.salary_grade_id || undefined,
              employment_status: filters.employment_status || undefined,
              status: filters.status || undefined,
            };
        const fetcher = isAdmin
          ? plantillaPostingService.getPostings
          : plantillaPostingService.getAvailablePostings;
        const res = await fetcher(params, { signal });
        let normalised = (res.data ?? []).map(normalisePosting);
        if (pinnedItem) {
          // Belt-and-suspenders: the backend search is a LIKE match and
          // could still return neighbouring items (e.g. item "12" vs
          // "120"), so enforce an exact match client-side too.
          normalised = normalised.filter(
            (it) => it.baseItemNumber === pinnedItem,
          );
        }
        setItems(normalised);
        setTotalCount(pinnedItem ? normalised.length : (res.total ?? 0));
      } catch (err) {
        if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED")
          return;
        console.error(err);
        toast?.error?.("Failed to load plantilla postings.");
      } finally {
        setLoading(false);
      }
    },
    [isAdmin, page, pageSize, debouncedSearch, filters, pinnedItem],
  );

  const loadPostedBaseItemNumbers = useCallback(async (signal) => {
    try {
      const res = await plantillaPostingService.getPostings(
        { per_page: ALL_POSTINGS_FETCH_LIMIT },
        { signal },
      );
      setPostedBaseItemNumbers(extractPostedBaseItemNumbers(res.data));
    } catch (err) {
      if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") return;
      console.error(err);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadPostings(controller.signal);
    return () => controller.abort();
  }, [loadPostings]);

  useEffect(() => {
    api
      .get("/departments/options")
      .then((res) => setDepartments(res.data?.data ?? res.data ?? []))
      .catch((err) => {
        console.error(err);
        toast?.error?.("Failed to load office options.");
      });
    api
      .get("/divisions/options")
      .then((res) => setDivisions(res.data?.data ?? res.data ?? []))
      .catch((err) => {
        console.error(err);
        toast?.error?.("Failed to load division options.");
      });
    api
      .get("/salary-grades/options")
      .then((res) => setSalaryGrades(res.data?.data ?? res.data ?? []))
      .catch((err) => {
        console.error(err);
        toast?.error?.("Failed to load salary grade options.");
      });

    if (isAdmin) {
      plantillaPostingService
        .getVacantItems()
        .then(setVacantItems)
        .catch(console.error);

      const controller = new AbortController();
      loadPostedBaseItemNumbers(controller.signal);
      return () => controller.abort();
    }
  }, [isAdmin, loadPostedBaseItemNumbers]);

  const sorted = useMemo(() => {
    const list = [...items];
    list.sort((a, b) => {
      switch (sortBy) {
        case "Oldest":
          return new Date(a.datePosted) - new Date(b.datePosted);
        case "Salary Grade":
          return (
            parseInt(b.salaryGrade.replace(/\D/g, "")) -
            parseInt(a.salaryGrade.replace(/\D/g, ""))
          );
        case "Position Name":
          return a.positionTitle.localeCompare(b.positionTitle);
        default:
          return new Date(b.datePosted) - new Date(a.datePosted);
      }
    });
    return list;
  }, [items, sortBy]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const resetFilters = useCallback(() => {
    setPinnedItem(null);
    setSearch("");
    setDebouncedSearch("");
    setFilters(EMPTY_FILTERS);
    setSortBy("Newest");
    setPage(1);
  }, []);

  const handleFilterChange = useCallback((key, value) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  }, []);

  const handlePageSizeChange = useCallback((size) => {
    setPageSize(size);
    setPage(1);
  }, []);

  const openEditDialog = useCallback(async (item) => {
    setEditLoadingId(item.id);
    try {
      const full = await plantillaPostingService.getPosting(item.id);
      setEditingPosting(normalisePosting(full));
    } catch (err) {
      console.error(err);
      toast?.error?.(
        err?.response?.data?.message ??
          "Failed to load the full posting details for editing.",
      );
    } finally {
      setEditLoadingId(null);
    }
  }, []);

  const handleCreate = useCallback(
    async (payload) => {
      try {
        await plantillaPostingService.createPosting(payload);
        toast?.success?.("Posted successfully.");
        setIsCreateOpen(false);
        loadPostings();
        loadPostedBaseItemNumbers();
      } catch (err) {
        toast?.error?.(
          err?.response?.data?.message ?? "An error occurred while saving.",
        );
        throw err;
      }
    },
    [loadPostings, loadPostedBaseItemNumbers],
  );

  const handleUpdate = useCallback(
    async (payload) => {
      try {
        await plantillaPostingService.updatePosting(payload.id, payload);
        toast?.success?.("Updated successfully.");
        setEditingPosting(null);
        loadPostings();
      } catch (err) {
        toast?.error?.(
          err?.response?.data?.message ?? "An error occurred while saving.",
        );
        throw err;
      }
    },
    [loadPostings],
  );

  const handleDelete = useCallback(async () => {
    if (deleting || !deleteItem) return;
    setDeleting(true);
    try {
      await plantillaPostingService.deletePosting(deleteItem.id);
      toast?.success?.("Posting removed.");
      setDeleteItem(null);
      loadPostings();
      loadPostedBaseItemNumbers();
    } catch (err) {
      toast?.error?.(
        err?.response?.data?.message ?? "Failed to delete posting.",
      );
    } finally {
      setDeleting(false);
    }
  }, [deleting, deleteItem, loadPostings, loadPostedBaseItemNumbers]);

  return (
    <div className="min-h-full w-full min-w-0 max-w-full overflow-x-hidden bg-slate-50 font-sans text-slate-900 antialiased [contain:inline-size]">
      <div className="mx-auto w-full min-w-0 max-w-full px-4 py-5">
        <PostingHeader
          isAdmin={isAdmin}
          postings={sorted}
          onCreate={() => setIsCreateOpen(true)}
        />

        {canViewSummary && (
          <div className="mt-6 min-w-0">
            <PostingStats items={items} loading={loading} />
          </div>
        )}

        {pinnedItem && (
          <div className="mt-6 flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            <Filter className="h-4 w-4 flex-shrink-0" />
            <span className="flex-1">
              Showing only item <strong>{pinnedItem}</strong> — linked from an
              announcement.
            </span>
            <button
              onClick={clearPinnedItem}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
            >
              <X className="h-3.5 w-3.5" />
              Show all postings
            </button>
          </div>
        )}

        <PostingFilters
          search={search}
          onSearchChange={setSearch}
          sortBy={sortBy}
          onSortChange={setSortBy}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((s) => !s)}
          onReset={resetFilters}
          onRefresh={() => loadPostings()}
          loading={loading}
          filters={filters}
          onFilterChange={handleFilterChange}
          departments={departments}
          divisions={divisions}
          salaryGrades={salaryGrades}
          locked={!!pinnedItem}
        />

        <div className="mt-6 min-w-0">
          {loading ? (
            <TableSkeleton />
          ) : sorted.length === 0 ? (
            <EmptyState
              onCreate={() => setIsCreateOpen(true)}
              showCreate={isAdmin}
            />
          ) : (
            <>
              <PostingTable
                items={sorted}
                isAdmin={isAdmin}
                onView={setViewItem}
                onEdit={openEditDialog}
                onDelete={setDeleteItem}
                onApply={setApplyItem}
                onViewApplications={setApplicationsPosting}
                editLoadingId={editLoadingId}
              />
              <PostingMobileCards
                items={sorted}
                isAdmin={isAdmin}
                onView={setViewItem}
                onEdit={openEditDialog}
                onDelete={setDeleteItem}
                onApply={setApplyItem}
                onViewApplications={setApplicationsPosting}
                editLoadingId={editLoadingId}
              />
              <Pagination
                total={totalCount}
                page={page}
                pageSize={pageSize}
                totalPages={totalPages}
                onPageChange={setPage}
                onPageSizeChange={handlePageSizeChange}
              />
            </>
          )}
        </div>
      </div>

      <ViewDrawer
        item={viewItem}
        onClose={() => setViewItem(null)}
        isAdmin={isAdmin}
        onApply={() => {
          setApplyItem(viewItem);
          setViewItem(null);
        }}
      />

      <ApplyDialog
        item={applyItem}
        user={user}
        onClose={() => setApplyItem(null)}
        onSuccess={() => {
          setApplyItem(null);
          setApplySuccess(true);
          loadPostings();
        }}
      />

      <Modal
        open={applySuccess}
        onClose={() => setApplySuccess(false)}
        widthClass="max-w-sm"
      >
        <div className="p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-slate-900">
            Application submitted
          </h3>
          <p className="mt-1.5 text-sm text-slate-500">
            Your application has been received. You can track its status from
            your applications page.
          </p>
          <Button
            className="mt-5 w-full"
            onClick={() => setApplySuccess(false)}
          >
            Done
          </Button>
        </div>
      </Modal>

      <CreatePostingDialog
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSave={handleCreate}
        departments={departments}
        divisions={divisions}
        salaryGrades={salaryGrades}
        vacantItems={vacantItems}
        postedBaseItemNumbers={postedBaseItemNumbers}
      />

      <EditPostingDialog
        posting={editingPosting}
        onClose={() => setEditingPosting(null)}
        onSave={handleUpdate}
        departments={departments}
        divisions={divisions}
        salaryGrades={salaryGrades}
      />

      <DeletePostingModal
        item={deleteItem}
        deleting={deleting}
        onCancel={() => setDeleteItem(null)}
        onConfirm={handleDelete}
      />

      <ApplicationsDrawer
        posting={applicationsPosting}
        onClose={() => setApplicationsPosting(null)}
        onChanged={loadPostings}
      />
    </div>
  );
}

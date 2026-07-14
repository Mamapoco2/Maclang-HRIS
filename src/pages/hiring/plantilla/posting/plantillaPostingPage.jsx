import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useContext,
} from "react";
import {
  BriefcaseBusiness,
  Plus,
  Download,
  Search,
  RotateCcw,
  RefreshCw,
  Eye,
  Pencil,
  Trash2,
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Briefcase,
  Building2,
  Loader2,
  SlidersHorizontal,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/api/api";
import { plantillaPostingService } from "@/services/plantillaPostingService";
import { AuthContext } from "@/context/authContext";
import { hasPermission } from "@/lib/authHelpers";
import { PERMISSIONS } from "@/constants/permissions";

import { Button, Input, Select, Modal } from "./components/ui";
import { StatCard, StatsSkeleton } from "./components/StatCard";
import {
  StatusBadge,
  Th,
  Td,
  RowActions,
  TableSkeleton,
  EmptyState,
  Pagination,
} from "./components/TableParts";
import { ViewDrawer } from "./components/ViewDrawer";
import { ApplyDialog } from "./components/ApplyDialog";
import { EditDialog } from "./components/EditDialog";
import { ApplicationsDrawer } from "./components/ApplicationsDrawer";
import { EMP_STATUS, EMPTY_FORM } from "./components/constants";
import {
  normalisePosting,
  formatCurrency,
  formatDate,
} from "./components/utils";

const SEARCH_DEBOUNCE_MS = 350;

function sanitizeCsvCell(value) {
  const str = String(value ?? "");
  if (/^[=+\-@\t\r]/.test(str)) {
    return `'${str}`;
  }
  return str;
}

export default function PlantillaPostingPage() {
  const { user, hasRole } = useContext(AuthContext) || {};

  const isAdmin = hasPermission(user, PERMISSIONS.PLANTILLA_POSTINGS_MANAGE);
  const canViewSummary =
    hasRole("SuperAdmin") || hasRole("Admin") || hasRole("HR");

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [salaryGrades, setSalaryGrades] = useState([]);
  const [vacantItems, setVacantItems] = useState([]);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filters, setFilters] = useState({
    department_id: "",
    division_id: "",
    salary_grade_id: "",
    employment_status: "",
    status: "",
  });
  const [sortBy, setSortBy] = useState("Newest");
  const [showFilters, setShowFilters] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const [viewItem, setViewItem] = useState(null);
  const [applyItem, setApplyItem] = useState(null);
  const [editItem, setEditItem] = useState(undefined);
  const [deleteItem, setDeleteItem] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [applicationsPosting, setApplicationsPosting] = useState(null);

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
        const params = {
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
        setItems((res.data ?? []).map(normalisePosting));
        setTotalCount(res.total ?? 0);
      } catch (err) {
        if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED")
          return;
        console.error(err);
        toast?.error?.("Failed to load plantilla postings.");
      } finally {
        setLoading(false);
      }
    },
    [isAdmin, page, pageSize, debouncedSearch, filters],
  );

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
    }
  }, [isAdmin]);

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

  const stats = useMemo(
    () => ({
      totalVacancies: items.reduce(
        (s, i) => s + (i.vacantSlots ?? i.vacancies),
        0,
      ),
      open: items.filter((i) => i.status === "Open").length,
      closingSoon: items.filter((i) => i.status === "Closing Soon").length,
      totalApplicants: items.reduce((s, i) => s + i.applicants, 0),
    }),
    [items],
  );

  const resetFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setFilters({
      department_id: "",
      division_id: "",
      salary_grade_id: "",
      employment_status: "",
      status: "",
    });
    setSortBy("Newest");
    setPage(1);
  };

  const handleDelete = async () => {
    if (deleting || !deleteItem) return;
    setDeleting(true);
    try {
      await plantillaPostingService.deletePosting(deleteItem.id);
      toast?.success?.("Posting removed.");
      setDeleteItem(null);
      loadPostings();
    } catch (err) {
      toast?.error?.(
        err?.response?.data?.message ?? "Failed to delete posting.",
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleExport = () => {
    const rows = [
      [
        "Item No.",
        "Position Title",
        "Office",
        "Division",
        "Salary Grade",
        "Monthly Salary",
        "Employment Status",
        "Vacancies",
        "Date Posted",
        "Closing Date",
        "Applicants",
        "Status",
      ],
      ...sorted.map((i) => [
        i.baseItemNumber,
        i.positionTitle,
        i.office,
        i.division,
        i.salaryGrade,
        i.monthlySalary,
        i.employmentStatus,
        i.vacantSlots ?? i.vacancies,
        i.datePosted,
        i.closingDate,
        i.applicants,
        i.status,
      ]),
    ];
    const csv = rows
      .map((r) =>
        r.map((c) => `"${sanitizeCsvCell(c).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "plantilla-postings.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-full w-full min-w-0 max-w-full overflow-x-hidden bg-slate-50 font-sans text-slate-900 antialiased [contain:inline-size]">
      <div className="mx-auto w-full min-w-0 max-w-full px-4 py-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <BriefcaseBusiness style={{ height: 22, width: 22 }} />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                {isAdmin ? "Plantilla Postings" : "Available Plantilla Items"}
              </h1>
              <p className="mt-0.5 text-sm text-slate-500">
                {isAdmin
                  ? "Post vacant plantilla items and review applicants."
                  : "View and apply for available plantilla positions."}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {isAdmin && (
              <>
                <Button variant="secondary" size="sm" onClick={handleExport}>
                  <Download className="h-4 w-4" />
                  Export List
                </Button>
                <Button
                  size="sm"
                  onClick={() =>
                    setEditItem({ mode: "create", data: EMPTY_FORM })
                  }
                >
                  <Plus className="h-4 w-4" />
                  New Posting
                </Button>
              </>
            )}
          </div>
        </div>

        {canViewSummary && (
          <div className="mt-6 min-w-0">
            {loading ? (
              <StatsSkeleton />
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  icon={Briefcase}
                  label="Total Vacancies"
                  value={stats.totalVacancies}
                  sub="Across all postings"
                  tone="indigo"
                />
                <StatCard
                  icon={CheckCircle2}
                  label="Open Positions"
                  value={stats.open}
                  sub="Currently accepting applicants"
                  tone="emerald"
                />
                <StatCard
                  icon={Clock}
                  label="Closing Soon"
                  value={stats.closingSoon}
                  sub="Closing within the week"
                  tone="amber"
                />
                <StatCard
                  icon={Users}
                  label="Total Applicants"
                  value={stats.totalApplicants}
                  sub="Submitted applications"
                  tone="sky"
                />
              </div>
            )}
          </div>
        )}

        <div className="mt-6 min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search position, item number..."
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={sortBy}
                onChange={setSortBy}
                options={[
                  "Newest",
                  "Oldest",
                  "Salary Grade",
                  "Position Name",
                ].map((v) => ({ value: v, label: v }))}
                placeholder="Sort by"
                className="w-40"
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowFilters((s) => !s)}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {showFilters ? (
                  <ChevronUp className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
              </Button>
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => loadPostings()}
                aria-label="Refresh"
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 sm:grid-cols-3 lg:grid-cols-5">
              <Select
                value={filters.department_id}
                onChange={(v) => {
                  setFilters((f) => ({ ...f, department_id: v }));
                  setPage(1);
                }}
                options={departments.map((d) => ({
                  value: String(d.id),
                  label: d.name,
                }))}
                placeholder="Office"
              />
              <Select
                value={filters.division_id}
                onChange={(v) => {
                  setFilters((f) => ({ ...f, division_id: v }));
                  setPage(1);
                }}
                options={divisions.map((d) => ({
                  value: String(d.id),
                  label: d.name,
                }))}
                placeholder="Division"
              />
              <Select
                value={filters.salary_grade_id}
                onChange={(v) => {
                  setFilters((f) => ({ ...f, salary_grade_id: v }));
                  setPage(1);
                }}
                options={salaryGrades.map((sg) => ({
                  value: String(sg.id),
                  label: `SG-${sg.salary_grade}`,
                }))}
                placeholder="Salary Grade"
              />
              <Select
                value={filters.employment_status}
                onChange={(v) => {
                  setFilters((f) => ({ ...f, employment_status: v }));
                  setPage(1);
                }}
                options={EMP_STATUS.map((v) => ({ value: v, label: v }))}
                placeholder="Employment Status"
              />
              <Select
                value={filters.status}
                onChange={(v) => {
                  setFilters((f) => ({ ...f, status: v }));
                  setPage(1);
                }}
                options={["Open", "Closing Soon", "Closed", "Filled"].map(
                  (v) => ({ value: v, label: v }),
                )}
                placeholder="Vacancy Status"
              />
            </div>
          )}
        </div>
        <div className="mt-6 min-w-0">
          {loading ? (
            <TableSkeleton />
          ) : sorted.length === 0 ? (
            <EmptyState
              onCreate={() => setEditItem({ mode: "create", data: EMPTY_FORM })}
              showCreate={isAdmin}
            />
          ) : (
            <>
              <div className="hidden min-w-0 max-w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:block">
                <div className="max-h-[560px] w-full max-w-full overflow-x-auto overflow-y-auto">
                  <table className="w-full min-w-[1100px] border-collapse text-left text-sm">
                    <thead className="sticky top-0 z-10 bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500">
                      <tr>
                        <Th>Item No.</Th>
                        <Th>Position Title</Th>
                        <Th>Office</Th>
                        <Th>Division</Th>
                        <Th>Salary Grade</Th>
                        <Th>Monthly Salary</Th>
                        <Th>Employment Status</Th>
                        <Th>Vacancies</Th>
                        <Th>Date Posted</Th>
                        <Th>Closing Date</Th>
                        <Th>Applicants</Th>
                        <Th>Status</Th>
                        <Th className="text-right">Actions</Th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sorted.map((it) => (
                        <tr
                          key={it.id}
                          className="transition-colors hover:bg-slate-50"
                        >
                          <Td className="font-medium text-slate-700">
                            {it.baseItemNumber}
                          </Td>
                          <Td className="max-w-[220px] truncate font-medium text-slate-900">
                            {it.positionTitle}
                          </Td>
                          <Td className="text-slate-500">{it.office}</Td>
                          <Td className="text-slate-500">{it.division}</Td>
                          <Td>{it.salaryGrade}</Td>
                          <Td className="whitespace-nowrap">
                            {formatCurrency(it.monthlySalary)}
                          </Td>
                          <Td className="text-slate-500">
                            {it.employmentStatus}
                          </Td>
                          <Td>{it.vacantSlots ?? it.vacancies}</Td>
                          <Td className="whitespace-nowrap text-slate-500">
                            {formatDate(it.datePosted)}
                          </Td>
                          <Td className="whitespace-nowrap text-slate-500">
                            {formatDate(it.closingDate)}
                          </Td>
                          <Td>{it.applicants}</Td>
                          <Td>
                            <StatusBadge status={it.status} />
                          </Td>
                          <Td className="text-right">
                            <RowActions
                              item={it}
                              isAdmin={isAdmin}
                              onView={() => setViewItem(it)}
                              onEdit={() =>
                                setEditItem({ mode: "edit", data: it })
                              }
                              onDelete={() => setDeleteItem(it)}
                              onApply={() => setApplyItem(it)}
                              onViewApplications={() =>
                                setApplicationsPosting(it)
                              }
                            />
                          </Td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:hidden">
                {sorted.map((it) => (
                  <div
                    key={it.id}
                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {it.positionTitle}
                        </p>
                        <p className="text-xs text-slate-400">
                          {it.baseItemNumber}
                        </p>
                      </div>
                      <StatusBadge status={it.status} />
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-y-1.5 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5" /> {it.office}
                      </div>
                      <div>SG: {it.salaryGrade}</div>
                      <div className="col-span-2 font-medium text-slate-700">
                        {formatCurrency(it.monthlySalary)} / mo
                      </div>
                      <div>Vacancies: {it.vacantSlots ?? it.vacancies}</div>
                      <div>Closes: {formatDate(it.closingDate)}</div>
                    </div>
                    <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1"
                        onClick={() => setViewItem(it)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View Details
                      </Button>
                      {!isAdmin ? (
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => setApplyItem(it)}
                          disabled={
                            it.status === "Closed" ||
                            it.status === "Filled" ||
                            it.alreadyApplied
                          }
                        >
                          {it.alreadyApplied ? "Already Applied" : "Apply"}
                        </Button>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setApplicationsPosting(it)}
                            aria-label="View Applications"
                          >
                            <Users className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              setEditItem({ mode: "edit", data: it })
                            }
                            aria-label="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteItem(it)}
                            aria-label="Delete"
                          >
                            <Trash2 className="h-4 w-4 text-rose-500" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <Pagination
                total={totalCount}
                page={page}
                pageSize={pageSize}
                totalPages={totalPages}
                onPageChange={setPage}
                onPageSizeChange={(v) => {
                  setPageSize(v);
                  setPage(1);
                }}
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
      <EditDialog
        state={editItem}
        onClose={() => setEditItem(undefined)}
        departments={departments}
        divisions={divisions}
        salaryGrades={salaryGrades}
        vacantItems={vacantItems}
        onSave={async (data, mode) => {
          try {
            if (mode === "create")
              await plantillaPostingService.createPosting(data);
            else await plantillaPostingService.updatePosting(data.id, data);
            toast?.success?.(
              mode === "create"
                ? "Posted successfully."
                : "Updated successfully.",
            );
            setEditItem(undefined);
            loadPostings();
          } catch (err) {
            toast?.error?.(
              err?.response?.data?.message ?? "An error occurred while saving.",
            );
            throw err;
          }
        }}
      />
      <Modal
        open={!!deleteItem}
        onClose={() => !deleting && setDeleteItem(null)}
        widthClass="max-w-sm"
      >
        {deleteItem && (
          <div className="p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-50 text-rose-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-slate-900">
              Delete posting
            </h3>
            <p className="mt-1.5 text-sm text-slate-500">
              This posting will be removed. This action cannot be undone.
            </p>
            <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
              {deleteItem.positionTitle} · {deleteItem.baseItemNumber}
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setDeleteItem(null)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>
      <ApplicationsDrawer
        posting={applicationsPosting}
        onClose={() => setApplicationsPosting(null)}
        onChanged={loadPostings}
      />
    </div>
  );
}

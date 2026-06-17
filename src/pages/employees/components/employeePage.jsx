import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Users,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { toast } from "sonner";
import { employeeService } from "@/services/employeeService";
import EmployeeTable from "./employeeTable";
import EmployeeForm from "./employeeForm";
import EmployeeDeleteDialog from "./employeeDeleteDialog";
import EmployeeViewDialog from "./employeeViewDialog";

const DEFAULT_PAGINATION = { current_page: 1, last_page: 1, total: 0 };
const PER_PAGE = 10;

export default function EmployeePage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [jumpPage, setJumpPage] = useState("");

  const [search, setSearch] = useState("");
  const [divisionFilter, setDivisionFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState("");

  const [allDivisions, setAllDivisions] = useState([]);
  const [allDepartments, setAllDepartments] = useState([]);

  const [openForm, setOpenForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [deleteEmployeeId, setDeleteEmployeeId] = useState(null);
  const [viewEmployee, setViewEmployee] = useState(null);

  const searchRef = useRef(search);
  const divisionRef = useRef(divisionFilter);
  const departmentRef = useRef(departmentFilter);
  const employmentTypeRef = useRef(employmentTypeFilter);

  useEffect(() => {
    searchRef.current = search;
  }, [search]);
  useEffect(() => {
    divisionRef.current = divisionFilter;
  }, [divisionFilter]);
  useEffect(() => {
    departmentRef.current = departmentFilter;
  }, [departmentFilter]);
  useEffect(() => {
    employmentTypeRef.current = employmentTypeFilter;
  }, [employmentTypeFilter]);

  useEffect(() => {
    Promise.all([
      employeeService.getDivisions(),
      employeeService.getDepartments(),
    ])
      .then(([divRes, deptRes]) => {
        setAllDivisions(Array.isArray(divRes) ? divRes : (divRes.data ?? []));
        setAllDepartments(
          Array.isArray(deptRes) ? deptRes : (deptRes.data ?? []),
        );
      })
      .catch(console.error);
  }, []);

  const loadEmployees = useCallback(
    async ({
      page = 1,
      searchValue = searchRef.current,
      division_id = divisionRef.current,
      department_id = departmentRef.current,
      employment_type = employmentTypeRef.current,
    } = {}) => {
      setLoading(true);
      try {
        const res = await employeeService.getEmployees({
          page,
          per_page: PER_PAGE,
          search: searchValue || undefined,
          division_id: division_id || undefined,
          department_id: department_id || undefined,
          employment_type: employment_type || undefined,
        });
        setEmployees(res.data ?? []);
        setPagination({
          current_page: res.current_page ?? 1,
          last_page: res.last_page ?? 1,
          total: res.total ?? 0,
        });
      } catch (err) {
        console.error("Failed to load employees:", err);
        toast.error("Failed to load employees.");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    loadEmployees({
      page: 1,
      searchValue: "",
      division_id: "",
      department_id: "",
      employment_type: "",
    });
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      loadEmployees({ page: 1, searchValue: search });
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    loadEmployees({ page: 1, division_id: divisionFilter, department_id: "" });
  }, [divisionFilter]);
  useEffect(() => {
    loadEmployees({ page: 1, department_id: departmentFilter });
  }, [departmentFilter]);
  useEffect(() => {
    loadEmployees({ page: 1, employment_type: employmentTypeFilter });
  }, [employmentTypeFilter]);

  const visibleDepartments = divisionFilter
    ? (allDivisions.find((d) => String(d.id) === String(divisionFilter))
        ?.departments ?? [])
    : allDepartments;

  const handleDivisionChange = (val) => {
    const v = val === "all" ? "" : val;
    setDivisionFilter(v);
    setDepartmentFilter("");
    departmentRef.current = "";
  };
  const handleDepartmentChange = (val) =>
    setDepartmentFilter(val === "all" ? "" : val);
  const handleEmploymentTypeChange = (val) => {
    const v = val === "all" ? "" : val;
    setEmploymentTypeFilter(v);
    employmentTypeRef.current = v;
  };

  const clearFilters = () => {
    setSearch("");
    setDivisionFilter("");
    setDepartmentFilter("");
    setEmploymentTypeFilter("");
    searchRef.current = "";
    divisionRef.current = "";
    departmentRef.current = "";
    employmentTypeRef.current = "";
    loadEmployees({
      page: 1,
      searchValue: "",
      division_id: "",
      department_id: "",
      employment_type: "",
    });
  };

  const hasFilters =
    search || divisionFilter || departmentFilter || employmentTypeFilter;

  const handleJumpPage = (e) => {
    e.preventDefault();
    const p = parseInt(jumpPage);
    if (!isNaN(p) && p >= 1 && p <= pagination.last_page) {
      loadEmployees({ page: p });
      setJumpPage("");
    }
  };

  const handleEdit = (emp) => {
    setEditingEmployee(emp);
    setOpenForm(true);
  };
  const handleDelete = (id) => setDeleteEmployeeId(id);
  const handleView = (emp) => setViewEmployee(emp);

  const confirmDelete = async () => {
    try {
      await employeeService.delete(deleteEmployeeId);
      toast.success("Employee deleted successfully.");
      loadEmployees({ page: pagination.current_page });
    } catch {
      toast.error("Failed to delete employee.");
    } finally {
      setDeleteEmployeeId(null);
    }
  };

  const pageRange = () => {
    const total = pagination.last_page;
    const cur = pagination.current_page;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const delta = 2;
    const left = Math.max(2, cur - delta);
    const right = Math.min(total - 1, cur + delta);
    const pages = [1];
    if (left > 2) pages.push("...");
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < total - 1) pages.push("...");
    pages.push(total);
    return pages;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Sticky Header ── */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-screen mx-auto px-6 py-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">
                Employees
              </h1>
              {pagination.total > 0 && (
                <p className="text-xs text-gray-500 leading-tight">
                  {pagination.total} total records
                </p>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 flex-1 min-w-48 max-w-xs border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              className="bg-transparent text-sm flex-1 outline-none placeholder:text-gray-400 text-gray-800"
              placeholder="Search employee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch("")}>
                <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-screen mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* ── Filters ── */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex flex-wrap items-center gap-3">
            <Select
              value={divisionFilter || "all"}
              onValueChange={handleDivisionChange}
            >
              <SelectTrigger className="h-9 text-sm w-44 rounded-lg border-gray-200 bg-gray-50 text-gray-700 focus:ring-2 focus:ring-blue-500">
                <SelectValue placeholder="All Divisions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Divisions</SelectItem>
                {allDivisions.map((d) => (
                  <SelectItem key={d.id} value={String(d.id)}>
                    {d.name.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={departmentFilter || "all"}
              onValueChange={handleDepartmentChange}
            >
              <SelectTrigger className="h-9 text-sm w-48 rounded-lg border-gray-200 bg-gray-50 text-gray-700 focus:ring-2 focus:ring-blue-500">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {visibleDepartments.map((d) => (
                  <SelectItem key={d.id ?? d.name} value={String(d.id)}>
                    {d.name.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={employmentTypeFilter || "all"}
              onValueChange={handleEmploymentTypeChange}
            >
              <SelectTrigger className="h-9 text-sm w-52 rounded-lg border-gray-200 bg-gray-50 text-gray-700 focus:ring-2 focus:ring-blue-500">
                <SelectValue placeholder="All Employment Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Employment Types</SelectItem>
                <SelectItem value="non-plantilla">Non-Plantilla</SelectItem>
                <SelectItem value="consultant">Consultant</SelectItem>
                <SelectItem value="contract-of-service">
                  Contract of Service
                </SelectItem>
              </SelectContent>
            </Select>

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" /> Reset
              </button>
            )}
          </div>
        </div>

        {/* ── Table ── */}
        <EmployeeTable
          employees={employees}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
        />

        {/* ── Pagination ── */}
        {pagination.last_page > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-3 flex items-center justify-between gap-2 flex-wrap text-xs text-gray-500">
            {/* Prev */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => loadEmployees({ page: 1 })}
                disabled={pagination.current_page === 1 || loading}
                className="h-8 w-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                <ChevronsLeft size={14} />
              </button>
              <button
                onClick={() =>
                  loadEmployees({ page: pagination.current_page - 1 })
                }
                disabled={pagination.current_page === 1 || loading}
                className="h-8 px-3 flex items-center gap-1 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft size={13} /> Prev
              </button>
            </div>

            {/* Page numbers */}
            <div className="flex items-center gap-1 flex-wrap justify-center">
              {pageRange().map((p, i) =>
                p === "..." ? (
                  <span key={`ellipsis-${i}`} className="px-1 text-gray-300">
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() =>
                      p !== pagination.current_page &&
                      loadEmployees({ page: p })
                    }
                    disabled={loading}
                    className={`h-8 w-8 rounded-lg text-xs font-medium transition-colors ${
                      p === pagination.current_page
                        ? "bg-blue-600 text-white"
                        : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {p}
                  </button>
                ),
              )}
              <span className="ml-2 text-gray-400">
                ({pagination.total} total)
              </span>
              {pagination.last_page > 1 && (
                <form
                  onSubmit={handleJumpPage}
                  className="flex items-center gap-1 ml-1"
                >
                  <input
                    type="number"
                    min={1}
                    max={pagination.last_page}
                    value={jumpPage}
                    onChange={(e) => setJumpPage(e.target.value)}
                    placeholder="Go to"
                    className="h-8 w-16 text-xs text-center rounded-lg border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                  />
                  <button
                    type="submit"
                    className="h-8 px-3 text-xs rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Go
                  </button>
                </form>
              )}
            </div>

            {/* Next */}
            <div className="flex items-center gap-1">
              <button
                onClick={() =>
                  loadEmployees({ page: pagination.current_page + 1 })
                }
                disabled={
                  pagination.current_page === pagination.last_page || loading
                }
                className="h-8 px-3 flex items-center gap-1 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                Next <ChevronRight size={13} />
              </button>
              <button
                onClick={() => loadEmployees({ page: pagination.last_page })}
                disabled={
                  pagination.current_page === pagination.last_page || loading
                }
                className="h-8 w-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                <ChevronsRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Dialogs ── */}
      <Dialog open={openForm} onOpenChange={setOpenForm}>
        <DialogContent className="w-full max-w-[1400px] min-w-[1400px]">
          <EmployeeForm
            employee={editingEmployee}
            refresh={() => loadEmployees({ page: pagination.current_page })}
            onClose={() => setOpenForm(false)}
          />
        </DialogContent>
      </Dialog>

      <EmployeeDeleteDialog
        open={!!deleteEmployeeId}
        onClose={() => setDeleteEmployeeId(null)}
        onConfirm={confirmDelete}
      />

      <EmployeeViewDialog
        open={!!viewEmployee}
        onClose={() => setViewEmployee(null)}
        employee={viewEmployee}
      />
    </div>
  );
}

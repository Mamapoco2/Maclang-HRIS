import React, { useEffect, useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
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

  const [allDivisions, setAllDivisions] = useState([]);
  const [allDepartments, setAllDepartments] = useState([]);

  const [openForm, setOpenForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [deleteEmployeeId, setDeleteEmployeeId] = useState(null);
  const [viewEmployee, setViewEmployee] = useState(null);

  const searchRef = useRef(search);
  const divisionRef = useRef(divisionFilter);
  const departmentRef = useRef(departmentFilter);

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
    } = {}) => {
      setLoading(true);
      try {
        const res = await employeeService.getEmployees({
          page,
          per_page: PER_PAGE,
          search: searchValue || undefined,
          division_id: division_id || undefined,
          department_id: department_id || undefined,
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

  const handleDepartmentChange = (val) => {
    setDepartmentFilter(val === "all" ? "" : val);
  };

  const clearFilters = () => {
    setSearch("");
    setDivisionFilter("");
    setDepartmentFilter("");
    searchRef.current = "";
    divisionRef.current = "";
    departmentRef.current = "";
    loadEmployees({
      page: 1,
      searchValue: "",
      division_id: "",
      department_id: "",
    });
  };

  const hasFilters = search || divisionFilter || departmentFilter;

  const handleJumpPage = (e) => {
    e.preventDefault();
    const p = parseInt(jumpPage);
    if (!isNaN(p) && p >= 1 && p <= pagination.last_page) {
      loadEmployees({ page: p });
      setJumpPage("");
    }
  };

  const handleAdd = () => {
    setEditingEmployee(null);
    setOpenForm(true);
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
    <div className="p-6 space-y-4">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
            Employees
          </h1>
          {pagination.total > 0 && (
            <p className="text-xs text-gray-400 mt-0.5">
              {pagination.total} total records
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <Input
              placeholder="Search employee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9 w-56 text-sm border-gray-200 bg-white rounded-lg placeholder:text-gray-400"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* <Button
            onClick={handleAdd}
            className="h-9 px-4 text-sm bg-gray-900 hover:bg-gray-800 text-white rounded-lg gap-1.5 font-medium"
          >
            <Plus size={14} /> Add Employee
          </Button> */}
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="flex items-center gap-2 flex-wrap">
        <Select
          value={divisionFilter || "all"}
          onValueChange={handleDivisionChange}
        >
          <SelectTrigger className="h-8 text-xs w-44 rounded-lg border-gray-200 bg-white text-gray-600">
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
          <SelectTrigger className="h-8 text-xs w-48 rounded-lg border-gray-200 bg-white text-gray-600">
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

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 h-8 px-2.5 rounded-lg text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
          >
            <X size={11} /> Clear
          </button>
        )}
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
        <div className="flex items-center justify-between gap-2 flex-wrap text-xs text-gray-500 pt-1">
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadEmployees({ page: 1 })}
              disabled={pagination.current_page === 1 || loading}
              className="h-8 w-8 p-0 rounded-lg border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronsLeft size={14} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                loadEmployees({ page: pagination.current_page - 1 })
              }
              disabled={pagination.current_page === 1 || loading}
              className="h-8 px-3 rounded-lg border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 gap-1"
            >
              <ChevronLeft size={13} /> Prev
            </Button>
          </div>

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
                    p !== pagination.current_page && loadEmployees({ page: p })
                  }
                  disabled={loading}
                  className={`h-8 w-8 rounded-lg text-xs font-medium transition-all ${
                    p === pagination.current_page
                      ? "bg-gray-900 text-white"
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
                <Input
                  type="number"
                  min={1}
                  max={pagination.last_page}
                  value={jumpPage}
                  onChange={(e) => setJumpPage(e.target.value)}
                  placeholder="Go to"
                  className="h-8 w-16 text-xs text-center rounded-lg border-gray-200"
                />
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  className="h-8 px-2.5 text-xs rounded-lg border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                  Go
                </Button>
              </form>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                loadEmployees({ page: pagination.current_page + 1 })
              }
              disabled={
                pagination.current_page === pagination.last_page || loading
              }
              className="h-8 px-3 rounded-lg border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 gap-1"
            >
              Next <ChevronRight size={13} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadEmployees({ page: pagination.last_page })}
              disabled={
                pagination.current_page === pagination.last_page || loading
              }
              className="h-8 w-8 p-0 rounded-lg border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronsRight size={14} />
            </Button>
          </div>
        </div>
      )}

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

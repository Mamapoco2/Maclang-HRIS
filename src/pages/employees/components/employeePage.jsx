import React, { useEffect, useState, useCallback, useRef } from "react";
import { Users } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { employeeService } from "@/services/employeeService";
import { getEcho } from "@/lib/echo";
import EmployeeToolbar from "./employeeToolbar";
import EmployeeTable from "./employeeTable";
import EmployeePagination from "./employeePagination";
import EmployeeFormDialog from "./EmployeeFormDialog";
import EmployeeDeleteDialog from "./employeeDeleteDialog";
import EmployeeViewDialog from "./employeeViewDialog";

const DEFAULT_PAGINATION = { current_page: 1, last_page: 1, total: 0 };
const PER_PAGE = 10;

export default function EmployeePage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);

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

  const isFirstRender = useRef(true);

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
    const t = setTimeout(() => {
      isFirstRender.current = false;
    }, 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (isFirstRender.current) return;
    const t = setTimeout(() => {
      loadEmployees({ page: 1, searchValue: search });
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    if (isFirstRender.current) return;
    loadEmployees({ page: 1, division_id: divisionFilter, department_id: "" });
  }, [divisionFilter]);

  useEffect(() => {
    if (isFirstRender.current) return;
    loadEmployees({ page: 1, department_id: departmentFilter });
  }, [departmentFilter]);

  useEffect(() => {
    if (isFirstRender.current) return;
    loadEmployees({ page: 1, employment_type: employmentTypeFilter });
  }, [employmentTypeFilter]);

  useEffect(() => {
    const echo = getEcho();
    if (!echo) return;

    const channel = echo.private("employees");

    const onEmployeeUpdated = (e) => {
      if (!e.employee) return;
      setEmployees((prev) => {
        if (!prev.some((emp) => emp.id === e.employee.id)) return prev;
        return prev.map((emp) =>
          emp.id === e.employee.id ? { ...emp, ...e.employee } : emp,
        );
      });
    };

    channel.listen(".employee.updated", onEmployeeUpdated);
    return () => channel.stopListening(".employee.updated", onEmployeeUpdated);
  }, []);

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

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto w-full max-w-[1600px] space-y-6 px-4 py-8 sm:px-6">
        {/* Page header */}
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500 text-primary-foreground">
              <Users className="size-5" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold leading-tight tracking-tight">
                Employees
              </h1>
              <p className="text-sm text-muted-foreground">
                Search, review and manage employee records.
              </p>
            </div>
          </div>
          {pagination.total > 0 && (
            <Badge
              variant="secondary"
              className="px-3 py-1 text-sm font-medium"
            >
              {pagination.total}{" "}
              {pagination.total === 1 ? "employee" : "employees"}
            </Badge>
          )}
        </header>

        <EmployeeToolbar
          search={search}
          onSearchChange={setSearch}
          divisionFilter={divisionFilter}
          onDivisionChange={handleDivisionChange}
          departmentFilter={departmentFilter}
          onDepartmentChange={handleDepartmentChange}
          employmentTypeFilter={employmentTypeFilter}
          onEmploymentTypeChange={handleEmploymentTypeChange}
          divisions={allDivisions}
          departments={visibleDepartments}
          hasFilters={!!hasFilters}
          onReset={clearFilters}
        />

        <EmployeeTable
          employees={employees}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
        />

        {pagination.total > 0 && (
          <EmployeePagination
            pagination={pagination}
            loading={loading}
            perPage={PER_PAGE}
            onPageChange={(page) => loadEmployees({ page })}
          />
        )}
      </div>

      {/* Dialogs */}
      <EmployeeFormDialog
        open={openForm}
        onOpenChange={setOpenForm}
        employee={editingEmployee}
        refresh={() => loadEmployees({ page: pagination.current_page })}
      />

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

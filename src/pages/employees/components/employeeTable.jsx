import React, { useState, useMemo, useEffect } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconEdit, IconTrash, IconEye } from "@tabler/icons-react";

export default function EmployeeTable({
  employees,
  currentPage,
  lastPage,
  onPageChange,
  onEdit,
  onDelete,
  onView,
}) {
  const safeEmployees = Array.isArray(employees)
    ? employees
    : employees?.data || [];

  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  const filteredEmployees = safeEmployees.filter((emp) => {
    const firstName = emp.first_name?.toLowerCase() || "";
    const lastName = emp.last_name?.toLowerCase() || "";
    const fullName = `${firstName} ${lastName}`;
    const searchTerm = search.toLowerCase();

    const matchesSearch = fullName.includes(searchTerm);
    const matchesDepartment =
      departmentFilter === "all" ||
      emp.department?.toLowerCase() === departmentFilter.toLowerCase();

    return matchesSearch && matchesDepartment;
  });

  return (
    <div className="rounded-lg border bg-card">
      {/* Filters */}
      <div className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <Input
          placeholder="Search employee..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />

        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="max-w-xs">
            <SelectValue placeholder="Filter by department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            <SelectItem value="Human Resources">Human Resources</SelectItem>
            <SelectItem value="IT">IT</SelectItem>
            <SelectItem value="Finance">Finance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead></TableHead>
            <TableHead>First Name</TableHead>
            <TableHead>Last Name</TableHead>
            <TableHead>Middle Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Department</TableHead>
            <TableHead className="text-center">Account Status</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {filteredEmployees.length > 0 ? (
            filteredEmployees.map((emp) => (
              <TableRow key={emp.id}>
                <TableCell>
                  <img
                    src={emp.avatar || "/avatar-placeholder.png"}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                </TableCell>
                <TableCell>{emp.first_name}</TableCell>
                <TableCell>{emp.last_name}</TableCell>
                <TableCell>{emp.middle_name || "-"}</TableCell>
                <TableCell>{emp.email}</TableCell>
                <TableCell>{emp.position}</TableCell>
                <TableCell>{emp.department}</TableCell>
                <TableCell className="text-center">
                  <span
                    className={`px-3 py-1 text-sm font-semibold rounded-full ${
                      emp.status === "Active"
                        ? "bg-green-600 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {emp.status || "Inactive"}
                  </span>
                </TableCell>
                <TableCell className="text-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onView(emp)}
                  >
                    <IconEye size={16} />
                  </Button>
                  <Button size="sm" onClick={() => onEdit(emp)}>
                    <IconEdit size={16} />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(emp.id)}
                  >
                    <IconTrash size={16} />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8">
                No employees found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      {lastPage > 1 && (
        <div className="flex justify-end p-4 border-t">
          <div className="flex">
            {" "}
            {/* extra wrapper ensures correct alignment */}
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                    className={
                      currentPage === 1 ? "pointer-events-none opacity-50" : ""
                    }
                  />
                </PaginationItem>

                {Array.from({ length: lastPage }, (_, i) => i + 1).map(
                  (page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        isActive={currentPage === page}
                        onClick={() => onPageChange(page)}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ),
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      onPageChange(Math.min(currentPage + 1, lastPage))
                    }
                    className={
                      currentPage === lastPage
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useMemo } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { StatusBadge } from "./shared/StatusBadge";
import EmployeeEmpty from "./employeeEmpty";
import {
  formatRole,
  getAvatarUrl,
  getDeptNames,
  getEmployeeStatus,
  toTitleCase,
} from "../utils/employeeDisplay";

// Name sorts by last name, matching how the old "Last Name" column behaved.
const COLUMNS = [
  {
    label: "Employee",
    key: "last_name",
    accessor: (emp) => emp.last_name || "",
    className: "min-w-64",
  },
  {
    label: "Position",
    key: "position",
    accessor: (emp) => formatRole(emp.role_position),
    className: "min-w-40",
  },
  {
    label: "Division",
    key: "division",
    accessor: (emp) => emp.division?.name || "",
    className: "min-w-36",
  },
  {
    label: "Department",
    key: "department",
    accessor: (emp) => getDeptNames(emp, { fallbackToIds: true }).join(", "),
    className: "min-w-44",
  },
  {
    label: "Status",
    key: "status",
    accessor: (emp) => getEmployeeStatus(emp),
    className: "min-w-28",
  },
];

function SortIcon({ direction }) {
  if (direction === "asc") return <ArrowUp className="size-3.5" />;
  if (direction === "desc") return <ArrowDown className="size-3.5" />;
  return <ArrowUpDown className="size-3.5 opacity-40" />;
}

function formatName(emp) {
  const last = toTitleCase(emp.last_name);
  const rest = [emp.first_name, emp.middle_name]
    .filter(Boolean)
    .map(toTitleCase)
    .join(" ");
  if (last && rest) return `${last}, ${rest}`;
  return last || rest || "No name";
}

function LoadingRows() {
  return Array.from({ length: 8 }).map((_, i) => (
    <TableRow key={i} className="hover:bg-transparent">
      <TableCell>
        <div className="flex items-center gap-3">
          <Skeleton className="size-9 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-36" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Skeleton className="h-3.5 w-28" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-20 rounded-md" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-3.5 w-32" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-16 rounded-full" />
      </TableCell>
      <TableCell>
        <Skeleton className="ml-auto h-8 w-24" />
      </TableCell>
    </TableRow>
  ));
}

export default function EmployeeTable({
  employees = [],
  loading = false,
  onEdit,
  onDelete,
  onView,
}) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");

  const rows = Array.isArray(employees) ? employees : [];

  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sortedRows = useMemo(() => {
    if (!sortKey) return rows;
    const col = COLUMNS.find((c) => c.key === sortKey);
    if (!col?.accessor) return rows;
    return [...rows].sort((a, b) => {
      const va = col.accessor(a).toLowerCase();
      const vb = col.accessor(b).toLowerCase();
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [rows, sortKey, sortDir]);

  const showEmpty = !loading && sortedRows.length === 0;

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow className="hover:bg-transparent">
            {COLUMNS.map(({ label, key, className }) => {
              const active = sortKey === key;
              return (
                <TableHead
                  key={key}
                  className={cn("h-11 text-center", className)}
                  aria-sort={
                    active
                      ? sortDir === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                >
                  <button
                    type="button"
                    onClick={() => handleSort(key)}
                    className={cn(
                      "inline-flex items-center justify-center gap-1.5 rounded px-1 text-xs font-medium transition-colors hover:text-foreground",
                      active ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {label}
                    <SortIcon direction={active ? sortDir : null} />
                  </button>
                </TableHead>
              );
            })}
            <TableHead className="h-11 w-36 text-center text-xs font-medium text-muted-foreground">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading ? (
            <LoadingRows />
          ) : (
            sortedRows.map((emp) => {
              const deptNames = getDeptNames(emp, { fallbackToIds: true });
              const avatarSrc = getAvatarUrl(emp.avatar_url);
              const role = formatRole(emp.role_position);
              const name = formatName(emp);

              return (
                <TableRow key={emp.id}>
                  <TableCell>
                    <div className="flex items-center justify-center gap-3">
                      <Avatar className="size-9">
                        {avatarSrc && (
                          <AvatarImage
                            src={avatarSrc}
                            alt=""
                            className="object-cover"
                          />
                        )}
                        <AvatarFallback className="bg-muted text-xs font-medium text-muted-foreground">
                          {emp.first_name?.[0]}
                          {emp.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 text-center">
                        <p className="truncate text-sm font-medium leading-tight">
                          {name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {emp.user?.username || emp.employee_number || ""}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="text-center text-sm">
                    {role ? (
                      toTitleCase(role)
                    ) : (
                      <span className="text-muted-foreground">Not set</span>
                    )}
                  </TableCell>

                  <TableCell className="text-center">
                    {emp.division?.name ? (
                      <Badge variant="secondary" className="font-medium">
                        {emp.division.name}
                      </Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Not set
                      </span>
                    )}
                  </TableCell>

                  <TableCell className="max-w-56 text-center text-sm">
                    {deptNames.length > 0 ? (
                      <span
                        className="line-clamp-2 whitespace-normal"
                        title={deptNames.join(", ")}
                      >
                        {deptNames.join(", ")}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Not set</span>
                    )}
                  </TableCell>

                  <TableCell className="text-center">
                    <StatusBadge status={getEmployeeStatus(emp)} />
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => onView(emp)}
                        title="View profile"
                        aria-label={`View ${name}`}
                      >
                        <Eye className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => onEdit(emp)}
                        title="Edit employee"
                        aria-label={`Edit ${name}`}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => onDelete(emp.id)}
                        title="Delete employee"
                        aria-label={`Delete ${name}`}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {showEmpty && <EmployeeEmpty />}
    </div>
  );
}

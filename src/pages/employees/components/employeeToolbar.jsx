import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function EmployeeToolbar({
  search,
  onSearchChange,
  divisionFilter,
  onDivisionChange,
  departmentFilter,
  onDepartmentChange,
  employmentTypeFilter,
  onEmploymentTypeChange,
  divisions,
  departments,
  hasFilters,
  onReset,
}) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      {/* Search */}
      <div className="relative w-full lg:max-w-sm lg:flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search employees"
          aria-label="Search employees"
          className="h-9 bg-background pl-9 pr-9"
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-1 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:flex lg:items-center">
        <Select
          value={divisionFilter || "all"}
          onValueChange={onDivisionChange}
        >
          <SelectTrigger
            className="h-9 w-full bg-background lg:w-44"
            aria-label="Filter by division"
          >
            <SelectValue placeholder="All divisions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All divisions</SelectItem>
            {divisions.map((d) => (
              <SelectItem key={d.id} value={String(d.id)}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={departmentFilter || "all"}
          onValueChange={onDepartmentChange}
        >
          <SelectTrigger
            className="h-9 w-full bg-background lg:w-48"
            aria-label="Filter by department"
          >
            <SelectValue placeholder="All departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All departments</SelectItem>
            {departments.map((d) => (
              <SelectItem key={d.id ?? d.name} value={String(d.id)}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={employmentTypeFilter || "all"}
          onValueChange={onEmploymentTypeChange}
        >
          <SelectTrigger
            className="h-9 w-full bg-background lg:w-52"
            aria-label="Filter by employment type"
          >
            <SelectValue placeholder="All employment types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All employment types</SelectItem>
            <SelectItem value="plantilla">Plantilla</SelectItem>
            <SelectItem value="consultant">Consultant</SelectItem>
            <SelectItem value="contract-of-service">
              Contract of Service
            </SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button
            type="button"
            variant="ghost"
            onClick={onReset}
            className="h-9 justify-self-start px-3 text-muted-foreground"
          >
            <X className="size-4" />
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}

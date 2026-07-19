import React from "react";
import {
  Search,
  SlidersHorizontal,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  RefreshCw,
} from "lucide-react";
import { Button, Input, Select } from "../ui";
import { EMP_STATUS } from "../constants";

const SORT_OPTIONS = ["Newest", "Oldest", "Salary Grade", "Position Name"];
const VACANCY_STATUS_OPTIONS = ["Open", "Closing Soon", "Closed", "Filled"];

export function PostingFilters({
  search,
  onSearchChange,
  sortBy,
  onSortChange,
  showFilters,
  onToggleFilters,
  onReset,
  onRefresh,
  loading,
  filters,
  onFilterChange,
  departments,
  divisions,
  salaryGrades,
}) {
  return (
    <div className="mt-6 min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search position, item number..."
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={sortBy}
            onChange={onSortChange}
            options={SORT_OPTIONS.map((v) => ({ value: v, label: v }))}
            placeholder="Sort by"
            className="w-40"
          />
          <Button variant="secondary" size="sm" onClick={onToggleFilters}>
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {showFilters ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </Button>
          <Button variant="ghost" size="sm" onClick={onReset}>
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            aria-label="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 sm:grid-cols-3 lg:grid-cols-5">
          <Select
            value={filters.department_id}
            onChange={(v) => onFilterChange("department_id", v)}
            options={departments.map((d) => ({
              value: String(d.id),
              label: d.name,
            }))}
            placeholder="Office"
          />
          <Select
            value={filters.division_id}
            onChange={(v) => onFilterChange("division_id", v)}
            options={divisions.map((d) => ({
              value: String(d.id),
              label: d.name,
            }))}
            placeholder="Division"
          />
          <Select
            value={filters.salary_grade_id}
            onChange={(v) => onFilterChange("salary_grade_id", v)}
            options={salaryGrades.map((sg) => ({
              value: String(sg.id),
              label: `SG-${sg.salary_grade}`,
            }))}
            placeholder="Salary Grade"
          />
          <Select
            value={filters.employment_status}
            onChange={(v) => onFilterChange("employment_status", v)}
            options={EMP_STATUS.map((v) => ({ value: v, label: v }))}
            placeholder="Employment Status"
          />
          <Select
            value={filters.status}
            onChange={(v) => onFilterChange("status", v)}
            options={VACANCY_STATUS_OPTIONS.map((v) => ({
              value: v,
              label: v,
            }))}
            placeholder="Vacancy Status"
          />
        </div>
      )}
    </div>
  );
}

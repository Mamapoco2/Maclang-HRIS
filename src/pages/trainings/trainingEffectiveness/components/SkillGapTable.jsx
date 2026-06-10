import { useState, useMemo } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { SortIcon } from "./SharedComponents";
import { getStatusColor, getGapColor, exportCSV } from "../utils";
import {
  EMPLOYEES,
  DEPARTMENTS,
  STATUS_OPTIONS,
  ITEMS_PER_PAGE,
} from "../data";

export default function SkillGapTable() {
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("All");
  const [status, setStatus] = useState("All");
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState("gap");
  const [sortDir, setSortDir] = useState("desc");

  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
    setPage(1);
  };

  const filtered = useMemo(() => {
    let data = EMPLOYEES;
    if (search)
      data = data.filter(
        (e) =>
          e.name.toLowerCase().includes(search.toLowerCase()) ||
          e.training.toLowerCase().includes(search.toLowerCase()),
      );
    if (dept !== "All") data = data.filter((e) => e.dept === dept);
    if (status !== "All") data = data.filter((e) => e.status === status);
    data = [...data].sort((a, b) => {
      let va = a[sortKey],
        vb = b[sortKey];
      if (typeof va === "string") {
        va = va.toLowerCase();
        vb = vb.toLowerCase();
      }
      return sortDir === "asc" ? (va > vb ? 1 : -1) : va < vb ? 1 : -1;
    });
    return data;
  }, [search, dept, status, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paged = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  const COLUMNS = [
    ["name", "Employee"],
    ["dept", "Department"],
    ["current", "Current"],
    ["required", "Required"],
    ["gap", "Gap Score"],
    ["training", "Recommended Training"],
    ["status", "Status"],
  ];

  const selectClass =
    "px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 transition-all";

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search employees or trainings…"
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 transition-all"
          />
        </div>
        <select
          value={dept}
          onChange={(e) => {
            setDept(e.target.value);
            setPage(1);
          }}
          className={selectClass}
        >
          {DEPARTMENTS.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className={selectClass}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-700/40">
                {COLUMNS.map(([k, label]) => (
                  <th
                    key={k}
                    onClick={() => handleSort(k)}
                    className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 select-none whitespace-nowrap transition-colors"
                  >
                    {label}
                    <SortIcon sortKey={sortKey} k={k} sortDir={sortDir} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
              {paged.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-16 text-slate-400 dark:text-slate-500 text-sm"
                  >
                    No employees match your filters
                  </td>
                </tr>
              ) : (
                paged.map((emp) => {
                  const sc = getStatusColor(emp.status);
                  return (
                    <tr
                      key={emp.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-700/20 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs font-bold border border-blue-100 dark:border-blue-800/50 shrink-0">
                            {emp.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          <span className="font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">
                            {emp.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {emp.dept}
                      </td>
                      <td className="px-4 py-3 text-center font-medium text-slate-700 dark:text-slate-300 tabular-nums">
                        {emp.current}/10
                      </td>
                      <td className="px-4 py-3 text-center font-medium text-slate-700 dark:text-slate-300 tabular-nums">
                        {emp.required}/10
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`text-sm font-semibold tabular-nums ${getGapColor(emp.gap)}`}
                        >
                          {emp.gap}
                        </span>
                      </td>
                      <td className="px-4 py-3 max-w-[200px]">
                        <p
                          className="text-slate-500 dark:text-slate-400 truncate text-xs"
                          title={emp.training}
                        >
                          {emp.training}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${sc.bg} ${sc.text}`}
                        >
                          {emp.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/20">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Showing {Math.min((page - 1) * ITEMS_PER_PAGE + 1, filtered.length)}
            –{Math.min(page * ITEMS_PER_PAGE, filtered.length)} of{" "}
            {filtered.length}
          </span>
          <div className="flex gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-600 disabled:opacity-40 hover:bg-white dark:hover:bg-slate-700 transition-colors"
            >
              <ChevronLeft
                size={15}
                className="text-slate-600 dark:text-slate-300"
              />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                  p === page
                    ? "bg-blue-600 text-white shadow-sm"
                    : "border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-600 disabled:opacity-40 hover:bg-white dark:hover:bg-slate-700 transition-colors"
            >
              <ChevronRight
                size={15}
                className="text-slate-600 dark:text-slate-300"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

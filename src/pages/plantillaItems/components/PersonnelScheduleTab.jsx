import { useMemo, useState } from "react";
import { Search, ChevronDown, ChevronRight, Building2, Info } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { TYPE_BADGE } from "../helpers/constants";
import { buildScheduleRows } from "../data/personnelSchedule";

const PSCHED_HEADERS = [
  { label: "Item No(s).", cls: "w-36 text-left" },
  { label: "Position Title", cls: "text-left" },
  { label: "SG", cls: "w-20 text-center" },
  { label: "Authorized Slots", cls: "w-36 text-center" },
];

function Badge({ type }) {
  const t = (type ?? "").toUpperCase();
  return (
    <span
      className={cn(
        "text-[9px] font-semibold px-1.5 py-0.5 rounded shrink-0",
        TYPE_BADGE[t] ?? "bg-gray-100 text-gray-600",
      )}
    >
      {t}
    </span>
  );
}

/**
 * Personnel Schedule (Plantilla Schedule) — read-only reference table listing
 * every plantilla position grouped Directorate/Division → Department/Section/
 * Unit. This is the source the Department Database is modelled on.
 */
export default function PersonnelScheduleTab() {
  const rows = useMemo(() => buildScheduleRows(), []);
  const [search, setSearch] = useState("");
  const [divFilter, setDivFilter] = useState("ALL");
  const [collapsed, setCollapsed] = useState(new Set());

  // rows → { division → { department → positions[] } }, preserving order
  const grouped = useMemo(() => {
    const q = search.trim().toLowerCase();
    const divs = new Map();
    for (const r of rows) {
      if (divFilter !== "ALL" && r.division !== divFilter) continue;
      if (
        q &&
        !r.title.toLowerCase().includes(q) &&
        !(r.department ?? "").toLowerCase().includes(q) &&
        !r.itemNos.includes(q)
      )
        continue;
      if (!divs.has(r.division))
        divs.set(r.division, { type: r.divisionType, depts: new Map() });
      const d = divs.get(r.division);
      const dk = r.department ?? "__direct__";
      if (!d.depts.has(dk))
        d.depts.set(dk, { name: r.department, type: r.departmentType, rows: [] });
      d.depts.get(dk).rows.push(r);
    }
    return [...divs.entries()];
  }, [rows, search, divFilter]);

  const divisionNames = useMemo(
    () => [...new Set(rows.map((r) => r.division))],
    [rows],
  );

  const totals = useMemo(() => {
    const slots = rows.reduce((s, r) => s + r.slots, 0);
    const depts = new Set(rows.filter((r) => r.department).map((r) => r.department));
    return { slots, items: rows.length, divisions: divisionNames.length, depts: depts.size };
  }, [rows, divisionNames]);

  const shownSlots = grouped.reduce(
    (s, [, d]) =>
      s + [...d.depts.values()].reduce((a, u) => a + u.rows.reduce((x, r) => x + r.slots, 0), 0),
    0,
  );

  const toggle = (name) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });

  return (
    <div className="px-6 pb-8 pt-5">
      {/* Title block */}
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <div>
          <p className="text-sm font-semibold text-gray-900">Personnel Schedule</p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Level 2 General Hospital · 200 beds · plantilla positions by
            organizational unit
          </p>
        </div>

        <div className="relative">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search position or unit…"
            className="pl-8 h-9 w-60 text-sm border-gray-200"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {[
          ["Directorates / Divisions", totals.divisions],
          ["Departments / Sections / Units", totals.depts],
          ["Position Lines", totals.items],
          ["Authorized Slots", totals.slots],
        ].map(([label, n]) => (
          <div
            key={label}
            className="rounded-xl border border-gray-100 bg-white px-4 py-3"
          >
            <div className="text-xl font-semibold text-gray-900 font-mono leading-none">
              {n}
            </div>
            <div className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-medium truncate">
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Division filter */}
      <div className="flex flex-wrap items-center gap-1.5 mb-3">
        {["ALL", ...divisionNames].map((name) => (
          <button
            key={name}
            onClick={() => setDivFilter(name)}
            className={cn(
              "text-xs px-3 py-1.5 rounded-full border transition-colors",
              divFilter === name
                ? "bg-emerald-600 border-emerald-600 text-white"
                : "bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700",
            )}
          >
            {name === "ALL" ? "All divisions" : name}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                {PSCHED_HEADERS.map((h) => (
                  <TableHead
                    key={h.label}
                    className={cn(
                      "text-xs font-semibold uppercase tracking-widest text-slate-400 py-3.5 whitespace-nowrap",
                      h.cls,
                    )}
                  >
                    {h.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {grouped.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-16 text-sm text-slate-400">
                    No positions match your search.
                  </TableCell>
                </TableRow>
              )}

              {grouped.map(([divName, div]) => {
                const isClosed = collapsed.has(divName);
                const divSlots = [...div.depts.values()].reduce(
                  (a, u) => a + u.rows.reduce((x, r) => x + r.slots, 0),
                  0,
                );
                return (
                  <DivisionBlock
                    key={divName}
                    divName={divName}
                    div={div}
                    divSlots={divSlots}
                    isClosed={isClosed}
                    onToggle={() => toggle(divName)}
                  />
                );
              })}

              {grouped.length > 0 && (
                <TableRow className="bg-slate-50 hover:bg-slate-50 border-t-2 border-slate-200">
                  <TableCell colSpan={3} className="text-xs font-semibold uppercase tracking-widest text-slate-500 text-right">
                    {search || divFilter !== "ALL" ? "Total (filtered)" : "Grand total"}
                  </TableCell>
                  <TableCell className="text-center font-mono text-sm font-bold text-slate-900">
                    {shownSlots}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <p className="flex items-start gap-1.5 text-[11px] text-slate-400 mt-3">
        <Info size={12} className="mt-0.5 shrink-0" />
        Sample schedule for layout review. Titles, salary grades and slot counts
        are illustrative — replace with the hospital's approved Personnel
        Schedule.
      </p>
    </div>
  );
}

function DivisionBlock({ divName, div, divSlots, isClosed, onToggle }) {
  return (
    <>
      <TableRow
        className="bg-slate-100/80 hover:bg-slate-100 cursor-pointer border-t border-slate-200"
        onClick={onToggle}
      >
        <TableCell colSpan={3} className="py-2.5">
          <div className="flex items-center gap-2">
            {isClosed ? (
              <ChevronRight size={14} className="text-slate-400" />
            ) : (
              <ChevronDown size={14} className="text-slate-400" />
            )}
            <Building2 size={14} className="text-slate-400" />
            <Badge type={div.type} />
            <span className="text-sm font-semibold text-slate-800">{divName}</span>
          </div>
        </TableCell>
        <TableCell className="text-center font-mono text-sm font-semibold text-slate-700">
          {divSlots}
        </TableCell>
      </TableRow>

      {!isClosed &&
        [...div.depts.entries()].map(([dk, dept]) => {
          const deptSlots = dept.rows.reduce((s, r) => s + r.slots, 0);
          return (
            <DeptBlock key={dk} divName={divName} dept={dept} deptSlots={deptSlots} />
          );
        })}
    </>
  );
}

function DeptBlock({ divName, dept, deptSlots }) {
  return (
    <>
      <TableRow className="bg-white hover:bg-white">
        <TableCell colSpan={3} className="pt-3 pb-1.5 pl-9">
          <div className="flex items-center gap-2">
            {dept.name ? (
              <>
                <Badge type={dept.type} />
                <span className="text-[13px] font-semibold text-slate-700">{dept.name}</span>
              </>
            ) : (
              <span className="text-[13px] font-medium italic text-slate-500">
                Office proper — attached directly to {divName}
              </span>
            )}
          </div>
        </TableCell>
        <TableCell className="text-center font-mono text-xs text-slate-400 pt-3 pb-1.5">
          {deptSlots}
        </TableCell>
      </TableRow>
      {dept.rows.map((r) => (
        <TableRow key={r.key} className="hover:bg-slate-50/70">
          <TableCell className="font-mono text-xs text-slate-400 pl-9 py-1.5">{r.itemNos}</TableCell>
          <TableCell className="text-sm text-slate-700 uppercase py-1.5">{r.title}</TableCell>
          <TableCell className="text-center font-mono text-xs text-slate-600 py-1.5">{r.sg}</TableCell>
          <TableCell className="text-center font-mono text-sm font-semibold text-slate-700 py-1.5">
            {r.slots}
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

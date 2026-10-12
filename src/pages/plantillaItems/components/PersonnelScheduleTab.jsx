import { useMemo, useState } from "react";
import {
  Search,
  ChevronDown,
  ChevronRight,
  Building2,
  Info,
  Loader2,
  Pencil,
  UserPlus,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { PERMISSIONS } from "@/constants/permissions";
import { TYPE_BADGE } from "../helpers/constants";
import {
  useDepartmentDatabase,
  loadDepartmentDatabase,
  assignSlot,
  clearSlot,
  updateLine,
} from "../helpers/departmentStore";
import { AssignEmployeeDialog } from "./AssignEmployeeDialog";
import { EditPositionDialog } from "./EditPositionDialog";
import { DepartmentFormModal } from "./DepartmentFormModal";

const PSCHED_HEADERS = [
  { label: "Item No(s).", cls: "w-36 text-left" },
  { label: "Position Title", cls: "text-left" },
  { label: "SG", cls: "w-20 text-center" },
  { label: "Authorized Slots", cls: "w-36 text-center" },
  { label: "Assigned", cls: "w-28 text-center" },
];

const COLUMN_COUNT = PSCHED_HEADERS.length;

function formatItemNos(nums) {
  const items = nums.filter(Boolean);
  if (items.length === 0) return "—";
  if (items.length === 1) return items[0];
  const base = items[0].split("-")[0];
  const sequential = items.every((n, i) => n === `${base}-${i + 1}`);
  return sequential ? `${items[0]}–${items[items.length - 1]}` : items.join(", ");
}

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

export default function PersonnelScheduleTab() {
  const { divisions, departments, lines, status, error, loading } =
    useDepartmentDatabase();
  const { hasPermission } = useAuth();
  const canManage = hasPermission(PERMISSIONS.PLANTILLA_ITEMS_MANAGE);

  const rows = useMemo(() => {
    const divisionById = new Map(divisions.map((d) => [d.id, d]));
    const unitById = new Map(departments.map((d) => [d.id, d]));

    return lines
      .filter((line) => divisionById.has(line.division_id))
      .map((line) => {
        const division = divisionById.get(line.division_id);
        const unit = line.unit_id ? unitById.get(line.unit_id) : null;
        const nums = line.slots.map((s) => s.item_number);
        return {
          key: line.id,
          division: division.name,
          divisionId: division.id,
          divisionType: division.type,
          departmentId: unit?.id ?? null,
          department: unit?.name ?? null,
          departmentType: unit?.type ?? null,
          title: line.title,
          sg: line.sg,
          slots: line.slots.length,
          assigned: line.slots.filter((s) => s.employee_id).length,
          items: nums.filter(Boolean),
          itemNos: formatItemNos(nums),
          slotList: line.slots,
        };
      });
  }, [divisions, departments, lines]);

  const [search, setSearch] = useState("");
  const [divFilter, setDivFilter] = useState("ALL");
  const [collapsed, setCollapsed] = useState(new Set());
  const [openLines, setOpenLines] = useState(new Set());
  const [assignTarget, setAssignTarget] = useState(null);
  const [busySlotId, setBusySlotId] = useState(null);
  const [clearTarget, setClearTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [unitForm, setUnitForm] = useState(null);

  const editDivision = (id) =>
    setUnitForm({ tier: "division", unit: divisions.find((d) => d.id === id) });
  const editUnit = (id) =>
    setUnitForm({ tier: "department", unit: departments.find((d) => d.id === id) });

  const toggleLine = (key) =>
    setOpenLines((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const handleAssign = async (slotId, employeeId) => {
    const res = await assignSlot(slotId, employeeId);
    if (res.ok) toast.success("Employee assigned.");
    return res;
  };

  const handleSavePosition = async (lineId, payload) => {
    const res = await updateLine(lineId, payload);
    if (res.ok) toast.success("Position updated.");
    return res;
  };

  const handleClear = async () => {
    const { slot } = clearTarget;
    setClearTarget(null);
    setBusySlotId(slot.id);
    const res = await clearSlot(slot.id);
    setBusySlotId(null);
    if (res.ok) toast.success("Slot is open again.");
    else toast.error(res.error);
  };

  const grouped = useMemo(() => {
    const q = search.trim().toLowerCase();
    const divs = new Map();
    for (const r of rows) {
      if (divFilter !== "ALL" && r.division !== divFilter) continue;
      if (
        q &&
        !r.title.toLowerCase().includes(q) &&
        !(r.department ?? "").toLowerCase().includes(q) &&
        !r.items.some((n) => n.toLowerCase().includes(q))
      )
        continue;
      if (!divs.has(r.division))
        divs.set(r.division, { id: r.divisionId, type: r.divisionType, depts: new Map() });
      const d = divs.get(r.division);
      const dk = r.department ?? "__direct__";
      if (!d.depts.has(dk))
        d.depts.set(dk, { id: r.departmentId, name: r.department, type: r.departmentType, rows: [] });
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

  const sumRows = (list, key) => list.reduce((s, r) => s + r[key], 0);
  const allShownRows = grouped.flatMap(([, d]) =>
    [...d.depts.values()].flatMap((u) => u.rows),
  );
  const shownSlots = sumRows(allShownRows, "slots");
  const shownAssigned = sumRows(allShownRows, "assigned");

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
            Rosario Maclang Bautista General Hospital · FY 2026 (as of April
            13, 2026) · all items shown as open slots
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
              {loading && (
                <TableRow>
                  <TableCell colSpan={COLUMN_COUNT} className="text-center py-16 text-sm text-slate-400">
                    <Loader2 size={14} className="inline mr-2 animate-spin" />
                    Loading personnel schedule…
                  </TableCell>
                </TableRow>
              )}

              {status === "error" && (
                <TableRow>
                  <TableCell colSpan={COLUMN_COUNT} className="text-center py-16 text-sm text-slate-500">
                    <p className="mb-3">{error}</p>
                    <Button
                      variant="outline"
                      className="h-8 text-xs border-gray-200"
                      onClick={() => loadDepartmentDatabase({ force: true })}
                    >
                      Try again
                    </Button>
                  </TableCell>
                </TableRow>
              )}

              {status === "ready" && grouped.length === 0 && (
                <TableRow>
                  <TableCell colSpan={COLUMN_COUNT} className="text-center py-16 text-sm text-slate-400">
                    No positions match your search.
                  </TableCell>
                </TableRow>
              )}

              {grouped.map(([divName, div]) => {
                const isClosed = collapsed.has(divName);
                const divRows = [...div.depts.values()].flatMap((u) => u.rows);
                return (
                  <DivisionBlock
                    key={divName}
                    divName={divName}
                    div={div}
                    divSlots={sumRows(divRows, "slots")}
                    divAssigned={sumRows(divRows, "assigned")}
                    isClosed={isClosed}
                    onToggle={() => toggle(divName)}
                    lineProps={{
                      openLines,
                      onToggleLine: toggleLine,
                      canManage,
                      busySlotId,
                      onAssign: setAssignTarget,
                      onClear: setClearTarget,
                      onEdit: setEditTarget,
                      onEditDivision: editDivision,
                      onEditUnit: editUnit,
                    }}
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
                  <TableCell className="text-center font-mono text-sm font-bold text-slate-900">
                    {shownAssigned}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <p className="flex items-start gap-1.5 text-[11px] text-slate-400 mt-3">
        <Info size={12} className="mt-0.5 shrink-0" />
        Loaded from the FY 2026 Personnel Schedule and stored separately from
        other modules. Every item starts as an open slot; click a position to
        assign an employee to its items. Slots without an item number or salary
        grade in the source are shown as "—".
      </p>

      <AssignEmployeeDialog
        target={assignTarget}
        onOpenChange={(open) => !open && setAssignTarget(null)}
        onAssign={handleAssign}
      />

      <DepartmentFormModal
        open={!!unitForm?.unit}
        onOpenChange={(open) => !open && setUnitForm(null)}
        tier={unitForm?.tier ?? "division"}
        unit={unitForm?.unit}
        divisions={divisions}
      />

      <EditPositionDialog
        row={editTarget}
        onOpenChange={(open) => !open && setEditTarget(null)}
        onSave={handleSavePosition}
      />

      <AlertDialog open={!!clearTarget} onOpenChange={(v) => !v && setClearTarget(null)}>
        <AlertDialogContent className="sm:max-w-[420px] bg-white border border-slate-200 shadow-xl rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 text-base font-semibold">
              Remove this assignment?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="text-sm text-slate-600 leading-relaxed space-y-2">
                <p>
                  <b>{clearTarget?.slot?.employee_name}</b> will be removed from
                  Item {clearTarget?.slot?.item_number ?? "—"} (
                  {clearTarget?.title}). The slot becomes open again.
                </p>
                <p className="text-xs text-slate-500">
                  This only affects the Personnel Schedule, not Employee
                  Management.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-sm border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 h-9 px-4">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClear}
              className="text-sm text-white h-9 px-4 bg-red-600 hover:bg-red-700"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function DivisionBlock({ divName, div, divSlots, divAssigned, isClosed, onToggle, lineProps }) {
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
            {lineProps.canManage && (
              <button
                type="button"
                title="Edit Directorate / Division"
                className="shrink-0 p-1 rounded text-slate-300 hover:text-slate-700 hover:bg-slate-200"
                onClick={(e) => {
                  e.stopPropagation();
                  lineProps.onEditDivision(div.id);
                }}
              >
                <Pencil size={12} />
              </button>
            )}
          </div>
        </TableCell>
        <TableCell className="text-center font-mono text-sm font-semibold text-slate-700">
          {divSlots}
        </TableCell>
        <TableCell className="text-center font-mono text-sm font-semibold text-slate-700">
          {divAssigned}
        </TableCell>
      </TableRow>

      {!isClosed &&
        [...div.depts.entries()].map(([dk, dept]) => {
          return (
            <DeptBlock
              key={dk}
              divName={divName}
              dept={dept}
              deptSlots={dept.rows.reduce((s, r) => s + r.slots, 0)}
              deptAssigned={dept.rows.reduce((s, r) => s + r.assigned, 0)}
              {...lineProps}
            />
          );
        })}
    </>
  );
}

function DeptBlock({
  divName,
  dept,
  deptSlots,
  deptAssigned,
  openLines,
  onToggleLine,
  canManage,
  busySlotId,
  onAssign,
  onClear,
  onEdit,
  onEditUnit,
}) {
  return (
    <>
      <TableRow className="bg-white hover:bg-white">
        <TableCell colSpan={3} className="pt-3 pb-1.5 pl-9">
          <div className="flex items-center gap-2">
            {dept.name ? (
              <>
                <Badge type={dept.type} />
                <span className="text-[13px] font-semibold text-slate-700">{dept.name}</span>
                {canManage && (
                  <button
                    type="button"
                    title="Edit Department / Section / Unit"
                    className="shrink-0 p-1 rounded text-slate-300 hover:text-slate-700 hover:bg-slate-100"
                    onClick={() => onEditUnit(dept.id)}
                  >
                    <Pencil size={12} />
                  </button>
                )}
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
        <TableCell className="text-center font-mono text-xs text-slate-400 pt-3 pb-1.5">
          {deptAssigned}
        </TableCell>
      </TableRow>
      {dept.rows.map((r) => {
        const isOpen = openLines.has(r.key);
        return (
          <PositionRows
            key={r.key}
            row={r}
            isOpen={isOpen}
            onToggle={() => onToggleLine(r.key)}
            canManage={canManage}
            busySlotId={busySlotId}
            onAssign={onAssign}
            onClear={onClear}
            onEdit={onEdit}
          />
        );
      })}
    </>
  );
}

function PositionRows({ row: r, isOpen, onToggle, canManage, busySlotId, onAssign, onClear, onEdit }) {
  return (
    <>
      <TableRow className="hover:bg-slate-50/70 cursor-pointer" onClick={onToggle}>
        <TableCell className="font-mono text-xs text-slate-400 pl-9 py-1.5">
          <span className="inline-flex items-center gap-1.5">
            {isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            {r.itemNos}
          </span>
        </TableCell>
        <TableCell className="text-sm text-slate-700 uppercase py-1.5">
          <div className="flex items-center gap-2">
            <span>{r.title}</span>
            {canManage && (
              <button
                type="button"
                title="Edit position"
                className="shrink-0 p-1 rounded text-slate-300 hover:text-slate-700 hover:bg-slate-100"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(r);
                }}
              >
                <Pencil size={12} />
              </button>
            )}
          </div>
        </TableCell>
        <TableCell className="text-center font-mono text-xs text-slate-600 py-1.5">{r.sg ?? "—"}</TableCell>
        <TableCell className="text-center font-mono text-sm font-semibold text-slate-700 py-1.5">
          {r.slots}
        </TableCell>
        <TableCell className="text-center font-mono text-xs text-slate-600 py-1.5">
          {r.assigned} / {r.slots}
        </TableCell>
      </TableRow>

      {isOpen &&
        r.slotList.map((slot) => (
          <TableRow key={slot.id} className="bg-slate-50/50 hover:bg-slate-50/50">
            <TableCell className="font-mono text-xs text-slate-500 pl-14 py-1.5">
              {slot.item_number ?? "—"}
            </TableCell>
            <TableCell className="py-1.5" colSpan={canManage ? 1 : COLUMN_COUNT - 1}>
              {slot.employee_id ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-800">{slot.employee_name}</span>
                  <span className="font-mono text-[10px] text-slate-400">
                    {slot.employee_number}
                  </span>
                </div>
              ) : (
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-200">
                  Open
                </span>
              )}
            </TableCell>
            {canManage && (
              <TableCell colSpan={COLUMN_COUNT - 2} className="py-1.5">
                <div className="flex items-center justify-end gap-1.5 pr-4">
                  <Button
                    variant="outline"
                    className="h-7 px-2.5 text-xs border-gray-200 text-gray-600"
                    disabled={busySlotId === slot.id}
                    onClick={() => onAssign({ slot, title: r.title })}
                  >
                    <UserPlus size={12} className="mr-1.5" />
                    {slot.employee_id ? "Change" : "Assign"}
                  </Button>
                  {slot.employee_id && (
                    <Button
                      variant="ghost"
                      className="h-7 px-2 text-xs text-slate-500 hover:text-red-600"
                      disabled={busySlotId === slot.id}
                      onClick={() => onClear({ slot, title: r.title })}
                    >
                      {busySlotId === slot.id ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <X size={12} />
                      )}
                    </Button>
                  )}
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
    </>
  );
}

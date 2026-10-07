import { useMemo, useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Archive,
  ArchiveRestore,
  ChevronDown,
  ChevronRight,
  Network,
  Layers,
  EyeOff,
  Link2,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { cn } from "@/lib/utils";
import { TYPE_BADGE, UNIT_STATUS_STYLES } from "../helpers/constants";
import {
  useDepartmentDatabase,
  setUnitStatus,
  deleteUnit,
} from "../helpers/departmentStore";
import { DepartmentFormModal } from "./DepartmentFormModal";

const HEADERS = [
  { label: "Name", cls: "text-left" },
  { label: "Type", cls: "w-32 text-center" },
  { label: "Linked Slots", cls: "w-32 text-center" },
  { label: "Status", cls: "w-32 text-center" },
  { label: "Actions", cls: "w-36 text-center" },
];

const STATUS_FILTERS = [
  ["ALL", "All"],
  ["ACTIVE", "Active"],
  ["INACTIVE", "Inactive"],
];

function TypeBadge({ type }) {
  const t = (type ?? "").toUpperCase();
  return (
    <span
      className={cn(
        "text-[10px] font-semibold px-1.5 py-0.5 rounded",
        TYPE_BADGE[t] ?? "bg-gray-100 text-gray-600",
      )}
    >
      {t}
    </span>
  );
}

function StatusPill({ status }) {
  return (
    <span
      className={cn(
        "inline-block text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border",
        UNIT_STATUS_STYLES[status],
      )}
    >
      {status === "INACTIVE" ? "Inactive" : "Active"}
    </span>
  );
}

function IconBtn({ title, onClick, disabled, danger, children }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "h-7 w-7 text-slate-400",
        danger
          ? "hover:text-red-600 hover:bg-red-50"
          : "hover:text-indigo-600 hover:bg-indigo-50",
        disabled && "opacity-30 pointer-events-auto cursor-not-allowed",
      )}
    >
      {children}
    </Button>
  );
}

/**
 * System Management → Plantilla Positions → Department Database.
 *
 * The controlled list of Directorates/Divisions and their Departments/Sections/
 * Units that the plantilla forms pick from. Scoped to this module only.
 */
export default function DepartmentDatabaseTab() {
  const { divisions, departments } = useDepartmentDatabase();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [collapsed, setCollapsed] = useState(new Set());
  const [form, setForm] = useState({ open: false, tier: "division", unit: null, divisionId: null });
  const [confirm, setConfirm] = useState(null); // { action, unit }

  const childrenOf = (divId) => departments.filter((d) => d.division_id === divId);
  const divisionLinked = (div) =>
    div.linked_count + childrenOf(div.id).reduce((s, d) => s + d.linked_count, 0);

  const stats = useMemo(() => {
    const all = [...divisions, ...departments];
    return {
      divisions: divisions.filter((d) => d.status === "ACTIVE").length,
      units: departments.filter((d) => d.status === "ACTIVE").length,
      inactive: all.filter((u) => u.status === "INACTIVE").length,
      linked:
        divisions.reduce((s, d) => s + d.linked_count, 0) +
        departments.reduce((s, d) => s + d.linked_count, 0),
    };
  }, [divisions, departments]);

  // Search + status filter. A division stays visible if it or any child matches.
  const tree = useMemo(() => {
    const q = search.trim().toLowerCase();
    const okStatus = (u) => statusFilter === "ALL" || u.status === statusFilter;
    const okText = (u) => !q || u.name.toLowerCase().includes(q);

    return divisions
      .map((div) => {
        const kids = departments.filter((d) => d.division_id === div.id);
        const divTextHit = okText(div);
        const visibleKids = kids.filter(
          (k) => okStatus(k) && (divTextHit || okText(k)),
        );
        const divVisible =
          (okStatus(div) && divTextHit) || visibleKids.length > 0;
        return divVisible ? { div, kids: visibleKids } : null;
      })
      .filter(Boolean);
  }, [divisions, departments, search, statusFilter]);

  const toggle = (id) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const openAdd = (tier, divisionId = null) =>
    setForm({ open: true, tier, unit: null, divisionId });
  const openEdit = (unit) =>
    setForm({
      open: true,
      tier: unit.kind === "division" ? "division" : "department",
      unit,
      divisionId: null,
    });

  const runConfirm = () => {
    const { action, unit } = confirm;
    const res =
      action === "delete"
        ? deleteUnit(unit)
        : setUnitStatus(unit, action === "inactivate" ? "INACTIVE" : "ACTIVE");
    if (!res.ok) toast.error(res.error);
    else
      toast.success(
        action === "delete"
          ? "Entry deleted."
          : action === "inactivate"
            ? "Marked as Inactive."
            : "Reactivated.",
      );
    setConfirm(null);
  };

  const renderRow = (unit, { isDivision }) => {
    const inactive = unit.status === "INACTIVE";
    const linked = isDivision ? divisionLinked(unit) : unit.linked_count;
    const hasChildren = isDivision && childrenOf(unit.id).length > 0;
    const canDelete = linked === 0 && !hasChildren;

    return (
      <>
        <TableCell className={cn("py-2", !isDivision && "pl-12")}>
          <div className="flex items-center gap-2">
            {isDivision && (
              <span className="text-slate-400">
                {collapsed.has(unit.id) ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
              </span>
            )}
            <span
              className={cn(
                isDivision ? "text-sm font-semibold" : "text-[13px] font-medium",
                inactive ? "text-slate-400 line-through decoration-slate-300" : "text-slate-800",
              )}
            >
              {unit.name}
            </span>
            {isDivision && (
              <span className="text-[10px] text-slate-400">
                {childrenOf(unit.id).length} unit{childrenOf(unit.id).length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </TableCell>
        <TableCell className="text-center py-2">
          <TypeBadge type={unit.type} />
        </TableCell>
        <TableCell className="text-center py-2">
          <span
            className={cn(
              "inline-flex items-center gap-1 font-mono text-sm font-semibold",
              linked > 0 ? "text-slate-700" : "text-slate-300",
            )}
          >
            {linked > 0 && <Link2 size={11} className="text-slate-300" />}
            {linked}
          </span>
        </TableCell>
        <TableCell className="text-center py-2">
          <StatusPill status={unit.status} />
        </TableCell>
        <TableCell className="py-2" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-center gap-0.5">
            {isDivision && (
              <IconBtn
                title="Add a unit under this Directorate / Division"
                disabled={inactive}
                onClick={() => openAdd("department", unit.id)}
              >
                <Plus size={14} />
              </IconBtn>
            )}
            <IconBtn title="Edit" onClick={() => openEdit(unit)}>
              <Pencil size={13} />
            </IconBtn>
            {inactive ? (
              <IconBtn
                title="Reactivate"
                onClick={() => setConfirm({ action: "reactivate", unit })}
              >
                <ArchiveRestore size={14} />
              </IconBtn>
            ) : (
              <IconBtn
                title="Mark as Inactive / Obsolete"
                onClick={() => setConfirm({ action: "inactivate", unit })}
              >
                <Archive size={14} />
              </IconBtn>
            )}
            <IconBtn
              danger
              title={
                canDelete
                  ? "Delete"
                  : "Can't delete — linked to plantilla records or has units under it. Mark as Inactive instead."
              }
              disabled={!canDelete}
              onClick={() => setConfirm({ action: "delete", unit })}
            >
              <Trash2 size={13} />
            </IconBtn>
          </div>
        </TableCell>
      </>
    );
  };

  return (
    <div className="px-6 pb-8 pt-5">
      {/* Title + actions */}
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <div>
          <p className="text-sm font-semibold text-gray-900">Department Database</p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Directorates / Divisions and their Departments / Sections / Units,
            as listed in the Personnel Schedule
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => openAdd("division")}
            className="text-sm h-9 px-3 border-gray-200 text-gray-700"
          >
            <Layers size={14} className="mr-1.5" />
            Add Directorate / Division
          </Button>
          <Button
            onClick={() => openAdd("department")}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm h-9 px-3"
          >
            <Plus size={14} className="mr-1.5" />
            Add Department / Section / Unit
          </Button>
        </div>
      </div>

      {/* Scope notice */}
      <div className="flex items-start gap-2.5 rounded-lg border border-indigo-100 bg-indigo-50/60 px-4 py-3 mb-4">
        <Info size={14} className="text-indigo-500 mt-0.5 shrink-0" />
        <p className="text-xs text-indigo-900/80 leading-relaxed">
          This list feeds the <b>Directorate / Division</b> and{" "}
          <b>Department / Section / Unit</b> fields of Plantilla Positions only —
          it is not the department master for other HRIS modules. Entries linked
          to plantilla records can't be deleted; mark them{" "}
          <b>Inactive / Obsolete</b> to keep historical records intact.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {[
          ["Directorates / Divisions", stats.divisions, Layers, "bg-purple-50", "text-purple-600"],
          ["Depts / Sections / Units", stats.units, Network, "bg-blue-50", "text-blue-600"],
          ["Inactive / Obsolete", stats.inactive, EyeOff, "bg-slate-100", "text-slate-500"],
          ["Linked Plantilla Slots", stats.linked, Link2, "bg-emerald-50", "text-emerald-600"],
        ].map(([label, n, Icon, bg, fg]) => (
          <div
            key={label}
            className="rounded-xl border border-gray-100 bg-white px-4 py-3.5 flex items-center gap-3"
          >
            <div className={cn("shrink-0 w-9 h-9 rounded-lg flex items-center justify-center", bg)}>
              <Icon size={16} strokeWidth={2} className={fg} />
            </div>
            <div className="min-w-0">
              <div className="text-2xl font-semibold text-gray-900 font-mono leading-none">{n}</div>
              <div className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-widest font-medium truncate">
                {label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="inline-flex rounded-lg border border-gray-200 bg-white p-0.5">
          {STATUS_FILTERS.map(([val, label]) => (
            <button
              key={val}
              onClick={() => setStatusFilter(val)}
              className={cn(
                "text-xs px-3 py-1.5 rounded-md transition-colors",
                statusFilter === val
                  ? "bg-slate-900 text-white"
                  : "text-gray-500 hover:text-gray-800",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCollapsed(new Set())}
            className="text-xs text-gray-400 hover:text-gray-700"
          >
            Expand all
          </button>
          <button
            onClick={() => setCollapsed(new Set(divisions.map((d) => d.id)))}
            className="text-xs text-gray-400 hover:text-gray-700"
          >
            Collapse all
          </button>
          <div className="relative">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name…"
              className="pl-8 h-9 w-52 text-sm border-gray-200"
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
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                {HEADERS.map((h) => (
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
              {tree.length === 0 && (
                <TableRow>
                  <TableCell colSpan={HEADERS.length} className="text-center py-16 text-sm text-slate-400">
                    No entries match.
                  </TableCell>
                </TableRow>
              )}
              {tree.map(({ div, kids }) => (
                <DivisionGroup
                  key={div.id}
                  div={div}
                  kids={kids}
                  isClosed={collapsed.has(div.id) && !search}
                  onToggle={() => toggle(div.id)}
                  renderRow={renderRow}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <DepartmentFormModal
        open={form.open}
        onOpenChange={(v) => setForm((f) => ({ ...f, open: v }))}
        tier={form.tier}
        unit={form.unit}
        defaultDivisionId={form.divisionId}
        divisions={divisions}
      />

      <ConfirmDialog
        confirm={confirm}
        onCancel={() => setConfirm(null)}
        onConfirm={runConfirm}
        childrenOf={childrenOf}
        divisionLinked={divisionLinked}
      />
    </div>
  );
}

function DivisionGroup({ div, kids, isClosed, onToggle, renderRow }) {
  return (
    <>
      <TableRow
        className={cn(
          "bg-slate-100/80 hover:bg-slate-100 cursor-pointer border-t border-slate-200",
          div.status === "INACTIVE" && "opacity-70",
        )}
        onClick={onToggle}
      >
        {renderRow(div, { isDivision: true })}
      </TableRow>
      {!isClosed &&
        kids.map((k) => (
          <TableRow
            key={k.id}
            className={cn("hover:bg-slate-50/70", k.status === "INACTIVE" && "bg-slate-50/50")}
          >
            {renderRow(k, { isDivision: false })}
          </TableRow>
        ))}
    </>
  );
}

function ConfirmDialog({ confirm, onCancel, onConfirm, childrenOf, divisionLinked }) {
  if (!confirm) return null;
  const { action, unit } = confirm;
  const isDiv = unit.kind === "division";
  const activeKids = isDiv
    ? childrenOf(unit.id).filter((k) => k.status === "ACTIVE").length
    : 0;
  const linked = isDiv ? divisionLinked(unit) : unit.linked_count;

  const copy = {
    inactivate: {
      title: "Mark as Inactive / Obsolete?",
      confirm: "Mark Inactive",
      cls: "bg-slate-900 hover:bg-black",
      body: (
        <>
          <p>
            <b>{unit.name}</b> will no longer appear in the Add Item / Add Slot
            dropdowns.
          </p>
          <p className="text-xs text-slate-500">
            {linked > 0
              ? `The ${linked} plantilla slot${linked !== 1 ? "s" : ""} already linked to it keep their assignment, so historical records stay intact.`
              : "Nothing is linked to it yet."}
          </p>
          {isDiv && activeKids > 0 && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
              This will also mark its {activeKids} active unit
              {activeKids !== 1 ? "s" : ""} as Inactive.
            </p>
          )}
        </>
      ),
    },
    reactivate: {
      title: "Reactivate this entry?",
      confirm: "Reactivate",
      cls: "bg-emerald-600 hover:bg-emerald-700",
      body: (
        <>
          <p>
            <b>{unit.name}</b> will be selectable again in Plantilla Positions.
          </p>
          {isDiv && (
            <p className="text-xs text-slate-500">
              Units under it stay Inactive until you reactivate them one by one.
            </p>
          )}
        </>
      ),
    },
    delete: {
      title: "Delete this entry?",
      confirm: "Delete",
      cls: "bg-red-600 hover:bg-red-700",
      body: (
        <>
          <p>
            Permanently delete <b>{unit.name}</b>?
          </p>
          <p className="text-xs text-slate-500">
            Nothing is linked to it, so no records are affected. This can't be
            undone.
          </p>
        </>
      ),
    },
  }[action];

  return (
    <AlertDialog open onOpenChange={(v) => !v && onCancel()}>
      <AlertDialogContent className="sm:max-w-[420px] bg-white border border-slate-200 shadow-xl rounded-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-slate-900 text-base font-semibold">
            {copy.title}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="text-sm text-slate-600 leading-relaxed space-y-2">
              {copy.body}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="text-sm border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 h-9 px-4">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={cn("text-sm text-white h-9 px-4", copy.cls)}
          >
            {copy.confirm}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

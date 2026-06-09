import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Building2,
  Layers,
  Trash2,
  Pencil,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const DIVISION_PALETTE = [
  {
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: "bg-blue-100 text-blue-600",
    badge: "bg-blue-100 text-blue-700 border-blue-200",
    division: "text-blue-500",
    hover: "hover:border-blue-400",
  },
  {
    bg: "bg-violet-50",
    border: "border-violet-200",
    icon: "bg-violet-100 text-violet-600",
    badge: "bg-violet-100 text-violet-700 border-violet-200",
    division: "text-violet-500",
    hover: "hover:border-violet-400",
  },
  {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    icon: "bg-emerald-100 text-emerald-600",
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
    division: "text-emerald-500",
    hover: "hover:border-emerald-400",
  },
  {
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: "bg-amber-100 text-amber-600",
    badge: "bg-amber-100 text-amber-700 border-amber-200",
    division: "text-amber-500",
    hover: "hover:border-amber-400",
  },
  {
    bg: "bg-rose-50",
    border: "border-rose-200",
    icon: "bg-rose-100 text-rose-600",
    badge: "bg-rose-100 text-rose-700 border-rose-200",
    division: "text-rose-500",
    hover: "hover:border-rose-400",
  },
  {
    bg: "bg-cyan-50",
    border: "border-cyan-200",
    icon: "bg-cyan-100 text-cyan-600",
    badge: "bg-cyan-100 text-cyan-700 border-cyan-200",
    division: "text-cyan-500",
    hover: "hover:border-cyan-400",
  },
  {
    bg: "bg-orange-50",
    border: "border-orange-200",
    icon: "bg-orange-100 text-orange-600",
    badge: "bg-orange-100 text-orange-700 border-orange-200",
    division: "text-orange-500",
    hover: "hover:border-orange-400",
  },
  {
    bg: "bg-pink-50",
    border: "border-pink-200",
    icon: "bg-pink-100 text-pink-600",
    badge: "bg-pink-100 text-pink-700 border-pink-200",
    division: "text-pink-500",
    hover: "hover:border-pink-400",
  },
];

function buildColorMap(departments) {
  const map = {};
  let index = 0;
  departments.forEach((dept) => {
    const divId = dept.division?.id ?? "none";
    if (!(divId in map)) {
      map[divId] = DIVISION_PALETTE[index % DIVISION_PALETTE.length];
      index++;
    }
  });
  return map;
}

function groupByType(departments) {
  const groups = {};
  departments.forEach((dept) => {
    const type = dept.type?.trim() || "Uncategorized";
    if (!groups[type]) groups[type] = [];
    groups[type].push(dept);
  });

  return Object.entries(groups).sort(([a], [b]) => {
    if (a === "Uncategorized") return 1;
    if (b === "Uncategorized") return -1;
    return a.localeCompare(b);
  });
}

// ── Per-section pagination ────────────────────────────────────────────────────

function SectionPagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-end gap-1 mt-3">
      <button
        onClick={() => onPageChange((p) => Math.max(1, p - 1))}
        disabled={page === 1}
        className="flex items-center justify-center w-7 h-7 rounded-md border border-border text-muted-foreground transition hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ChevronLeft size={13} />
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1)
        .filter((n) => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
        .reduce((acc, n, idx, arr) => {
          if (idx > 0 && n - arr[idx - 1] > 1) acc.push("...");
          acc.push(n);
          return acc;
        }, [])
        .map((n, i) =>
          n === "..." ? (
            <span
              key={`ellipsis-${i}`}
              className="px-1 text-xs text-muted-foreground"
            >
              …
            </span>
          ) : (
            <button
              key={n}
              onClick={() => onPageChange(n)}
              className={`flex items-center justify-center w-7 h-7 rounded-md text-xs font-medium transition border ${
                page === n
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              {n}
            </button>
          ),
        )}

      <button
        onClick={() => onPageChange((p) => Math.min(totalPages, p + 1))}
        disabled={page === totalPages}
        className="flex items-center justify-center w-7 h-7 rounded-md border border-border text-muted-foreground transition hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ChevronRight size={13} />
      </button>
    </div>
  );
}

// ── Section component with its own page state ─────────────────────────────────

function TypeSection({
  type,
  depts,
  colorMap,
  search,
  onEdit,
  onDelete,
  pageSize,
}) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(depts.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = depts.slice((safePage - 1) * pageSize, safePage * pageSize);
  const startItem = depts.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endItem = Math.min(safePage * pageSize, depts.length);

  return (
    <div className="space-y-3">
      {/* Section header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
            {type}
          </span>
          <span className="inline-flex items-center justify-center rounded-full bg-slate-100 border border-slate-200 text-slate-500 text-[10px] font-semibold px-2 py-0.5 min-w-[20px]">
            {depts.length}
          </span>
        </div>
        <div className="flex-1 h-px bg-slate-200" />
        {depts.length > pageSize && (
          <span className="text-[10px] text-slate-400 shrink-0">
            {startItem}–{endItem} of {depts.length}
          </span>
        )}
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {paginated.map((dept) => {
          const colors = colorMap[dept.division?.id ?? "none"];
          return (
            <DepartmentCard
              key={dept.id}
              department={dept}
              colors={colors}
              searchQuery={search}
              onEdit={() => onEdit(dept)}
              onDelete={() => onDelete(dept)}
            />
          );
        })}
      </div>

      {/* Per-section pagination */}
      <SectionPagination
        page={safePage}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function DepartmentTiles({
  departments,
  loading,
  search,
  onEdit,
  onDelete,
  onClearSearch,
}) {
  const PAGE_SIZE = 8;
  const colorMap = buildColorMap(departments);
  const grouped = groupByType(departments);

  return (
    <div className="space-y-8">
      {/* Loading skeletons */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && departments.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
          <Building2 size={40} className="opacity-30" />
          <span className="text-sm">
            {search
              ? `No departments found for "${search}"`
              : "No departments found."}
          </span>
          {search && (
            <button
              onClick={onClearSearch}
              className="text-xs text-primary hover:underline"
            >
              Clear search
            </button>
          )}
        </div>
      )}

      {/* Sections per type — each has its own pagination */}
      {!loading &&
        grouped.map(([type, depts]) => (
          <TypeSection
            key={type}
            type={type}
            depts={depts}
            colorMap={colorMap}
            search={search}
            onEdit={onEdit}
            onDelete={onDelete}
            pageSize={PAGE_SIZE}
          />
        ))}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Highlight({ text = "", query = "" }) {
  if (!query.trim()) return <>{text}</>;
  const regex = new RegExp(
    `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
    "gi",
  );
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark
            key={i}
            className="bg-yellow-200 text-yellow-900 rounded px-0.5"
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

function DepartmentCard({ department, colors, onEdit, onDelete, searchQuery }) {
  const divisionName = department.division?.name ?? null;
  const code = department.code ?? null;

  return (
    <div
      className={`relative flex flex-col gap-4 rounded-2xl border p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-default h-full ${colors.bg} ${colors.border} ${colors.hover}`}
    >
      {/* Action buttons */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="flex items-center justify-center w-7 h-7 rounded-md bg-blue-100 text-blue-500 hover:bg-blue-500 hover:text-white transition-colors duration-150"
          title="Edit"
        >
          <Pencil size={12} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="flex items-center justify-center w-7 h-7 rounded-md bg-red-100 text-red-500 hover:bg-red-500 hover:text-white transition-colors duration-150"
          title="Delete"
        >
          <Trash2 size={12} />
        </button>
      </div>

      {/* Icon + code */}
      <div className="flex items-center gap-3 pr-16">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${colors.icon}`}
        >
          <Building2 size={20} />
        </div>
        <div className="flex flex-col gap-1 min-w-0">
          {code && (
            <span
              className={`inline-flex self-start items-center rounded-md border px-2 py-0.5 text-[10px] font-mono tracking-wide font-medium ${colors.badge}`}
            >
              <Highlight text={code} query={searchQuery} />
            </span>
          )}
        </div>
      </div>

      {/* Name + division */}
      <div className="space-y-1.5">
        <p className="text-sm font-semibold leading-snug text-gray-800 line-clamp-2">
          <Highlight text={department.name} query={searchQuery} />
        </p>
        {divisionName ? (
          <div
            className={`flex items-center gap-1.5 text-xs font-medium ${colors.division}`}
          >
            <Layers size={11} className="shrink-0" />
            <span className="truncate">
              <Highlight text={divisionName} query={searchQuery} />
            </span>
          </div>
        ) : (
          <p className="text-xs text-gray-400 italic">No division assigned</p>
        )}
      </div>
    </div>
  );
}

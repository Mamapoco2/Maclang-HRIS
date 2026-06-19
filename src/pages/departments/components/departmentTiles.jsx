import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Building2,
  Layers,
  Trash2,
  Pencil,
  ChevronLeft,
  ChevronRight,
  User,
} from "lucide-react";

const DIVISION_PALETTE = [
  {
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: "bg-blue-100 text-blue-600",
    badge: "bg-blue-100 text-blue-700 border-blue-200",
    division: "text-blue-500",
    hover: "hover:border-blue-400",
    accent: "text-blue-600",
  },
  {
    bg: "bg-violet-50",
    border: "border-violet-200",
    icon: "bg-violet-100 text-violet-600",
    badge: "bg-violet-100 text-violet-700 border-violet-200",
    division: "text-violet-500",
    hover: "hover:border-violet-400",
    accent: "text-violet-600",
  },
  {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    icon: "bg-emerald-100 text-emerald-600",
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
    division: "text-emerald-500",
    hover: "hover:border-emerald-400",
    accent: "text-emerald-600",
  },
  {
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: "bg-amber-100 text-amber-600",
    badge: "bg-amber-100 text-amber-700 border-amber-200",
    division: "text-amber-500",
    hover: "hover:border-amber-400",
    accent: "text-amber-600",
  },
  {
    bg: "bg-rose-50",
    border: "border-rose-200",
    icon: "bg-rose-100 text-rose-600",
    badge: "bg-rose-100 text-rose-700 border-rose-200",
    division: "text-rose-500",
    hover: "hover:border-rose-400",
    accent: "text-rose-600",
  },
  {
    bg: "bg-cyan-50",
    border: "border-cyan-200",
    icon: "bg-cyan-100 text-cyan-600",
    badge: "bg-cyan-100 text-cyan-700 border-cyan-200",
    division: "text-cyan-500",
    hover: "hover:border-cyan-400",
    accent: "text-cyan-600",
  },
  {
    bg: "bg-orange-50",
    border: "border-orange-200",
    icon: "bg-orange-100 text-orange-600",
    badge: "bg-orange-100 text-orange-700 border-orange-200",
    division: "text-orange-500",
    hover: "hover:border-orange-400",
    accent: "text-orange-600",
  },
  {
    bg: "bg-pink-50",
    border: "border-pink-200",
    icon: "bg-pink-100 text-pink-600",
    badge: "bg-pink-100 text-pink-700 border-pink-200",
    division: "text-pink-500",
    hover: "hover:border-pink-400",
    accent: "text-pink-600",
  },
];

function getColorForDivision(divId, colorMap) {
  return colorMap[divId ?? "none"] ?? DIVISION_PALETTE[0];
}

function buildColorMap(divisions) {
  const map = {};
  divisions.forEach((div, i) => {
    map[div.id] = DIVISION_PALETTE[i % DIVISION_PALETTE.length];
  });
  map["none"] = {
    bg: "bg-gray-50",
    border: "border-gray-200",
    icon: "bg-gray-100 text-gray-500",
    badge: "bg-gray-100 text-gray-600 border-gray-200",
    division: "text-gray-400",
    hover: "hover:border-gray-400",
    accent: "text-gray-500",
  };
  return map;
}

function groupByType(depts) {
  const groups = {};
  depts.forEach((dept) => {
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

// ── Division type grouping (Office / Directorate / Division sections) ────────

const DIVISION_TYPE_ORDER = ["OFFICE", "DIRECTORATE", "DIVISION"];

const DIVISION_TYPE_SECTION_LABELS = {
  OFFICE: "Offices",
  DIRECTORATE: "Directorates",
  DIVISION: "Divisions",
};

function groupDivisionsByType(divisions) {
  const groups = {};
  divisions.forEach((div) => {
    const type = div?.type ?? "DIVISION";
    if (!groups[type]) groups[type] = [];
    groups[type].push(div);
  });

  const ordered = DIVISION_TYPE_ORDER.filter(
    (type) => groups[type]?.length,
  ).map((type) => [type, groups[type]]);

  const remaining = Object.entries(groups).filter(
    ([type]) => !DIVISION_TYPE_ORDER.includes(type),
  );

  return [...ordered, ...remaining];
}

function buildHeadName(head) {
  if (!head) return null;
  const prefix = head.prefix ? head.prefix.replace(/\.$/, "") + "." : "";
  const suffix = head.suffix ? `, ${head.suffix}` : "";
  return (
    `${prefix} ${head.first_name ?? ""} ${head.last_name ?? ""}`.trim() + suffix
  );
}

// ── Division Card ─────────────────────────────────────────────────────────────

const DIVISION_TYPE_LABELS = {
  OFFICE: { label: "Office", className: "bg-indigo-50 text-indigo-600" },
  DIRECTORATE: {
    label: "Directorate",
    className: "bg-purple-50 text-purple-600",
  },
  DIVISION: { label: "Division", className: "bg-slate-100 text-slate-500" },
};

function DivisionCard({ division, colors, onEditDivision, onDeleteDivision }) {
  const code = division?.code ?? null;
  const headName = buildHeadName(division?.head);
  const parentName = division?.parent?.name ?? null;
  const typeInfo =
    DIVISION_TYPE_LABELS[division?.type] ?? DIVISION_TYPE_LABELS.DIVISION;

  return (
    <div
      className={`relative flex flex-col gap-4 rounded-2xl border-2 p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-default bg-white ${colors.border} ${colors.hover}`}
    >
      <div className="absolute top-4 right-4 flex items-center gap-1.5">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEditDivision(division);
          }}
          className="flex items-center justify-center w-7 h-7 rounded-md bg-blue-100 text-blue-500 hover:bg-blue-500 hover:text-white transition-colors duration-150"
          title="Edit division"
        >
          <Pencil size={12} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDeleteDivision(division);
          }}
          className="flex items-center justify-center w-7 h-7 rounded-md bg-red-100 text-red-500 hover:bg-red-500 hover:text-white transition-colors duration-150"
          title="Delete division"
        >
          <Trash2 size={12} />
        </button>
      </div>

      <div className="flex items-center gap-3 pr-16">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${colors.icon}`}
        >
          {division?.type === "OFFICE" ? (
            <Building2 size={20} />
          ) : (
            <Layers size={20} />
          )}
        </div>
        <div className="flex flex-col gap-1 min-w-0">
          {code && (
            <span
              className={`inline-flex self-start items-center rounded-md border px-2 py-0.5 text-[10px] font-mono tracking-wide font-medium ${colors.badge}`}
            >
              {code}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="text-sm font-semibold leading-snug text-gray-800 line-clamp-2">
            {division?.name ?? "—"}
          </p>
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${typeInfo.className}`}
          >
            {typeInfo.label}
          </span>
        </div>

        {parentName && (
          <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
            <Layers size={10} className="shrink-0" />
            <span className="truncate">Under: {parentName}</span>
          </div>
        )}

        {headName ? (
          <div
            className={`flex items-center gap-1.5 text-xs font-medium ${colors.accent}`}
          >
            <User size={11} className="shrink-0" />
            <span className="truncate">{headName}</span>
          </div>
        ) : (
          <p className="text-xs text-gray-400 italic">No head assigned</p>
        )}
      </div>
    </div>
  );
}

// ── Division Section Header ───────────────────────────────────────────────────

function DivisionHeader({ division, deptCount, colors }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${colors.icon}`}
      >
        <Layers size={13} />
      </div>
      <span className={`text-sm font-semibold ${colors.accent}`}>
        {division?.name ?? "No Division"}
      </span>
      {division?.code && (
        <span
          className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${colors.badge}`}
        >
          {division.code}
        </span>
      )}
      <span className="text-[10px] text-gray-400 font-medium bg-gray-100 rounded-full px-2 py-0.5">
        {deptCount} dept{deptCount !== 1 ? "s" : ""}
      </span>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );
}

// ── Pagination ────────────────────────────────────────────────────────────────

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
            <span key={`e-${i}`} className="px-1 text-xs text-muted-foreground">
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

// ── Type Section ──────────────────────────────────────────────────────────────

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
    <div className="space-y-3 mb-4">
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          {type}
        </span>
        <span className="inline-flex items-center justify-center rounded-full bg-slate-100 border border-slate-200 text-slate-500 text-[10px] font-semibold px-2 py-0.5 min-w-[20px]">
          {depts.length}
        </span>
        <div className="flex-1 h-px bg-slate-100" />
        {depts.length > pageSize && (
          <span className="text-[10px] text-slate-400 shrink-0">
            {startItem}–{endItem} of {depts.length}
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {paginated.map((dept) => (
          <DepartmentCard
            key={dept.id}
            department={dept}
            colors={colorMap[dept.division?.id ?? "none"]}
            searchQuery={search}
            onEdit={() => onEdit(dept)}
            onDelete={() => onDelete(dept)}
          />
        ))}
      </div>
      <SectionPagination
        page={safePage}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}

// ── Division Type Section (Offices / Directorates / Divisions header) ────────

function DivisionTypeSection({
  type,
  divs,
  colorMap,
  onEditDivision,
  onDeleteDivision,
}) {
  const label = DIVISION_TYPE_SECTION_LABELS[type] ?? type;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
          {label}
        </span>
        <span className="inline-flex items-center justify-center rounded-full bg-slate-100 border border-slate-200 text-slate-500 text-[10px] font-semibold px-2 py-0.5">
          {divs.length}
        </span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {divs.map((div) => (
          <DivisionCard
            key={div.id}
            division={div}
            colors={getColorForDivision(div.id, colorMap)}
            onEditDivision={onEditDivision}
            onDeleteDivision={onDeleteDivision}
          />
        ))}
      </div>
    </div>
  );
}

// ── Division Block (departments only, no division card) ───────────────────────

function DivisionBlock({
  division,
  depts,
  colorMap,
  search,
  onEdit,
  onDelete,
  pageSize,
}) {
  const colors = getColorForDivision(division?.id, colorMap);
  const grouped = groupByType(depts);

  return (
    <div className={`rounded-2xl border p-5 ${colors.border} ${colors.bg}`}>
      <DivisionHeader
        division={division}
        deptCount={depts.length}
        colors={colors}
      />
      <div className="space-y-2">
        {grouped.map(([type, typeDepts]) => (
          <TypeSection
            key={type}
            type={type}
            depts={typeDepts}
            colorMap={colorMap}
            search={search}
            onEdit={onEdit}
            onDelete={onDelete}
            pageSize={pageSize}
          />
        ))}
      </div>
    </div>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────────

export default function DepartmentTiles({
  departments,
  divisions = [],
  loading,
  search,
  onEdit,
  onDelete,
  onEditDivision,
  onDeleteDivision,
  onClearSearch,
}) {
  const PAGE_SIZE = 8;
  const colorMap = buildColorMap(divisions);

  const deptsByDivision = {};
  departments.forEach((dept) => {
    const key = dept.division?.id ?? "none";
    if (!deptsByDivision[key]) deptsByDivision[key] = [];
    deptsByDivision[key].push(dept);
  });

  const orderedDivisions = [
    ...divisions.map((div) => ({ div, depts: deptsByDivision[div.id] ?? [] })),
    ...(deptsByDivision["none"]?.length
      ? [{ div: null, depts: deptsByDivision["none"] }]
      : []),
  ].filter(({ depts }) => depts.length > 0);

  const divisionsByType = groupDivisionsByType(divisions);

  return (
    <div className="space-y-6">
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      )}

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

      {!loading && (departments.length > 0 || divisions.length > 0) && (
        <>
          {divisions.length > 0 && (
            <div className="space-y-5">
              {divisionsByType.map(([type, divs]) => (
                <DivisionTypeSection
                  key={type}
                  type={type}
                  divs={divs}
                  colorMap={colorMap}
                  onEditDivision={onEditDivision}
                  onDeleteDivision={onDeleteDivision}
                />
              ))}
            </div>
          )}

          {divisions.length > 0 && departments.length > 0 && (
            <div className="h-px bg-border" />
          )}

          {departments.length > 0 &&
            orderedDivisions.map(({ div, depts }) => (
              <DivisionBlock
                key={div?.id ?? "none"}
                division={div}
                depts={depts}
                colorMap={colorMap}
                search={search}
                onEdit={onEdit}
                onDelete={onDelete}
                pageSize={PAGE_SIZE}
              />
            ))}
        </>
      )}
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
      className={`relative flex flex-col gap-4 rounded-2xl border p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-default h-full bg-white ${colors.border} ${colors.hover}`}
    >
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

import { useState, useEffect, useMemo, useCallback } from "react";
import { PageHeader } from "./PageHeader";
import { employeeService } from "@/services/employeeService";
import { LEAVE_TYPES } from "./mockData";

// ─── Utilities ───────────────────────────────────────────────────────────────

function initials(name = "") {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0] ?? "")
    .join("")
    .toUpperCase();
}

const AVATAR_PALETTE = [
  { bg: "#E6F1FB", text: "#0C447C" },
  { bg: "#EAF3DE", text: "#27500A" },
  { bg: "#FAEEDA", text: "#633806" },
  { bg: "#EEEDFE", text: "#3C3489" },
  { bg: "#FAECE7", text: "#712B13" },
  { bg: "#E1F5EE", text: "#085041" },
  { bg: "#FBEAF0", text: "#72243E" },
];

function avatarPalette(id) {
  const n = parseInt(String(id).replace(/\D/g, ""), 10) || 0;
  return AVATAR_PALETTE[n % AVATAR_PALETTE.length];
}

function empName(e) {
  return (
    e.name ?? e.full_name ?? `${e.first_name ?? ""} ${e.last_name ?? ""}`.trim()
  );
}

function empId(e) {
  return e.employee_id ?? e.id;
}

function empDesig(e) {
  return e.designation ?? e.position ?? e.job_title ?? "";
}

function empDept(e) {
  return e.department ?? e.department_name ?? "";
}

// ─── Donut progress ───────────────────────────────────────────────────────────

function Donut({ used, total, color, size = 52 }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const pct = total > 0 ? Math.min(1, used / total) : 0;
  const dash = circ * (1 - pct);
  const cx = size / 2;
  const cy = size / 2;
  return (
    <div
      style={{ position: "relative", width: size, height: size, flexShrink: 0 }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="var(--border)"
          strokeWidth={5}
        />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={5}
          strokeDasharray={circ}
          strokeDashoffset={dash}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11,
          fontWeight: 600,
          color: "var(--foreground)",
        }}
      >
        {total > 0 ? Math.round((used / total) * 100) : 0}%
      </div>
    </div>
  );
}

// ─── Single leave-type card ───────────────────────────────────────────────────

function BalanceCard({ leaveType, data }) {
  const lt = LEAVE_TYPES.find((t) => t.value === leaveType);
  if (!lt || !data || data.total === 0) return null;
  const remaining = data.total - data.used + (data.carryForward ?? 0);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 12px",
        borderRadius: 10,
        border: "1px solid var(--border)",
        background: "var(--card)",
      }}
    >
      <Donut used={data.used} total={data.total} color={lt.color} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "var(--foreground)",
            margin: "0 0 6px",
          }}
        >
          {lt.label}
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 4,
          }}
        >
          {[
            { label: "Total", value: data.total, color: "var(--foreground)" },
            { label: "Used", value: data.used, color: lt.color },
            { label: "Left", value: remaining, color: "#10b981" },
          ].map(({ label, value, color }) => (
            <div key={label}>
              <p
                style={{
                  fontSize: 10,
                  color: "var(--muted-foreground)",
                  margin: 0,
                }}
              >
                {label}
              </p>
              <p style={{ fontSize: 13, fontWeight: 700, color, margin: 0 }}>
                {value}
              </p>
            </div>
          ))}
        </div>
        {(data.carryForward ?? 0) > 0 && (
          <p style={{ fontSize: 10, color: "#6366f1", margin: "4px 0 0" }}>
            +{data.carryForward} carried fwd
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Skeleton loader row ──────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <div
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <div
        className="animate-pulse"
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: "var(--muted)",
        }}
      />
      <div style={{ flex: 1 }}>
        <div
          className="animate-pulse"
          style={{
            height: 12,
            width: "40%",
            borderRadius: 6,
            background: "var(--muted)",
            marginBottom: 6,
          }}
        />
        <div
          className="animate-pulse"
          style={{
            height: 10,
            width: "60%",
            borderRadius: 6,
            background: "var(--muted)",
          }}
        />
      </div>
      <div
        className="animate-pulse"
        style={{
          height: 10,
          width: 60,
          borderRadius: 6,
          background: "var(--muted)",
        }}
      />
    </div>
  );
}

// ─── Employee row with inline expand ─────────────────────────────────────────
// Leave balance section is a placeholder — wire up leaveService here later.

function EmployeeRow({ employee, isOpen, onToggle }) {
  const palette = avatarPalette(empId(employee));
  const name = empName(employee);
  const id = empId(employee);
  const desig = empDesig(employee);
  const dept = empDept(employee);

  return (
    <div
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      {/* Clickable header */}
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "12px 16px",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: palette.bg,
            color: palette.text,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          {initials(name)}
        </div>

        {/* Name + meta */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "var(--foreground)",
              margin: 0,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {name}
          </p>
          <p
            style={{
              fontSize: 11,
              color: "var(--muted-foreground)",
              margin: "2px 0 0",
            }}
          >
            {[id, desig, dept].filter(Boolean).join(" · ")}
          </p>
        </div>

        {/* Chevron */}
        <svg
          width={16}
          height={16}
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          style={{
            color: "var(--muted-foreground)",
            flexShrink: 0,
            transition: "transform 0.2s",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Expanded panel — replace the placeholder below once leaveService is ready */}
      {isOpen && (
        <div
          style={{
            borderTop: "1px solid var(--border)",
            padding: "20px 16px",
            background: "var(--background)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
          }}
        >
          <svg
            width={28}
            height={28}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            style={{ color: "var(--muted-foreground)", opacity: 0.4 }}
          >
            <path
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"
              strokeLinecap="round"
            />
            <rect x="9" y="3" width="6" height="4" rx="1" />
            <path d="M9 12h6M9 16h4" strokeLinecap="round" />
          </svg>
          <p
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: "var(--muted-foreground)",
              margin: 0,
            }}
          >
            Leave balance coming soon
          </p>
          <p
            style={{
              fontSize: 11,
              color: "var(--muted-foreground)",
              margin: 0,
              opacity: 0.7,
            }}
          >
            Wire up{" "}
            <code style={{ fontSize: 11 }}>
              leaveService.getBalanceByEmployee({id})
            </code>{" "}
            here
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function BalancesPage() {
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const [employees, setEmployees] = useState([]);
  const [empLoading, setEmpLoading] = useState(true);
  const [empError, setEmpError] = useState(null);

  const [departments, setDepartments] = useState([]);

  // ── Fetch employees ────────────────────────────────────────────────────────
  const fetchEmployees = useCallback(async () => {
    setEmpLoading(true);
    setEmpError(null);
    try {
      const res = await employeeService.getAll({ per_page: 9999 });
      const list = Array.isArray(res) ? res : (res.data ?? res.employees ?? []);
      setEmployees(list);
    } catch (err) {
      setEmpError(err?.message ?? "Failed to load employees.");
    } finally {
      setEmpLoading(false);
    }
  }, []);

  // ── Fetch departments for the filter dropdown ──────────────────────────────
  const fetchDepartments = useCallback(async () => {
    try {
      const res = await employeeService.getDepartments();
      const list = Array.isArray(res) ? res : (res.data ?? []);
      setDepartments(list);
    } catch {
      // Non-critical — filter stays empty
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
  }, [fetchEmployees, fetchDepartments]);

  // ── Department helpers (handles { id, name } objects or plain strings) ─────
  const deptLabel = (d) =>
    typeof d === "string" ? d : (d.name ?? d.department_name ?? String(d.id));

  // ── Client-side filtering ──────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return employees.filter((e) => {
      const name = empName(e).toLowerCase();
      const id = String(empId(e) ?? "").toLowerCase();
      const dept = empDept(e);
      const matchQ = !q || name.includes(q) || id.includes(q);
      const matchDept = !deptFilter || dept === deptFilter;
      return matchQ && matchDept;
    });
  }, [employees, search, deptFilter]);

  function handleToggle(id) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  return (
    <div className="p-5">
      <PageHeader
        title="Leave Balances"
        description="Track and manage employee leave allocations"
      />

      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        {[
          {
            label: "Total employees",
            value: employees.length,
            sub: "in the system",
            color: "#6366f1",
          },
          {
            label: "Departments",
            value: departments.length,
            sub: "across the org",
            color: "#3b82f6",
          },
          {
            label: "Filtered results",
            value: filtered.length,
            sub: "matching current view",
            color: "#10b981",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 hover:shadow-md transition-all"
          >
            <p className="text-xs text-[var(--muted-foreground)]">{s.label}</p>
            <p className="text-2xl font-bold mt-1" style={{ color: s.color }}>
              {s.value}
            </p>
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
              {s.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Search + department filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
            width={15}
            height={15}
            viewBox="0 0 15 15"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <circle cx="6.5" cy="6.5" r="5" />
            <path d="M10.5 10.5l3 3" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setExpandedId(null);
            }}
            placeholder="Search by name or employee ID…"
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
        <select
          value={deptFilter}
          onChange={(e) => {
            setDeptFilter(e.target.value);
            setExpandedId(null);
          }}
          className="sm:w-52 px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="">All departments</option>
          {departments.map((d) => (
            <option key={deptLabel(d)} value={deptLabel(d)}>
              {deptLabel(d)}
            </option>
          ))}
        </select>
      </div>

      {/* Result count */}
      {!empLoading && !empError && (
        <p className="text-xs text-[var(--muted-foreground)] mb-3">
          Showing {filtered.length} of {employees.length} employees
        </p>
      )}

      {/* Loading skeletons */}
      {empLoading && (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      )}

      {/* Error state */}
      {!empLoading && empError && (
        <div className="flex flex-col items-center justify-center py-16 text-[var(--muted-foreground)]">
          <svg
            width={36}
            height={36}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            className="mb-3 opacity-40"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4m0 4h.01" strokeLinecap="round" />
          </svg>
          <p className="text-sm font-medium">Could not load employees</p>
          <p className="text-xs mt-1 mb-3">{empError}</p>
          <button
            onClick={fetchEmployees}
            className="text-xs px-3 py-1.5 rounded-md border border-[var(--border)] hover:bg-[var(--muted)] transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty filtered state */}
      {!empLoading && !empError && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-[var(--muted-foreground)]">
          <svg
            width={36}
            height={36}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            className="mb-3 opacity-40"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
          </svg>
          <p className="text-sm font-medium">No employees found</p>
          <p className="text-xs mt-1">
            Try a different name, ID, or department
          </p>
        </div>
      )}

      {/* Employee list */}
      {!empLoading && !empError && filtered.length > 0 && (
        <div className="space-y-2">
          {filtered.map((emp) => {
            const id = empId(emp);
            return (
              <EmployeeRow
                key={id}
                employee={emp}
                isOpen={expandedId === id}
                onToggle={() => handleToggle(id)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

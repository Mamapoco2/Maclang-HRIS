import React, { useState, useMemo } from "react";
import {
  IconEdit,
  IconTrash,
  IconEye,
  IconChevronUp,
  IconChevronDown,
  IconSelector,
} from "@tabler/icons-react";

const formatRole = (role) =>
  (Array.isArray(role) ? role : [role].filter(Boolean))
    .filter(Boolean)
    .join(", ") || "-";

const getDeptNames = (emp) => {
  if (Array.isArray(emp.departments) && emp.departments.length > 0)
    return emp.departments.map((d) => d.name).filter(Boolean);
  if (emp.department?.name) return [emp.department.name];
  if (Array.isArray(emp.department_ids) && emp.department_ids.length > 0)
    return emp.department_ids.map((id) => `Dept #${id}`);
  return [];
};

const getStatusFromInfo = (emp) => {
  const manual = emp.employment_status?.toUpperCase();
  if (manual === "RESIGN") return "Resign";
  if (manual === "INACTIVE") return "Inactive";
  if (manual === "ACTIVE") return "Active";
  const infoStatus = emp.info?.status;
  if (!infoStatus || infoStatus === "EMPTY") return "Inactive";
  return "Active";
};

const STATUS_CONFIG = {
  Active: {
    dot: "bg-emerald-500",
    pill: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  Inactive: {
    dot: "bg-gray-300",
    pill: "bg-gray-100 text-gray-600 border-gray-200",
  },
  Resign: { dot: "bg-red-400", pill: "bg-red-50 text-red-700 border-red-200" },
};

const COLUMNS = [
  {
    label: "Username",
    key: "username",
    accessor: (emp) => emp.user?.username || "",
  },
  {
    label: "Last Name",
    key: "last_name",
    accessor: (emp) => emp.last_name || "",
  },
  {
    label: "First Name",
    key: "first_name",
    accessor: (emp) => emp.first_name || "",
  },
  {
    label: "Middle Name",
    key: "middle_name",
    accessor: (emp) => emp.middle_name || "",
  },
  {
    label: "Position",
    key: "position",
    accessor: (emp) => formatRole(emp.role_position),
  },
  {
    label: "Division",
    key: "division",
    accessor: (emp) => emp.division?.name || "",
  },
  {
    label: "Department",
    key: "department",
    accessor: (emp) => getDeptNames(emp).join(", "),
  },
  { label: "Status", key: "status", accessor: (emp) => getStatusFromInfo(emp) },
  { label: "Actions", key: null, accessor: null },
];

function SortIcon({ direction }) {
  if (direction === "asc")
    return <IconChevronUp size={13} className="text-blue-500" />;
  if (direction === "desc")
    return <IconChevronDown size={13} className="text-blue-500" />;
  return (
    <IconSelector
      size={13}
      className="text-gray-300 group-hover:text-gray-400 transition-colors"
    />
  );
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
    if (!key) return;
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

  const getAvatarUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `${import.meta.env.VITE_API_BASE_URL?.replace("/api", "") ?? "http://localhost:8000"}/storage/${url}`;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <colgroup>
            <col className="w-12" />
            <col className="w-36" />
            <col className="w-44" />
            <col className="w-36" />
            <col className="w-44" />
            <col className="w-40" />
            <col className="w-36" />
            <col className="w-56" />
            <col className="w-28" />
            <col className="w-48" />
          </colgroup>

          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {/* Avatar col */}
              <th className="py-3 px-4" />

              {COLUMNS.map(({ label, key }) => (
                <th
                  key={label}
                  onClick={() => handleSort(key)}
                  className={[
                    "py-3 px-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide select-none",
                    key
                      ? "cursor-pointer group hover:text-gray-600 transition-colors"
                      : "",
                  ].join(" ")}
                >
                  <span className="inline-flex items-center gap-1">
                    {label}
                    {key && (
                      <SortIcon direction={sortKey === key ? sortDir : null} />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-3.5 px-4">
                    <div className="w-8 h-8 rounded-full bg-gray-100 mx-auto" />
                  </td>
                  {Array.from({ length: 9 }).map((__, j) => (
                    <td key={j} className="py-3.5 px-4">
                      <div
                        className="h-3 rounded-full bg-gray-100"
                        style={{ width: `${55 + ((j * 7) % 35)}%` }}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : sortedRows.length > 0 ? (
              sortedRows.map((emp) => {
                const deptNames = getDeptNames(emp);
                const status = getStatusFromInfo(emp);
                const avatarSrc = getAvatarUrl(emp.avatar_url);
                const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.Inactive;

                return (
                  <tr
                    key={emp.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* Avatar */}
                    <td className="py-3 px-4">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 ring-1 ring-gray-200 flex items-center justify-center flex-shrink-0 mx-auto">
                        {avatarSrc ? (
                          <img
                            src={avatarSrc}
                            className="w-full h-full object-cover"
                            alt="avatar"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              e.currentTarget.parentElement.querySelector(
                                ".fallback-initials",
                              ).style.display = "flex";
                            }}
                          />
                        ) : null}
                        <span
                          className="fallback-initials text-gray-500 text-[11px] font-semibold items-center justify-center w-full h-full"
                          style={{ display: avatarSrc ? "none" : "flex" }}
                        >
                          {emp.last_name?.[0]}
                          {emp.first_name?.[0]}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-xs text-gray-500 uppercase">
                      {emp.user?.username || "—"}
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-700 uppercase font-medium">
                      {emp.last_name || "—"}
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-800 uppercase font-medium">
                      {emp.first_name || "—"}
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-500 uppercase">
                      {emp.middle_name || "—"}
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-600 uppercase">
                      {formatRole(emp.role_position)}
                    </td>
                    <td className="py-3 px-4">
                      {emp.division?.name ? (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium uppercase">
                          {emp.division.name}
                        </span>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-600 uppercase">
                      {deptNames.length > 0
                        ? deptNames.map((n) => n.toUpperCase()).join(", ")
                        : "—"}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${cfg.pill}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`}
                        />
                        {status.toUpperCase()}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onView(emp)}
                          className="inline-flex items-center gap-1 h-7 px-2.5 rounded-lg text-[11px] font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
                        >
                          <IconEye size={12} /> View
                        </button>
                        <button
                          onClick={() => onEdit(emp)}
                          className="inline-flex items-center gap-1 h-7 px-2.5 rounded-lg text-[11px] font-medium text-gray-600 bg-white border border-gray-200 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 transition-colors"
                        >
                          <IconEdit size={12} /> Edit
                        </button>
                        <button
                          onClick={() => onDelete(emp.id)}
                          className="inline-flex items-center gap-1 h-7 px-2.5 rounded-lg text-[11px] font-medium text-gray-600 bg-white border border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                        >
                          <IconTrash size={12} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={10} className="text-center py-16 text-gray-400">
                  <div className="flex flex-col items-center gap-2">
                    <svg
                      className="w-8 h-8 text-gray-200"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <p className="text-sm text-gray-400">No employees found</p>
                    <p className="text-xs text-gray-300">
                      Try adjusting your search or filters
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

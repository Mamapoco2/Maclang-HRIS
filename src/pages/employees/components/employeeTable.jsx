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
    dot: "bg-teal-500",
    pill: "text-teal-700 bg-teal-50 ring-1 ring-teal-200",
  },
  Inactive: {
    dot: "bg-gray-300",
    pill: "text-gray-500 bg-gray-100 ring-1 ring-gray-200",
  },
  Resign: {
    dot: "bg-red-400",
    pill: "text-red-600 bg-red-50 ring-1 ring-red-200",
  },
};

// Sortable columns definition: label -> accessor function
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
  { label: "Actions", key: null, accessor: null }, // not sortable
];

function SortIcon({ direction }) {
  if (direction === "asc")
    return <IconChevronUp size={13} className="text-teal-500" />;
  if (direction === "desc")
    return <IconChevronDown size={13} className="text-teal-500" />;
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
  const [sortDir, setSortDir] = useState("asc"); // "asc" | "desc"

  const rows = Array.isArray(employees) ? employees : [];

  const handleSort = (key) => {
    if (!key) return;
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
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
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <table className="w-full text-sm">
        <colgroup>
          <col className="w-36" />
          <col className="w-14" />
          <col className="w-44" />
          <col className="w-36" />
          <col className="w-44" />
          <col className="w-40" />
          <col className="w-56" />
          <col className="w-28" />
          <col className="w-48" />
        </colgroup>

        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/70">
            {/* Avatar column — not sortable */}
            <th className="py-3 px-4" />

            {COLUMNS.map(({ label, key }) => (
              <th
                key={label}
                onClick={() => handleSort(key)}
                className={[
                  "py-3 px-4 text-center text-m font-semibold text-gray-400 uppercase tracking-wider select-none",
                  key
                    ? "cursor-pointer group hover:text-gray-600 transition-colors"
                    : "",
                ].join(" ")}
              >
                <span className="inline-flex items-center justify-center gap-1">
                  {label}
                  {key && (
                    <SortIcon direction={sortKey === key ? sortDir : null} />
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <tr key={i} className="animate-pulse">
                <td className="py-3.5 px-4">
                  <div className="w-8 h-8 rounded-full bg-gray-100 mx-auto" />
                </td>
                {Array.from({ length: 7 }).map((__, j) => (
                  <td key={j} className="py-3.5 px-4 text-center">
                    <div
                      className="h-3 rounded-full bg-gray-100 mx-auto"
                      style={{ width: `${60 + Math.random() * 30}%` }}
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
                  className="hover:bg-gray-50 transition-colors duration-75"
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

                  <td className="py-3 px-4 text-center">
                    <span className="text-[13px] text-gray-500 uppercase">
                      {emp.user?.username || "—"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-[13px] text-gray-700 uppercase">
                      {emp.last_name || "—"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-[13px] font-medium text-gray-800 uppercase">
                      {emp.first_name || "—"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-[13px] text-gray-500 uppercase">
                      {emp.middle_name || "—"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-[13px] text-gray-600 uppercase">
                      {formatRole(emp.role_position)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-[13px] text-gray-600 uppercase">
                      {emp.division?.name?.toUpperCase() || "—"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-[13px] text-gray-600 uppercase">
                      {deptNames.length > 0
                        ? deptNames.map((n) => n.toUpperCase()).join(", ")
                        : "—"}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${cfg.pill}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`}
                      />
                      {status.toUpperCase()}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onView(emp)}
                        className="inline-flex items-center gap-1 h-7 px-2.5 rounded-md text-[11px] font-medium bg-teal-500 hover:bg-teal-600 text-white transition-colors"
                      >
                        <IconEye size={12} /> View
                      </button>
                      <button
                        onClick={() => onEdit(emp)}
                        className="inline-flex items-center gap-1 h-7 px-2.5 rounded-md text-[11px] font-medium bg-amber-400 hover:bg-amber-500 text-white transition-colors"
                      >
                        <IconEdit size={12} /> Edit
                      </button>
                      <button
                        onClick={() => onDelete(emp.id)}
                        className="inline-flex items-center gap-1 h-7 px-2.5 rounded-md text-[11px] font-medium bg-red-500 hover:bg-red-600 text-white transition-colors"
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
              <td colSpan={9} className="text-center py-16 text-gray-400">
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
  );
}

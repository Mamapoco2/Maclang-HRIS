// src/pages/manpower/components/NodeTemplate.jsx
import { useState } from "react";
import NodeModal from "./NodeModal";

const DEFAULT_IMG = "https://cdn-icons-png.flaticon.com/512/147/147144.png";

const EMPLOYMENT_COLORS = {
  PLANTILLA: { bg: "bg-blue-50", text: "text-blue-600", dot: "bg-blue-500" },
  "CONTRACT OF SERVICE": {
    bg: "bg-amber-50",
    text: "text-amber-600",
    dot: "bg-amber-500",
  },
  CONSULTANT: {
    bg: "bg-purple-50",
    text: "text-purple-600",
    dot: "bg-purple-500",
  },
};

const DEPT_TYPE_STYLES = {
  OFFICE: {
    badge: "bg-indigo-100 text-indigo-700 border-indigo-200",
    bar: "bg-indigo-500",
    border: "border-indigo-200",
    label: "OFFICE",
  },
  DIRECTORATE: {
    badge: "bg-purple-100 text-purple-700 border-purple-200",
    bar: "bg-purple-500",
    border: "border-purple-200",
    label: "DIRECTORATE",
  },
  DIVISION: {
    badge: "bg-teal-100 text-teal-700 border-teal-200",
    bar: "bg-teal-500",
    border: "border-teal-200",
    label: "DIVISION",
  },
  DEPARTMENT: {
    badge: "bg-blue-100 text-blue-700 border-blue-200",
    bar: "bg-blue-500",
    border: "border-blue-200",
    label: "DEPT",
  },
  UNIT: {
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
    bar: "bg-emerald-500",
    border: "border-emerald-200",
    label: "UNIT",
  },
  SECTION: {
    badge: "bg-violet-100 text-violet-700 border-violet-200",
    bar: "bg-violet-500",
    border: "border-violet-200",
    label: "SECT",
  },
};

function resolveTitle(title) {
  if (!title) return null;
  if (Array.isArray(title)) return title.filter(Boolean).join(", ") || null;
  return String(title).trim() || null;
}

function buildDisplayName(data) {
  if (!data.first_name && !data.last_name) return data.name || null;

  const prefix = data.prefix ? data.prefix.replace(/\.$/, "") + "." : null;
  const middle = data.middle_name || null;

  const nameParts = [prefix, data.first_name, middle, data.last_name]
    .filter(Boolean)
    .join(" ");

  const suffix = data.suffix ? `, ${data.suffix}` : "";
  const title = resolveTitle(data.title);
  const titleStr = title ? `, ${title}` : "";

  return nameParts + suffix + titleStr || data.name || null;
}

function stripVacantPrefix(name) {
  return (name || "").replace(/^Vacant\s*[—-]\s*/i, "").trim();
}

const NodeTemplate = (node) => {
  const [open, setOpen] = useState(false);

  const data = node?.data || {};

  const deptName = node?.deptName || data.department || null;
  const deptType = node?.deptType || null;
  const deptCode = node?.deptCode || null;
  const deptStyles = DEPT_TYPE_STYLES[deptType] || null;

  // FIX: isVacant must also account for explicit backend flags.
  // A vacant head node has is_vacant_head: true and may carry a name (position title),
  // so checking only name/employeeId fields causes it to fall through to the wrong branch.
  const isVacant =
    data?.is_vacant_head === true ||
    data?.is_vacant_slot === true ||
    (!data.first_name && !data.last_name && !data.employeeId);

  const isVacantPosition =
    node?.type === "vacant_position" || data?.is_vacant_slot === true;
  const isVacantHead = data?.is_vacant_head === true;
  const fullName = buildDisplayName(data);

  const empType = (
    data.employmentType ||
    data.employment_type ||
    ""
  ).toUpperCase();
  const colors = EMPLOYMENT_COLORS[empType] || {
    bg: "bg-gray-50",
    text: "text-gray-500",
    dot: "bg-gray-400",
  };

  const image = !isVacant
    ? data.image || data.avatar_url || DEFAULT_IMG
    : DEFAULT_IMG;
  const role = data.role || null;
  const staffCount = Array.isArray(data.staff)
    ? data.staff.filter((s) => !s.is_vacant_slot).length
    : 0;

  const vacantPositionTitle = isVacantPosition
    ? stripVacantPrefix(data.name || data.full_name) || "Vacant Position"
    : null;

  const accentBar = isVacantPosition
    ? "bg-amber-400"
    : deptStyles
      ? deptStyles.bar
      : colors.dot;

  return (
    <>
      <div className="flex flex-col items-center">
        <div
          onClick={() => setOpen(true)}
          className={`group relative bg-white border rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden ${
            isVacantPosition
              ? "border-amber-200 border-dashed hover:border-amber-300"
              : deptStyles
                ? `${deptStyles.border} hover:border-opacity-70`
                : "border-gray-200 hover:border-blue-300"
          }`}
          style={{ width: "280px" }}
        >
          <div className={`h-1 w-full ${accentBar}`} />

          {deptName && !isVacantPosition && (
            <div className="flex items-center justify-center gap-2 px-3 pt-2 pb-1">
              <span className="text-[10px] font-semibold text-gray-600 truncate uppercase">
                {deptName}
              </span>
            </div>
          )}

          {isVacantPosition && (
            <div className="flex items-center justify-center gap-2 px-3 pt-2 pb-1">
              <span className="text-[10px] font-semibold text-amber-600 truncate uppercase tracking-wider">
                {vacantPositionTitle}
              </span>
            </div>
          )}

          {(deptName || isVacantPosition) && (
            <div className="mx-3 border-t border-gray-100" />
          )}

          <div className="flex items-center gap-3 p-3">
            <div className="relative flex-shrink-0">
              <img
                src={image}
                alt={fullName || "Vacant"}
                className={`w-12 h-12 rounded-xl object-cover shadow-sm ${
                  isVacant ? "opacity-30 grayscale" : ""
                }`}
                onError={(e) => {
                  e.target.src = DEFAULT_IMG;
                }}
              />
              {isVacant && (
                <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-gray-100/60">
                  <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">
                    Vacant
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col min-w-0 flex-1">
              {isVacant ? (
                isVacantPosition ? (
                  <span className="text-xs font-semibold text-amber-600 italic">
                    Vacant
                  </span>
                ) : isVacantHead ? (
                  <span className="font-semibold text-xs text-gray-800 leading-snug line-clamp-2">
                    {fullName}
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-gray-300 italic">
                    No head assigned
                  </span>
                )
              ) : (
                <span className="font-semibold text-xs text-gray-800 leading-snug line-clamp-2">
                  {fullName}
                </span>
              )}

              {role && (!isVacant || isVacantPosition || isVacantHead) && (
                <span className="text-[10px] text-gray-500 mt-0.5 leading-snug line-clamp-1 uppercase">
                  {role}
                </span>
              )}

              {isVacant && isVacantHead && (
                <span className="mt-1 inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full w-fit bg-amber-50 text-amber-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  Vacant
                </span>
              )}

              {empType && !isVacant && (
                <span
                  className={`mt-1 inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full w-fit ${colors.bg} ${colors.text}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                  {empType}
                </span>
              )}

              {staffCount > 0 && (
                <span className="mt-1 inline-flex items-center gap-1 text-[9px] text-gray-400 font-medium">
                  <span className="w-1 h-1 rounded-full bg-gray-300" />
                  {staffCount} staff
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <NodeModal open={open} onClose={() => setOpen(false)} node={node} />
    </>
  );
};

export default NodeTemplate;

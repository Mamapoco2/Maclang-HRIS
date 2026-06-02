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

function buildDisplayName(data) {
  const prefix = data.prefix ? data.prefix.replace(/\.$/, "") + "." : null;
  const middle = data.middle_name ? data.middle_name.charAt(0) + "." : null;

  const nameParts = [prefix, data.first_name, middle, data.last_name]
    .filter(Boolean)
    .join(" ");

  const suffix = data.suffix ? `, ${data.suffix}` : "";
  const title = data.title ? `, ${data.title}` : "";

  return nameParts + suffix + title || data.name || "Unnamed";
}

const NodeTemplate = (node) => {
  const [open, setOpen] = useState(false);
  const data = node?.data || {};

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
  const image = data.image || data.avatar_url || DEFAULT_IMG;

  // Role: always show if present — removed the showRole gate
  const role = data.role || null;

  // Department: first entry from the department field
  const department = data.department || null;

  return (
    <>
      <div className="flex flex-col items-center">
        <div
          onClick={() => setOpen(true)}
          className="group relative bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200 cursor-pointer overflow-hidden"
          style={{ width: "300px" }}
        >
          {/* Top accent bar */}
          <div className={`h-1 w-full ${colors.dot}`} />

          <div className="flex items-center gap-3 p-3">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <img
                src={image}
                alt={fullName}
                className="w-14 h-14 rounded-xl object-cover shadow-sm"
                onError={(e) => {
                  e.target.src = DEFAULT_IMG;
                }}
              />
            </div>

            {/* Info */}
            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-semibold text-xs text-gray-800 leading-snug line-clamp-2">
                {fullName}
              </span>

              {/* Role — always shown when present */}
              {role && (
                <span className="text-[11px] text-gray-500 mt-0.5 leading-snug line-clamp-1">
                  {role}
                </span>
              )}

              {/* Department — always shown when present */}
              {department && (
                <span className="text-[10px] text-blue-500 mt-0.5 font-medium truncate">
                  {department}
                </span>
              )}

              {/* Employment Type badge */}
              {empType && (
                <span
                  className={`mt-1 inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full w-fit ${colors.bg} ${colors.text}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                  {empType}
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

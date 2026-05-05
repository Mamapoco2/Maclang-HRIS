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
  const empType = (data.employmentType || "").toUpperCase();
  const colors = EMPLOYMENT_COLORS[empType] || {
    bg: "bg-gray-50",
    text: "text-gray-500",
    dot: "bg-gray-400",
  };
  const image = data.image || DEFAULT_IMG;

  return (
    <>
      {/* ── MAIN NODE ───────────────────────────────────── */}
      <div className="flex flex-col items-center">
        <div
          onClick={() => setOpen(true)}
          className="group relative bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200 cursor-pointer overflow-hidden"
          style={{ width: "300px" }}
        >
          {/* Top accent bar — color per employment type */}
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

              {/* Role — only for non-staff */}
              {data.showRole && data.role && (
                <span className="text-[11px] text-gray-500 mt-0.5 leading-snug line-clamp-2">
                  {data.role}
                </span>
              )}

              {/* Department — only for non-staff */}
              {data.showDept && data.department && (
                <span className="text-[10px] text-blue-500 mt-0.5 font-medium truncate">
                  {data.department}
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

        {/* ── STAFF LIST ──────────────────────────────────── */}
        {/* {data.staff?.length > 0 && (
          <div
            className="mt-1 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm"
            style={{ width: "300px" }}
          >
            <div className="px-3 py-1.5 bg-gray-50 border-b border-gray-100">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                Staff ({data.staff.length})
              </span>
            </div>

            <div className="max-h-[220px] overflow-y-auto">
              {data.staff.map((s, i) => {
                const sName = buildDisplayName(s);
                const sType = (s.employmentType || "").toUpperCase();
                const sColor = EMPLOYMENT_COLORS[sType] || {
                  dot: "bg-gray-300",
                };

                return (
                  <div
                    key={s.id || i}
                    className="flex items-center gap-2.5 px-3 py-2 border-b border-gray-50 last:border-b-0 hover:bg-gray-50 transition-colors"
                  >
                    <img
                      src={s.image || DEFAULT_IMG}
                      alt={sName}
                      className="w-7 h-7 rounded-full object-cover flex-shrink-0 ring-1 ring-gray-100"
                      onError={(e) => {
                        e.target.src = DEFAULT_IMG;
                      }}
                    />
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-[11px] font-medium text-gray-700 leading-tight truncate">
                        {sName}
                      </span>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span
                          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${sColor.dot}`}
                        />
                        <span className="text-[9px] text-gray-400 uppercase tracking-wide">
                          {sType || "Staff"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )} */}
      </div>

      {/* Modal */}
      <NodeModal open={open} onClose={() => setOpen(false)} node={node} />
    </>
  );
};

export default NodeTemplate;

import { useState } from "react";
import { Eye } from "lucide-react";
import { ViewMemberModal } from "./viewTeamModal";

const STATUS_STYLES = {
  ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  INACTIVE: "bg-gray-100 text-gray-600 border-gray-200",
  RESIGN: "bg-red-50 text-red-700 border-red-200",
};

const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/147/147144.png";

export default function TeamTableRow({ member }) {
  const [showView, setShowView] = useState(false);

  const fullName =
    [member.last_name, member.first_name].filter(Boolean).join(", ") || "—";

  const roles = Array.isArray(member.role_position)
    ? member.role_position.join(", ")
    : member.role_position || "—";

  const statusKey = member.employment_status?.toUpperCase() ?? "INACTIVE";
  const statusStyle = STATUS_STYLES[statusKey] ?? "bg-gray-100 text-gray-500 border-gray-200";

  return (
    <>
      <tr className="hover:bg-gray-50 transition-colors">
        {/* Name */}
        <td className="px-4 py-2.5">
          <div className="flex items-center gap-2.5">
            <img
              src={member.avatar_url || DEFAULT_AVATAR}
              alt={fullName}
              className="w-7 h-7 rounded-full object-cover ring-1 ring-gray-100 shrink-0"
              onError={(e) => { e.target.src = DEFAULT_AVATAR; }}
            />
            <span className="text-xs font-medium text-gray-900">{fullName}</span>
          </div>
        </td>

        {/* Role */}
        <td className="px-4 py-2.5 text-xs text-gray-600">{roles}</td>

        {/* Division */}
        <td className="px-4 py-2.5 text-xs text-gray-600">
          {member.division?.name ? (
            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium text-xs">
              {member.division.name}
            </span>
          ) : (
            <span className="text-gray-300">—</span>
          )}
        </td>

        {/* Status */}
        <td className="px-4 py-2.5">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border capitalize ${statusStyle}`}
          >
            {member.employment_status ?? "—"}
          </span>
        </td>

        {/* Actions */}
        <td className="px-4 py-2.5">
          <button
            onClick={() => setShowView(true)}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
          >
            <Eye className="w-3 h-3" /> View
          </button>
        </td>
      </tr>

      <ViewMemberModal
        member={member}
        open={showView}
        onOpenChange={setShowView}
      />
    </>
  );
}

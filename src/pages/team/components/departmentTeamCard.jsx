import { useState } from "react";
import { Building2, ChevronDown, ChevronUp } from "lucide-react";
import TeamTableRow from "./teamTableRow";

export default function DepartmentTeamCard({ group }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-3 cursor-pointer select-none bg-gray-50 hover:bg-gray-100 transition-colors border-b border-gray-100"
        onClick={() => setCollapsed((p) => !p)}
      >
        <div className="flex items-center gap-2">
          <Building2 size={14} className="text-gray-400 shrink-0" />
          <span className="font-semibold text-sm text-gray-800">
            {group.name}
          </span>
          <span className="text-xs text-gray-400 font-normal">
            ({group.members.length}{" "}
            {group.members.length === 1 ? "member" : "members"})
          </span>
        </div>
        {collapsed ? (
          <ChevronDown size={14} className="text-gray-400" />
        ) : (
          <ChevronUp size={14} className="text-gray-400" />
        )}
      </div>

      {!collapsed && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {["Name", "Role", "Division", "Status", "Actions"].map(
                  (col) => (
                    <th
                      key={col}
                      className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest"
                    >
                      {col}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {group.members.map((member) => (
                <TeamTableRow key={member.id} member={member} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

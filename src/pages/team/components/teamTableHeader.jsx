import { Users } from "lucide-react";

function formatTeamName(name = "") {
  return (
    name
      .replace(/\b(department|dept\.?|office|unit|division)\b/gi, "")
      .replace(/\s+/g, " ")
      .trim() + " Team"
  );
}

export default function TeamTableHeader({ departmentName = "", totalGroups = 0 }) {
  const teamTitle = departmentName ? formatTeamName(departmentName) : "Team";

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-600 rounded-xl">
          <Users className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900 leading-tight uppercase">
            {teamTitle}
          </h2>
          {totalGroups > 0 && (
            <p className="text-xs text-gray-500 leading-tight">
              {totalGroups} {totalGroups === 1 ? "department" : "departments"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

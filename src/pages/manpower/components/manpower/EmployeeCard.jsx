// src/pages/manpower/components/manpower/EmployeeCard.jsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const STATUS_COLORS = {
  ACTIVE: "bg-green-100 text-green-800 border-green-300",
  INACTIVE: "bg-gray-100 text-gray-800 border-gray-300",
  RESIGN: "bg-red-100 text-red-800 border-red-300",
};

const EMPLOYMENT_COLORS = {
  Plantilla: "bg-blue-100 text-blue-800",
  "Contract of Service": "bg-amber-100 text-amber-800",
  Consultant: "bg-purple-100 text-purple-800",
};

export default function EmployeeCard({ employee, isPrimary = false }) {
  if (!employee) return null;

  const statusColor =
    STATUS_COLORS[employee.employment_status] || STATUS_COLORS.ACTIVE;
  const empColor = EMPLOYMENT_COLORS[employee.employment_type] || "bg-gray-100";

  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all">
      {/* Avatar */}
      <Avatar className="h-10 w-10 flex-shrink-0">
        <AvatarImage src={employee.avatar_url} alt={employee.full_name} />
        <AvatarFallback className="bg-gray-200 text-gray-600 font-semibold">
          {employee.first_name?.[0]}
          {employee.last_name?.[0]}
        </AvatarFallback>
      </Avatar>

      {/* Employee Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <p className="text-sm font-semibold text-gray-800 truncate">
            {employee.full_name}
          </p>
          {isPrimary && (
            <span className="text-[10px] font-bold text-green-700 uppercase">
              HEAD
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 uppercase mt-0.5">
          {employee.primary_role}
        </p>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-1.5">
        <Badge variant="outline" className={`text-[10px] ${statusColor}`}>
          {employee.employment_status}
        </Badge>
        <Badge variant="outline" className={`text-[10px] ${empColor}`}>
          {employee.employment_type}
        </Badge>
      </div>
    </div>
  );
}

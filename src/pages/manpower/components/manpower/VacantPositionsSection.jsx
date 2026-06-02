// src/pages/manpower/components/manpower/VacantPositionsSection.jsx
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function VacantPositionsSection({
  vacantCount = 0,
  unfilledCount = 0,
  positions = [],
}) {
  if (vacantCount === 0 && unfilledCount === 0) {
    return null;
  }

  return (
    <div className="space-y-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4 text-yellow-600" />
        <p className="text-sm font-semibold text-gray-800 uppercase">
          Positions Status
        </p>
      </div>

      <div className="space-y-2">
        {/* Vacant */}
        {vacantCount > 0 && (
          <div className="flex items-center justify-between p-2 bg-white rounded border border-yellow-300">
            <span className="text-xs font-medium text-gray-700 uppercase">
              Vacant Positions
            </span>
            <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
              {vacantCount}
            </Badge>
          </div>
        )}

        {/* Unfilled */}
        {unfilledCount > 0 && (
          <div className="flex items-center justify-between p-2 bg-white rounded border border-orange-300">
            <span className="text-xs font-medium text-gray-700 uppercase">
              Awaiting Approval
            </span>
            <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
              {unfilledCount}
            </Badge>
          </div>
        )}

        {/* Position Details */}
        {positions.length > 0 && (
          <div className="text-[10px] text-gray-600 space-y-1 pt-2 border-t border-yellow-200">
            {positions.map((pos) => (
              <div key={pos.id} className="flex justify-between">
                <span>{pos.position_title || pos.item_number}</span>
                {pos.salary_grade && (
                  <span className="text-gray-500">SG-{pos.salary_grade}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

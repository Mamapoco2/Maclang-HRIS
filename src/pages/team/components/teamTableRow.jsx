import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { IconEye } from "@tabler/icons-react";
import { ViewMemberModal } from "./viewTeamModal";

const STATUS_STYLES = {
  ACTIVE: "bg-green-100 text-green-700 border-green-200",
  INACTIVE: "bg-gray-100 text-gray-600 border-gray-200",
  RESIGN: "bg-red-100 text-red-600 border-red-200",
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

  return (
    <>
      <TableRow className="hover:bg-muted/40 transition-colors">
        {/* Name */}
        <TableCell className="py-2">
          <div className="flex items-center">
            <img
              src={member.avatar_url || DEFAULT_AVATAR}
              alt={fullName}
              className="w-7 h-7 rounded-full object-cover ring-1 ring-gray-100 shrink-0"
              onError={(e) => {
                e.target.src = DEFAULT_AVATAR;
              }}
            />
            <span className="font-medium text-xs flex-1 text-center">
              {fullName}
            </span>
          </div>
        </TableCell>

        {/* Role */}
        <TableCell className="py-2 text-xs text-center">{roles}</TableCell>

        {/* Division */}
        <TableCell className="py-2 text-xs text-center">
          {member.division?.name ?? "—"}
        </TableCell>

        {/* Status */}
        <TableCell className="py-2 text-center">
          <div className="flex justify-center">
            <Badge
              variant="outline"
              className={`text-[10px] font-semibold capitalize px-2 py-0 ${STATUS_STYLES[statusKey] ?? "bg-gray-100 text-gray-500"}`}
            >
              {member.employment_status ?? "—"}
            </Badge>
          </div>
        </TableCell>

        {/* Actions */}
        <TableCell className="py-2 text-center">
          <Button
            variant="outline"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={() => setShowView(true)}
          >
            <IconEye size={12} className="mr-1" /> View
          </Button>
        </TableCell>
      </TableRow>

      <ViewMemberModal
        member={member}
        open={showView}
        onOpenChange={setShowView}
      />
    </>
  );
}

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/147/147144.png";

const STATUS_STYLES = {
  ACTIVE: "bg-green-100 text-green-700 border-green-200",
  INACTIVE: "bg-gray-100 text-gray-600 border-gray-200",
  RESIGN: "bg-red-100 text-red-600 border-red-200",
};

export function ViewMemberModal({ member, open, onOpenChange }) {
  const fullName =
    [member.prefix, member.first_name, member.middle_name, member.last_name]
      .filter(Boolean)
      .join(" ") + (member.suffix ? `, ${member.suffix}` : "");

  const roles = Array.isArray(member.role_position)
    ? member.role_position.join(", ")
    : member.role_position || "—";

  const departments =
    Array.isArray(member.departments) && member.departments.length > 0
      ? member.departments.map((d) => d.name).join(", ")
      : "—";

  const statusKey = member.employment_status?.toUpperCase() ?? "INACTIVE";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Member Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="flex flex-col items-center gap-2 text-center">
            <img
              src={member.avatar_url || DEFAULT_AVATAR}
              alt={fullName}
              className="w-20 h-20 rounded-full object-cover ring-2 ring-gray-100"
              onError={(e) => {
                e.target.src = DEFAULT_AVATAR;
              }}
            />
            <p className="font-semibold text-base">{fullName || "—"}</p>
            <Badge
              variant="outline"
              className={`text-xs font-semibold ${STATUS_STYLES[statusKey] ?? ""}`}
            >
              {member.employment_status ?? "—"}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Employee No.
              </p>
              <p className="font-medium">{member.employee_number ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Employment Type
              </p>
              <p className="font-medium">{member.employment_type ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Position
              </p>
              <p className="font-medium">{roles}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Division
              </p>
              <p className="font-medium">{member.division?.name ?? "—"}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Department(s)
              </p>
              <p className="font-medium">{departments}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

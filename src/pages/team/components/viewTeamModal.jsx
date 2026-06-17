import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/147/147144.png";

const STATUS_STYLES = {
  ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  INACTIVE: "bg-gray-100 text-gray-600 border-gray-200",
  RESIGN: "bg-red-50 text-red-700 border-red-200",
};

function InfoField({ label, value, span = false }) {
  return (
    <div className={`bg-gray-50 rounded-lg p-3 ${span ? "col-span-2" : ""}`}>
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
        {label}
      </p>
      <p className="text-sm font-medium text-gray-800 break-words">
        {value || "—"}
      </p>
    </div>
  );
}

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
  const statusStyle =
    STATUS_STYLES[statusKey] ?? "bg-gray-100 text-gray-500 border-gray-200";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl border border-gray-100 shadow-xl p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-5 pb-0">
          <DialogTitle className="text-sm font-semibold text-gray-900">
            Member Details
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-5 pt-4">
          {/* Avatar + name block */}
          <div className="flex flex-col items-center gap-2 text-center py-3 bg-gray-50 rounded-xl">
            <img
              src={member.avatar_url || DEFAULT_AVATAR}
              alt={fullName}
              className="w-16 h-16 rounded-full object-cover ring-2 ring-white shadow-sm"
              onError={(e) => {
                e.target.src = DEFAULT_AVATAR;
              }}
            />
            <p className="font-semibold text-sm text-gray-900">
              {fullName || "—"}
            </p>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border capitalize ${statusStyle}`}
            >
              {member.employment_status ?? "—"}
            </span>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-2">
            <InfoField label="Employee No." value={member.employee_number} />
            <InfoField label="Employment Type" value={member.employment_type} />
            <InfoField label="Position" value={roles} />
            <InfoField label="Division" value={member.division?.name} />
            <InfoField label="Department(s)" value={departments} span />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

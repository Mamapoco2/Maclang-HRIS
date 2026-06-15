// src/pages/manpower/components/NodeModal.jsx
import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { resolveBorderColor } from "../../../services/utils";
import { FaIdBadge, FaChevronDown, FaChevronUp } from "react-icons/fa";

const DEFAULT_IMG =
  "https://cdn3.iconfinder.com/data/icons/avatars-flat/33/man_5-1024.png";

const CARD_VISIBLE_ROLES = new Set([
  "CHIEF",
  "DIRECTOR",
  "ASSISTANT DIRECTOR",
  "OFFICER IN CHARGE",
  "CHAIRMAN",
  "HEAD",
  "SUPERVISOR",
]);

function isStaffRole(role) {
  if (!role) return true;
  return !CARD_VISIBLE_ROLES.has(role.toUpperCase().trim());
}

function resolveTitle(title) {
  if (!title) return null;
  if (Array.isArray(title)) return title.filter(Boolean).join(", ") || null;
  return String(title).trim() || null;
}

function buildPersonName(person) {
  if (!person) return null;
  const cleanPrefix = person.prefix ? person.prefix.replace(/\.$/, "") : null;
  const title = resolveTitle(person.title);

  return (
    [
      cleanPrefix ? cleanPrefix + "." : null,
      person.first_name,
      person.middle_name,
      person.last_name,
    ]
      .filter(Boolean)
      .join(" ") +
    (person.suffix ? ", " + person.suffix : "") +
    (title ? ", " + title : "")
  ).trim();
}

export default function NodeModal({ open, onClose, node }) {
  const data = node?.data || {};
  const borderColor = resolveBorderColor(data);

  // FIX: Vacant slots come embedded in the staff array from the backend
  // (is_vacant_slot: true), not a separate vacantItems key.
  const staffRaw = data?.staff || [];
  const regularStaff = staffRaw.filter((s) => !s.is_vacant_slot);
  const vacantSlots = staffRaw.filter((s) => s.is_vacant_slot);

  const fullName =
    buildPersonName(data) || data.name || data.full_name || "Vacant";

  const staff = regularStaff.map((s) => {
    const normalized = s.employmentType
      ? s.employmentType.toLowerCase()
      : "vacant";

    const staffName = buildPersonName(s);

    return {
      ...s,
      name:
        (s.employeeId || s.id) && staffName
          ? staffName
          : (s.name || s.full_name || "Vacant").replace(
              /^Vacant\s*[—-]\s*/i,
              "",
            ),
      employmentTypeNormalized: normalized,
      _isVacantPosition: false,
    };
  });

  // FIX: Build vacantStaff from the embedded vacant slots in the staff array
  const vacantStaff = vacantSlots.map((v) => ({
    ...v,
    name: (
      v.name ||
      v.positionTitle ||
      v.position_title ||
      v.title ||
      "Vacant Position"
    ).replace(/^Vacant\s*[—-]\s*/i, ""),
    employmentTypeNormalized: "vacant",
    role:
      v.role || v.positionTitle || v.position_title || v.title || "Position",
    employmentType: "Vacant",
    image: null,
    _isVacantPosition: true,
  }));

  const allMembers = [...staff, ...vacantStaff];

  const [showStaff, setShowStaff] = useState(false);
  const [filterType, setFilterType] = useState("All");

  const handleOpenChange = (isOpen) => {
    if (!isOpen) {
      setShowStaff(false);
      setFilterType("All");
      onClose();
    }
  };

  const staffCounts = useMemo(() => {
    const counts = {
      Plantilla: 0,
      "Contract of Service": 0,
      Consultant: 0,
      Vacant: 0,
    };

    staff.forEach((s) => {
      const type = s.employmentTypeNormalized;
      if (type.includes("plantilla")) counts.Plantilla++;
      else if (type.includes("cos") || type.includes("contract"))
        counts["Contract of Service"]++;
      else if (type.includes("consultant")) counts.Consultant++;
      else counts.Vacant++;
    });

    counts.Vacant += vacantStaff.length;

    return counts;
  }, [staff, vacantStaff]);

  const legendColors = {
    Plantilla: "bg-green-100 text-green-800",
    "Contract of Service": "bg-orange-100 text-orange-800",
    Consultant: "bg-violet-100 text-violet-800",
    Vacant: "bg-gray-500 text-white",
  };

  const filteredStaff = useMemo(() => {
    if (filterType === "All") return allMembers;

    return allMembers.filter((s) => {
      if (s._isVacantPosition) return filterType === "Vacant";

      const type = s.employmentTypeNormalized;
      if (filterType === "Plantilla") return type.includes("plantilla");
      if (filterType === "Contract of Service")
        return type.includes("cos") || type.includes("contract");
      if (filterType === "Consultant") return type.includes("consultant");
      if (filterType === "Vacant")
        return (
          !type.includes("plantilla") &&
          !type.includes("cos") &&
          !type.includes("contract") &&
          !type.includes("consultant")
        );
      return true;
    });
  }, [allMembers, filterType]);

  const avatar = data.image || DEFAULT_IMG;
  const hasMembers = allMembers.length > 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-full max-w-[90vw] md:max-w-xl p-6 bg-white rounded-2xl shadow-xl">
        <div className="mx-auto w-full max-w-6xl">
          <DialogHeader className="flex flex-col items-center text-center space-y-3">
            <div
              className="rounded-full p-1 shadow-lg"
              style={{ backgroundColor: borderColor }}
            >
              <img
                src={avatar}
                alt={fullName}
                className="w-28 h-28 rounded-full object-cover"
                onError={(e) => {
                  e.target.src = DEFAULT_IMG;
                }}
              />
            </div>

            <DialogTitle className="text-2xl font-extrabold">
              {fullName}
            </DialogTitle>

            {data.role && (
              <div className="text-sm font-semibold text-gray-700">
                {data.role}
                {data.department ? `, ${data.department}` : ""}
              </div>
            )}

            {data.employmentType && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FaIdBadge />
                {data.employmentType}
              </div>
            )}

            {(data.is_vacant_head || data.is_vacant_slot) && (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                Vacant
              </span>
            )}
          </DialogHeader>

          {hasMembers && (
            <>
              <div className="flex justify-center gap-2 overflow-x-auto py-2">
                {[
                  "All",
                  "Plantilla",
                  "Contract of Service",
                  "Consultant",
                  "Vacant",
                ].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`text-[10px] px-3 py-1 rounded-full font-semibold transition ${
                      type === filterType
                        ? "ring-2 ring-blue-500 " +
                          (legendColors[type] || "bg-gray-100 text-gray-800")
                        : legendColors[type] || "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {type === "All"
                      ? `All (${allMembers.length})`
                      : `${type}: ${staffCounts[type]}`}
                  </button>
                ))}
              </div>

              <div className="rounded-xl overflow-hidden shadow-sm">
                <button
                  onClick={() => setShowStaff((p) => !p)}
                  className="w-full flex justify-between px-4 py-3 bg-gray-100 font-semibold"
                >
                  <span>Staff List ({filteredStaff.length})</span>
                  {showStaff ? <FaChevronUp /> : <FaChevronDown />}
                </button>

                {showStaff && (
                  <div
                    className={`divide-y overflow-y-auto ${
                      filteredStaff.length > 6 ? "max-h-64" : ""
                    }`}
                  >
                    {filteredStaff.length === 0 ? (
                      <div className="px-4 py-6 text-center text-sm text-gray-400">
                        No members in this category.
                      </div>
                    ) : (
                      filteredStaff.map((s, idx) => {
                        let typeKey = "Vacant";
                        if (!s._isVacantPosition) {
                          const type = s.employmentTypeNormalized;
                          if (type.includes("plantilla")) typeKey = "Plantilla";
                          else if (
                            type.includes("cos") ||
                            type.includes("contract")
                          )
                            typeKey = "Contract of Service";
                          else if (type.includes("consultant"))
                            typeKey = "Consultant";
                        }

                        const staffAvatar = s._isVacantPosition
                          ? null
                          : s.image || DEFAULT_IMG;

                        return (
                          <div
                            key={idx}
                            className={`flex items-center justify-between px-2 py-2 hover:bg-gray-50 ${
                              s._isVacantPosition ? "opacity-70" : ""
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {staffAvatar ? (
                                <img
                                  src={staffAvatar}
                                  alt={s.name}
                                  className="w-8 h-8 rounded-full object-cover"
                                  onError={(e) => {
                                    e.target.src = DEFAULT_IMG;
                                  }}
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                  <span className="text-gray-400 text-xs font-bold">
                                    ?
                                  </span>
                                </div>
                              )}

                              <div className="flex flex-col">
                                <span
                                  className={`text-sm font-medium ${
                                    s._isVacantPosition
                                      ? "text-gray-400 italic"
                                      : ""
                                  }`}
                                >
                                  {s.name}
                                </span>
                                {s.role && s.role.toUpperCase() !== "STAFF" && (
                                  <span className="text-xs text-muted-foreground">
                                    {s.role}
                                  </span>
                                )}
                              </div>
                            </div>

                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full ${legendColors[typeKey]}`}
                            >
                              {s._isVacantPosition
                                ? "Vacant"
                                : s.employmentType || "Vacant"}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

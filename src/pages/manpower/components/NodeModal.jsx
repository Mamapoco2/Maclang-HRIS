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

export default function NodeModal({ open, onClose, node }) {
  const data = node?.data || {};
  const borderColor = resolveBorderColor(data);
  const staffRaw = data?.staff || [];

  // =============================
  // Build Full Name Properly
  // =============================
  const cleanPrefix = data.prefix ? data.prefix.replace(/\.$/, "") : null;

  const fullName =
    [
      cleanPrefix ? cleanPrefix + "." : null,
      data.first_name,
      data.middle_name ? data.middle_name.charAt(0) + "." : null,
      data.last_name,
    ]
      .filter(Boolean)
      .join(" ") +
    (data.suffix ? ", " + data.suffix : "") +
    (data.title ? ", " + data.title : "");

  // =============================
  // Normalize Staff
  // =============================
  const staff = staffRaw.map((s) => {
    const normalized = s.employmentType
      ? s.employmentType.toLowerCase()
      : "vacant";

    const staffName =
      [
        s?.prefix,
        s?.first_name,
        s?.middle_name ? s.middle_name.charAt(0) + "." : null,
        s?.last_name,
      ]
        .filter(Boolean)
        .join(" ") +
      (s?.suffix ? ", " + s.suffix : "") +
      (s?.title ? ", " + s.title : "");

    return {
      ...s,
      name: s.employeeId && staffName ? staffName : "Vacant",
      employmentTypeNormalized: normalized,
    };
  });

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

    return counts;
  }, [staff]);

  const legendColors = {
    Plantilla: "bg-green-100 text-green-800",
    "Contract of Service": "bg-orange-100 text-orange-800",
    Consultant: "bg-violet-100 text-violet-800",
    Vacant: "bg-gray-500 text-white",
  };

  const filteredStaff = useMemo(() => {
    if (filterType === "All") return staff;

    return staff.filter((s) => {
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
  }, [staff, filterType]);

  // Resolve avatar — prefer data.image, fall back to DEFAULT_IMG
  const avatar = data.image || DEFAULT_IMG;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-full max-w-[90vw] md:max-w-xl p-6 bg-white rounded-2xl shadow-xl">
        <div className="mx-auto w-full max-w-6xl">
          <DialogHeader className="flex flex-col items-center text-center space-y-3">
            {/* Avatar — always shown, falls back to default */}
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
          </DialogHeader>

          {staff.length > 0 && (
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
                      ? `All (${staff.length})`
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
                    {filteredStaff.map((s, idx) => {
                      let typeKey = "Vacant";
                      const type = s.employmentTypeNormalized;

                      if (type.includes("plantilla")) typeKey = "Plantilla";
                      else if (
                        type.includes("cos") ||
                        type.includes("contract")
                      )
                        typeKey = "Contract of Service";
                      else if (type.includes("consultant"))
                        typeKey = "Consultant";

                      const staffAvatar = s.image || DEFAULT_IMG;

                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between px-2 py-2 hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-2">
                            <img
                              src={staffAvatar}
                              alt={s.name}
                              className="w-8 h-8 rounded-full object-cover"
                              onError={(e) => {
                                e.target.src = DEFAULT_IMG;
                              }}
                            />
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">
                                {s.name}
                              </span>
                              {s.role && (
                                <span className="text-xs text-muted-foreground">
                                  {s.role}
                                </span>
                              )}
                            </div>
                          </div>

                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full ${legendColors[typeKey]}`}
                          >
                            {s.employmentType || "Vacant"}
                          </span>
                        </div>
                      );
                    })}
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

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { resolveBorderColor } from "../../../services/utils";
import { buildFullName } from "./useFormat";
import { FaIdBadge, FaChevronDown, FaChevronUp } from "react-icons/fa";

export default function NodeModal({ open, onClose, node }) {
  const borderColor = resolveBorderColor(node?.data);

  const staffRaw = node?.data?.staff || [];

  // Normalize employmentType for filtering and handle new/ENW positions
  const staff = staffRaw.map((s) => ({
    ...s,
    // If name exists, use it; otherwise use position title
    name: s.firstName || s.lastName ? buildFullName(s) : s.position || "Vacant",
    // If employmentType exists, normalize it; otherwise mark as 'new' (vices)
    employmentTypeNormalized: s.employmentType
      ? s.employmentType.toLowerCase()
      : "new", // treat empty/new positions as Vices
  }));

  const [showStaff, setShowStaff] = useState(false);
  const [filterType, setFilterType] = useState("All");

  const handleOpenChange = (isOpen) => {
    if (!isOpen) {
      setShowStaff(false);
      setFilterType("All");
      onClose();
    }
  };

  // Compute counts for badges
  const staffCounts = useMemo(() => {
    const counts = {
      Plantilla: 0,
      "Contract of Service": 0,
      Consultant: 0,
      Vacant: 0, // include ENW/new positions here
    };

    staff.forEach((s) => {
      const type = s.employmentTypeNormalized;
      if (type.includes("plantilla")) counts.Plantilla++;
      else if (type.includes("cos") || type.includes("contract"))
        counts["Contract of Service"]++;
      else if (type.includes("consultant")) counts.Consultant++;
      else counts.Vacant++; // ENW / new positions counted here
    });

    return counts;
  }, [staff]);

  const legendColors = {
    Plantilla: "bg-green-100 text-green-800",
    "Contract of Service": "bg-orange-100 text-orange-800",
    Consultant: "bg-violet-100 text-violet-800",
    Vacant: "bg-gray-500 text-white",
  };

  const fullName = buildFullName(node?.data);

  // Filter staff based on selected type
  const filteredStaff = useMemo(() => {
    if (filterType === "All") return staff;

    return staff.filter((s) => {
      const type = s.employmentTypeNormalized;
      switch (filterType) {
        case "Plantilla":
          return type.includes("plantilla");
        case "Contract of Service":
          return (
            type.includes("cos") ||
            type.includes("contract") ||
            type.includes("new")
          );
        case "Consultant":
          return type.includes("consultant");
        case "Vacant":
          return (
            !type.includes("plantilla") &&
            !type.includes("cos") &&
            !type.includes("contract") &&
            !type.includes("consultant") &&
            !type.includes("new")
          );
        default:
          return true;
      }
    });
  }, [staff, filterType]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-full max-w-[90vw] md:max-w-xl p-6 bg-white rounded-2xl shadow-xl">
        <div className="mx-auto w-full max-w-6xl">
          <DialogHeader className="flex flex-col items-center text-center space-y-3">
            {node?.data?.image && (
              <div
                className="rounded-full p-1 shadow-lg"
                style={{ backgroundColor: borderColor }}
              >
                <img
                  src={node.data.image}
                  alt={fullName}
                  className="w-28 h-28 rounded-full object-cover"
                />
              </div>
            )}

            <DialogTitle className="text-2xl font-extrabold">
              {fullName}
            </DialogTitle>

            {node?.data?.role && (
              <div className="text-sm text-muted-foreground">
                {node.data.role}
              </div>
            )}

            {node?.data?.employmentType && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FaIdBadge />
                {node.data.employmentType}
              </div>
            )}
          </DialogHeader>

          {staff.length > 0 && (
            <>
              {/* Badge container */}
              <div className="flex justify-center gap-2 whitespace-nowrap overflow-x-auto py-2">
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
                    className={`text-[10px] px-3 py-1 rounded-full font-semibold transition whitespace-nowrap
                        ${
                          type === filterType
                            ? "ring-2 ring-blue-500 " +
                              (legendColors[type] ||
                                "bg-gray-100 text-gray-800")
                            : legendColors[type] || "bg-gray-100 text-gray-800"
                        }`}
                    style={{ minWidth: "max-content" }}
                  >
                    {type === "All"
                      ? `All (${staff.length})`
                      : `${type}: ${staffCounts[type]}`}
                  </button>
                ))}
              </div>

              {/* Staff list toggle */}
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
                      const empType = s.employmentTypeNormalized;

                      if (empType.includes("plantilla")) typeKey = "Plantilla";
                      else if (
                        empType.includes("cos") ||
                        empType.includes("contract") ||
                        empType.includes("new")
                      )
                        typeKey = "Contract of Service";
                      else if (empType.includes("consultant"))
                        typeKey = "Consultant";

                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between px-2 py-1 hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-2">
                            {s.image && (
                              <img
                                src={s.image}
                                alt={s.name}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            )}
                            <div className="flex gap-2">
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

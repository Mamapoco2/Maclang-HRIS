// src/pages/manpower/components/manpower/DepartmentCard.jsx
import { useState } from "react";
import { ChevronDown, Users, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import EmployeeCard from "./EmployeeCard";
import StaffModal from "./StaffModal";
import VacantPositionsSection from "./VacantPositionsSection";

const DEFAULT_IMG = "https://cdn-icons-png.flaticon.com/512/147/147144.png";

const ROLE_LABELS = {
  CHIEF: "Chief",
  DIRECTOR: "Director",
  "ASSISTANT DIRECTOR": "Assistant Director",
  "OFFICER IN CHARGE": "Officer-in-Charge",
  OIC: "Officer-in-Charge",
  CHAIRMAN: "Chairman",
  HEAD: "Head",
  SUPERVISOR: "Supervisor",
};

const SLOT_COLORS = {
  CHIEF: "border-l-purple-500 bg-purple-50 dark:bg-purple-950/20",
  DIRECTOR: "border-l-blue-500 bg-blue-50 dark:bg-blue-950/20",
  "ASSISTANT DIRECTOR": "border-l-sky-500 bg-sky-50 dark:bg-sky-950/20",
  "OFFICER IN CHARGE": "border-l-amber-500 bg-amber-50 dark:bg-amber-950/20",
  OIC: "border-l-amber-500 bg-amber-50 dark:bg-amber-950/20",
  CHAIRMAN: "border-l-violet-500 bg-violet-50 dark:bg-violet-950/20",
  HEAD: "border-l-green-500 bg-green-50 dark:bg-green-950/20",
  SUPERVISOR: "border-l-teal-500 bg-teal-50 dark:bg-teal-950/20",
};

function VacantSlot({ role }) {
  const label = ROLE_LABELS[role] ?? role;
  const colors =
    SLOT_COLORS[role] ?? "border-l-gray-400 bg-gray-50 dark:bg-gray-900/20";
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 border-l-4 ${colors}`}
    >
      <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0 flex items-center justify-center">
        <UserX className="h-5 w-5 text-gray-400 dark:text-gray-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
          {label}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 italic">
          Position vacant
        </p>
      </div>
      <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border border-dashed border-gray-300 dark:border-gray-600 font-medium">
        VACANT
      </span>
    </div>
  );
}

function FilledSlot({ employee, role }) {
  const label = ROLE_LABELS[role] ?? role;
  const colors =
    SLOT_COLORS[role] ?? "border-l-gray-400 bg-gray-50 dark:bg-gray-900/20";
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 border-l-4 ${colors}`}
    >
      <img
        src={employee.avatar_url || DEFAULT_IMG}
        alt={employee.full_name}
        onError={(e) => {
          e.target.src = DEFAULT_IMG;
        }}
        className="h-10 w-10 rounded-full object-cover flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
          {label}
        </p>
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
          {employee.full_name}
        </p>
        {employee.employment_type && (
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
            {employee.employment_type}
          </p>
        )}
      </div>
      <span
        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
          (employee.employment_status ?? "").toLowerCase() === "active"
            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
            : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
        }`}
      >
        {(employee.employment_status ?? "active").toUpperCase()}
      </span>
    </div>
  );
}

export default function DepartmentCard({
  department,
  borderColor = "border-blue-300",
  bgColor = "bg-blue-50",
}) {
  const [staffModalOpen, setStaffModalOpen] = useState(false);

  if (!department) return null;

  const {
    name,
    type,
    head,
    leadership_slots = [], // ← from ManpowerMappingController (fixed)
    staff = [],
    staff_count = 0,
    vacant_count = 0,
    unfilled_count = 0,
  } = department;

  const filledCount = leadership_slots.filter(
    (s) => s.employee !== null,
  ).length;
  const vacantSlotCount = leadership_slots.filter(
    (s) => s.employee === null,
  ).length;

  return (
    <div
      className={`${bgColor} border-2 ${borderColor} rounded-xl p-4 space-y-4`}
    >
      {/* Header */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 uppercase leading-tight">
          {name}
        </h3>
        {type && type !== "DEPARTMENT" && (
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium mt-0.5 tracking-wider">
            {type}
          </p>
        )}
        <div className="flex flex-wrap gap-3 mt-1.5">
          {filledCount > 0 && (
            <span className="text-[11px] text-gray-600 dark:text-gray-400">
              {filledCount} leadership
            </span>
          )}
          {vacantSlotCount > 0 && (
            <span className="text-[11px] text-amber-600 dark:text-amber-400">
              {vacantSlotCount} vacant slot{vacantSlotCount !== 1 ? "s" : ""}
            </span>
          )}
          {staff_count > 0 && (
            <span className="text-[11px] text-gray-600 dark:text-gray-400">
              {staff_count} staff
            </span>
          )}
          {filledCount === 0 && vacantSlotCount === 0 && staff_count === 0 && (
            <span className="text-[11px] text-gray-400 dark:text-gray-500 italic">
              No employees assigned
            </span>
          )}
        </div>
      </div>

      {/* Department Head (departments.head_employee_id) */}
      {head && (
        <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border-l-4 border-green-500">
          <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider mb-1">
            Department Head
          </p>
          <div className="flex items-center gap-2">
            <img
              src={head.avatar_url || DEFAULT_IMG}
              alt={head.full_name}
              onError={(e) => {
                e.target.src = DEFAULT_IMG;
              }}
              className="w-8 h-8 rounded-full object-cover"
            />
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              {head.full_name}
            </p>
          </div>
        </div>
      )}

      {/* Leadership slots — always rendered even when vacant */}
      {leadership_slots.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-1">
            Leadership
          </p>
          <div className="space-y-2">
            {leadership_slots.map((slot) =>
              slot.employee ? (
                <FilledSlot
                  key={slot.role}
                  role={slot.role}
                  employee={slot.employee}
                />
              ) : (
                <VacantSlot key={slot.role} role={slot.role} />
              ),
            )}
          </div>
        </div>
      )}

      {/* Staff modal trigger */}
      {staff_count > 0 && (
        <div>
          <Button
            onClick={() => setStaffModalOpen(true)}
            variant="outline"
            className="w-full justify-between h-10"
          >
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">Staff ({staff_count})</span>
            </div>
            <ChevronDown className="h-4 w-4" />
          </Button>
          <StaffModal
            open={staffModalOpen}
            onClose={() => setStaffModalOpen(false)}
            staff={staff}
            departmentName={name}
          />
        </div>
      )}

      {/* Vacant plantilla positions */}
      {(vacant_count > 0 || unfilled_count > 0) && (
        <VacantPositionsSection
          vacantCount={vacant_count}
          unfilledCount={unfilled_count}
          positions={[]}
        />
      )}
    </div>
  );
}

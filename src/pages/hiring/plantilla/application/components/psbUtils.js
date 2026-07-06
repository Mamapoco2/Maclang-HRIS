export function candidateName(employee) {
  if (!employee) return "—";
  return (
    employee.full_name ||
    [employee.first_name, employee.last_name].filter(Boolean).join(" ") ||
    "—"
  );
}

export const STAGE_STATUS = [
  "PENDING",
  "SCHEDULED",
  "PASSED",
  "FAILED",
  "SKIPPED",
];

export const OVERALL_STATUS = [
  "PENDING",
  "SCHEDULED",
  "IN PROGRESS",
  "COMPLETED",
  "FAILED",
  "CANCELLED",
];

export const APPLICATION_STATUS_OPTIONS = [
  "Under Review",
  "Approved",
  "Rejected",
];

export const STAGE_COLORS = {
  PASSED: "text-green-600",
  COMPLETED: "text-green-600",
  SCHEDULED: "text-blue-600",
  PENDING: "text-gray-400",
  FAILED: "text-red-600",
  SKIPPED: "text-gray-400",
  CANCELLED: "text-red-600",
  "IN PROGRESS": "text-amber-600",
};

export const APPLICATION_STATUS_BG = {
  Pending: "bg-gray-100 text-gray-600 border-gray-200",
  "Under Review": "bg-amber-50 text-amber-700 border-amber-200",
  Approved: "bg-green-50 text-green-700 border-green-200",
  Rejected: "bg-red-50 text-red-700 border-red-200",
};

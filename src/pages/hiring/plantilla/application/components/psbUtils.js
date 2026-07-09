export function candidateName(employee) {
  if (!employee) return "—";
  return (
    employee.full_name ||
    [employee.first_name, employee.last_name].filter(Boolean).join(" ") ||
    "—"
  );
}

export function formatLabel(str) {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// Matches the interview status list from the notes:
// Pending -> Scheduled -> In Progress -> Passed / Failed, with
// Cancelled (+ reason) and No Show as exit states at any point.
// "SKIPPED" is kept for now since other stages/screens may already
// depend on it — remove it if it's no longer used anywhere.
export const STAGE_STATUS = [
  "PENDING",
  "SCHEDULED",
  "IN PROGRESS",
  "PASSED",
  "FAILED",
  "CANCELLED",
  "NO SHOW",
  "SKIPPED",
];

export const OVERALL_STATUS = ["PENDING", "IN PROGRESS", "COMPLETED"];

// Application review pipeline, from the notes. "Completed" is the
// positive outcome (approved); "Rejected" can happen from any stage,
// so it's kept as its own always-available exit option rather than
// slotted into the sequence.
export const APPLICATION_STATUS_OPTIONS = [
  "Initial Review/Evaluation",
  "For Initial Deliberation",
  "Scheduled for Interview",
  "For HRMPSB Compliance",
  "For HRMPSB Deliberation",
  "Completed",
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
  "NO SHOW": "text-slate-500",
};

export const APPLICATION_STATUS_BG = {
  "Initial Review/Evaluation": "bg-gray-100 text-gray-600 border-gray-200",
  "For Initial Deliberation": "bg-amber-50 text-amber-700 border-amber-200",
  "Scheduled for Interview": "bg-blue-50 text-blue-700 border-blue-200",
  "For HRMPSB Compliance": "bg-violet-50 text-violet-700 border-violet-200",
  "For HRMPSB Deliberation": "bg-orange-50 text-orange-700 border-orange-200",
  Completed: "bg-green-50 text-green-700 border-green-200",
  Rejected: "bg-red-50 text-red-700 border-red-200",
  // Kept for any records still holding the old "Pending" value.
  Pending: "bg-gray-100 text-gray-600 border-gray-200",
};

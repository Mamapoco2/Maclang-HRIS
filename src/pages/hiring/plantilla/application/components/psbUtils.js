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

export const STAGE_STATUS = [
  "PENDING",
  "SCHEDULED",
  "IN PROGRESS",
  "PASSED",
  "FAILED",
  "CANCELLED",
  "NO SHOW",
];

export const OVERALL_STATUS = ["PENDING", "IN PROGRESS", "COMPLETED"];

export const APPLICATION_STATUS_OPTIONS = [
  "Initial Review/Evaluation",
  "For Initial Deliberation",
  "Scheduled for Interview",
  "For HRMPSB Compliance",
  "For HRMPSB Deliberation",
  "Completed",
  "Rejected",
];

export const APPLICATION_PIPELINE_ORDER = {
  "Initial Review/Evaluation": 0,
  "For Initial Deliberation": 1,
  "Scheduled for Interview": 2,
  "For HRMPSB Compliance": 3,
  "For HRMPSB Deliberation": 4,
  Completed: 5,
};

export function isBackwardStatusTransition(from, to) {
  const fromRank = APPLICATION_PIPELINE_ORDER[from];
  const toRank = APPLICATION_PIPELINE_ORDER[to];
  if (fromRank === undefined || toRank === undefined) return false;
  return toRank < fromRank;
}

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
  "Posting Cancelled": "bg-slate-100 text-slate-600 border-slate-300",
  Pending: "bg-gray-100 text-gray-600 border-gray-200",
};

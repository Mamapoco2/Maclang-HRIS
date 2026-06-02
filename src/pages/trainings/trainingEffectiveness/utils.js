// ============================================================
// Utility Functions
// ============================================================

export const getStatusColor = (status) => {
  const map = {
    Completed: { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-300" },
    "On Track": { bg: "bg-sky-100 dark:bg-sky-900/30", text: "text-sky-700 dark:text-sky-300" },
    "At Risk": { bg: "bg-rose-100 dark:bg-rose-900/30", text: "text-rose-700 dark:text-rose-300" },
    "Not Started": { bg: "bg-slate-100 dark:bg-slate-700", text: "text-slate-600 dark:text-slate-300" },
  };
  return map[status] || map["Not Started"];
};

export const getGapColor = (gap) => {
  if (gap >= 4) return "text-rose-600 dark:text-rose-400 font-bold";
  if (gap >= 2) return "text-amber-600 dark:text-amber-400 font-semibold";
  return "text-emerald-600 dark:text-emerald-400";
};

export const getSentimentConfig = (sentiment) => {
  const map = {
    positive: { label: "Positive", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
    neutral: { label: "Neutral", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20" },
    negative: { label: "Negative", color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-900/20" },
  };
  return map[sentiment];
};

export const exportCSV = (data) => {
  const headers = ["Name", "Department", "Current Skill", "Required Skill", "Gap", "Training", "Status"];
  const rows = data.map((e) => [e.name, e.dept, e.current, e.required, e.gap, `"${e.training}"`, e.status]);
  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "skill_gap_report.csv";
  a.click();
  URL.revokeObjectURL(url);
};

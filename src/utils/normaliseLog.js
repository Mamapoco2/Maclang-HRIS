// ─── FIELD MAPPING ───────────────────────────────────────────────────────────
// Converts raw API log records (snake_case, Laravel-style) into the
// normalised shape the rest of the UI consumes.

const deriveModule = (a = "") => a.split(".")[0] || "SYSTEM";
const deriveEvent = (a = "") => a.split(".").slice(1).join(".") || a;

const deriveStatus = (a = "") => {
  const u = a.toUpperCase();
  if (
    u.includes("FAIL") ||
    u.includes("ERROR") ||
    u.includes("DENY") ||
    u.includes("REJECT")
  )
    return "failed";
  if (u.includes("WARN")) return "warning";
  if (u.includes("PENDING")) return "pending";
  return "success";
};

const deriveSeverity = (a = "") => {
  const u = a.toUpperCase();
  if (
    u.includes("DELETE") ||
    u.includes("SECURITY") ||
    u.includes("BREACH") ||
    u.includes("FAIL")
  )
    return "high";
  if (u.includes("PERMISSION") || u.includes("ROLE") || u.includes("KEY"))
    return "medium";
  return "low";
};

export const normaliseLog = (raw) => ({
  id: raw.id,
  userId: raw.user_id,
  username: raw.user?.username ?? `user_${raw.user_id}`,
  user: raw.user?.username ?? `user_${raw.user_id}`,
  action: raw.action,
  module: deriveModule(raw.action),
  event: deriveEvent(raw.action),
  subjectType: raw.subject_type,
  subjectId: raw.subject_id,
  subjectLabel: raw.subject_label,
  payload: raw.payload,
  ipAddress: raw.ip_address,
  userAgent: raw.user_agent,
  timestamp: raw.performed_at,
  status: deriveStatus(raw.action),
  severity: deriveSeverity(raw.action),
});

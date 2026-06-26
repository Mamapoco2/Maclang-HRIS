// ─── DATE / TIME FORMATTING ───────────────────────────────────────────────────

export const fmt = (iso) =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export const fmtFull = (iso) =>
  new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

export const fmtRel = (iso) => {
  const m = Math.floor((Date.now() - new Date(iso)) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

// ─── USER AGENT PARSING ────────────────────────────────────────────────────────

export const parseBrowser = (ua = "") => {
  if (ua.includes("PostmanRuntime")) return "Postman";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Edg")) return "Edge";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Safari")) return "Safari";
  return ua.slice(0, 30) || "Unknown";
};

export const parseOS = (ua = "") => {
  if (ua.includes("iPhone")) return "iOS";
  if (ua.includes("Android")) return "Android";
  if (ua.includes("Windows NT")) return "Windows";
  if (ua.includes("Macintosh")) return "macOS";
  if (ua.includes("X11")) return "Linux";
  return "Unknown";
};

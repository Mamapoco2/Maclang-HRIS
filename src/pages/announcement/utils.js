import { AVATAR_COLORS } from "./constants";

export function formatRelativeTime(date) {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatFullDate(date) {
  return date.toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function authorColor(id) {
  if (id === null || id === undefined) {
    return AVATAR_COLORS[0];
  }

  const normalizedId = String(id);
  const lastChar = normalizedId.charCodeAt(normalizedId.length - 1);

  return AVATAR_COLORS[lastChar % AVATAR_COLORS.length];
}

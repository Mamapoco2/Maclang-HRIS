export const DEFAULT_PER_PAGE = 10;
export const PER_PAGE_OPTIONS = Object.freeze([10, 25, 50, 100]);
export const SEARCH_MAX_LENGTH = 100;

const SUPERADMIN = "superadmin";

const ROLE_BADGE_STYLES = Object.freeze({
  "medical center chief": "bg-indigo-50 text-indigo-700 border-indigo-200",
  admin: "bg-orange-50 text-orange-700 border-orange-200",
  chairman: "bg-rose-50 text-rose-700 border-rose-200",
  director: "bg-purple-50 text-purple-700 border-purple-200",
  hr: "bg-blue-50 text-blue-700 border-blue-200",
  head: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "officer in charge": "bg-cyan-50 text-cyan-700 border-cyan-200",
  supervisor: "bg-amber-50 text-amber-700 border-amber-200",
  staff: "bg-gray-100 text-gray-600 border-gray-200",
});

const DEFAULT_BADGE = "bg-gray-100 text-gray-600 border-gray-200";

const AVATAR_STYLES = Object.freeze([
  "bg-indigo-50 text-indigo-600",
  "bg-violet-50 text-violet-600",
  "bg-sky-50 text-sky-600",
  "bg-teal-50 text-teal-600",
  "bg-amber-50 text-amber-700",
  "bg-rose-50 text-rose-600",
]);

export const EMPTY_META = Object.freeze({
  currentPage: 1,
  lastPage: 1,
  perPage: DEFAULT_PER_PAGE,
  total: 0,
});

// ── Query building ─────────────────────────────────────────────────────

const toPositiveInt = (value, fallback) => {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : fallback;
};

export function buildUserListParams({
  page = 1,
  perPage = DEFAULT_PER_PAGE,
  search = "",
  role = "",
} = {}) {
  const params = {
    page: toPositiveInt(page, 1),
    per_page: Math.min(toPositiveInt(perPage, DEFAULT_PER_PAGE), 100),
  };

  const trimmedSearch = String(search ?? "")
    .trim()
    .slice(0, SEARCH_MAX_LENGTH);
  if (trimmedSearch) params.search = trimmedSearch;

  const trimmedRole = String(role ?? "").trim();
  if (trimmedRole) params.role = trimmedRole;

  return params;
}

// ── Response normalisation ─────────────────────────────────────────────

const toStringArray = (value) =>
  Array.isArray(value) ? value.map(String) : [];

export function normalizeUser(raw) {
  return {
    id: raw?.id,
    username: raw?.username ?? "",
    email: raw?.email ?? "",
    name: raw?.name ?? "",
    firstName: raw?.first_name ?? "",
    middleName: raw?.middle_name ?? "",
    lastName: raw?.last_name ?? "",
    approvedAt: raw?.approved_at ?? null,
    roles: toStringArray(raw?.roles),
    permissions: toStringArray(raw?.permissions),
  };
}

/** Accepts a Laravel paginated resource: { data: [...], meta: {...} }. */
export function normalizeUserListResponse(payload) {
  const rows = Array.isArray(payload?.data) ? payload.data : [];
  const meta = payload?.meta ?? {};

  const perPage = toPositiveInt(meta.per_page, DEFAULT_PER_PAGE);

  return {
    users: rows.filter((r) => r && r.id != null).map(normalizeUser),
    meta: {
      currentPage: toPositiveInt(meta.current_page, 1),
      lastPage: toPositiveInt(meta.last_page, 1),
      perPage,
      total: Number.isInteger(meta.total) && meta.total >= 0 ? meta.total : 0,
    },
  };
}

// ── Display helpers ────────────────────────────────────────────────────

export function formatUserName(user) {
  const last = user?.lastName?.trim();
  const given = [user?.firstName, user?.middleName]
    .map((p) => p?.trim())
    .filter(Boolean)
    .join(" ");

  if (last && given) return `${last}, ${given}`;
  if (last || given) return last || given;

  const name = user?.name?.trim();
  if (name && name !== user?.username) return name;

  return null;
}

export function getInitials(user) {
  const source = (user?.username || user?.email || "?").trim();
  return source.slice(0, 2).toUpperCase();
}

export function getCurrentRoleName(user) {
  return (
    user?.roles?.find((r) => String(r).toLowerCase() !== SUPERADMIN) ?? null
  );
}

export function getRoleBadgeClass(roleName) {
  return (
    ROLE_BADGE_STYLES[String(roleName ?? "").toLowerCase()] ?? DEFAULT_BADGE
  );
}

export function avatarStyle(seed = "") {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_STYLES[Math.abs(hash) % AVATAR_STYLES.length];
}

// ── Pagination ─────────────────────────────────────────────────────────

export function getVisiblePages(page, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (page <= 4) return [1, 2, 3, 4, 5, "...", totalPages];
  if (page >= totalPages - 3) {
    return [
      1,
      "...",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }
  return [1, "...", page - 1, page, page + 1, "...", totalPages];
}

// ── Errors ─────────────────────────────────────────────────────────────

export function isRequestCanceled(err) {
  return err?.code === "ERR_CANCELED" || err?.name === "CanceledError";
}

export function getApiErrorMessage(err, fallback = "Something went wrong.") {
  const data = err?.response?.data;

  const errors = data?.errors;
  if (errors && typeof errors === "object") {
    const first = Object.values(errors).flat()[0];
    if (typeof first === "string" && first) return first;
  }

  if (typeof data?.message === "string" && data.message) return data.message;

  return fallback;
}

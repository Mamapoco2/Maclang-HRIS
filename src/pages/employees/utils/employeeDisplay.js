// Display-only helpers shared by the table, the profile dialog and the form.
// Nothing in here changes data that is sent to the API.

const ROMAN_SUFFIXES = new Set(["II", "III", "IV"]);

// "JUAN DELA CRUZ" -> "Juan Dela Cruz". Records are stored in capitals, which
// is hard to read in a long list, so names are title-cased for display only.
export const toTitleCase = (value) => {
  if (!value) return "";
  return String(value)
    .trim()
    .split(/\s+/)
    .map((token) => {
      if (ROMAN_SUFFIXES.has(token.toUpperCase())) return token.toUpperCase();
      return token
        .toLowerCase()
        .replace(/(^|[-'.])([a-z])/g, (_, edge, ch) => edge + ch.toUpperCase());
    })
    .join(" ");
};

export const formatRole = (role) =>
  (Array.isArray(role) ? role : [role])
    .filter(Boolean)
    .join(", ");

export const getDeptNames = (emp, { fallbackToIds = false } = {}) => {
  if (Array.isArray(emp.departments) && emp.departments.length > 0)
    return emp.departments.map((d) => d.name).filter(Boolean);
  if (emp.department?.name) return [emp.department.name];
  if (
    fallbackToIds &&
    Array.isArray(emp.department_ids) &&
    emp.department_ids.length > 0
  )
    return emp.department_ids.map((id) => `Dept #${id}`);
  return [];
};

export const getEmployeeStatus = (emp) => {
  const manual = emp.employment_status?.toUpperCase();
  if (manual === "RESIGN") return "Resign";
  if (manual === "INACTIVE") return "Inactive";
  if (manual === "ACTIVE") return "Active";
  const infoStatus = emp.info?.status;
  if (!infoStatus || infoStatus === "EMPTY") return "Inactive";
  return "Active";
};

export const getAvatarUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http") || url.startsWith("blob:")) return url;
  return `${import.meta.env.VITE_API_BASE_URL?.replace("/api", "") ?? "http://localhost:8000"}/storage/${url}`;
};

export const formatDate = (value, month = "long") => {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-PH", {
    year: "numeric",
    month,
    day: "numeric",
  });
};

export const formatCurrency = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const cleaned =
    typeof value === "string" ? value.replace(/[^0-9.-]/g, "") : value;
  if (cleaned === "") return null;
  const n = Number(cleaned);
  return Number.isFinite(n)
    ? `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`
    : null;
};

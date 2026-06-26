import { STATUS_STYLES, SEVERITY_STYLES } from "../../../utils/constants";

export const Badge = ({ children, className = "" }) => (
  <span
    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${className}`}
  >
    {children}
  </span>
);

export const StatusBadge = ({ status }) => (
  <Badge className={STATUS_STYLES[status] || STATUS_STYLES.pending}>
    {status.charAt(0).toUpperCase() + status.slice(1)}
  </Badge>
);

export const SeverityBadge = ({ severity }) => (
  <Badge className={SEVERITY_STYLES[severity] || SEVERITY_STYLES.low}>
    {severity.charAt(0).toUpperCase() + severity.slice(1)}
  </Badge>
);

export const Skeleton = ({ className = "" }) => (
  <div
    className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded ${className}`}
  />
);

export const Avatar = ({ name = "?", size = "sm" }) => {
  const initials = name
    .split(/[._\s]/)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const colors = [
    "bg-violet-500",
    "bg-blue-500",
    "bg-emerald-500",
    "bg-amber-500",
    "bg-rose-500",
    "bg-cyan-500",
  ];
  return (
    <div
      className={`${size === "sm" ? "w-7 h-7 text-xs" : "w-9 h-9 text-sm"} ${colors[name.charCodeAt(0) % colors.length]} rounded-full flex items-center justify-center text-white font-semibold shrink-0`}
    >
      {initials}
    </div>
  );
};

export const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-md shrink-0 mt-0.5">
      <Icon className="w-3.5 h-3.5 text-slate-500" />
    </div>
    <div className="min-w-0">
      <div className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">
        {label}
      </div>
      <div className="text-sm text-slate-800 dark:text-slate-200 font-medium break-all">
        {value ?? "—"}
      </div>
    </div>
  </div>
);

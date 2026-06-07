// src/hooks/useFirstAccessibleRoute.js
import { useContext } from "react";
import { AuthContext } from "@/context/authContext";

// All routes with their required permissions (same order as your sidebar/menu)
const ROUTE_PERMISSION_MAP = [
  { path: "/dashboard", permission: "dashboard.view" },
  { path: "/employees", permission: "employees.view" },
  { path: "/analytics", permission: "analytics.view" },
  { path: "/trainings", permission: "trainings.view" },
  { path: "/accounts", permission: "accounts.view" },
  { path: "/hiring/plantilla/applications", permission: "hiring.view" },
  { path: "/hiring/plantilla/applicants", permission: "hiring.view" },
  { path: "/hiring/plantilla/onboarding", permission: "hiring.view" },
  { path: "/leaveDashboard", permission: "leave.view" },
  { path: "/leaveApproval", permission: null },
  { path: "/leaveBalance", permission: null },
  { path: "/leaveCalendar", permission: null },
  { path: "/leaveRequest", permission: null },
  { path: "/NewLeaveRequest", permission: null },
  { path: "/team", permission: "team.view" },
  { path: "/inbox", permission: "announcements.view" },
  { path: "/forward", permission: "announcements.view" },
  { path: "/sent", permission: "announcements.view" },
  { path: "/manpower", permission: "manpower.view" },
  { path: "/IPCR", permission: "spms.view" },
  { path: "/OPCR", permission: "spms.view" },
  { path: "/MFO", permission: "spms.view" },
  { path: "/PerformancePeriod", permission: "spms.view" },
  { path: "/departments", permission: "departments.view" },
  { path: "/plantillaItems", permission: "plantilla_items.view" },
  { path: "/updates", permission: null },
  { path: "/settings", permission: null },
  { path: "/TopDepartment", permission: null },
  { path: "/TopHospital", permission: null },
  { path: "/trainingEffectiveness", permission: null },
  { path: "/COSList", permission: null },
  { path: "/ConsultantList", permission: null },
  { path: "/Orientation", permission: null },
  { path: "/skillGapAnalysis", permission: null },
];

const SUPER_ROLES = [
  "superadmin",
  "super-admin",
  "admin",
  "director",
  "hr",
  "head",
  "supervisor",
];

export function useFirstAccessibleRoute(fallback = "/status/403") {
  const { user } = useContext(AuthContext);

  const userRoles = (user?.roles ?? []).map((r) => String(r).toLowerCase());
  const isSuperUser = userRoles.some((r) => SUPER_ROLES.includes(r));
  const userPermissions = user?.permissions ?? [];

  const firstRoute = ROUTE_PERMISSION_MAP.find(({ permission }) => {
    if (!permission) return true; // no permission needed → accessible
    if (isSuperUser) return true; // super user → all accessible
    return userPermissions.includes(permission);
  });

  return firstRoute?.path ?? fallback;
}

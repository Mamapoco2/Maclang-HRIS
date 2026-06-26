import { useContext } from "react";
import { AuthContext } from "@/context/authContext";

const ROUTE_PERMISSION_MAP = [
  { path: "/dashboard", permission: "dashboard.view" },
  { path: "/hiring/plantilla/applicants", permission: "hiring.view" },
  { path: "/hiring/plantilla/applications", permission: "hiring.view" },
  { path: "/hiring/plantilla/onboarding", permission: "hiring.view" },
  { path: "/leaveDashboard", permission: "leave.view" },
  { path: "/leaveApproval", permission: "leave.view" },
  { path: "/leaveBalance", permission: "leave.view" },
  { path: "/leaveCalendar", permission: "leave.view" },
  { path: "/leaveRequest", permission: "leave.view" },
  { path: "/NewLeaveRequest", permission: "leave.view" },
  { path: "/employees", permission: "employees.view" },
  { path: "/team", permission: "team.view" },
  { path: "/orientationMonitoring", permission: "orientation.view" },
  { path: "/trainings", permission: "trainings.view" },
  { path: "/skillGapAnalysis", permission: "trainings.skill_gap" },
  { path: "/trainingEffectiveness", permission: "trainings.effectiveness" },
  { path: "/IPCR", permission: "spms.view" },
  { path: "/OPCR", permission: "spms.view" },
  { path: "/PerformancePeriod", permission: "spms.view" },
  { path: "/accounts", permission: "accounts.view" },
  { path: "/departments", permission: "departments.view" },
  { path: "/plantillaItems", permission: "plantilla_items.view" },
  { path: "/COSList", permission: "positions.view" },
  { path: "/ConsultantList", permission: "positions.view" },
  { path: "/TopHospital", permission: "rewards.view" },
  { path: "/TopDepartment", permission: "rewards.view" },
  { path: "/analytics", permission: "analytics.view" },
  { path: "/inbox", permission: "announcements.view" },
  { path: "/forward", permission: "announcements.view" },
  { path: "/sent", permission: "announcements.view" },
  { path: "/manpower", permission: "manpower.view" },
  { path: "/task-monitoring", permission: "manpower.view" },
  { path: "/bug-reports", permission: "bug-reports.view" },
  { path: "/release-manager", permission: "accounts.manage" },
  { path: "/updates", permission: null },
  { path: "/settings", permission: null },
];

const SUPER_ROLES = ["superadmin", "super-admin"];

export function useFirstAccessibleRoute(fallback = "/status/403") {
  const { user } = useContext(AuthContext);

  const userRoles = (user?.roles ?? []).map((r) => String(r).toLowerCase());
  const isSuperUser = userRoles.some((r) => SUPER_ROLES.includes(r));
  const userPermissions = user?.permissions ?? [];

  const firstRoute = ROUTE_PERMISSION_MAP.find(({ permission }) => {
    if (!permission) return true;
    if (isSuperUser) return true;
    return userPermissions.includes(permission);
  });

  return firstRoute?.path ?? fallback;
}

import { useContext } from "react";
import { AuthContext } from "@/context/authContext";

const ROUTE_PERMISSION_MAP = [
  { path: "/Announcement", permission: "announcements.view" },

  { path: "/dashboard", permission: "dashboard.view" },

  {
    path: "/hiring/plantilla/positions",
    permission: "hiring.plantilla.postings.view",
  },
  {
    path: "/hiring/plantilla/applications",
    permission: "hiring.plantilla.applications.view",
  },
  {
    path: "/hiring/plantilla/onboarding",
    permission: "hiring.plantilla.onboarding.view",
  },
  { path: "/hiring/plantilla/calendar", permission: "hiring.view" },
  { path: "/hiring/plantilla/my-applications", permission: "hiring.view" },

  {
    path: "/hiring/non-plantilla/applicants",
    permission: "hiring.nonplantilla.applicants.view",
  },
  {
    path: "/hiring/non-plantilla/applications",
    permission: "hiring.nonplantilla.applications.view",
  },
  {
    path: "/hiring/non-plantilla/onboarding",
    permission: "hiring.nonplantilla.onboarding.view",
  },

  { path: "/leaveDashboard", permission: "leave.dashboard.view" },
  { path: "/leaveApproval", permission: "leave.approval.view" },
  { path: "/leaveBalance", permission: "leave.balance.view" },
  { path: "/leaveCalendar", permission: "leave.calendar.view" },
  { path: "/leaveRequest", permission: "leave.request.view" },
  { path: "/NewLeaveRequest", permission: "leave.request.manage" },

  { path: "/employees", permission: "employees.view" },
  { path: "/renewals", permission: "renewals.view" },
  { path: "/team", permission: "team.view" },
  { path: "/orientationMonitoring", permission: "orientation.view" },

  { path: "/trainings", permission: "trainings.view" },
  { path: "/skillGapAnalysis", permission: "trainings.skill_gap" },
  { path: "/trainingEffectiveness", permission: "trainings.effectiveness" },

  { path: "/IPCR", permission: "spms.view" },
  { path: "/OPCR", permission: "spms.view" },
  { path: "/MFO", permission: "spms.view" },
  { path: "/PerformancePeriod", permission: "spms.manage" },

  { path: "/accounts", permission: "accounts.view" },
  { path: "/departments", permission: "departments.view" },
  { path: "/plantillaItems", permission: "plantilla_items.view" },
  { path: "/COSList", permission: "positions.view" },
  { path: "/ConsultantList", permission: "positions.view" },

  { path: "/TopHospital", permission: "rewards.view" },
  { path: "/TopDepartment", permission: "rewards.view" },

  { path: "/analytics", permission: "analytics.view" },
  { path: "/manpower", permission: "manpower.view" },

  { path: "/task-monitoring", permission: "task_monitoring.view" },

  { path: "/bug-reports", permission: "bug-reports.view" },
  { path: "/release-manager", permission: "accounts.manage" },
  { path: "/audit-logs", permission: "audit_logs.view" },
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

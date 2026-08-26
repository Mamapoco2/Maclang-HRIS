import { useContext } from "react";
import { AuthContext } from "@/context/authContext";

const ROUTE_PERMISSION_MAP = [
  { path: "/dashboard", permission: "dashboard.view" },

  { path: "/Announcement", permission: "announcements.view" },

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

  // NOTE: /updates and /settings are intentionally NOT permission-gated
  // (they're public utility pages any logged-in user can open directly).
  // They must stay OUT of this map's redirect resolution — see the
  // filter in useFirstAccessibleRoute below. Do not add `permission: null`
  // entries here expecting them to work as "always accessible" fallback
  // targets; that was the bug that caused /updates to become the default
  // redirect for users with zero permissions.
];

// Comparisons always run against a lowercased userRoles array (see below),
// so every entry here MUST be lowercase or it will never match.
const SUPER_ROLES = ["superadmin", "super-admin"];

const SUPER_USER_DEFAULT_ROUTE = "/dashboard";

// role values here are compared case-insensitively against the user's
// roles (see roleOverride below), so casing doesn't matter — write them
// however is most readable.
const ROLE_DEFAULT_ROUTE = [
  { role: "hr", path: "/Announcement", permission: "announcements.view" },
  {
    role: "superadmin",
    path: "/Announcement",
    permission: "announcements.view",
  },
];

/**
 * Resolves the first route the current user is actually allowed to land on.
 * Used as the redirect target for guards like PermissionRoute / PublicRoute
 * when the user isn't authorized for the route they tried to visit.
 *
 * IMPORTANT — ordering matters here:
 *   1. ROLE_DEFAULT_ROUTE is checked FIRST. This lets specific roles
 *      (including super-admin-flagged roles) be routed somewhere other
 *      than the generic super-user default.
 *   2. isSuperUser is checked SECOND, as a generic fallback for any
 *      super role that doesn't have its own ROLE_DEFAULT_ROUTE entry.
 *   3. ROUTE_PERMISSION_MAP is checked LAST, for everyone else.
 *
 * Checking isSuperUser before ROLE_DEFAULT_ROUTE was the earlier bug:
 * any role that satisfies SUPER_ROLES (e.g. "superadmin") short-circuited
 * straight to SUPER_USER_DEFAULT_ROUTE and its ROLE_DEFAULT_ROUTE entry
 * became unreachable dead code.
 *
 * Also: only routes with a real permission requirement are eligible to be
 * returned from ROUTE_PERMISSION_MAP. Public/utility routes (e.g.
 * /updates, /settings) are intentionally excluded from this map so a user
 * with zero permissions lands on `fallback`, not an unrelated public page.
 */
export function useFirstAccessibleRoute(fallback = "/status/403") {
  const { user } = useContext(AuthContext);

  const userRoles = (user?.roles ?? []).map((r) => String(r).toLowerCase());
  const userPermissions = user?.permissions ?? [];

  // 1. Role-specific override — checked first, before any super-user shortcut.
  const roleOverride = ROLE_DEFAULT_ROUTE.find(
    ({ role, permission }) =>
      userRoles.includes(String(role).toLowerCase()) &&
      userPermissions.includes(permission),
  );
  if (roleOverride) return roleOverride.path;

  // 2. Generic super-user fallback (only reached if no explicit override matched).
  const isSuperUser = userRoles.some((r) => SUPER_ROLES.includes(r));
  if (isSuperUser) return SUPER_USER_DEFAULT_ROUTE;

  // 3. Permission-gated routes for everyone else.
  const firstRoute = ROUTE_PERMISSION_MAP.find(
    ({ permission }) => permission && userPermissions.includes(permission),
  );

  return firstRoute?.path ?? fallback;
}

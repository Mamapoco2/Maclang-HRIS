export const PERMISSIONS = Object.freeze({
  // ── Dashboard ──────────────────────────────────────────
  DASHBOARD_VIEW: "dashboard.view",

  // ── Recruitment, Selection & Placement ────────────────
  HIRING_VIEW: "hiring.view",
  HIRING_MANAGE: "hiring.manage",

  PLANTILLA_POSTINGS_VIEW: "hiring.plantilla.postings.view",
  PLANTILLA_POSTINGS_MANAGE: "hiring.plantilla.postings.manage",

  PLANTILLA_APPLICATIONS_VIEW: "hiring.plantilla.applications.view",
  PLANTILLA_APPLICATIONS_MANAGE: "hiring.plantilla.applications.manage",

  PLANTILLA_ONBOARDING_VIEW: "hiring.plantilla.onboarding.view",
  PLANTILLA_ONBOARDING_MANAGE: "hiring.plantilla.onboarding.manage",

  NONPLANTILLA_APPLICANTS_VIEW: "hiring.nonplantilla.applicants.view",
  NONPLANTILLA_APPLICANTS_MANAGE: "hiring.nonplantilla.applicants.manage",

  NONPLANTILLA_APPLICATIONS_VIEW: "hiring.nonplantilla.applications.view",
  NONPLANTILLA_APPLICATIONS_MANAGE: "hiring.nonplantilla.applications.manage",

  NONPLANTILLA_ONBOARDING_VIEW: "hiring.nonplantilla.onboarding.view",
  NONPLANTILLA_ONBOARDING_MANAGE: "hiring.nonplantilla.onboarding.manage",

  LEAVE_DASHBOARD_VIEW: "leave.dashboard.view",
  LEAVE_APPROVAL_VIEW: "leave.approval.view",
  LEAVE_APPROVAL_MANAGE: "leave.approval.manage",
  LEAVE_BALANCE_VIEW: "leave.balance.view",
  LEAVE_CALENDAR_VIEW: "leave.calendar.view",
  LEAVE_REQUEST_VIEW: "leave.request.view",
  LEAVE_REQUEST_MANAGE: "leave.request.manage",

  EMPLOYEES_VIEW: "employees.view",
  EMPLOYEES_MANAGE: "employees.manage",

  RENEWALS_VIEW: "renewals.view",
  RENEWALS_MANAGE: "renewals.manage",

  TEAM_VIEW: "team.view",
  ORIENTATION_VIEW: "orientation.view",

  // ── Learning & Development ─────────────────────────────
  TRAININGS_VIEW: "trainings.view",
  TRAININGS_MANAGE: "trainings.manage",
  TRAININGS_JOIN: "trainings.join",
  TRAININGS_SKILL_GAP: "trainings.skill_gap",
  TRAININGS_EFFECTIVENESS: "trainings.effectiveness",
  TRAININGS_COACHING: "trainings.coaching",

  // ── SPMS ────────────────────────────────────────────────
  SPMS_VIEW: "spms.view",
  SPMS_MANAGE: "spms.manage",

  // ── Compensation & Benefits ─────────────────────────────
  COMPENSATION_VIEW: "compensation.view",
  COMPENSATION_MANAGE: "compensation.manage",

  // ── System Management ──────────────────────────────────
  ACCOUNTS_VIEW: "accounts.view",
  ACCOUNTS_MANAGE: "accounts.manage",
  DEPARTMENTS_VIEW: "departments.view",
  DEPARTMENTS_MANAGE: "departments.manage",
  PLANTILLA_ITEMS_VIEW: "plantilla_items.view",
  PLANTILLA_ITEMS_MANAGE: "plantilla_items.manage",
  POSITIONS_VIEW: "positions.view",

  // ── Rewards & Recognition ───────────────────────────────
  REWARDS_VIEW: "rewards.view",

  // ── Analytics ───────────────────────────────────────────
  ANALYTICS_VIEW: "analytics.view",

  // ── Announcements ───────────────────────────────────────
  ANNOUNCEMENTS_VIEW: "announcements.view",
  ANNOUNCEMENTS_MANAGE: "announcements.manage",
  ANNOUNCEMENTS_MANAGE_ALL: "announcements.manage.all",

  // ── Manpower Mapping ────────────────────────────────────
  MANPOWER_VIEW: "manpower.view",
  MANPOWER_MANAGE: "manpower.manage",

  // ── Task Monitoring ─────────────────────────────────────
  TASK_MONITORING_VIEW: "task_monitoring.view",

  // ── Users (RBAC administration) ────────────────────────
  USERS_VIEW: "users.view",
  USERS_MANAGE: "users.manage",
  USERS_MANAGE_ROLES: "users.manage.roles",

  // ── Notifications ───────────────────────────────────────
  NOTIFICATIONS_VIEW: "notifications.view",

  // ── Audit Logs ──────────────────────────────────────────
  AUDIT_LOGS_VIEW: "audit_logs.view",

  // ── Bug Reports ──────────────────────────────────────────
  BUG_REPORTS_VIEW: "bug-reports.view",
});

if (import.meta.env?.DEV) {
  const values = Object.values(PERMISSIONS);
  const duplicates = values.filter((v, i) => values.indexOf(v) !== i);
  if (duplicates.length > 0) {
    console.error(
      "[permissions.js] Duplicate permission values found:",
      duplicates,
    );
  }
}

export const ASSIGNABLE_ROLES = Object.freeze([
  { value: "none", label: "No role" },
  { value: "Admin", label: "Admin" },
  { value: "Chairman", label: "Chairman" },
  { value: "Director", label: "Director" },
  { value: "HR", label: "HR" },
  { value: "Officer In Charge", label: "Officer In Charge" },
  { value: "Head", label: "Head" },
  { value: "Supervisor", label: "Supervisor" },
  { value: "Staff", label: "Staff" },
]);

export const PERMISSION_GROUPS = [
  {
    group: "Dashboard",
    permissions: [{ key: "dashboard.view", label: "View Dashboard" }],
  },
  {
    group: "Employees",
    permissions: [
      { key: "employees.view", label: "View Employees" },
      { key: "employees.manage", label: "Manage Employees" },
    ],
  },
  {
    group: "Analytics",
    permissions: [{ key: "analytics.view", label: "View Analytics" }],
  },
  {
    group: "Trainings",
    permissions: [
      { key: "trainings.view", label: "View Trainings" },
      { key: "trainings.manage", label: "Manage Trainings" },
      { key: "trainings.join", label: "Join Trainings" },
    ],
  },
  {
    group: "Team",
    permissions: [{ key: "team.view", label: "View Team" }],
  },
  {
    group: "Leave",
    permissions: [
      { key: "leave.view", label: "View Leave" },
      { key: "leave.manage", label: "Manage Leave" },
      { key: "leave.approve", label: "Approve Leave" },
    ],
  },
  {
    group: "Accounts",
    permissions: [
      { key: "accounts.view", label: "View Accounts" },
      { key: "accounts.manage", label: "Manage Accounts" },
    ],
  },
  {
    group: "Departments",
    permissions: [
      { key: "departments.view", label: "View Departments" },
      { key: "departments.manage", label: "Manage Departments" },
    ],
  },
  {
    group: "Plantilla Items",
    permissions: [
      { key: "plantilla_items.view", label: "View Plantilla Items" },
      { key: "plantilla_items.manage", label: "Manage Plantilla Items" },
    ],
  },
  {
    group: "Hiring",
    permissions: [
      { key: "hiring.view", label: "View Hiring" },
      { key: "hiring.manage", label: "Manage Hiring" },
    ],
  },
  {
    group: "Announcements",
    permissions: [
      { key: "announcements.view", label: "View Announcements" },
      { key: "announcements.manage", label: "Manage Announcements" },
    ],
  },
  {
    group: "Manpower Mapping",
    permissions: [
      { key: "manpower.view", label: "View Manpower" },
      { key: "manpower.manage", label: "Manage Manpower" },
    ],
  },
  {
    group: "SPMS",
    permissions: [
      { key: "spms.view", label: "View SPMS" },
      { key: "spms.manage", label: "Manage SPMS" },
    ],
  },
  {
    group: "Users",
    permissions: [
      { key: "users.view", label: "View Users" },
      { key: "users.manage", label: "Manage Users" },
    ],
  },
  {
    group: "Notifications",
    permissions: [{ key: "notifications.view", label: "View Notifications" }],
  },
];

export const ASSIGNABLE_ROLES = [
  { value: "admin", label: "Admin" },
  { value: "director", label: "Director" },
  { value: "hr", label: "HR" },
  { value: "head", label: "Head" },
  { value: "supervisor", label: "Supervisor" },
  { value: "staff", label: "Staff" },
];

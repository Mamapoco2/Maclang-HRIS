export const PERMISSION_GROUPS = [
  {
    group: "Dashboard",
    permissions: [{ key: "dashboard.view", label: "View Dashboard" }],
  },
  {
    group: "Recruitment, Selection & Placement",
    permissions: [
      { key: "hiring.view", label: "View Hiring" },
      { key: "hiring.manage", label: "Manage Hiring" },
      { key: "leave.view", label: "View Leave" },
      { key: "leave.manage", label: "Manage Leave" },
      { key: "leave.approve", label: "Approve Leave" },
      { key: "employees.view", label: "View Employees" },
      { key: "employees.manage", label: "Manage Employees" },
      { key: "team.view", label: "View Team" },
      {
        key: "orientation.view",
        label: "View Orientation Compliance Monitoring",
      },
    ],
  },
  {
    group: "Learning & Development",
    permissions: [
      { key: "trainings.view", label: "View Trainings" },
      { key: "trainings.manage", label: "Manage Trainings" },
      { key: "trainings.join", label: "Join Trainings" },
      { key: "trainings.skill_gap", label: "Skill Gap Analysis" },
      {
        key: "trainings.effectiveness",
        label: "Training Effectiveness Analysis",
      },
      { key: "trainings.coaching", label: "Coaching & Mentoring" },
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
    group: "Compensation & Benefits",
    permissions: [
      { key: "compensation.view", label: "View Compensation & Benefits" },
    ],
  },
  {
    group: "System Management",
    permissions: [
      { key: "accounts.view", label: "View Accounts Management" },
      { key: "accounts.manage", label: "Manage Accounts / System" },
      { key: "departments.view", label: "View Departments" },
      { key: "departments.manage", label: "Manage Departments" },
      { key: "plantilla_items.view", label: "View Plantilla Items" },
      { key: "plantilla_items.manage", label: "Manage Plantilla Items" },
      { key: "positions.view", label: "View Positions (COS / Consultant)" },
    ],
  },
  {
    group: "Rewards & Recognition",
    permissions: [{ key: "rewards.view", label: "View Rewards & Recognition" }],
  },
  {
    group: "Analytics",
    permissions: [{ key: "analytics.view", label: "View Analytics" }],
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
      { key: "manpower.view", label: "View Manpower Mapping" },
      { key: "manpower.manage", label: "Manage Manpower Mapping" },
    ],
  },
  {
    group: "Task Monitoring",
    permissions: [
      { key: "task_monitoring.view", label: "View Task Monitoring" },
    ],
  },
  // {
  //   group: "Bug Reports",
  //   permissions: [{ key: "bug-reports.view", label: "View Bug Reports" }],
  // },
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

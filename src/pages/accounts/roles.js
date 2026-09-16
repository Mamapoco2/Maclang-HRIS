// Assigned server-side whenever a new employee account is created (see
// User Management > Default Role). Used here only to label it in the UI
// and to block deletion of the role from Role Management.
export const DEFAULT_ROLE_NAME = "Staff";

export const ACCESS_SCOPE = {
  ORGANIZATION: "organization",
  DEPARTMENT: "department",
};

export const ACCESS_SCOPE_LABEL = {
  [ACCESS_SCOPE.ORGANIZATION]: "All departments (organization-wide)",
  [ACCESS_SCOPE.DEPARTMENT]: "Specific department(s)",
};

const MANAGER_ROLES = ["SuperAdmin", "HR"];

export function getUserRoleNames(user) {
  if (!user || !Array.isArray(user.roles)) return [];
  return user.roles;
}

export function hasManagerAccess(user) {
  const roleNames = getUserRoleNames(user).map((r) => r.toUpperCase());
  return MANAGER_ROLES.some((r) => roleNames.includes(r.toUpperCase()));
}

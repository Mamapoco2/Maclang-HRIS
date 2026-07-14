// src/lib/authHelpers.js
export function hasPermission(user, permission) {
  if (!permission) return false;

  const userPermissions = Array.isArray(user?.permissions)
    ? user.permissions
    : [];

  return userPermissions.includes(permission);
}

export function hasAnyPermission(user, permissions) {
  if (!Array.isArray(permissions) || permissions.length === 0) return false;

  const userPermissions = Array.isArray(user?.permissions)
    ? user.permissions
    : [];

  return permissions.some((p) => userPermissions.includes(p));
}

export function hasAllPermissions(user, permissions) {
  if (!Array.isArray(permissions) || permissions.length === 0) return false;

  const userPermissions = Array.isArray(user?.permissions)
    ? user.permissions
    : [];

  return permissions.every((p) => userPermissions.includes(p));
}

//src/routes/permissionRoute.jsx
import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "@/context/authContext";
import { useFirstAccessibleRoute } from "../hooks/useFirstAccessibleRoute";

const SUPER_ROLES = ["superadmin", "super-admin"];

export default function PermissionRoute({
  permission,
  requireSuperAdmin = false,
  children,
}) {
  const { user } = useContext(AuthContext);
  const firstAccessibleRoute = useFirstAccessibleRoute();

  const userRoles = (user?.roles ?? []).map((r) => String(r).toLowerCase());
  const isSuperUser = userRoles.some((r) => SUPER_ROLES.includes(r));

  if (requireSuperAdmin) {
    return isSuperUser ? (
      children
    ) : (
      <Navigate to={firstAccessibleRoute} replace />
    );
  }

  if (isSuperUser) return children;
  if (!permission) return children;

  const userPermissions = user?.permissions ?? [];
  if (userPermissions.includes(permission)) return children;

  return <Navigate to={firstAccessibleRoute} replace />;
}

//src/routes/permissionRoute.jsx
import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "@/context/authContext";
import { useFirstAccessibleRoute } from "../hooks/useFirstAccessibleRoute";

const SUPER_ROLES = ["superadmin", "super-admin"];

export default function PermissionRoute({ permission, children }) {
  const { user } = useContext(AuthContext);
  const firstAccessibleRoute = useFirstAccessibleRoute();

  const userRoles = (user?.roles ?? []).map((r) => String(r).toLowerCase());
  const isSuperUser = userRoles.some((r) => SUPER_ROLES.includes(r));

  if (isSuperUser) return children;
  if (!permission) return children;

  const userPermissions = user?.permissions ?? [];
  if (userPermissions.includes(permission)) return children;

  // Instead of hard 403, redirect to the first route they CAN access
  return <Navigate to={firstAccessibleRoute} replace />;
}

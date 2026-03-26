import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "@/context/authContext";

export default function PermissionRoute({ permission, children }) {
  const { user } = useContext(AuthContext);

  const userRoles = (user?.roles ?? []).map((r) => String(r).toLowerCase());
  const isSuperUser = userRoles.some((r) =>
    [
      "superadmin",
      "super-admin",
      "admin",
      "director",
      "hr",
      "head",
      "supervisor",
    ].includes(r),
  );

  if (isSuperUser) return children;

  if (!permission) return children;

  const userPermissions = user?.permissions ?? [];
  if (userPermissions.includes(permission)) return children;

  return <Navigate to="/status/403" replace />;
}

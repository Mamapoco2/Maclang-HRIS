// src/components/PermissionGate.jsx
import { useContext, useMemo } from "react";
import PropTypes from "prop-types";
import { AuthContext } from "@/context/authContext";

export function PermissionGate({
  permission,
  anyOf,
  fallback = null,
  children,
}) {
  const auth = useContext(AuthContext);

  const allowed = useMemo(() => {
    if (!auth) return false;

    if (Array.isArray(anyOf) && anyOf.length > 0) {
      return anyOf.some((p) => auth.hasPermission(p));
    }
    return auth.hasPermission(permission);
  }, [auth, permission, anyOf]);

  if (!auth) {
    if (import.meta.env?.DEV) {
      console.error("PermissionGate must be used within an AuthProvider.");
    }
    return fallback;
  }

  if (import.meta.env?.DEV && !permission && (!anyOf || anyOf.length === 0)) {
    console.warn(
      "PermissionGate: no `permission` or `anyOf` prop provided — denying by default.",
    );
  }

  return allowed ? children : fallback;
}

PermissionGate.propTypes = {
  permission: PropTypes.string,
  anyOf: PropTypes.arrayOf(PropTypes.string),
  fallback: PropTypes.node,
  children: PropTypes.node.isRequired,
};

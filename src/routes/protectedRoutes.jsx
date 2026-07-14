import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/authContext";

export default function ProtectedRoute() {
  const { isAuthenticated, loading, user, sessionDisplaced } =
    useContext(AuthContext);

  if (loading) return null;

  if (sessionDisplaced) return <Outlet />;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (user?.is_active !== true) return <Navigate to="/status/403" replace />;

  return <Outlet />;
}

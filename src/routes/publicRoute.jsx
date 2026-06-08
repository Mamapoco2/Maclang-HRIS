//src/routes/publicRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "@/context/authContext";
import { useFirstAccessibleRoute } from "../hooks/useFirstAccessibleoute";

export default function PublicRoute() {
  const { isAuthenticated, loading } = useContext(AuthContext);
  const firstAccessibleRoute = useFirstAccessibleRoute();

  if (loading) return null;
  if (isAuthenticated) return <Navigate to={firstAccessibleRoute} replace />;

  return <Outlet />;
}

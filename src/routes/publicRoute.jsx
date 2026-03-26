// src/routes/publicRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "@/context/authContext";

export default function PublicRoute() {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) return null; // ← null not undefined
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}

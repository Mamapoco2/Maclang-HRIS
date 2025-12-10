import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/authContext";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>; // Optional: loading spinner

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

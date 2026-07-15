import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "@/context/authContext";
import { useFirstAccessibleRoute } from "../hooks/useFirstAccessibleRoute";
import { useHasAppliedToPlantilla } from "../hooks/useHasAppliedToPlantilla";
import { hasPermission } from "@/lib/authHelpers";
import { PERMISSIONS } from "@/constants/permissions";

export default function PlantillaApplicantGate({ children }) {
  const { user } = useContext(AuthContext);
  const firstAccessibleRoute = useFirstAccessibleRoute();
  const hasApplied = useHasAppliedToPlantilla();

  if (hasPermission(user, PERMISSIONS.PLANTILLA_APPLICATIONS_MANAGE)) {
    return children;
  }

  if (hasApplied === null) return null;

  if (hasApplied) return children;

  return <Navigate to={firstAccessibleRoute} replace />;
}

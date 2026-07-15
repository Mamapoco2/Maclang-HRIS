import { useState, useEffect, useContext } from "react";
import { AuthContext } from "@/context/authContext";
import { plantillaPostingService } from "@/services/plantillaPostingService";

export function useHasAppliedToPlantilla() {
  const { user } = useContext(AuthContext);
  const [hasApplied, setHasApplied] = useState(null);

  useEffect(() => {
    let active = true;

    if (!user?.id) {
      setHasApplied(false);
      return;
    }

    plantillaPostingService
      .getMyApplications()
      .then((data) => {
        if (!active) return;
        setHasApplied(Array.isArray(data) && data.length > 0);
      })
      .catch(() => {
        if (active) setHasApplied(false);
      });

    return () => {
      active = false;
    };
  }, [user?.id]);

  return hasApplied;
}

// src/hooks/useProfileStatus.js
import { useState, useEffect, useCallback } from "react";
import { getToken } from "@/lib/tokenStorage";
import profileService from "@/services/profileService";

export function useProfileStatus() {
  const [isComplete, setIsComplete] = useState(null);
  const [missingFields, setMissingFields] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStatus = useCallback(async () => {
    // guard: don't fire if no token in sessionStorage
    if (!getToken()) {
      setIsLoading(false);
      setError("No token");
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await profileService.getStatus();

    if (result.success) {
      setIsComplete(result.data.is_complete);
      setMissingFields(result.data.missing_fields ?? {});
    } else {
      setError(result.error);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return { isComplete, missingFields, isLoading, error, refetch: fetchStatus };
}

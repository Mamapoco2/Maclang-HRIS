import { useEffect, useState } from "react";
import { LeaveApi } from "@/services/leaveApiService";

export function useLeaveTypes() {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    LeaveApi.listTypes()
      .then((data) => {
        if (!cancelled) setTypes(data ?? []);
      })
      .catch((e) => {
        if (!cancelled) setError(e);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { types, loading, error };
}

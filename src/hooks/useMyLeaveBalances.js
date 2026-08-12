import { useCallback, useEffect, useState } from "react";
import { LeaveApi } from "@/services/leaveApiService";
import { useAuth } from "@/hooks/useAuth";

export function useMyLeaveBalances(year = new Date().getFullYear()) {
  const { user } = useAuth();
  const employeeId = user?.employee_id ?? user?.employee?.id ?? null;

  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBalances = useCallback(async () => {
    if (!employeeId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await LeaveApi.getMyBalances(employeeId, year);
      setBalances(data ?? []);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [employeeId, year]);

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  return { balances, loading, error, refetch: fetchBalances, employeeId };
}

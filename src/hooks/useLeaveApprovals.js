import { useCallback, useEffect, useRef, useState } from "react";
import { LeaveApi } from "@/services/leaveApiService";

export function useLeaveApprovals(params = {}) {
  const [pending, setPending] = useState([]);
  const [recentDecisions, setRecentDecisions] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const requestId = useRef(0);

  const paramsKey = JSON.stringify(params);

  const fetchPending = useCallback(async () => {
    const myRequest = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      const data = await LeaveApi.listPendingApprovals(JSON.parse(paramsKey));
      if (myRequest !== requestId.current) return;
      setPending(data.data ?? []);
      setMeta({
        current_page: data.current_page,
        last_page: data.last_page,
        total: data.total,
      });
    } catch (e) {
      if (myRequest === requestId.current) setError(e);
    } finally {
      if (myRequest === requestId.current) setLoading(false);
    }
  }, [paramsKey]);

  const fetchRecentDecisions = useCallback(async () => {
    try {
      const data = await LeaveApi.listRecentDecisions({ limit: 5 });
      setRecentDecisions(data ?? []);
    } catch (e) {
      console.error("Failed to load recent decisions:", e);
    }
  }, []);

  useEffect(() => {
    fetchPending();
    fetchRecentDecisions();
  }, [fetchPending, fetchRecentDecisions]);

  const approve = useCallback(
    async (requestId, remarks) => {
      const res = await LeaveApi.act(requestId, "approved", remarks);
      setPending((prev) => prev.filter((r) => r.id !== requestId));
      fetchRecentDecisions();
      return res;
    },
    [fetchRecentDecisions],
  );

  const reject = useCallback(
    async (requestId, remarks) => {
      const res = await LeaveApi.act(requestId, "rejected", remarks);
      setPending((prev) => prev.filter((r) => r.id !== requestId));
      fetchRecentDecisions();
      return res;
    },
    [fetchRecentDecisions],
  );

  const bulkApprove = useCallback(
    async (ids) => {
      const res = await LeaveApi.bulkApprove(ids);
      const approvedIds = res.approved ?? res.approved_ids ?? [];
      setPending((prev) => prev.filter((r) => !approvedIds.includes(r.id)));
      fetchRecentDecisions();
      return res;
    },
    [fetchRecentDecisions],
  );

  return {
    pending,
    recentDecisions,
    meta,
    loading,
    error,
    refetch: fetchPending,
    approve,
    reject,
    bulkApprove,
  };
}

import { useCallback, useEffect, useRef, useState } from "react";
import { LeaveApi } from "@/services/leaveApiService";

export function useLeaveRequests(params = {}) {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const requestId = useRef(0);

  const paramsKey = JSON.stringify(params);

  const fetchList = useCallback(async () => {
    const myRequest = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      const data = await LeaveApi.listRequests(JSON.parse(paramsKey));
      if (myRequest !== requestId.current) return;
      setItems(data.data ?? []);
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

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const cancelRequest = useCallback(
    async (id, reason) => {
      const res = await LeaveApi.cancelRequest(id, reason);
      setItems((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...res.data } : r)),
      );
      return res;
    },
    [],
  );

  return {
    items,
    meta,
    loading,
    error,
    refetch: fetchList,
    cancelRequest,
  };
}

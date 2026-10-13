import { useCallback, useEffect, useRef, useState } from "react";
import { getDtrAuditLogs } from "@/services/dtrAuditService";

function errorMessage(err) {
  const message = err?.response?.data?.message;

  if (err?.response?.status === 403) {
    return message || "You are not allowed to view the audit log.";
  }

  return message || "Failed to load the audit log.";
}

export function useDtrAuditLogs({ enabled, scope, action, q, from, to, page }) {
  const [rows, setRows] = useState([]);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const requestId = useRef(0);

  const load = useCallback(async () => {
    const id = ++requestId.current;

    setLoading(true);
    setError("");

    try {
      const result = await getDtrAuditLogs({
        scope,
        action,
        q,
        from,
        to,
        page,
      });

      if (id !== requestId.current) return;

      setRows(result.rows);
      setLastPage(result.lastPage);
      setTotal(result.total);
    } catch (err) {
      if (id !== requestId.current) return;

      console.error(err);
      setRows([]);
      setError(errorMessage(err));
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [scope, action, q, from, to, page]);

  useEffect(() => {
    if (enabled) load();
  }, [enabled, load]);

  return { rows, lastPage, total, loading, error, refetch: load };
}
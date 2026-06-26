import { useState, useCallback, useEffect, useRef } from "react";
import { auditLogsService } from "@/services/auditLogsService";
import { normaliseLog } from "../utils/normaliseLog";

// ─── HOOK: useAuditLogs ───────────────────────────────────────────────────────
// Centralises all API calls. The component never touches auditLogsService directly.

export function useAuditLogs({ appliedFilters, page, perPage }) {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // keep stable ref so the effect can read the latest value without re-running
  const paramsRef = useRef({ appliedFilters, page, perPage });
  paramsRef.current = { appliedFilters, page, perPage };

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { appliedFilters: f, page: p, perPage: pp } = paramsRef.current;

      // Build the query params your Laravel API understands.
      // Adjust key names to match your actual endpoint contract.
      const params = {
        page: p,
        per_page: pp,
        ...(f.search && { search: f.search }),
        ...(f.module && { module: f.module }),
        ...(f.username && { username: f.username }),
        ...(f.status && { status: f.status }),
        ...(f.severity && { severity: f.severity }),
      };

      const res = await auditLogsService.getAuditLogs(params);

      // Support two common API shapes:
      //   1. { data: [...], total: N }          (Laravel paginator)
      //   2. { data: { data: [...], total: N } } (nested paginator)
      const raw = res?.data?.data ?? res?.data ?? [];
      const count = res?.data?.total ?? res?.total ?? raw.length;

      setLogs(Array.isArray(raw) ? raw.map(normaliseLog) : []);
      setTotal(count);
    } catch (err) {
      console.error("[AuditLogs] fetch failed:", err);
      setError(err?.response?.data?.message ?? err?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []); // stable – reads from ref

  // Re-fetch whenever the caller's inputs change
  useEffect(() => {
    fetch();
  }, [fetch, appliedFilters, page, perPage]);

  return { logs, total, loading, error, refetch: fetch };
}

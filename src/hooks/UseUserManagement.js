import { useCallback, useEffect, useState } from "react";
import { fetchUsers } from "@/services/userManagementService";
import { useDebounce } from "@/hooks/useDebounce";
import {
  DEFAULT_PER_PAGE,
  EMPTY_META,
  getApiErrorMessage,
  isRequestCanceled,
} from "@/utils/userManagement";

const SEARCH_DEBOUNCE_MS = 300;

/**
 * Owns the User Management list: filters, server-side pagination,
 * request cancellation and error state.
 */
export function useUserManagement() {
  const [search, setSearchValue] = useState("");
  const [role, setRoleValue] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPageValue] = useState(DEFAULT_PER_PAGE);
  const [reloadToken, setReloadToken] = useState(0);
  const [state, setState] = useState({
    users: [],
    meta: EMPTY_META,
    loading: true,
    error: null,
  });

  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_MS);
  const isSearchPending = search.trim() !== debouncedSearch.trim();

  useEffect(() => {
    // Aborting on cleanup guarantees a slow, stale response can never
    // overwrite the result of a newer query.
    const controller = new AbortController();

    setState((prev) => ({ ...prev, loading: true, error: null }));

    fetchUsers(
      { page, perPage, search: debouncedSearch, role },
      { signal: controller.signal },
    )
      .then(({ users, meta }) => {
        // The requested page no longer exists (rows were removed or a
        // filter narrowed the result set) — jump to the last real page.
        if (page > meta.lastPage) {
          setPage(meta.lastPage);
          return;
        }
        setState({ users, meta, loading: false, error: null });
      })
      .catch((err) => {
        if (isRequestCanceled(err)) return;
        setState((prev) => ({
          ...prev,
          loading: false,
          error: getApiErrorMessage(err, "Failed to load users."),
        }));
      });

    return () => controller.abort();
  }, [page, perPage, debouncedSearch, role, reloadToken]);

  const setSearch = useCallback((value) => {
    setSearchValue(value);
    setPage(1);
  }, []);

  const setRole = useCallback((value) => {
    setRoleValue(value);
    setPage(1);
  }, []);

  const setPerPage = useCallback((value) => {
    setPerPageValue(value);
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchValue("");
    setRoleValue("");
    setPage(1);
  }, []);

  const reload = useCallback(() => setReloadToken((t) => t + 1), []);

  return {
    ...state,
    search,
    role,
    page,
    perPage,
    isSearchPending,
    hasFilters: search.trim() !== "" || role !== "",
    setSearch,
    setRole,
    setPage,
    setPerPage,
    clearFilters,
    reload,
  };
}

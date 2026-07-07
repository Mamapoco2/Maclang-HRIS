// src/hooks/useAnnouncements.js
import { useCallback, useEffect, useRef, useState } from "react";
import { AnnouncementsApi } from "@/services/announcements";
import { mapAnnouncement } from "@/lib/announcementMapper";

export function useAnnouncements({ archived, search, filters, sort }) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const requestId = useRef(0);

  const params = {
    archived: archived ? 1 : 0,
    search: search || undefined,
    priorities: filters.priorities?.length ? filters.priorities : undefined,
    departments: filters.departments?.length ? filters.departments : undefined,
    pinned_only: filters.pinned ? 1 : undefined,
    unread_only: filters.unread ? 1 : undefined,
    sort,
    per_page: 10,
  };

  const fetchPage = useCallback(
    async (pageNum, replace) => {
      const myRequest = ++requestId.current;
      setLoading(true);
      setError(null);
      try {
        const data = await AnnouncementsApi.list({ ...params, page: pageNum });
        if (myRequest !== requestId.current) return;
        const mapped = data.data.map(mapAnnouncement);
        setItems((prev) => (replace ? mapped : [...prev, ...mapped]));
        setLastPage(data.last_page);
        setPage(pageNum);
      } catch (e) {
        if (myRequest === requestId.current) setError(e);
      } finally {
        if (myRequest === requestId.current) setLoading(false);
      }
    },
    [archived, search, JSON.stringify(filters), sort],
  );

  useEffect(() => {
    fetchPage(1, true);
  }, [archived, search, JSON.stringify(filters), sort]);

  function loadMore() {
    if (page < lastPage && !loading) fetchPage(page + 1, false);
  }

  function patchItem(id, patch) {
    setItems((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  }

  function removeItem(id) {
    setItems((prev) => prev.filter((a) => a.id !== id));
  }

  function prependItem(item) {
    setItems((prev) => [item, ...prev]);
  }

  return {
    items,
    loading,
    error,
    hasMore: page < lastPage,
    loadMore,
    patchItem,
    removeItem,
    prependItem,
    refetch: () => fetchPage(1, true),
  };
}

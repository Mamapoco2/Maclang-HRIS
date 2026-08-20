import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  getUsers,
  activateUser,
  bulkActivateUsers,
} from "@/services/accountsService";
import { IconLoader2, IconCheck, IconSearch } from "@tabler/icons-react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { getEcho } from "@/lib/echo";

const PAGE_SIZE = 10;

export default function AccountApprovalPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activatingId, setActivatingId] = useState(null);
  const [selected, setSelected] = useState([]);
  const [bulkActivating, setBulkActivating] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [jumpPage, setJumpPage] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [highlightedId, setHighlightedId] = useState(null);

  const loadUsers = async (resetSelected = false) => {
    try {
      const data = await getUsers();
      setUsers(data);
      if (resetSelected) setSelected([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers(true);

    const interval = setInterval(() => loadUsers(false), 30000);

    const echo = getEcho();
    if (!echo) return () => clearInterval(interval);

    const channel = echo.private("pending-users");

    const onRegistered = () => loadUsers(false);
    const onActivated = () => loadUsers(false);

    channel.listen(".user.registered", onRegistered);
    channel.listen(".user.activated", onActivated);

    return () => {
      clearInterval(interval);
      channel.stopListening(".user.registered", onRegistered);
      channel.stopListening(".user.activated", onActivated);
    };
  }, []);

  useEffect(() => {
    if (loading) return;
    const userId = searchParams.get("user");
    if (!userId || users.length === 0) return;

    const matchIndex = users.findIndex((u) => String(u.id) === String(userId));
    if (matchIndex !== -1) {
      const match = users[matchIndex];
      setSearch("");
      setPage(Math.floor(matchIndex / PAGE_SIZE) + 1);
      setHighlightedId(match.id);
      requestAnimationFrame(() => {
        document
          .getElementById(`pending-user-${match.id}`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      const timeout = setTimeout(() => setHighlightedId(null), 3000);
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete("user");
          return next;
        },
        { replace: true },
      );
      return () => clearTimeout(timeout);
    }

    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete("user");
        return next;
      },
      { replace: true },
    );
  }, [loading, users, searchParams, setSearchParams]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const handleActivate = async (id) => {
    setActivatingId(id);
    try {
      await activateUser(id);
      await loadUsers(true);
    } finally {
      setActivatingId(null);
    }
  };

  const handleBulkActivate = async () => {
    if (selected.length === 0) return;
    setBulkActivating(true);
    try {
      await bulkActivateUsers(selected);
      await loadUsers(true);
    } finally {
      setBulkActivating(false);
    }
  };

  const toggleSelect = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );

  const filteredUsers = users.filter(
    (u) =>
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()),
  );

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const pagedUsers = filteredUsers.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const handleJumpPage = (e) => {
    e.preventDefault();
    const p = parseInt(jumpPage);
    if (!isNaN(p) && p >= 1 && p <= totalPages) {
      setPage(p);
      setJumpPage("");
    }
  };

  const pageRange = () => {
    const total = totalPages;
    const cur = page;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const delta = 2;
    const left = Math.max(2, cur - delta);
    const right = Math.min(total - 1, cur + delta);
    const pages = [1];
    if (left > 2) pages.push("...");
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < total - 1) pages.push("...");
    pages.push(total);
    return pages;
  };

  const toggleAll = () =>
    setSelected((prev) => {
      const pageIds = pagedUsers.map((u) => u.id);
      const allPageSelected = pageIds.every((id) => prev.includes(id));
      return allPageSelected
        ? prev.filter((id) => !pageIds.includes(id))
        : [...new Set([...prev, ...pageIds])];
    });

  const allSelected =
    pagedUsers.length > 0 && pagedUsers.every((u) => selected.includes(u.id));
  const someSelected =
    !allSelected && pagedUsers.some((u) => selected.includes(u.id));

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-sm">
            <span className="font-medium text-gray-700">Pending approval</span>
            {!loading && (
              <span className="text-gray-400">
                {users.length} user{users.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          {!loading && (
            <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1.5 bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500">
              <IconSearch size={13} className="text-gray-400 shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by username or email..."
                className="bg-transparent text-xs flex-1 outline-none placeholder:text-gray-400 text-gray-700 w-48"
              />
            </div>
          )}
        </div>

        {selected.length > 0 && (
          <button
            onClick={handleBulkActivate}
            disabled={bulkActivating}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50"
          >
            {bulkActivating ? (
              <>
                <IconLoader2 size={12} className="animate-spin" /> Activating…
              </>
            ) : (
              <>
                <IconCheck size={12} /> Activate selected ({selected.length})
              </>
            )}
          </button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <IconLoader2 size={24} className="animate-spin text-gray-300" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3 w-10">
                  <Checkbox
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected;
                    }}
                    onCheckedChange={toggleAll}
                    aria-label="Select all"
                    className="border-gray-300"
                  />
                </th>
                {["Username", "Email", "Status", "Action"].map((col) => (
                  <th
                    key={col}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {pagedUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-14 text-center text-sm text-gray-400"
                  >
                    {users.length === 0
                      ? "No pending users found."
                      : "No users match your search."}
                  </td>
                </tr>
              ) : (
                pagedUsers.map((u) => (
                  <tr
                    key={u.id}
                    id={`pending-user-${u.id}`}
                    className={`transition-colors ${
                      highlightedId === u.id
                        ? "bg-blue-50 ring-1 ring-inset ring-blue-300"
                        : selected.includes(u.id)
                          ? "bg-emerald-50"
                          : "hover:bg-gray-50"
                    }`}
                  >
                    <td className="px-4 py-3">
                      <Checkbox
                        checked={selected.includes(u.id)}
                        onCheckedChange={() => toggleSelect(u.id)}
                        aria-label={`Select ${u.email}`}
                        className="border-gray-300"
                      />
                    </td>
                    <td className="px-4 py-3 text-xs font-medium text-gray-800">
                      {u.username}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {u.email}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          u.approval_status === "APPROVED"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-red-50 text-red-700 border-red-200"
                        }`}
                      >
                        {u.approval_status === "APPROVED"
                          ? "Approved"
                          : "Pending"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleActivate(u.id)}
                        disabled={activatingId === u.id || bulkActivating}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        {activatingId === u.id && (
                          <IconLoader2 size={11} className="animate-spin" />
                        )}
                        Activate
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Pagination (same style as Employee Management) ── */}
      {!loading && totalPages > 0 && (
        <div className="border-t border-gray-100 px-5 py-3 flex items-center justify-between gap-2 flex-wrap text-xs text-gray-500">
          {/* Prev */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="h-8 w-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              <ChevronsLeft size={14} />
            </button>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="h-8 px-3 flex items-center gap-1 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft size={13} /> Prev
            </button>
          </div>

          {/* Page numbers */}
          <div className="flex items-center gap-1 flex-wrap justify-center">
            {pageRange().map((p, i) =>
              p === "..." ? (
                <span key={`ellipsis-${i}`} className="px-1 text-gray-300">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => p !== page && setPage(p)}
                  className={`h-8 w-8 rounded-lg text-xs font-medium transition-colors ${
                    p === page
                      ? "bg-blue-600 text-white"
                      : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {p}
                </button>
              ),
            )}
            <span className="ml-2 text-gray-400">
              ({filteredUsers.length} total)
            </span>
            {totalPages > 1 && (
              <form
                onSubmit={handleJumpPage}
                className="flex items-center gap-1 ml-1"
              >
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={jumpPage}
                  onChange={(e) => setJumpPage(e.target.value)}
                  placeholder="Go to"
                  className="h-8 w-16 text-xs text-center rounded-lg border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                />
                <button
                  type="submit"
                  className="h-8 px-3 text-xs rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Go
                </button>
              </form>
            )}
          </div>

          {/* Next */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="h-8 px-3 flex items-center gap-1 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              Next <ChevronRight size={13} />
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              className="h-8 w-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              <ChevronsRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

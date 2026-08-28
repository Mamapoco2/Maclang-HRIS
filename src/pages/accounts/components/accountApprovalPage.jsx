import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  getUsers,
  activateUser,
  bulkActivateUsers,
} from "@/services/accountsService";
import {
  IconLoader2,
  IconCheck,
  IconSearch,
  IconUserPlus,
} from "@tabler/icons-react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  UserCheck,
  Clock3,
  Users,
  Inbox,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { getEcho } from "@/lib/echo";

const PAGE_SIZE = 10;

// Deterministic, low-saturation avatar palette so rows stay calm but distinguishable.
const AVATAR_STYLES = [
  "bg-indigo-50 text-indigo-600",
  "bg-violet-50 text-violet-600",
  "bg-sky-50 text-sky-600",
  "bg-teal-50 text-teal-600",
  "bg-amber-50 text-amber-700",
  "bg-rose-50 text-rose-600",
];

function avatarStyle(seed = "") {
  let hash = 0;
  for (let i = 0; i < seed.length; i++)
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_STYLES[Math.abs(hash) % AVATAR_STYLES.length];
}

function initials(u) {
  const source = u.username || u.email || "?";
  return source.slice(0, 2).toUpperCase();
}

function StatCard({ icon: Icon, label, value, tone }) {
  const tones = {
    indigo: "bg-indigo-50 text-indigo-600",
    amber: "bg-amber-50 text-amber-600",
    emerald: "bg-emerald-50 text-emerald-600",
  };
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-3.5 shadow-sm">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}
      >
        <Icon className="h-4.5 w-4.5" size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-lg font-semibold leading-tight text-gray-900">
          {value}
        </p>
        <p className="truncate text-xs text-gray-400">{label}</p>
      </div>
    </div>
  );
}

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

  const stats = useMemo(() => {
    const approved = users.filter(
      (u) => u.approval_status === "APPROVED",
    ).length;
    const pending = users.length - approved;
    return { total: users.length, approved, pending };
  }, [users]);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* ── Page header ── */}
      <div className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto max-w-full px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-600 p-2">
              <UserCheck className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight text-gray-900">
                Account Approval
              </h1>
              <p className="text-xs leading-tight text-gray-500">
                Review new registrations and activate accounts for access.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-full px-4 py-6 sm:px-6">
        {/* ── Stats ── */}
        <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard
            icon={Inbox}
            label="Total registrations"
            value={stats.total}
            tone="indigo"
          />
          <StatCard
            icon={Clock3}
            label="Awaiting approval"
            value={stats.pending}
            tone="amber"
          />
          <StatCard
            icon={UserCheck}
            label="Approved"
            value={stats.approved}
            tone="emerald"
          />
        </div>

        {/* ── Content card ── */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-3.5">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 text-sm">
                <span className="font-medium text-gray-700">
                  Pending review
                </span>
                {!loading && (
                  <span className="text-gray-400">
                    {users.length} user{users.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
              {!loading && (
                <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 focus-within:ring-2 focus-within:ring-indigo-500">
                  <IconSearch size={13} className="shrink-0 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by username or email..."
                    className="w-48 flex-1 bg-transparent text-xs text-gray-700 outline-none placeholder:text-gray-400"
                  />
                </div>
              )}
            </div>

            {selected.length > 0 && (
              <button
                onClick={handleBulkActivate}
                disabled={bulkActivating}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
              >
                {bulkActivating ? (
                  <>
                    <IconLoader2 size={12} className="animate-spin" />{" "}
                    Activating…
                  </>
                ) : (
                  <>
                    <IconCheck size={12} /> Activate selected ({selected.length}
                    )
                  </>
                )}
              </button>
            )}
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <IconLoader2 size={24} className="animate-spin text-gray-300" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/80">
                    <th className="w-10 px-4 py-3">
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
                    {["User", "Email", "Status", "Action"].map((col) => (
                      <th
                        key={col}
                        className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-50">
                  {pagedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-16">
                        <div className="flex flex-col items-center gap-2 text-center">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                            <IconUserPlus size={18} className="text-gray-400" />
                          </div>
                          <p className="text-sm text-gray-400">
                            {users.length === 0
                              ? "No pending users to review."
                              : "No users match your search."}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    pagedUsers.map((u) => (
                      <tr
                        key={u.id}
                        id={`pending-user-${u.id}`}
                        className={`transition-colors ${
                          highlightedId === u.id
                            ? "bg-indigo-50 ring-1 ring-inset ring-indigo-300"
                            : selected.includes(u.id)
                              ? "bg-emerald-50/60"
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
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${avatarStyle(
                                u.username || u.email,
                              )}`}
                            >
                              {initials(u)}
                            </div>
                            <span className="text-xs font-medium text-gray-800">
                              {u.username}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {u.email}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                              u.approval_status === "APPROVED"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-amber-200 bg-amber-50 text-amber-700"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                u.approval_status === "APPROVED"
                                  ? "bg-emerald-500"
                                  : "bg-amber-500"
                              }`}
                            />
                            {u.approval_status === "APPROVED"
                              ? "Approved"
                              : "Pending"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleActivate(u.id)}
                            disabled={activatingId === u.id || bulkActivating}
                            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-600 transition-colors hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
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

          {/* Pagination */}
          {!loading && totalPages > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 px-5 py-3 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-40"
                >
                  <ChevronsLeft size={14} />
                </button>
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex h-8 items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-40"
                >
                  <ChevronLeft size={13} /> Prev
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-1">
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
                          ? "bg-indigo-600 text-white"
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
                    className="ml-1 flex items-center gap-1"
                  >
                    <input
                      type="number"
                      min={1}
                      max={totalPages}
                      value={jumpPage}
                      onChange={(e) => setJumpPage(e.target.value)}
                      placeholder="Go to"
                      className="h-8 w-16 rounded-lg border border-gray-200 bg-gray-50 text-center text-xs text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="submit"
                      className="h-8 rounded-lg border border-gray-200 bg-white px-3 text-xs text-gray-600 transition-colors hover:bg-gray-50"
                    >
                      Go
                    </button>
                  </form>
                )}
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex h-8 items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-40"
                >
                  Next <ChevronRight size={13} />
                </button>
                <button
                  onClick={() => setPage(totalPages)}
                  disabled={page === totalPages}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-40"
                >
                  <ChevronsRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

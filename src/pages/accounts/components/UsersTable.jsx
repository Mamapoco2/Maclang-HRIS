import { useEffect, useState } from "react";
import { getUsers, activateUser, bulkActivateUsers } from "@/services/accountsService";
import { IconLoader2, IconCheck, IconSearch } from "@tabler/icons-react";
import { Checkbox } from "@/components/ui/checkbox";
import getEcho from "@/lib/echo";

export default function UsersTable() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activatingId, setActivatingId] = useState(null);
  const [selected, setSelected] = useState([]);
  const [bulkActivating, setBulkActivating] = useState(false);
  const [search, setSearch] = useState("");

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
    const echo = getEcho();
    if (!echo) return;
    const channel = echo.channel("pending-users");
    channel.listen(".user.registered", () => loadUsers(false));
    channel.listen(".user.activated", () => loadUsers(false));
    return () => { echo.leaveChannel("pending-users"); };
  }, []);

  const handleActivate = async (id) => {
    setActivatingId(id);
    try { await activateUser(id); await loadUsers(true); }
    finally { setActivatingId(null); }
  };

  const handleBulkActivate = async () => {
    if (selected.length === 0) return;
    setBulkActivating(true);
    try { await bulkActivateUsers(selected); await loadUsers(true); }
    finally { setBulkActivating(false); }
  };

  const toggleSelect = (id) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);

  const toggleAll = () =>
    setSelected(selected.length === users.length ? [] : users.map((u) => u.id));

  const allSelected = users.length > 0 && selected.length === users.length;
  const someSelected = selected.length > 0 && !allSelected;

  const filteredUsers = users.filter(
    (u) =>
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <IconLoader2 size={24} className="animate-spin text-gray-300" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-sm">
            <span className="font-medium text-gray-700">Pending approval</span>
            <span className="text-gray-400">{users.length} user{users.length !== 1 ? "s" : ""}</span>
          </div>
          <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1.5 bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500">
            <IconSearch size={13} className="text-gray-400 shrink-0" />
            <input
              type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by username or email..."
              className="bg-transparent text-xs flex-1 outline-none placeholder:text-gray-400 text-gray-700 w-48"
            />
          </div>
        </div>

        {selected.length > 0 && (
          <button
            onClick={handleBulkActivate} disabled={bulkActivating}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50"
          >
            {bulkActivating
              ? <><IconLoader2 size={12} className="animate-spin" /> Activating…</>
              : <><IconCheck size={12} /> Activate selected ({selected.length})</>}
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-4 py-3 w-10">
                <Checkbox
                  checked={allSelected}
                  ref={(el) => { if (el) el.indeterminate = someSelected; }}
                  onCheckedChange={toggleAll}
                  aria-label="Select all"
                  className="border-gray-300"
                />
              </th>
              {["Username", "Email", "Status", "Action"].map((col) => (
                <th key={col} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  {col}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-14 text-center text-sm text-gray-400">
                  {users.length === 0 ? "No pending users found." : "No users match your search."}
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => (
                <tr
                  key={u.id}
                  className={`transition-colors ${selected.includes(u.id) ? "bg-emerald-50" : "hover:bg-gray-50"}`}
                >
                  <td className="px-4 py-3">
                    <Checkbox
                      checked={selected.includes(u.id)}
                      onCheckedChange={() => toggleSelect(u.id)}
                      aria-label={`Select ${u.email}`}
                      className="border-gray-300"
                    />
                  </td>
                  <td className="px-4 py-3 text-xs font-medium text-gray-800">{u.username}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                      u.approval_status === "APPROVED"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-red-50 text-red-700 border-red-200"
                    }`}>
                      {u.approval_status === "APPROVED" ? "Approved" : "Pending"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleActivate(u.id)}
                      disabled={activatingId === u.id || bulkActivating}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      {activatingId === u.id && <IconLoader2 size={11} className="animate-spin" />}
                      Activate
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

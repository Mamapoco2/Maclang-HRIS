import { useEffect, useState } from "react";
import {
  getUsers,
  activateUser,
  bulkActivateUsers,
} from "@/services/accountsService";
import { IconLoader2, IconCheck } from "@tabler/icons-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import getEcho from "@/lib/echo";

export default function UsersTable() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activatingId, setActivatingId] = useState(null);
  const [selected, setSelected] = useState([]);
  const [bulkActivating, setBulkActivating] = useState(false);

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

    return () => {
      echo.leaveChannel("pending-users");
    };
  }, []);

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

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const toggleAll = () => {
    setSelected(selected.length === users.length ? [] : users.map((u) => u.id));
  };

  const allSelected = users.length > 0 && selected.length === users.length;
  const someSelected = selected.length > 0 && !allSelected;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <IconLoader2
          size={24}
          stroke={1.5}
          className="animate-spin text-gray-400"
        />
      </div>
    );
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-800">
            Pending approval
          </span>
          <span className="text-sm text-gray-400">
            {users.length} user{users.length !== 1 ? "s" : ""}
          </span>
        </div>

        {selected.length > 0 && (
          <Button
            onClick={handleBulkActivate}
            disabled={bulkActivating}
            size="sm"
            className="bg-green-700 hover:bg-green-800 text-white text-xs font-medium h-8 px-3 gap-1.5 transition-all"
          >
            {bulkActivating ? (
              <IconLoader2 size={13} stroke={1.5} className="animate-spin" />
            ) : (
              <IconCheck size={13} stroke={2} />
            )}
            {bulkActivating
              ? "Activating..."
              : `Activate selected (${selected.length})`}
          </Button>
        )}
      </div>

      <Table>
        <TableHeader className="py-0">
          <TableRow className="bg-gray-50 hover:bg-gray-50">
            <TableHead>
              <Checkbox
                checked={allSelected}
                ref={(el) => {
                  if (el) el.indeterminate = someSelected;
                }}
                onCheckedChange={toggleAll}
                aria-label="Select all"
                className="border-gray-300"
              />
            </TableHead>
            <TableHead className="text-center text-xs font-medium text-gray-500 uppercase tracking-wide">
              Username
            </TableHead>
            <TableHead className="text-center text-xs font-medium text-gray-500 uppercase tracking-wide">
              Email
            </TableHead>
            <TableHead className="text-center text-xs font-medium text-gray-500 uppercase tracking-wide">
              Status
            </TableHead>
            <TableHead className="text-center text-xs font-medium text-gray-500 uppercase tracking-wide">
              Action
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {users.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={5}
                className="py-14 text-center text-sm text-gray-400"
              >
                No pending users found.
              </TableCell>
            </TableRow>
          )}

          {users.map((u) => (
            <TableRow
              key={u.id}
              className={`transition-colors ${
                selected.includes(u.id)
                  ? "bg-green-50 hover:bg-green-50"
                  : "hover:bg-gray-50"
              }`}
            >
              <TableCell className="px-5 py-3 text-center">
                <div className="flex justify-center">
                  <Checkbox
                    checked={selected.includes(u.id)}
                    onCheckedChange={() => toggleSelect(u.id)}
                    aria-label={`Select ${u.email}`}
                    className="border-gray-300"
                  />
                </div>
              </TableCell>

              <TableCell className="py-3 text-center text-sm text-gray-600">
                {u.username}
              </TableCell>

              <TableCell className="py-3 text-center text-sm text-gray-600">
                {u.email}
              </TableCell>

              <TableCell className="py-3 text-center">
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    u.approval_status === "APPROVED"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {u.approval_status === "APPROVED" ? "Approved" : "Pending"}
                </span>
              </TableCell>

              <TableCell className="py-3 text-center">
                <button
                  onClick={() => handleActivate(u.id)}
                  disabled={activatingId === u.id || bulkActivating}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md
                     border border-gray-200 bg-white text-gray-700
                     hover:bg-green-50 hover:border-green-300 hover:text-green-800
                     disabled:opacity-40 disabled:cursor-not-allowed
                     transition-colors"
                >
                  {activatingId === u.id && (
                    <IconLoader2
                      size={12}
                      stroke={1.5}
                      className="animate-spin"
                    />
                  )}
                  Activate
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

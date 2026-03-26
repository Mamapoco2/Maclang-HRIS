import { useEffect, useState } from "react";
import {
  getUsers,
  activateUser,
  bulkActivateUsers,
} from "@/services/accountsService";
import { IconLoader2 } from "@tabler/icons-react";
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

    channel.listen(".user.registered", () => {
      loadUsers(false);
    });

    channel.listen(".user.activated", () => {
      loadUsers(false);
    });

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

  if (loading)
    return (
      <div className="flex justify-center items-center p-6">
        <IconLoader2
          size={32}
          stroke={1.5}
          className="animate-spin text-gray-500"
        />
      </div>
    );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Pending Users Account</h2>
        {selected.length > 0 && (
          <Button
            onClick={handleBulkActivate}
            disabled={bulkActivating}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {bulkActivating ? (
              <>
                <IconLoader2
                  size={16}
                  stroke={1.5}
                  className="animate-spin mr-2"
                />
                Activating...
              </>
            ) : (
              `Activate Selected (${selected.length})`
            )}
          </Button>
        )}
      </div>

      <Table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
        <TableHeader className="bg-gray-100">
          <TableRow>
            <TableHead className="w-10 px-4 py-2">
              <Checkbox
                checked={allSelected}
                ref={(el) => {
                  if (el) el.indeterminate = someSelected;
                }}
                onCheckedChange={toggleAll}
                aria-label="Select all"
              />
            </TableHead>
            <TableHead className="text-center px-4 py-2">Email</TableHead>
            <TableHead className="text-center px-4 py-2">Status</TableHead>
            <TableHead className="text-center px-4 py-2">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {users.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-6 text-gray-500">
                No pending users found.
              </TableCell>
            </TableRow>
          )}
          {users.map((u) => (
            <TableRow
              key={u.id}
              className={`hover:bg-gray-50 ${selected.includes(u.id) ? "bg-green-50" : ""}`}
            >
              <TableCell className="px-4 py-3">
                <Checkbox
                  checked={selected.includes(u.id)}
                  onCheckedChange={() => toggleSelect(u.id)}
                  aria-label={`Select ${u.email}`}
                />
              </TableCell>
              <TableCell className="px-4 py-3 text-center">{u.email}</TableCell>
              <TableCell className="px-4 py-3 text-center">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    u.approval_status === "APPROVED"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-500 text-white"
                  }`}
                >
                  {u.approval_status}
                </span>
              </TableCell>
              <TableCell className="text-center px-4 py-3">
                <button
                  className="inline-flex items-center gap-2 px-3 py-1 rounded
                             bg-green-600 text-white hover:bg-green-700
                             disabled:opacity-50"
                  onClick={() => handleActivate(u.id)}
                  disabled={activatingId === u.id || bulkActivating}
                >
                  {activatingId === u.id && (
                    <IconLoader2
                      size={16}
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

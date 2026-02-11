import { useEffect, useState } from "react";
import { getUsers, activateUser } from "@/services/accountsService";
import { IconLoader2 } from "@tabler/icons-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function UsersTable() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activatingId, setActivatingId] = useState(null);

  const loadUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleActivate = async (id) => {
    setActivatingId(id);
    try {
      await activateUser(id);
      await loadUsers();
    } finally {
      setActivatingId(null);
    }
  };

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
    <div>
      <h2 className="text-xl font-semibold mb-4">Pending Users Account</h2>

      <Table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
        <TableHeader className="bg-gray-100">
          <TableRow>
            <TableHead className="text-center px-4 py-2">First Name</TableHead>
            <TableHead className="text-center px-4 py-2">Last Name</TableHead>
            <TableHead className="text-center px-4 py-2">Middle Name</TableHead>
            <TableHead className="text-center px-4 py-2">Email</TableHead>
            <TableHead className="text-center px-4 py-2">Status</TableHead>
            <TableHead className="text-center px-4 py-2">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {users.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                No pending users found.
              </TableCell>
            </TableRow>
          )}

          {users.map((u) => (
            <TableRow key={u.id} className="hover:bg-gray-50">
              <TableCell className="px-4 py-3 text-center">
                {u.firstName}
              </TableCell>
              <TableCell className="px-4 py-3 text-center">
                {u.lastName}
              </TableCell>
              <TableCell className="px-4 py-3 text-center">
                {u.middleName}
              </TableCell>
              <TableCell className="px-4 py-3 text-center">{u.email}</TableCell>

              <TableCell className="px-4 py-3 text-center">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    u.status === "Active"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-500 text-white"
                  }`}
                >
                  {u.status}
                </span>
              </TableCell>

              <TableCell className="text-center px-4 py-3">
                {u.status === "Inactive" && (
                  <button
                    className="inline-flex items-center gap-2 px-3 py-1 rounded
                               bg-green-600 text-white hover:bg-green-700
                               disabled:opacity-50"
                    onClick={() => handleActivate(u.id)}
                    disabled={activatingId === u.id}
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
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getApprovedUsers,
  updateUserPermissions,
} from "@/services/accountsService";
import PermissionsModal from "./permissionModal";
import { toast } from "sonner";

const ROLE_BADGE_COLORS = {
  superadmin: "bg-red-100 text-red-700 border-red-200",
  admin: "bg-orange-100 text-orange-700 border-orange-200",
  director: "bg-purple-100 text-purple-700 border-purple-200",
  hr: "bg-blue-100 text-blue-700 border-blue-200",
  head: "bg-teal-100 text-teal-700 border-teal-200",
  supervisor: "bg-yellow-100 text-yellow-700 border-yellow-200",
  staff: "bg-gray-100 text-gray-600 border-gray-200",
};

function getRoleBadgeClass(role) {
  return (
    ROLE_BADGE_COLORS[role.toLowerCase()] ??
    "bg-gray-100 text-gray-600 border-gray-200"
  );
}

export default function ApprovedAccountsTab() {
  const [accounts, setAccounts] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    const data = await getApprovedUsers();
    if (data) setAccounts(data);
  };

  const handleSave = async (userId, permissions) => {
    try {
      setSaving(true);
      const res = await updateUserPermissions(userId, permissions);
      const updatedPermissions = res.permissions ?? permissions;

      // ✅ update the accounts list so the table reflects new permissions
      setAccounts((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, permissions: updatedPermissions } : u,
        ),
      );

      // ✅ update selectedUser so modal is fresh if reopened immediately
      setSelectedUser((prev) =>
        prev?.id === userId
          ? { ...prev, permissions: updatedPermissions }
          : prev,
      );

      setModalOpen(false);
      toast.success("Permissions updated successfully.");
    } catch (err) {
      console.error("updateUserPermissions:", err);
      const message =
        err?.response?.data?.message ??
        err?.response?.data?.errors?.["permissions.0"]?.[0] ??
        "Failed to update permissions.";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Card>
        <CardContent className="pt-4">
          {accounts.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No approved accounts found.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {u.email}
                    </TableCell>

                    {/* Roles */}
                    <TableCell>
                      {u.roles?.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {u.roles.map((r) => (
                            <Badge
                              key={r}
                              variant="outline"
                              className={`text-xs font-semibold border ${getRoleBadgeClass(r)}`}
                            >
                              {r}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">
                          No role
                        </span>
                      )}
                    </TableCell>

                    {/* Permissions */}
                    <TableCell>
                      {u.permissions?.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {u.permissions.slice(0, 3).map((p) => (
                            <Badge
                              key={p}
                              variant="secondary"
                              className="text-xs"
                            >
                              {p}
                            </Badge>
                          ))}
                          {u.permissions.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{u.permissions.length - 3} more
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">
                          None set
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedUser(u);
                          setModalOpen(true);
                        }}
                      >
                        Edit Permissions
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <PermissionsModal
        user={selectedUser}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        saving={saving}
      />
    </>
  );
}

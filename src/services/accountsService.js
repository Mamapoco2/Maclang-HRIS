import api from "@/api/api";

// ── Pending users ─────────────────────────────────────────────────────────────

export async function getUsers() {
  try {
    const res = await api.get("/pending-users");
    return res.data;
  } catch (err) {
    console.error("getUsers:", err);
    return [];
  }
}

export async function getPendingCount() {
  try {
    const res = await api.get("/pending-users/count");
    return res.data.count ?? 0;
  } catch (err) {
    console.error("getPendingCount:", err);
    return 0;
  }
}

export async function activateUser(id) {
  const res = await api.patch(`/users/${id}/activate`);
  return res.data;
}

export async function bulkActivateUsers(ids) {
  const res = await api.post("/users/bulk-activate", { ids });
  return res.data;
}

// ── Approved users ────────────────────────────────────────────────────────────

export async function getApprovedUsers() {
  try {
    const res = await api.get("/approved-users");
    return (res.data ?? []).map((u) => ({
      ...u,
      permissions: Array.isArray(u.permissions) ? u.permissions : [],
      role_position: Array.isArray(u.role_position) ? u.role_position : [],
    }));
  } catch (err) {
    console.error("getApprovedUsers:", err);
    return [];
  }
}

// ── Permissions ───────────────────────────────────────────────────────────────

export async function updateUserPermissions(userId, permissions) {
  const res = await api.put(`/users/${userId}/permissions`, { permissions });
  return res.data;
}

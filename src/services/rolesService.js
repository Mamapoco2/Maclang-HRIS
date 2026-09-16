import api from "@/api/api";

// Expected role shape returned by the API:
// { id, name, description, accessScope, departments: [{ id, name }],
//   permissions: string[], usersCount, isActive }

export async function getRoles() {
  const { data } = await api.get("/roles");
  return data;
}

export async function getRole(roleId) {
  const { data } = await api.get(`/roles/${roleId}`);
  return data;
}

export async function createRole(payload) {
  const { data } = await api.post("/roles", payload);
  return data;
}

export async function updateRole(roleId, payload) {
  const { data } = await api.put(`/roles/${roleId}`, payload);
  return data;
}

// The backend should reject this with the assigned-user count when the
// role still has members, per the Role Management deletion rule.
export async function deleteRole(roleId) {
  const { data } = await api.delete(`/roles/${roleId}`);
  return data;
}

export async function getDepartments() {
  const { data } = await api.get("/departments");
  return data;
}

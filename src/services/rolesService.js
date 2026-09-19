import api from "@/api/api";

export async function getRoles() {
  const { data } = await api.get("/roles");
  return data;
}

export async function getRole(roleId) {
  const { data } = await api.get(`/roles/${roleId}`);
  return data;
}

function toRolePayload(payload) {
  return {
    name: payload.name,
    description: payload.description ?? "",
    accessScope: payload.accessScope,
    departmentIds: payload.departmentIds ?? [],
    permissions: payload.permissions ?? [],
  };
}

export async function createRole(payload) {
  const { data } = await api.post("/roles", toRolePayload(payload));
  return data;
}

export async function updateRole(roleId, payload) {
  const { data } = await api.put(`/roles/${roleId}`, toRolePayload(payload));
  return data;
}

export async function deleteRole(roleId) {
  const { data } = await api.delete(`/roles/${roleId}`);
  return data;
}

export async function getDepartments() {
  const { data } = await api.get("/departments/options");
  return data;
}

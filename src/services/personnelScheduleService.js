import api from "@/api/api";

const BASE = "/plantilla-schedule";

export function getErrorMessage(err) {
  const errors = err?.response?.data?.errors;
  const firstValidation = errors ? Object.values(errors).flat()[0] : null;
  return (
    firstValidation ||
    err?.response?.data?.message ||
    "Something went wrong. Please try again."
  );
}

export const personnelScheduleService = {
  async getSnapshot() {
    const res = await api.get(BASE);
    return res.data;
  },

  async searchEmployees(search) {
    const res = await api.get(`${BASE}/employee-options`, { params: { search } });
    return res.data.data;
  },

  async updateLine(lineId, payload) {
    const res = await api.patch(`${BASE}/lines/${lineId}`, payload);
    return res.data.data;
  },

  async assign(slotId, employeeId) {
    const res = await api.put(`${BASE}/slots/${slotId}/assignee`, {
      employee_id: employeeId,
    });
    return res.data.data;
  },

  async unassign(slotId) {
    const res = await api.delete(`${BASE}/slots/${slotId}/assignee`);
    return res.data.data;
  },

  async createDivision(payload) {
    const res = await api.post(`${BASE}/divisions`, payload);
    return res.data.data;
  },

  async updateDivision(id, payload) {
    const res = await api.patch(`${BASE}/divisions/${id}`, payload);
    return res.data.data;
  },

  async deleteDivision(id) {
    await api.delete(`${BASE}/divisions/${id}`);
  },

  async createUnit(payload) {
    const res = await api.post(`${BASE}/units`, payload);
    return res.data.data;
  },

  async updateUnit(id, payload) {
    const res = await api.patch(`${BASE}/units/${id}`, payload);
    return res.data.data;
  },

  async deleteUnit(id) {
    await api.delete(`${BASE}/units/${id}`);
  },
};

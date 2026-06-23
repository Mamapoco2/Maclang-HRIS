import api from "@/api/api";

/**
 * @param {object} params   - Query params: page, per_page, type, status, etc.
 * @param {object} config   - Axios request config (e.g. { signal } for abort)
 */
export async function getReports(params = {}, config = {}) {
  const res = await api.get("/reports", { params, ...config });
  return res.data;
}

export async function getReport(id) {
  const res = await api.get(`/reports/${id}`);
  return res.data;
}

export async function createReport(data) {
  const res = await api.post("/reports", data);
  return res.data;
}

export async function updateReport(id, data) {
  const res = await api.put(`/reports/${id}`, data);
  return res.data;
}

export async function deleteReport(id) {
  const res = await api.delete(`/reports/${id}`);
  return res.data;
}

import api from "@/api/api";

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

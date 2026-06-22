import api from "@/api/api";

export async function getReports(params = {}) {
  try {
    const res = await api.get("/reports", { params });
    return res.data;
  } catch (err) {
    console.error("getReports:", err);
    return { data: [], meta: {} };
  }
}

export async function getReport(id) {
  try {
    const res = await api.get(`/reports/${id}`);
    return res.data;
  } catch (err) {
    console.error("getReport:", err);
    return null;
  }
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

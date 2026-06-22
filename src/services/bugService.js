import api from "@/api/api";

export async function getBugReports(params = {}) {
  try {
    const res = await api.get("/bug-reports", { params });
    return res.data;
  } catch (err) {
    console.error("getBugReports:", err);
    return [];
  }
}

export async function getBugReport(id) {
  try {
    const res = await api.get(`/bug-reports/${id}`);
    return res.data;
  } catch (err) {
    console.error("getBugReport:", err);
    return null;
  }
}

export async function createBugReport(data) {
  try {
    const res = await api.post("/bug-reports", data);
    return res.data;
  } catch (err) {
    console.error("createBugReport:", err);
    throw err;
  }
}

export async function updateBugReport(id, data) {
  try {
    const res = await api.put(`/bug-reports/${id}`, data);
    return res.data;
  } catch (err) {
    console.error("updateBugReport:", err);
    throw err;
  }
}

export async function deleteBugReport(id) {
  try {
    const res = await api.delete(`/bug-reports/${id}`);
    return res.data;
  } catch (err) {
    console.error("deleteBugReport:", err);
    throw err;
  }
}

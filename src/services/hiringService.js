import api from "@/api/api";

// ── Applicants ────────────────────────────────────────────────────────────────

export async function getApplicants(params = {}) {
  try {
    const res = await api.get("/hiring/applicants", { params });
    return res.data;
  } catch (err) {
    console.error("getApplicants:", err);
    return { data: [], pagination: {} };
  }
}

export async function getApplicantsSummary() {
  try {
    const res = await api.get("/hiring/applicants/summary");
    return res.data;
  } catch (err) {
    console.error("getApplicantsSummary:", err);
    return { total: 0, for_interview: 0, hired: 0, rejected: 0, no_show: 0 };
  }
}

export async function createApplicant(data) {
  const res = await api.post("/hiring/applicants", data);
  return res.data;
}

export async function updateApplicant(id, data) {
  const res = await api.put(`/hiring/applicants/${id}`, data);
  return res.data;
}

export async function deleteApplicant(id) {
  const res = await api.delete(`/hiring/applicants/${id}`);
  return res.data;
}

// ── Documents ─────────────────────────────────────────────────────────────────

export async function getDocuments(applicantId) {
  try {
    const res = await api.get(`/hiring/applicants/${applicantId}/documents`);
    return res.data;
  } catch (err) {
    console.error("getDocuments:", err);
    return [];
  }
}

export async function createDocument(applicantId, data) {
  const res = await api.post(
    `/hiring/applicants/${applicantId}/documents`,
    data,
  );
  return res.data;
}

export async function updateDocument(applicantId, documentId, data) {
  const res = await api.put(
    `/hiring/applicants/${applicantId}/documents/${documentId}`,
    data,
  );
  return res.data;
}

export async function deleteDocument(applicantId, documentId) {
  const res = await api.delete(
    `/hiring/applicants/${applicantId}/documents/${documentId}`,
  );
  return res.data;
}

// ── Interviews ────────────────────────────────────────────────────────────────

export async function getInterviews() {
  try {
    const res = await api.get("/hiring/interviews");
    return res.data;
  } catch (err) {
    console.error("getInterviews:", err);
    return [];
  }
}

export async function updateInterview(applicantId, data) {
  const res = await api.put(
    `/hiring/applicants/${applicantId}/interview`,
    data,
  );
  return res.data;
}

// ── Hiring Events / Calendar ──────────────────────────────────────────────────

export async function getHiringEvents() {
  try {
    const res = await api.get("/hiring/events");
    return res.data;
  } catch (err) {
    console.error("getHiringEvents:", err);
    return [];
  }
}

export async function createHiringEvent(data) {
  const res = await api.post("/hiring/events", data);
  return res.data;
}

export async function updateHiringEvent(id, data) {
  const res = await api.put(`/hiring/events/${id}`, data);
  return res.data;
}

export async function deleteHiringEvent(id) {
  const res = await api.delete(`/hiring/events/${id}`);
  return res.data;
}

// ── Contracts ─────────────────────────────────────────────────────────────────

export async function getContracts() {
  try {
    const res = await api.get("/hiring/contracts");
    return res.data;
  } catch (err) {
    console.error("getContracts:", err);
    return [];
  }
}

export async function createContract(data) {
  const res = await api.post("/hiring/contracts", data);
  return res.data;
}

export async function updateContract(id, data) {
  const res = await api.put(`/hiring/contracts/${id}`, data);
  return res.data;
}

export async function deleteContract(id) {
  const res = await api.delete(`/hiring/contracts/${id}`);
  return res.data;
}

export async function moveToOnboarding(applicantId) {
  const res = await api.post(
    `/hiring/applicants/${applicantId}/move-to-onboarding`,
  );
  return res.data;
}

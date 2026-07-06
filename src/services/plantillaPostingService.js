import api from "@/api/api";

// ── Shared helpers ────────────────────────────────────────────────────────────

function unwrapPaginated(payload) {
  if (Array.isArray(payload)) {
    return { data: payload, total: payload.length };
  }
  if (payload && Array.isArray(payload.data)) {
    return payload;
  }
  return { data: [], total: 0 };
}

function unwrapArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.data)) return payload.data;
  return [];
}

function isCancellation(err) {
  return err?.name === "CanceledError" || err?.code === "ERR_CANCELED";
}

export const plantillaPostingService = {
  // ── Employee-facing ──────────────────────────────────────────────────────

  async getAvailablePostings(params = {}, config = {}) {
    try {
      const res = await api.get("/plantilla-postings/available", {
        params,
        signal: config.signal,
      });
      return unwrapPaginated(res.data);
    } catch (err) {
      if (isCancellation(err)) throw err;
      console.error("getAvailablePostings:", err);
      return { data: [], total: 0 };
    }
  },

  async applyToPosting(postingId, { notes, certified, documents }) {
    const formData = new FormData();
    if (notes) formData.append("notes", notes);
    formData.append("certified", certified ? "1" : "0");

    Object.entries(documents || {}).forEach(([key, file]) => {
      if (file) formData.append(`documents[${key}]`, file);
    });

    const res = await api.post(
      `/plantilla-postings/${postingId}/apply`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return res.data;
  },

  async getMyApplications() {
    try {
      const res = await api.get("/plantilla-postings/my-applications");
      return unwrapArray(res.data);
    } catch (err) {
      console.error("getMyApplications:", err);
      return [];
    }
  },

  // ── Admin: postings CRUD ─────────────────────────────────────────────────

  async getPostings(params = {}, config = {}) {
    try {
      const res = await api.get("/plantilla-postings", {
        params,
        signal: config.signal,
      });
      return unwrapPaginated(res.data);
    } catch (err) {
      if (isCancellation(err)) throw err;
      console.error("getPostings:", err);
      return { data: [], total: 0 };
    }
  },

  async getPosting(id) {
    const res = await api.get(`/plantilla-postings/${id}`);
    return res.data;
  },

  async getVacantItems() {
    try {
      const res = await api.get("/plantilla-postings/vacant-items");
      return unwrapArray(res.data);
    } catch (err) {
      console.error("getVacantItems:", err);
      return [];
    }
  },

  async createPosting(data) {
    const res = await api.post("/plantilla-postings", data);
    return res.data;
  },

  async updatePosting(id, data) {
    const res = await api.patch(`/plantilla-postings/${id}`, data);
    return res.data;
  },

  async deletePosting(id) {
    const res = await api.delete(`/plantilla-postings/${id}`);
    return res.data;
  },

  // ── Admin: applications review ───────────────────────────────────────────

  async getApplicationsForPosting(postingId) {
    try {
      const res = await api.get(
        `/plantilla-postings/${postingId}/applications`,
      );
      return unwrapArray(res.data);
    } catch (err) {
      console.error("getApplicationsForPosting:", err);
      return [];
    }
  },

  async getAllApplications(params = {}) {
    try {
      const res = await api.get("/plantilla-posting-applications", { params });
      return unwrapArray(res.data);
    } catch (err) {
      console.error("getAllApplications:", err);
      return [];
    }
  },

  async reviewApplication(applicationId, { status, remarks }) {
    const res = await api.patch(
      `/plantilla-posting-applications/${applicationId}/review`,
      { status, remarks },
    );
    return res.data;
  },

  documentDownloadUrl(documentId) {
    return `/plantilla-posting-applications/documents/${documentId}/download`;
  },

  // ── Admin: PSB interviews ─────────────────────────────────────────────────

  async getApplicationInterview(applicationId) {
    try {
      const res = await api.get(
        `/plantilla-applications/${applicationId}/interview`,
      );
      return res.data;
    } catch (err) {
      if (err?.response?.status === 404) return null;
      console.error("getApplicationInterview:", err);
      throw err;
    }
  },

  async saveApplicationInterview(applicationId, payload) {
    const res = await api.put(
      `/plantilla-applications/${applicationId}/interview`,
      payload,
    );
    return res.data;
  },
};

export default plantillaPostingService;

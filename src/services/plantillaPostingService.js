// src/services/plantillaPostingService.js
import api from "@/api/api";

export const plantillaPostingService = {
  /* ---------------------------------------------------------------
   * Employee-facing
   * ------------------------------------------------------------- */

  // Only postings that currently have a vacant slot (backend already
  // filters this — do NOT re-filter "vacant only" on the frontend).
  async getAvailablePostings(params = {}) {
    const res = await api.get("/plantilla-postings/available", { params });
    return res.data;
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
    const res = await api.get("/plantilla-postings/my-applications");
    return res.data;
  },

  /* ---------------------------------------------------------------
   * Admin
   * ------------------------------------------------------------- */

  async getPostings(params = {}) {
    const res = await api.get("/plantilla-postings", { params });
    return res.data;
  },

  async getPosting(id) {
    const res = await api.get(`/plantilla-postings/${id}`);
    return res.data;
  },

  async getVacantItems() {
    const res = await api.get("/plantilla-postings/vacant-items");
    return res.data;
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

  async getApplicationsForPosting(postingId) {
    const res = await api.get(`/plantilla-postings/${postingId}/applications`);
    return res.data;
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
};

export default plantillaPostingService;

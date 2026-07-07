import api from "@/api/api";

export const AnnouncementsApi = {
  list(params) {
    return api.get("/announcements", { params }).then((r) => r.data);
  },
  get(id) {
    return api.get(`/announcements/${id}`).then((r) => r.data);
  },
  create(formData) {
    return api
      .post("/announcements", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },
  update(id, formData) {
    formData.append("_method", "PUT");
    return api
      .post(`/announcements/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },
  destroy(id) {
    return api.delete(`/announcements/${id}`).then((r) => r.data);
  },
  togglePin(id) {
    return api.post(`/announcements/${id}/pin`).then((r) => r.data);
  },
  toggleArchive(id) {
    return api.post(`/announcements/${id}/archive`).then((r) => r.data);
  },
  markViewed(id) {
    return api.post(`/announcements/${id}/view`).then((r) => r.data);
  },
  react(id, type) {
    return api.post(`/announcements/${id}/react`, { type }).then((r) => r.data);
  },
  viewers(id) {
    return api.get(`/announcements/${id}/viewers`).then((r) => r.data);
  },
  getComments(id) {
    return api.get(`/announcements/${id}/comments`).then((r) => r.data);
  },
  addComment(id, body, parentId = null) {
    return api
      .post(`/announcements/${id}/comments`, { body, parent_id: parentId })
      .then((r) => r.data);
  },
  updateComment(commentId, body) {
    return api
      .put(`/announcements/comments/${commentId}`, { body })
      .then((r) => r.data);
  },
  deleteComment(commentId) {
    return api
      .delete(`/announcements/comments/${commentId}`)
      .then((r) => r.data);
  },
  deleteAttachment(attachmentId) {
    return api
      .delete(`/announcement-attachments/${attachmentId}`)
      .then((r) => r.data);
  },
  async downloadAttachment(attachmentId, filename) {
    const res = await api.get(
      `/announcement-attachments/${attachmentId}/download`,
      {
        responseType: "blob",
      },
    );
    const url = URL.createObjectURL(res.data);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },

  async previewAttachment(attachmentId) {
    const res = await api.get(
      `/announcement-attachments/${attachmentId}/download`,
      {
        responseType: "blob",
      },
    );
    return URL.createObjectURL(res.data);
  },
};

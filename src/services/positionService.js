import api from "@/api/api";

// ─── COS Positions ────────────────────────────────────────────────────────────

export const cosPositionService = {
  /** GET /api/cos-positions?search=&per_page= */
  getAll: (params = {}) =>
    api.get("/cos-positions", { params }).then((r) => r.data),

  /** GET /api/cos-positions/:id */
  getOne: (id) => api.get(`/cos-positions/${id}`).then((r) => r.data),

  /** POST /api/cos-positions */
  create: (payload) => api.post("/cos-positions", payload).then((r) => r.data),

  /** PUT /api/cos-positions/:id */
  update: (id, payload) =>
    api.put(`/cos-positions/${id}`, payload).then((r) => r.data),

  /** DELETE /api/cos-positions/:id */
  remove: (id) => api.delete(`/cos-positions/${id}`).then((r) => r.data),
};

// ─── Consultant Positions ─────────────────────────────────────────────────────

export const consultantPositionService = {
  /** GET /api/consultant-positions?search=&per_page= */
  getAll: (params = {}) =>
    api.get("/consultant-positions", { params }).then((r) => r.data),

  /** GET /api/consultant-positions/:id */
  getOne: (id) => api.get(`/consultant-positions/${id}`).then((r) => r.data),

  /** POST /api/consultant-positions */
  create: (payload) =>
    api.post("/consultant-positions", payload).then((r) => r.data),

  /** PUT /api/consultant-positions/:id */
  update: (id, payload) =>
    api.put(`/consultant-positions/${id}`, payload).then((r) => r.data),

  /** DELETE /api/consultant-positions/:id */
  remove: (id) => api.delete(`/consultant-positions/${id}`).then((r) => r.data),
};

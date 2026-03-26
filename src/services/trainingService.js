// src/services/trainingService.js
import api from "../api/api";

const TrainingService = {
  getAll: (params = {}) => api.get("/trainings", { params }),

  getSummary: () => api.get("/trainings/summary"),

  get: (id) => api.get(`/trainings/${id}`),

  create: (data) => api.post("/trainings", data),

  update: (id, data) => api.put(`/trainings/${id}`, data),

  remove: (id) => api.delete(`/trainings/${id}`),

  // ── Participants ───────────────────────────────────────────────────────────

  /**
   * Sync the full participant list for a training.
   * Sending [] removes all participants — backend handles this correctly.
   *
   * @param {number}   trainingId
   * @param {number[]} employeeIds
   */
  assignParticipants: (trainingId, employeeIds) =>
    api.post(`/trainings/${trainingId}/participants`, {
      employee_ids: employeeIds ?? [],
    }),

  updateParticipant: (trainingId, employeeId, data) =>
    api.patch(`/trainings/${trainingId}/participants/${employeeId}`, data),

  removeParticipant: (trainingId, employeeId) =>
    api.delete(`/trainings/${trainingId}/participants/${employeeId}`),

  join: (trainingId) => api.post(`/trainings/${trainingId}/join`),
};

export default TrainingService;

import api from "@/api/api";

// ─── Plantilla Items (master records) ────────────────────────────────────────
export const plantillaItemService = {
  async getPlantillaItems(params = {}) {
    const res = await api.get("/plantilla-items", { params });
    return res.data;
  },

  async createPlantillaItem(data) {
    const res = await api.post("/plantilla-items", data);
    return res.data;
  },

  async updatePlantillaItem(id, data) {
    const res = await api.put(`/plantilla-items/${id}`, data);
    return res.data;
  },

  async deletePlantillaItem(id) {
    const res = await api.delete(`/plantilla-items/${id}`);
    return res.data;
  },

  async getSalaryGrades() {
    const res = await api.get("/salary-grades");
    return res.data;
  },

  async getStepsBySalaryGrade(salaryGradeId) {
    const res = await api.get("/step-increments", {
      params: { salary_grade_id: salaryGradeId },
    });
    return res.data;
  },
};

// ─── Plantilla Positions (individual slots) ───────────────────────────────────
export const plantillaPositionService = {
  async getPositions(params = {}) {
    const res = await api.get("/plantilla-positions", { params });
    return res.data;
  },

  async getPositionById(id) {
    const res = await api.get(`/plantilla-positions/${id}`);
    return res.data;
  },

  async updatePosition(id, data) {
    const res = await api.put(`/plantilla-positions/${id}`, data);
    return res.data;
  },

  async deletePosition(id) {
    const res = await api.delete(`/plantilla-positions/${id}`);
    return res.data;
  },

  async approvePosition(id) {
    const res = await api.patch(`/plantilla-positions/${id}/approve`);
    return res.data;
  },

  // Fetch step increments for a position's own salary grade
  async getStepsByPosition(positionId) {
    const res = await api.get(`/plantilla-positions/${positionId}/steps`);
    return res.data;
  },
};

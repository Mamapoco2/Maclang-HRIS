import api from "@/api/api";

export const plantillaItemService = {
  async getPlantillaItems(params = {}) {
    const res = await api.get("/plantilla-items", { params });
    return res.data;
  },

  async getPlantillaItemById(id) {
    const res = await api.get(`/plantilla-items/${id}`);
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

  getSalaryGrades: async () => {
    const res = await api.get("/salary-grades");
    return res.data;
  },

  getStepsBySalaryGrade: async (salaryGradeId) => {
    const res = await api.get("/step-increments", {
      params: { salary_grade_id: salaryGradeId },
    });
    return res.data;
  },
};

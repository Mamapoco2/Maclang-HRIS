import api from "@/api/api";

export const manpowerService = {
  /**
   * Get all departments organized by division
   * with employees categorized by role
   */
  async getDepartments(params = {}) {
    const res = await api.get("/manpower/departments", { params });
    return res.data;
  },

  /**
   * Get detailed view of a single department
   */
  async getDepartmentDetail(departmentId) {
    const res = await api.get(`/manpower/department/${departmentId}`);
    return res.data;
  },

  /**
   * Get organization summary by division
   */
  async getSummary() {
    const res = await api.get("/manpower/summary");
    return res.data;
  },

  /**
   * Get count statistics (plantilla, COS, consultant, vacant) - batch fetch
   */
  async getCounts() {
    const [plantilla, cos, consultant, vacant] = await Promise.all([
      api.get("/manpower/plantilla-count"),
      api.get("/manpower/cos-count"),
      api.get("/manpower/consultant-count"),
      api.get("/manpower/vacant-count"),
    ]);

    return {
      plantilla: plantilla.data.count,
      cos: cos.data.count,
      consultant: consultant.data.count,
      vacant: vacant.data.count,
    };
  },

  /**
   * Get plantilla employee count
   */
  async getPlantillaCount() {
    const res = await api.get("/manpower/plantilla-count");
    return res.data.count;
  },

  /**
   * Get Contract of Service employee count
   */
  async getCosCount() {
    const res = await api.get("/manpower/cos-count");
    return res.data.count;
  },

  /**
   * Get consultant employee count
   */
  async getConsultantCount() {
    const res = await api.get("/manpower/consultant-count");
    return res.data.count;
  },

  /**
   * Get vacant positions count
   */
  async getVacantCount() {
    const res = await api.get("/manpower/vacant-count");
    return res.data.count;
  },
};

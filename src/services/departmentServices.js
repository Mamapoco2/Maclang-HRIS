import api from "@/api/api";

export const departmentService = {
  async getDepartments(params = {}) {
    const res = await api.get("/departments", { params });
    return res.data;
  },
};

import api from "@/api/api";

export const employeeService = {
  async getEmployees(params = {}) {
    const res = await api.get("/employees", { params });
    return res.data;
  },

  async getAllEmployees() {
    const res = await api.get("/employees", { params: { per_page: 9999 } });
    return { data: res.data?.data ?? res.data };
  },

  async addEmployee(payload) {
    const res = await api.post("/employees", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  async updateEmployee(id, payload) {
    if (payload instanceof FormData) {
      const cleaned = new FormData();
      for (const [key, value] of payload.entries()) {
        if (value === "") continue;
        cleaned.append(key, value);
      }
      if (!cleaned.has("_method")) cleaned.append("_method", "PUT");

      const res = await api.post(`/employees/${id}`, cleaned, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    }

    const res = await api.post(`/employees/${id}?_method=PUT`, payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  async deleteEmployee(id) {
    const res = await api.delete(`/employees/${id}`);
    return res.data;
  },

  async getPlantillaItems(employeeId = null) {
    const res = await api.get("/plantilla-items", {
      params: { employee_id: employeeId },
    });
    return res.data;
  },

  async getDivisions() {
    const res = await api.get("/divisions");
    return Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
  },

  async getDepartments() {
    const res = await api.get("/departments");
    return res.data;
  },

  async getGenderCount() {
    const res = await api.get("/employees/gender-count");
    return res.data;
  },

  getStepsByPlantilla(id) {
    return api.get(`/plantilla-items/${id}/steps`);
  },
};

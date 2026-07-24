import api from "@/api/api";

export const employeeService = {
  async getAll(params = {}) {
    const res = await api.get("/employees", { params });
    return res.data;
  },

  async getEmployees(params = {}) {
    const res = await api.get("/employees", { params });
    return res.data;
  },

  async getAllEmployees(params = {}) {
    const res = await api.get("/employees", { params });
    return res.data;
  },

  async getById(id) {
    const res = await api.get(`/employees/${id}`);
    return res.data;
  },

  async getAssignablePositions(employeeId = null) {
    const params = { per_page: 999 };
    if (employeeId) params.employee_id = employeeId;

    const res = await api.get("/plantilla-positions", { params });

    const list = res.data?.data ?? res.data ?? [];

    const arr = Array.isArray(list) ? list : [];

    return arr.map((pos) => {
      const computedStatus = (
        pos.computed_status ??
        pos.status ??
        ""
      ).toUpperCase();
      const isVacant =
        computedStatus === "VACANT" || computedStatus === "UNFILLED";

      return {
        ...pos,
        item_number: pos.item_number ?? pos.position_slot_name ?? "",
        is_assignable: pos.is_assignable ?? isVacant,
        is_current_employee:
          pos.is_current_employee ??
          (employeeId != null &&
            pos.active_assignments?.some?.(
              (a) => String(a.employee_id) === String(employeeId),
            )),
      };
    });
  },

  async getTeam(config = {}) {
    const res = await api.get("/team", config);
    return res.data;
  },

  async getStepsByPosition(positionId) {
    const res = await api.get(`/plantilla-positions/${positionId}/steps`);
    return res.data;
  },

  async addEmployee(data) {
    const res = await api.post("/employees", data);
    return res.data;
  },

  async create(data) {
    const res = await api.post("/employees", data);
    return res.data;
  },

  async updateEmployee(id, data) {
    const res = await api.post(`/employees/${id}?_method=PUT`, data);
    return res.data;
  },

  async update(id, data) {
    const res = await api.put(`/employees/${id}`, data);
    return res.data;
  },

  async delete(id) {
    const res = await api.delete(`/employees/${id}`);
    return res.data;
  },

  async getNonRoot(params = {}) {
    const res = await api.get("/employees/non-root", { params });
    return res.data;
  },

  async getGenderCount() {
    const res = await api.get("/employees/gender-count");
    return res.data;
  },

  async getAvatar(id) {
    const res = await api.get(`/employees/${id}/avatar`);
    return res.data;
  },

  async search(term, params = {}) {
    const res = await api.get("/employees", {
      params: { ...params, search: term },
    });
    return res.data;
  },

  async getDivisions() {
    const res = await api.get("/divisions");
    return res.data;
  },

  async getDepartments(divisionId = null) {
    const params = divisionId ? { division_id: divisionId } : {};
    const res = await api.get("/departments", { params });
    return res.data;
  },

  async getDepartmentById(id) {
    const res = await api.get(`/departments/${id}`);
    return res.data;
  },

  async getSalaryGrades() {
    const res = await api.get("/salary-grades");
    return res.data;
  },

  async getStepIncrements() {
    const res = await api.get("/step-increments");
    return res.data;
  },

  async getPlantillaItems(params = {}) {
    const res = await api.get("/plantilla-items", { params });
    return res.data;
  },

  async getAvailablePlantillaItems() {
    const res = await api.get("/plantilla-items/available");
    return res.data;
  },

  async getPlantillaItemsSummary() {
    const res = await api.get("/plantilla-items/summary");
    return res.data;
  },

  async getPlantillaPositions(params = {}) {
    const res = await api.get("/plantilla-positions", { params });
    return res.data;
  },

  async getEmployeeAssignments(employeeId) {
    const res = await api.get(`/assignments/employee/${employeeId}`);
    return res.data;
  },

  async getEmployeeDepartmentAssignments(employeeId) {
    const res = await api.get(
      `/employees/${employeeId}/department-assignments`,
    );
    return res.data;
  },

  async createDepartmentAssignment(employeeId, data) {
    const res = await api.post(
      `/employees/${employeeId}/department-assignments`,
      data,
    );
    return res.data;
  },

  async updateDepartmentAssignment(employeeId, assignmentId, data) {
    const res = await api.patch(
      `/employees/${employeeId}/department-assignments/${assignmentId}`,
      data,
    );
    return res.data;
  },

  async deleteDepartmentAssignment(employeeId, assignmentId) {
    const res = await api.delete(
      `/employees/${employeeId}/department-assignments/${assignmentId}`,
    );
    return res.data;
  },

  async getCosPositions(search = "") {
    const params = { per_page: 200 };
    if (search) params.search = search;
    const res = await api.get("/cos-positions", { params });
    return res.data?.data ?? res.data ?? [];
  },

  async getConsultantPositions(search = "") {
    const params = { per_page: 200 };
    if (search) params.search = search;
    const res = await api.get("/consultant-positions", { params });
    return res.data?.data ?? res.data ?? [];
  },

  async getPendingPlantillaProvision(employeeId) {
    if (!employeeId) return { pending: false };
    try {
      const res = await api.get(
        `/employees/${employeeId}/pending-plantilla-provision`,
      );
      return res.data;
    } catch (err) {
      console.error("getPendingPlantillaProvision:", err);
      return { pending: false };
    }
  },
};

import api from "@/api/api";

export const plantillaPositionService = {
  async getPositions(params = {}) {
    const res = await api.get("/plantilla-positions", { params });
    return res.data;
  },

  async getPositionById(id) {
    const res = await api.get(`/plantilla-positions/${id}`);
    return res.data;
  },

  async getPlantillaItems() {
    let allPositions = [];
    let page = 1;
    let lastPage = 1;

    do {
      const res = await api.get("/plantilla-positions", {
        params: { per_page: 100, page },
      });

      const data = res.data?.data ?? [];
      allPositions = allPositions.concat(data);

      lastPage = res.data?.pagination?.last_page ?? 1;
      page++;
    } while (page <= lastPage);

    const map = new Map();

    for (const pos of allPositions) {
      const key = pos.base_item_number;

      if (!map.has(key)) {
        map.set(key, {
          id: key,
          base_item_number: pos.base_item_number,
          title: pos.title ?? "",
          description: pos.description ?? "",
          department_ids: pos.department_ids ?? [],
          approved_slots: 0,
          filled_count: 0,
          vacant_count: 0,
          unfilled_count: 0,
          positions: [],
        });
      }

      const group = map.get(key);
      const status = (pos.status ?? "").toUpperCase();

      group.positions.push(pos);
      group.approved_slots += 1;

      if (status === "FILLED") group.filled_count += 1;
      else if (status === "VACANT") group.vacant_count += 1;
      else group.unfilled_count += 1;
    }

    return [...map.values()];
  },

  async createPlantillaItem(data) {
    const res = await api.post("/plantilla-positions", data);
    return res.data;
  },

  async createItem(data) {
    const res = await api.post("/plantilla-positions", data);
    return res.data;
  },

  // FIX: Accept optional slot config so inherited SG/Step/role/dept are
  // forwarded to the backend instead of being silently dropped.
  async addSlots(baseItemNumber, count, slotConfig = {}) {
    const payload = {
      base_item_number: baseItemNumber,
      count,
    };

    // Only include defined, non-null values so the backend can apply its own
    // defaults for fields the caller didn't specify.
    if (slotConfig.salary_grade_id != null)
      payload.salary_grade_id = slotConfig.salary_grade_id;
    if (slotConfig.step_increment_id != null)
      payload.step_increment_id = slotConfig.step_increment_id;
    if (slotConfig.role != null) payload.role = slotConfig.role;
    if (slotConfig.display_department_id != null)
      payload.display_department_id = slotConfig.display_department_id;
    if (slotConfig.display_division_id != null)
      payload.display_division_id = slotConfig.display_division_id;

    const res = await api.post("/plantilla-positions/add-slots", payload);
    return res.data;
  },

  async updatePosition(id, data) {
    const res = await api.patch(`/plantilla-positions/${id}`, data);
    return res.data;
  },

  async deletePosition(id) {
    const res = await api.delete(`/plantilla-positions/${id}`);
    return res.data;
  },

  async bulkDelete(ids) {
    const res = await api.post("/plantilla-positions/bulk-delete", { ids });
    return res.data;
  },

  async restorePosition(id) {
    const res = await api.patch(`/plantilla-positions/${id}/restore`);
    return res.data;
  },

  async approvePosition(id) {
    const res = await api.post(`/plantilla-positions/${id}/approve`);
    return res.data;
  },

  async getSalaryConfig(positionId) {
    const res = await api.get(
      `/plantilla-positions/${positionId}/salary-config`,
    );
    return res.data;
  },

  async getStepsByPosition(positionId) {
    const res = await api.get(`/plantilla-positions/${positionId}/steps`);
    return res.data;
  },

  async getSummary() {
    const res = await api.get("/plantilla-positions/summary/all");
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

export const plantillaItemService = plantillaPositionService;

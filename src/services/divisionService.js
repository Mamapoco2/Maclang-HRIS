import api from "@/api/api";

export const divisionService = {
  getAll: () => api.get("/divisions").then((res) => res.data),
};

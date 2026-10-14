import api from "@/api/api";

export const getShifts = async () => {
  const { data } = await api.get("/dtr/shifts");

  return {
    shifts: Array.isArray(data?.data) ? data.data : [],
    departments: Array.isArray(data?.meta?.departments)
      ? data.meta.departments
      : [],
  };
};

export const createShift = async (payload) => {
  const { data } = await api.post("/dtr/shifts", payload);

  return data.data;
};

export const updateShift = async (id, payload) => {
  const { data } = await api.put(`/dtr/shifts/${id}`, payload);

  return data.data;
};

export const deleteShift = async (id) => {
  await api.delete(`/dtr/shifts/${id}`);
};
import api from "@/api/api";

export const getShifts = async () => {
  const { data } = await api.get("/dtr/shifts");

  return Array.isArray(data?.data) ? data.data : [];
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

export const getShiftAssignments = async ({
  q,
  shift,
  sort,
  direction,
  page,
  perPage,
} = {}) => {
  const { data } = await api.get("/dtr/shift-assignments", {
    params: {
      ...(q && { q }),
      ...(shift && { shift }),
      ...(sort && { sort }),
      ...(direction && { direction }),
      ...(page && { page }),
      ...(perPage && { per_page: perPage }),
    },
  });

  return {
    rows: Array.isArray(data?.data) ? data.data : [],
    currentPage: data?.current_page ?? 1,
    lastPage: data?.last_page ?? 1,
    total: data?.total ?? 0,
  };
};

export const assignShift = async (employeeIds, shiftId) => {
  const { data } = await api.put("/dtr/shift-assignments", {
    employee_ids: employeeIds,
    shift_id: shiftId,
  });

  return data.updated;
};
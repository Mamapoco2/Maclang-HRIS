import api from "@/api/api";

export const getScheduleDepartments = async ({ month, year }) => {
  const { data } = await api.get("/dtr/schedules/departments", {
    params: { month, year },
  });

  return {
    rows: Array.isArray(data?.data) ? data.data : [],
    period: data?.period ?? null,
  };
};

export const getSchedule = async ({ departmentId, month, year }) => {
  const { data } = await api.get("/dtr/schedules", {
    params: { department_id: departmentId, month, year },
  });

  return data.data;
};

export const saveSchedule = async ({ departmentId, month, year, entries }) => {
  const { data } = await api.put("/dtr/schedules", {
    department_id: departmentId,
    month,
    year,
    entries,
  });

  return data.data;
};

export const submitSchedule = async (scheduleId) => {
  const { data } = await api.post(`/dtr/schedules/${scheduleId}/submit`);

  return data.data;
};

export const approveSchedule = async (scheduleId) => {
  const { data } = await api.post(`/dtr/schedules/${scheduleId}/approve`);

  return data.data;
};

export const returnSchedule = async (scheduleId, remarks) => {
  const { data } = await api.post(`/dtr/schedules/${scheduleId}/return`, {
    remarks,
  });

  return data.data;
};

export const getChangeOffs = async ({ departmentId, month, year }) => {
  const { data } = await api.get("/dtr/change-offs", {
    params: { department_id: departmentId, month, year },
  });

  return Array.isArray(data?.data) ? data.data : [];
};

export const requestChangeOff = async (
  scheduleId,
  { employeeId, workDate, shiftId, reason },
) => {
  const { data } = await api.post(`/dtr/schedules/${scheduleId}/change-offs`, {
    employee_id: employeeId,
    work_date: workDate,
    shift_id: shiftId,
    reason,
  });

  return data.data;
};

export const approveChangeOff = async (changeOffId) => {
  const { data } = await api.post(`/dtr/change-offs/${changeOffId}/approve`);

  return data.data;
};

export const rejectChangeOff = async (changeOffId, remarks) => {
  const { data } = await api.post(`/dtr/change-offs/${changeOffId}/reject`, {
    remarks,
  });

  return data.data;
};

export const getSchedulers = async (departmentId) => {
  const { data } = await api.get("/dtr/schedulers", {
    params: { department_id: departmentId },
  });

  return Array.isArray(data?.data) ? data.data : [];
};

export const assignScheduler = async ({ departmentId, employeeId }) => {
  const { data } = await api.post("/dtr/schedulers", {
    department_id: departmentId,
    employee_id: employeeId,
  });

  return data.data;
};

export const removeScheduler = async (schedulerId) => {
  await api.delete(`/dtr/schedulers/${schedulerId}`);
};

import api from "@/api/api";

export const recordAttendance = async (name, image) => {
  const { data } = await api.post("/attendance", { name, image });
  return data;
};

export const getAttendanceRecords = async ({ from, to, q } = {}) => {
  const { data } = await api.get("/dtr/records", {
    params: { per_page: 500, from, to, q },
  });
  return Array.isArray(data?.data) ? data.data : [];
};

export const getEmployeeDtrCutoff = async (employeeNumber, month, year) => {
  const { data } = await api.get(
    `/dtr/employees/${encodeURIComponent(employeeNumber)}/dtr`,
    { params: { month, year } },
  );
  return data;
};

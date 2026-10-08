import api from "@/api/api";

export const recordAttendance = async (name, image) => {
  const { data } = await api.post("/attendance", { name, image });
  return data;
};

export const getAttendanceRecords = async ({ from, to, q } = {}) => {
  const { data } = await api.get("/dtr/records", {
    params: {
      per_page: 500,
      ...(from && { from }),
      ...(to && { to }),
      ...(q && { q }),
    },
  });

  return Array.isArray(data?.data) ? data.data : [];
};

export const getEmployeeDtrCutoff = async (employeeNumber, month, year) => {
  const { data } = await api.get(
    `/dtr/form/employees/${encodeURIComponent(employeeNumber)}/dtr`,
    {
      params: {
        month,
        year,
      },
    },
  );

  return data;
};

export const createAttendanceRecord = async (formData) => {
  const { data } = await api.post("/dtr/attendances", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
};

export const updateAttendanceRecord = async (id, formData) => {
  formData.append("_method", "PUT");

  const { data } = await api.post(`/dtr/attendances/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
};

export const lookupDtrEmployee = async (employeeNumber) => {
  const { data } = await api.get("/dtr/employees-by-number", {
    params: { employee_number: employeeNumber },
  });
  return data?.employee ?? null;
};

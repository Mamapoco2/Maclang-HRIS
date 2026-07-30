// src/api/attendance.js
import api from "@/api/api";

export const recordAttendance = async (name, image) => {
  const { data } = await api.post("/attendance", { name, image });
  return data;
};

export const getAttendanceRecords = async () => {
  const { data } = await api.get("/attendance-records");
  return data;
};

export const getEmployeeDtr = async (employeeNumber, month, year) => {
  const { data } = await api.get("/employee-dtr", {
    params: {
      employee_number: employeeNumber,
      month: String(month),
      year: String(year),
    },
  });
  return data;
};

export const getEmployeeDtrCutoff = async (employeeNumber, month, year) => {
  const { data } = await api.get("/employee-dtr-cutoff", {
    params: {
      employee_number: employeeNumber,
      month: String(month),
      year: String(year),
    },
  });
  return data;
};

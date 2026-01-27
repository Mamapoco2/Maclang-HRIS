import axios from "axios";

/* Axios instance */
export const api = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/* Bearer token interceptor */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* API functions */
export const getEmployees = async () => {
  try {
    const res = await api.get("/employees");
    console.log("Employees response:", res);
    return res.data;
  } catch (error) {
    console.error("Get employees error:", error.response || error);
    throw error;
  }
};

export const addEmployee = async (data) => {
  const res = await api.post("/employees", data);
  return res.data;
};

export const updateEmployee = async (id, data) => {
  const res = await api.put(`/employees/${id}`, data);
  return res.data;
};

export const deleteEmployee = async (id) => {
  await api.delete(`/employees/${id}`);
  return true;
};

export const employeeService = {
  getEmployees,
  addEmployee,
  updateEmployee,
  deleteEmployee,
};

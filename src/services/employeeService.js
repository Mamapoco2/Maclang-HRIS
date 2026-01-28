import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export const getEmployees = async (page = 1, perPage = 50) => {
  const res = await api.get(`/employees?page=${page}&per_page=${perPage}`);
  return res.data; // includes data, meta, links
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

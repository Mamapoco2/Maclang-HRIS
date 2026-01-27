import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

export const getPlantillaCount = async () => {
  try {
    const res = await api.get("/manpower/plantilla/count");
    return res.data.count;
  } catch (error) {
    console.error("Get plantilla count error:", error);
    throw error;
  }
};

export const getCOSCount = async () => {
  try {
    const res = await api.get("/manpower/cos/count");
    return res.data.count;
  } catch (error) {
    console.error("Get COS count error:", error);
    throw error;
  }
};

export const getConsultantCount = async () => {
  try {
    const res = await api.get("/manpower/consultant/count");
    return res.data.count;
  } catch (error) {
    console.error("Get consultant count error:", error);
    throw error;
  }
};

export const getVacantCount = async () => {
  try {
    const res = await api.get("/manpower/vacant/count");
    return res.data.count;
  } catch (error) {
    console.error("Get vacant count error:", error);
    throw error;
  }
};

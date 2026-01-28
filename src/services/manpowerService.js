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
  (error) => Promise.reject(error),
);

export const getEmploymentSummary = async () => {
  try {
    const res = await api.get("employees/employment-status/summary");
    return {
      Plantilla: res.data.Plantilla,
      COS: res.data["Contract Of Service"],
      Consultant: res.data.Consultant,
    };
  } catch (error) {
    console.error("Get employment summary error:", error);
    throw error;
  }
};

// Vacant count (still separate)
export const getVacantCount = async () => {
  try {
    const res = await api.get("/manpower/vacant/count");
    return res.data.count;
  } catch (error) {
    console.error("Get vacant count error:", error);
    throw error;
  }
};

export const getManPowerData = async () => {
  try {
    const res = await api.get("/org-chart/department");
    return res.data.count;
  } catch (error) {
    console.error("Couldnt get the Man Power Data");
    throw error;
  }
};

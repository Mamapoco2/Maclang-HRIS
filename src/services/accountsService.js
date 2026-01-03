import axios from "axios";
import { toast } from "sonner";

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

export const getUsers = async () => {
  try {
    const res = await api.get("/pending-users");
    return res.data;
  } catch (error) {
    console.error("Get users error:", error);
    toast.error("Failed to load users");
    throw error;
  }
};

export const activateUser = async (id) => {
  try {
    const res = await api.patch(`/users/${id}/activate`);
    toast.success(res.data.message);
    return res.data.user;
  } catch (error) {
    console.error("Activate user error:", error);
    toast.error("Failed to activate user");
    throw error;
  }
};

export const getPendingUserCount = async () => {
  try {
    const res = await api.get("/pending-users/count");
    return res.data.count;
  } catch (error) {
    console.error("Get pending user count error:", error);
    toast.error("Failed to load pending user count");
    throw error;
  }
};

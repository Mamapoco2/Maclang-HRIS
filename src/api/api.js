// src/api/api.js
import axios from "axios";
import { getToken, clearAuth } from "@/lib/tokenStorage";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const url = err.config?.url ?? "";

    if (status === 401) {
      const isProfileCheck = url.includes("/profile/status");
      const isAlreadyOnLogin = window.location.pathname === "/login";

      if (!isProfileCheck && !isAlreadyOnLogin) {
        clearAuth();
        window.location.href = "/login";
      }
    }

    return Promise.reject(err);
  },
);

export default api;

// src/api/api.js
import axios from "axios";
import { getToken, clearAuth } from "@/lib/tokenStorage";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  withCredentials: true,
});

// ─── Request: attach token ────────────────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Response: handle 401 ────────────────────────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const url = err.config?.url ?? "";

    if (status === 401) {
      // Don't redirect for profile/status — ProfileGate handles this gracefully.
      // Don't redirect if we're already on /login (avoids the loop).
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

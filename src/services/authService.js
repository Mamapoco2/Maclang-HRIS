import api from "@/api/api";
import {
  setToken,
  setUser,
  getUser,
  clearAuth,
  getToken,
} from "@/lib/tokenStorage";

const normalizeUser = (user) => ({
  id: user.id,
  username: user.username,
  email: user.email,
  is_active: user.is_active,
  approval_status: user.approval_status,
  roles: user.roles ?? [],
  permissions: user.permissions ?? [],
  given_name: user.given_name ?? null,
  middle_name: user.middle_name ?? null,
  first_name: user.first_name ?? null,
  last_name: user.last_name ?? null,
  avatar_url: user.avatar_url ?? null,
  employee_id: user.employee_id ?? null,
  department_ids: user.department_ids ?? [],
  departments: user.departments ?? [],
  division: user.division ?? null,
  position: user.position ?? null,
  has_completed_orientation: user.has_completed_orientation ?? false,
});

const login = async (username, password) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await api.post(
      "/login",
      { username, password },
      { signal: controller.signal },
    );
    const { token, user } = res.data;
    const normalized = normalizeUser(user);
    setToken(token);
    setUser(normalized);
    return { success: true, user: normalized };
  } catch (err) {
    if (err.code === "ERR_CANCELED" || err.name === "AbortError")
      return { success: false, error: "Request timed out. Please try again." };
    return {
      success: false,
      error: err.response?.data?.message ?? "Login failed. Please try again.",
    };
  } finally {
    clearTimeout(timeout);
  }
};

const register = async (
  given_name,
  middle_name,
  last_name,
  username,
  email,
  password,
  password_confirmation,
) => {
  try {
    const res = await api.post("/register", {
      given_name,
      middle_name: middle_name || null,
      last_name,
      username,
      email,
      password,
      password_confirmation,
    });
    return { success: true, data: res.data };
  } catch (err) {
    return {
      success: false,
      error: err.response?.data?.message ?? "Registration failed.",
    };
  }
};

/**
 * Fire-and-forget server call — caller is responsible for clearing local auth
 * BEFORE calling this so the token is still available for the request header.
 * Returns the axios promise so caller can .catch() if needed.
 */
const logout = () => api.post("/logout");

const me = async () => {
  try {
    const res = await api.get("/me");
    const raw = res.data?.user ?? res.data;
    const user = normalizeUser(raw);
    setUser(user);
    return { success: true, user };
  } catch (err) {
    return {
      success: false,
      error: err.response?.data?.message ?? "Failed to fetch user.",
    };
  }
};

const completeOrientation = async () => {
  try {
    const res = await api.post("/orientation/complete");
    return { success: true, data: res.data };
  } catch (err) {
    return {
      success: false,
      error: err.response?.data?.message ?? "Failed to complete orientation.",
    };
  }
};

export default {
  login,
  register,
  logout,
  me,
  completeOrientation,
  getCurrentUser: getUser,
  getToken,
};

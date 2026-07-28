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
  employee: user.employee
    ? {
        id: user.employee.id ?? null,
        employee_number: user.employee.employee_number ?? null,
        full_name: user.employee.full_name ?? null,
        first_name: user.employee.first_name ?? null,
        middle_name: user.employee.middle_name ?? null,
        last_name: user.employee.last_name ?? null,
        employment_status: user.employee.employment_status ?? null,
        employment_type: user.employee.employment_type ?? null,
        position: user.employee.position ?? null,
        position_designation: user.employee.position_designation ?? [],
        role_position: user.employee.role_position ?? [],
        department: user.employee.department ?? null,
      }
    : null,
  department_ids: user.department_ids ?? [],
  departments: user.departments ?? [],
  division: user.division ?? null,
  position: user.position ?? null,
  has_completed_orientation: user.has_completed_orientation ?? false,
});

const GENERIC_LOGIN_ERROR =
  "We're having trouble signing you in at the moment. Please try again later.";
const getLoginErrorMessage = (err) => {
  const isTimeoutOrOffline =
    err.code === "ERR_CANCELED" || err.name === "AbortError" || !err.response;

  if (isTimeoutOrOffline) {
    return "Unable to connect right now. Please check your internet connection and try again.";
  }

  const status = err.response.status;

  if (status === 422) {
    const usernameError = err.response?.data?.errors?.username?.[0] ?? "";
    if (usernameError.toLowerCase().includes("uppercase")) {
      return "Please enter your username in uppercase letters.";
    }
    return "The username or password you entered is incorrect. Please try again.";
  }

  if (status === 403) {
    return (
      err.response?.data?.message ??
      "Your account isn't active yet. Please contact your administrator for assistance."
    );
  }

  if (status === 429) {
    return "You've tried signing in too many times. Please wait a few minutes before trying again.";
  }

  return GENERIC_LOGIN_ERROR;
};

const login = async (username, password) => {
  if (!username?.trim() || !password) {
    return {
      success: false,
      error: "Please enter both your username and password.",
    };
  }

  if (username !== username.toUpperCase()) {
    return {
      success: false,
      error: "Please enter your username in uppercase letters.",
    };
  }

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
    return { success: false, error: getLoginErrorMessage(err) };
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

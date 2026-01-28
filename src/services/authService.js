import { toast } from "sonner";
import axios from "axios";

const host = window.location.hostname; // detects the current IP/hostname

const api = axios.create({
  baseURL: `http://${host}:8000/api`, // uses LAN IP if accessed from another PC
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true, // needed for cookies/Sanctum
});

// Add token automatically to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  console.log("Attaching token to request:", token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: async (email, password) => {
    try {
      // 1️⃣ Login
      const response = await api.post("/login", { email, password });

      // 2️⃣ Store access token
      localStorage.setItem("token", response.data.access_token);

      // 3️⃣ Fetch user from /me
      const userResponse = await api.get("/me");
      const actualUser = userResponse.data.data; // 👈 grab the nested user object

      localStorage.setItem("user", JSON.stringify(actualUser));

      toast.success("Login successful!");
      return { success: true, user: actualUser };
    } catch (error) {
      console.error("Login error:", error.response || error);
      const message =
        error.response?.data?.message ||
        error.response?.data?.errors?.email?.[0] ||
        "Invalid email or password";
      toast.error(message);
      return { success: false, error: message };
    }
  },

  register: async (data) => {
    try {
      const response = await api.post("/register", {
        firstName: data.firstName,
        lastName: data.lastName,
        middleName: data.middleName,
        suffix: data.suffix,
        email: data.email,
        password: data.password,
        password_confirmation: data.password_confirmation,
      });

      toast.success("Registration successful! Awaiting HR approval.");
      return { success: true, user: response.data.user };
    } catch (error) {
      console.error("Registration error:", error.response || error);

      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const firstError = Object.values(errors)[0][0];
        toast.error(firstError);
        return { success: false, error: firstError, errors };
      }

      const message = error.response?.data?.message || "Registration failed";
      toast.error(message);
      return { success: false, error: message };
    }
  },

  logout: async () => {
    try {
      // Send logout request with token
      await api.post("/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Always clear local storage so user can't stay "logged in"
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      toast.success("Logged out successfully!");
    }
    return { success: true };
  },

  getCurrentUser: () => {
    try {
      const user = localStorage.getItem("user");
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  },

  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },
};

export { api };

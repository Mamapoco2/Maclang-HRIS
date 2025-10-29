import { toast } from "sonner";

export const authService = {
  login: async (username, password) => {
    if (username === "admin" && password === "admin123") {
      toast.success("✅ Login successful!");
      return true;
    }
    toast.error("Invalid username or password");
    return false;
  },
};

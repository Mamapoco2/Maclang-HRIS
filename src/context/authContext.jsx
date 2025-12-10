import { createContext, useState, useEffect } from "react";
import { authService } from "../services/authService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = authService.getCurrentUser();
    if (savedUser) {
      setUser(savedUser);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await authService.login(email, password);
      if (res.success) {
        setUser(res.user);
      }
      return res;
    } catch (error) {
      console.error("Login error in context:", error);
      return { success: false, error: "Login failed" };
    }
  };

  const register = async (name, email, password, password_confirmation) => {
    try {
      const res = await authService.register(
        name,
        email,
        password,
        password_confirmation
      );
      if (res.success) {
        setUser(res.user);
      }
      return res;
    } catch (error) {
      console.error("Register error in context:", error);
      return { success: false, error: "Registration failed" };
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        loading,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

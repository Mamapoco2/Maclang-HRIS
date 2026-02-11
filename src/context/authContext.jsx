import { createContext, useState, useEffect } from "react";
import { authService } from "../services/authService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Optional: background refresh (DO NOT block UI)
    const refreshUser = async () => {
      try {
        const freshUser = await authService.getCurrentUser();
        if (freshUser) setUser(freshUser);
      } finally {
        setLoading(false);
      }
    };

    refreshUser();
  }, []);

  const login = async (email, password) => {
    const res = await authService.login(email, password);
    if (res.success) setUser(res.user);
    return res;
  };

  const register = async (name, email, password, password_confirmation) => {
    const res = await authService.register(
      name,
      email,
      password,
      password_confirmation,
    );
    if (res.success) setUser(res.user);
    return res;
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

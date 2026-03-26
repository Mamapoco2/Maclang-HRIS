import { createContext, useState, useEffect, useCallback } from "react";
import authService from "@/services/authService";
import { getUser, clearAuth, setUser } from "@/lib/tokenStorage";
import { getEcho } from "@/lib/echo";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await authService.me();
      if (res?.success && res.user) {
        setUser(res.user);
        setUserState(res.user);
      }
    } catch (err) {
      console.error("refreshUser error:", err);
    }
  }, []);

  // ── Initial user sync ─────────────────────────────────────────────────────
  useEffect(() => {
    const syncUser = async () => {
      const stored = getUser();
      if (!stored) {
        setLoading(false);
        return;
      }
      try {
        const res = await authService.me();
        if (res?.success && res.user) {
          setUser(res.user);
          setUserState(res.user);
        } else {
          clearAuth();
          setUserState(null);
        }
      } catch (err) {
        console.error("Failed to sync user:", err);
        setUserState(stored);
      } finally {
        setLoading(false);
      }
    };
    syncUser();
  }, []);

  // ── Realtime permission updates ───────────────────────────────────────────
  useEffect(() => {
    if (!user?.id) return;

    const echo = getEcho();
    if (!echo) return;

    const channel = echo.channel(`user.${user.id}`);

    channel.listen(".permissions.updated", () => {
      refreshUser();
    });

    return () => {
      echo.leaveChannel(`user.${user.id}`);
    };
  }, [user?.id, refreshUser]);

  const login = async (email, password) => {
    try {
      const res = await authService.login(email, password);
      if (res?.success) {
        setUserState(res.user);
      }
      return res;
    } catch (err) {
      console.error("Login error:", err);
      return { success: false };
    }
  };

  const register = async (email, password, password_confirmation) => {
    try {
      const res = await authService.register(
        email,
        password,
        password_confirmation,
      );
      return res;
    } catch (err) {
      console.error("Register error:", err);
      return { success: false };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      clearAuth();
      setUserState(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

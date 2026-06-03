import { createContext, useState, useEffect, useCallback, useRef } from "react";
import authService from "@/services/authService";
import { getUser, clearAuth, setUser } from "@/lib/tokenStorage";
import { getEcho } from "@/lib/echo";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionDisplaced, setSessionDisplaced] = useState(false);

  const refreshUser = useCallback(async () => {
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
      console.error("refreshUser error:", err);
    }
  }, []);

  const refreshUserRef = useRef(refreshUser);
  useEffect(() => {
    refreshUserRef.current = refreshUser;
  }, [refreshUser]);

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

  useEffect(() => {
    if (!user?.id) return;

    const echo = getEcho();
    if (!echo) return;

    const channel = echo.private(`user.${user.id}`);

    channel.listen(".permissions.updated", (e) => {
      console.log("🔔 permissions.updated received — refreshing user", e);
      refreshUserRef.current();
    });

    channel.listen(".logged.in.elsewhere", () => {
      clearAuth();
      setUserState(null);
      setSessionDisplaced(true);
    });

    return () => {
      echo.leaveChannel(`user.${user.id}`);
    };
  }, [user?.id]);

  const login = async (username, password) => {
    try {
      const res = await authService.login(username, password);
      if (res?.success) {
        setUserState(res.user);
      }
      return res;
    } catch (err) {
      console.error("Login error:", err);
      return { success: false };
    }
  };

  const register = async (username, email, password, password_confirmation) => {
    try {
      const res = await authService.register(
        username,
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

  const dismissDisplaced = useCallback(() => {
    setSessionDisplaced(true);
  }, []);

  const hasPermission = useCallback(
    (permission) => user?.permissions?.includes(permission) ?? false,
    [user?.permissions],
  );

  const hasRole = useCallback(
    (role) =>
      user?.roles?.some((r) => r.toLowerCase() === role.toLowerCase()) ?? false,
    [user?.roles],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
        hasPermission,
        hasRole,
        isAuthenticated: !!user,
        sessionDisplaced,
        dismissDisplaced,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

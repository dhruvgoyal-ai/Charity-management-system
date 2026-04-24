import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch } from "../lib/api";

const AuthContext = createContext(null);
const STORAGE_KEY = "charityhub-auth";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored).token : "";
  });

  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored).user : null;
  });

  const [isBootstrapping, setIsBootstrapping] = useState(Boolean(token));

  // ✅ FIXED: runs only once per token, no infinite calls
  useEffect(() => {
    if (!token) {
      setIsBootstrapping(false);
      return;
    }

    let isMounted = true;

    const fetchUser = async () => {
      try {
        const response = await apiFetch("/auth/me");

        if (!isMounted) return;

        // ✅ FIX: correct response structure
        setUser(response.user);

        // update localStorage user
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
              ...parsed,
              user: response.user,
            })
          );
        }
      } catch (err) {
        if (!isMounted) return;

        // ❌ invalid token → clear everything
        localStorage.removeItem(STORAGE_KEY);
        setToken("");
        setUser(null);
      } finally {
        if (isMounted) setIsBootstrapping(false);
      }
    };

    fetchUser();

    return () => {
      isMounted = false;
    };
  }, [token]); // ✅ IMPORTANT

  // ✅ persist auth properly
  const persistAuth = (authData) => {
    const payload = {
      token: authData.accessToken,
      user: authData.user,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    setToken(authData.accessToken);
    setUser(authData.user);
  };

  const login = async (credentials) => {
    const data = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    persistAuth(data);
    return data.user;
  };

  const register = async (payload) => {
    const data = await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    persistAuth(data);
    return data.user;
  };

  const logout = async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } catch {
      // ignore backend logout error
    } finally {
      localStorage.removeItem(STORAGE_KEY);
      setToken("");
      setUser(null);
    }
  };

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token && user),
      isBootstrapping,
      login,
      register,
      logout,
    }),
    [token, user, isBootstrapping]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }
  return context;
}
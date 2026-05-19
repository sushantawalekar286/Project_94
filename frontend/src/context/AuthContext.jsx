import { createContext, useEffect, useState } from "react";
import { refreshSession } from "../services/authService";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem("refreshToken") || "");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const syncFromStorage = () => {
      setToken(localStorage.getItem("token") || "");
      setRefreshToken(localStorage.getItem("refreshToken") || "");
      const raw = localStorage.getItem("user");
      if (!raw) {
        setUser(null);
        return;
      }
      try {
        setUser(JSON.parse(raw));
      } catch {
        setUser(null);
      }
    };

    window.addEventListener("storage", syncFromStorage);
    return () => window.removeEventListener("storage", syncFromStorage);
  }, []);

  useEffect(() => {
    if (token || !refreshToken || !loading) return;

    refreshSession(refreshToken)
      .then((response) => {
        const data = response.data || {};
        if (data.accessToken) {
          localStorage.setItem("token", data.accessToken);
          setToken(data.accessToken);
        }
        if (data.refreshToken) {
          localStorage.setItem("refreshToken", data.refreshToken);
          setRefreshToken(data.refreshToken);
        }
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
          setUser(data.user);
        }
      })
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
      });
  }, [token, refreshToken, loading]);

  const login = (payload) => {
    setUser(payload.user);
    setToken(payload.token);
    setRefreshToken(payload.refreshToken || "");
    localStorage.setItem("user", JSON.stringify(payload.user));
    localStorage.setItem("token", payload.token);
    if (payload.refreshToken) localStorage.setItem("refreshToken", payload.refreshToken);
  };

  const logout = () => {
    setUser(null);
    setToken("");
    setRefreshToken("");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
  };

  return <AuthContext.Provider value={{ user, token, refreshToken, loading, login, logout }}>{children}</AuthContext.Provider>;
}

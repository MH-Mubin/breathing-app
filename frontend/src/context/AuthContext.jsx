import { createContext, useEffect, useState } from "react";
import api from "../utils/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  const reloadUser = async () => {
    if (!token) return;
    try {
      const res = await api.get("/auth/me");
      setUser(res.data.data);
    } catch (error) {
      // If fetching fails with valid token syntax but invalid token (e.g. expired), logout
      // But for network errors we might just want to keep silent or retry
      console.error("Failed to reload user", error);
    }
  };

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      reloadUser().catch(() => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("token");
      });
    } else {
      setUser(null);
      localStorage.removeItem("token");
    }
  }, [token]);

  // Listen for unauthorized events from API interceptor
  useEffect(() => {
    const handleUnauthorized = () => {
      setToken(null);
      setUser(null);
      // Redirect will be handled by ProtectedRoute
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);

    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, []);

  const login = (tokenValue) => {
    setToken(tokenValue);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, reloadUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

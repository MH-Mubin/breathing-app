import { createContext, useEffect, useState } from "react";
import api from "../utils/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      // try fetch profile
      api
        .get("/auth/me")
        .then((res) => setUser(res.data.data))
        .catch(() => {
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
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

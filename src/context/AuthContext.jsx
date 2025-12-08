import { createContext, useContext, useState, useEffect } from "react";
import { getCurrentUser, setAuthToken, getStoredToken } from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const token = getStoredToken();
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  const loadUser = async () => {
    try {
      const response = await getCurrentUser();
      if (response.success) {
        setUser(response.data);
      }
    } catch (error) {
      console.error("Failed to load user:", error);
      // Token might be invalid
      setAuthToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = (userData, token) => {
    setUser(userData);
    setAuthToken(token);
  };

  const logout = () => {
    setUser(null);
    setAuthToken(null);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

import { api } from "./client";

// Authentication APIs
export const register = (data) =>
  api.post("/api/auth/register", data).then((r) => r.data);

export const login = (data) =>
  api.post("/api/auth/login", data).then((r) => r.data);

export const logout = () =>
  api.post("/api/auth/logout").then((r) => r.data);

export const getCurrentUser = () =>
  api.get("/api/auth/me").then((r) => r.data);

// Token management
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    localStorage.setItem("token", token);
  } else {
    delete api.defaults.headers.common["Authorization"];
    localStorage.removeItem("token");
  }
};

export const getStoredToken = () => {
  return localStorage.getItem("token");
};

// Initialize token from localStorage on app start
const token = getStoredToken();
if (token) {
  setAuthToken(token);
}

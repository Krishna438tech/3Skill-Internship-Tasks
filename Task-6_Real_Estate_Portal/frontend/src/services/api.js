import axios from "axios";

const TOKEN_KEY = "homenestToken";
const LEGACY_TOKEN_KEY = "token";

const getStoredToken = () => {
  const homeNestToken = localStorage.getItem(TOKEN_KEY);

  if (homeNestToken) {
    return homeNestToken;
  }

  const legacyToken = localStorage.getItem(LEGACY_TOKEN_KEY);

  if (legacyToken) {
    localStorage.setItem(TOKEN_KEY, legacyToken);
    localStorage.removeItem(LEGACY_TOKEN_KEY);

    return legacyToken;
  }

  return null;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

api.interceptors.request.use(
  (config) => {
    const token = getStoredToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const currentPath = window.location.pathname;

    if (status === 401) {
      localStorage.removeItem("homenestToken");
      localStorage.removeItem("homenestUser");
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      const publicRoutes = ["/login", "/register"];

      if (!publicRoutes.includes(currentPath)) {
        window.location.replace("/login");
      }
    }

    return Promise.reject(error);
  }
);

export default api;
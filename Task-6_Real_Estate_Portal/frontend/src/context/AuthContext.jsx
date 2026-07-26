import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import toast from "react-hot-toast";
import api from "../services/api";

const AuthContext = createContext(null);

const TOKEN_KEY = "homenestToken";
const USER_KEY = "homenestUser";

const LEGACY_TOKEN_KEY = "token";
const LEGACY_USER_KEY = "user";

const parseStoredUser = (value) => {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const migrateLegacyAuth = () => {
  let token = localStorage.getItem(TOKEN_KEY);
  let user = parseStoredUser(localStorage.getItem(USER_KEY));

  const legacyToken = localStorage.getItem(LEGACY_TOKEN_KEY);
  const legacyUser = parseStoredUser(localStorage.getItem(LEGACY_USER_KEY));

  if (!token && legacyToken) {
    token = legacyToken;
    localStorage.setItem(TOKEN_KEY, legacyToken);
  }

  if (!user && legacyUser) {
    user = legacyUser;
    localStorage.setItem(USER_KEY, JSON.stringify(legacyUser));
  }

  localStorage.removeItem(LEGACY_TOKEN_KEY);
  localStorage.removeItem(LEGACY_USER_KEY);

  return {
    token,
    user,
  };
};

const getResponseUser = (responseData) => {
  return (
    responseData?.user ||
    responseData?.data?.user ||
    responseData?.profile ||
    responseData?.data ||
    responseData
  );
};

const getResponseToken = (responseData) => {
  return responseData?.token || responseData?.data?.token || null;
};

const getErrorMessage = (error, fallbackMessage) => {
  return (
    error.response?.data?.message ||
    error.response?.data?.error ||
    error.message ||
    fallbackMessage
  );
};

export const AuthProvider = ({ children }) => {
  const migratedAuth = migrateLegacyAuth();

  const [user, setUser] = useState(migratedAuth.user);
  const [loading, setLoading] = useState(true);

  const saveAuthData = useCallback((userData, token) => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    }

    if (userData) {
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      setUser(userData);
    }
  }, []);

  const clearAuthData = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(LEGACY_TOKEN_KEY);
    localStorage.removeItem(LEGACY_USER_KEY);

    setUser(null);
  }, []);

  const fetchProfile = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
      clearAuthData();
      setLoading(false);
      return null;
    }

    try {
      const response = await api.get("/auth/profile");
      const profileData = getResponseUser(response.data);

      if (!profileData || typeof profileData !== "object") {
        throw new Error("Invalid profile response");
      }

      saveAuthData(profileData, token);

      return profileData;
    } catch {
      clearAuthData();
      return null;
    } finally {
      setLoading(false);
    }
  }, [clearAuthData, saveAuthData]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const register = async (formData) => {
    try {
      const response = await api.post("/auth/register", formData);

      const token = getResponseToken(response.data);
      const userData = getResponseUser(response.data);

      if (!token || !userData) {
        throw new Error("Registration response is incomplete");
      }

      saveAuthData(userData, token);

      toast.success(
        response.data?.message || "Your HomeNest account has been created"
      );

      return {
        success: true,
        user: userData,
      };
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Unable to create your account"
      );

      toast.error(message);

      return {
        success: false,
        message,
      };
    }
  };

  const login = async (formData) => {
    try {
      const response = await api.post("/auth/login", formData);

      const token = getResponseToken(response.data);
      const userData = getResponseUser(response.data);

      if (!token || !userData) {
        throw new Error("Login response is incomplete");
      }

      saveAuthData(userData, token);

      toast.success(response.data?.message || "Welcome back to HomeNest");

      return {
        success: true,
        user: userData,
      };
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Unable to log in with these details"
      );

      toast.error(message);

      return {
        success: false,
        message,
      };
    }
  };

  const logout = useCallback(
    (showToast = true) => {
      clearAuthData();

      if (showToast) {
        toast.success("You have been logged out");
      }
    },
    [clearAuthData]
  );

  const updateProfile = async (formData) => {
    try {
      const response = await api.put("/auth/profile", formData);
      const updatedUser = getResponseUser(response.data);

      if (!updatedUser || typeof updatedUser !== "object") {
        throw new Error("Profile response is incomplete");
      }

      saveAuthData(updatedUser, localStorage.getItem(TOKEN_KEY));

      toast.success(
        response.data?.message || "Profile updated successfully"
      );

      return {
        success: true,
        user: updatedUser,
      };
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Unable to update your profile"
      );

      toast.error(message);

      return {
        success: false,
        message,
      };
    }
  };

  const contextValue = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === "admin",
      register,
      login,
      logout,
      updateProfile,
      refreshProfile: fetchProfile,
    }),
    [user, loading, logout, fetchProfile]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
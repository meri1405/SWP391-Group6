import React, { createContext, useContext, useState, useEffect } from "react";
import {
  getPublicSystemInfo,
  getSystemSettings,
  updateSystemSettings,
} from "../api/adminApi";
import { useAuth } from "./AuthContext";

const SystemSettingsContext = createContext();

// Export hook as named export
const useSystemSettings = () => {
  const context = useContext(SystemSettingsContext);
  if (!context) {
    throw new Error(
      "useSystemSettings must be used within a SystemSettingsProvider"
    );
  }
  return context;
};

// Export provider as named export
const SystemSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    systemName: "Y Tế Học Đường",
    contactEmail: "admin@school-health.com",
    twoFactorAuth: true,
    activityLogging: true,
  });
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  // Load public system info on component mount (available to everyone)
  useEffect(() => {
    loadPublicSystemInfo();
  }, []);

  // Load admin settings when user is authenticated and is ADMIN
  useEffect(() => {
    if (isAuthenticated && user) {
      const userRole = user?.roleName;
      console.log("SystemSettings: User role check", {
        isAuthenticated,
        userExists: !!user,
        userRole,
        isAdmin: userRole === "ADMIN",
      });

      // Only try to load admin settings for ADMIN users specifically
      // Backend requires ADMIN role for /api/admin/** endpoints
      if (userRole === "ADMIN") {
        console.log("User is ADMIN, loading admin settings");
        loadAdminSettings();
      } else {
        console.log(
          `User role is ${userRole}, not ADMIN. Skipping admin settings load`
        );
      }
    } else {
      console.log("SystemSettings: Prerequisites not met", {
        isAuthenticated,
        userExists: !!user,
      });
    }
  }, [isAuthenticated, user]);

  const loadPublicSystemInfo = async () => {
    try {
      setLoading(true);
      const data = await getPublicSystemInfo();
      if (data) {
        setSettings((prev) => ({
          ...prev,
          systemName: data.systemName || prev.systemName,
          contactEmail: data.contactEmail || prev.contactEmail,
        }));
      }
    } catch (error) {
      console.error("Failed to load public system info:", error);
      // Keep default values if API fails
    } finally {
      setLoading(false);
    }
  };

  const loadAdminSettings = async () => {
    try {
      setLoading(true);
      console.log("Loading admin settings...");

      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found, skipping admin settings load");
        return;
      }

      const data = await getSystemSettings();
      console.log("Admin settings loaded successfully:", data);

      if (data) {
        setSettings((prev) => ({
          ...prev,
          systemName: data.systemName || prev.systemName,
          contactEmail: data.contactEmail || prev.contactEmail,
          twoFactorAuth:
            data.twoFactorAuth !== undefined
              ? data.twoFactorAuth
              : prev.twoFactorAuth,
          activityLogging:
            data.activityLogging !== undefined
              ? data.activityLogging
              : prev.activityLogging,
        }));
      }
    } catch (error) {
      console.error("Failed to load admin settings:", error);

      // Handle specific error cases
      if (error.message && error.message.includes("401")) {
        console.log(
          "Unauthorized access to admin settings - user may not have admin privileges"
        );
        // This is expected for non-admin users, so we silently fail
      } else {
        console.error("Unexpected error loading admin settings:", error);
      }

      // Keep current values if API fails
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      setLoading(true);
      await updateSystemSettings(newSettings);
      setSettings((prev) => ({
        ...prev,
        ...newSettings,
      }));
      return { success: true };
    } catch (error) {
      console.error("Failed to update system settings:", error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    settings,
    loading,
    updateSettings,
    refreshSettings: loadAdminSettings,
  };

  return (
    <SystemSettingsContext.Provider value={value}>
      {children}
    </SystemSettingsContext.Provider>
  );
};

// Export only as named exports for consistency
export { useSystemSettings, SystemSettingsProvider };

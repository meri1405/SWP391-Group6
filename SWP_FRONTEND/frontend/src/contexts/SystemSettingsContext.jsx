import React, { createContext, useContext, useState, useEffect } from "react";
import {
  getPublicSystemInfo,
  getSystemSettings,
  updateSystemSettings,
} from "../api/adminApi";
import { useAuth } from "./AuthContext";

const SystemSettingsContext = createContext();

export const useSystemSettings = () => {
  const context = useContext(SystemSettingsContext);
  if (!context) {
    throw new Error(
      "useSystemSettings must be used within a SystemSettingsProvider"
    );
  }
  return context;
};

export const SystemSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    systemName: "Hệ Thống Quản Lý Y Tế Học Đường",
    contactEmail: "admin@school-health.com",
    twoFactorAuth: true,
    activityLogging: true,
  });
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated, isStaff } = useAuth();

  // Load public system info on component mount (available to everyone)
  useEffect(() => {
    loadPublicSystemInfo();
  }, []);

  // Load admin settings when user is authenticated and is staff
  useEffect(() => {
    if (
      isAuthenticated &&
      isStaff &&
      typeof isStaff === "function" &&
      isStaff()
    ) {
      loadAdminSettings();
    }
  }, [isAuthenticated, isStaff, user]);

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
      const data = await getSystemSettings();
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

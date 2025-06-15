package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service;

import java.util.Map;

/**
 * Service interface to manage system settings
 */
public interface SystemSettingsService {
    
    /**
     * Get all system settings
     */
    Map<String, Object> getAllSettings();
    
    /**
     * Get public system information (non-sensitive data only)
     */
    Map<String, Object> getPublicSystemInfo();
    
    /**
     * Update system settings
     */
    void updateSettings(Map<String, Object> newSettings);
    
    /**
     * Get a specific setting value
     */
    Object getSetting(String key);
    
    /**
     * Set a specific setting value
     */
    void setSetting(String key, Object value);
} 
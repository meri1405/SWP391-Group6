package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.impl;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.SystemSettingsService;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Implementation of SystemSettingsService
 * In a real application, this would use a database
 * For now, using in-memory storage that persists until server restart
 */
@Service
public class SystemSettingsServiceImpl implements SystemSettingsService {
    
    // Thread-safe map to store settings
    private final Map<String, Object> settings = new ConcurrentHashMap<>();
    
    // Constructor with default values
    public SystemSettingsServiceImpl() {
        // Initialize with default values
        settings.put("systemName", "Y Tế Học Đường");
        settings.put("contactEmail", "admin@school-health.com");
        settings.put("twoFactorAuth", true);
        settings.put("activityLogging", true);
        settings.put("version", "1.0.0");
    }
    
    /**
     * Get all system settings
     */
    @Override
    public Map<String, Object> getAllSettings() {
        return new HashMap<>(settings);
    }
    
    /**
     * Get public system information (non-sensitive data only)
     */
    @Override
    public Map<String, Object> getPublicSystemInfo() {
        Map<String, Object> publicInfo = new HashMap<>();
        publicInfo.put("systemName", settings.get("systemName"));
        publicInfo.put("contactEmail", settings.get("contactEmail"));
        publicInfo.put("version", settings.get("version"));
        return publicInfo;
    }
    
    /**
     * Update system settings
     */
    @Override
    public void updateSettings(Map<String, Object> newSettings) {
        // Update only allowed fields
        if (newSettings.containsKey("systemName")) {
            settings.put("systemName", newSettings.get("systemName"));
        }
        if (newSettings.containsKey("contactEmail")) {
            settings.put("contactEmail", newSettings.get("contactEmail"));
        }
        if (newSettings.containsKey("twoFactorAuth")) {
            settings.put("twoFactorAuth", newSettings.get("twoFactorAuth"));
        }
        if (newSettings.containsKey("activityLogging")) {
            settings.put("activityLogging", newSettings.get("activityLogging"));
        }
        
        System.out.println("Settings updated: " + settings);
    }
    
    /**
     * Get a specific setting value
     */
    @Override
    public Object getSetting(String key) {
        return settings.get(key);
    }
    
    /**
     * Set a specific setting value
     */
    @Override
    public void setSetting(String key, Object value) {
        settings.put(key, value);
    }
} 
package group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for sending health check result notifications to parents
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HealthCheckResultNotificationRequest {
    
    /**
     * The IDs of the students whose result notifications should be sent
     * If null or empty, notifications for all confirmed students will be sent
     */
    private List<Long> studentIds;
    
    /**
     * The notification content (HTML format supported)
     * If null and useDefaultTemplate is true, auto-generated content will be used
     */
    private String notificationContent;
    
    /**
     * Whether to use the default template for generating notification content
     * If true, notificationContent will be ignored and auto-generated content will be used
     */
    private boolean useDefaultTemplate;
}

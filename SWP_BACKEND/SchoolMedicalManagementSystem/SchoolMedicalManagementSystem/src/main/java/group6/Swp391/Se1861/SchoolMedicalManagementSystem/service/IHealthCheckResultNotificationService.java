package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.HealthCheckResultNotificationDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;

import java.util.Map;

public interface IHealthCheckResultNotificationService {

    /**
     * Send health check result notifications to parents
     * @param nurse The nurse sending the notifications
     * @param request The notification request with parameters
     * @return Map with result information (sent count, success/failure counts)
     */
    Map<String, Object> sendHealthCheckResultNotifications(User nurse, HealthCheckResultNotificationDTO request);
    
    /**
     * Generate a preview of the health check result message for a specific student
     * @param campaignId The campaign ID
     * @param studentId The student ID
     * @param customTemplate Optional custom message template
     * @return The generated message content
     */
    String generateHealthCheckResultMessagePreview(Long campaignId, String studentId, String customTemplate);
}

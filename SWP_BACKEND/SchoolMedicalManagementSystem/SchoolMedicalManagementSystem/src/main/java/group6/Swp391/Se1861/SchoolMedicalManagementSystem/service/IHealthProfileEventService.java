package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.HealthProfileEventDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.HealthProfile;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.HealthProfileEvent;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public interface IHealthProfileEventService {
    
    // Event logging methods
    void logEvent(HealthProfile healthProfile, User modifiedByUser, 
                  HealthProfileEvent.ActionType actionType, String fieldChanged, 
                  String oldValue, String newValue);
    
    void logCreateEvent(HealthProfile healthProfile, User modifiedByUser);
    
    void logUpdateEvent(HealthProfile healthProfile, User modifiedByUser, 
                       String fieldChanged, String oldValue, String newValue);
    
    void logDeleteEvent(HealthProfile healthProfile, User modifiedByUser);
    
    void logApproveEvent(HealthProfile healthProfile, User modifiedByUser, String nurseNote);
    
    void logRejectEvent(HealthProfile healthProfile, User modifiedByUser, String rejectionReason);
    
    // Query methods
    List<HealthProfileEventDTO> getEventsByHealthProfile(Long healthProfileId);
    List<HealthProfileEventDTO> getEventsByUser(Long userId);
    List<HealthProfileEventDTO> getEventsByActionType(HealthProfileEvent.ActionType actionType);
    List<HealthProfileEventDTO> getEventsByDateRange(LocalDateTime startDate, LocalDateTime endDate);
    List<HealthProfileEventDTO> getRecentEventsByHealthProfile(Long healthProfileId, int limit);
    long countEventsByHealthProfile(Long healthProfileId);
    
    // Statistics methods
    Map<String, Object> getEventStatistics(LocalDateTime startDate, LocalDateTime endDate, String groupBy);
}

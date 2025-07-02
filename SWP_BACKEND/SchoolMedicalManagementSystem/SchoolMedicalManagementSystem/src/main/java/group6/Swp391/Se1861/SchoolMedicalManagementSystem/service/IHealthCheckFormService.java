package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.HealthCheckFormDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.HealthCheckCampaign;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.HealthCheckForm;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.Student;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.FormStatus;

import java.util.List;

public interface IHealthCheckFormService {
    
    HealthCheckFormDTO getFormById(Long id);
    
    List<HealthCheckFormDTO> getFormsByParent(User parent);
    
    List<HealthCheckFormDTO> getPendingFormsByParent(User parent);
    
    List<HealthCheckFormDTO> getFormsByCampaign(HealthCheckCampaign campaign);
    
    HealthCheckFormDTO confirmForm(Long formId, User parent, String parentNote);
    
    HealthCheckFormDTO declineForm(Long formId, User parent, String parentNote);
    
    List<HealthCheckFormDTO> getExpiredForms();
    
    void autoDeclineExpiredForms();
    
    HealthCheckForm createHealthCheckForm(HealthCheckCampaign campaign, Student student, User parent);
    
    void sendFormToParent(HealthCheckForm form);
    
    void sendReminderNotifications();
    
    long getFormCountByCampaignAndStatus(HealthCheckCampaign campaign, FormStatus status);
    
    HealthCheckFormDTO convertToDTO(HealthCheckForm form);
}

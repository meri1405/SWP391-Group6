package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.HealthCheckFormDetailDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.HealthCheckFormSummaryDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.HealthCheckForm;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.Student;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.FormStatus;

import java.time.LocalDateTime;
import java.util.List;

public interface IHealthCheckFormService {
    List<HealthCheckForm> generateFormsForCampaign(Long campaignId, List<Long> studentIds);

    List<HealthCheckForm> generateFormsByAgeRange(Long campaignId, int minAge, int maxAge);

    List<HealthCheckForm> generateFormsByClass(Long campaignId, String className);

    HealthCheckForm updateFormStatus(Long formId, FormStatus status, String parentNote);

    HealthCheckForm scheduleAppointment(Long formId, LocalDateTime appointmentTime, String appointmentLocation);

    HealthCheckForm checkInStudent(Long formId);

    HealthCheckForm getFormById(Long id);

    List<HealthCheckForm> getFormsByCampaign(Long campaignId);

    List<HealthCheckForm> getFormsByCampaignAndStatus(Long campaignId, FormStatus status);

    List<HealthCheckForm> getFormsByParent(User parent);

    List<HealthCheckForm> getFormsByParentAndStatus(User parent, FormStatus status);

    List<HealthCheckForm> getFormsByStudent(Student student);

    int getConfirmedCountByCampaign(Long campaignId);

    int getPendingCountByCampaign(Long campaignId);

    HealthCheckFormDetailDTO getFormDetailsForParent(Long formId, User parent);

    HealthCheckFormDetailDTO autoGenerateFormForParent(User parent, Long campaignId, Long studentId);
    
    // Summary DTOs for parent APIs to avoid circular reference
    List<HealthCheckFormSummaryDTO> getFormsSummaryByParent(User parent);
    List<HealthCheckFormSummaryDTO> getFormsSummaryByParentAndStatus(User parent, FormStatus status);
}

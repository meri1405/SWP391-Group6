package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.*;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.VaccinationCampaign;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface IVaccinationCampaignService {
    
    // Campaign CRUD operations
    VaccinationCampaignDTO createCampaign(User nurse, CreateVaccinationCampaignRequest request);
    
    VaccinationCampaignDTO getCampaignById(Long id);
    
    List<VaccinationCampaignDTO> getAllCampaigns();
    
    Page<VaccinationCampaignDTO> getCampaignsByStatus(VaccinationCampaign.CampaignStatus status, Pageable pageable);
    
    Page<VaccinationCampaignDTO> getCampaignsByNurse(User nurse, Pageable pageable);
    
    VaccinationCampaignDTO updateCampaign(Long id, User nurse, CreateVaccinationCampaignRequest request);
    
    void deleteCampaign(Long id, User nurse);
    
    // Campaign approval workflow
    VaccinationCampaignDTO approveCampaign(Long id, User manager);
    
    VaccinationCampaignDTO rejectCampaign(Long id, User manager, String reason);
    
    // Student eligibility and form generation
    EligibleStudentsResponse getEligibleStudents(Long campaignId);
    
    int getEligibleStudentsCountByRule(Long ruleId);
    
    List<VaccinationFormDTO> generateVaccinationForms(Long campaignId, User nurse);
    
    List<VaccinationFormDTO> sendFormsToParents(Long campaignId, User nurse, String customMessage);
    
    // Form management
    List<VaccinationFormDTO> getCampaignForms(Long campaignId);
    
    List<VaccinationFormDTO> getConfirmedForms(Long campaignId);
    
    List<VaccinationFormDTO> getPendingForms(Long campaignId);
    
    // Record management
    List<VaccinationRecordDTO> getCampaignRecords(Long campaignId);
    
    VaccinationRecordDTO createVaccinationRecord(Long formId, VaccinationRecordDTO recordDTO, User nurse);
    
    VaccinationRecordDTO updateVaccinationRecord(Long recordId, VaccinationRecordDTO recordDTO, User nurse);
    
    // Campaign completion workflow
    CampaignCompletionRequestDTO requestCampaignCompletion(Long campaignId, User nurse, String requestReason, String completionNotes);
    
    // Only MANAGER can complete campaigns
    VaccinationCampaignDTO completeCampaign(Long campaignId, User manager);
    
    // Utility methods
    VaccinationCampaignDTO convertToDTO(VaccinationCampaign campaign);
}

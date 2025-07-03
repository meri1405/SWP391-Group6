package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.CampaignCompletionRequestDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.VaccinationCampaignDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.CampaignCompletionRequest;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;

import java.util.List;

public interface ICampaignCompletionService {
    
    /**
     * Create a new campaign completion request
     */
    CampaignCompletionRequestDTO createCompletionRequest(Long campaignId, User nurse, String requestReason, String completionNotes);
    
    /**
     * Get all pending completion requests
     */
    List<CampaignCompletionRequestDTO> getAllPendingRequests();
    
    /**
     * Get all completion requests
     */
    List<CampaignCompletionRequestDTO> getAllCompletionRequests();
    
    /**
     * Get completion request by ID
     */
    CampaignCompletionRequestDTO getCompletionRequestById(Long requestId);
    
    /**
     * Get completion requests by status
     */
    List<CampaignCompletionRequestDTO> getCompletionRequestsByStatus(String status);
    
    /**
     * Approve completion request and complete the campaign
     */
    VaccinationCampaignDTO approveCompletionRequest(Long requestId, User manager, String reviewNotes);
    
    /**
     * Reject completion request
     */
    CampaignCompletionRequestDTO rejectCompletionRequest(Long requestId, User manager, String reviewNotes);
    
    /**
     * Count pending completion requests
     */
    Long countPendingRequests();
    
    /**
     * Check if campaign has pending completion request
     */
    boolean hasPendingCompletionRequest(Long campaignId);
    
    /**
     * Get completion requests by nurse ID
     */
    List<CampaignCompletionRequestDTO> getCompletionRequestsByNurse(Long nurseId);

    /**
     * Convert entity to DTO
     */
    CampaignCompletionRequestDTO convertToDTO(CampaignCompletionRequest request);
}
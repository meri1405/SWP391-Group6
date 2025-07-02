package group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.CampaignCompletionRequest;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.VaccinationCampaign;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CampaignCompletionRequestRepository extends JpaRepository<CampaignCompletionRequest, Long> {
    
    /**
     * Find completion request by campaign
     */
    Optional<CampaignCompletionRequest> findByCampaign(VaccinationCampaign campaign);
    
    /**
     * Find completion request by campaign ID
     */
    @Query("SELECT ccr FROM CampaignCompletionRequest ccr WHERE ccr.campaign.id = :campaignId")
    Optional<CampaignCompletionRequest> findByCampaignId(@Param("campaignId") Long campaignId);
    
    /**
     * Find all pending completion requests
     */
    @Query("SELECT ccr FROM CampaignCompletionRequest ccr WHERE ccr.status = 'PENDING' ORDER BY ccr.requestDate DESC")
    List<CampaignCompletionRequest> findAllPendingRequests();
    
    /**
     * Find completion requests by status
     */
    List<CampaignCompletionRequest> findByStatusOrderByRequestDateDesc(CampaignCompletionRequest.RequestStatus status);
    
    /**
     * Find completion requests requested by a specific nurse
     */
    @Query("SELECT ccr FROM CampaignCompletionRequest ccr WHERE ccr.requestedBy.id = :nurseId ORDER BY ccr.requestDate DESC")
    List<CampaignCompletionRequest> findByRequestedByIdOrderByRequestDateDesc(@Param("nurseId") Long nurseId);
    
    /**
     * Count pending completion requests
     */
    @Query("SELECT COUNT(ccr) FROM CampaignCompletionRequest ccr WHERE ccr.status = 'PENDING'")
    Long countPendingRequests();
    
    /**
     * Check if there's already a pending request for this campaign
     */
    @Query("SELECT CASE WHEN COUNT(ccr) > 0 THEN true ELSE false END FROM CampaignCompletionRequest ccr WHERE ccr.campaign.id = :campaignId AND ccr.status = 'PENDING'")
    boolean existsPendingRequestForCampaign(@Param("campaignId") Long campaignId);
} 
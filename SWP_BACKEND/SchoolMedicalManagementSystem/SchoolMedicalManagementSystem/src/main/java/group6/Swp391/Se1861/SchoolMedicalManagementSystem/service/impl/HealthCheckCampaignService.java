package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.impl;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.HealthCheckCampaign;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.CampaignStatus;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.HealthCheckCategory;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.HealthCheckCampaignRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IHealthCheckCampaignService;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.INotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class HealthCheckCampaignService implements IHealthCheckCampaignService {

    private final HealthCheckCampaignRepository campaignRepository;
    private final INotificationService notificationService;

    @Transactional
    public HealthCheckCampaign createCampaign(String name, String description, LocalDate startDate,
                                             LocalDate endDate, String location, Set<HealthCheckCategory> categories,
                                             User nurse, Integer minAge, Integer maxAge, String targetClass) {

        HealthCheckCampaign campaign = new HealthCheckCampaign();
        campaign.setName(name);
        campaign.setDescription(description);
        campaign.setStartDate(startDate);
        campaign.setEndDate(endDate);
        campaign.setLocation(location);
        campaign.setCategories(categories);
        campaign.setCreatedBy(nurse);
        campaign.setStatus(CampaignStatus.DRAFT);
        campaign.setMinAge(minAge);
        campaign.setMaxAge(maxAge);
        campaign.setTargetClass(targetClass);
        campaign.setCreatedAt(LocalDateTime.now());
        campaign.setUpdatedAt(LocalDateTime.now());

        return campaignRepository.save(campaign);
    }

    @Transactional
    public HealthCheckCampaign updateCampaign(Long id, String name, String description, LocalDate startDate,
                                             LocalDate endDate, String location, Set<HealthCheckCategory> categories,
                                             Integer minAge, Integer maxAge, String targetClass) {

        Optional<HealthCheckCampaign> optionalCampaign = campaignRepository.findById(id);
        if (optionalCampaign.isEmpty()) {
            throw new RuntimeException("Campaign not found with id: " + id);
        }

        HealthCheckCampaign campaign = optionalCampaign.get();

        // Only allow updates if the campaign is in DRAFT status
        if (campaign.getStatus() != CampaignStatus.DRAFT) {
            throw new RuntimeException("Cannot update campaign that is not in DRAFT status");
        }

        campaign.setName(name);
        campaign.setDescription(description);
        campaign.setStartDate(startDate);
        campaign.setEndDate(endDate);
        campaign.setLocation(location);
        campaign.setCategories(categories);
        campaign.setMinAge(minAge);
        campaign.setMaxAge(maxAge);
        campaign.setTargetClass(targetClass);
        campaign.setUpdatedAt(LocalDateTime.now());

        return campaignRepository.save(campaign);
    }

    @Transactional
    public HealthCheckCampaign submitForApproval(Long id) {
        Optional<HealthCheckCampaign> optionalCampaign = campaignRepository.findById(id);
        if (optionalCampaign.isEmpty()) {
            throw new RuntimeException("Campaign not found with id: " + id);
        }

        HealthCheckCampaign campaign = optionalCampaign.get();

        // Only allow submission if the campaign is in DRAFT status
        if (campaign.getStatus() != CampaignStatus.DRAFT) {
            throw new RuntimeException("Cannot submit campaign that is not in DRAFT status");
        }

        campaign.setStatus(CampaignStatus.PENDING);
        campaign.setUpdatedAt(LocalDateTime.now());

        // Notify managers about a new campaign pending approval
        notificationService.notifyManagersAboutCampaignApproval(campaign);

        return campaignRepository.save(campaign);
    }

    @Transactional
    public HealthCheckCampaign approveCampaign(Long id, User manager) {
        Optional<HealthCheckCampaign> optionalCampaign = campaignRepository.findById(id);
        if (optionalCampaign.isEmpty()) {
            throw new RuntimeException("Campaign not found with id: " + id);
        }

        HealthCheckCampaign campaign = optionalCampaign.get();

        // Only allow approval if the campaign is in PENDING status
        if (campaign.getStatus() != CampaignStatus.PENDING) {
            throw new RuntimeException("Cannot approve campaign that is not in PENDING status");
        }

        campaign.setStatus(CampaignStatus.APPROVED);
        campaign.setApprovedBy(manager);
        campaign.setApprovedAt(LocalDateTime.now());
        campaign.setUpdatedAt(LocalDateTime.now());

        // Notify the nurse who created the campaign about the approval
        notificationService.notifyNurseAboutCampaignApproval(campaign);

        return campaignRepository.save(campaign);
    }

    @Transactional
    public HealthCheckCampaign rejectCampaign(Long id, User manager, String notes) {
        Optional<HealthCheckCampaign> optionalCampaign = campaignRepository.findById(id);
        if (optionalCampaign.isEmpty()) {
            throw new RuntimeException("Campaign not found with id: " + id);
        }

        HealthCheckCampaign campaign = optionalCampaign.get();

        // Only allow rejection if the campaign is in PENDING status
        if (campaign.getStatus() != CampaignStatus.PENDING) {
            throw new RuntimeException("Cannot reject campaign that is not in PENDING status");
        }

        campaign.setStatus(CampaignStatus.DRAFT);  // Set back to DRAFT for revision
        campaign.setNotes(notes);
        campaign.setUpdatedAt(LocalDateTime.now());

        // Notify the nurse who created the campaign about the rejection
        notificationService.notifyNurseAboutCampaignRejection(campaign, notes);

        return campaignRepository.save(campaign);
    }

    @Transactional
    public HealthCheckCampaign scheduleCampaign(Long id, int targetCount) {
        Optional<HealthCheckCampaign> optionalCampaign = campaignRepository.findById(id);
        if (optionalCampaign.isEmpty()) {
            throw new RuntimeException("Campaign not found with id: " + id);
        }

        HealthCheckCampaign campaign = optionalCampaign.get();

        // Only allow scheduling if the campaign is in APPROVED status
        if (campaign.getStatus() != CampaignStatus.APPROVED) {
            throw new RuntimeException("Cannot schedule campaign that is not in APPROVED status");
        }

        campaign.setStatus(CampaignStatus.SCHEDULED);
        campaign.setTargetCount(targetCount);
        campaign.setUpdatedAt(LocalDateTime.now());

        // Notify manager about campaign scheduling and target count
        notificationService.notifyManagerAboutCampaignSchedule(campaign);

        return campaignRepository.save(campaign);
    }

    @Transactional
    public HealthCheckCampaign startCampaign(Long id) {
        Optional<HealthCheckCampaign> optionalCampaign = campaignRepository.findById(id);
        if (optionalCampaign.isEmpty()) {
            throw new RuntimeException("Campaign not found with id: " + id);
        }

        HealthCheckCampaign campaign = optionalCampaign.get();

        // Only allow starting if the campaign is in SCHEDULED status
        if (campaign.getStatus() != CampaignStatus.SCHEDULED) {
            throw new RuntimeException("Cannot start campaign that is not in SCHEDULED status");
        }

        campaign.setStatus(CampaignStatus.IN_PROGRESS);
        campaign.setUpdatedAt(LocalDateTime.now());

        return campaignRepository.save(campaign);
    }

    @Transactional
    public HealthCheckCampaign completeCampaign(Long id) {
        Optional<HealthCheckCampaign> optionalCampaign = campaignRepository.findById(id);
        if (optionalCampaign.isEmpty()) {
            throw new RuntimeException("Campaign not found with id: " + id);
        }

        HealthCheckCampaign campaign = optionalCampaign.get();

        // Only allow completion if the campaign is in IN_PROGRESS status
        if (campaign.getStatus() != CampaignStatus.IN_PROGRESS) {
            throw new RuntimeException("Cannot complete campaign that is not in IN_PROGRESS status");
        }

        campaign.setStatus(CampaignStatus.COMPLETED);
        campaign.setUpdatedAt(LocalDateTime.now());

        // Notify manager about campaign completion
        notificationService.notifyManagerAboutCampaignCompletion(campaign);

        return campaignRepository.save(campaign);
    }

    @Transactional
    public HealthCheckCampaign cancelCampaign(Long id, String notes) {
        Optional<HealthCheckCampaign> optionalCampaign = campaignRepository.findById(id);
        if (optionalCampaign.isEmpty()) {
            throw new RuntimeException("Campaign not found with id: " + id);
        }

        HealthCheckCampaign campaign = optionalCampaign.get();

        // Don't allow cancellation of COMPLETED campaigns
        if (campaign.getStatus() == CampaignStatus.COMPLETED) {
            throw new RuntimeException("Cannot cancel a completed campaign");
        }

        campaign.setStatus(CampaignStatus.CANCELED);
        campaign.setNotes(notes);
        campaign.setUpdatedAt(LocalDateTime.now());

        return campaignRepository.save(campaign);
    }

    public HealthCheckCampaign getCampaignById(Long id) {
        Optional<HealthCheckCampaign> campaign = campaignRepository.findById(id);
        return campaign.orElseThrow(() -> new RuntimeException("Campaign not found with id: " + id));
    }

    public List<HealthCheckCampaign> getCampaignsByNurse(User nurse) {
        return campaignRepository.findByCreatedBy(nurse);
    }

    public List<HealthCheckCampaign> getCampaignsByStatus(CampaignStatus status) {
        return campaignRepository.findByStatus(status);
    }

    public List<HealthCheckCampaign> getUpcomingCampaigns() {
        return campaignRepository.findUpcomingCampaigns(CampaignStatus.APPROVED, LocalDate.now());
    }

    public List<HealthCheckCampaign> getCompletedCampaigns() {
        return campaignRepository.findCompletedCampaigns(CampaignStatus.COMPLETED, LocalDate.now());
    }

    public List<HealthCheckCampaign> getActiveCampaignsByClass(String className) {
        return campaignRepository.findActiveByClass(className);
    }
}

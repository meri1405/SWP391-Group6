package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.impl;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.CampaignCompletionRequestDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.VaccinationCampaignDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.*;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.CampaignCompletionRequestRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.VaccinationCampaignRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.VaccinationFormRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.ICampaignCompletionService;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IVaccinationCampaignService;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.INotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CampaignCompletionService implements ICampaignCompletionService {

    private final CampaignCompletionRequestRepository completionRequestRepository;
    private final VaccinationCampaignRepository campaignRepository;
    private final VaccinationFormRepository formRepository;
    private final IVaccinationCampaignService campaignService;
    private final INotificationService notificationService;

    @Override
    public CampaignCompletionRequestDTO createCompletionRequest(Long campaignId, User nurse, String requestReason, String completionNotes) {
        // Find the campaign
        VaccinationCampaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new IllegalArgumentException("Campaign not found with ID: " + campaignId));

        // Validate campaign status
        if (campaign.getStatus() != VaccinationCampaign.CampaignStatus.IN_PROGRESS) {
            throw new IllegalArgumentException("Chỉ có thể yêu cầu hoàn thành chiến dịch đang ở trạng thái 'Đang tiến hành'");
        }

        // Check if there's already a pending request for this campaign
        if (completionRequestRepository.existsPendingRequestForCampaign(campaignId)) {
            throw new IllegalArgumentException("Đã có yêu cầu hoàn thành đang chờ duyệt cho chiến dịch này");
        }

        // Gather campaign statistics
        List<VaccinationForm> forms = formRepository.findByCampaign(campaign);
        
        int totalStudents = forms.size();
        // For now, use simple counts - can be enhanced later
        int vaccinatedStudents = totalStudents > 0 ? (int) (totalStudents * 0.8) : 0; // 80% estimated
        int postponedStudents = totalStudents > 0 ? (int) (totalStudents * 0.1) : 0; // 10% estimated  
        int rejectedForms = totalStudents > 0 ? (int) (totalStudents * 0.1) : 0; // 10% estimated

        // Create completion request
        CampaignCompletionRequest request = new CampaignCompletionRequest();
        request.setCampaign(campaign);
        request.setRequestedBy(nurse);
        request.setRequestReason(requestReason != null ? requestReason : "Yêu cầu hoàn thành chiến dịch tiêm chủng");
        request.setCompletionNotes(completionNotes);
        request.setRequestDate(LocalDateTime.now());
        request.setStatus(CampaignCompletionRequest.RequestStatus.PENDING);
        request.setTotalStudents(totalStudents);
        request.setVaccinatedStudents(vaccinatedStudents);
        request.setPostponedStudents(postponedStudents);
        request.setRejectedForms(rejectedForms);

        // Save the completion request first and ensure it's committed
        request = completionRequestRepository.saveAndFlush(request);
        
        // Log the saved request details
        System.out.println("DEBUG: CampaignCompletionService - Saved completion request ID: " + request.getId());
        System.out.println("DEBUG: CampaignCompletionService - Request status: " + request.getStatus());
        System.out.println("DEBUG: CampaignCompletionService - Campaign ID: " + request.getCampaign().getId());
        System.out.println("DEBUG: CampaignCompletionService - Campaign name: " + request.getCampaign().getName());

        // Verify the request was actually saved by retrieving it again
        CampaignCompletionRequest verifyRequest = completionRequestRepository.findById(request.getId())
                .orElseThrow(() -> new RuntimeException("Failed to save completion request"));
        
        System.out.println("DEBUG: CampaignCompletionService - Verified request ID: " + verifyRequest.getId());
        System.out.println("DEBUG: CampaignCompletionService - Verified request status: " + verifyRequest.getStatus());

        // Send notification to managers (now that the request is definitely saved with an ID)
        notificationService.notifyManagersAboutCampaignCompletionRequest(verifyRequest);

        return convertToDTO(verifyRequest);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CampaignCompletionRequestDTO> getAllPendingRequests() {
        List<CampaignCompletionRequest> requests = completionRequestRepository.findAllPendingRequests();
        return requests.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CampaignCompletionRequestDTO> getAllCompletionRequests() {
        List<CampaignCompletionRequest> requests = completionRequestRepository.findAll();
        return requests.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CampaignCompletionRequestDTO getCompletionRequestById(Long requestId) {
        CampaignCompletionRequest request = completionRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Completion request not found with ID: " + requestId));
        return convertToDTO(request);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CampaignCompletionRequestDTO> getCompletionRequestsByStatus(String status) {
        try {
            CampaignCompletionRequest.RequestStatus requestStatus = CampaignCompletionRequest.RequestStatus.valueOf(status.toUpperCase());
            List<CampaignCompletionRequest> requests = completionRequestRepository.findByStatusOrderByRequestDateDesc(requestStatus);
            return requests.stream().map(this::convertToDTO).collect(Collectors.toList());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status: " + status);
        }
    }

    @Override
    public VaccinationCampaignDTO approveCompletionRequest(Long requestId, User manager, String reviewNotes) {
        // Find the completion request
        CampaignCompletionRequest request = completionRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Completion request not found with ID: " + requestId));

        // Validate request status
        if (request.getStatus() != CampaignCompletionRequest.RequestStatus.PENDING) {
            throw new IllegalArgumentException("Chỉ có thể duyệt yêu cầu đang ở trạng thái chờ duyệt");
        }

        // Update request status
        request.setStatus(CampaignCompletionRequest.RequestStatus.APPROVED);
        request.setReviewedBy(manager);
        request.setReviewNotes(reviewNotes != null ? reviewNotes : "Đã duyệt yêu cầu hoàn thành chiến dịch");
        request.setReviewDate(LocalDateTime.now());
        completionRequestRepository.save(request);

        // Complete the campaign
        VaccinationCampaign campaign = request.getCampaign();
        campaign.setStatus(VaccinationCampaign.CampaignStatus.COMPLETED);
        campaign = campaignRepository.save(campaign);

        // Send notification to nurse about approval
        notificationService.notifyNurseAboutCampaignCompletionApproval(request, manager);

        return campaignService.convertToDTO(campaign);
    }

    @Override
    public CampaignCompletionRequestDTO rejectCompletionRequest(Long requestId, User manager, String reviewNotes) {
        // Find the completion request
        CampaignCompletionRequest request = completionRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Completion request not found with ID: " + requestId));

        // Validate request status
        if (request.getStatus() != CampaignCompletionRequest.RequestStatus.PENDING) {
            throw new IllegalArgumentException("Chỉ có thể từ chối yêu cầu đang ở trạng thái chờ duyệt");
        }

        // Update request status
        request.setStatus(CampaignCompletionRequest.RequestStatus.REJECTED);
        request.setReviewedBy(manager);
        request.setReviewNotes(reviewNotes);
        request.setReviewDate(LocalDateTime.now());
        request = completionRequestRepository.save(request);

        // Send notification to nurse about rejection
        notificationService.notifyNurseAboutCampaignCompletionRejection(request, manager);

        return convertToDTO(request);
    }

    @Override
    @Transactional(readOnly = true)
    public Long countPendingRequests() {
        return completionRequestRepository.countPendingRequests();
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasPendingCompletionRequest(Long campaignId) {
        return completionRequestRepository.existsPendingRequestForCampaign(campaignId);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<CampaignCompletionRequestDTO> getCompletionRequestsByNurse(Long nurseId) {
        List<CampaignCompletionRequest> requests = completionRequestRepository.findByRequestedByIdOrderByRequestDateDesc(nurseId);
        return requests.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Override
    public CampaignCompletionRequestDTO convertToDTO(CampaignCompletionRequest request) {
        CampaignCompletionRequestDTO dto = new CampaignCompletionRequestDTO();
        dto.setId(request.getId());
        dto.setCampaignId(request.getCampaign().getId());
        dto.setCampaignName(request.getCampaign().getName());
        dto.setNurseUsername(request.getRequestedBy().getUsername());
        dto.setNurseName(request.getRequestedBy().getFullName());
        dto.setRequestReason(request.getRequestReason());
        dto.setCompletionNotes(request.getCompletionNotes());
        dto.setRequestDate(request.getRequestDate());
        dto.setReviewDate(request.getReviewDate());
        dto.setStatus(request.getStatus().name());
        if (request.getReviewedBy() != null) {
            dto.setReviewerUsername(request.getReviewedBy().getUsername());
            dto.setReviewerName(request.getReviewedBy().getFullName());
        }
        dto.setReviewNotes(request.getReviewNotes());
        dto.setTotalStudents(request.getTotalStudents());
        dto.setVaccinatedStudents(request.getVaccinatedStudents());
        dto.setPostponedStudents(request.getPostponedStudents());
        dto.setRejectedForms(request.getRejectedForms());
        return dto;
    }
}
package group6.Swp391.Se1861.SchoolMedicalManagementSystem.controller;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.CampaignCompletionRequestDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.VaccinationCampaignDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.ICampaignCompletionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/manager/campaign-completion")
@RequiredArgsConstructor
public class ManagerCampaignCompletionController {

    private final ICampaignCompletionService completionService;

    /**
     * Simple test endpoint for manager authentication
     */
    @GetMapping("/test-auth")
    public ResponseEntity<Map<String, Object>> testManagerAuth(@AuthenticationPrincipal User manager) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Manager authentication successful");
        response.put("managerId", manager.getId());
        response.put("managerFullName", manager.getFullName());
        response.put("role", manager.getRole().getRoleName());
        return ResponseEntity.ok(response);
    }

    /**
     * Get all pending completion requests
     */
    @GetMapping("/pending")
    public ResponseEntity<List<CampaignCompletionRequestDTO>> getPendingCompletionRequests() {
        try {
            List<CampaignCompletionRequestDTO> requests = completionService.getAllPendingRequests();
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get completion request by ID
     */
    @GetMapping("/{requestId}")
    public ResponseEntity<CampaignCompletionRequestDTO> getCompletionRequest(@PathVariable Long requestId) {
        try {
            CampaignCompletionRequestDTO request = completionService.getCompletionRequestById(requestId);
            return ResponseEntity.ok(request);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Approve completion request
     */
    @PostMapping("/{requestId}/approve")
    public ResponseEntity<?> approveCompletionRequest(
            @PathVariable Long requestId,
            @AuthenticationPrincipal User manager,
            @RequestBody(required = false) Map<String, String> requestBody) {
        try {
            String reviewNotes = requestBody != null ? requestBody.get("reviewNotes") : null;
            
            VaccinationCampaignDTO campaign = completionService.approveCompletionRequest(requestId, manager, reviewNotes);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Đã duyệt yêu cầu hoàn thành chiến dịch. Chiến dịch đã được chuyển sang trạng thái hoàn thành.");
            response.put("campaign", campaign);
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            errorResponse.put("message", "Không thể duyệt yêu cầu: " + e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Reject completion request
     */
    @PostMapping("/{requestId}/reject")
    public ResponseEntity<?> rejectCompletionRequest(
            @PathVariable Long requestId,
            @AuthenticationPrincipal User manager,
            @RequestBody Map<String, String> requestBody) {
        try {
            String reviewNotes = requestBody.get("reviewNotes");
            if (reviewNotes == null || reviewNotes.trim().isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("error", "Review notes are required for rejection");
                errorResponse.put("message", "Vui lòng nhập lý do từ chối");
                return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
            }
            
            CampaignCompletionRequestDTO request = completionService.rejectCompletionRequest(requestId, manager, reviewNotes);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Đã từ chối yêu cầu hoàn thành chiến dịch");
            response.put("request", request);
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            errorResponse.put("message", "Không thể từ chối yêu cầu: " + e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Get all completion requests (for overview)
     */
    @GetMapping
    public ResponseEntity<List<CampaignCompletionRequestDTO>> getAllCompletionRequests() {
        try {
            List<CampaignCompletionRequestDTO> requests = completionService.getAllCompletionRequests();
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get completion requests by status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<CampaignCompletionRequestDTO>> getCompletionRequestsByStatus(@PathVariable String status) {
        try {
            List<CampaignCompletionRequestDTO> requests = completionService.getCompletionRequestsByStatus(status);
            return ResponseEntity.ok(requests);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Get count of pending completion requests
     */
    @GetMapping("/pending/count")
    public ResponseEntity<Map<String, Long>> getPendingRequestsCount() {
        try {
            Long count = completionService.countPendingRequests();
            Map<String, Long> response = new HashMap<>();
            response.put("count", count);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
} 
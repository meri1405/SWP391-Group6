package group6.Swp391.Se1861.SchoolMedicalManagementSystem.controller;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.CampaignCompletionRequestDTO;
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
@RequestMapping("/api/nurse/campaign-completion")
@RequiredArgsConstructor
public class NurseCampaignCompletionController {

    private final ICampaignCompletionService completionService;

    /**
     * Simple test endpoint for nurse authentication
     */
    @GetMapping("/test-auth")
    public ResponseEntity<Map<String, Object>> testNurseAuth(@AuthenticationPrincipal User nurse) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Nurse authentication successful");
        response.put("nurseId", nurse.getId());
        response.put("nurseFullName", nurse.getFullName());
        response.put("role", nurse.getRole().getRoleName());
        return ResponseEntity.ok(response);
    }

    /**
     * Create a new completion request for a campaign
     */
    @PostMapping("/campaigns/{campaignId}/request-completion")
    public ResponseEntity<?> requestCampaignCompletion(
            @PathVariable Long campaignId,
            @AuthenticationPrincipal User nurse,
            @RequestBody(required = false) Map<String, String> requestBody) {
        try {
            String requestReason = requestBody != null ? requestBody.get("requestReason") : null;
            String completionNotes = requestBody != null ? requestBody.get("completionNotes") : null;
            
            CampaignCompletionRequestDTO request = completionService.createCompletionRequest(
                campaignId, nurse, requestReason, completionNotes);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Đã gửi yêu cầu hoàn thành chiến dịch thành công. Đang chờ quản lý phê duyệt.");
            response.put("request", request);
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            errorResponse.put("message", "Không thể tạo yêu cầu hoàn thành chiến dịch: " + e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Internal server error");
            errorResponse.put("message", "Lỗi hệ thống khi tạo yêu cầu hoàn thành chiến dịch");
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get completion requests created by this nurse
     */
    @GetMapping("/my-requests")
    public ResponseEntity<List<CampaignCompletionRequestDTO>> getMyCompletionRequests(
            @AuthenticationPrincipal User nurse) {
        try {
            // Note: You'll need to add this method to the service interface and implementation
            // List<CampaignCompletionRequestDTO> requests = completionService.getCompletionRequestsByNurse(nurse.getId());
            // For now, return empty list
            return ResponseEntity.ok(List.of());
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Check if a campaign has a pending completion request
     */
    @GetMapping("/campaigns/{campaignId}/has-pending-request")
    public ResponseEntity<Map<String, Object>> hasPendingCompletionRequest(@PathVariable Long campaignId) {
        try {
            boolean hasPending = completionService.hasPendingCompletionRequest(campaignId);
            Map<String, Object> response = new HashMap<>();
            response.put("hasPendingRequest", hasPending);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

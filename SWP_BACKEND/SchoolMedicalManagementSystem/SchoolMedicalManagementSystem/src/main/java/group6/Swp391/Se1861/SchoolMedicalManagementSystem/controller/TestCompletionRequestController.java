package group6.Swp391.Se1861.SchoolMedicalManagementSystem.controller;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.CampaignCompletionRequestDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.ICampaignCompletionService;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
public class TestCompletionRequestController {

    private final ICampaignCompletionService completionService;
    private final IUserService userService;

    /**
     * Test endpoint to create a completion request
     * Use this to test the workflow: 
     * GET /api/test/create-completion-request?campaignId=<id>&nurseUsername=<username>
     */
    @GetMapping("/create-completion-request")
    public ResponseEntity<?> testCreateCompletionRequest(
            @RequestParam Long campaignId,
            @RequestParam(defaultValue = "nurs1") String nurseUsername) {
        try {
            // Find nurse user
            Optional<User> nurseOpt = userService.findByUsername(nurseUsername);
            if (nurseOpt.isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("error", "Nurse not found with username: " + nurseUsername);
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            User nurse = nurseOpt.get();

            // Create completion request
            CampaignCompletionRequestDTO request = completionService.createCompletionRequest(
                campaignId, 
                nurse, 
                "TEST: Yêu cầu hoàn thành chiến dịch từ test endpoint", 
                "TEST: Chiến dịch đã sẵn sàng hoàn thành"
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "✅ TEST SUCCESS: Created completion request and sent notification to managers");
            response.put("request", request);
            response.put("campaignId", campaignId);
            response.put("nurseUsername", nurseUsername);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            errorResponse.put("message", "❌ TEST FAILED: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Test endpoint to check pending requests
     */
    @GetMapping("/check-pending-requests")
    public ResponseEntity<?> checkPendingRequests() {
        try {
            var requests = completionService.getAllPendingRequests();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("pendingRequestsCount", requests.size());
            response.put("pendingRequests", requests);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}

package group6.Swp391.Se1861.SchoolMedicalManagementSystem.controller;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.CampaignCompletionRequest;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.Notification;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.CampaignCompletionRequestRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/debug")
@RequiredArgsConstructor
public class DebugController {

    private final NotificationRepository notificationRepository;
    private final CampaignCompletionRequestRepository completionRequestRepository;

    @GetMapping("/notification/{id}")
    public ResponseEntity<Map<String, Object>> getNotificationDebug(@PathVariable Long id) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // Get notification
            Notification notification = notificationRepository.findById(id).orElse(null);
            if (notification == null) {
                result.put("error", "Notification not found");
                return ResponseEntity.notFound().build();
            }
            
            result.put("notificationId", notification.getId());
            result.put("title", notification.getTitle());
            result.put("message", notification.getMessage());
            result.put("notificationType", notification.getNotificationType());
            result.put("createdAt", notification.getCreatedAt());
            
            // Check campaign completion request relationship
            CampaignCompletionRequest ccr = notification.getCampaignCompletionRequest();
            if (ccr != null) {
                result.put("campaignCompletionRequestId", ccr.getId());
                result.put("campaignCompletionRequestStatus", ccr.getStatus());
                result.put("campaignName", ccr.getCampaign().getName());
            } else {
                result.put("campaignCompletionRequestId", null);
                result.put("campaignCompletionRequest", "NULL");
            }
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            result.put("error", e.getMessage());
            return ResponseEntity.internalServerError().body(result);
        }
    }
    
    @GetMapping("/completion-requests")
    public ResponseEntity<Map<String, Object>> getAllCompletionRequests() {
        Map<String, Object> result = new HashMap<>();
        
        try {
            List<CampaignCompletionRequest> allRequests = completionRequestRepository.findAll();
            List<CampaignCompletionRequest> pendingRequests = completionRequestRepository.findAllPendingRequests();
            
            result.put("totalRequests", allRequests.size());
            result.put("pendingRequests", pendingRequests.size());
            
            // Add details of all requests
            result.put("allRequestDetails", allRequests.stream().map(req -> {
                Map<String, Object> details = new HashMap<>();
                details.put("id", req.getId());
                details.put("status", req.getStatus());
                details.put("campaignName", req.getCampaign().getName());
                details.put("requestDate", req.getRequestDate());
                details.put("nurseUsername", req.getRequestedBy().getUsername());
                return details;
            }).toList());
            
            result.put("pendingRequestDetails", pendingRequests.stream().map(req -> {
                Map<String, Object> details = new HashMap<>();
                details.put("id", req.getId());
                details.put("status", req.getStatus());
                details.put("campaignName", req.getCampaign().getName());
                details.put("requestDate", req.getRequestDate());
                details.put("nurseUsername", req.getRequestedBy().getUsername());
                return details;
            }).toList());
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            result.put("error", e.getMessage());
            return ResponseEntity.internalServerError().body(result);
        }
    }
    
    @GetMapping("/notifications/recent")
    public ResponseEntity<Map<String, Object>> getRecentNotifications() {
        Map<String, Object> result = new HashMap<>();
        
        try {
            List<Notification> recentNotifications = notificationRepository.findAll()
                .stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .limit(10)
                .toList();
            
            result.put("recentNotifications", recentNotifications.stream().map(notif -> {
                Map<String, Object> details = new HashMap<>();
                details.put("id", notif.getId());
                details.put("title", notif.getTitle());
                details.put("notificationType", notif.getNotificationType());
                details.put("createdAt", notif.getCreatedAt());
                details.put("recipientUsername", notif.getRecipient().getUsername());
                
                if (notif.getCampaignCompletionRequest() != null) {
                    details.put("campaignCompletionRequestId", notif.getCampaignCompletionRequest().getId());
                } else {
                    details.put("campaignCompletionRequestId", null);
                }
                
                return details;
            }).toList());
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            result.put("error", e.getMessage());
            return ResponseEntity.internalServerError().body(result);
        }
    }
}

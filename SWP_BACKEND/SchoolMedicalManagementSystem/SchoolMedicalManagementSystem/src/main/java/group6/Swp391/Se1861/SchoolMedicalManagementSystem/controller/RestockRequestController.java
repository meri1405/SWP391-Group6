package group6.Swp391.Se1861.SchoolMedicalManagementSystem.controller;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.RestockRequestDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.RestockItemDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.RestockRequest;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IRestockRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/restock-requests")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RestockRequestController {
    
    private final IRestockRequestService restockRequestService;
    
    // School Nurse endpoints
    @GetMapping
    @PreAuthorize("hasRole('SCHOOLNURSE') or hasRole('MANAGER')")
    public ResponseEntity<List<RestockRequestDTO>> getAllRestockRequests() {
        try {
            List<RestockRequestDTO> requests = restockRequestService.getAllRestockRequests();
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('SCHOOLNURSE') or hasRole('MANAGER')")
    public ResponseEntity<RestockRequestDTO> getRestockRequestById(@PathVariable Long id) {
        try {
            return restockRequestService.getRestockRequestById(id)
                    .map(request -> ResponseEntity.ok(request))
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PostMapping
    @PreAuthorize("hasRole('SCHOOLNURSE')")
    public ResponseEntity<RestockRequestDTO> createRestockRequest(@Valid @RequestBody RestockRequestDTO restockRequestDTO) {
        try {
            if (restockRequestDTO.getRequestedBy() == null) {
                return ResponseEntity.badRequest().build();
            }
            
            RestockRequestDTO createdRequest = restockRequestService.createRestockRequestWithDisplayUnits(restockRequestDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdRequest);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SCHOOLNURSE')")
    public ResponseEntity<RestockRequestDTO> updateRestockRequest(
            @PathVariable Long id, 
            @Valid @RequestBody RestockRequestDTO restockRequestDTO) {
        try {
            RestockRequestDTO updatedRequest = restockRequestService.updateRestockRequest(id, restockRequestDTO);
            return ResponseEntity.ok(updatedRequest);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SCHOOLNURSE')")
    public ResponseEntity<Void> deleteRestockRequest(@PathVariable Long id) {
        try {
            restockRequestService.deleteRestockRequest(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/my-requests")
    @PreAuthorize("hasRole('SCHOOLNURSE')")
    public ResponseEntity<List<RestockRequestDTO>> getMyRestockRequests(@RequestParam Long userId) {
        try {
            List<RestockRequestDTO> requests = restockRequestService.getRequestsByUser(userId);
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('SCHOOLNURSE') or hasRole('MANAGER')")
    public ResponseEntity<List<RestockRequestDTO>> getRequestsByStatus(@PathVariable String status) {
        try {
            RestockRequest.RestockStatus restockStatus = RestockRequest.RestockStatus.valueOf(status.toUpperCase());
            List<RestockRequestDTO> requests = restockRequestService.getRequestsByStatus(restockStatus);
            return ResponseEntity.ok(requests);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PostMapping("/{id}/items")
    @PreAuthorize("hasRole('SCHOOLNURSE')")
    public ResponseEntity<RestockRequestDTO> addItemToRequest(
            @PathVariable Long id, 
            @Valid @RequestBody RestockItemDTO restockItemDTO) {
        try {
            RestockRequestDTO updatedRequest = restockRequestService.addItemToRequest(id, restockItemDTO);
            return ResponseEntity.ok(updatedRequest);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @DeleteMapping("/{requestId}/items/{itemId}")
    @PreAuthorize("hasRole('SCHOOLNURSE')")
    public ResponseEntity<RestockRequestDTO> removeItemFromRequest(
            @PathVariable Long requestId, 
            @PathVariable Long itemId) {
        try {
            RestockRequestDTO updatedRequest = restockRequestService.removeItemFromRequest(requestId, itemId);
            return ResponseEntity.ok(updatedRequest);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PutMapping("/{requestId}/items/{itemId}")
    @PreAuthorize("hasRole('SCHOOLNURSE')")
    public ResponseEntity<RestockRequestDTO> updateRequestItem(
            @PathVariable Long requestId, 
            @PathVariable Long itemId, 
            @Valid @RequestBody RestockItemDTO restockItemDTO) {
        try {
            RestockRequestDTO updatedRequest = restockRequestService.updateRequestItem(requestId, itemId, restockItemDTO);
            return ResponseEntity.ok(updatedRequest);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Manager endpoints
    @GetMapping("/manager/all")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<List<RestockRequestDTO>> getAllRequestsForManager() {
        try {
            List<RestockRequestDTO> requests = restockRequestService.getAllRestockRequests();
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/manager/pending")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<List<RestockRequestDTO>> getPendingRequests() {
        try {
            List<RestockRequestDTO> requests = restockRequestService.getPendingRequests();
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/manager/high-priority")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<List<RestockRequestDTO>> getHighPriorityRequests() {
        try {
            List<RestockRequestDTO> requests = restockRequestService.getHighPriorityRequests();
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/manager/requiring-attention")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<List<RestockRequestDTO>> getRequestsRequiringAttention() {
        try {
            List<RestockRequestDTO> requests = restockRequestService.getRequestsRequiringAttention();
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<RestockRequestDTO> approveRequest(
            @PathVariable Long id,
            @RequestBody Map<String, Object> approvalData) {
        try {
            Long reviewerId = ((Number) approvalData.get("reviewerId")).longValue();
            String reviewNotes = (String) approvalData.getOrDefault("reviewNotes", "");
            @SuppressWarnings("unchecked")
            Map<Long, Map<String, Object>> itemApprovals = (Map<Long, Map<String, Object>>) approvalData.get("itemApprovals");
            
            RestockRequestDTO approvedRequest = restockRequestService.approveRequest(
                    id, reviewerId, reviewNotes, itemApprovals);
            return ResponseEntity.ok(approvedRequest);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<RestockRequestDTO> rejectRequest(
            @PathVariable Long id,
            @RequestBody Map<String, Object> rejectionData) {
        try {
            Long reviewerId = ((Number) rejectionData.get("reviewerId")).longValue();
            String reviewNotes = (String) rejectionData.getOrDefault("reviewNotes", "");
            
            RestockRequestDTO rejectedRequest = restockRequestService.rejectRequest(id, reviewerId, reviewNotes);
            return ResponseEntity.ok(rejectedRequest);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PostMapping("/{id}/complete")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<RestockRequestDTO> completeRequest(@PathVariable Long id) {
        try {
            RestockRequestDTO completedRequest = restockRequestService.completeRequest(id);
            return ResponseEntity.ok(completedRequest);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/stats/counts")
    @PreAuthorize("hasRole('MANAGER') or hasRole('SCHOOLNURSE')")
    public ResponseEntity<Map<String, Long>> getRequestStatistics() {
        try {
            Map<String, Long> stats = Map.of(
                    "pending", restockRequestService.getPendingRequestsCount()
            );
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}

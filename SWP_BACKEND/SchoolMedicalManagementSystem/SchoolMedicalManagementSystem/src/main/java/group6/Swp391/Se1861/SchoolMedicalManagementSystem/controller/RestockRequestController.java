package group6.Swp391.Se1861.SchoolMedicalManagementSystem.controller;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.RestockRequestDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.RestockItemDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.RestockRequest;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IRestockRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/restock-requests")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RestockRequestController {
    
    private final IRestockRequestService restockRequestService;
    
    @GetMapping
    @PreAuthorize("hasRole('SCHOOLNURSE')")
    public ResponseEntity<List<RestockRequestDTO>> getAllRestockRequests() {
        List<RestockRequestDTO> requests = restockRequestService.getAllRestockRequests();
        return ResponseEntity.ok(requests);
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('SCHOOLNURSE')")
    public ResponseEntity<RestockRequestDTO> getRestockRequestById(@PathVariable Long id) {
        return restockRequestService.getRestockRequestById(id)
                .map(request -> ResponseEntity.ok(request))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    @PreAuthorize("hasRole('SCHOOLNURSE')")
    public ResponseEntity<RestockRequestDTO> createRestockRequest(@RequestBody RestockRequestDTO restockRequestDTO) {
        try {
            System.out.println("Received restock request: " + restockRequestDTO);
            System.out.println("Number of restock items: " + 
                (restockRequestDTO.getRestockItems() != null ? restockRequestDTO.getRestockItems().size() : 0));
            
            // Use user ID from frontend request
            if (restockRequestDTO.getRequestedBy() == null) {
                throw new RuntimeException("User ID is required");
            }
            
            System.out.println("Using user ID: " + restockRequestDTO.getRequestedBy());
            
            RestockRequestDTO createdRequest = restockRequestService.createRestockRequest(restockRequestDTO);
            System.out.println("Created request with ID: " + createdRequest.getId());
            System.out.println("Created request items count: " + 
                (createdRequest.getRestockItems() != null ? createdRequest.getRestockItems().size() : 0));
            System.out.println("Created request requestedByName: " + createdRequest.getRequestedByName());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(createdRequest);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SCHOOLNURSE')")
    public ResponseEntity<RestockRequestDTO> updateRestockRequest(
            @PathVariable Long id, 
            @RequestBody RestockRequestDTO restockRequestDTO) {
        try {
            RestockRequestDTO updatedRequest = restockRequestService.updateRestockRequest(id, restockRequestDTO);
            return ResponseEntity.ok(updatedRequest);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
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
        }
    }
    
    @GetMapping("/my-requests")
    @PreAuthorize("hasRole('SCHOOLNURSE')")
    public ResponseEntity<List<RestockRequestDTO>> getMyRestockRequests() {
        // For now, return all requests - this should be improved to get actual user ID
        List<RestockRequestDTO> requests = restockRequestService.getAllRestockRequests();
        return ResponseEntity.ok(requests);
    }
    
    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('SCHOOLNURSE')")
    public ResponseEntity<List<RestockRequestDTO>> getRequestsByStatus(@PathVariable String status) {
        try {
            RestockRequest.RestockStatus restockStatus = RestockRequest.RestockStatus.valueOf(status.toUpperCase());
            List<RestockRequestDTO> requests = restockRequestService.getRequestsByStatus(restockStatus);
            return ResponseEntity.ok(requests);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/{id}/items")
    @PreAuthorize("hasRole('SCHOOLNURSE')")
    public ResponseEntity<RestockRequestDTO> addItemToRequest(
            @PathVariable Long id, 
            @RequestBody RestockItemDTO restockItemDTO) {
        try {
            RestockRequestDTO updatedRequest = restockRequestService.addItemToRequest(id, restockItemDTO);
            return ResponseEntity.ok(updatedRequest);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
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
        }
    }
    
    @PutMapping("/{requestId}/items/{itemId}")
    @PreAuthorize("hasRole('SCHOOLNURSE')")
    public ResponseEntity<RestockRequestDTO> updateRequestItem(
            @PathVariable Long requestId, 
            @PathVariable Long itemId, 
            @RequestBody RestockItemDTO restockItemDTO) {
        try {
            RestockRequestDTO updatedRequest = restockRequestService.updateRequestItem(requestId, itemId, restockItemDTO);
            return ResponseEntity.ok(updatedRequest);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // Manager endpoints
    @GetMapping("/pending")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<List<RestockRequestDTO>> getPendingRequests() {
        List<RestockRequestDTO> pendingRequests = restockRequestService.getPendingRequests();
        return ResponseEntity.ok(pendingRequests);
    }
    
    @GetMapping("/all")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<List<RestockRequestDTO>> getAllRequestsForManager() {
        List<RestockRequestDTO> requests = restockRequestService.getAllRestockRequests();
        return ResponseEntity.ok(requests);
    }
    
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<RestockRequestDTO> approveRequest(
            @PathVariable Long id,
            @RequestBody Map<String, Object> approvalData) {
        try {
            // For now, use a default manager ID - this should be improved
            Long managerId = 1L; // Default manager ID
            
            String reviewNotes = (String) approvalData.get("reviewNotes");
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> itemApprovals = (List<Map<String, Object>>) approvalData.get("itemApprovals");
            
            RestockRequestDTO approvedRequest = restockRequestService.approveRequestWithQuantities(id, managerId, reviewNotes, itemApprovals);
            return ResponseEntity.ok(approvedRequest);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<RestockRequestDTO> rejectRequest(
            @PathVariable Long id,
            @RequestBody Map<String, String> rejectionData) {
        try {
            // For now, use a default manager ID - this should be improved
            Long managerId = 1L; // Default manager ID
            
            String reviewNotes = rejectionData.get("reviewNotes");
            RestockRequestDTO rejectedRequest = restockRequestService.rejectRequest(id, managerId, reviewNotes);
            return ResponseEntity.ok(rejectedRequest);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}/complete")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<RestockRequestDTO> completeRequest(@PathVariable Long id) {
        try {
            RestockRequestDTO completedRequest = restockRequestService.completeRequest(id);
            return ResponseEntity.ok(completedRequest);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}

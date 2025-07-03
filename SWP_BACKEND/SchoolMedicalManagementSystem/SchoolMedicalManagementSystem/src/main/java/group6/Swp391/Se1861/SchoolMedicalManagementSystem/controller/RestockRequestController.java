package group6.Swp391.Se1861.SchoolMedicalManagementSystem.controller;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.RestockRequestDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.RestockItemDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.ExtendedRestockItemDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.RestockRequest;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IRestockRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;

import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/restock-requests")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RestockRequestController {
    
    private final IRestockRequestService restockRequestService;
    private static final Logger log = LoggerFactory.getLogger(RestockRequestController.class);
    
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
    
    @GetMapping("/{id}/extended")
    @PreAuthorize("hasRole('SCHOOLNURSE') or hasRole('MANAGER')")
    public ResponseEntity<RestockRequestDTO> getExtendedRestockRequestById(@PathVariable Long id) {
        try {
            return restockRequestService.getRestockRequestById(id)
                    .map(request -> {
                        // Ensure the extendedRestockItems field is populated
                        if (request.getRestockItems() != null && request.getExtendedRestockItems() == null) {
                            // Convert regular items to extended items if needed
                            List<ExtendedRestockItemDTO> extendedItems = request.getRestockItems().stream()
                                    .map(item -> {
                                        ExtendedRestockItemDTO extendedItem = new ExtendedRestockItemDTO();
                                        // Copy properties from regular item
                                        BeanUtils.copyProperties(item, extendedItem);
                                        return extendedItem;
                                    })
                                    .collect(Collectors.toList());
                            request.setExtendedRestockItems(extendedItems);
                        }
                        return ResponseEntity.ok(request);
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error retrieving extended restock request: {}", e.getMessage());
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
    
    @PostMapping("/extended")
    @PreAuthorize("hasRole('SCHOOLNURSE')")
    public ResponseEntity<RestockRequestDTO> createExtendedRestockRequest(@Valid @RequestBody RestockRequestDTO restockRequestDTO) {
        try {
            if (restockRequestDTO.getRequestedBy() == null) {
                return ResponseEntity.badRequest().build();
            }
            
            RestockRequestDTO createdRequest = restockRequestService.createExtendedRestockRequest(restockRequestDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdRequest);
        } catch (RuntimeException e) {
            log.error("Error creating extended restock request: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Unexpected error creating extended restock request: {}", e.getMessage(), e);
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
    
    @PostMapping("/{id}/items/new-supply")
    @PreAuthorize("hasRole('SCHOOLNURSE')")
    public ResponseEntity<RestockRequestDTO> addNewSupplyToRequest(
            @PathVariable Long id, 
            @Valid @RequestBody ExtendedRestockItemDTO extendedRestockItemDTO) {
        try {
            // Set request type explicitly
            extendedRestockItemDTO.setRequestType("NEW");
            RestockRequestDTO updatedRequest = restockRequestService.addNewSupplyToRequest(id, extendedRestockItemDTO);
            return ResponseEntity.ok(updatedRequest);
        } catch (RuntimeException e) {
            log.error("Error adding new supply to request: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Unexpected error adding new supply to request: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PostMapping("/{id}/items/expired-supply")
    @PreAuthorize("hasRole('SCHOOLNURSE')")
    public ResponseEntity<RestockRequestDTO> addExpiredSupplyToRequest(
            @PathVariable Long id, 
            @Valid @RequestBody ExtendedRestockItemDTO extendedRestockItemDTO) {
        try {
            // Validate expiration date
            if (extendedRestockItemDTO.getNewExpirationDate() == null) {
                return ResponseEntity.badRequest().build();
            }
            
            // Set request type explicitly
            extendedRestockItemDTO.setRequestType("EXPIRED");
            RestockRequestDTO updatedRequest = restockRequestService.addExpiredSupplyToRequest(id, extendedRestockItemDTO);
            return ResponseEntity.ok(updatedRequest);
        } catch (RuntimeException e) {
            log.error("Error adding expired supply refill to request: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Unexpected error adding expired supply refill to request: {}", e.getMessage(), e);
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
            Long reviewerId;
            // Handle both numeric and string reviewerId
            Object reviewerIdObj = approvalData.get("reviewerId");
            if (reviewerIdObj instanceof Number) {
                reviewerId = ((Number) reviewerIdObj).longValue();
            } else if (reviewerIdObj instanceof String) {
                try {
                    reviewerId = Long.parseLong((String) reviewerIdObj);
                } catch (NumberFormatException e) {
                    // If the string is not a number, use default manager ID
                    reviewerId = 2L; // Default manager ID
                    log.warn("Non-numeric reviewerId received: {}. Using default manager ID: {}", reviewerIdObj, reviewerId);
                }
            } else {
                // Default to manager ID if reviewerId is missing or invalid
                reviewerId = 2L; 
                log.warn("Missing or invalid reviewerId. Using default manager ID: {}", reviewerId);
            }
            
            String reviewNotes = (String) approvalData.getOrDefault("reviewNotes", "");
            @SuppressWarnings("unchecked")
            Map<Long, Map<String, Object>> itemApprovals = (Map<Long, Map<String, Object>>) approvalData.get("itemApprovals");
            
            RestockRequestDTO approvedRequest = restockRequestService.approveRequest(
                    id, reviewerId, reviewNotes, itemApprovals);
            return ResponseEntity.ok(approvedRequest);
        } catch (RuntimeException e) {
            log.error("Error approving request: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Unexpected error approving request: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<RestockRequestDTO> rejectRequest(
            @PathVariable Long id,
            @RequestBody Map<String, Object> rejectionData) {
        try {
            Long reviewerId;
            // Handle both numeric and string reviewerId
            Object reviewerIdObj = rejectionData.get("reviewerId");
            if (reviewerIdObj instanceof Number) {
                reviewerId = ((Number) reviewerIdObj).longValue();
            } else if (reviewerIdObj instanceof String) {
                try {
                    reviewerId = Long.parseLong((String) reviewerIdObj);
                } catch (NumberFormatException e) {
                    // If the string is not a number, use default manager ID
                    reviewerId = 2L; // Default manager ID
                    log.warn("Non-numeric reviewerId received for rejection: {}. Using default manager ID: {}", reviewerIdObj, reviewerId);
                }
            } else {
                // Default to manager ID if reviewerId is missing or invalid
                reviewerId = 2L; 
                log.warn("Missing or invalid reviewerId for rejection. Using default manager ID: {}", reviewerId);
            }
            
            String reviewNotes = (String) rejectionData.getOrDefault("reviewNotes", "");
            
            RestockRequestDTO rejectedRequest = restockRequestService.rejectRequest(id, reviewerId, reviewNotes);
            return ResponseEntity.ok(rejectedRequest);
        } catch (RuntimeException e) {
            log.error("Error rejecting request: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Unexpected error rejecting request: {}", e.getMessage());
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

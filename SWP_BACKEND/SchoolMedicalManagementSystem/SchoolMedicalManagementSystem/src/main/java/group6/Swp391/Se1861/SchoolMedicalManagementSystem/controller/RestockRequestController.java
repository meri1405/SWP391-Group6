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
            // Set the requesting user from security context
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Long userId = getUserIdFromAuthentication(auth);
            restockRequestDTO.setRequestedBy(userId);
            
            RestockRequestDTO createdRequest = restockRequestService.createRestockRequest(restockRequestDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdRequest);
        } catch (Exception e) {
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
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Long userId = getUserIdFromAuthentication(auth);
        
        List<RestockRequestDTO> requests = restockRequestService.getRequestsByUser(userId);
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
    
    private Long getUserIdFromAuthentication(Authentication auth) {
        // This would depend on your UserDetails implementation
        // For now, return a placeholder - implement based on your security setup
        return 1L; // TODO: Implement proper user ID extraction from JWT or UserDetails
    }
}

package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.RestockRequestDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.RestockItemDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.RestockRequest;

import java.util.List;
import java.util.Optional;

public interface IRestockRequestService {
    
    List<RestockRequestDTO> getAllRestockRequests();
    
    Optional<RestockRequestDTO> getRestockRequestById(Long id);
    
    RestockRequestDTO createRestockRequest(RestockRequestDTO restockRequestDTO);
    
    RestockRequestDTO updateRestockRequest(Long id, RestockRequestDTO restockRequestDTO);
    
    void deleteRestockRequest(Long id);
    
    List<RestockRequestDTO> getRequestsByUser(Long userId);
    
    List<RestockRequestDTO> getRequestsByStatus(RestockRequest.RestockStatus status);
    
    List<RestockRequestDTO> getPendingRequests();
    
    RestockRequestDTO approveRequest(Long id, Long reviewerId, String reviewNotes);
    
    RestockRequestDTO rejectRequest(Long id, Long reviewerId, String reviewNotes);
    
    RestockRequestDTO completeRequest(Long id);
    
    RestockRequestDTO addItemToRequest(Long requestId, RestockItemDTO restockItemDTO);
    
    RestockRequestDTO removeItemFromRequest(Long requestId, Long itemId);
    
    RestockRequestDTO updateRequestItem(Long requestId, Long itemId, RestockItemDTO restockItemDTO);
    
    List<RestockRequestDTO> getHighPriorityRequests();
    
    long getPendingRequestsCount();
    
    RestockRequestDTO convertToDTO(RestockRequest restockRequest);
    
    RestockRequest convertToEntity(RestockRequestDTO restockRequestDTO);
}

package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.impl;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.RestockRequestDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.RestockItemDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.RestockRequest;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.RestockItem;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.MedicalSupply;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.RestockRequestRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.RestockItemRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.MedicalSupplyRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.UserRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IMedicalSupplyService;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IRestockRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class RestockRequestService implements IRestockRequestService {
    
    private final RestockRequestRepository restockRequestRepository;
    private final RestockItemRepository restockItemRepository;
    private final MedicalSupplyRepository medicalSupplyRepository;
    private final UserRepository userRepository;
    private final IMedicalSupplyService medicalSupplyService;
    
    @Override
    public List<RestockRequestDTO> getAllRestockRequests() {
        return restockRequestRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public Optional<RestockRequestDTO> getRestockRequestById(Long id) {
        return restockRequestRepository.findById(id)
                .map(this::convertToDTO);
    }
    
    @Override
    public RestockRequestDTO createRestockRequest(RestockRequestDTO restockRequestDTO) {
        RestockRequest restockRequest = convertToEntity(restockRequestDTO);
        RestockRequest savedRequest = restockRequestRepository.save(restockRequest);
        return convertToDTO(savedRequest);
    }
    
    @Override
    public RestockRequestDTO updateRestockRequest(Long id, RestockRequestDTO restockRequestDTO) {
        RestockRequest existingRequest = restockRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Restock request not found with id: " + id));
        
        existingRequest.setPriority(restockRequestDTO.getPriority());
        existingRequest.setReason(restockRequestDTO.getReason());
        
        RestockRequest updatedRequest = restockRequestRepository.save(existingRequest);
        return convertToDTO(updatedRequest);
    }
    
    @Override
    public void deleteRestockRequest(Long id) {
        RestockRequest request = restockRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Restock request not found with id: " + id));
        
        if (request.getStatus() != RestockRequest.RestockStatus.PENDING) {
            throw new RuntimeException("Cannot delete request that is not in PENDING status");
        }
        
        restockRequestRepository.deleteById(id);
    }
    
    @Override
    public List<RestockRequestDTO> getRequestsByUser(Long userId) {
        return restockRequestRepository.findByRequestedByOrderByRequestDateDesc(userId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<RestockRequestDTO> getRequestsByStatus(RestockRequest.RestockStatus status) {
        return restockRequestRepository.findByStatusOrderByRequestDateAsc(status)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<RestockRequestDTO> getPendingRequests() {
        return getRequestsByStatus(RestockRequest.RestockStatus.PENDING);
    }
    
    @Override
    public RestockRequestDTO approveRequest(Long id, Long reviewerId, String reviewNotes) {
        RestockRequest request = restockRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Restock request not found with id: " + id));
        
        if (request.getStatus() != RestockRequest.RestockStatus.PENDING) {
            throw new RuntimeException("Only PENDING requests can be approved");
        }
        
        request.setStatus(RestockRequest.RestockStatus.APPROVED);
        request.setReviewedBy(reviewerId);
        request.setReviewNotes(reviewNotes);
        request.setReviewDate(LocalDateTime.now());
        
        RestockRequest updatedRequest = restockRequestRepository.save(request);
        return convertToDTO(updatedRequest);
    }
    
    @Override
    public RestockRequestDTO rejectRequest(Long id, Long reviewerId, String reviewNotes) {
        RestockRequest request = restockRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Restock request not found with id: " + id));
        
        if (request.getStatus() != RestockRequest.RestockStatus.PENDING) {
            throw new RuntimeException("Only PENDING requests can be rejected");
        }
        
        request.setStatus(RestockRequest.RestockStatus.REJECTED);
        request.setReviewedBy(reviewerId);
        request.setReviewNotes(reviewNotes);
        request.setReviewDate(LocalDateTime.now());
        
        RestockRequest updatedRequest = restockRequestRepository.save(request);
        return convertToDTO(updatedRequest);
    }
    
    @Override
    public RestockRequestDTO completeRequest(Long id) {
        RestockRequest request = restockRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Restock request not found with id: " + id));
        
        if (request.getStatus() != RestockRequest.RestockStatus.APPROVED) {
            throw new RuntimeException("Only APPROVED requests can be completed");
        }
        
        // Update inventory based on approved quantities
        for (RestockItem item : request.getRestockItems()) {
            if (item.getApprovedQuantity() != null && item.getApprovedQuantity() > 0) {
                medicalSupplyService.addStock(item.getMedicalSupply().getId(), item.getApprovedQuantity());
            }
        }
        
        request.setStatus(RestockRequest.RestockStatus.COMPLETED);
        request.setCompletedDate(LocalDateTime.now());
        
        RestockRequest updatedRequest = restockRequestRepository.save(request);
        return convertToDTO(updatedRequest);
    }
    
    @Override
    public RestockRequestDTO addItemToRequest(Long requestId, RestockItemDTO restockItemDTO) {
        RestockRequest request = restockRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Restock request not found with id: " + requestId));
        
        if (request.getStatus() != RestockRequest.RestockStatus.PENDING) {
            throw new RuntimeException("Cannot add items to non-PENDING requests");
        }
        
        MedicalSupply medicalSupply = medicalSupplyRepository.findById(restockItemDTO.getMedicalSupplyId())
                .orElseThrow(() -> new RuntimeException("Medical supply not found with id: " + restockItemDTO.getMedicalSupplyId()));
        
        RestockItem restockItem = new RestockItem();
        restockItem.setRestockRequest(request);
        restockItem.setMedicalSupply(medicalSupply);
        restockItem.setRequestedQuantity(restockItemDTO.getRequestedQuantity());
        restockItem.setNotes(restockItemDTO.getNotes());
        
        restockItemRepository.save(restockItem);
        
        return convertToDTO(request);
    }
    
    @Override
    public RestockRequestDTO removeItemFromRequest(Long requestId, Long itemId) {
        RestockRequest request = restockRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Restock request not found with id: " + requestId));
        
        if (request.getStatus() != RestockRequest.RestockStatus.PENDING) {
            throw new RuntimeException("Cannot remove items from non-PENDING requests");
        }
        
        RestockItem item = restockItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Restock item not found with id: " + itemId));
        
        if (!item.getRestockRequest().getId().equals(requestId)) {
            throw new RuntimeException("Item does not belong to the specified request");
        }
        
        restockItemRepository.delete(item);
        
        return convertToDTO(request);
    }
    
    @Override
    public RestockRequestDTO updateRequestItem(Long requestId, Long itemId, RestockItemDTO restockItemDTO) {
        RestockRequest request = restockRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Restock request not found with id: " + requestId));
        
        RestockItem item = restockItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Restock item not found with id: " + itemId));
        
        if (!item.getRestockRequest().getId().equals(requestId)) {
            throw new RuntimeException("Item does not belong to the specified request");
        }
        
        // Update based on request status
        if (request.getStatus() == RestockRequest.RestockStatus.PENDING) {
            item.setRequestedQuantity(restockItemDTO.getRequestedQuantity());
            item.setNotes(restockItemDTO.getNotes());
        } else if (request.getStatus() == RestockRequest.RestockStatus.APPROVED) {
            item.setApprovedQuantity(restockItemDTO.getApprovedQuantity());
        }
        
        restockItemRepository.save(item);
        
        return convertToDTO(request);
    }
    
    @Override
    public List<RestockRequestDTO> getHighPriorityRequests() {
        return restockRequestRepository.findByPriorityAndStatus("HIGH", RestockRequest.RestockStatus.PENDING)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public long getPendingRequestsCount() {
        return restockRequestRepository.countByStatus(RestockRequest.RestockStatus.PENDING);
    }
    
    @Override
    public RestockRequestDTO convertToDTO(RestockRequest restockRequest) {
        RestockRequestDTO dto = new RestockRequestDTO();
        dto.setId(restockRequest.getId());
        dto.setRequestedBy(restockRequest.getRequestedBy());
        dto.setReviewedBy(restockRequest.getReviewedBy());
        dto.setStatus(restockRequest.getStatus());
        dto.setPriority(restockRequest.getPriority());
        dto.setReason(restockRequest.getReason());
        dto.setReviewNotes(restockRequest.getReviewNotes());
        dto.setRequestDate(restockRequest.getRequestDate());
        dto.setReviewDate(restockRequest.getReviewDate());
        dto.setCompletedDate(restockRequest.getCompletedDate());
        
        // Get user names
        if (restockRequest.getRequestedBy() != null) {
            userRepository.findById(restockRequest.getRequestedBy())
                    .ifPresent(user -> dto.setRequestedByName(user.getFirstName() + " " + user.getLastName()));
        }
        
        if (restockRequest.getReviewedBy() != null) {
            userRepository.findById(restockRequest.getReviewedBy())
                    .ifPresent(user -> dto.setReviewedByName(user.getFirstName() + " " + user.getLastName()));
        }
        
        // Convert restock items
        if (restockRequest.getRestockItems() != null) {
            dto.setRestockItems(restockRequest.getRestockItems().stream()
                    .map(this::convertItemToDTO)
                    .collect(Collectors.toList()));
        }
        
        return dto;
    }
    
    private RestockItemDTO convertItemToDTO(RestockItem restockItem) {
        RestockItemDTO dto = new RestockItemDTO();
        dto.setId(restockItem.getId());
        dto.setRestockRequestId(restockItem.getRestockRequest().getId());
        dto.setMedicalSupplyId(restockItem.getMedicalSupply().getId());
        dto.setMedicalSupplyName(restockItem.getMedicalSupply().getName());
        dto.setCategory(restockItem.getMedicalSupply().getCategory());
        dto.setUnit(restockItem.getMedicalSupply().getUnit());
        dto.setCurrentStock(restockItem.getMedicalSupply().getQuantity());
        dto.setMinStockLevel(restockItem.getMedicalSupply().getMinStockLevel());
        dto.setRequestedQuantity(restockItem.getRequestedQuantity());
        dto.setApprovedQuantity(restockItem.getApprovedQuantity());
        dto.setNotes(restockItem.getNotes());
        return dto;
    }
    
    @Override
    public RestockRequest convertToEntity(RestockRequestDTO dto) {
        RestockRequest restockRequest = new RestockRequest();
        restockRequest.setId(dto.getId());
        restockRequest.setRequestedBy(dto.getRequestedBy());
        restockRequest.setReviewedBy(dto.getReviewedBy());
        restockRequest.setStatus(dto.getStatus());
        restockRequest.setPriority(dto.getPriority());
        restockRequest.setReason(dto.getReason());
        restockRequest.setReviewNotes(dto.getReviewNotes());
        restockRequest.setRequestDate(dto.getRequestDate());
        restockRequest.setReviewDate(dto.getReviewDate());
        restockRequest.setCompletedDate(dto.getCompletedDate());
        return restockRequest;
    }
}

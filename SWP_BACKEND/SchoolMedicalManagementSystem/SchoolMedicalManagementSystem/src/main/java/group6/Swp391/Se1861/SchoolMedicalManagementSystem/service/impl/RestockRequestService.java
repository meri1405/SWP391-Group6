package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.impl;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.RestockRequestDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.RestockItemDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.MedicalSupplyDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.ExtendedRestockItemDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.RestockRequest;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.RestockItem;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.MedicalSupply;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.RestockRequestRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.RestockItemRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.MedicalSupplyRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.UserRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IMedicalSupplyService;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.INotificationService;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IRestockRequestService;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IUnitConversionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class RestockRequestService implements IRestockRequestService {
    
    private final RestockRequestRepository restockRequestRepository;
    private final RestockItemRepository restockItemRepository;
    private final MedicalSupplyRepository medicalSupplyRepository;
    private final UserRepository userRepository;
    private final IMedicalSupplyService medicalSupplyService;
    private final IUnitConversionService unitConversionService;
    private final INotificationService notificationService;
    
    @Override
    @Transactional(readOnly = true)
    public List<RestockRequestDTO> getAllRestockRequests() {
        return restockRequestRepository.findAllWithItems()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<RestockRequestDTO> getRestockRequestById(Long id) {
        return restockRequestRepository.findById(id)
                .map(this::convertToDTO);
    }
    
    @Override
    public RestockRequestDTO createRestockRequest(RestockRequestDTO restockRequestDTO) {
        log.info("Creating restock request with {} items", 
                restockRequestDTO.getRestockItems() != null ? restockRequestDTO.getRestockItems().size() : 0);
        
        RestockRequest restockRequest = convertToEntity(restockRequestDTO);
        
        // Process restock items and convert display units to base units
        if (restockRequest.getRestockItems() != null) {
            for (RestockItem item : restockRequest.getRestockItems()) {
                MedicalSupply supply = item.getMedicalSupply();
                
                // Convert requested display quantity to base unit
                BigDecimal requestedInBaseUnit = unitConversionService.convertToBaseUnit(
                        item.getRequestedDisplayQuantity(),
                        item.getRequestedDisplayUnit(),
                        supply.getBaseUnit()
                );
                item.setRequestedQuantityInBaseUnit(requestedInBaseUnit);
                
                // Set the restock request reference
                item.setRestockRequest(restockRequest);
                
                log.debug("Converted requested quantity for supply {}: {} {} = {} {}", 
                        supply.getName(), 
                        item.getRequestedDisplayQuantity(), item.getRequestedDisplayUnit(),
                        requestedInBaseUnit, supply.getBaseUnit());
            }
        }
        
        RestockRequest savedRequest = restockRequestRepository.save(restockRequest);
        log.info("Created restock request with ID: {}", savedRequest.getId());
        
        // Notify managers about the new restock request
        try {
            log.info("About to send notification to managers for restock request ID: {} from user ID: {}", 
                    savedRequest.getId(), savedRequest.getRequestedBy());
            notificationService.notifyManagersAboutRestockRequest(savedRequest);
            log.info("Notification sent to managers about restock request ID: {}", savedRequest.getId());
        } catch (Exception e) {
            log.error("Error sending notification to managers: {}", e.getMessage(), e);
        }
        
        return convertToDTO(savedRequest);
    }
    
    @Override
    public RestockRequestDTO createRestockRequestWithDisplayUnits(RestockRequestDTO restockRequestDTO) {
        // This method specifically handles requests where all units are already converted
        return createRestockRequest(restockRequestDTO);
    }
    
    @Override
    public RestockRequestDTO createExtendedRestockRequest(RestockRequestDTO restockRequestDTO) {
        log.info("Creating extended restock request with {} items", 
                restockRequestDTO.getExtendedRestockItems() != null ? restockRequestDTO.getExtendedRestockItems().size() : 0);
        
        RestockRequest restockRequest = new RestockRequest();
        restockRequest.setRequestedBy(restockRequestDTO.getRequestedBy());
        restockRequest.setStatus(RestockRequest.RestockStatus.PENDING);
        restockRequest.setPriority(restockRequestDTO.getPriority());
        restockRequest.setReason(restockRequestDTO.getReason());
        
        // Save request first to get ID
        RestockRequest savedRequest = restockRequestRepository.save(restockRequest);
        
        // Process each item in the request based on its type
        if (restockRequestDTO.getExtendedRestockItems() != null) {
            for (ExtendedRestockItemDTO itemDTO : restockRequestDTO.getExtendedRestockItems()) {
                RestockItem item = new RestockItem();
                item.setRestockRequest(savedRequest);
                
                // Handle different types of restock items
                switch(itemDTO.getRequestType()) {
                    case "NEW":
                        // Create a new disabled medical supply
                        MedicalSupplyDTO newSupplyDTO = new MedicalSupplyDTO();
                        newSupplyDTO.setName(itemDTO.getName());
                        newSupplyDTO.setCategory(itemDTO.getCategory());
                        newSupplyDTO.setBaseUnit(itemDTO.getBaseUnit());
                        newSupplyDTO.setDisplayUnit(itemDTO.getDisplayUnit());
                        newSupplyDTO.setMinStockLevelInBaseUnit(itemDTO.getMinStockLevelInBaseUnit());
                        newSupplyDTO.setSupplier(itemDTO.getSupplier());
                        newSupplyDTO.setLocation(itemDTO.getLocation());
                        newSupplyDTO.setDescription(itemDTO.getDescription());
                        newSupplyDTO.setExpirationDate(itemDTO.getNewExpirationDate());
                        
                        // Create disabled supply
                        MedicalSupplyDTO createdSupply = medicalSupplyService.createDisabledMedicalSupply(
                                newSupplyDTO, restockRequestDTO.getRequestedBy());
                        
                        // Link the newly created supply to the restock item
                        MedicalSupply newSupply = medicalSupplyRepository.findById(createdSupply.getId())
                                .orElseThrow(() -> new RuntimeException("Không thể tìm thấy vật tư mới tạo"));
                        
                        item.setMedicalSupply(newSupply);
                        break;
                        
                    case "EXPIRED":
                        // Check if we have an ID of the expired supply
                        if (itemDTO.getMedicalSupplyId() == null) {
                            throw new RuntimeException("ID của vật tư hết hạn không được để trống");
                        }
                        
                        // Check if we have a new expiration date
                        if (itemDTO.getNewExpirationDate() == null) {
                            throw new RuntimeException("Ngày hết hạn mới không được để trống cho vật tư hết hạn");
                        }
                        
                        // Create a duplicate of the expired supply with new expiration date
                        MedicalSupplyDTO duplicateDTO = medicalSupplyService.duplicateExpiredSupply(
                                itemDTO.getMedicalSupplyId(), 
                                itemDTO.getNewExpirationDate(),
                                restockRequestDTO.getRequestedBy());
                        
                        // Link the newly created supply to the restock item
                        MedicalSupply duplicateSupply = medicalSupplyRepository.findById(duplicateDTO.getId())
                                .orElseThrow(() -> new RuntimeException("Không thể tìm thấy vật tư mới tạo"));
                        
                        item.setMedicalSupply(duplicateSupply);
                        break;
                        
                    case "EXISTING":
                    default:
                        // Regular existing supply request
                        MedicalSupply supply = medicalSupplyRepository.findById(itemDTO.getMedicalSupplyId())
                                .orElseThrow(() -> new RuntimeException("Không tìm thấy vật tư y tế với ID: " + itemDTO.getMedicalSupplyId()));
                        item.setMedicalSupply(supply);
                        break;
                }
                
                // Common fields for all item types
                item.setRequestedDisplayQuantity(itemDTO.getRequestedDisplayQuantity());
                item.setRequestedDisplayUnit(itemDTO.getRequestedDisplayUnit());
                
                // Convert to base unit
                BigDecimal requestedInBaseUnit = unitConversionService.convertToBaseUnit(
                        itemDTO.getRequestedDisplayQuantity(),
                        itemDTO.getRequestedDisplayUnit(),
                        item.getMedicalSupply().getBaseUnit()
                );
                item.setRequestedQuantityInBaseUnit(requestedInBaseUnit);
                
                // Add notes if any
                item.setNotes(itemDTO.getNotes());
                
                // Save the item
                restockItemRepository.save(item);
                log.debug("Added {} item: {}", 
                        itemDTO.getRequestType(), 
                        item.getMedicalSupply().getName());
            }
        }
        
        // Reload the saved request with its items
        RestockRequest finalRequest = restockRequestRepository.findById(savedRequest.getId())
                .orElseThrow(() -> new RuntimeException("Không thể tìm thấy yêu cầu vừa tạo"));
        
        // Notify managers
        try {
            log.info("About to send notification to managers for extended restock request ID: {}", finalRequest.getId());
            notificationService.notifyManagersAboutRestockRequest(finalRequest);
            log.info("Notification sent to managers about extended restock request ID: {}", finalRequest.getId());
        } catch (Exception e) {
            log.error("Error sending notification to managers: {}", e.getMessage(), e);
        }
        
        return convertToDTO(finalRequest);
    }
    
    @Override
    public RestockRequestDTO updateRestockRequest(Long id, RestockRequestDTO restockRequestDTO) {
        RestockRequest existingRequest = restockRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy yêu cầu bổ sung với ID: " + id));
        
        if (existingRequest.getStatus() != RestockRequest.RestockStatus.PENDING) {
            throw new RuntimeException("Chỉ có thể cập nhật yêu cầu đang chờ xử lý");
        }
        
        existingRequest.setPriority(restockRequestDTO.getPriority());
        existingRequest.setReason(restockRequestDTO.getReason());
        
        RestockRequest updatedRequest = restockRequestRepository.save(existingRequest);
        log.info("Updated restock request ID: {}", id);
        return convertToDTO(updatedRequest);
    }
    
    @Override
    public void deleteRestockRequest(Long id) {
        RestockRequest request = restockRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy yêu cầu bổ sung với ID: " + id));
        
        if (request.getStatus() != RestockRequest.RestockStatus.PENDING) {
            throw new RuntimeException("Chỉ có thể xóa yêu cầu đang chờ xử lý");
        }
        
        restockRequestRepository.deleteById(id);
        log.info("Deleted restock request ID: {}", id);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<RestockRequestDTO> getRequestsByUser(Long userId) {
        return restockRequestRepository.findByRequestedByOrderByRequestDateDesc(userId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<RestockRequestDTO> getRequestsByStatus(RestockRequest.RestockStatus status) {
        return restockRequestRepository.findByStatusWithItemsOrderByRequestDateAsc(status)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<RestockRequestDTO> getPendingRequests() {
        return getRequestsByStatus(RestockRequest.RestockStatus.PENDING);
    }
    
    @Override
    public RestockRequestDTO approveRequest(Long id, Long reviewerId, String reviewNotes, 
                                           Map<Long, Map<String, Object>> itemApprovals) {
        RestockRequest request = restockRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy yêu cầu bổ sung với ID: " + id));
        
        if (request.getStatus() != RestockRequest.RestockStatus.PENDING) {
            throw new RuntimeException("Chỉ có thể duyệt yêu cầu đang chờ xử lý");
        }
        
        request.setStatus(RestockRequest.RestockStatus.APPROVED);
        request.setReviewedBy(reviewerId);
        request.setReviewNotes(reviewNotes);
        request.setReviewDate(LocalDateTime.now());
        request.setCompletedDate(LocalDateTime.now());
        // Process item approvals with display quantities
        if (itemApprovals != null && request.getRestockItems() != null) {
            for (RestockItem item : request.getRestockItems()) {
                Map<String, Object> approval = itemApprovals.get(item.getId());
                if (approval != null) {
                    // Get approved display quantity and unit
                    BigDecimal approvedDisplayQuantity = new BigDecimal(approval.get("quantity").toString());
                    String approvedDisplayUnit = approval.get("unit").toString();

                    item.setApprovedDisplayQuantity(approvedDisplayQuantity);
                    item.setApprovedDisplayUnit(approvedDisplayUnit);
                    
                    // Convert to base unit
                    MedicalSupply supply = item.getMedicalSupply();
                    BigDecimal approvedInBaseUnit = unitConversionService.convertToBaseUnit(
                            approvedDisplayQuantity, approvedDisplayUnit, supply.getBaseUnit());
                    item.setApprovedQuantityInBaseUnit(approvedInBaseUnit);
                    
                    log.info("Approved item: {}. Display: {} {}, Base: {} {}", 
                            item.getMedicalSupply().getName(), 
                            approvedDisplayQuantity, approvedDisplayUnit,
                            approvedInBaseUnit, supply.getBaseUnit());
                } else {
                    // If no specific approval, automatically approve the requested amount
                    item.setApprovedDisplayQuantity(item.getRequestedDisplayQuantity());
                    item.setApprovedDisplayUnit(item.getRequestedDisplayUnit());
                    item.setApprovedQuantityInBaseUnit(item.getRequestedQuantityInBaseUnit());
                }
            }
        } else {
            // Auto-approve all items with requested quantities if no approvals specified
            if (request.getRestockItems() != null) {
                for (RestockItem item : request.getRestockItems()) {
                    item.setApprovedDisplayQuantity(item.getRequestedDisplayQuantity());
                    item.setApprovedDisplayUnit(item.getRequestedDisplayUnit());
                    item.setApprovedQuantityInBaseUnit(item.getRequestedQuantityInBaseUnit());
                }
            }
        }
        
        RestockRequest savedRequest = restockRequestRepository.save(request);
        log.info("Approved restock request ID: {} by user ID: {}", id, reviewerId);
        
        // Update medical supply quantities immediately after approval
        processApprovedRequest(id);
        
        // Notify the nurse who created the request
        try {
            notificationService.notifyNurseAboutRestockRequestApproval(savedRequest);
            log.info("Notification sent to nurse about approved restock request ID: {}", id);
        } catch (Exception e) {
            log.error("Error sending approval notification to nurse: {}", e.getMessage());
        }
        
        return convertToDTO(savedRequest);
    }
    
    @Override
    public RestockRequestDTO rejectRequest(Long id, Long reviewerId, String reviewNotes) {
        RestockRequest request = restockRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy yêu cầu bổ sung với ID: " + id));
        
        if (request.getStatus() != RestockRequest.RestockStatus.PENDING) {
            throw new RuntimeException("Chỉ có thể từ chối yêu cầu đang chờ xử lý");
        }
        
        request.setStatus(RestockRequest.RestockStatus.REJECTED);
        request.setReviewedBy(reviewerId);
        request.setReviewNotes(reviewNotes);
        request.setReviewDate(LocalDateTime.now());
        request.setCompletedDate(LocalDateTime.now());
        RestockRequest savedRequest = restockRequestRepository.save(request);
        log.info("Rejected restock request ID: {} by user ID: {}", id, reviewerId);
        
        // Notify the nurse who created the request
        try {
            notificationService.notifyNurseAboutRestockRequestRejection(savedRequest, reviewNotes);
            log.info("Notification sent to nurse about rejected restock request ID: {}", id);
        } catch (Exception e) {
            log.error("Error sending rejection notification to nurse: {}", e.getMessage());
        }
        
        return convertToDTO(savedRequest);
    }
    
    @Override
    public void processApprovedRequest(Long requestId) {
        RestockRequest request = restockRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy yêu cầu bổ sung với ID: " + requestId));
        
        if (request.getStatus() != RestockRequest.RestockStatus.APPROVED) {
            throw new RuntimeException("Chỉ có thể xử lý yêu cầu đã được duyệt");
        }
        
        // Update medical supply quantities
        if (request.getRestockItems() != null) {
            for (RestockItem item : request.getRestockItems()) {
                if (item.getApprovedQuantityInBaseUnit() != null && 
                    item.getApprovedQuantityInBaseUnit().compareTo(BigDecimal.ZERO) > 0) {
                    
                    MedicalSupply supply = item.getMedicalSupply();
                    
                    // Enable any disabled supplies when they get approved
                    if (!supply.getEnabled()) {
                        supply.setEnabled(true);
                        log.info("Enabled previously disabled supply: {}", supply.getName());
                    }
                    
                    // 1. Update base unit quantity
                    BigDecimal currentBaseQuantity = supply.getQuantityInBaseUnit();
                    BigDecimal newBaseQuantity = currentBaseQuantity.add(item.getApprovedQuantityInBaseUnit());
                    supply.setQuantityInBaseUnit(newBaseQuantity);
                    
                    // 2. Update display quantity
                    if (item.getApprovedDisplayQuantity() != null && item.getApprovedDisplayUnit() != null &&
                        item.getApprovedDisplayUnit().equals(supply.getDisplayUnit())) {
                        // If the approved display unit matches the supply's display unit, directly add
                        BigDecimal currentDisplayQuantity = supply.getDisplayQuantity();
                        BigDecimal newDisplayQuantity = currentDisplayQuantity.add(item.getApprovedDisplayQuantity());
                        supply.setDisplayQuantity(newDisplayQuantity);
                        
                        log.info("Added {} {} to display quantity for supply ID: {}", 
                                item.getApprovedDisplayQuantity(),
                                supply.getDisplayUnit(),
                                supply.getId());
                    } else {
                        // If units don't match, convert the base unit change to display unit
                        BigDecimal displayQtyChange = unitConversionService.convertFromBaseUnit(
                                item.getApprovedQuantityInBaseUnit(), 
                                supply.getBaseUnit(), 
                                supply.getDisplayUnit());
                        
                        BigDecimal currentDisplayQuantity = supply.getDisplayQuantity();
                        BigDecimal newDisplayQuantity = currentDisplayQuantity.add(displayQtyChange);
                        supply.setDisplayQuantity(newDisplayQuantity);
                        
                        log.info("Converted and added {} {} (from {} {}) to display quantity for supply ID: {}", 
                                displayQtyChange,
                                supply.getDisplayUnit(),
                                item.getApprovedQuantityInBaseUnit(),
                                supply.getBaseUnit(),
                                supply.getId());
                    }
                    
                    // 3. Save the updated supply
                    medicalSupplyRepository.save(supply);
                    
                    log.info("Updated inventory levels for {}: Base quantity: {} {}, Display quantity: {} {}", 
                            supply.getName(), 
                            newBaseQuantity, supply.getBaseUnit(),
                            supply.getDisplayQuantity(), supply.getDisplayUnit());
                }
            }
        }
    }
    
    @Override
    public RestockRequestDTO addItemToRequest(Long requestId, RestockItemDTO restockItemDTO) {
        RestockRequest request = restockRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy yêu cầu bổ sung với ID: " + requestId));
        
        if (request.getStatus() != RestockRequest.RestockStatus.PENDING) {
            throw new RuntimeException("Chỉ có thể thêm vào yêu cầu đang chờ xử lý");
        }
        
        MedicalSupply supply = medicalSupplyRepository.findById(restockItemDTO.getMedicalSupplyId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy vật tư y tế với ID: " + restockItemDTO.getMedicalSupplyId()));
        
        RestockItem item = convertItemToEntity(restockItemDTO, request);
        item.setMedicalSupply(supply);
        
        restockItemRepository.save(item);
        log.info("Added item to restock request ID: {}", requestId);
        
        return getRestockRequestById(requestId).orElseThrow(
                () -> new RuntimeException("Không thể lấy yêu cầu sau khi cập nhật"));
    }
    
    @Override
    public RestockRequestDTO addNewSupplyToRequest(Long requestId, ExtendedRestockItemDTO extendedRestockItemDTO) {
        RestockRequest request = restockRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy yêu cầu bổ sung với ID: " + requestId));
        
        if (request.getStatus() != RestockRequest.RestockStatus.PENDING) {
            throw new RuntimeException("Chỉ có thể thêm vào yêu cầu đang chờ xử lý");
        }
        
        // Create a new disabled medical supply
        MedicalSupplyDTO newSupplyDTO = new MedicalSupplyDTO();
        newSupplyDTO.setName(extendedRestockItemDTO.getName());
        newSupplyDTO.setCategory(extendedRestockItemDTO.getCategory());
        newSupplyDTO.setBaseUnit(extendedRestockItemDTO.getBaseUnit());
        newSupplyDTO.setDisplayUnit(extendedRestockItemDTO.getDisplayUnit());
        newSupplyDTO.setMinStockLevelInBaseUnit(extendedRestockItemDTO.getMinStockLevelInBaseUnit());
        newSupplyDTO.setSupplier(extendedRestockItemDTO.getSupplier());
        newSupplyDTO.setLocation(extendedRestockItemDTO.getLocation());
        newSupplyDTO.setDescription(extendedRestockItemDTO.getDescription());
        newSupplyDTO.setExpirationDate(extendedRestockItemDTO.getNewExpirationDate());
        
        // Create disabled supply
        MedicalSupplyDTO createdSupply = medicalSupplyService.createDisabledMedicalSupply(
                newSupplyDTO, request.getRequestedBy());
        
        // Link the newly created supply to the restock item
        MedicalSupply newSupply = medicalSupplyRepository.findById(createdSupply.getId())
                .orElseThrow(() -> new RuntimeException("Không thể tìm thấy vật tư mới tạo"));
        
        // Create and save restock item
        RestockItem item = new RestockItem();
        item.setRestockRequest(request);
        item.setMedicalSupply(newSupply);
        item.setRequestedDisplayQuantity(extendedRestockItemDTO.getRequestedDisplayQuantity());
        item.setRequestedDisplayUnit(extendedRestockItemDTO.getRequestedDisplayUnit());
        
        BigDecimal requestedInBaseUnit = unitConversionService.convertToBaseUnit(
                extendedRestockItemDTO.getRequestedDisplayQuantity(),
                extendedRestockItemDTO.getRequestedDisplayUnit(),
                newSupply.getBaseUnit()
        );
        item.setRequestedQuantityInBaseUnit(requestedInBaseUnit);
        item.setNotes(extendedRestockItemDTO.getNotes());
        
        restockItemRepository.save(item);
        log.info("Added new supply item to restock request ID: {}", requestId);
        
        return getRestockRequestById(requestId).orElseThrow(
                () -> new RuntimeException("Không thể lấy yêu cầu sau khi cập nhật"));
    }
    
    @Override
    public RestockRequestDTO addExpiredSupplyToRequest(Long requestId, ExtendedRestockItemDTO extendedRestockItemDTO) {
        RestockRequest request = restockRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy yêu cầu bổ sung với ID: " + requestId));
        
        if (request.getStatus() != RestockRequest.RestockStatus.PENDING) {
            throw new RuntimeException("Chỉ có thể thêm vào yêu cầu đang chờ xử lý");
        }
        
        // Check if we have an ID of the expired supply
        if (extendedRestockItemDTO.getMedicalSupplyId() == null) {
            throw new RuntimeException("ID của vật tư hết hạn không được để trống");
        }
        
        // Check if we have a new expiration date
        if (extendedRestockItemDTO.getNewExpirationDate() == null) {
            throw new RuntimeException("Ngày hết hạn mới không được để trống cho vật tư hết hạn");
        }
        
        // Create a duplicate of the expired supply with new expiration date
        MedicalSupplyDTO duplicateDTO = medicalSupplyService.duplicateExpiredSupply(
                extendedRestockItemDTO.getMedicalSupplyId(), 
                extendedRestockItemDTO.getNewExpirationDate(),
                request.getRequestedBy());
        
        // Link the newly created supply to the restock item
        MedicalSupply duplicateSupply = medicalSupplyRepository.findById(duplicateDTO.getId())
                .orElseThrow(() -> new RuntimeException("Không thể tìm thấy vật tư mới tạo"));
        
        // Create and save restock item
        RestockItem item = new RestockItem();
        item.setRestockRequest(request);
        item.setMedicalSupply(duplicateSupply);
        item.setRequestedDisplayQuantity(extendedRestockItemDTO.getRequestedDisplayQuantity());
        item.setRequestedDisplayUnit(extendedRestockItemDTO.getRequestedDisplayUnit());
        
        BigDecimal requestedInBaseUnit = unitConversionService.convertToBaseUnit(
                extendedRestockItemDTO.getRequestedDisplayQuantity(),
                extendedRestockItemDTO.getRequestedDisplayUnit(),
                duplicateSupply.getBaseUnit()
        );
        item.setRequestedQuantityInBaseUnit(requestedInBaseUnit);
        item.setNotes(extendedRestockItemDTO.getNotes());
        
        restockItemRepository.save(item);
        log.info("Added expired supply refill item to restock request ID: {}", requestId);
        
        return getRestockRequestById(requestId).orElseThrow(
                () -> new RuntimeException("Không thể lấy yêu cầu sau khi cập nhật"));
    }
    
    @Override
    public RestockRequestDTO removeItemFromRequest(Long requestId, Long itemId) {
        RestockRequest request = restockRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy yêu cầu bổ sung với ID: " + requestId));
        
        if (request.getStatus() != RestockRequest.RestockStatus.PENDING) {
            throw new RuntimeException("Chỉ có thể xóa vật tư khỏi yêu cầu đang chờ xử lý");
        }
        
        RestockItem item = restockItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy vật tư trong yêu cầu với ID: " + itemId));
        
        if (!item.getRestockRequest().getId().equals(requestId)) {
            throw new RuntimeException("Vật tư không thuộc về yêu cầu này");
        }
        
        restockItemRepository.deleteById(itemId);
        
        RestockRequest updatedRequest = restockRequestRepository.findById(requestId).get();
        log.info("Removed item from restock request ID: {}", requestId);
        return convertToDTO(updatedRequest);
    }
    
    @Override
    public RestockRequestDTO updateRequestItem(Long requestId, Long itemId, RestockItemDTO restockItemDTO) {
        RestockRequest request = restockRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy yêu cầu bổ sung với ID: " + requestId));
        
        if (request.getStatus() != RestockRequest.RestockStatus.PENDING) {
            throw new RuntimeException("Chỉ có thể cập nhật vật tư trong yêu cầu đang chờ xử lý");
        }
        
        RestockItem item = restockItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy vật tư trong yêu cầu với ID: " + itemId));
        
        if (!item.getRestockRequest().getId().equals(requestId)) {
            throw new RuntimeException("Vật tư không thuộc về yêu cầu này");
        }
        
        item.setRequestedDisplayQuantity(restockItemDTO.getRequestedDisplayQuantity());
        item.setRequestedDisplayUnit(restockItemDTO.getRequestedDisplayUnit());
        item.setNotes(restockItemDTO.getNotes());
        
        // Recalculate base unit quantity
        BigDecimal requestedInBaseUnit = unitConversionService.convertToBaseUnit(
                restockItemDTO.getRequestedDisplayQuantity(),
                restockItemDTO.getRequestedDisplayUnit(),
                item.getMedicalSupply().getBaseUnit()
        );
        item.setRequestedQuantityInBaseUnit(requestedInBaseUnit);
        
        restockItemRepository.save(item);
        
        RestockRequest updatedRequest = restockRequestRepository.findById(requestId).get();
        log.info("Updated item in restock request ID: {}", requestId);
        return convertToDTO(updatedRequest);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<RestockRequestDTO> getHighPriorityRequests() {
        return restockRequestRepository.findByPriorityAndStatus("HIGH", RestockRequest.RestockStatus.PENDING)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<RestockRequestDTO> getRequestsRequiringAttention() {
        List<RestockRequestDTO> requests = getPendingRequests();
        return requests.stream()
                .filter(request -> "HIGH".equals(request.getPriority()) || 
                                 request.getRequestDate().isBefore(LocalDateTime.now().minusDays(2)))
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
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
        
        // Set user names
        if (restockRequest.getRequestedBy() != null) {
            userRepository.findById(restockRequest.getRequestedBy())
                    .ifPresent(user -> dto.setRequestedByName(user.getFullName()));
        }
        
        if (restockRequest.getReviewedBy() != null) {
            userRepository.findById(restockRequest.getReviewedBy())
                    .ifPresent(user -> dto.setReviewedByName(user.getFullName()));
        }
        
        // Convert restock items
        if (restockRequest.getRestockItems() != null) {
            List<RestockItemDTO> itemDTOs = restockRequest.getRestockItems().stream()
                    .map(this::convertItemToDTO)
                    .collect(Collectors.toList());
            dto.setRestockItems(itemDTOs);
            
            // Also populate extendedRestockItems for compatibility
            List<ExtendedRestockItemDTO> extendedItemDTOs = restockRequest.getRestockItems().stream()
                    .<ExtendedRestockItemDTO>map(this::convertToExtendedItemDTO)
                    .collect(Collectors.toList());
            dto.setExtendedRestockItems(extendedItemDTOs);
        }
        
        return dto;
    }
    
    @Override
    public RestockRequest convertToEntity(RestockRequestDTO dto) {
        RestockRequest request = new RestockRequest();
        request.setId(dto.getId());
        request.setRequestedBy(dto.getRequestedBy());
        request.setReviewedBy(dto.getReviewedBy());
        request.setStatus(dto.getStatus() != null ? dto.getStatus() : RestockRequest.RestockStatus.PENDING);
        request.setPriority(dto.getPriority() != null ? dto.getPriority() : "MEDIUM");
        request.setReason(dto.getReason());
        request.setReviewNotes(dto.getReviewNotes());
        request.setRequestDate(dto.getRequestDate());
        request.setReviewDate(dto.getReviewDate());
        request.setCompletedDate(dto.getCompletedDate());
        
        // Convert regular restock items
        if (dto.getRestockItems() != null && !dto.getRestockItems().isEmpty()) {
            List<RestockItem> items = dto.getRestockItems().stream()
                    .map(itemDTO -> convertItemToEntity(itemDTO, request))
                    .collect(Collectors.toList());
            request.setRestockItems(items);
        }
        
        return request;
    }
    
    private RestockItemDTO convertItemToDTO(RestockItem item) {
        RestockItemDTO dto = new RestockItemDTO();
        dto.setId(item.getId());
        dto.setRestockRequestId(item.getRestockRequest().getId());
        dto.setMedicalSupplyId(item.getMedicalSupply().getId());
        dto.setMedicalSupplyName(item.getMedicalSupply().getName());
        dto.setCategory(item.getMedicalSupply().getCategory());
        
        // Current stock information
        dto.setCurrentStockInBaseUnit(item.getMedicalSupply().getQuantityInBaseUnit());
        dto.setBaseUnit(item.getMedicalSupply().getBaseUnit());
        dto.setCurrentDisplayQuantity(item.getMedicalSupply().getDisplayQuantity());
        dto.setCurrentDisplayUnit(item.getMedicalSupply().getDisplayUnit());
        dto.setMinStockLevelInBaseUnit(item.getMedicalSupply().getMinStockLevelInBaseUnit());
        
        // Requested quantities
        dto.setRequestedDisplayQuantity(item.getRequestedDisplayQuantity());
        dto.setRequestedDisplayUnit(item.getRequestedDisplayUnit());
        dto.setRequestedQuantityInBaseUnit(item.getRequestedQuantityInBaseUnit());
        
        // Approved quantities
        dto.setApprovedDisplayQuantity(item.getApprovedDisplayQuantity());
        dto.setApprovedDisplayUnit(item.getApprovedDisplayUnit());
        dto.setApprovedQuantityInBaseUnit(item.getApprovedQuantityInBaseUnit());
        
        dto.setNotes(item.getNotes());
        
        return dto;
    }
    
    private RestockItem convertItemToEntity(RestockItemDTO dto, RestockRequest request) {
        RestockItem item = new RestockItem();
        item.setId(dto.getId());
        item.setRestockRequest(request);
        
        // Load medical supply
        if (dto.getMedicalSupplyId() != null) {
            MedicalSupply supply = medicalSupplyRepository.findById(dto.getMedicalSupplyId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy vật tư y tế với ID: " + dto.getMedicalSupplyId()));
            item.setMedicalSupply(supply);
        }
        
        // Set quantities
        item.setRequestedDisplayQuantity(dto.getRequestedDisplayQuantity());
        item.setRequestedDisplayUnit(dto.getRequestedDisplayUnit());
        item.setRequestedQuantityInBaseUnit(dto.getRequestedQuantityInBaseUnit());
        item.setApprovedDisplayQuantity(dto.getApprovedDisplayQuantity());
        item.setApprovedDisplayUnit(dto.getApprovedDisplayUnit());
        item.setApprovedQuantityInBaseUnit(dto.getApprovedQuantityInBaseUnit());
        item.setNotes(dto.getNotes());
        
        return item;
    }
    
    // Add a method to convert RestockItem to ExtendedRestockItemDTO
    private ExtendedRestockItemDTO convertToExtendedItemDTO(RestockItem item) {
        ExtendedRestockItemDTO dto = new ExtendedRestockItemDTO();
        
        // Copy all basic fields from RestockItem
        dto.setId(item.getId());
        dto.setRestockRequestId(item.getRestockRequest().getId());
        dto.setMedicalSupplyId(item.getMedicalSupply().getId());
        dto.setMedicalSupplyName(item.getMedicalSupply().getName());
        dto.setCategory(item.getMedicalSupply().getCategory());
        
        // Current stock information
        dto.setCurrentStockInBaseUnit(item.getMedicalSupply().getQuantityInBaseUnit());
        dto.setBaseUnit(item.getMedicalSupply().getBaseUnit());
        dto.setCurrentDisplayQuantity(item.getMedicalSupply().getDisplayQuantity());
        dto.setCurrentDisplayUnit(item.getMedicalSupply().getDisplayUnit());
        dto.setMinStockLevelInBaseUnit(item.getMedicalSupply().getMinStockLevelInBaseUnit());
        
        // Requested quantities
        dto.setRequestedDisplayQuantity(item.getRequestedDisplayQuantity());
        dto.setRequestedDisplayUnit(item.getRequestedDisplayUnit());
        dto.setRequestedQuantityInBaseUnit(item.getRequestedQuantityInBaseUnit());
        
        // Approved quantities
        dto.setApprovedDisplayQuantity(item.getApprovedDisplayQuantity());
        dto.setApprovedDisplayUnit(item.getApprovedDisplayUnit());
        dto.setApprovedQuantityInBaseUnit(item.getApprovedQuantityInBaseUnit());
        
        dto.setNotes(item.getNotes());
        
        // Set extended fields based on the medical supply
        MedicalSupply supply = item.getMedicalSupply();
        dto.setName(supply.getName());
        dto.setCategory(supply.getCategory());
        dto.setBaseUnit(supply.getBaseUnit());
        dto.setDisplayUnit(supply.getDisplayUnit());
        dto.setMinStockLevelInBaseUnit(supply.getMinStockLevelInBaseUnit());
        dto.setSupplier(supply.getSupplier());
        dto.setLocation(supply.getLocation());
        dto.setDescription(supply.getDescription());
        
        // Try to determine the request type based on supply status
        if (!supply.getEnabled()) {
            dto.setRequestType("NEW");
        } else if (supply.isExpired()) {
            dto.setRequestType("EXPIRED");
        } else {
            dto.setRequestType("EXISTING");
        }
        
        return dto;
    }
}

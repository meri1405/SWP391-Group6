package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.ItemRequestDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.MedicationRequestDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.exception.ResourceNotFoundException;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.exception.UnauthorizedAccessException;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.*;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.ItemRequestRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.MedicationRequestRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.StudentRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IMedicationRequestService;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IMedicationScheduleService;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.INotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicationRequestService implements IMedicationRequestService {

    private final MedicationRequestRepository medicationRequestRepository;
    private final StudentRepository studentRepository;
    private final ItemRequestRepository itemRequestRepository;
    private final IMedicationScheduleService medicationScheduleService;
    private final INotificationService notificationService;

    /**
     * Create a new medication request
     * @param medicationRequestDTO the request data
     * @param parent the authenticated parent user
     * @return the created medication request
     */
    @Transactional
    @Override
    public MedicationRequestDTO createMedicationRequest(MedicationRequestDTO medicationRequestDTO, User parent) {
        // Verify the student belongs to the parent
        Long studentId = medicationRequestDTO.getStudentId();
        if (!studentRepository.isStudentOwnedByParent(studentId, parent.getId())) {
            throw new UnauthorizedAccessException("You are not authorized to create medication requests for this student");
        }

        // Validate prescription images are provided
        if (medicationRequestDTO.getPrescriptionImages() == null || 
            medicationRequestDTO.getPrescriptionImages().isEmpty()) {
            throw new IllegalArgumentException("At least one prescription image is required");
        }

        // Get student entity
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId));        
        
        // Create medication request
        MedicationRequest medicationRequest = new MedicationRequest();
        medicationRequest.setRequestDate(LocalDate.now());
        medicationRequest.setNote(medicationRequestDTO.getNote());
        medicationRequest.setStatus("PENDING"); // Default status for new requests
        medicationRequest.setConfirm(false); // Not confirmed initially
        medicationRequest.setStudent(student);
        medicationRequest.setParent(parent);
        medicationRequest.setNurse(null); // Nurse will be assigned when processing the request
        
        // Set prescription images
        medicationRequest.setPrescriptionImages(medicationRequestDTO.getPrescriptionImages());

        // Save the medication request first to get an ID
        MedicationRequest savedRequest = medicationRequestRepository.save(medicationRequest);

        // Create item requests
        List<ItemRequest> itemRequests = new ArrayList<>();
        for (ItemRequestDTO itemDTO : medicationRequestDTO.getItemRequests()) {
            // Validate start date - must be at least 1 day after request date
            LocalDate requestDate = LocalDate.now();
            LocalDate minimumStartDate = requestDate.plusDays(1);
            
            if (itemDTO.getStartDate() != null && itemDTO.getStartDate().isBefore(minimumStartDate)) {
                throw new IllegalArgumentException(
                    String.format("Ngày bắt đầu uống thuốc '%s' phải tối thiểu là 1 ngày sau ngày tạo yêu cầu (%s). Ngày bắt đầu sớm nhất có thể là %s.", 
                        itemDTO.getItemName(),
                        requestDate.toString(),
                        minimumStartDate.toString())
                );
            }
            
            ItemRequest item = new ItemRequest();
            item.setItemName(itemDTO.getItemName());
            item.setPurpose(itemDTO.getPurpose());
            item.setItemType(itemDTO.getItemType());            
            item.setDosage(itemDTO.getDosage());
            item.setFrequency(itemDTO.getFrequency());
            item.setUnit(itemDTO.getUnit());
            item.setNote(itemDTO.getNote());
            item.setStartDate(itemDTO.getStartDate());
            item.setEndDate(itemDTO.getEndDate());

            // Create JSON with schedule times
            if (itemDTO.getScheduleTimes() != null && !itemDTO.getScheduleTimes().isEmpty()) {
                ObjectMapper mapper = new ObjectMapper();
                ObjectNode root = mapper.createObjectNode();
                ArrayNode timesNode = root.putArray("scheduleTimes");
                itemDTO.getScheduleTimes().forEach(timesNode::add);
                item.setNote(item.getNote() + "\nscheduleTimeJson:" + root.toString());
            }

            item.setMedicationRequest(savedRequest);
            
            // Save the item request
            ItemRequest savedItem = itemRequestRepository.save(item);
            // Generate medication schedules immediately when parent creates request
            // This ensures schedules are available for nurse review
            medicationScheduleService.generateSchedules(
                savedItem,
                itemDTO.getStartDate(),
                itemDTO.getEndDate()
            );

            itemRequests.add(savedItem);
        }

        // Update the medication request with the item requests
        savedRequest.setItemRequests(itemRequests);
        savedRequest = medicationRequestRepository.save(savedRequest);

        // Send notification to school nurses about new medication request
        notificationService.notifyNursesAboutNewMedicationRequest(savedRequest);

        // Convert back to DTO for response
        return convertToDTOWithScheduleTimes(savedRequest);
    }

    /**
     * Get all medication requests for a parent
     * @param parent the authenticated parent user
     * @return list of medication requests
     */
    @Override
    public List<MedicationRequestDTO> getParentMedicationRequests(User parent) {
        List<MedicationRequest> requests = medicationRequestRepository.findByParent(parent);
        return requests.stream()
                .map(this::convertToDTOWithScheduleTimes)
                .collect(Collectors.toList());
    }    /**
     * Get a specific medication request
     * @param requestId the request ID
     * @param parent the authenticated parent user
     * @return the medication request
     */
    @Override
    public MedicationRequestDTO getMedicationRequest(Long requestId, User parent) {
        MedicationRequest request = medicationRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Medication request not found with id: " + requestId));

        // Verify the parent owns this request
        if (!request.getParent().getId().equals(parent.getId())) {
            throw new UnauthorizedAccessException("You are not authorized to view this medication request");
        }

        // Convert to DTO with actual schedule times from medication schedules
        return convertToDTOWithScheduleTimes(request);
    }

    /**
     * Nurse approves a medication request
     * @param requestId the request ID
     * @param nurse the nurse approving the request
     * @return the updated medication request
     */
    @Transactional
    @Override
    public MedicationRequestDTO approveMedicationRequest(Long requestId, User nurse, String nurseNote) {
        MedicationRequest request = medicationRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Medication request not found with id: " + requestId));

        // Check if request can still be processed (not expired)
        if (!canProcessMedicationRequest(request)) {
            throw new IllegalStateException("Không thể duyệt yêu cầu này vì đã quá thời hạn 6 giờ trước lần uống thuốc đầu tiên");
        }

        request.setStatus("APPROVED");
        request.setConfirm(true);
        request.setNurse(nurse);
        request.setNurseNote(nurseNote);

        // Schedules are already generated when parent creates request
        // No need to generate schedules again, just update the request status

        return convertToDTOWithScheduleTimes(medicationRequestRepository.save(request));
    }

    /**
     * Nurse rejects a medication request
     * @param requestId the request ID
     * @param nurse the nurse rejecting the request
     * @param note rejection reason
     * @return the updated medication request
     */
    @Transactional
    @Override
    public MedicationRequestDTO rejectMedicationRequest(Long requestId, User nurse, String note) {
        MedicationRequest request = medicationRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Medication request not found with id: " + requestId));

        // Check if request can still be processed (not expired)
        if (!canProcessMedicationRequest(request)) {
            throw new IllegalStateException("Không thể từ chối yêu cầu này vì đã quá thời hạn 6 giờ trước lần uống thuốc đầu tiên");
        }

        request.setStatus("REJECTED");
        request.setConfirm(true);
        request.setNurse(nurse);
        request.setNurseNote(note);

        // Delete all associated medication schedules when request is rejected
        for (ItemRequest itemRequest : request.getItemRequests()) {
            medicationScheduleService.deleteSchedulesForItemRequest(itemRequest.getId());
        }

        return convertToDTOWithScheduleTimes(medicationRequestRepository.save(request));
    }    /**
     * Get all pending medication requests for nurse review
     * @return list of pending medication requests
     */
    @Override
    public List<MedicationRequestDTO> getPendingMedicationRequests() {
        List<MedicationRequest> requests = medicationRequestRepository.findByStatus("PENDING");
        return requests.stream()
                .map(this::convertToDTOWithScheduleTimes)
                .collect(Collectors.toList());
    }

    /**
     * Update an existing medication request
     * @param requestId the ID of the request to update
     * @param medicationRequestDTO the updated request data
     * @param parent the authenticated parent user
     * @return the updated medication request
     */
    @Transactional
    @Override
    public MedicationRequestDTO updateMedicationRequest(Long requestId,
                                                        MedicationRequestDTO medicationRequestDTO,
                                                        User parent) {
        // Find the medication request
        MedicationRequest request = medicationRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Medication request not found with id: " + requestId));

        // Verify the parent owns this request
        if (!request.getParent().getId().equals(parent.getId())) {
            throw new UnauthorizedAccessException("You are not authorized to update this medication request");
        }

        // Verify the request is in PENDING status
        if (!"PENDING".equals(request.getStatus())) {
            throw new IllegalStateException("Only medication requests with PENDING status can be updated");
        }

        // Validate prescription images are provided
        if (medicationRequestDTO.getPrescriptionImages() == null || 
            medicationRequestDTO.getPrescriptionImages().isEmpty()) {
            throw new IllegalArgumentException("At least one prescription image is required");
        }        // Update medication request basic information
        request.setNote(medicationRequestDTO.getNote());
        
        // Update prescription images
        request.setPrescriptionImages(medicationRequestDTO.getPrescriptionImages());

        // Get current item requests to track which ones should be deleted
        List<ItemRequest> existingItems = new ArrayList<>(request.getItemRequests());
        List<ItemRequest> updatedItems = new ArrayList<>();

        // Process item requests
        for (ItemRequestDTO itemDTO : medicationRequestDTO.getItemRequests()) {
            if (itemDTO.getId() != null) {
                // Update existing item
                ItemRequest existingItem = existingItems.stream()
                        .filter(item -> item.getId().equals(itemDTO.getId()))
                        .findFirst()
                        .orElseThrow(() -> new ResourceNotFoundException("Item request not found with id: " + itemDTO.getId()));

                // Remove from existing items list to track what's been processed
                existingItems.remove(existingItem);
                existingItem.setPurpose(itemDTO.getPurpose());
                existingItem.setItemType(itemDTO.getItemType());
                existingItem.setDosage(itemDTO.getDosage());
                existingItem.setFrequency(itemDTO.getFrequency());
                existingItem.setUnit(itemDTO.getUnit());
                existingItem.setNote(itemDTO.getNote());
                existingItem.setStartDate(itemDTO.getStartDate());
                existingItem.setEndDate(itemDTO.getEndDate());
                // Save updated item
                ItemRequest savedItem = itemRequestRepository.save(existingItem);

                // Delete existing schedules and regenerate them with updated information
                // This ensures custom time slots from the note are properly used
                medicationScheduleService.deleteSchedulesForItemRequest(savedItem.getId());
                medicationScheduleService.generateSchedules(
                    savedItem,
                    itemDTO.getStartDate(),
                    itemDTO.getEndDate()
                );

                updatedItems.add(savedItem);
            } else {                // Create new item
                ItemRequest newItem = new ItemRequest();
                newItem.setItemName(itemDTO.getItemName());
                newItem.setPurpose(itemDTO.getPurpose());
                newItem.setItemType(itemDTO.getItemType());
                newItem.setDosage(itemDTO.getDosage());
                newItem.setFrequency(itemDTO.getFrequency());
                newItem.setUnit(itemDTO.getUnit());
                newItem.setNote(itemDTO.getNote());
                newItem.setStartDate(itemDTO.getStartDate());
                newItem.setEndDate(itemDTO.getEndDate());
                newItem.setMedicationRequest(request);
                
                // Save the new item
                ItemRequest savedItem = itemRequestRepository.save(newItem);

                // Generate schedules for the new item immediately
                medicationScheduleService.generateSchedules(
                    savedItem,
                    itemDTO.getStartDate(),
                    itemDTO.getEndDate()
                );

                updatedItems.add(savedItem);
            }
        }

        // Delete items that were not included in the update
        for (ItemRequest itemToDelete : existingItems) {
            // Delete associated schedules first
            medicationScheduleService.deleteSchedulesForItemRequest(itemToDelete.getId());
            // Delete the item
            itemRequestRepository.delete(itemToDelete);
        }

        // Update the medication request with the updated items
        request.setItemRequests(updatedItems);
        MedicationRequest savedRequest = medicationRequestRepository.save(request);

        // Convert back to DTO for response
        return convertToDTOWithScheduleTimes(savedRequest);
    }

    /**
     * Delete a medication request
     * @param requestId the ID of the request to delete
     * @param parent the authenticated parent user
     */
    @Transactional
    @Override
    public void deleteMedicationRequest(Long requestId, User parent) {
        // Find the medication request
        MedicationRequest request = medicationRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Medication request not found with id: " + requestId));

        // Verify the parent owns this request
        if (!request.getParent().getId().equals(parent.getId())) {
            throw new UnauthorizedAccessException("You are not authorized to delete this medication request");
        }

        // Verify the request is in PENDING status
        if (!"PENDING".equals(request.getStatus())) {
            throw new IllegalStateException("Only medication requests with PENDING status can be deleted");
        }

        // Delete all associated item requests and their schedules
        for (ItemRequest item : request.getItemRequests()) {
            // Delete associated schedules first
            medicationScheduleService.deleteSchedulesForItemRequest(item.getId());
            // We don't need to delete items explicitly as they will be deleted via cascade
        }

        // Delete the medication request (this will cascade delete the item requests)
        medicationRequestRepository.delete(request);
    }

    /**
     * Convert entity to DTO
     * @param request the medication request entity
     * @return the DTO representation
     */    @Override
    public MedicationRequestDTO convertToDTO(MedicationRequest request) {
        MedicationRequestDTO dto = new MedicationRequestDTO();
        dto.setId(request.getId());
        dto.setRequestDate(request.getRequestDate());
        dto.setNote(request.getNote());
        dto.setStatus(request.getStatus());
        dto.setConfirm(request.isConfirm());
        dto.setStudentId(request.getStudent().getStudentID());
        dto.setStudentName(request.getStudent().getFullName());

        // Add prescription images
        dto.setPrescriptionImages(request.getPrescriptionImages());

        if (request.getNurse() != null) {
            dto.setNurseId(request.getNurse().getId());
            dto.setNurseName(request.getNurse().getFullName());
        }

        // Convert item requests
        List<ItemRequestDTO> itemDTOs = request.getItemRequests().stream()
                .map(item -> {
                    ItemRequestDTO itemDTO = new ItemRequestDTO();
                    itemDTO.setId(item.getId());
                    itemDTO.setItemName(item.getItemName());
                    itemDTO.setPurpose(item.getPurpose());
                    itemDTO.setItemType(item.getItemType());                    
                    itemDTO.setDosage(item.getDosage());
                    itemDTO.setFrequency(item.getFrequency());
                    itemDTO.setUnit(item.getUnit());
                    itemDTO.setNote(item.getNote());
                    itemDTO.setStartDate(item.getStartDate());
                    itemDTO.setEndDate(item.getEndDate());
                    return itemDTO;
                })
                .collect(Collectors.toList());

        dto.setItemRequests(itemDTOs);

        return dto;
    }

    /**
     * Convert entity to DTO with actual schedule times from medication schedules
     * @param request the medication request entity
     * @return the DTO representation with schedule times
     */
    @Override    public MedicationRequestDTO convertToDTOWithScheduleTimes(MedicationRequest request) {
        MedicationRequestDTO dto = new MedicationRequestDTO();
        dto.setId(request.getId());
        dto.setRequestDate(request.getRequestDate());
        dto.setNote(request.getNote());
        dto.setStatus(request.getStatus());
        dto.setConfirm(request.isConfirm());
        dto.setStudentId(request.getStudent().getStudentID());
        dto.setStudentName(request.getStudent().getFullName());

        // Add prescription images
        dto.setPrescriptionImages(request.getPrescriptionImages());

        if (request.getNurse() != null) {
            dto.setNurseId(request.getNurse().getId());
            dto.setNurseName(request.getNurse().getFullName());
        }

        // Convert item requests with schedule times
        List<ItemRequestDTO> itemDTOs = request.getItemRequests().stream()
            .map(item -> {
                ItemRequestDTO itemDTO = new ItemRequestDTO();
                itemDTO.setId(item.getId());
                itemDTO.setItemName(item.getItemName());
                itemDTO.setPurpose(item.getPurpose());
                itemDTO.setItemType(item.getItemType());
                itemDTO.setDosage(item.getDosage());
                itemDTO.setFrequency(item.getFrequency());
                itemDTO.setUnit(item.getUnit());
                itemDTO.setStartDate(item.getStartDate());
                itemDTO.setEndDate(item.getEndDate());

                // Extract note and schedule times
                String originalNote = item.getNote();
                if (originalNote != null && originalNote.contains("scheduleTimeJson:")) {
                    String[] parts = originalNote.split("scheduleTimeJson:");
                    itemDTO.setNote(parts[0].trim());

                    try {
                        ObjectMapper mapper = new ObjectMapper();
                        JsonNode rootNode = mapper.readTree(parts[1].trim());
                        if (rootNode.has("scheduleTimes")) {
                            JsonNode timesNode = rootNode.get("scheduleTimes");
                            if (timesNode.isArray()) {
                                List<String> times = new ArrayList<>();
                                for (JsonNode timeNode : timesNode) {
                                    times.add(timeNode.asText());
                                }
                                itemDTO.setScheduleTimes(times);
                            }
                        }
                    } catch (Exception e) {
                        System.err.println("Error processing schedule times: " + e.getMessage());
                    }
                } else {
                    itemDTO.setNote(originalNote);
                    itemDTO.setScheduleTimes(new ArrayList<>());
                }

                return itemDTO;
            })
            .collect(Collectors.toList());

        dto.setItemRequests(itemDTOs);
        return dto;
    }

    /**
     * Get a medication request by ID
     * @param requestId the request ID
     * @return the medication request entity
     */
    @Override
    public MedicationRequest getMedicationRequestById(Long requestId) {
        return medicationRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Medication request not found with id: " + requestId));
    }

    /**
     * Check if a medication request can still be processed by nurse
     * (must be within 6 hours before first medication time)
     * @param request the medication request
     * @return true if can be processed, false otherwise
     */
    private boolean canProcessMedicationRequest(MedicationRequest request) {
        if (request.getItemRequests() == null || request.getItemRequests().isEmpty()) {
            return false;
        }

        // Find the earliest medication time from all items
        LocalDateTime earliestMedicationTime = null;
        
        for (ItemRequest item : request.getItemRequests()) {
            // Parse schedule times from note field
            List<String> scheduleTimes = parseScheduleTimesFromNote(item.getNote());
            
            if (!scheduleTimes.isEmpty()) {
                // Get the first time for this item
                String firstTimeStr = scheduleTimes.get(0);
                try {
                    // Combine start date with first time
                    LocalDateTime medicationDateTime = item.getStartDate().atTime(
                        Integer.parseInt(firstTimeStr.split(":")[0]), // hour
                        Integer.parseInt(firstTimeStr.split(":")[1])  // minute
                    );
                    
                    if (earliestMedicationTime == null || medicationDateTime.isBefore(earliestMedicationTime)) {
                        earliestMedicationTime = medicationDateTime;
                    }
                } catch (Exception e) {
                    System.err.println("Error parsing medication time: " + e.getMessage());
                }
            }
        }

        if (earliestMedicationTime == null) {
            return true; // If no valid times found, allow processing
        }

        // Check if current time is within 6 hours before earliest medication time
        LocalDateTime deadline = earliestMedicationTime.minusHours(6);
        LocalDateTime now = LocalDateTime.now();
        
        return now.isBefore(deadline);
    }

    /**
     * Auto-reject expired medication requests (past 6 hours before first medication time)
     * This method should be called by a scheduled task
     */
    @Transactional
    public void autoRejectExpiredRequests() {
        List<MedicationRequest> pendingRequests = medicationRequestRepository.findByStatus("PENDING");
        
        for (MedicationRequest request : pendingRequests) {
            if (!canProcessMedicationRequest(request)) {
                // Auto-reject the request
                request.setStatus("REJECTED");
                request.setConfirm(true);
                request.setNurseNote("Tự động từ chối do quá thời hạn xử lý (6 giờ trước lần uống thuốc đầu tiên)");
                
                // Delete all associated medication schedules
                for (ItemRequest itemRequest : request.getItemRequests()) {
                    medicationScheduleService.deleteSchedulesForItemRequest(itemRequest.getId());
                }
                
                medicationRequestRepository.save(request);
                
                // Send notifications to both parent and nurses
                notificationService.notifyAutoRejection(request);
            }
        }
    }

    /**
     * Parse schedule times from item note field
     * @param note the note containing schedule times JSON
     * @return list of schedule times
     */
    private List<String> parseScheduleTimesFromNote(String note) {
        List<String> scheduleTimes = new ArrayList<>();
        
        if (note != null && note.contains("scheduleTimeJson:")) {
            String[] parts = note.split("scheduleTimeJson:");
            if (parts.length > 1) {
                try {
                    ObjectMapper mapper = new ObjectMapper();
                    JsonNode rootNode = mapper.readTree(parts[1].trim());
                    if (rootNode.has("scheduleTimes")) {
                        JsonNode timesNode = rootNode.get("scheduleTimes");
                        if (timesNode.isArray()) {
                            for (JsonNode timeNode : timesNode) {
                                scheduleTimes.add(timeNode.asText());
                            }
                        }
                    }
                } catch (Exception e) {
                    System.err.println("Error parsing schedule times: " + e.getMessage());
                }
            }
        }
        
        return scheduleTimes;
    }
}
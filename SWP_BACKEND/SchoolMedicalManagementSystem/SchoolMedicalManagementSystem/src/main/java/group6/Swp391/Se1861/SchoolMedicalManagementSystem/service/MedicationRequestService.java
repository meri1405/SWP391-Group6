package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.ItemRequestDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.MedicationRequestDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.exception.ResourceNotFoundException;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.exception.UnauthorizedAccessException;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.*;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.ItemRequestRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.MedicationRequestRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicationRequestService {

    private final MedicationRequestRepository medicationRequestRepository;
    private final StudentRepository studentRepository;
    private final ItemRequestRepository itemRequestRepository;
    private final MedicationScheduleService medicationScheduleService;

    /**
     * Create a new medication request
     * @param medicationRequestDTO the request data
     * @param parent the authenticated parent user
     * @return the created medication request
     */
    @Transactional
    public MedicationRequestDTO createMedicationRequest(MedicationRequestDTO medicationRequestDTO, User parent) {
        // Verify the student belongs to the parent
        Long studentId = medicationRequestDTO.getStudentId();
        if (!studentRepository.isStudentOwnedByParent(studentId, parent.getId())) {
            throw new UnauthorizedAccessException("You are not authorized to create medication requests for this student");
        }

        // Get student entity
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId));

        // Create medication request
        MedicationRequest medicationRequest = new MedicationRequest();
        medicationRequest.setRequestDate(LocalDate.now());
        medicationRequest.setStartDate(medicationRequestDTO.getStartDate());
        medicationRequest.setEndDate(medicationRequestDTO.getEndDate());
        medicationRequest.setNote(medicationRequestDTO.getNote());
        medicationRequest.setStatus("PENDING"); // Default status for new requests
        medicationRequest.setConfirm(false); // Not confirmed initially
        medicationRequest.setStudent(student);
        medicationRequest.setParent(parent);
        medicationRequest.setNurse(null); // Nurse will be assigned when processing the request

        // Save the medication request first to get an ID
        MedicationRequest savedRequest = medicationRequestRepository.save(medicationRequest);

        // Create item requests
        List<ItemRequest> itemRequests = new ArrayList<>();
        for (ItemRequestDTO itemDTO : medicationRequestDTO.getItemRequests()) {
            ItemRequest item = new ItemRequest();
            item.setItemName(itemDTO.getItemName());
            item.setPurpose(itemDTO.getPurpose());
            item.setItemType(itemDTO.getItemType());
            item.setDosage(itemDTO.getDosage());
            item.setFrequency(itemDTO.getFrequency());
            item.setNote(itemDTO.getNote());
            item.setMedicationRequest(savedRequest);

            // Save the item request
            ItemRequest savedItem = itemRequestRepository.save(item);

            // Generate medication schedules for this item using the dates from the medication request
            medicationScheduleService.generateSchedules(
                savedItem,
                medicationRequest.getStartDate(),
                medicationRequest.getEndDate()
            );

            itemRequests.add(savedItem);
        }

        // Update the medication request with the item requests
        savedRequest.setItemRequests(itemRequests);
        savedRequest = medicationRequestRepository.save(savedRequest);

        // Convert back to DTO for response
        return convertToDTO(savedRequest);
    }

    /**
     * Get all medication requests for a parent
     * @param parent the authenticated parent user
     * @return list of medication requests
     */
    public List<MedicationRequestDTO> getParentMedicationRequests(User parent) {
        List<MedicationRequest> requests = medicationRequestRepository.findByParent(parent);
        return requests.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get a specific medication request
     * @param requestId the request ID
     * @param parent the authenticated parent user
     * @return the medication request
     */
    public MedicationRequestDTO getMedicationRequest(Long requestId, User parent) {
        MedicationRequest request = medicationRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Medication request not found with id: " + requestId));

        // Verify the parent owns this request
        if (!request.getParent().getId().equals(parent.getId())) {
            throw new UnauthorizedAccessException("You are not authorized to view this medication request");
        }

        return convertToDTO(request);
    }

    /**
     * Nurse approves a medication request
     * @param requestId the request ID
     * @param nurse the nurse approving the request
     * @return the updated medication request
     */
    @Transactional
    public MedicationRequestDTO approveMedicationRequest(Long requestId, User nurse) {
        MedicationRequest request = medicationRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Medication request not found with id: " + requestId));

        request.setStatus("APPROVED");
        request.setConfirm(true);
        request.setNurse(nurse);

        return convertToDTO(medicationRequestRepository.save(request));
    }

    /**
     * Nurse rejects a medication request
     * @param requestId the request ID
     * @param nurse the nurse rejecting the request
     * @param note rejection reason
     * @return the updated medication request
     */
    @Transactional
    public MedicationRequestDTO rejectMedicationRequest(Long requestId, User nurse, String note) {
        MedicationRequest request = medicationRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Medication request not found with id: " + requestId));

        request.setStatus("REJECTED");
        request.setConfirm(true);
        request.setNurse(nurse);
        request.setNote(note);

        return convertToDTO(medicationRequestRepository.save(request));
    }

    /**
     * Get all pending medication requests for nurse review
     * @return list of pending medication requests
     */
    public List<MedicationRequestDTO> getPendingMedicationRequests() {
        List<MedicationRequest> requests = medicationRequestRepository.findByStatus("PENDING");
        return requests.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Convert entity to DTO
     * @param request the medication request entity
     * @return the DTO representation
     */
    private MedicationRequestDTO convertToDTO(MedicationRequest request) {
        MedicationRequestDTO dto = new MedicationRequestDTO();
        dto.setId(request.getId());
        dto.setRequestDate(request.getRequestDate());
        dto.setStartDate(request.getStartDate());
        dto.setEndDate(request.getEndDate());
        dto.setNote(request.getNote());
        dto.setStatus(request.getStatus());
        dto.setConfirm(request.isConfirm());
        dto.setStudentId(request.getStudent().getStudentID());
        dto.setStudentName(request.getStudent().getLastName() + " " + request.getStudent().getFirstName());

        if (request.getNurse() != null) {
            dto.setNurseId(request.getNurse().getId());
            dto.setNurseName(request.getNurse().getLastName() + " " + request.getNurse().getFirstName());
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
                    itemDTO.setNote(item.getNote());
                    return itemDTO;
                })
                .collect(Collectors.toList());

        dto.setItemRequests(itemDTOs);

        return dto;
    }
}

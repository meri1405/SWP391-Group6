package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.ItemRequestDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.MedicationRequestDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.exception.ResourceNotFoundException;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.exception.UnauthorizedAccessException;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.ItemRequest;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.MedicationRequest;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.Student;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.MedicationRequestRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MedicationRequestService {

    @Autowired
    private MedicationRequestRepository medicationRequestRepository;

    @Autowired
    private StudentRepository studentRepository;

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
        medicationRequest.setNote(medicationRequestDTO.getNote());
        medicationRequest.setStatus("PENDING"); // Default status for new requests
        medicationRequest.setStudent(student);
        medicationRequest.setParent(parent);
        medicationRequest.setNurse(null); // Nurse will be assigned when processing the request

        // Create item requests
        List<ItemRequest> itemRequests = new ArrayList<>();
        for (ItemRequestDTO itemDTO : medicationRequestDTO.getItemRequests()) {
            ItemRequest item = new ItemRequest();
            item.setItemName(itemDTO.getItemName());
            item.setPurpose(itemDTO.getPurpose());
            item.setItemType(itemDTO.getItemType());
            item.setDosage(itemDTO.getDosage());
            item.setFrequency(itemDTO.getFrequency());
            item.setStartDate(itemDTO.getStartDate());
            item.setEndDate(itemDTO.getEndDate());
            item.setNote(itemDTO.getNote());
            item.setMedicationRequest(medicationRequest);
            itemRequests.add(item);
        }
        medicationRequest.setItemRequests(itemRequests);

        // Save the medication request
        MedicationRequest savedRequest = medicationRequestRepository.save(medicationRequest);

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

        // Ensure the parent is authorized to view this request
        if (!request.getParent().getId().equals(parent.getId())) {
            throw new UnauthorizedAccessException("You are not authorized to view this medication request");
        }

        return convertToDTO(request);
    }

    /**
     * Convert entity to DTO
     */
    private MedicationRequestDTO convertToDTO(MedicationRequest request) {
        MedicationRequestDTO dto = new MedicationRequestDTO();
        dto.setId(request.getId());
        dto.setRequestDate(request.getRequestDate());
        dto.setNote(request.getNote());
        dto.setStatus(request.getStatus());
        dto.setStudentId(request.getStudent().getStudentID());

        List<ItemRequestDTO> itemDTOs = request.getItemRequests().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        dto.setItemRequests(itemDTOs);

        return dto;
    }

    /**
     * Convert item entity to DTO
     */
    private ItemRequestDTO convertToDTO(ItemRequest item) {
        ItemRequestDTO dto = new ItemRequestDTO();
        dto.setId(item.getId());
        dto.setItemName(item.getItemName());
        dto.setPurpose(item.getPurpose());
        dto.setItemType(item.getItemType());
        dto.setDosage(item.getDosage());
        dto.setFrequency(item.getFrequency());
        dto.setStartDate(item.getStartDate());
        dto.setEndDate(item.getEndDate());
        dto.setNote(item.getNote());
        return dto;
    }
}

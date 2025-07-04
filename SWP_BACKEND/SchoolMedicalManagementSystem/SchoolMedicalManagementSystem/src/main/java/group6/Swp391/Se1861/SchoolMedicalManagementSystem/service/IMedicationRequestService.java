package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.MedicationRequestDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.MedicationRequest;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;

import java.util.List;

public interface IMedicationRequestService {
    MedicationRequestDTO createMedicationRequest(MedicationRequestDTO medicationRequestDTO, User parent);

    List<MedicationRequestDTO> getParentMedicationRequests(User parent);

    MedicationRequestDTO getMedicationRequest(Long requestId, User parent);

    MedicationRequestDTO approveMedicationRequest(Long requestId, User nurse, String nurseNote);

    MedicationRequestDTO rejectMedicationRequest(Long requestId, User nurse, String note);

    List<MedicationRequestDTO> getPendingMedicationRequests();

    MedicationRequestDTO updateMedicationRequest(Long requestId, MedicationRequestDTO medicationRequestDTO, User parent);

    void deleteMedicationRequest(Long requestId, User parent);

    MedicationRequestDTO convertToDTO(MedicationRequest request);

    MedicationRequestDTO convertToDTOWithScheduleTimes(MedicationRequest request);

    MedicationRequest getMedicationRequestById(Long requestId);
}

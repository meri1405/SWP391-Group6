package group6.Swp391.Se1861.SchoolMedicalManagementSystem.controller;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.MedicationRequestDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.MedicationScheduleDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.MedicationStatus;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.MedicationRequestService;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.MedicationScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/nurse/medications")
@RequiredArgsConstructor
public class NurseMedicationController {

    private final MedicationRequestService medicationRequestService;
    private final MedicationScheduleService medicationScheduleService;

    /**
     * Get all pending medication requests
     * @return List of pending medication requests
     */
    @GetMapping("/requests/pending")
    public ResponseEntity<List<MedicationRequestDTO>> getPendingMedicationRequests() {
        return ResponseEntity.ok(medicationRequestService.getPendingMedicationRequests());
    }

    /**
     * Approve a medication request
     * @param requestId The request ID
     * @param nurse Authenticated nurse
     * @return Updated medication request
     */
    @PutMapping("/requests/{requestId}/approve")
    public ResponseEntity<MedicationRequestDTO> approveMedicationRequest(
            @PathVariable Long requestId,
            @AuthenticationPrincipal User nurse) {
        return ResponseEntity.ok(medicationRequestService.approveMedicationRequest(requestId, nurse));
    }

    /**
     * Reject a medication request
     * @param requestId The request ID
     * @param nurse Authenticated nurse
     * @param requestBody Request body containing rejection note
     * @return Updated medication request
     */
    @PutMapping("/requests/{requestId}/reject")
    public ResponseEntity<MedicationRequestDTO> rejectMedicationRequest(
            @PathVariable Long requestId,
            @AuthenticationPrincipal User nurse,
            @RequestBody Map<String, String> requestBody) {
        String note = requestBody.get("note");
        return ResponseEntity.ok(medicationRequestService.rejectMedicationRequest(requestId, nurse, note));
    }

    /**
     * Get medication schedules for a student
     * @param studentId The student ID
     * @param nurse Authenticated nurse
     * @return List of medication schedules
     */
    @GetMapping("/schedules/student/{studentId}")
    public ResponseEntity<List<MedicationScheduleDTO>> getSchedulesForStudent(
            @PathVariable Long studentId,
            @AuthenticationPrincipal User nurse) {
        return ResponseEntity.ok(medicationScheduleService.getSchedulesForStudentAndNurse(studentId, nurse));
    }

    /**
     * Get medication schedules for a specific date and status
     * @param date The date
     * @param status The status filter
     * @param nurse Authenticated nurse
     * @return List of medication schedules
     */
    @GetMapping("/schedules")
    public ResponseEntity<List<MedicationScheduleDTO>> getSchedulesByDateAndStatus(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) MedicationStatus status,
            @AuthenticationPrincipal User nurse) {
        if (status == null) {
            // Return all schedules for the date if status is not specified, filtered by nurse
            return ResponseEntity.ok(medicationScheduleService.getSchedulesByDateAndNurse(date, nurse));
        }
        return ResponseEntity.ok(medicationScheduleService.getSchedulesByDateAndStatusAndNurse(date, status, nurse));
    }

    /**
     * Update medication schedule status
     * @param scheduleId The schedule ID
     * @param nurse Authenticated nurse
     * @param requestBody Request body containing status and optional note
     * @return Updated medication schedule
     */
    @PutMapping("/schedules/{scheduleId}/status")
    public ResponseEntity<MedicationScheduleDTO> updateScheduleStatus(
            @PathVariable Long scheduleId,
            @AuthenticationPrincipal User nurse,
            @RequestBody Map<String, Object> requestBody) {
        MedicationStatus status = MedicationStatus.valueOf((String) requestBody.get("status"));
        String note = (String) requestBody.getOrDefault("note", "");

        return ResponseEntity.ok(medicationScheduleService.updateScheduleStatus(scheduleId, status, nurse, note));
    }

    /**
     * Update medication schedule note only
     * @param scheduleId The schedule ID
     * @param nurse Authenticated nurse
     * @param requestBody Request body containing the note
     * @return Updated medication schedule
     */
    @PutMapping("/schedules/{scheduleId}/note")
    public ResponseEntity<MedicationScheduleDTO> updateScheduleNote(
            @PathVariable Long scheduleId,
            @AuthenticationPrincipal User nurse,
            @RequestBody Map<String, String> requestBody) {
        String note = requestBody.get("note");
        return ResponseEntity.ok(medicationScheduleService.updateScheduleNote(scheduleId, nurse, note));
    }
}

package group6.Swp391.Se1861.SchoolMedicalManagementSystem.controller;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.MedicationRequestDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.MedicationScheduleDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.MedicationSchedule;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.MedicationStatus;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IMedicationRequestService;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IMedicationScheduleService;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.INotificationService;
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

    private final IMedicationRequestService medicationRequestService;
    private final IMedicationScheduleService medicationScheduleService;
    private final INotificationService notificationService;

    /**
     * Get all pending medication requests
     * @return List of pending medication requests
     */
    @GetMapping("/requests/pending")
    public ResponseEntity<List<MedicationRequestDTO>> getPendingMedicationRequests() {
        return ResponseEntity.ok(medicationRequestService.getPendingMedicationRequests());
    }    /**
     * Approve a medication request
     * @param requestId The request ID
     * @param nurse Authenticated nurse
     * @param requestBody Request body containing:
     *                   - nurseNote: Nurse's note when approving the request
     *                   - customMessage: Custom message to send to parent (optional)
     * @return Updated medication request
     */
    @PutMapping("/requests/{requestId}/approve")
    public ResponseEntity<MedicationRequestDTO> approveMedicationRequest(
            @PathVariable Long requestId,
            @AuthenticationPrincipal User nurse,
            @RequestBody Map<String, String> requestBody) {
        String nurseNote = requestBody.getOrDefault("nurseNote", "");
        String customMessage = requestBody.getOrDefault("customMessage", "");
        MedicationRequestDTO approvedRequest = medicationRequestService.approveMedicationRequest(requestId, nurse, nurseNote);

        // Send notification to parent with custom message or default message
        String notificationMessage = !customMessage.isEmpty() 
            ? customMessage 
            : "Yêu cầu thuốc của bạn đã được Y tá " + nurse.getFullName() + " chấp nhận.";
            
        notificationService.createMedicationRequestNotification(
                medicationRequestService.getMedicationRequestById(requestId),
                "MEDICATION_REQUEST_APPROVED",
                "Yêu cầu gửi thuốc đã được chấp nhận",
                notificationMessage
        );

        return ResponseEntity.ok(approvedRequest);
    }    /**
     * Reject a medication request
     * @param requestId The request ID
     * @param nurse Authenticated nurse
     * @param requestBody Request body containing:
     *                   - nurseNote: Nurse's note when rejecting the request (reason for rejection)
     *                   - customMessage: Custom message to send to parent (optional)
     * @return Updated medication request
     */
    @PutMapping("/requests/{requestId}/reject")
    public ResponseEntity<MedicationRequestDTO> rejectMedicationRequest(
            @PathVariable Long requestId,
            @AuthenticationPrincipal User nurse,
            @RequestBody Map<String, String> requestBody) {
        String nurseNote = requestBody.getOrDefault("nurseNote", "");
        String customMessage = requestBody.getOrDefault("customMessage", "");
        MedicationRequestDTO rejectedRequest = medicationRequestService.rejectMedicationRequest(requestId, nurse, nurseNote);

        // Send notification to parent with custom message or default message with nurse note
        String notificationMessage;
        if (!customMessage.isEmpty()) {
            notificationMessage = customMessage;
        } else {
            notificationMessage = "Yêu cầu thuốc của bạn đã bị Y tá " + nurse.getFullName() + " từ chối.";
            if (!nurseNote.isEmpty()) {
                notificationMessage += " Lý do: " + nurseNote;
            }
        }
            
        notificationService.createMedicationRequestNotification(
                medicationRequestService.getMedicationRequestById(requestId),
                "MEDICATION_REQUEST_REJECTED",
                "Yêu cầu gửi thuốc bị từ chối",
                notificationMessage
        );

        return ResponseEntity.ok(rejectedRequest);
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
     * Get all medication schedules
     * @param nurse Authenticated nurse
     * @return List of all medication schedules
     */
    @GetMapping("/schedules/all")
    public ResponseEntity<List<MedicationScheduleDTO>> getAllMedicationSchedules(
            @AuthenticationPrincipal User nurse) {
        return ResponseEntity.ok(medicationScheduleService.getAllSchedulesForNurse(nurse));
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
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) MedicationStatus status,
            @AuthenticationPrincipal User nurse) {
        
        // If no date provided, return all schedules
        if (date == null) {
            if (status == null) {
                return ResponseEntity.ok(medicationScheduleService.getAllSchedulesForNurse(nurse));
            } else {
                return ResponseEntity.ok(medicationScheduleService.getSchedulesByStatusAndNurse(status, nurse));
            }
        }
        
        // If date is provided
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
        String note = (String) requestBody.get("note"); // Don't use getOrDefault to distinguish between null and empty string

        MedicationScheduleDTO updatedSchedule = medicationScheduleService.updateScheduleStatus(scheduleId, status, nurse, note);

        // Get the medication schedule entity to send notification
        MedicationSchedule schedule = medicationScheduleService.getMedicationScheduleById(scheduleId);

        // Send notification to parent based on the status update
        String notificationType = "MEDICATION_SCHEDULE_UPDATED";
        String title = "Lịch sử uống thuốc được cập nhật";
        String message = "Lịch trình dùng thuốc của con bạn đã được cập nhật";

        switch (status) {
            case TAKEN:
                notificationType = "MEDICATION_ADMINISTERED";
                title = "Thuốc đã được dùng";
                message = "Thuốc của con bạn đã được Y tá " + nurse.getFullName() + " cho uống.";
                break;
            case SKIPPED:
                notificationType = "MEDICATION_MISSED";
                title = "Thuốc bị bỏ qua";
                message = "Con bạn đã quên uống thuốc theo lịch hẹn." +
                         (note != null && !note.isEmpty() ? "Note: " + note : "");
                break;
            case PENDING:
                // No specific notification for PENDING status
                break;
        }

        notificationService.createMedicationScheduleNotification(
                schedule,
                notificationType,
                title,
                message
        );

        return ResponseEntity.ok(updatedSchedule);
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

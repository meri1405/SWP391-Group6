package group6.Swp391.Se1861.SchoolMedicalManagementSystem.controller;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.VaccinationRecordDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.Student;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.StudentRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IVaccinationRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/nurse/vaccination-records")
@PreAuthorize("hasRole('SCHOOLNURSE')")
@RequiredArgsConstructor
public class VaccinationRecordController {

    private final IVaccinationRecordService recordService;
    private final StudentRepository studentRepository;

    /**
     * Get vaccination record by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<VaccinationRecordDTO> getRecordById(@PathVariable Long id) {
        try {
            VaccinationRecordDTO record = recordService.getRecordById(id);
            return ResponseEntity.ok(record);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Get vaccination records by student ID
     */
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<VaccinationRecordDTO>> getRecordsByStudent(@PathVariable Long studentId) {
        try {
            Student student = studentRepository.findById(studentId)
                    .orElseThrow(() -> new IllegalArgumentException("Student not found"));
            
            List<VaccinationRecordDTO> records = recordService.getRecordsByStudent(student);
            return ResponseEntity.ok(records);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Get records needing follow-up
     */
    @GetMapping("/follow-up")
    public ResponseEntity<List<VaccinationRecordDTO>> getRecordsNeedingFollowUp() {
        List<VaccinationRecordDTO> records = recordService.getRecordsNeedingFollowUp();
        return ResponseEntity.ok(records);
    }

    /**
     * Get records with severe reactions
     */
    @GetMapping("/severe-reactions")
    public ResponseEntity<List<VaccinationRecordDTO>> getSevereReactions() {
        List<VaccinationRecordDTO> records = recordService.getSevereReactions();
        return ResponseEntity.ok(records);
    }

    /**
     * Update vaccination record (for post-vaccination monitoring)
     */
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateRecord(
            @PathVariable Long id,
            @AuthenticationPrincipal User nurse,
            @RequestBody VaccinationRecordDTO recordDTO) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            VaccinationRecordDTO record = recordService.updateRecord(id, recordDTO, nurse);
            response.put("success", true);
            response.put("message", "Vaccination record updated successfully");
            response.put("record", record);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Add follow-up notes to a record
     */
    @PostMapping("/{id}/follow-up")
    public ResponseEntity<Map<String, Object>> addFollowUpNotes(
            @PathVariable Long id,
            @AuthenticationPrincipal User nurse,
            @RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String followUpNotes = request.get("notes");
            if (followUpNotes == null || followUpNotes.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Follow-up notes cannot be empty");
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }
            
            VaccinationRecordDTO record = recordService.addFollowUpNotes(id, followUpNotes, nurse);
            response.put("success", true);
            response.put("message", "Follow-up notes added successfully");
            response.put("record", record);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Mark a record as resolved
     */
    @PostMapping("/{id}/resolve")
    public ResponseEntity<Map<String, Object>> markAsResolved(
            @PathVariable Long id,
            @AuthenticationPrincipal User nurse) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            VaccinationRecordDTO record = recordService.markAsResolved(id, nurse);
            response.put("success", true);
            response.put("message", "Record marked as resolved successfully");
            response.put("record", record);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Sync record to vaccination history
     */
    @PostMapping("/{id}/sync-to-history")
    public ResponseEntity<Map<String, Object>> syncToHistory(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            recordService.syncToVaccinationHistory(id);
            response.put("success", true);
            response.put("message", "Record synced to vaccination history successfully");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Get vaccination monitoring dashboard data
     */
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardData() {
        Map<String, Object> dashboard = new HashMap<>();
        
        try {
            List<VaccinationRecordDTO> followUpRecords = recordService.getRecordsNeedingFollowUp();
            List<VaccinationRecordDTO> severeReactions = recordService.getSevereReactions();
            
            // Count by severity level
            long mildReactions = followUpRecords.stream()
                    .filter(r -> "MILD".equals(r.getSeverityLevel()))
                    .count();
            
            long moderateReactions = followUpRecords.stream()
                    .filter(r -> "MODERATE".equals(r.getSeverityLevel()))
                    .count();
            
            long severeCount = followUpRecords.stream()
                    .filter(r -> "SEVERE".equals(r.getSeverityLevel()) || "CRITICAL".equals(r.getSeverityLevel()))
                    .count();
            
            dashboard.put("totalFollowUp", followUpRecords.size());
            dashboard.put("severeReactionsCount", severeReactions.size());
            dashboard.put("mildReactions", mildReactions);
            dashboard.put("moderateReactions", moderateReactions);
            dashboard.put("severeReactions", severeCount);
            dashboard.put("followUpRecords", followUpRecords);
            dashboard.put("severeReactionsList", severeReactions);
            
            return ResponseEntity.ok(dashboard);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error retrieving dashboard data: " + e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

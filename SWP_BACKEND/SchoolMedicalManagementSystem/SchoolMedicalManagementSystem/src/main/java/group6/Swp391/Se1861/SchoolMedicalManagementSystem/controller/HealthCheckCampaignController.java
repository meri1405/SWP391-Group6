package group6.Swp391.Se1861.SchoolMedicalManagementSystem.controller;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.*;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.HealthCheckCampaign;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.TimeSlot;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.HealthCheckForm;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.Student;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.CampaignStatus;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IHealthCheckCampaignService;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IHealthCheckFormService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Set;
import java.util.HashSet;
import java.util.ArrayList;
import java.util.stream.Collectors;
import java.util.Set;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.FormStatus;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.HealthCheckForm;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.HealthCheckFormDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IHealthCheckFormService;

@RestController
@RequestMapping("/api/nurse/health-check-campaigns")
@RequiredArgsConstructor
public class HealthCheckCampaignController {

    private final IHealthCheckCampaignService campaignService;
    private final IHealthCheckFormService healthCheckFormService;

    /**
     * Create a new health check campaign
     */
    @PostMapping
    public ResponseEntity<HealthCheckCampaignDTO> createCampaign(
            @AuthenticationPrincipal User nurse,
            @RequestBody CreateHealthCheckCampaignRequest request) {
        try {
            HealthCheckCampaignDTO campaign = campaignService.createCampaign(nurse, request);
            return new ResponseEntity<>(campaign, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Get all campaigns created by the authenticated nurse
     */
    @GetMapping("/my-campaigns")
    public ResponseEntity<Page<HealthCheckCampaignDTO>> getMyCampaigns(
            @AuthenticationPrincipal User nurse,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<HealthCheckCampaignDTO> campaigns = campaignService.getCampaignsByNurse(nurse, pageable);
        return ResponseEntity.ok(campaigns);
    }

    /**
     * Get campaign by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<HealthCheckCampaignDTO> getCampaignById(@PathVariable Long id) {
        try {
            HealthCheckCampaignDTO campaign = campaignService.getCampaignById(id);
            return ResponseEntity.ok(campaign);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Update a campaign (only if status is PENDING)
     */
    @PutMapping("/{id}")
    public ResponseEntity<HealthCheckCampaignDTO> updateCampaign(
            @PathVariable Long id,
            @AuthenticationPrincipal User nurse,
            @RequestBody CreateHealthCheckCampaignRequest request) {
        try {
            HealthCheckCampaignDTO campaign = campaignService.updateCampaign(id, nurse, request);
            return ResponseEntity.ok(campaign);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        } catch (IllegalStateException e) {
            return new ResponseEntity<>(null, HttpStatus.CONFLICT);
        }
    }

    /**
     * Start a campaign (change status to IN_PROGRESS and send forms to parents)
     */
    @PostMapping("/{id}/start")
    public ResponseEntity<HealthCheckCampaignDTO> startCampaign(
            @PathVariable Long id,
            @AuthenticationPrincipal User nurse) {
        try {
            HealthCheckCampaignDTO campaign = campaignService.startCampaignDTO(id);
            return ResponseEntity.ok(campaign);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Complete a campaign
     */
    @PostMapping("/{id}/complete")
    public ResponseEntity<HealthCheckCampaignDTO> completeCampaign(
            @PathVariable Long id,
            @AuthenticationPrincipal User nurse) {
        try {
            HealthCheckCampaignDTO campaign = campaignService.completeCampaignDTO(id);
            return ResponseEntity.ok(campaign);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Get eligible students for a campaign
     */
    @GetMapping("/{id}/eligible-students")
    public ResponseEntity<List<StudentDTO>> getEligibleStudents(@PathVariable Long id) {
        try {
            List<StudentDTO> students = campaignService.getEligibleStudents(id);
            return ResponseEntity.ok(students);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Get eligible students with form status for a campaign
     */
    @GetMapping("/{id}/eligible-students-with-status")
    public ResponseEntity<List<Map<String, Object>>> getEligibleStudentsWithFormStatus(@PathVariable Long id) {
        try {
            List<Map<String, Object>> students = campaignService.getEligibleStudentsWithFormStatus(id);
            return ResponseEntity.ok(students);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Calculate target count for a health check campaign based on criteria
     */
    @PostMapping("/calculate-target-count")
    public ResponseEntity<Map<String, Integer>> calculateTargetCount(
            @RequestBody Map<String, Object> request) {
        try {
            Integer minAge = (Integer) request.get("minAge");
            Integer maxAge = (Integer) request.get("maxAge");
            @SuppressWarnings("unchecked")
            Set<String> targetClasses = new HashSet<>((List<String>) request.getOrDefault("targetClasses", new ArrayList<>()));
            
            int targetCount = campaignService.calculateTargetCount(minAge, maxAge, targetClasses);
            
            Map<String, Integer> response = new HashMap<>();
            response.put("targetCount", targetCount);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Integer> errorResponse = new HashMap<>();
            errorResponse.put("targetCount", 0);
            return ResponseEntity.ok(errorResponse);
        }
    }

    /**
     * Generate health check forms for eligible students
     */
    @PostMapping("/{id}/generate-forms")
    public ResponseEntity<Map<String, Object>> generateForms(@PathVariable Long id) {
        try {
            Map<String, Object> response = campaignService.generateHealthCheckForms(id);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            errorResponse.put("formsGenerated", 0);
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Send notifications to parents for health check campaign
     */
    @PostMapping("/{id}/send-notifications")
    public ResponseEntity<Map<String, Object>> sendNotificationsToParents(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> requestBody) {
        try {
            String customMessage = null;
            if (requestBody != null && requestBody.containsKey("message")) {
                customMessage = requestBody.get("message");
            }
            Map<String, Object> response = campaignService.sendNotificationsToParents(id, customMessage);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            errorResponse.put("notificationsSent", 0);
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Get all health check forms for a specific campaign
     */
    @GetMapping("/{id}/forms")
    public ResponseEntity<List<HealthCheckFormDTO>> getFormsByCampaign(@PathVariable Long id) {
        try {
            // Get the campaign first
            HealthCheckCampaignDTO campaignDTO = campaignService.getCampaignById(id);
            if (campaignDTO == null) {
                return ResponseEntity.notFound().build();
            }
            
            // Convert DTO to entity for service call
            HealthCheckCampaign campaign = new HealthCheckCampaign();
            campaign.setId(campaignDTO.getId());
            campaign.setName(campaignDTO.getName());
            
            List<HealthCheckFormDTO> forms = healthCheckFormService.getFormsByCampaign(campaign);
            return ResponseEntity.ok(forms);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get schedule details for a campaign including student sequence
     */
    @GetMapping("/{id}/schedule")
    public ResponseEntity<Map<String, Object>> getScheduleDetails(@PathVariable Long id) {
        try {
            // Get the campaign
            HealthCheckCampaign campaign = campaignService.getCampaignModelById(id);
            
            // Get all forms confirmed by parents
            List<HealthCheckForm> confirmedForms = healthCheckFormService.getConfirmedFormsByCampaignId(id);
            
            // Sort students by class and name
            confirmedForms.sort((a, b) -> {
                // First sort by class
                int classCompare = a.getStudent().getClassName().compareTo(b.getStudent().getClassName());
                if (classCompare != 0) return classCompare;
                
                // Then sort by name
                return a.getStudent().getFirstName().compareTo(b.getStudent().getFirstName());
            });
            
            // Build response with schedule details
            List<Map<String, Object>> studentSchedule = new ArrayList<>();
            int sequenceNumber = 1;
            
            for (HealthCheckForm form : confirmedForms) {
                Student student = form.getStudent();
                Map<String, Object> studentInfo = new HashMap<>();
                
                studentInfo.put("sequenceNumber", sequenceNumber);
                studentInfo.put("studentId", student.getStudentID());
                studentInfo.put("studentName", student.getFirstName() + " " + student.getLastName());
                studentInfo.put("studentClass", student.getClassName());
                studentInfo.put("formId", form.getId());
                
                studentSchedule.add(studentInfo);
                sequenceNumber++;
            }
            
            Map<String, Object> scheduleDetails = new HashMap<>();
            scheduleDetails.put("campaignId", campaign.getId());
            scheduleDetails.put("campaignName", campaign.getName());
            scheduleDetails.put("startDate", campaign.getStartDate());
            scheduleDetails.put("endDate", campaign.getEndDate());
            scheduleDetails.put("location", campaign.getLocation());
            scheduleDetails.put("timeSlot", campaign.getTimeSlot());
            scheduleDetails.put("scheduleNotes", campaign.getScheduleNotes());
            scheduleDetails.put("confirmedCount", campaign.getConfirmedCount());
            scheduleDetails.put("studentSchedule", studentSchedule);
            
            return ResponseEntity.ok(scheduleDetails);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Schedule a campaign
     */
    @PostMapping("/{id}/schedule")
    public ResponseEntity<HealthCheckCampaignDTO> scheduleCampaign(
            @PathVariable Long id,
            @RequestBody ScheduleHealthCheckCampaignRequest request) {
        try {
            // Call service to schedule campaign
            HealthCheckCampaign scheduledCampaign = campaignService.scheduleCampaign(
                id, request.getTargetCount(), request.getTimeSlot(), request.getScheduleNotes());
            
            return ResponseEntity.ok(campaignService.convertToDTO(scheduledCampaign));
        } catch (RuntimeException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Record health check result for a student
     */
    @PostMapping("/record-result")
    public ResponseEntity<String> recordHealthCheckResult(
            @RequestBody RecordHealthCheckResultRequest request) {
        try {
            System.out.println("DEBUG: Controller received request to record health check result");
            campaignService.recordHealthCheckResult(request);
            return ResponseEntity.ok("Health check result recorded successfully");
        } catch (RuntimeException e) {
            System.err.println("ERROR: Exception in recordHealthCheckResult: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Get confirmed students for a campaign (for recording results)
     */
    @GetMapping("/{id}/confirmed-students")
    public ResponseEntity<List<Map<String, Object>>> getConfirmedStudents(@PathVariable Long id) {
        try {
            List<Map<String, Object>> confirmedStudents = campaignService.getConfirmedStudents(id);
            return ResponseEntity.ok(confirmedStudents);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Get health check results for a campaign
     */
    @GetMapping("/{id}/results")
    public ResponseEntity<List<Map<String, Object>>> getCampaignResults(@PathVariable Long id) {
        try {
            List<Map<String, Object>> results = campaignService.getCampaignResults(id);
            return ResponseEntity.ok(results);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Send health check results to parent(s)
     * 
     * @param campaignId The ID of the health check campaign
     * @param request The request containing the student IDs and custom message
     * @param nurse The authenticated nurse user
     * @return Map with counts of notifications sent
     */
    @PostMapping("/{campaignId}/send-result-notifications")
    public ResponseEntity<Map<String, Object>> sendHealthCheckResultNotifications(
            @PathVariable Long campaignId,
            @RequestBody HealthCheckResultNotificationRequest request,
            @AuthenticationPrincipal User nurse) {
        
        try {
            // Get the campaign
            HealthCheckCampaign campaign = campaignService.getCampaignModelById(campaignId);
            
            // Check if campaign is completed
            if (campaign.getStatus() != CampaignStatus.COMPLETED) {
                return new ResponseEntity<>(
                    Map.of("error", "Campaign must be completed to send result notifications"),
                    HttpStatus.BAD_REQUEST);
            }
            
            // Validate nurse is the creator of the campaign
            if (!campaign.getCreatedBy().getId().equals(nurse.getId())) {
                return new ResponseEntity<>(
                    Map.of("error", "Only the campaign creator can send result notifications"),
                    HttpStatus.FORBIDDEN);
            }
            
            // Send result notifications to parents
            int sentCount = campaignService.sendHealthCheckResultNotificationsToParents(
                campaignId, 
                request.getStudentIds(),
                request.getNotificationContent(),
                request.isUseDefaultTemplate());
            
            // Return success response
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("sentCount", sentCount);
            response.put("message", "Health check result notifications sent successfully to " + sentCount + " parents");
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(
                Map.of("error", e.getMessage()),
                HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>(
                Map.of("error", "Failed to send health check result notifications: " + e.getMessage()),
                HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Debug endpoint to check form statuses and investigate confirmed students discrepancy
     */
    @GetMapping("/{id}/debug-forms")
    public ResponseEntity<Map<String, Object>> debugFormStatuses(@PathVariable Long id) {
        try {
            System.out.println("=== DEBUG: Investigating form statuses for campaign " + id + " ===");
            
            // Get the campaign
            HealthCheckCampaign campaign = campaignService.getCampaignModelById(id);
            
            // Get all forms for this campaign (regardless of status)
            List<HealthCheckForm> allForms = healthCheckFormService.getFormsByCampaign(campaign)
                .stream()
                .map(dto -> {
                    // Convert DTO back to entity (simplified)
                    HealthCheckForm form = new HealthCheckForm();
                    form.setId(dto.getId());
                    form.setStatus(dto.getStatus());
                    // Add other necessary fields
                    return form;
                })
                .collect(Collectors.toList());
            
            System.out.println("DEBUG: Found " + allForms.size() + " total forms");
            
            // Count by status
            Map<String, Long> statusCounts = allForms.stream()
                .collect(Collectors.groupingBy(
                    form -> form.getStatus().toString(),
                    Collectors.counting()
                ));
            
            System.out.println("DEBUG: Status counts: " + statusCounts);
            
            // Get forms with CONFIRMED status specifically
            List<HealthCheckForm> confirmedForms = allForms.stream()
                .filter(form -> form.getStatus() == FormStatus.CONFIRMED)
                .collect(Collectors.toList());
            
            System.out.println("DEBUG: Found " + confirmedForms.size() + " CONFIRMED forms");
            
            // Get eligible students with status (Method 1)
            List<Map<String, Object>> eligibleWithStatus = campaignService.getEligibleStudentsWithFormStatus(id);
            long confirmedFromMethod1 = eligibleWithStatus.stream()
                .filter(student -> "CONFIRMED".equals(student.get("status")))
                .count();
            
            System.out.println("DEBUG: Method 1 (eligible-students-with-status) shows " + confirmedFromMethod1 + " confirmed");
            
            // Get confirmed students (Method 2)
            List<Map<String, Object>> confirmedFromMethod2 = campaignService.getConfirmedStudents(id);
            
            System.out.println("DEBUG: Method 2 (confirmed-students) shows " + confirmedFromMethod2.size() + " confirmed");
            
            // Build debug response
            Map<String, Object> debugInfo = new HashMap<>();
            debugInfo.put("campaignId", id);
            debugInfo.put("campaignName", campaign.getName());
            debugInfo.put("totalForms", allForms.size());
            debugInfo.put("statusCounts", statusCounts);
            debugInfo.put("confirmedFromDatabase", confirmedForms.size());
            debugInfo.put("confirmedFromMethod1", confirmedFromMethod1);
            debugInfo.put("confirmedFromMethod2", confirmedFromMethod2.size());
            
            // Add form details for investigation
            List<Map<String, Object>> formDetails = new ArrayList<>();
            for (HealthCheckFormDTO dto : healthCheckFormService.getFormsByCampaign(campaign)) {
                Map<String, Object> formInfo = new HashMap<>();
                formInfo.put("formId", dto.getId());
                formInfo.put("studentId", dto.getStudentId());
                formInfo.put("studentName", dto.getStudentFullName());
                formInfo.put("status", dto.getStatus().toString());
                formInfo.put("sentAt", dto.getSentAt());
                formInfo.put("respondedAt", dto.getRespondedAt());
                formDetails.add(formInfo);
            }
            debugInfo.put("formDetails", formDetails);
            
            // Log discrepancy details
            if (confirmedFromMethod1 != confirmedFromMethod2.size()) {
                System.out.println("=== DISCREPANCY FOUND ===");
                System.out.println("Method 1 confirmed count: " + confirmedFromMethod1);
                System.out.println("Method 2 confirmed count: " + confirmedFromMethod2.size());
                
                // Find students that appear confirmed in method 1 but not method 2
                Set<Long> method2StudentIds = confirmedFromMethod2.stream()
                    .map(student -> ((Number) student.get("studentID")).longValue())
                    .collect(Collectors.toSet());
                
                List<Map<String, Object>> missingStudents = eligibleWithStatus.stream()
                    .filter(student -> "CONFIRMED".equals(student.get("status")))
                    .filter(student -> !method2StudentIds.contains(((Number) student.get("studentID")).longValue()))
                    .collect(Collectors.toList());
                
                debugInfo.put("missingFromMethod2", missingStudents);
                System.out.println("Students missing from method 2: " + missingStudents);
            }
            
            return ResponseEntity.ok(debugInfo);
            
        } catch (Exception e) {
            System.err.println("ERROR in debug endpoint: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> errorInfo = new HashMap<>();
            errorInfo.put("error", e.getMessage());
            errorInfo.put("stackTrace", e.getStackTrace());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorInfo);
        }
    }
}

/**
 * Manager controller for health check campaigns
 */
@RestController
@RequestMapping("/api/manager/health-check-campaigns")
@RequiredArgsConstructor
class HealthCheckCampaignManagerController {

    private final IHealthCheckCampaignService campaignService;
    private final IHealthCheckFormService healthCheckFormService;

    /**
     * Get campaigns by status for manager review
     */
    @GetMapping
    public ResponseEntity<Page<HealthCheckCampaignDTO>> getCampaignsByStatus(
            @RequestParam(defaultValue = "PENDING") String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            CampaignStatus campaignStatus = CampaignStatus.valueOf(status.toUpperCase());
            Pageable pageable = PageRequest.of(page, size);
            Page<HealthCheckCampaignDTO> campaigns = campaignService.getCampaignsByStatus(campaignStatus, pageable);
            return ResponseEntity.ok(campaigns);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Approve a campaign
     */
    @PostMapping("/{id}/approve")
    public ResponseEntity<HealthCheckCampaignDTO> approveCampaign(
            @PathVariable Long id,
            @AuthenticationPrincipal User manager) {
        try {
            HealthCheckCampaignDTO campaign = campaignService.approveCampaignDTO(id, manager);
            return ResponseEntity.ok(campaign);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Reject a campaign
     */
    @PostMapping("/{id}/reject")
    public ResponseEntity<HealthCheckCampaignDTO> rejectCampaign(
            @PathVariable Long id,
            @AuthenticationPrincipal User manager,
            @RequestBody Map<String, String> requestBody) {
        try {
            String notes = requestBody.get("notes");
            HealthCheckCampaignDTO campaign = campaignService.rejectCampaignDTO(id, manager, notes);
            return ResponseEntity.ok(campaign);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/{id}/confirmed-students")
    public ResponseEntity<List<Map<String, Object>>> getConfirmedStudents(@PathVariable Long id) {
        try {
            List<Map<String, Object>> confirmedStudents = campaignService.getConfirmedStudents(id);
            return ResponseEntity.ok(confirmedStudents);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Get health check results for a campaign
     */
    @GetMapping("/{id}/results")
    public ResponseEntity<List<Map<String, Object>>> getCampaignResults(@PathVariable Long id) {
        try {
            List<Map<String, Object>> results = campaignService.getCampaignResults(id);
            return ResponseEntity.ok(results);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/{id}/forms")
    public ResponseEntity<List<HealthCheckFormDTO>> getFormsByCampaign(@PathVariable Long id) {
        try {
            // Get the campaign first
            HealthCheckCampaignDTO campaignDTO = campaignService.getCampaignById(id);
            if (campaignDTO == null) {
                return ResponseEntity.notFound().build();
            }

            // Convert DTO to entity for service call
            HealthCheckCampaign campaign = new HealthCheckCampaign();
            campaign.setId(campaignDTO.getId());
            campaign.setName(campaignDTO.getName());

            List<HealthCheckFormDTO> forms = healthCheckFormService.getFormsByCampaign(campaign);
            return ResponseEntity.ok(forms);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}

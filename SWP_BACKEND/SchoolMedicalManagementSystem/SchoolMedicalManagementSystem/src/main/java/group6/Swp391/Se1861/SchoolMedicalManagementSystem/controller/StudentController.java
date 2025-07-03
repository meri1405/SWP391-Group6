package group6.Swp391.Se1861.SchoolMedicalManagementSystem.controller;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.StudentDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.HealthCheckCampaign;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IStudentService;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IHealthCheckCampaignService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for Student data access by campaigns
 * Provides endpoints for getting eligible students for health check campaigns
 */
@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = {"http://localhost:5173"})
public class StudentController {

    @Autowired
    private IStudentService studentService;
    
    @Autowired
    private IHealthCheckCampaignService healthCheckCampaignService;

    /**
     * Get eligible students for a specific health check campaign
     * This endpoint automatically filters students based on campaign criteria
     */
    @GetMapping("/eligible-for-campaign/{campaignId}")
    @PreAuthorize("hasRole('SCHOOLNURSE')")
    public ResponseEntity<List<StudentDTO>> getEligibleStudentsForCampaign(
            @PathVariable Long campaignId,
            @RequestParam(required = false) Integer minAge,
            @RequestParam(required = false) Integer maxAge,
            @RequestParam(required = false) String className) {
        try {
            // Get campaign details
            HealthCheckCampaign campaign = healthCheckCampaignService.getCampaignModelById(campaignId);
            if (campaign == null) {
                return ResponseEntity.notFound().build();
            }

            List<StudentDTO> eligibleStudents;

            // Priority 1: If both custom minAge/maxAge and className are provided, use both
            if ((minAge != null || maxAge != null) && className != null && !className.trim().isEmpty()) {
                eligibleStudents = studentService.getStudentsByAgeRangeAndClass(
                    minAge != null ? minAge : 0, 
                    maxAge != null ? maxAge : 100, 
                    className
                );
            }
            // Priority 2: If custom minAge/maxAge are provided, use age range filter
            else if (minAge != null || maxAge != null) {
                eligibleStudents = studentService.getStudentsByAgeRange(
                    minAge != null ? minAge : 0, 
                    maxAge != null ? maxAge : 100
                );
            }
            // Priority 3: If custom className is provided, use class filter
            else if (className != null && !className.trim().isEmpty()) {
                eligibleStudents = studentService.getStudentsByClassName(className);
            }
            // Priority 4: Use campaign's own criteria
            else if (campaign.getTargetClasses() != null && !campaign.getTargetClasses().isEmpty()) {
                // Campaign has specific target classes - use the unified service
                eligibleStudents = studentService.getEligibleStudentsForClasses(
                    campaign.getTargetClasses(), 
                    campaign.getMinAge(), 
                    campaign.getMaxAge()
                );
            }
            else if (campaign.getMinAge() != null || campaign.getMaxAge() != null) {
                // Campaign has age range criteria
                int campaignMinAge = campaign.getMinAge() != null ? campaign.getMinAge() : 0;
                int campaignMaxAge = campaign.getMaxAge() != null ? campaign.getMaxAge() : 100;
                eligibleStudents = studentService.getStudentsByAgeRange(campaignMinAge, campaignMaxAge);
            }
            else {
                // No specific criteria, return all students
                eligibleStudents = studentService.getAllStudents();
            }

            return ResponseEntity.ok(eligibleStudents);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Get students by age range only
     */
    @GetMapping("/by-age-range")
    @PreAuthorize("hasRole('SCHOOLNURSE')")
    public ResponseEntity<List<StudentDTO>> getStudentsByAgeRange(
            @RequestParam Integer minAge,
            @RequestParam Integer maxAge) {
        try {
            List<StudentDTO> students = studentService.getStudentsByAgeRange(minAge, maxAge);
            return ResponseEntity.ok(students);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Get students by class name only
     */
    @GetMapping("/by-class")
    @PreAuthorize("hasRole('SCHOOLNURSE')")
    public ResponseEntity<List<StudentDTO>> getStudentsByClassName(
            @RequestParam String className) {
        try {
            List<StudentDTO> students = studentService.getStudentsByClassName(className);
            return ResponseEntity.ok(students);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Get students by both age range and class name
     */
    @GetMapping("/by-age-and-class")
    @PreAuthorize("hasRole('SCHOOLNURSE')")
    public ResponseEntity<List<StudentDTO>> getStudentsByAgeRangeAndClass(
            @RequestParam Integer minAge,
            @RequestParam Integer maxAge,
            @RequestParam String className) {
        try {
            List<StudentDTO> students = studentService.getStudentsByAgeRangeAndClass(minAge, maxAge, className);
            return ResponseEntity.ok(students);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
}

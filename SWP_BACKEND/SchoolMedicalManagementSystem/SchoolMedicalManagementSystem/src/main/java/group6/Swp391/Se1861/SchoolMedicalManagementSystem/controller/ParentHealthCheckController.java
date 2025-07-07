package group6.Swp391.Se1861.SchoolMedicalManagementSystem.controller;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.HealthCheckCampaign;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.HealthCheckResult;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.Student;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.HealthCheckCategory;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.HealthCheckResultRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.HealthCheckCampaignRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.StudentRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IHealthCheckCampaignService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Controller dành cho phụ huynh xem kết quả khám sức khỏe
 * Cung cấp các API để phụ huynh xem kết quả khám sức khỏe của con em
 * 
 * Chức năng chính:
 * - Xem kết quả khám sức khỏe của học sinh theo chiến dịch
 * - Xem chi tiết kết quả từng loại khám
 * 
 * Bảo mật: Chỉ cho phép truy cập với vai trò PARENT
 */
@RestController
@RequestMapping("/api/parent/health-check")
@PreAuthorize("hasRole('PARENT')")
@RequiredArgsConstructor
public class ParentHealthCheckController {

    private final IHealthCheckCampaignService campaignService;
    private final HealthCheckResultRepository healthCheckResultRepository;
    private final HealthCheckCampaignRepository healthCheckCampaignRepository;
    private final StudentRepository studentRepository;

    /**
     * Get health check results for a student in a specific campaign (for parents)
     * 
     * @param campaignId ID của chiến dịch khám sức khỏe
     * @param studentId ID của học sinh
     * @param parent Phụ huynh đã xác thực
     * @return ResponseEntity chứa kết quả khám sức khỏe
     */
    @GetMapping("/campaigns/{campaignId}/students/{studentId}/results")
    public ResponseEntity<?> getHealthCheckResults(
            @PathVariable Long campaignId,
            @PathVariable Long studentId,
            @AuthenticationPrincipal User parent) {
        try {
            // Verify that the student belongs to the parent
            Student student = studentRepository.findById(studentId).orElse(null);
            if (student == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Student not found"));
            }
            
            // Check if the parent has access to this student
            if (!student.getParent().getId().equals(parent.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied. You can only view your own child's results."));
            }

            // Get campaign to verify it exists
            HealthCheckCampaign campaign = healthCheckCampaignRepository.findById(campaignId).orElse(null);
            if (campaign == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Campaign not found"));
            }

            // Get health check results for this student and campaign
            List<HealthCheckResult> results = healthCheckResultRepository.findByStudentAndForm_Campaign(student, campaign);
            
            if (results.isEmpty()) {
                return ResponseEntity.ok(Map.of(
                    "message", "Chưa có kết quả khám sức khỏe cho chiến dịch này",
                    "student", Map.of(
                        "id", student.getStudentID(),
                        "name", student.getFirstName() + " " + student.getLastName(),
                        "className", student.getClassName(),
                        "dateOfBirth", student.getDob()
                    ),
                    "campaign", Map.of(
                        "id", campaign.getId(),
                        "name", campaign.getName(),
                        "startDate", campaign.getStartDate(),
                        "endDate", campaign.getEndDate()
                    ),
                    "categoryResults", new HashMap<>(),
                    "overallResults", new HashMap<>(),
                    "hasResults", false
                ));
            }

            // Format results for parent view - organize by category similar to school nurse
            Map<String, Object> categoryResults = new HashMap<>();
            Map<String, Object> overallResults = new HashMap<>();
            
            for (HealthCheckResult result : results) {
                HealthCheckCategory category = result.getCategory();
                
                // Create category-specific result data
                Map<String, Object> categoryData = new HashMap<>();
                categoryData.put("id", result.getId());
                categoryData.put("category", result.getCategory());
                categoryData.put("weight", result.getWeight());
                categoryData.put("height", result.getHeight());
                categoryData.put("bmi", result.getBmi());
                categoryData.put("isAbnormal", result.isAbnormal());
                categoryData.put("status", result.getStatus());
                categoryData.put("resultNotes", result.getResultNotes());
                categoryData.put("recommendations", result.getRecommendations());
                categoryData.put("performedAt", result.getPerformedAt());
                categoryData.put("nurseName", result.getNurse() != null ? 
                    result.getNurse().getFirstName() + " " + result.getNurse().getLastName() : null);
                
                // Add category-specific details
                switch (category) {
                    case VISION:
                        if (!result.getVisionResults().isEmpty()) {
                            categoryData.put("visionDetails", result.getVisionResults());
                        }
                        break;
                    case HEARING:
                        if (!result.getHearingResults().isEmpty()) {
                            categoryData.put("hearingDetails", result.getHearingResults());
                        }
                        break;
                    case ORAL:
                        if (!result.getOralResults().isEmpty()) {
                            categoryData.put("oralDetails", result.getOralResults());
                        }
                        break;
                    case SKIN:
                        if (!result.getSkinResults().isEmpty()) {
                            categoryData.put("skinDetails", result.getSkinResults());
                        }
                        break;
                    case RESPIRATORY:
                        if (!result.getRespiratoryResults().isEmpty()) {
                            categoryData.put("respiratoryDetails", result.getRespiratoryResults());
                        }
                        break;
                }
                
                // Store in categoryResults by category name
                categoryResults.put(category.toString(), categoryData);
                
                // Store overall results (weight, height, BMI) - use the first one found
                if (overallResults.isEmpty()) {
                    overallResults.put("weight", result.getWeight());
                    overallResults.put("height", result.getHeight());
                    overallResults.put("bmi", result.getBmi());
                    overallResults.put("performedAt", result.getPerformedAt());
                    overallResults.put("nurseName", result.getNurse() != null ? 
                        result.getNurse().getFirstName() + " " + result.getNurse().getLastName() : null);
                }
            }

            Map<String, Object> response = new HashMap<>();
            response.put("student", Map.of(
                "id", student.getStudentID(),
                "name", student.getFirstName() + " " + student.getLastName(),
                "className", student.getClassName(),
                "dateOfBirth", student.getDob()
            ));
            response.put("campaign", Map.of(
                "id", campaign.getId(),
                "name", campaign.getName(),
                "description", campaign.getDescription(),
                "startDate", campaign.getStartDate(),
                "endDate", campaign.getEndDate(),
                "location", campaign.getLocation(),
                "categories", campaign.getCategories()
            ));
            response.put("categoryResults", categoryResults);
            response.put("overallResults", overallResults);
            response.put("hasResults", true);
            response.put("totalResults", results.size());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch health check results", "message", e.getMessage()));
        }
    }

    /**
     * Get all health check results for a specific student (all campaigns)
     * 
     * @param studentId ID của học sinh
     * @param parent Phụ huynh đã xác thực
     * @return ResponseEntity chứa tất cả kết quả khám sức khỏe
     */
    @GetMapping("/students/{studentId}/results")
    public ResponseEntity<?> getAllHealthCheckResultsForStudent(
            @PathVariable Long studentId,
            @AuthenticationPrincipal User parent) {
        try {
            // Verify that the student belongs to the parent
            Student student = studentRepository.findById(studentId).orElse(null);
            if (student == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Student not found"));
            }
            
            // Check if the parent has access to this student
            if (!student.getParent().getId().equals(parent.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied. You can only view your own child's results."));
            }

            // Get all health check results for this student
            List<HealthCheckResult> results = healthCheckResultRepository.findByStudent(student);
            
            if (results.isEmpty()) {
                return ResponseEntity.ok(Map.of(
                    "message", "Chưa có kết quả khám sức khỏe nào",
                    "student", Map.of(
                        "id", student.getStudentID(),
                        "name", student.getFirstName() + " " + student.getLastName(),
                        "className", student.getClassName(),
                        "dateOfBirth", student.getDob()
                    ),
                    "campaignResults", new ArrayList<>(),
                    "totalCampaigns", 0,
                    "totalResults", 0
                ));
            }

            // Group results by campaign using similar pattern as school nurse
            Map<Long, Map<String, Object>> campaignResultsMap = new HashMap<>();
            
            for (HealthCheckResult result : results) {
                HealthCheckCampaign campaign = result.getForm().getCampaign();
                Long campaignId = campaign.getId();
                
                // Initialize campaign data if not exists
                if (!campaignResultsMap.containsKey(campaignId)) {
                    Map<String, Object> campaignData = new HashMap<>();
                    campaignData.put("campaign", Map.of(
                        "id", campaign.getId(),
                        "name", campaign.getName(),
                        "description", campaign.getDescription(),
                        "startDate", campaign.getStartDate(),
                        "endDate", campaign.getEndDate(),
                        "location", campaign.getLocation(),
                        "categories", campaign.getCategories()
                    ));
                    campaignData.put("categoryResults", new HashMap<String, Object>());
                    campaignData.put("overallResults", new HashMap<String, Object>());
                    campaignData.put("hasResults", false);
                    campaignResultsMap.put(campaignId, campaignData);
                }
                
                Map<String, Object> campaignData = campaignResultsMap.get(campaignId);
                @SuppressWarnings("unchecked")
                Map<String, Object> categoryResults = (Map<String, Object>) campaignData.get("categoryResults");
                @SuppressWarnings("unchecked")
                Map<String, Object> overallResults = (Map<String, Object>) campaignData.get("overallResults");
                
                // Create category-specific result data similar to school nurse implementation
                Map<String, Object> categoryData = new HashMap<>();
                categoryData.put("id", result.getId());
                categoryData.put("category", result.getCategory());
                categoryData.put("weight", result.getWeight());
                categoryData.put("height", result.getHeight());
                categoryData.put("bmi", result.getBmi());
                categoryData.put("status", result.getStatus());
                categoryData.put("isAbnormal", result.isAbnormal());
                categoryData.put("resultNotes", result.getResultNotes());
                categoryData.put("recommendations", result.getRecommendations());
                categoryData.put("performedAt", result.getPerformedAt());
                categoryData.put("nurseName", result.getNurse() != null ? 
                    result.getNurse().getFirstName() + " " + result.getNurse().getLastName() : null);
                
                // Add category-specific details based on category type
                HealthCheckCategory category = result.getCategory();
                switch (category) {
                    case VISION:
                        if (!result.getVisionResults().isEmpty()) {
                            categoryData.put("visionDetails", result.getVisionResults());
                        }
                        break;
                    case HEARING:
                        if (!result.getHearingResults().isEmpty()) {
                            categoryData.put("hearingDetails", result.getHearingResults());
                        }
                        break;
                    case ORAL:
                        if (!result.getOralResults().isEmpty()) {
                            categoryData.put("oralDetails", result.getOralResults());
                        }
                        break;
                    case SKIN:
                        if (!result.getSkinResults().isEmpty()) {
                            categoryData.put("skinDetails", result.getSkinResults());
                        }
                        break;
                    case RESPIRATORY:
                        if (!result.getRespiratoryResults().isEmpty()) {
                            categoryData.put("respiratoryDetails", result.getRespiratoryResults());
                        }
                        break;
                }
                
                // Store category result
                categoryResults.put(category.toString(), categoryData);
                
                // Store overall results (weight, height, BMI) - use the first one found
                if (overallResults.isEmpty()) {
                    overallResults.put("weight", result.getWeight());
                    overallResults.put("height", result.getHeight());
                    overallResults.put("bmi", result.getBmi());
                    overallResults.put("performedAt", result.getPerformedAt());
                    overallResults.put("nurseName", result.getNurse() != null ? 
                        result.getNurse().getFirstName() + " " + result.getNurse().getLastName() : null);
                }
                
                campaignData.put("hasResults", true);
            }

            // Convert to list format for response
            List<Map<String, Object>> campaignResultsList = new ArrayList<>(campaignResultsMap.values());
            
            Map<String, Object> response = new HashMap<>();
            response.put("student", Map.of(
                "id", student.getStudentID(),
                "name", student.getFirstName() + " " + student.getLastName(),
                "className", student.getClassName(),
                "dateOfBirth", student.getDob()
            ));
            response.put("campaignResults", campaignResultsList);
            response.put("totalCampaigns", campaignResultsMap.size());
            response.put("totalResults", results.size());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch health check results", "message", e.getMessage()));
        }
    }
}

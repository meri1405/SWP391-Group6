package group6.Swp391.Se1861.SchoolMedicalManagementSystem.controller;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.*;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.HealthCheckResultRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.HealthCheckCampaignRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.StudentRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IHealthCheckCampaignService;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IParentHealthCheckResultService;
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
@RequestMapping("/api/health-results")
@PreAuthorize("hasRole('PARENT')")
@RequiredArgsConstructor
public class ParentHealthCheckController {

    private final IHealthCheckCampaignService campaignService;
    private final HealthCheckResultRepository healthCheckResultRepository;
    private final HealthCheckCampaignRepository healthCheckCampaignRepository;
    private final StudentRepository studentRepository;
    private final IParentHealthCheckResultService parentHealthCheckResultService;

    /**
     * Get all health check results for the currently logged-in parent
     * Returns a summary of health check results for all their children
     * 
     * @param parent Phụ huynh đã xác thực
     * @return ResponseEntity chứa danh sách tóm tắt kết quả khám sức khỏe
     */
    @GetMapping("/parent")
    public ResponseEntity<?> getAllHealthCheckResultsForParent(
            @AuthenticationPrincipal User parent) {
        
        try {
            // Validate parent role
            if (!parent.getRole().getRoleName().equals("PARENT")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Only parents can access health check results"));
            }
            
            // Get all health check results for parent's children
            List<HealthCheckResult> results = healthCheckResultRepository.findByParent(parent);
            
            if (results.isEmpty()) {
                return ResponseEntity.ok(Map.of(
                    "message", "No health check results found for your children",
                    "results", new ArrayList<>()
                ));
            }
            
            // Convert results to summary format
            List<Map<String, Object>> resultSummaries = results.stream()
                .map(this::convertResultToSummary)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(Map.of(
                "message", "Health check results retrieved successfully",
                "totalResults", results.size(),
                "results", resultSummaries
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to retrieve health check results: " + e.getMessage()));
        }
    }

    /**
     * Get detailed health check result by result ID
     * Returns comprehensive details including weight, height, hearing, vision, dental, 
     * conclusion, campaign info, etc.
     * 
     * @param resultId ID của kết quả khám sức khỏe
     * @param parent Phụ huynh đã xác thực
     * @return ResponseEntity chứa chi tiết kết quả khám sức khỏe
     */
    @GetMapping("/{resultId}")
    public ResponseEntity<?> getHealthCheckResultDetail(
            @PathVariable Long resultId,
            @AuthenticationPrincipal User parent) {
        
        try {
            // Validate parent role
            if (!parent.getRole().getRoleName().equals("PARENT")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Only parents can access health check results"));
            }
            
            // Get health check result by ID and verify parent access
            HealthCheckResult result = healthCheckResultRepository.findByIdAndParent(resultId, parent)
                .orElseThrow(() -> new RuntimeException("Health check result not found or access denied"));
            
            // Convert to detailed response format
            Map<String, Object> detailedResult = convertResultToDetailedMap(result);
            
            return ResponseEntity.ok(Map.of(
                "message", "Health check result retrieved successfully",
                "result", detailedResult
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "Failed to retrieve health check result: " + e.getMessage()));
        }
    }
    
    /**
     * Helper method to convert HealthCheckResult to Map for response
     */
    private Map<String, Object> convertResultToMap(HealthCheckResult result) {
        Map<String, Object> resultMap = new HashMap<>();
        
        resultMap.put("id", result.getId());
        resultMap.put("category", result.getCategory().toString());
        resultMap.put("status", result.getStatus().toString());
        resultMap.put("isAbnormal", result.isAbnormal());
        resultMap.put("weight", result.getWeight());
        resultMap.put("height", result.getHeight());
        resultMap.put("bmi", result.getBmi());
        resultMap.put("resultNotes", result.getResultNotes());
        resultMap.put("recommendations", result.getRecommendations());
        resultMap.put("performedAt", result.getPerformedAt());
        
        // Add nurse information
        resultMap.put("nurse", Map.of(
            "id", result.getNurse().getId(),
            "name", result.getNurse().getFirstName() + " " + result.getNurse().getLastName()
        ));
        
        // Add category-specific details
        Map<String, Object> categoryDetails = getCategorySpecificData(result);
        if (!categoryDetails.isEmpty()) {
            resultMap.put("categoryDetails", categoryDetails);
        }
        
        return resultMap;
    }
    
    /**
     * Helper method to get category-specific data
     */
    private Map<String, Object> getCategorySpecificData(HealthCheckResult result) {
        Map<String, Object> categoryData = new HashMap<>();
        
        switch (result.getCategory()) {
            case VISION:
                if (result.getVision() != null) {
                    Vision vision = result.getVision();
                    categoryData.put("visionLeft", vision.getVisionLeft());
                    categoryData.put("visionRight", vision.getVisionRight());
                    categoryData.put("visionLeftWithGlass", vision.getVisionLeftWithGlass());
                    categoryData.put("visionRightWithGlass", vision.getVisionRightWithGlass());
                    categoryData.put("needsGlasses", vision.isNeedsGlasses());
                    categoryData.put("description", vision.getVisionDescription());
                    categoryData.put("recommendations", vision.getRecommendations());
                    categoryData.put("doctorName", vision.getDoctorName());
                }
                break;
                
            case HEARING:
                if (result.getHearing() != null) {
                    Hearing hearing = result.getHearing();
                    categoryData.put("leftEar", hearing.getLeftEar());
                    categoryData.put("rightEar", hearing.getRightEar());
                    categoryData.put("description", hearing.getDescription());
                    categoryData.put("recommendations", hearing.getRecommendations());
                    categoryData.put("doctorName", hearing.getDoctorName());
                }
                break;
                
            case ORAL:
                if (result.getOral() != null) {
                    Oral oral = result.getOral();
                    categoryData.put("teethCondition", oral.getTeethCondition());
                    categoryData.put("gumsCondition", oral.getGumsCondition());
                    categoryData.put("tongueCondition", oral.getTongueCondition());
                    categoryData.put("description", oral.getDescription());
                    categoryData.put("recommendations", oral.getRecommendations());
                    categoryData.put("doctorName", oral.getDoctorName());
                }
                break;
                
            case SKIN:
                if (result.getSkin() != null) {
                    Skin skin = result.getSkin();
                    categoryData.put("skinColor", skin.getSkinColor());
                    categoryData.put("rashes", skin.isRashes());
                    categoryData.put("lesions", skin.isLesions());
                    categoryData.put("dryness", skin.isDryness());
                    categoryData.put("eczema", skin.isEczema());
                    categoryData.put("psoriasis", skin.isPsoriasis());
                    categoryData.put("skinInfection", skin.isSkinInfection());
                    categoryData.put("allergies", skin.isAllergies());
                    categoryData.put("description", skin.getDescription());
                    categoryData.put("treatment", skin.getTreatment());
                    categoryData.put("recommendations", skin.getRecommendations());
                    categoryData.put("doctorName", skin.getDoctorName());
                }
                break;
                
            case RESPIRATORY:
                if (result.getRespiratory() != null) {
                    Respiratory respiratory = result.getRespiratory();
                    categoryData.put("breathingRate", respiratory.getBreathingRate());
                    categoryData.put("breathingSound", respiratory.getBreathingSound());
                    categoryData.put("wheezing", respiratory.isWheezing());
                    categoryData.put("cough", respiratory.isCough());
                    categoryData.put("breathingDifficulty", respiratory.isBreathingDifficulty());
                    categoryData.put("description", respiratory.getDescription());
                    categoryData.put("recommendations", respiratory.getRecommendations());
                    categoryData.put("doctorName", respiratory.getDoctorName());
                }
                break;
        }
        
        return categoryData;
    }
    
    /**
     * Helper method to convert HealthCheckResult to summary format for parent endpoint
     */
    private Map<String, Object> convertResultToSummary(HealthCheckResult result) {
        Map<String, Object> summary = new HashMap<>();
        
        // Basic result information
        summary.put("resultId", result.getId());
        summary.put("studentId", result.getStudent().getStudentID());
        summary.put("studentName", result.getStudent().getFullName());
        summary.put("studentClass", result.getStudent().getClassName());
        summary.put("schoolYear", result.getStudent().getSchoolYear());
        
        // Campaign information
        summary.put("campaignId", result.getForm().getCampaign().getId());
        summary.put("campaignName", result.getForm().getCampaign().getName());
        summary.put("campaignLocation", result.getForm().getCampaign().getLocation());
        
        // Health check details
        summary.put("category", result.getCategory().toString());
        summary.put("status", result.getStatus().toString());
        summary.put("isAbnormal", result.isAbnormal());
        summary.put("performedAt", result.getPerformedAt());
        summary.put("hasRecommendations", result.getRecommendations() != null && !result.getRecommendations().isEmpty());
        
        // Basic measurements
        summary.put("weight", result.getWeight());
        summary.put("height", result.getHeight());
        if (result.getBmi() != null) {
            summary.put("bmi", result.getBmi());
        }
        
        return summary;
    }
    
    /**
     * Helper method to convert HealthCheckResult to detailed format for specific result endpoint
     */
    private Map<String, Object> convertResultToDetailedMap(HealthCheckResult result) {
        Map<String, Object> detailedMap = new HashMap<>();
        
        // Basic information
        detailedMap.put("resultId", result.getId());
        detailedMap.put("studentId", result.getStudent().getStudentID());
        detailedMap.put("studentName", result.getStudent().getFullName());
        detailedMap.put("studentClass", result.getStudent().getClassName());
        detailedMap.put("schoolYear", result.getStudent().getSchoolYear());
        detailedMap.put("dateOfBirth", result.getStudent().getDob());
        
        // Calculate student age
        if (result.getStudent().getDob() != null) {
            int age = java.time.Period.between(result.getStudent().getDob(), 
                    result.getPerformedAt().toLocalDate()).getYears();
            detailedMap.put("studentAge", age);
        }
        
        // Campaign information
        HealthCheckCampaign campaign = result.getForm().getCampaign();
        detailedMap.put("campaign", Map.of(
            "id", campaign.getId(),
            "name", campaign.getName(),
            "description", campaign.getDescription() != null ? campaign.getDescription() : "",
            "location", campaign.getLocation(),
            "startDate", campaign.getStartDate(),
            "endDate", campaign.getEndDate()
        ));
        
        // Health check details
        detailedMap.put("category", result.getCategory().toString());
        detailedMap.put("status", result.getStatus().toString());
        detailedMap.put("isAbnormal", result.isAbnormal());
        detailedMap.put("weight", result.getWeight());
        detailedMap.put("height", result.getHeight());
        if (result.getBmi() != null) {
            detailedMap.put("bmi", result.getBmi());
        }
        detailedMap.put("resultNotes", result.getResultNotes());
        detailedMap.put("recommendations", result.getRecommendations());
        detailedMap.put("performedAt", result.getPerformedAt());
        
        // Nurse information
        detailedMap.put("nurse", Map.of(
            "id", result.getNurse().getId(),
            "name", result.getNurse().getFirstName() + " " + result.getNurse().getLastName()
        ));
        
        // Category-specific details
        Map<String, Object> categoryDetails = getCategorySpecificData(result);
        if (!categoryDetails.isEmpty()) {
            detailedMap.put("categoryDetails", categoryDetails);
        }
        
        return detailedMap;
    }
}

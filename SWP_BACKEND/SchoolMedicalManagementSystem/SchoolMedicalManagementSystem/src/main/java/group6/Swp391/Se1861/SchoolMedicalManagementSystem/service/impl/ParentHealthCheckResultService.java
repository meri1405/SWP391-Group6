package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.impl;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.HealthCheckResultSummaryDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.HealthCheckResultDetailDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.exception.ResourceNotFoundException;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.exception.ForbiddenAccessException;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.*;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.HealthCheckResultRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IParentHealthCheckResultService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Period;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service implementation for parent health check result operations
 */
@Service
@RequiredArgsConstructor
public class ParentHealthCheckResultService implements IParentHealthCheckResultService {
    
    private final HealthCheckResultRepository healthCheckResultRepository;
    
    @Override
    public List<HealthCheckResultSummaryDTO> getAllHealthCheckResultsForParent(User parent) {
        // Validate parent role
        if (!parent.getRole().getRoleName().equals("PARENT")) {
            throw new ForbiddenAccessException("Only parents can access health check results");
        }
        
        // Get all health check results for parent's children
        List<HealthCheckResult> results = healthCheckResultRepository.findByParent(parent);
        
        // Convert to summary DTOs
        return results.stream()
                .map(this::convertToSummaryDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public HealthCheckResultDetailDTO getHealthCheckResultDetail(Long resultId, User parent) {
        // Validate parent role
        if (!parent.getRole().getRoleName().equals("PARENT")) {
            throw new ForbiddenAccessException("Only parents can access health check results");
        }
        
        // Get health check result by ID and verify parent access
        HealthCheckResult result = healthCheckResultRepository.findByIdAndParent(resultId, parent)
                .orElseThrow(() -> new ResourceNotFoundException("Health check result not found or access denied"));
        
        // Convert to detailed DTO
        return convertToDetailDTO(result);
    }
    
    /**
     * Convert HealthCheckResult to summary DTO
     */
    private HealthCheckResultSummaryDTO convertToSummaryDTO(HealthCheckResult result) {
        HealthCheckResultSummaryDTO dto = new HealthCheckResultSummaryDTO();
        
        // Basic result information
        dto.setResultId(result.getId());
        dto.setStudentId(result.getStudent().getStudentID());
        dto.setStudentName(result.getStudent().getFullName());
        dto.setStudentClass(result.getStudent().getClassName());
        dto.setSchoolYear(result.getStudent().getSchoolYear());
        
        // Campaign information
        dto.setCampaignName(result.getForm().getCampaign().getName());
        dto.setCampaignDescription(result.getForm().getCampaign().getDescription());
        dto.setLocation(result.getForm().getCampaign().getLocation());
        
        // Health check details
        dto.setCategory(result.getCategory().toString());
        dto.setStatus(result.getStatus().toString());
        dto.setAbnormal(result.isAbnormal());
        dto.setWeight(result.getWeight());
        dto.setHeight(result.getHeight());
        dto.setBmi(result.getBmi());
        dto.setResultNotes(result.getResultNotes());
        dto.setPerformedAt(result.getPerformedAt());
        dto.setHasRecommendations(result.getRecommendations() != null && !result.getRecommendations().isEmpty());
        dto.setOverallStatus(result.getStatus().toString());
        
        return dto;
    }
    
    /**
     * Convert HealthCheckResult to detailed DTO
     */
    private HealthCheckResultDetailDTO convertToDetailDTO(HealthCheckResult result) {
        HealthCheckResultDetailDTO dto = new HealthCheckResultDetailDTO();
        
        // Basic information
        dto.setResultId(result.getId());
        dto.setStudentId(result.getStudent().getStudentID());
        dto.setStudentName(result.getStudent().getFullName());
        dto.setStudentClass(result.getStudent().getClassName());
        dto.setSchoolYear(result.getStudent().getSchoolYear());
        dto.setDateOfBirth(result.getStudent().getDob());
        // Calculate student age
        if (result.getStudent().getDob() != null) {
            dto.setStudentAge(Period.between(result.getStudent().getDob(), 
                    result.getPerformedAt().toLocalDate()).getYears());
        }
        
        // Campaign information
        dto.setCampaignId(result.getForm().getCampaign().getId());
        dto.setCampaignName(result.getForm().getCampaign().getName());
        dto.setCampaignDescription(result.getForm().getCampaign().getDescription());
        dto.setLocation(result.getForm().getCampaign().getLocation());
        
        // Health check details
        dto.setCategory(result.getCategory().toString());
        dto.setStatus(result.getStatus().toString());
        dto.setAbnormal(result.isAbnormal());
        dto.setWeight(result.getWeight());
        dto.setHeight(result.getHeight());
        dto.setBmi(result.getBmi());
        dto.setResultNotes(result.getResultNotes());
        dto.setRecommendations(result.getRecommendations());
        dto.setPerformedAt(result.getPerformedAt());
        
        // Nurse information
        dto.setNurseName(result.getNurse().getFirstName() + " " + result.getNurse().getLastName());
        
        // Category-specific details
        dto.setCategoryDetails(getCategorySpecificDetails(result));
        
        return dto;
    }
    
    /**
     * Get category-specific details for the health check result
     */
    private Map<String, Object> getCategorySpecificDetails(HealthCheckResult result) {
        Map<String, Object> details = new HashMap<>();
        
        switch (result.getCategory()) {
            case VISION:
                if (result.getVision() != null) {
                    Vision vision = result.getVision();
                    details.put("visionLeft", vision.getVisionLeft() + "/10");
                    details.put("visionRight", vision.getVisionRight() + "/10");
                    if (vision.getVisionLeftWithGlass() > 0) {
                        details.put("visionLeftWithGlass", vision.getVisionLeftWithGlass() + "/10");
                    }
                    if (vision.getVisionRightWithGlass() > 0) {
                        details.put("visionRightWithGlass", vision.getVisionRightWithGlass() + "/10");
                    }
                    details.put("needsGlasses", vision.isNeedsGlasses() ? "Có" : "Không");
                    details.put("description", vision.getVisionDescription());
                    details.put("recommendations", vision.getRecommendations());
                    details.put("status", vision.isAbnormal() ? "Cần theo dõi" : "Bình thường");
                    details.put("doctorName", vision.getDoctorName());
                }
                break;
                
            case HEARING:
                if (result.getHearing() != null) {
                    Hearing hearing = result.getHearing();
                    details.put("leftEar", hearing.getLeftEar());
                    details.put("rightEar", hearing.getRightEar());
                    details.put("description", hearing.getDescription());
                    details.put("recommendations", hearing.getRecommendations());
                    details.put("status", hearing.isAbnormal() ? "Cần theo dõi" : "Bình thường");
                    details.put("doctorName", hearing.getDoctorName());
                }
                break;
                
            case ORAL:
                if (result.getOral() != null) {
                    Oral oral = result.getOral();
                    details.put("teethCondition", oral.getTeethCondition());
                    details.put("gumsCondition", oral.getGumsCondition());
                    details.put("tongueCondition", oral.getTongueCondition());
                    details.put("description", oral.getDescription());
                    details.put("recommendations", oral.getRecommendations());
                    details.put("status", oral.isAbnormal() ? "Cần theo dõi" : "Bình thường");
                    details.put("doctorName", oral.getDoctorName());
                }
                break;
                
            case SKIN:
                if (result.getSkin() != null) {
                    Skin skin = result.getSkin();
                    details.put("skinColor", skin.getSkinColor());
                    details.put("rashes", skin.isRashes() ? "Có" : "Không");
                    details.put("lesions", skin.isLesions() ? "Có" : "Không");
                    details.put("dryness", skin.isDryness() ? "Có" : "Không");
                    details.put("eczema", skin.isEczema() ? "Có" : "Không");
                    details.put("psoriasis", skin.isPsoriasis() ? "Có" : "Không");
                    details.put("skinInfection", skin.isSkinInfection() ? "Có" : "Không");
                    details.put("allergies", skin.isAllergies() ? "Có" : "Không");
                    details.put("description", skin.getDescription());
                    details.put("treatment", skin.getTreatment());
                    details.put("recommendations", skin.getRecommendations());
                    details.put("status", skin.isAbnormal() ? "Cần theo dõi" : "Bình thường");
                    details.put("doctorName", skin.getDoctorName());
                }
                break;
                
            case RESPIRATORY:
                if (result.getRespiratory() != null) {
                    Respiratory respiratory = result.getRespiratory();
                    details.put("breathingRate", respiratory.getBreathingRate());
                    details.put("breathingSound", respiratory.getBreathingSound());
                    details.put("wheezing", respiratory.isWheezing() ? "Có" : "Không");
                    details.put("cough", respiratory.isCough() ? "Có" : "Không");
                    details.put("breathingDifficulty", respiratory.isBreathingDifficulty() ? "Có" : "Không");
                    details.put("description", respiratory.getDescription());
                    details.put("recommendations", respiratory.getRecommendations());
                    details.put("status", respiratory.isAbnormal() ? "Cần theo dõi" : "Bình thường");
                    details.put("doctorName", respiratory.getDoctorName());
                }
                break;
        }
        
        return details;
    }
}

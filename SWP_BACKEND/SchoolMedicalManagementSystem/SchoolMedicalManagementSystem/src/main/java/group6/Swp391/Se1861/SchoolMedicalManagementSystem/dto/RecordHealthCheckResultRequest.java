package group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RecordHealthCheckResultRequest {
    private Long studentId;
    private Long campaignId;
    private List<CategoryResult> categories;
    private Double weight; // Student weight in kg
    private Double height; // Student height in cm
    private Map<String, Object> detailedResults; // Detailed form data for each category
    
    // Additional fields for frontend compatibility
    private Boolean isComprehensiveSubmission; // Flag indicating this is a single comprehensive submission
    private String primaryCategory; // The primary category selected for submission
    private Map<String, Object> categorySelectionInfo; // Information about category selection for user feedback
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CategoryResult {
        private String category; // HealthCheckCategory enum value
        private String status; // NORMAL, ABNORMAL, NEEDS_FOLLOWUP, NEEDS_TREATMENT
        private String notes; // Additional notes
    }
}

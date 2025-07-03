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
    private Map<String, Object> detailedResults; // Detailed form data for each category
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CategoryResult {
        private String category; // HealthCheckCategory enum value
        private String status; // NORMAL, ABNORMAL, NEEDS_FOLLOWUP, NEEDS_TREATMENT
        private String notes; // Additional notes
    }
}

package group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardFilterDTO {
    private String filterType; // "daily", "monthly", "yearly", "range"
    private String date; // Format: YYYY-MM-DD for daily
    private String month; // Format: YYYY-MM for monthly  
    private String year; // Format: YYYY for yearly
    private String startDate; // Format: YYYY-MM-DD for date range
    private String endDate; // Format: YYYY-MM-DD for date range
    
    // Validation helpers
    public boolean isDailyFilter() {
        return "daily".equals(filterType) && date != null;
    }
    
    public boolean isMonthlyFilter() {
        return "monthly".equals(filterType) && month != null;
    }
    
    public boolean isYearlyFilter() {
        return "yearly".equals(filterType) && year != null;
    }
    
    public boolean isRangeFilter() {
        return "range".equals(filterType) && startDate != null && endDate != null;
    }
}

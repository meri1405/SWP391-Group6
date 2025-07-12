package group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SchoolNurseStatsDTO {
    
    // Medication Request Statistics
    private MedicationRequestStats medicationRequests;
    
    // Medication Intake Tracking
    private MedicationIntakeStats medicationIntake;
    
    // Medical Events Statistics
    private MedicalEventStats medicalEvents;
    
    // Medical Inventory Statistics
    private MedicalInventoryStats medicalInventory;
    
    // Supply Requests Statistics
    private SupplyRequestStats supplyRequests;
    
    // Vaccination Campaigns Statistics
    private VaccinationCampaignStats vaccinationCampaigns;
    
    // Health Check Campaigns Statistics
    private HealthCheckCampaignStats healthCheckCampaigns;
    
    // Health Profiles Statistics
    private HealthProfileStats healthProfiles;
    
    // Filter information
    private String filterType; // "daily", "monthly", "yearly", "range"
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer year;
    private Integer month;
    
    // Chart data for trends (optional)
    private List<ChartDataPoint> chartData;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MedicationRequestStats {
        private Long totalRequests;
        private Long approvedRequests;
        private Long rejectedRequests;
        private Long pendingRequests;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MedicationIntakeStats {
        private Long missedDoses;
        private Long takenDoses;
        private Long pendingDoses;
        private Long totalDoses;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MedicalEventStats {
        private Long totalEvents;
        private Long resolvedEvents;
        private Long pendingEvents;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MedicalInventoryStats {
        private Long totalSupplies;
        private Long lowStockSupplies;
        private Long expiringSoonSupplies;
        private Long expiredSupplies;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SupplyRequestStats {
        private Long totalRequests;
        private Long pendingRequests;
        private Long approvedRequests;
        private Long rejectedRequests;
        private Long completedRequests;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VaccinationCampaignStats {
        private Long totalCampaigns;
        private Long rejectedCampaigns;
        private Long approvedCampaigns;
        private Long inProgressCampaigns;
        private Long completedCampaigns;
        private Long pendingCampaigns;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HealthCheckCampaignStats {
        private Long totalCampaigns;
        private Long rejectedCampaigns;
        private Long approvedCampaigns;
        private Long inProgressCampaigns;
        private Long completedCampaigns;
        private Long pendingCampaigns;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HealthProfileStats {
        private Long pendingProfiles;
        private Long approvedProfiles;
        private Long rejectedProfiles;
        private Long studentsWithoutProfiles;
        private Long totalProfiles;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChartDataPoint {
        private String label; // Date, month, or period label
        private String category; // Type of data
        private Long value;
        private Map<String, Object> metadata; // Additional data for complex charts
    }
}

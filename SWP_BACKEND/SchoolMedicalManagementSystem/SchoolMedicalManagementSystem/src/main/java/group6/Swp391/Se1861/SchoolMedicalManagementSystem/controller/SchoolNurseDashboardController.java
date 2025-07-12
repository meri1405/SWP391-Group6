package group6.Swp391.Se1861.SchoolMedicalManagementSystem.controller;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.DashboardFilterDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.SchoolNurseStatsDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.SchoolNurseDashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/nurse/dashboard")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class SchoolNurseDashboardController {
    
    private final SchoolNurseDashboardService dashboardService;
    
    /**
     * Get comprehensive dashboard statistics for school nurse
     * 
     * @param filterType Filter type: "daily", "monthly", "yearly", "range", or null for all-time
     * @param date Date for daily filter (YYYY-MM-DD)
     * @param month Month for monthly filter (YYYY-MM)
     * @param year Year for yearly filter (YYYY)
     * @param startDate Start date for range filter (YYYY-MM-DD)
     * @param endDate End date for range filter (YYYY-MM-DD)
     * @return Dashboard statistics DTO
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('SCHOOLNURSE')")
    public ResponseEntity<SchoolNurseStatsDTO> getDashboardStatistics(
            @RequestParam(value = "filterType", required = false) String filterType,
            @RequestParam(value = "date", required = false) String date,
            @RequestParam(value = "month", required = false) String month,
            @RequestParam(value = "year", required = false) String year,
            @RequestParam(value = "startDate", required = false) String startDate,
            @RequestParam(value = "endDate", required = false) String endDate) {
        
        log.info("Getting dashboard statistics with filter: filterType={}, date={}, month={}, year={}, startDate={}, endDate={}", 
                filterType, date, month, year, startDate, endDate);
        
        DashboardFilterDTO filter = new DashboardFilterDTO();
        filter.setFilterType(filterType); // Can be null for all-time statistics
        filter.setDate(date);
        filter.setMonth(month);
        filter.setYear(year);
        filter.setStartDate(startDate);
        filter.setEndDate(endDate);
        
        // Validate filter parameters
        if (!isValidFilter(filter)) {
            log.warn("Invalid filter parameters provided");
            return ResponseEntity.badRequest().build();
        }
        
        SchoolNurseStatsDTO stats = dashboardService.getDashboardStatistics(filter);
        return ResponseEntity.ok(stats);
    }
    
    /**
     * Get today's dashboard statistics (convenience endpoint)
     */
    @GetMapping("/statistics/today")
    @PreAuthorize("hasRole('SCHOOLNURSE')")
    public ResponseEntity<SchoolNurseStatsDTO> getTodayStatistics() {
        DashboardFilterDTO filter = new DashboardFilterDTO();
        filter.setFilterType("daily");
        filter.setDate(LocalDate.now().toString());
        
        SchoolNurseStatsDTO stats = dashboardService.getDashboardStatistics(filter);
        return ResponseEntity.ok(stats);
    }
    
    /**
     * Get this month's dashboard statistics (convenience endpoint)
     */
    @GetMapping("/statistics/month")
    @PreAuthorize("hasRole('SCHOOLNURSE')")
    public ResponseEntity<SchoolNurseStatsDTO> getMonthStatistics() {
        DashboardFilterDTO filter = new DashboardFilterDTO();
        filter.setFilterType("monthly");
        filter.setMonth(LocalDate.now().getYear() + "-" + String.format("%02d", LocalDate.now().getMonthValue()));
        
        SchoolNurseStatsDTO stats = dashboardService.getDashboardStatistics(filter);
        return ResponseEntity.ok(stats);
    }
    
    /**
     * Get this year's dashboard statistics (convenience endpoint)
     */
    @GetMapping("/statistics/year")
    @PreAuthorize("hasRole('SCHOOLNURSE')")
    public ResponseEntity<SchoolNurseStatsDTO> getYearStatistics() {
        DashboardFilterDTO filter = new DashboardFilterDTO();
        filter.setFilterType("yearly");
        filter.setYear(String.valueOf(LocalDate.now().getYear()));
        
        SchoolNurseStatsDTO stats = dashboardService.getDashboardStatistics(filter);
        return ResponseEntity.ok(stats);
    }
    
    /**
     * Get all-time dashboard statistics (no date filter)
     */
    @GetMapping("/statistics/all-time")
    @PreAuthorize("hasRole('SCHOOLNURSE')")
    public ResponseEntity<SchoolNurseStatsDTO> getAllTimeStatistics() {
        log.info("Getting all-time statistics (no date filter)");
        
        DashboardFilterDTO filter = new DashboardFilterDTO();
        // No filter type means all-time statistics
        filter.setFilterType(null); // Explicitly set to null for all-time
        
        SchoolNurseStatsDTO stats = dashboardService.getDashboardStatistics(filter);
        return ResponseEntity.ok(stats);
    }
    
    /**
     * Get simple all-time dashboard statistics (alternative endpoint)
     */
    @GetMapping("/statistics/simple")
    @PreAuthorize("hasRole('SCHOOLNURSE')")
    public ResponseEntity<SchoolNurseStatsDTO> getSimpleStatistics() {
        log.info("Getting simple all-time statistics");
        
        // Call the main statistics endpoint with no filter
        return getDashboardStatistics(null, null, null, null, null, null);
    }
    
    /**
     * Validate filter parameters
     */
    private boolean isValidFilter(DashboardFilterDTO filter) {
        String filterType = filter.getFilterType();
        
        // Null filter type is valid for all-time statistics
        if (filterType == null || filterType.trim().isEmpty()) {
            log.info("No filter type provided - using all-time statistics");
            return true;
        }
        
        switch (filterType.toLowerCase()) {
            case "daily":
                return filter.getDate() != null && !filter.getDate().trim().isEmpty();
            case "monthly":
                return filter.getMonth() != null && !filter.getMonth().trim().isEmpty();
            case "yearly":
                return filter.getYear() != null && !filter.getYear().trim().isEmpty();
            case "range":
                return filter.getStartDate() != null && !filter.getStartDate().trim().isEmpty() &&
                       filter.getEndDate() != null && !filter.getEndDate().trim().isEmpty();
            default:
                log.warn("Unknown filter type: {}", filterType);
                return false;
        }
    }
}

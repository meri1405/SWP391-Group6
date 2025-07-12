package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.DashboardFilterDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.SchoolNurseStatsDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.*;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.RestockRequest;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.VaccinationCampaign;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.HealthCheckCampaign;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class SchoolNurseDashboardService {
    
    private final MedicationRequestRepository medicationRequestRepository;
    private final MedicationScheduleRepository medicationScheduleRepository;
    private final MedicalEventRepository medicalEventRepository;
    private final MedicalSupplyRepository medicalSupplyRepository;
    private final RestockRequestRepository restockRequestRepository;
    private final VaccinationCampaignRepository vaccinationCampaignRepository;
    private final HealthCheckCampaignRepository healthCheckCampaignRepository;
    private final HealthProfileRepository healthProfileRepository;
    private final StudentRepository studentRepository;
    
    public SchoolNurseStatsDTO getDashboardStatistics(DashboardFilterDTO filter) {
        log.info("Generating dashboard statistics with filter: {}", filter);
        
        LocalDateTime startDateTime = getStartDateTime(filter);
        LocalDateTime endDateTime = getEndDateTime(filter);
        
        log.info("Date range calculated: startDateTime={}, endDateTime={}", startDateTime, endDateTime);
        
        SchoolNurseStatsDTO stats = new SchoolNurseStatsDTO();
        
        // Set filter information
        stats.setFilterType(filter.getFilterType());
        if (startDateTime != null) stats.setStartDate(startDateTime.toLocalDate());
        if (endDateTime != null) stats.setEndDate(endDateTime.toLocalDate());
        
        // Generate all statistics
        stats.setMedicationRequests(getMedicationRequestStats(startDateTime, endDateTime));
        stats.setMedicationIntake(getMedicationIntakeStats(startDateTime, endDateTime));
        stats.setMedicalEvents(getMedicalEventStats(startDateTime, endDateTime));
        stats.setMedicalInventory(getMedicalInventoryStats());
        stats.setSupplyRequests(getSupplyRequestStats(startDateTime, endDateTime));
        stats.setVaccinationCampaigns(getVaccinationCampaignStats(startDateTime, endDateTime));
        stats.setHealthCheckCampaigns(getHealthCheckCampaignStats(startDateTime, endDateTime));
        stats.setHealthProfiles(getHealthProfileStats(startDateTime, endDateTime));
        
        log.info("Generated statistics: {}", stats);
        
        return stats;
    }
    
    private SchoolNurseStatsDTO.MedicationRequestStats getMedicationRequestStats(LocalDateTime start, LocalDateTime end) {
        Long total = countByDateRange(start, end, 
            () -> medicationRequestRepository.count(),
            () -> medicationRequestRepository.countByRequestDateBetween(start.toLocalDate(), end.toLocalDate()));
            
        Long approved = countByDateRange(start, end,
            () -> medicationRequestRepository.countByStatus("APPROVED"),
            () -> medicationRequestRepository.countByStatusAndRequestDateBetween("APPROVED", start.toLocalDate(), end.toLocalDate()));
            
        Long rejected = countByDateRange(start, end,
            () -> medicationRequestRepository.countByStatus("REJECTED"),
            () -> medicationRequestRepository.countByStatusAndRequestDateBetween("REJECTED", start.toLocalDate(), end.toLocalDate()));
            
        Long pending = countByDateRange(start, end,
            () -> medicationRequestRepository.countByStatus("PENDING"),
            () -> medicationRequestRepository.countByStatusAndRequestDateBetween("PENDING", start.toLocalDate(), end.toLocalDate()));
        
        return new SchoolNurseStatsDTO.MedicationRequestStats(total, approved, rejected, pending);
    }
    
    private SchoolNurseStatsDTO.MedicationIntakeStats getMedicationIntakeStats(LocalDateTime start, LocalDateTime end) {
        Long missed = countByDateRange(start, end,
            () -> medicationScheduleRepository.countByStatus(MedicationStatus.SKIPPED),
            () -> medicationScheduleRepository.countByStatusAndScheduledDateBetween(MedicationStatus.SKIPPED, start.toLocalDate(), end.toLocalDate()));
            
        Long taken = countByDateRange(start, end,
            () -> medicationScheduleRepository.countByStatus(MedicationStatus.TAKEN),
            () -> medicationScheduleRepository.countByStatusAndScheduledDateBetween(MedicationStatus.TAKEN, start.toLocalDate(), end.toLocalDate()));
            
        Long pending = countByDateRange(start, end,
            () -> medicationScheduleRepository.countByStatus(MedicationStatus.PENDING),
            () -> medicationScheduleRepository.countByStatusAndScheduledDateBetween(MedicationStatus.PENDING, start.toLocalDate(), end.toLocalDate()));
        
        Long total = missed + taken + pending;
        
        return new SchoolNurseStatsDTO.MedicationIntakeStats(missed, taken, pending, total);
    }
    
    private SchoolNurseStatsDTO.MedicalEventStats getMedicalEventStats(LocalDateTime start, LocalDateTime end) {
        Long total = countByDateRange(start, end,
            () -> medicalEventRepository.count(),
            () -> medicalEventRepository.countByCreatedAtBetween(start, end));
            
        Long resolved = countByDateRange(start, end,
            () -> medicalEventRepository.countByProcessed(true),
            () -> medicalEventRepository.countByProcessedAndCreatedAtBetween(true, start, end));
            
        Long pending = total - resolved;
        
        return new SchoolNurseStatsDTO.MedicalEventStats(total, resolved, pending);
    }
    
    private SchoolNurseStatsDTO.MedicalInventoryStats getMedicalInventoryStats() {
        Long total = medicalSupplyRepository.count();
        Long lowStock = medicalSupplyRepository.countLowStockItems();
        
        LocalDate thirtyDaysFromNow = LocalDate.now().plusDays(30);
        Long expiringSoon = medicalSupplyRepository.countExpiringSoon(thirtyDaysFromNow);
        
        LocalDate today = LocalDate.now();
        Long expired = medicalSupplyRepository.countExpired();
        
        return new SchoolNurseStatsDTO.MedicalInventoryStats(total, lowStock, expiringSoon, expired);
    }
    
    private SchoolNurseStatsDTO.SupplyRequestStats getSupplyRequestStats(LocalDateTime start, LocalDateTime end) {
        Long total = countByDateRange(start, end,
            () -> restockRequestRepository.count(),
            () -> restockRequestRepository.countByRequestDateBetween(start, end));
            
        Long pending = countByDateRange(start, end,
            () -> restockRequestRepository.countByStatus(RestockRequest.RestockStatus.PENDING),
            () -> restockRequestRepository.countByStatusAndRequestDateBetween(RestockRequest.RestockStatus.PENDING, start, end));
            
        Long approved = countByDateRange(start, end,
            () -> restockRequestRepository.countByStatus(RestockRequest.RestockStatus.APPROVED),
            () -> restockRequestRepository.countByStatusAndRequestDateBetween(RestockRequest.RestockStatus.APPROVED, start, end));
            
        Long rejected = countByDateRange(start, end,
            () -> restockRequestRepository.countByStatus(RestockRequest.RestockStatus.REJECTED),
            () -> restockRequestRepository.countByStatusAndRequestDateBetween(RestockRequest.RestockStatus.REJECTED, start, end));
            
        Long completed = countByDateRange(start, end,
            () -> restockRequestRepository.countByStatus(RestockRequest.RestockStatus.COMPLETED),
            () -> restockRequestRepository.countByStatusAndRequestDateBetween(RestockRequest.RestockStatus.COMPLETED, start, end));
        
        return new SchoolNurseStatsDTO.SupplyRequestStats(total, pending, approved, rejected, completed);
    }
    
    private SchoolNurseStatsDTO.VaccinationCampaignStats getVaccinationCampaignStats(LocalDateTime start, LocalDateTime end) {
        Long total = countByDateRange(start, end,
            () -> vaccinationCampaignRepository.count(),
            () -> vaccinationCampaignRepository.countByCreatedDateBetween(start, end));
            
        Long rejected = countByDateRange(start, end,
            () -> vaccinationCampaignRepository.countByStatus(VaccinationCampaign.CampaignStatus.REJECTED),
            () -> vaccinationCampaignRepository.countByStatusAndCreatedDateBetween(VaccinationCampaign.CampaignStatus.REJECTED, start, end));
            
        Long approved = countByDateRange(start, end,
            () -> vaccinationCampaignRepository.countByStatus(VaccinationCampaign.CampaignStatus.APPROVED),
            () -> vaccinationCampaignRepository.countByStatusAndCreatedDateBetween(VaccinationCampaign.CampaignStatus.APPROVED, start, end));
            
        Long inProgress = countByDateRange(start, end,
            () -> vaccinationCampaignRepository.countByStatus(VaccinationCampaign.CampaignStatus.IN_PROGRESS),
            () -> vaccinationCampaignRepository.countByStatusAndCreatedDateBetween(VaccinationCampaign.CampaignStatus.IN_PROGRESS, start, end));
            
        Long completed = countByDateRange(start, end,
            () -> vaccinationCampaignRepository.countByStatus(VaccinationCampaign.CampaignStatus.COMPLETED),
            () -> vaccinationCampaignRepository.countByStatusAndCreatedDateBetween(VaccinationCampaign.CampaignStatus.COMPLETED, start, end));
            
        Long pending = countByDateRange(start, end,
            () -> vaccinationCampaignRepository.countByStatus(VaccinationCampaign.CampaignStatus.PENDING),
            () -> vaccinationCampaignRepository.countByStatusAndCreatedDateBetween(VaccinationCampaign.CampaignStatus.PENDING, start, end));
        
        return new SchoolNurseStatsDTO.VaccinationCampaignStats(total, rejected, approved, inProgress, completed, pending);
    }
    
    private SchoolNurseStatsDTO.HealthCheckCampaignStats getHealthCheckCampaignStats(LocalDateTime start, LocalDateTime end) {
        Long total = countByDateRange(start, end,
            () -> healthCheckCampaignRepository.count(),
            () -> healthCheckCampaignRepository.countByCreatedAtBetween(start, end));
            
        Long rejected = countByDateRange(start, end,
            () -> healthCheckCampaignRepository.countByStatus(CampaignStatus.CANCELED),
            () -> healthCheckCampaignRepository.countByStatusAndCreatedAtBetween(CampaignStatus.CANCELED, start, end));
            
        Long approved = countByDateRange(start, end,
            () -> healthCheckCampaignRepository.countByStatus(CampaignStatus.APPROVED),
            () -> healthCheckCampaignRepository.countByStatusAndCreatedAtBetween(CampaignStatus.APPROVED, start, end));
            
        Long inProgress = countByDateRange(start, end,
            () -> healthCheckCampaignRepository.countByStatus(CampaignStatus.IN_PROGRESS),
            () -> healthCheckCampaignRepository.countByStatusAndCreatedAtBetween(CampaignStatus.IN_PROGRESS, start, end));
            
        Long completed = countByDateRange(start, end,
            () -> healthCheckCampaignRepository.countByStatus(CampaignStatus.COMPLETED),
            () -> healthCheckCampaignRepository.countByStatusAndCreatedAtBetween(CampaignStatus.COMPLETED, start, end));
            
        Long pending = countByDateRange(start, end,
            () -> healthCheckCampaignRepository.countByStatus(CampaignStatus.PENDING),
            () -> healthCheckCampaignRepository.countByStatusAndCreatedAtBetween(CampaignStatus.PENDING, start, end));
        
        return new SchoolNurseStatsDTO.HealthCheckCampaignStats(total, rejected, approved, inProgress, completed, pending);
    }
    
    private SchoolNurseStatsDTO.HealthProfileStats getHealthProfileStats(LocalDateTime start, LocalDateTime end) {
        Long pending = countByDateRange(start, end,
            () -> healthProfileRepository.countByStatus(ProfileStatus.PENDING),
            () -> healthProfileRepository.countByStatusAndCreatedAtBetween(ProfileStatus.PENDING, start.toLocalDate(), end.toLocalDate()));
            
        Long approved = countByDateRange(start, end,
            () -> healthProfileRepository.countByStatus(ProfileStatus.APPROVED),
            () -> healthProfileRepository.countByStatusAndCreatedAtBetween(ProfileStatus.APPROVED, start.toLocalDate(), end.toLocalDate()));
            
        Long rejected = countByDateRange(start, end,
            () -> healthProfileRepository.countByStatus(ProfileStatus.REJECTED),
            () -> healthProfileRepository.countByStatusAndCreatedAtBetween(ProfileStatus.REJECTED, start.toLocalDate(), end.toLocalDate()));
        
        Long totalProfiles = pending + approved + rejected;
        
        // Students without health profiles (this is independent of date range)
        Long totalStudents = studentRepository.count();
        Long studentsWithProfiles = healthProfileRepository.countDistinctStudents();
        Long studentsWithoutProfiles = totalStudents - studentsWithProfiles;
        
        return new SchoolNurseStatsDTO.HealthProfileStats(pending, approved, rejected, studentsWithoutProfiles, totalProfiles);
    }
    
    // Utility methods
    private Long countByDateRange(LocalDateTime start, LocalDateTime end, 
                                 java.util.function.Supplier<Long> totalCountSupplier,
                                 java.util.function.Supplier<Long> dateRangeCountSupplier) {
        log.debug("countByDateRange called with start={}, end={}", start, end);
        
        if (start == null || end == null) {
            Long totalCount = totalCountSupplier.get();
            log.debug("Using total count (no date filter): {}", totalCount);
            return totalCount;
        } else {
            Long dateRangeCount = dateRangeCountSupplier.get();
            log.debug("Using date range count (start={}, end={}): {}", start, end, dateRangeCount);
            return dateRangeCount;
        }
    }
    
    private LocalDateTime getStartDateTime(DashboardFilterDTO filter) {
        try {
            // Handle null filter or null filter type (all-time statistics)
            if (filter == null || filter.getFilterType() == null || filter.getFilterType().trim().isEmpty()) {
                log.info("No filter provided - returning null for all-time statistics");
                return null;
            }
            
            String filterType = filter.getFilterType().toLowerCase();
            switch (filterType) {
                case "daily":
                    if (filter.getDate() != null && !filter.getDate().trim().isEmpty()) {
                        return LocalDate.parse(filter.getDate(), DateTimeFormatter.ISO_LOCAL_DATE).atStartOfDay();
                    }
                    break;
                case "monthly":
                    if (filter.getMonth() != null && !filter.getMonth().trim().isEmpty()) {
                        String[] parts = filter.getMonth().split("-");
                        int year = Integer.parseInt(parts[0]);
                        int month = Integer.parseInt(parts[1]);
                        return LocalDate.of(year, month, 1).atStartOfDay();
                    }
                    break;
                case "yearly":
                    if (filter.getYear() != null && !filter.getYear().trim().isEmpty()) {
                        int year = Integer.parseInt(filter.getYear());
                        return LocalDate.of(year, 1, 1).atStartOfDay();
                    }
                    break;
                case "range":
                    if (filter.getStartDate() != null && !filter.getStartDate().trim().isEmpty()) {
                        return LocalDate.parse(filter.getStartDate(), DateTimeFormatter.ISO_LOCAL_DATE).atStartOfDay();
                    }
                    break;
                default:
                    log.warn("Unknown filter type: {}", filterType);
                    break;
            }
        } catch (DateTimeParseException | NumberFormatException e) {
            log.error("Error parsing date filter: {}", e.getMessage());
        }
        return null;
    }
    
    private LocalDateTime getEndDateTime(DashboardFilterDTO filter) {
        try {
            // Handle null filter or null filter type (all-time statistics)
            if (filter == null || filter.getFilterType() == null || filter.getFilterType().trim().isEmpty()) {
                log.info("No filter provided - returning null for all-time statistics");
                return null;
            }
            
            String filterType = filter.getFilterType().toLowerCase();
            switch (filterType) {
                case "daily":
                    if (filter.getDate() != null && !filter.getDate().trim().isEmpty()) {
                        return LocalDate.parse(filter.getDate(), DateTimeFormatter.ISO_LOCAL_DATE).atTime(23, 59, 59);
                    }
                    break;
                case "monthly":
                    if (filter.getMonth() != null && !filter.getMonth().trim().isEmpty()) {
                        String[] parts = filter.getMonth().split("-");
                        int year = Integer.parseInt(parts[0]);
                        int month = Integer.parseInt(parts[1]);
                        return LocalDate.of(year, month, 1).plusMonths(1).minusDays(1).atTime(23, 59, 59);
                    }
                    break;
                case "yearly":
                    if (filter.getYear() != null && !filter.getYear().trim().isEmpty()) {
                        int year = Integer.parseInt(filter.getYear());
                        return LocalDate.of(year, 12, 31).atTime(23, 59, 59);
                    }
                    break;
                case "range":
                    if (filter.getEndDate() != null && !filter.getEndDate().trim().isEmpty()) {
                        return LocalDate.parse(filter.getEndDate(), DateTimeFormatter.ISO_LOCAL_DATE).atTime(23, 59, 59);
                    }
                    break;
                default:
                    log.warn("Unknown filter type: {}", filterType);
                    break;
            }
        } catch (DateTimeParseException | NumberFormatException e) {
            log.error("Error parsing date filter: {}", e.getMessage());
        }
        return null;
    }
}

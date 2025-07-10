package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.impl;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IMedicationScheduleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.time.LocalDateTime;
import java.time.ZoneId;

/**
 * Service to automatically update overdue medication schedules
 * Runs periodically to check for schedules that are overdue based on configured threshold
 * Default threshold is 30 minutes but can be configured via application.properties
 */
@Service
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(name = "medication.schedule.auto-update.enabled", havingValue = "true", matchIfMissing = true)
public class MedicationScheduleAutoUpdateService {

    private final IMedicationScheduleService medicationScheduleService;
    
    @Value("${medication.schedule.overdue-threshold-minutes:30}")
    private int overdueThresholdMinutes;
    
    @Value("${app.timezone:Asia/Ho_Chi_Minh}")
    private String configuredTimezone;

    @PostConstruct
    public void init() {
        ZoneId appZoneId = ZoneId.of(configuredTimezone);
        log.info("Medication Schedule Auto-Update Service initialized");
        log.info("Auto-update enabled: true");
        log.info("Overdue threshold: {} minutes", overdueThresholdMinutes);
        log.info("Configured timezone: {}", configuredTimezone);
        log.info("System timezone: {}", ZoneId.systemDefault());
        log.info("Application timezone: {}", appZoneId);
        log.info("Service will run every 10 minutes and every 3 minutes during school hours (7AM-6PM, every day)");
    }

    /**
     * Automatically mark overdue medication schedules as SKIPPED
     * Runs every 10 minutes
     */
    @Scheduled(fixedRate = 600000) // 10 minutes = 600,000 milliseconds
    public void autoMarkOverdueSchedules() {
        try {
            
            int skippedCount = medicationScheduleService.autoMarkOverdueSchedulesAsSkipped();
            
        } catch (Exception e) {
            log.error("Error occurred during scheduled auto-update of medication schedules", e);
        }
    }

    /**
     * More frequent check during school hours (7 AM to 6 PM)
     * Runs every 3 minutes from 7 AM to 6 PM, Monday to Sunday
     */
    @Scheduled(cron = "0 */3 7-18 * * *") // Every 3 minutes from 7 AM to 6 PM, every day
    public void autoMarkOverdueSchedulesDuringSchoolHours() {
        try {
            int skippedCount = medicationScheduleService.autoMarkOverdueSchedulesAsSkipped();
            
        } catch (Exception e) {
            log.error("Error occurred during school hours auto-update", e);
        }
    }
} 
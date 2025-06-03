package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SchedulerService {

    private final MedicationRequestService medicationRequestService;    /**
     * Scheduled task to auto-reject expired medication requests
     * Runs every 15 minutes to check for requests older than 24 hours
     */
    @Scheduled(fixedRate = 900000) // Run every 15 minutes (900,000 milliseconds)
    public void autoRejectExpiredRequests() {
        try {
            int rejectedCount = medicationRequestService.autoRejectExpiredRequests();
            if (rejectedCount > 0) {
                System.out.println("Auto-rejected " + rejectedCount + " expired medication requests");
            }
        } catch (Exception e) {
            // Log error but don't throw exception to prevent scheduler from stopping
            System.err.println("Error during auto-rejection of expired requests: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
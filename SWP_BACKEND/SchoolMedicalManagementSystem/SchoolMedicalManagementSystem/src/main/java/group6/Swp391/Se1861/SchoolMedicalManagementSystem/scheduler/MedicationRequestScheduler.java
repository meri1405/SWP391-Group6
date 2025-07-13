package group6.Swp391.Se1861.SchoolMedicalManagementSystem.scheduler;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.impl.MedicationRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class MedicationRequestScheduler {

    private final MedicationRequestService medicationRequestService;

    /**
     * Auto-reject expired medication requests every hour
     * Runs at minute 0 of every hour
     */
    @Scheduled(cron = "0 0 * * * *")
    public void autoRejectExpiredRequests() {
        System.out.println("Running scheduled task: Auto-reject expired medication requests");
        try {
            medicationRequestService.autoRejectExpiredRequests();
            System.out.println("Completed scheduled task: Auto-reject expired medication requests");
        } catch (Exception e) {
            System.err.println("Error in scheduled task autoRejectExpiredRequests: " + e.getMessage());
            e.printStackTrace();
        }
    }
}

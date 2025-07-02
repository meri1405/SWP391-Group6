package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.impl;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IVaccinationFormService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class VaccinationScheduledTasks {

    private final IVaccinationFormService vaccinationFormService;

    /**
     * Scheduled task to mark expired vaccination forms
     * Runs every hour
     */
    @Scheduled(fixedRate = 3600000) // 1 hour = 3600000 milliseconds
    public void markExpiredVaccinationForms() {
        try {
            log.info("Starting scheduled task: markExpiredVaccinationForms");
            vaccinationFormService.markFormsAsExpired();
            log.info("Completed scheduled task: markExpiredVaccinationForms");
        } catch (Exception e) {
            log.error("Error in scheduled task markExpiredVaccinationForms: ", e);
        }
    }

    /**
     * Alternative scheduled task that runs daily at 2 AM
     * Uncomment this and comment the above if you prefer daily execution
     */
    // @Scheduled(cron = "0 0 2 * * ?") // Daily at 2 AM
    // public void markExpiredVaccinationFormsDaily() {
    //     try {
    //         log.info("Starting daily scheduled task: markExpiredVaccinationForms");
    //         vaccinationFormService.markFormsAsExpired();
    //         log.info("Completed daily scheduled task: markExpiredVaccinationForms");
    //     } catch (Exception e) {
    //         log.error("Error in daily scheduled task markExpiredVaccinationForms: ", e);
    //     }
    // }
}

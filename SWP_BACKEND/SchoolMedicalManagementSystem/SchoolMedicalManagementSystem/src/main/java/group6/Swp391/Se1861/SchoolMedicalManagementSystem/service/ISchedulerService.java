package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service;

public interface ISchedulerService {
    
    /**
     * Scheduled task to auto-reject expired medication requests
     * Runs every 15 minutes to check for requests older than 24 hours
     */
    void autoRejectExpiredRequests();
}

package group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums;

public enum CampaignStatus {
    DRAFT,        // Initial status when nurse creates campaign
    PENDING,      // Submitted to manager for approval
    APPROVED,     // Approved by manager
    SCHEDULED,    // Nurse has scheduled and prepared student list
    IN_PROGRESS,  // Checkups are being performed
    COMPLETED,    // All checkups are completed
    CANCELED      // Campaign was canceled
}

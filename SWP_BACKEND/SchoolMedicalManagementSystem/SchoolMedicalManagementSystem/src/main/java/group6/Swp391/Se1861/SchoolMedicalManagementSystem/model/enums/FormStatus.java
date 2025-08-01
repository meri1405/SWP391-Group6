package group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums;

public enum FormStatus {
    PENDING,     // Form sent to parent but no response yet
    CONFIRMED,   // Parent confirmed student participation
    DECLINED,    // Parent declined student participation
    NO_FORM,     // For students who don't have a form yet
    COMPLETED,   // Health check has been completed
    CANCELED     // Form was canceled (e.g., student absent)
}

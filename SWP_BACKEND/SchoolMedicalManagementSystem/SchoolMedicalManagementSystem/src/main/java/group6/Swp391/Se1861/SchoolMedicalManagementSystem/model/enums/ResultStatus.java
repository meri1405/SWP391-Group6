package group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums;

public enum ResultStatus {
    NORMAL,            // No health issues detected
    MINOR_CONCERN,     // Minor health issues that need monitoring
    NEEDS_ATTENTION,   // Health issues that need attention but not urgent
    REQUIRES_FOLLOWUP, // Health issues that need follow-up appointments
    URGENT             // Urgent health issues requiring immediate attention
}

package group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums;

public enum TimeSlot {
    MORNING("Sáng"),
    AFTERNOON("Chiều"),
    BOTH("Cả ngày");

    private final String displayName;

    TimeSlot(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}

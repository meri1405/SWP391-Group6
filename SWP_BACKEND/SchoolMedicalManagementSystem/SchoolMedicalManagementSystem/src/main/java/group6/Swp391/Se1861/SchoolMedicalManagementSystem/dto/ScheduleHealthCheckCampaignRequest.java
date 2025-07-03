package group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.TimeSlot;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ScheduleHealthCheckCampaignRequest {
    private Integer targetCount; // Optional, will calculate based on confirmed forms if not provided
    private TimeSlot timeSlot; // MORNING, AFTERNOON, or BOTH
    private String scheduleNotes; // Additional notes for the schedule (e.g., meeting point, special instructions)
}

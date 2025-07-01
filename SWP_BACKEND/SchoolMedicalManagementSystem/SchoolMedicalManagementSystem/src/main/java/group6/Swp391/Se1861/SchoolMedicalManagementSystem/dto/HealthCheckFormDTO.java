package group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.FormStatus;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class HealthCheckFormDTO {
    private Long id;
    private FormStatus status;
    private LocalDateTime sentAt;
    private LocalDateTime respondedAt;
    private String parentNote;
    private LocalDateTime appointmentTime;
    private String appointmentLocation;
    private boolean reminderSent;
    private boolean isCheckedIn;
    private LocalDateTime checkedInAt;

    // Campaign information
    private Long campaignId;
    private String campaignName;
    private String campaignDescription;
    private String campaignLocation;
    private String campaignStartDate;
    private String campaignEndDate;
    private List<String> campaignCategories;
    private String campaignNotes;

    // Student information
    private Long studentId;
    private String studentFirstName;
    private String studentLastName;
    private String studentDob;
    private String studentGender;
    private String studentClassName;

    // Parent information
    private Long parentId;
    private String parentFirstName;
    private String parentLastName;
    private String parentEmail;
    private String parentPhone;

    // Creator information
    private String campaignCreatedBy;
    private LocalDateTime campaignCreatedAt;
    private String campaignApprovedBy;
    private LocalDateTime campaignApprovedAt;
}

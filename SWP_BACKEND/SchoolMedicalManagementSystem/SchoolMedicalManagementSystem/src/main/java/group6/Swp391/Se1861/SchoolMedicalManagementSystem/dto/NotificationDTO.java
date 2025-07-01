package group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDTO {
    private Long id;
    private String title;
    private String message;
    private LocalDateTime createdAt;
    private boolean isRead;
    private String notificationType;
    private Long recipientId;
    private Long medicationRequestId;
    private Long medicationScheduleId;
    private Long medicalEventId;
    private Boolean confirm;
    private Long vaccinationFormId;
    private Long restockRequestId;
    private Long healthCheckFormId;
}

package group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConsultationDTO {

    private LocalDate consultationDate;
    private String consultationTime;
    private String consultationLocation;
    private boolean isOnline;
    private String meetingLink;
    private String meetingPassword;
}

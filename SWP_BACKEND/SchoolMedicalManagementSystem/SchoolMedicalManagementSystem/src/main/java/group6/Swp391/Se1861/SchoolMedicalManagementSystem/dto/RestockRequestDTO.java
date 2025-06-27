package group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.RestockRequest;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RestockRequestDTO {
    private Long id;
    private Long requestedBy;
    private String requestedByName;
    private Long reviewedBy;
    private String reviewedByName;
    private RestockRequest.RestockStatus status;
    private String priority;
    private String reason;
    private String reviewNotes;
    private LocalDateTime requestDate;
    private LocalDateTime reviewDate;
    private LocalDateTime completedDate;
    private List<RestockItemDTO> restockItems;
}

package group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for requesting to send health check results to parents
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SendHealthCheckResultsRequest {
    
    /**
     * The IDs of the students whose results should be sent
     * If empty, results for all students in the campaign will be sent
     */
    private List<Long> studentIds;
    
    /**
     * Optional custom message to include in the notification
     */
    private String customMessage;
}

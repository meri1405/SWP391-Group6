package group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for first-time login check
 * Includes current username for pre-filling in the frontend
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FirstTimeLoginResponse {
    
    private String message;
    private boolean requiresFirstTimeLogin;
    private String currentUsername;
    
    public FirstTimeLoginResponse(String message) {
        this.message = message;
        this.requiresFirstTimeLogin = false;
        this.currentUsername = null;
    }
}

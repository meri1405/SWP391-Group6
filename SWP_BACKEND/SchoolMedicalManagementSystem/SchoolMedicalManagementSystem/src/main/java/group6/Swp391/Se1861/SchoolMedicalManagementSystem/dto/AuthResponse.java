package group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AuthResponse {
    private String token;
    @Builder.Default
    private String tokenType = "Bearer";
    private Long id;
    private String username;
    private String firstName;
    private String lastName;
    private String email;
    private String roleName;
    private Boolean firstLogin;
    private Boolean needPasswordChange;

    public AuthResponse(String token, Long id, String username, String firstName, String lastName, String email, String roleName) {
        this.token = token;
        this.id = id;
        this.username = username;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.roleName = roleName;
        this.firstLogin = false;
        this.needPasswordChange = false;
    }

    public AuthResponse(String token, Long id, String username, String firstName, String lastName, String email, String roleName, Boolean firstLogin, Boolean needPasswordChange) {
        this.token = token;
        this.id = id;
        this.username = username;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.roleName = roleName;
        this.firstLogin = firstLogin;
        this.needPasswordChange = needPasswordChange;
    }
}

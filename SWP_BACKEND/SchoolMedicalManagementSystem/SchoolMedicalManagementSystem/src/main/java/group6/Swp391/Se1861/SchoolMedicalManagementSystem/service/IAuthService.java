package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.AuthResponse;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;

public interface IAuthService {
    AuthResponse authenticateUser(String username, String password);

    boolean requestOtp(String phoneNumber);

    AuthResponse authenticateWithOtp(String phoneNumber, String otp);

    AuthResponse processOAuth2Login(OAuth2AuthenticationToken authentication);

    User preprocessUserBeforeSave(User user);

    User saveUser(User user);

    User createUserByAdmin(User user, String roleName);

    boolean usernameExists(String username);

    String encodePassword(String rawPassword);

    boolean verifyPassword(String rawPassword, String encodedPassword);

    void logout(String authHeader);
}

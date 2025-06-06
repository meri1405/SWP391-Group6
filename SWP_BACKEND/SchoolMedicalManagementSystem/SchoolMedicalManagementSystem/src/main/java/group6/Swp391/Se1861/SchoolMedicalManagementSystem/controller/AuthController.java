package group6.Swp391.Se1861.SchoolMedicalManagementSystem.controller;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.*;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    /**
     * Login with username and password (for admin, manager, schoolnurse)
     */
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        AuthResponse authResponse = authService.authenticateUser(
                loginRequest.getUsername(),
                loginRequest.getPassword());

        return ResponseEntity.ok(authResponse);
    }

    /**
     * Request OTP for phone authentication (for parents)
     */
    @PostMapping("/parent/request-otp")
    public ResponseEntity<?> requestOtp(@Valid @RequestBody OtpRequest otpRequest) {
        boolean success = authService.requestOtp(otpRequest.getPhoneNumber());

        if (success) {
            return ResponseEntity.ok().body(new MessageResponse("OTP sent successfully"));
        } else {
            return ResponseEntity.internalServerError().body(new MessageResponse("Failed to send OTP"));
        }
    }

    /**
     * Verify OTP and authenticate parent
     */
    @PostMapping("/parent/verify-otp")
    public ResponseEntity<?> verifyOtp(@Valid @RequestBody OtpVerificationRequest request) {
        AuthResponse authResponse = authService.authenticateWithOtp(
                request.getPhoneNumber(),
                request.getOtp());

        return ResponseEntity.ok(authResponse);
    }

    /**
     * Handle OAuth2 authenticated users (Google login)
     * This works with Spring Security's OAuth2 workflow
     */
    @GetMapping("/oauth2/callback")
    public ResponseEntity<?> oauth2Callback(OAuth2AuthenticationToken authentication) {
        AuthResponse authResponse = authService.processOAuth2Login(authentication);
        return ResponseEntity.ok(authResponse);
    }

    /**
     * Logout user by invalidating token
     * Token expiration time is set to 30 minutes
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader("Authorization") String token) {
        authService.logout(token);
        return ResponseEntity.ok(new MessageResponse("Logged out successfully"));
    }
}

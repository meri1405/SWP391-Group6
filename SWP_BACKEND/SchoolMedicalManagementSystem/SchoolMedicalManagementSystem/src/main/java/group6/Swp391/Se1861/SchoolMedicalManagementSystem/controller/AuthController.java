package group6.Swp391.Se1861.SchoolMedicalManagementSystem.controller;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.*;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.AuthService;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.FirebaseOtpService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;
    
    @Autowired
    private FirebaseOtpService firebaseOtpService;
    
    @Value("${app.firebase.project-id:}")
    private String firebaseProjectId;

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

    /**
     * Get Firebase configuration for frontend
     */
    @GetMapping("/firebase-config")
    public ResponseEntity<FirebaseConfigResponse> getFirebaseConfig() {
        String webApiKey = firebaseOtpService.getWebApiKey();
        FirebaseConfigResponse config = new FirebaseConfigResponse(webApiKey, firebaseProjectId);
        return ResponseEntity.ok(config);
    }

    /**
     * Verify Firebase OTP and authenticate parent (new Firebase method)
     */
    @PostMapping("/parent/verify-firebase-otp")
    public ResponseEntity<?> verifyFirebaseOtp(@Valid @RequestBody FirebaseOtpVerificationRequest request) {
        try {
            // Try Firebase ID token verification first
            if (request.getFirebaseIdToken() != null && !request.getFirebaseIdToken().isEmpty()) {
                boolean isValidToken = firebaseOtpService.verifyFirebaseToken(
                    request.getFirebaseIdToken(), 
                    request.getPhoneNumber()
                );
                
                if (isValidToken) {
                    AuthResponse authResponse = authService.authenticateWithOtp(
                        request.getPhoneNumber(), 
                        "FIREBASE_VERIFIED" // Special marker for Firebase verification
                    );
                    return ResponseEntity.ok(authResponse);
                }
            }
            
            // Fallback to manual OTP verification if Firebase token fails
            if (request.getOtp() != null && !request.getOtp().isEmpty()) {
                AuthResponse authResponse = authService.authenticateWithOtp(
                    request.getPhoneNumber(),
                    request.getOtp()
                );
                return ResponseEntity.ok(authResponse);
            }
            
            return ResponseEntity.badRequest().body(new MessageResponse("Invalid verification data"));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }
}

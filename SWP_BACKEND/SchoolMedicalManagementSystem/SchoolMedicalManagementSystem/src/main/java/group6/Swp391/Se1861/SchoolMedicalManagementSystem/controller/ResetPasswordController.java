package group6.Swp391.Se1861.SchoolMedicalManagementSystem.controller;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.MessageResponse;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.PasswordResetRequest;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.ResetPasswordRequest;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.VerifyOtpRequest;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.UserRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IPasswordResetService;
import jakarta.validation.Valid;

import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for password reset functionality
 * Handles password reset requests, OTP verification, and password changes
 * Only available for ADMIN, MANAGER, SCHOOLNURSE roles
 */
@RestController
@RequestMapping("/api/password")
public class ResetPasswordController {

    private static final Logger logger = LoggerFactory.getLogger(ResetPasswordController.class);

    @Autowired
    private IPasswordResetService passwordResetService;

    @Autowired
    private UserRepository userRepository;

    /**
     * Request password reset through OTP
     * Validates email, generates OTP, and sends it to user's email
     *
     * @param request Contains the email address
     * @return Success/failure message
     */
    @PostMapping("/reset-request")
    public ResponseEntity<?> requestPasswordReset(@Valid @RequestBody PasswordResetRequest request) {
        logger.info("Password reset requested for email: {}", request.getEmail());
        
        Optional<User> user = userRepository.findByEmail(request.getEmail());
        if (!user.isPresent()) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("User not found"));
        }
        
        // Check if user is allowed to use password reset
        if (!passwordResetService.isUserAllowedForPasswordReset(request.getEmail())) {
            logger.warn("User with email {} not allowed to use password reset", request.getEmail());
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(new MessageResponse("This account is not eligible for password reset"));
        }

        // Request password reset
        boolean success = passwordResetService.requestPasswordReset(request.getEmail());
        
        if (success) {
            return ResponseEntity.ok(new MessageResponse("Password reset OTP has been sent to your email"));
        } else {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Failed to send OTP. Please try again later."));
        }
    }

    /**
     * Verify OTP sent to user's email
     *
     * @param request Contains email and OTP
     * @return Success/failure message
     */
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        logger.info("Verifying OTP for email: {}", request.getEmail());
        
        // Check if user is allowed to use password reset
        if (!passwordResetService.isUserAllowedForPasswordReset(request.getEmail())) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(new MessageResponse("This account is not eligible for password reset"));
        }

        // Verify OTP
        boolean valid = passwordResetService.verifyPasswordResetOtp(request.getEmail(), request.getOtp());
        
        if (valid) {
            return ResponseEntity.ok(new MessageResponse("OTP verified successfully"));
        } else {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse("Invalid or expired OTP"));
        }
    }

    /**
     * Reset password using verified OTP
     *
     * @param request Contains email, OTP, and new password
     * @return Success/failure message
     */
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        logger.info("Resetting password for email: {}", request.getEmail());
        
        // Check if user is allowed to use password reset
        

        if (!passwordResetService.isUserAllowedForPasswordReset(request.getEmail())) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(new MessageResponse("This account is not eligible for password reset"));
        }

        // Reset password
        boolean success = passwordResetService.resetPassword(
                request.getEmail(), 
                request.getOtp(), 
                request.getNewPassword());
        
        if (success) {
            return ResponseEntity.ok(new MessageResponse("Password reset successfully"));
        } else {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse("Failed to reset password. Invalid or expired OTP."));
        }
    }
} 
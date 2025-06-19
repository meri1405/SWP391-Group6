package group6.Swp391.Se1861.SchoolMedicalManagementSystem.controller;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IOtpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller dedicated to OTP generation operations
 * This controller will be accessible only through the dedicated OTP port
 */
@RestController
@RequestMapping("/api/otp")
public class OtpGenerationController {

    @Autowired
    private IOtpService otpService;

    /**
     * Generate and send OTP to the provided phone number
     *
     * @param request Contains the phone number to send OTP to
     * @return Success/failure response
     */
    @PostMapping("/generate")
    public ResponseEntity<Map<String, Object>> generateOtp(@RequestBody Map<String, String> request) {
        String phoneNumber = request.get("phoneNumber");
        Map<String, Object> response = new HashMap<>();

        if (phoneNumber == null || phoneNumber.isEmpty()) {
            response.put("success", false);
            response.put("message", "Phone number is required");
            return ResponseEntity.badRequest().body(response);
        }

        boolean success = otpService.generateAndSendOtp(phoneNumber);

        response.put("success", success);
        if (success) {
            response.put("message", "OTP sent successfully");
            return ResponseEntity.ok(response);
        } else {
            response.put("message", "Failed to send OTP");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Health check endpoint for the OTP service
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        Map<String, String> status = new HashMap<>();
        status.put("status", "UP");
        status.put("service", "OTP Generation Service");
        return ResponseEntity.ok(status);
    }
}

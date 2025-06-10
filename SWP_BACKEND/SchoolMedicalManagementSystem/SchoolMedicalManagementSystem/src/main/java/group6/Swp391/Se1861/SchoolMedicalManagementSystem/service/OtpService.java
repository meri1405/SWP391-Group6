package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * Wrapper service for backward compatibility
 * Delegates to FirebaseOtpService
 */
@Service
public class OtpService {
    
    @Autowired
    private FirebaseOtpService firebaseOtpService;
    
    /**
     * Generate and send OTP to a parent based on phone number
     */
    public boolean generateAndSendOtp(String phoneNumber) {
        return firebaseOtpService.generateAndSendOtp(phoneNumber);
    }
    
    /**
     * Verify OTP
     */
    public boolean verifyOtp(String phoneNumber, String otp) {
        return firebaseOtpService.verifyOtp(phoneNumber, otp);
    }
    
    /**
     * Clear expired OTPs from memory
     */
    public void clearExpiredOtps() {
        firebaseOtpService.clearExpiredOtps();
    }
}

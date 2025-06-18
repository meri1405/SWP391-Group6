package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.impl;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IFirebaseOtpService;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IOtpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * Wrapper service for backward compatibility
 * Delegates to FirebaseOtpService
 */
@Service
public class OtpService implements IOtpService {
    
    @Autowired
    private IFirebaseOtpService firebaseOtpService;
    
    /**
     * Generate and send OTP to a parent based on phone number
     */
    @Override
    public boolean generateAndSendOtp(String phoneNumber) {
        return firebaseOtpService.generateAndSendOtp(phoneNumber);
    }
    
    /**
     * Verify OTP
     */
    @Override
    public boolean verifyOtp(String phoneNumber, String otp) {
        return firebaseOtpService.verifyOtp(phoneNumber, otp);
    }
    
    /**
     * Clear expired OTPs from memory
     */
    @Override
    public void clearExpiredOtps() {
        firebaseOtpService.clearExpiredOtps();
    }
}

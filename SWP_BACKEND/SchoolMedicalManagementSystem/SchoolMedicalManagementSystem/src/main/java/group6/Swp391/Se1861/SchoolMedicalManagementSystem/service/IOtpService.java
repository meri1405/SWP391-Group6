package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service;

public interface IOtpService {
    
    /**
     * Generate and send OTP to a parent based on phone number
     */
    boolean generateAndSendOtp(String phoneNumber);
    
    /**
     * Verify OTP
     */
    boolean verifyOtp(String phoneNumber, String otp);

    void clearExpiredOtps();
}

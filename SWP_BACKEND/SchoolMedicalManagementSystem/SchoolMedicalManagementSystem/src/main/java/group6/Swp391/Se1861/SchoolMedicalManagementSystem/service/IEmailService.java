package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service;

public interface IEmailService {
    /**
     * Send a simple email message
     *
     * @param to      recipient email address
     * @param subject email subject
     * @param content email content (text)
     * @return true if email was sent successfully, false otherwise
     */
    boolean sendSimpleEmail(String to, String subject, String content);
    
    /**
     * Send a password reset OTP email
     *
     * @param to  recipient email address
     * @param otp the OTP code
     * @return true if email was sent successfully, false otherwise
     */
    boolean sendPasswordResetOtp(String to, String otp);
} 
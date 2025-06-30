package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service;

public interface IPasswordResetService {
    /**
     * Request a password reset for a user with the given email
     * Generates and sends OTP via email
     *
     * @param email the email address of the user requesting password reset
     * @return true if OTP was generated and sent successfully, false otherwise
     */
    boolean requestPasswordReset(String email);

    /**
     * Verify the OTP provided by the user for password reset
     *
     * @param email the email address of the user
     * @param otp   the OTP to verify
     * @return true if OTP is valid, false otherwise
     */
    boolean verifyPasswordResetOtp(String email, String otp);

    /**
     * Reset the password for a user after OTP verification
     *
     * @param email       the email address of the user
     * @param otp         the verified OTP
     * @param newPassword the new password
     * @return true if password was reset successfully, false otherwise
     */
    boolean resetPassword(String email, String otp, String newPassword);
    
    /**
     * Check if the user is allowed to use password reset feature
     * Only ADMIN, MANAGER, SCHOOLNURSE roles are allowed
     *
     * @param email the email address to check
     * @return true if the user is allowed to use password reset, false otherwise
     */
    boolean isUserAllowedForPasswordReset(String email);
} 
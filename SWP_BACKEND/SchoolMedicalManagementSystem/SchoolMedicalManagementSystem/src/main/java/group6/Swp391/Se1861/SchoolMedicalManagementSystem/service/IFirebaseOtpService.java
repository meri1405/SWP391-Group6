package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service;

public interface IFirebaseOtpService {

    boolean generateAndSendOtp(String phoneNumber);

    boolean verifyOtp(String phoneNumber, String otp);

    boolean verifyFirebaseToken(String idToken, String phoneNumber);

    void clearExpiredOtps();

    String getWebApiKey();

}

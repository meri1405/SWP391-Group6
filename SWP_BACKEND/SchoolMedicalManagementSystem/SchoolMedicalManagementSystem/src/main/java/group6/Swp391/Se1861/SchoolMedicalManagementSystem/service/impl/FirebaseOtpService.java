package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.impl;

import com.google.firebase.FirebaseApp;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.exception.AuthenticationException;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.UserRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IFirebaseOtpService;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class FirebaseOtpService implements IFirebaseOtpService {
    private static final Logger logger = LoggerFactory.getLogger(FirebaseOtpService.class);

    @Value("${app.firebase.project-id:}")
    private String firebaseProjectId;

    @Value("${app.firebase.web-api-key:}")
    private String firebaseWebApiKey;

    private final int OTP_VALIDITY_MINUTES = 5;
    private final Random random = new Random();

    // In-memory OTP storage for verification - key: phoneNumber, value: [OTP, ExpiryTime]
    private final Map<String, Object[]> otpStore = new ConcurrentHashMap<>();

    @Autowired
    private UserRepository userRepository;

    private FirebaseAuth firebaseAuth;

    @PostConstruct
    private void initFirebase() {
        try {
            if (FirebaseApp.getApps().isEmpty()) {
                logger.warn("Firebase not initialized with service account. OTP verification will use manual verification.");
            } else {
                firebaseAuth = FirebaseAuth.getInstance();
                logger.info("Firebase Auth initialized successfully");
            }
        } catch (Exception e) {
            logger.error("Failed to initialize Firebase Auth: {}", e.getMessage(), e);
        }
    }

    /**
     * Format phone number to ensure it has the country code
     */
    private String formatPhoneNumber(String phoneNumber) {
        if (phoneNumber == null || phoneNumber.isEmpty()) {
            return phoneNumber;
        }
        
        // Remove any spaces or special characters
        phoneNumber = phoneNumber.replaceAll("[^0-9+]", "");
        
        // If it doesn't start with +84, add it
        if (!phoneNumber.startsWith("+84")) {
            // If it starts with 0, replace it with +84
            if (phoneNumber.startsWith("0")) {
                phoneNumber = "+84" + phoneNumber.substring(1);
            } else {
                phoneNumber = "+84" + phoneNumber;
            }
        }
        
        return phoneNumber;
    }

    /**
     * Generate and prepare OTP for a parent based on phone number
     * Note: This generates OTP locally since Firebase Auth requires client-side verification
     */
    @Override
    public boolean generateAndSendOtp(String phoneNumber) {
        logger.info("Starting OTP generation for phone number: {}", phoneNumber);
        
        try {
            // Format the phone number
            String formattedPhoneNumber = formatPhoneNumber(phoneNumber);
            logger.info("Formatted phone number: {}", formattedPhoneNumber);

            // Check if user exists and is a parent
            Optional<User> userOptional = userRepository.findByPhone(formattedPhoneNumber);

            // If not found, try with the original phone number
            if (!userOptional.isPresent()) {
                logger.info("User not found with formatted phone number, trying original phone: {}", phoneNumber);
                userOptional = userRepository.findByPhone(phoneNumber);
            }

            // If still not found, throw exception
            if (!userOptional.isPresent()) {
                logger.error("No user found with phone number: {} or {}", formattedPhoneNumber, phoneNumber);
                throw new AuthenticationException("No user found with this phone number");
            }

            User user = userOptional.get();
            logger.info("Found user: {} with role: {}", user.getPhone(), user.getRole().getRoleName());

            // Verify the user is a parent (strict uppercase checking)
            if (!"PARENT".equals(user.getRole().getRoleName())) {
                logger.warn("Non-parent user attempted OTP authentication: {}", user.getPhone());
                throw new AuthenticationException("Only parents can use OTP authentication");
            }

            // Generate 6-digit OTP
            String otp = generateOtp();
            LocalDateTime expiryTime = LocalDateTime.now().plusMinutes(OTP_VALIDITY_MINUTES);

            // Store OTP in memory for verification
            otpStore.put(formattedPhoneNumber, new Object[]{otp, expiryTime});
            logger.info("OTP generated and stored for phone number: {}", formattedPhoneNumber);

            // Log OTP for development (since we can't send SMS without additional setup)
            logger.info("Development mode: OTP for {} is {}", formattedPhoneNumber, otp);
            
            return true;
        } catch (Exception e) {
            logger.error("Error in generateAndSendOtp: {}", e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Verify OTP
     */

    @Override
    public boolean verifyOtp(String phoneNumber, String otp) {
        logger.info("Verifying OTP for phone number: {}", phoneNumber);
        
        try {
            // Format the phone number
            String formattedPhoneNumber = formatPhoneNumber(phoneNumber);
            logger.info("Formatted phone number for verification: {}", formattedPhoneNumber);

            // Check if user exists
            Optional<User> userOptional = userRepository.findByPhone(formattedPhoneNumber);

            // If not found, try with the original phone number
            if (!userOptional.isPresent()) {
                logger.info("User not found with formatted phone number, trying original phone: {}", phoneNumber);
                userOptional = userRepository.findByPhone(phoneNumber);
            }

            // If still not found, throw exception
            if (!userOptional.isPresent()) {
                logger.error("No user found with phone number: {} or {}", formattedPhoneNumber, phoneNumber);
                throw new AuthenticationException("Invalid phone number");
            }

            User user = userOptional.get();

            // Check if OTP exists in memory store
            if (!otpStore.containsKey(formattedPhoneNumber)) {
                logger.error("No OTP found for phone number: {}", formattedPhoneNumber);
                return false;
            }

            Object[] storedData = otpStore.get(formattedPhoneNumber);
            String storedOtp = (String) storedData[0];
            LocalDateTime expiryTime = (LocalDateTime) storedData[1];

            // Check if OTP is correct and not expired
            if (storedOtp != null && storedOtp.equals(otp) && expiryTime.isAfter(LocalDateTime.now())) {
                // Remove OTP after successful verification
                otpStore.remove(formattedPhoneNumber);
                logger.info("OTP verified successfully for phone number: {}", formattedPhoneNumber);
                return true;
            }

            logger.error("Invalid or expired OTP for phone number: {}", formattedPhoneNumber);
            return false;
        } catch (Exception e) {
            logger.error("Error verifying OTP: {}", e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Verify Firebase ID token (for frontend verification)
     */

    @Override
    public boolean verifyFirebaseToken(String idToken, String phoneNumber) {
        try {
            if (firebaseAuth == null) {
                logger.warn("Firebase Auth not initialized, falling back to manual verification");
                return false;
            }            var decodedToken = firebaseAuth.verifyIdToken(idToken);
            String tokenPhoneNumber = (String) decodedToken.getClaims().get("phone_number");
            
            // Verify the phone number matches
            String formattedPhoneNumber = formatPhoneNumber(phoneNumber);
            return formattedPhoneNumber.equals(tokenPhoneNumber);
        } catch (FirebaseAuthException e) {
            logger.error("Firebase token verification failed: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Generate a 6-digit OTP
     */
    private String generateOtp() {
        int otpNumber = 100000 + random.nextInt(900000); // generates a number between 100000 and 999999
        return String.valueOf(otpNumber);
    }

    /**
     * Clear expired OTPs from memory
     */

    @Override
    public void clearExpiredOtps() {
        LocalDateTime now = LocalDateTime.now();
        otpStore.entrySet().removeIf(entry -> {
            LocalDateTime expiryTime = (LocalDateTime) entry.getValue()[1];
            return expiryTime.isBefore(now);
        });
    }

    /**
     * Get Firebase Web API Key for frontend
     */

    @Override
    public String getWebApiKey() {
        return firebaseWebApiKey;
    }
}

package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.impl;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.UserRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IEmailService;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IPasswordResetService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class PasswordResetService implements IPasswordResetService {

    private static final Logger logger = LoggerFactory.getLogger(PasswordResetService.class);
    
    private final UserRepository userRepository;
    private final IEmailService emailService;
    private final PasswordEncoder passwordEncoder;
    
    // In-memory OTP storage - key: email, value: [OTP, ExpiryTime]
    private final Map<String, Object[]> otpStore = new ConcurrentHashMap<>();
    
    private final Random random = new Random();
    
    @Value("${password.reset.otp.expiration-minutes:15}")
    private int otpExpirationMinutes;

    // List of roles allowed to use password reset
    private static final String[] ALLOWED_ROLES = {"ADMIN", "MANAGER", "SCHOOLNURSE"};

    @Autowired
    public PasswordResetService(
            UserRepository userRepository,
            IEmailService emailService,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public boolean requestPasswordReset(String email) {
        logger.info("Starting password reset request for email: {}", email);
        
        try {
            // Validate the email and check if user exists and is allowed to reset password
            if (!isUserAllowedForPasswordReset(email)) {
                logger.warn("User with email {} is not allowed to reset password", email);
                return false;
            }
            
            // Generate 6-digit OTP
            String otp = generateOtp();
            LocalDateTime expiryTime = LocalDateTime.now().plusMinutes(otpExpirationMinutes);
            
            // Store OTP for verification
            otpStore.put(email, new Object[]{otp, expiryTime});
            
            // Send OTP via email
            boolean emailSent = emailService.sendPasswordResetOtp(email, otp);
            if (!emailSent) {
                logger.error("Failed to send password reset OTP to email: {}", email);
                return false;
            }
            
            logger.info("Password reset OTP generated and sent to email: {}", email);
            return true;
        } catch (Exception e) {
            logger.error("Error in requestPasswordReset: {}", e.getMessage(), e);
            return false;
        }
    }

    @Override
    public boolean verifyPasswordResetOtp(String email, String otp) {
        logger.info("Verifying password reset OTP for email: {}", email);
        
        try {
            // Check if OTP exists for this email
            if (!otpStore.containsKey(email)) {
                logger.error("No OTP found for email: {}", email);
                return false;
            }
            
            Object[] storedData = otpStore.get(email);
            String storedOtp = (String) storedData[0];
            LocalDateTime expiryTime = (LocalDateTime) storedData[1];
            
            // Check if OTP is correct and not expired
            if (storedOtp != null && storedOtp.equals(otp) && expiryTime.isAfter(LocalDateTime.now())) {
                logger.info("OTP verified successfully for email: {}", email);
                return true;
            }
            
            logger.error("Invalid or expired OTP for email: {}", email);
            return false;
        } catch (Exception e) {
            logger.error("Error in verifyPasswordResetOtp: {}", e.getMessage(), e);
            return false;
        }
    }

    @Override
    public boolean resetPassword(String email, String otp, String newPassword) {
        logger.info("Resetting password for email: {}", email);
        
        try {
            // Verify OTP first
            if (!verifyPasswordResetOtp(email, otp)) {
                logger.error("OTP verification failed for email: {}", email);
                return false;
            }
            
            // Find user by email
            Optional<User> userOptional = userRepository.findByEmail(email);
            if (!userOptional.isPresent()) {
                logger.error("User not found with email: {}", email);
                return false;
            }
            
            User user = userOptional.get();
            
            // Encode and set new password
            user.setPassword(passwordEncoder.encode(newPassword));
            
            // Save user
            userRepository.save(user);
            
            // Remove OTP after successful password reset
            otpStore.remove(email);
            
            logger.info("Password reset successfully for user with email: {}", email);
            return true;
        } catch (Exception e) {
            logger.error("Error in resetPassword: {}", e.getMessage(), e);
            return false;
        }
    }
    
    @Override
    public boolean isUserAllowedForPasswordReset(String email) {
        // Check if email is valid
        if (email == null || email.isEmpty()) {
            return false;
        }
        
        // Find user by email
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (!userOptional.isPresent()) {
            logger.warn("User not found with email: {}", email);
            return false;
        }
        
        User user = userOptional.get();
        
        // Check if user's role is allowed
        String userRole = user.getRole().getRoleName();
        boolean isAllowed = Arrays.asList(ALLOWED_ROLES).contains(userRole);
        
        logger.info("User with email {} has role {} and password reset is {}", 
                email, userRole, isAllowed ? "allowed" : "not allowed");
        
        return isAllowed;
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
     * This method can be scheduled to run periodically
     */
    public void clearExpiredOtps() {
        LocalDateTime now = LocalDateTime.now();
        otpStore.entrySet().removeIf(entry -> {
            LocalDateTime expiryTime = (LocalDateTime) entry.getValue()[1];
            return expiryTime.isBefore(now);
        });
    }
} 
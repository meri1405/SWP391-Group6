package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.Role;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.RoleRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {
    private static final Logger logger = LoggerFactory.getLogger(OtpService.class);

    @Value("${app.twilio.account-sid:}")
    private String twilioAccountSid;

    @Value("${app.twilio.auth-token:}")
    private String twilioAuthToken;

    @Value("${app.twilio.phone-number:}")
    private String twilioPhoneNumber;

    private final int OTP_VALIDITY_MINUTES = 5;
    private final Random random = new Random();

    // In-memory OTP storage - key: phoneNumber, value: [OTP, ExpiryTime]
    private final Map<String, Object[]> otpStore = new ConcurrentHashMap<>();

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @PostConstruct
    private void initTwilio() {
        logger.info("Initializing Twilio with Account SID: {}", twilioAccountSid);
        logger.info("Twilio Phone Number: {}", twilioPhoneNumber);
        
        if (twilioAccountSid == null || twilioAccountSid.isEmpty() || 
            twilioAuthToken == null || twilioAuthToken.isEmpty()) {
            logger.warn("Twilio credentials not configured. SMS sending will be disabled.");
            return;
        }

        try {
            Twilio.init(twilioAccountSid, twilioAuthToken);
            logger.info("Twilio initialized successfully");
        } catch (Exception e) {
            logger.error("Failed to initialize Twilio: {}", e.getMessage(), e);
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
     * Generate and send OTP to a parent based on phone number
     */
    public boolean generateAndSendOtp(String phoneNumber) {
        logger.info("Starting OTP generation for phone number: {}", phoneNumber);
        
        try {
            // Format the phone number
            String formattedPhoneNumber = formatPhoneNumber(phoneNumber);
            logger.info("Formatted phone number: {}", formattedPhoneNumber);

            // Check if user exists and is a parent
            // First try with the formatted phone number (with country code)
            Optional<User> userOptional = userRepository.findByPhone(formattedPhoneNumber);

            // If not found, try with the original phone number
            if (!userOptional.isPresent()) {
                logger.info("User not found with formatted phone number, trying original phone: {}", phoneNumber);
                userOptional = userRepository.findByPhone(phoneNumber);
            }

            // If still not found, throw exception
            if (!userOptional.isPresent()) {
                logger.error("No user found with phone number: {} or {}", formattedPhoneNumber, phoneNumber);
                throw new BadCredentialsException("No user found with this phone number");
            }

            User user = userOptional.get();
            logger.info("Found user: {} with role: {}", user.getUsername(), user.getRole().getRoleName());

            // Verify the user is a parent (strict uppercase checking)
            if (!"PARENT".equals(user.getRole().getRoleName())) {
                logger.warn("Non-parent user attempted OTP authentication: {}", user.getUsername());
                throw new BadCredentialsException("Only parents can use OTP authentication");
            }

            // Generate 6-digit OTP
            String otp = generateOtp();
            LocalDateTime expiryTime = LocalDateTime.now().plusMinutes(OTP_VALIDITY_MINUTES);

            // Store OTP in memory
            otpStore.put(formattedPhoneNumber, new Object[]{otp, expiryTime});
            logger.info("OTP generated and stored for phone number: {}", formattedPhoneNumber);

            // Send OTP via SMS if Twilio is configured
            if (twilioAccountSid != null && !twilioAccountSid.isEmpty() && 
                twilioAuthToken != null && !twilioAuthToken.isEmpty() && 
                twilioPhoneNumber != null && !twilioPhoneNumber.isEmpty()) {
                
                try {
                    logger.info("Attempting to send SMS via Twilio to: {}", formattedPhoneNumber);
                    Message message = Message.creator(
                            new PhoneNumber(formattedPhoneNumber),
                            new PhoneNumber(twilioPhoneNumber),
                            "Your School Medical System OTP is: " + otp + ". Valid for " + OTP_VALIDITY_MINUTES + " minutes."
                    ).create();
                    logger.info("OTP sent successfully to {} with message SID: {}", formattedPhoneNumber, message.getSid());
                    return true;
                } catch (Exception e) {
                    logger.error("Failed to send OTP via Twilio: {}", e.getMessage(), e);
                    // For development, still return true and log the OTP
                    logger.info("Development mode: OTP for {} is {}", formattedPhoneNumber, otp);
                    return true;
                }
            } else {
                logger.warn("Twilio not configured. Running in development mode.");
                logger.info("Development mode: OTP for {} is {}", formattedPhoneNumber, otp);
                return true;
            }
        } catch (Exception e) {
            logger.error("Error in generateAndSendOtp: {}", e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Verify OTP
     */
    public boolean verifyOtp(String phoneNumber, String otp) {
        logger.info("Verifying OTP for phone number: {}", phoneNumber);
        
        try {
            // Format the phone number
            String formattedPhoneNumber = formatPhoneNumber(phoneNumber);
            logger.info("Formatted phone number for verification: {}", formattedPhoneNumber);

            // Check if user exists
            // First try with the formatted phone number (with country code)
            Optional<User> userOptional = userRepository.findByPhone(formattedPhoneNumber);

            // If not found, try with the original phone number
            if (!userOptional.isPresent()) {
                logger.info("User not found with formatted phone number, trying original phone: {}", phoneNumber);
                userOptional = userRepository.findByPhone(phoneNumber);
            }

            // If still not found, throw exception
            if (!userOptional.isPresent()) {
                logger.error("No user found with phone number: {} or {}", formattedPhoneNumber, phoneNumber);
                throw new BadCredentialsException("Invalid phone number");
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

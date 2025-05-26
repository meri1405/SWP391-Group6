package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.AuthResponse;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.Role;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.RoleRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.UserRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    private final OtpService otpService;
    private final AuthenticationManager authenticationManager;

    @Autowired
    public AuthService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            JwtUtil jwtUtil,
            PasswordEncoder passwordEncoder,
            OtpService otpService,
            @Lazy AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
        this.otpService = otpService;
        this.authenticationManager = authenticationManager;
    }

    /**
     * Authenticate with username and password
     */
    public AuthResponse authenticateUser(String username, String password) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, password));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtil.generateToken(authentication);

        User user = (User) authentication.getPrincipal();

        return new AuthResponse(
                jwt,
                user.getId(),
                user.getUsername(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getRole().getRoleName()
        );
    }

    /**
     * Request OTP for phone authentication
     */
    public boolean requestOtp(String phoneNumber) {
        return otpService.generateAndSendOtp(phoneNumber);
    }

    /**
     * Authenticate with OTP
     */
    public AuthResponse authenticateWithOtp(String phoneNumber, String otp) {
        boolean isValid = otpService.verifyOtp(phoneNumber, otp);

        if (!isValid) {
            throw new BadCredentialsException("Invalid OTP");
        }

        User user = userRepository.findByPhone(phoneNumber)
                .orElseThrow(() -> new BadCredentialsException("User not found"));

        // Check if user is a parent
        if (!"PARENT".equals(user.getRole().getRoleName())) {
            throw new BadCredentialsException("Only parents can use OTP authentication");
        }

        // Generate JWT token
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                user, null, user.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String jwt = jwtUtil.generateToken(authentication);

        return new AuthResponse(
                jwt,
                user.getId(),
                user.getUsername(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getRole().getRoleName()
        );
    }

    /**
     * Process OAuth2 authentication with Gmail
     */
    public AuthResponse processOAuth2Login(OAuth2AuthenticationToken authentication) {
        OAuth2User oauth2User = authentication.getPrincipal();
        Map<String, Object> attributes = oauth2User.getAttributes();

        String email = (String) attributes.get("email");
        String providerId = (String) attributes.get("sub");

        // Get or create user from OAuth2 data
        User user = processOAuthUserData(attributes, "GOOGLE");

        // Generate JWT token
        Authentication authToken = new UsernamePasswordAuthenticationToken(
                user, null, user.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authToken);

        String jwt = jwtUtil.generateToken(authToken);

        return new AuthResponse(
                jwt,
                user.getId(),
                user.getUsername(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getRole().getRoleName()
        );
    }

    /**
     * Process OAuth2 user data - find existing user or create new one
     */
    private User processOAuthUserData(Map<String, Object> attributes, String provider) {
        String email = (String) attributes.get("email");

        // Since providerId is transient, we can only search by email
        Optional<User> existingUserByEmail = userRepository.findByEmail(email);
        if (existingUserByEmail.isPresent()) {
            User existingUser = existingUserByEmail.get();
            // Set attributes in memory (these won't be persisted to DB)
            existingUser.setAttributes(attributes);
            return existingUser;
        }

        // Only users with appropriate roles can use OAuth2 login
        // This implementation assumes new users through OAuth are handled elsewhere
        // or requires manual approval
        throw new BadCredentialsException("User not registered in the system. Please contact administrator.");
    }
}

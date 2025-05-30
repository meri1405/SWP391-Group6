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
import org.springframework.security.core.userdetails.UserDetails;
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
        }        // Generate JWT token - use phone number as username for parents since they don't have usernames
        // Create a custom UserDetails that uses phone as username for JWT generation
        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                user.getPhone(), // Use phone as username for JWT token
                "", // Password not needed for JWT generation
                user.getAuthorities()
        );
        
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                user, null, user.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String jwt = jwtUtil.generateToken(userDetails);

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

    /**
     * Preprocesses a user before saving to ensure:
     * 1. If roleName is PARENT, username, password, and email are set to null
     * 2. Phone number is unique for all roles
     * 3. Password is properly encoded for non-PARENT users
     *
     * @param user The user to preprocess
     * @return The preprocessed user
     * @throws IllegalArgumentException if phone number is already in use
     */
    public User preprocessUserBeforeSave(User user) {
        // Check if phone is already in use
        if (user.getId() == null) { // Only for new users
            Optional<User> existingUserWithPhone = userRepository.findByPhone(user.getPhone());
            if (existingUserWithPhone.isPresent()) {
                throw new IllegalArgumentException("Phone number is already in use");
            }
        }

        // If role is PARENT, nullify username, password, and email
        if (user.getRole() != null && "PARENT".equalsIgnoreCase(user.getRole().getRoleName())) {
            user.setUsername(null);
            user.setPassword(null);
            user.setEmail(null);
        } else {
            // For non-PARENT roles, encode the password if it's a plain text password
            String password = user.getPassword();
            if (password != null && !password.isEmpty() && !password.startsWith("$2a$")) {
                // Password is not yet encoded (doesn't start with BCrypt prefix)
                user.setPassword(encodePassword(password));
            }
        }

        return user;
    }

    /**
     * Saves a user after preprocessing to enforce business rules
     *
     * @param user The user to save
     * @return The saved user
     */
    public User saveUser(User user) {
        User preprocessedUser = preprocessUserBeforeSave(user);
        return userRepository.save(preprocessedUser);
    }

    /**
     * Creates a new user with specified role and validates role-specific constraints.
     * This method should only be accessible to ADMIN users.
     *
     * @param user     The user to create
     * @param roleName The name of the role to assign
     * @return The created user
     * @throws IllegalArgumentException if validation fails
     */
    public User createUserByAdmin(User user, String roleName) {
        // Find the requested role
        Role role = roleRepository.findByRoleName(roleName)
                .orElseThrow(() -> new IllegalArgumentException("Invalid role: " + roleName));

        user.setRole(role);

        // Apply role-specific validation and constraints
        validateUserByRole(user, roleName);

        // Encode password for non-PARENT users
        if (!"PARENT".equalsIgnoreCase(roleName) && user.getPassword() != null) {
            user.setPassword(encodePassword(user.getPassword()));
        }

        // Preprocess and save the user
        return saveUser(user);
    }

    /**
     * Validates user data based on role-specific constraints
     *
     * @param user     The user to validate
     * @param roleName The role name
     * @throws IllegalArgumentException if validation fails
     */
    private void validateUserByRole(User user, String roleName) {
        // Common validations for all users
        if (user.getPhone() == null || user.getPhone().trim().isEmpty() || !user.getPhone().matches("\\d{10}")) {
            throw new IllegalArgumentException("Phone number is required for all users");
        }

        if (user.getFirstName() == null || user.getFirstName().trim().isEmpty()) {
            throw new IllegalArgumentException("First name is required for all users");
        }

        if (user.getLastName() == null || user.getLastName().trim().isEmpty()) {
            throw new IllegalArgumentException("Last name is required for all users");
        }

        if (user.getDob() == null) {
            throw new IllegalArgumentException("Date of birth is required for all users");
        }

        if (user.getGender() == null || user.getGender().trim().isEmpty()) {
            throw new IllegalArgumentException("Gender is required for all users");
        }

        if (user.getAddress() == null || user.getAddress().trim().isEmpty()) {
            throw new IllegalArgumentException("Address is required for all users");
        }

        if (user.getRole() == null) {
            throw new IllegalArgumentException("Role is required for all users");
        }

        if (user.getJobTitle() == null || user.getJobTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Job title is required for all users");
        }

        if (!"PARENT".equalsIgnoreCase(roleName) && user.getUsername() == null) {
            throw new IllegalArgumentException("Username is required for non-parent users");
        }

        if (!"PARENT".equalsIgnoreCase(roleName) && user.getPassword() == null) {
            throw new IllegalArgumentException("Password is required for non-parent users");
        }

        if (!"PARENT".equalsIgnoreCase(roleName) && user.getEmail() == null) {
            throw new IllegalArgumentException("Email is required for non-parent users");
        }

    }

    /**
     * Kiểm tra xem username đã tồn tại trong hệ thống chưa
     *
     * @param username Username cần kiểm tra
     * @return true nếu username đã tồn tại, false nếu chưa
     */
    public boolean usernameExists(String username) {
        return userRepository.existsByUsername(username);
    }

    /**
     * Mã hóa password khi tạo hoặc cập nhật người dùng
     *
     * @param rawPassword Password gốc cần mã hóa
     * @return Password đã được mã hóa
     */
    public String encodePassword(String rawPassword) {
        if (rawPassword == null || rawPassword.trim().isEmpty()) {
            return null;
        }
        return passwordEncoder.encode(rawPassword);
    }

    /**
     * Kiểm tra xem password có khớp với password đã mã hóa hay không
     *
     * @param rawPassword Password gốc cần kiểm tra
     * @param encodedPassword Password đã mã hóa trong database
     * @return true nếu password khớp, false nếu không khớp
     */
    public boolean verifyPassword(String rawPassword, String encodedPassword) {
        if (rawPassword == null || encodedPassword == null) {
            return false;
        }
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }
}

package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.impl;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.AuthResponse;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.Role;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.RoleRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.UserRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IAuthService;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IEmailService;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IOtpService;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.util.JwtUtil;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.utils.PhoneValidator;
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

import java.time.LocalDate;
import java.time.Period;
import java.util.Map;
import java.util.Optional;

@Service
public class AuthService implements IAuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    private final IOtpService otpService;
    private final IEmailService emailService;
    private final AuthenticationManager authenticationManager;

    @Autowired
    public AuthService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            JwtUtil jwtUtil,
            PasswordEncoder passwordEncoder,
            OtpService otpService,
            IEmailService emailService,
            @Lazy AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
        this.otpService = otpService;
        this.emailService = emailService;
        this.authenticationManager = authenticationManager;
    }

    /**
     * Authenticate with username and password
     */
    @Override
    public AuthResponse authenticateUser(String username, String password) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, password));

        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = (User) authentication.getPrincipal();

        // Check if this is a first-time login for staff roles
        String roleName = user.getRole().getRoleName();
        boolean isStaffRole = "ADMIN".equals(roleName) || "MANAGER".equals(roleName) || "SCHOOLNURSE".equals(roleName);

        if (isStaffRole && user.getFirstLogin() != null && user.getFirstLogin()) {
            // Return special response indicating first-time login
            return new AuthResponse(
                    null, // No JWT token until password is changed
                    user.getId(),
                    user.getUsername(),
                    user.getFirstName(),
                    user.getLastName(),
                    user.getEmail(),
                    user.getRole().getRoleName(),
                    true, // firstLogin flag
                    true  // needPasswordChange flag
            );
        }

        // Normal login flow - generate JWT token
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
    }    /**
     * Request OTP for phone authentication
     */
    @Override
    public boolean requestOtp(String phoneNumber) {
        return otpService.generateAndSendOtp(phoneNumber);
    }    /**
     * Authenticate with OTP
     */
    @Override
    public AuthResponse authenticateWithOtp(String phoneNumber, String otp) {
        boolean isValid;

        // Special handling for Firebase verification
        if ("FIREBASE_VERIFIED".equals(otp)) {
            isValid = true; // Already verified by Firebase ID token
        } else {
            isValid = otpService.verifyOtp(phoneNumber, otp);
        }

        if (!isValid) {
            throw new BadCredentialsException("Invalid OTP");
        }        User user = userRepository.findByPhone(phoneNumber)
                .orElseThrow(() -> new BadCredentialsException("User not found"));

        // Check if user is enabled
        if (!user.isEnabled()) {
            throw new BadCredentialsException("Account is disabled");
        }

        // Check if user is a parent
        if (!"PARENT".equals(user.getRole().getRoleName())) {
            throw new BadCredentialsException("Only parents can use OTP authentication");
        }// Generate JWT token - use phone number as username for parents since they don't have usernames
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
    @Override
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
        String email = (String) attributes.get("email");        // Since providerId is transient, we can only search by email
        Optional<User> existingUserByEmail = userRepository.findByEmail(email);
        if (existingUserByEmail.isPresent()) {
            User existingUser = existingUserByEmail.get();

            // Check if user is enabled
            if (!existingUser.isEnabled()) {
                throw new BadCredentialsException("Account is disabled");
            }

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
     * 3. Email is unique for non-PARENT users
     * 4. Password is properly encoded for non-PARENT users
     *
     * @param user The user to preprocess
     * @return The preprocessed user
     * @throws IllegalArgumentException if phone number or email is already in use
     */
    @Override
    public User preprocessUserBeforeSave(User user) {
        // Check if phone is already in use (only if phone is not null)
        if (user.getId() == null && user.getPhone() != null && !user.getPhone().trim().isEmpty()) { // Only for new users with phone
            Optional<User> existingUserWithPhone = userRepository.findByPhone(user.getPhone());
            if (existingUserWithPhone.isPresent()) {
                throw new IllegalArgumentException("Phone number is already in use");
            }
        }// If role is PARENT, nullify username, password, and email
        if (user.getRole() != null && 
            ("PARENT".equalsIgnoreCase(user.getRole().getRoleName()))) {
            user.setUsername(user.getPhone()); // Use phone as username for PARENT
            user.setPassword(null);
            user.setEmail(null);
            // Parents don't need to change password on first login
            user.setFirstLogin(false);
        } else {
            // For non-PARENT roles, check if email is already in use
            if (user.getEmail() != null && !user.getEmail().isEmpty()) {
                Optional<User> existingUserWithEmail = userRepository.findByEmail(user.getEmail());
                if (existingUserWithEmail.isPresent() &&
                    (user.getId() == null || !existingUserWithEmail.get().getId().equals(user.getId()))) {
                    throw new IllegalArgumentException("Email is already in use");
                }
            }            // For roles that need authentication (not PARENT or STUDENT), encode the password if it's a plain text password
            String password = user.getPassword();
            if (password != null && !password.isEmpty() && !password.startsWith("$2a$")) {
                // Password is not yet encoded (doesn't start with BCrypt prefix)
                user.setPassword(encodePassword(password));
            }

            // For new users with non-PARENT roles, set firstLogin to true if not explicitly set
            if (user.getId() == null && user.getFirstLogin() == null) {
                user.setFirstLogin(true); // Force password change on first login for staff roles
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
    @Override
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
    @Override
    public User createUserByAdmin(User user, String roleName) {
        // Validate that Admin can only create staff roles
        if (!"ADMIN".equalsIgnoreCase(roleName) && 
            !"MANAGER".equalsIgnoreCase(roleName) && 
            !"SCHOOLNURSE".equalsIgnoreCase(roleName)) {
            throw new IllegalArgumentException("Admin can only create staff accounts (ADMIN, MANAGER, SCHOOLNURSE)");
        }

        // Find the requested role
        Role role = roleRepository.findByRoleName(roleName)
                .orElseThrow(() -> new IllegalArgumentException("Invalid role: " + roleName));

        user.setRole(role);

        // Apply role-specific validation and constraints
        validateUserByRole(user, roleName);

        // Auto-generate credentials for all staff roles
        String username = generateUsername(roleName, user.getFirstName(), user.getLastName());
        String tempPassword = generateTemporaryPassword();

        user.setUsername(username);
        user.setPassword(encodePassword(tempPassword));
        user.setFirstLogin(true); // Force password change on first login

        // Preprocess and save the user
        User savedUser = saveUser(user);

        // Send login credentials via email
        if (user.getEmail() != null) {
            try {
                boolean emailSent = emailService.sendLoginCredentials(
                    user.getEmail(), 
                    user.getUsername(), 
                    tempPassword, 
                    user.getFullName()
                );
                if (!emailSent) {
                    // Log warning but don't fail user creation
                    System.err.println("Warning: Failed to send login credentials email to " + user.getEmail());
                }
            } catch (Exception e) {
                // Log error but don't fail user creation
                System.err.println("Error sending login credentials email: " + e.getMessage());
            }
        }

        return savedUser;
    }

    /**
     * Validates user data for staff roles only
     *
     * @param user     The user to validate
     * @param roleName The role name (must be ADMIN, MANAGER, or SCHOOLNURSE)
     * @throws IllegalArgumentException if validation fails
     */
    private void validateUserByRole(User user, String roleName) {
        // Ensure only staff roles are validated
        if (!"ADMIN".equalsIgnoreCase(roleName) && 
            !"MANAGER".equalsIgnoreCase(roleName) && 
            !"SCHOOLNURSE".equalsIgnoreCase(roleName)) {
            throw new IllegalArgumentException("Invalid role for admin management: " + roleName);
        }

        // Common validations for staff roles
        if (user.getPhone() == null || user.getPhone().trim().isEmpty()) {
            throw new IllegalArgumentException("Số điện thoại là bắt buộc cho vai trò " + roleName);
        }

        // Validate phone format
        String phoneError = PhoneValidator.validatePhone(user.getPhone());
        if (phoneError != null) {
            throw new IllegalArgumentException(phoneError + " (" + roleName + ")");
        }

        if (user.getFirstName() == null || user.getFirstName().trim().isEmpty()) {
            throw new IllegalArgumentException("Tên là bắt buộc cho tất cả nhân viên");
        }

        if (user.getLastName() == null || user.getLastName().trim().isEmpty()) {
            throw new IllegalArgumentException("Họ là bắt buộc cho tất cả nhân viên");
        }

        if (user.getDob() == null) {
            throw new IllegalArgumentException("Ngày sinh là bắt buộc cho tất cả nhân viên");
        }

        // Age validation - minimum age is 25 for all staff roles
        LocalDate today = LocalDate.now();
        LocalDate birthDate = user.getDob();
        int age = Period.between(birthDate, today).getYears();

        if (age < 25) {
            throw new IllegalArgumentException("Tuổi tối thiểu cho vai trò " + roleName + " là 25 tuổi");
        }

        if (age > 65) {
            throw new IllegalArgumentException("Tuổi tối đa cho vai trò " + roleName + " là 65 tuổi");
        }

        if (user.getGender() == null || user.getGender().trim().isEmpty()) {
            throw new IllegalArgumentException("Giới tính là bắt buộc cho tất cả nhân viên");
        }

        if (user.getAddress() == null || user.getAddress().trim().isEmpty()) {
            throw new IllegalArgumentException("Địa chỉ là bắt buộc cho tất cả nhân viên");
        }

        if (user.getRole() == null) {
            throw new IllegalArgumentException("Vai trò là bắt buộc cho tất cả nhân viên");
        }

        // Email is required for all staff roles (for credential delivery)
        if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("Email là bắt buộc cho vai trò " + roleName + " để gửi thông tin đăng nhập");
        }
    }

    /**
     * Kiểm tra xem username đã tồn tại trong hệ thống chưa
     *
     * @param username Username cần kiểm tra
     * @return true nếu username đã tồn tại, false nếu chưa
     */
    @Override
    public boolean usernameExists(String username) {
        return userRepository.existsByUsername(username);
    }

    /**
     * Mã hóa password khi tạo hoặc cập nhật người dùng
     *
     * @param rawPassword Password gốc cần mã hóa
     * @return Password đã được mã hóa
     */
    @Override
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
    @Override
    public boolean verifyPassword(String rawPassword, String encodedPassword) {
        if (rawPassword == null || encodedPassword == null) {
            return false;
        }
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }

    /**
     * Logout the user by invalidating their token
     *
     * @param authHeader The Authorization header containing the JWT token
     */
    @Override
    public void logout(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            // Add the token to a blacklist or invalidate it
            // This can be implemented in JwtUtil
            jwtUtil.invalidateToken(token);
        }
    }

    /**
     * Generate unique username based on role and user info
     */
    private String generateUsername(String roleName, String firstName, String lastName) {
        String rolePrefix = switch (roleName.toUpperCase()) {
            case "ADMIN" -> "admin";
            case "MANAGER" -> "mgr";
            case "SCHOOLNURSE" -> "nurse";
            default -> "user";
        };

        // Create base username from name
        String baseName = (firstName.toLowerCase().replaceAll("[^a-z]", "") + 
                          lastName.toLowerCase().replaceAll("[^a-z]", "")).substring(0, 
                          Math.min(8, (firstName + lastName).replaceAll("[^a-zA-Z]", "").length()));

        String baseUsername = rolePrefix + "_" + baseName;
        String username = baseUsername;
        int counter = 1;

        // Ensure username is unique
        while (userRepository.findByUsername(username).isPresent()) {
            username = baseUsername + counter;
            counter++;
        }

        return username;
    }

    /**
     * Generate temporary password
     */
    private String generateTemporaryPassword() {
        // Generate a secure temporary password: 8 characters with mix of letters, numbers and special chars
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@$!%*?&";
        StringBuilder password = new StringBuilder();
        java.security.SecureRandom random = new java.security.SecureRandom();

        // Ensure at least one character from each category
        password.append((char) (random.nextInt(26) + 'A')); // uppercase
        password.append((char) (random.nextInt(26) + 'a')); // lowercase
        password.append((char) (random.nextInt(10) + '0')); // digit
        password.append("@$!%*?&".charAt(random.nextInt(7))); // special char

        // Fill the rest randomly
        for (int i = 4; i < 10; i++) {
            password.append(chars.charAt(random.nextInt(chars.length())));
        }

        // Shuffle the password
        char[] passwordArray = password.toString().toCharArray();
        for (int i = passwordArray.length - 1; i > 0; i--) {
            int j = random.nextInt(i + 1);
            char temp = passwordArray[i];
            passwordArray[i] = passwordArray[j];
            passwordArray[j] = temp;
        }

        return new String(passwordArray);
    }
}

package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.impl;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.*;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.OtpToken;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.OtpTokenRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.UserRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IEmailService;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IFirstTimeLoginService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Implementation của IFirstTimeLoginService
 * Xử lý logic đăng nhập lần đầu và đổi mật khẩu
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class FirstTimeLoginService implements IFirstTimeLoginService {

    private final UserRepository userRepository;
    private final OtpTokenRepository otpTokenRepository;
    private final IEmailService emailService;
    private final PasswordEncoder passwordEncoder;
    
    private static final String TOKEN_TYPE_PASSWORD_CHANGE = "PASSWORD_CHANGE";
    private static final int OTP_EXPIRY_MINUTES = 5;
    private static final int OTP_LENGTH = 6;

    @Override
    public FirstTimeLoginResponse checkFirstLogin(PasswordResetRequest request) {
        try {
            log.info("Checking first login status for email: {}", request.getEmail());
            
            Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
            if (userOpt.isEmpty()) {
                log.warn("User not found with email: {}", request.getEmail());
                return new FirstTimeLoginResponse("Người dùng không tồn tại");
            }

            User user = userOpt.get();
            String roleName = user.getRoleName();
            
            // Chỉ kiểm tra first login cho các vai trò có username/password
            if (!"ADMIN".equals(roleName) && !"MANAGER".equals(roleName) && !"SCHOOLNURSE".equals(roleName)) {
                log.warn("First login check not applicable for role: {}", roleName);
                return new FirstTimeLoginResponse("Vai trò không hỗ trợ đăng nhập bằng username/password");
            }

            boolean isFirstLogin = user.getFirstLogin() != null ? user.getFirstLogin() : false;
            log.info("First login status for user {}: {}", request.getEmail(), isFirstLogin);
            
            if (isFirstLogin) {
                return new FirstTimeLoginResponse("Người dùng cần đổi mật khẩu lần đầu", true, user.getUsername());
            } else {
                return new FirstTimeLoginResponse("Người dùng đã đổi mật khẩu", false, null);
            }
            
        } catch (Exception e) {
            log.error("Error checking first login status for email {}: {}", request.getEmail(), e.getMessage(), e);
            return new FirstTimeLoginResponse("Lỗi hệ thống khi kiểm tra trạng thái đăng nhập");
        }
    }

    @Override
    public MessageResponse sendOtpForPasswordChange(PasswordResetRequest request) {
        try {
            log.info("Sending OTP for password change to email: {}", request.getEmail());
            
            Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
            if (userOpt.isEmpty()) {
                log.warn("User not found with email: {}", request.getEmail());
                return new MessageResponse("Người dùng không tồn tại");
            }

            User user = userOpt.get();
            String roleName = user.getRoleName();
            
            // Chỉ cho phép gửi OTP cho các vai trò có username/password
            if (!"ADMIN".equals(roleName) && !"MANAGER".equals(roleName) && !"SCHOOLNURSE".equals(roleName)) {
                log.warn("OTP sending not applicable for role: {}", roleName);
                return new MessageResponse("Vai trò không hỗ trợ đổi mật khẩu qua OTP");
            }

            // Kiểm tra nếu người dùng không cần đổi mật khẩu lần đầu
            boolean isFirstLogin = user.getFirstLogin() != null ? user.getFirstLogin() : false;
            if (!isFirstLogin) {
                log.warn("User {} does not need first-time password change", request.getEmail());
                return new MessageResponse("Người dùng không cần đổi mật khẩu lần đầu");
            }

            // Vô hiệu hóa tất cả OTP cũ của user này
            otpTokenRepository.markAllEmailTokensAsUsed(request.getEmail(), TOKEN_TYPE_PASSWORD_CHANGE);

            // Tạo OTP mới
            String otpCode = generateOtpCode();
            LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES);
            
            OtpToken otpToken = new OtpToken(user, otpCode, request.getEmail(), expiresAt, TOKEN_TYPE_PASSWORD_CHANGE);
            otpTokenRepository.save(otpToken);

            // Gửi email chứa OTP
            String subject = "Mã OTP đổi mật khẩu lần đầu - Y tế học đường";
            String content = buildOtpEmailContent(user.getFullName(), otpCode, OTP_EXPIRY_MINUTES);
            
            emailService.sendSimpleEmail(request.getEmail(), subject, content);
            
            log.info("OTP sent successfully to email: {}", request.getEmail());
            return new MessageResponse("Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.");
            
        } catch (Exception e) {
            log.error("Error sending OTP for password change to email {}: {}", request.getEmail(), e.getMessage(), e);
            return new MessageResponse("Lỗi hệ thống khi gửi OTP. Vui lòng thử lại sau.");
        }
    }

    @Override
    public MessageResponse verifyOtpAndChangePasswordWithUsername(FirstTimePasswordChangeRequest request) {
        try {
            log.info("Verifying OTP and changing password with username for email: {}", request.getEmail());
            
            // Tìm OTP hợp lệ
            LocalDateTime currentTime = LocalDateTime.now();
            Optional<OtpToken> otpTokenOpt = otpTokenRepository.findValidOtpByEmailAndCode(
                    request.getEmail(), 
                    request.getOtp(), 
                    currentTime
            );
            
            if (otpTokenOpt.isEmpty()) {
                log.warn("Invalid or expired OTP for email: {}", request.getEmail());
                return new MessageResponse("Mã OTP không hợp lệ hoặc đã hết hạn");
            }

            OtpToken otpToken = otpTokenOpt.get();
            User user = otpToken.getUser();

            // Validate new password using extracted method
            MessageResponse passwordValidation = validatePassword(request.getNewPassword());
            if (passwordValidation != null) {
                return passwordValidation;
            }

            // Validate new username using extracted method
            MessageResponse usernameValidation = validateUsername(request.getNewUsername(), user);
            if (usernameValidation != null) {
                return usernameValidation;
            }

            String newUsername = request.getNewUsername().trim();
            boolean usernameChanged = !newUsername.equals(user.getUsername());

            // Mã hóa và cập nhật mật khẩu mới
            String encodedPassword = passwordEncoder.encode(request.getNewPassword());
            user.setPassword(encodedPassword);
            user.setUsername(newUsername); // Update username
            user.setFirstLogin(false); // Đánh dấu đã đổi mật khẩu lần đầu
            userRepository.save(user);

            // Đánh dấu OTP đã sử dụng
            otpToken.markAsUsed();
            otpTokenRepository.save(otpToken);

            // Vô hiệu hóa tất cả OTP khác của user này
            otpTokenRepository.markAllEmailTokensAsUsed(request.getEmail(), TOKEN_TYPE_PASSWORD_CHANGE);

            String message = usernameChanged 
                ? "Đổi mật khẩu và tên đăng nhập thành công! Bạn có thể đăng nhập với thông tin mới."
                : "Đổi mật khẩu thành công! Bạn có thể đăng nhập với mật khẩu mới.";
            
            log.info("Password and username changed successfully for user: {}", request.getEmail());
            return new MessageResponse(message);
            
        } catch (Exception e) {
            log.error("Error verifying OTP and changing password with username for email {}: {}", request.getEmail(), e.getMessage(), e);
            return new MessageResponse("Lỗi hệ thống khi đổi mật khẩu. Vui lòng thử lại sau.");
        }
    }

    @Override
    public int cleanupExpiredTokens() {
        try {
            LocalDateTime currentTime = LocalDateTime.now();
            int deletedCount = otpTokenRepository.deleteExpiredTokens(currentTime);
            log.info("Cleaned up {} expired OTP tokens", deletedCount);
            return deletedCount;
        } catch (Exception e) {
            log.error("Error cleaning up expired OTP tokens: {}", e.getMessage(), e);
            return 0;
        }
    }

    /**
     * Tạo mã OTP ngẫu nhiên
     */
    private String generateOtpCode() {
        SecureRandom random = new SecureRandom();
        StringBuilder otp = new StringBuilder();
        
        for (int i = 0; i < OTP_LENGTH; i++) {
            otp.append(random.nextInt(10));
        }
        
        return otp.toString();
    }

    /**
     * Validate password strength and format
     * @param password the password to validate
     * @return MessageResponse with error message if invalid, null if valid
     */
    private MessageResponse validatePassword(String password) {
        if (password == null || password.trim().isEmpty()) {
            return new MessageResponse("Mật khẩu mới không được để trống");
        }

        if (password.length() < 8) {
            return new MessageResponse("Mật khẩu phải có ít nhất 8 ký tự");
        }

        if (password.length() > 50) {
            return new MessageResponse("Mật khẩu không được quá 50 ký tự");
        }

        if (password.contains(" ")) {
            return new MessageResponse("Mật khẩu không được chứa khoảng trắng");
        }

        if (!isPasswordStrong(password)) {
            return new MessageResponse("Mật khẩu phải đạt độ mạnh 'Trung bình' trở lên (cần ít nhất 3/5 tiêu chí: chữ thường, chữ hoa, số, ký tự đặc biệt @$!%*?&)");
        }

        return null; // Valid
    }

    /**
     * Validate username format and uniqueness
     * @param username the username to validate
     * @param currentUser the current user (to allow keeping same username)
     * @return MessageResponse with error message if invalid, null if valid
     */
    private MessageResponse validateUsername(String username, User currentUser) {
        if (username == null || username.trim().isEmpty()) {
            return new MessageResponse("Tên đăng nhập mới không được để trống");
        }

        String trimmedUsername = username.trim();
        
        if (trimmedUsername.length() < 3) {
            return new MessageResponse("Tên đăng nhập phải có ít nhất 3 ký tự");
        }

        if (trimmedUsername.length() > 30) {
            return new MessageResponse("Tên đăng nhập không được quá 30 ký tự");
        }

        if (!trimmedUsername.matches("^[a-zA-Z0-9._-]+$")) {
            return new MessageResponse("Tên đăng nhập chỉ được chứa chữ cái, số, dấu chấm, gạch dưới và gạch ngang");
        }

        // Check uniqueness only if username is different from current one
        if (!trimmedUsername.equals(currentUser.getUsername())) {
            Optional<User> existingUserOpt = userRepository.findByUsername(trimmedUsername);
            if (existingUserOpt.isPresent() && !existingUserOpt.get().getId().equals(currentUser.getId())) {
                log.warn("Username {} already exists for another user", trimmedUsername);
                return new MessageResponse("Tên đăng nhập đã tồn tại. Vui lòng chọn tên đăng nhập khác.");
            }
        }

        return null; // Valid
    }

    /**
     * Kiểm tra độ mạnh mật khẩu
     */
    private boolean isPasswordStrong(String password) {
        if (password == null || password.length() < 8 || password.length() > 50) {
            return false;
        }

        if (password.contains(" ")) {
            return false;
        }

        int score = 0;
        if (password.matches(".*[a-z].*")) score++; // Chữ thường
        if (password.matches(".*[A-Z].*")) score++; // Chữ hoa
        if (password.matches(".*\\d.*")) score++; // Số
        if (password.matches(".*[@$!%*?&].*")) score++; // Ký tự đặc biệt
        if (password.length() >= 8) score++; // Độ dài

        return score >= 3; // Cần ít nhất 3/5 tiêu chí
    }

    /**
     * Tạo nội dung email chứa OTP
     */
    private String buildOtpEmailContent(String fullName, String otpCode, int expiryMinutes) {
        return String.format("""
            Xin chào %s,
            
            Đây là lần đăng nhập đầu tiên của bạn vào hệ thống. Vì lý do bảo mật, bạn cần đổi mật khẩu và xác thực qua email.
            
            MÃ OTP CỦA BẠN: %s
            
            Mã này có hiệu lực trong %d phút.
            
            LƯU Ý BẢO MẬT:
            • Không chia sẻ mã OTP này với bất kỳ ai
            • Nếu bạn không yêu cầu đổi mật khẩu, vui lòng liên hệ quản trị viên
            
            Email này được gửi tự động từ Hệ thống quản lý y tế học đường.
            Vui lòng không trả lời email này.
            
            Trân trọng,
            Ban Quản Trị Hệ Thống
            """, fullName, otpCode, expiryMinutes);
    }
}

package group6.Swp391.Se1861.SchoolMedicalManagementSystem.controller;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.*;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IFirstTimeLoginService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller xử lý các API liên quan đến đăng nhập lần đầu và đổi mật khẩu
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:5173"})
public class FirstTimeLoginController {

    private final IFirstTimeLoginService firstTimeLoginService;

    /**
     * Kiểm tra xem người dùng có cần đổi mật khẩu lần đầu không
     * 
     * @param request Yêu cầu kiểm tra đăng nhập lần đầu (sử dụng PasswordResetRequest để reuse DTO)
     * @return ResponseEntity chứa thông tin trạng thái và username hiện tại
     */
    @PostMapping("/check-first-login")
    public ResponseEntity<FirstTimeLoginResponse> checkFirstLogin(@RequestBody PasswordResetRequest request) {
        try {
            log.info("Received check first login request for email: {}", request.getEmail());
            
            if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new FirstTimeLoginResponse("Email không được để trống"));
            }

            FirstTimeLoginResponse response = firstTimeLoginService.checkFirstLogin(request);
            
            // Check if the response indicates a first login requirement by flag
            if (response.isRequiresFirstTimeLogin()) {
                return ResponseEntity.ok(response);
            } else if (response.getMessage().contains("đã đổi mật khẩu")) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            
        } catch (Exception e) {
            log.error("Error in checkFirstLogin: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new FirstTimeLoginResponse("Lỗi hệ thống"));
        }
    }

    /**
     * Gửi OTP đến email để xác thực việc đổi mật khẩu lần đầu
     * 
     * @param request Yêu cầu gửi OTP (sử dụng PasswordResetRequest)
     * @return ResponseEntity chứa thông tin kết quả
     */
    @PostMapping("/send-otp-password-change")
    public ResponseEntity<MessageResponse> sendOtpForPasswordChange(@RequestBody PasswordResetRequest request) {
        try {
            log.info("Received send OTP request for email: {}", request.getEmail());
            
            if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new MessageResponse("Email không được để trống"));
            }

            // Validate email format
            if (!isValidEmail(request.getEmail())) {
                return ResponseEntity.badRequest()
                    .body(new MessageResponse("Định dạng email không hợp lệ"));
            }

            MessageResponse response = firstTimeLoginService.sendOtpForPasswordChange(request);
            
            // Check if the response indicates success by message content
            if (response.getMessage().contains("đã được gửi đến email")) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            
        } catch (Exception e) {
            log.error("Error in sendOtpForPasswordChange: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponse("Lỗi hệ thống khi gửi OTP"));
        }
    }

    /**
     * Xác thực OTP và đổi cả mật khẩu và username lần đầu
     * 
     * @param request Yêu cầu xác thực OTP và đổi mật khẩu + username
     * @return ResponseEntity chứa thông tin kết quả
     */
    @PostMapping("/verify-otp-change-password-username")
    public ResponseEntity<MessageResponse> verifyOtpAndChangePasswordWithUsername(@RequestBody FirstTimePasswordChangeRequest request) {
        try {
            log.info("Received verify OTP and change password with username request for email: {}", request.getEmail());
            
            // Validate input
            if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new MessageResponse("Email không được để trống"));
            }

            if (request.getOtp() == null || request.getOtp().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new MessageResponse("Mã OTP không được để trống"));
            }

            if (request.getNewPassword() == null || request.getNewPassword().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new MessageResponse("Mật khẩu mới không được để trống"));
            }

            if (request.getNewUsername() == null || request.getNewUsername().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new MessageResponse("Tên đăng nhập mới không được để trống"));
            }

            // Validate email format
            if (!isValidEmail(request.getEmail())) {
                return ResponseEntity.badRequest()
                    .body(new MessageResponse("Định dạng email không hợp lệ"));
            }

            // Validate OTP format (6 digits)
            if (!request.getOtp().matches("\\d{6}")) {
                return ResponseEntity.badRequest()
                    .body(new MessageResponse("Mã OTP phải có 6 chữ số"));
            }

            // Validate username format
            String username = request.getNewUsername().trim();
            if (username.length() < 3 || username.length() > 30) {
                return ResponseEntity.badRequest()
                    .body(new MessageResponse("Tên đăng nhập phải từ 3-30 ký tự"));
            }

            if (!username.matches("^[a-zA-Z0-9._-]+$")) {
                return ResponseEntity.badRequest()
                    .body(new MessageResponse("Tên đăng nhập chỉ được chứa chữ cái, số, dấu chấm, gạch dưới và gạch ngang"));
            }

            MessageResponse response = firstTimeLoginService.verifyOtpAndChangePasswordWithUsername(request);
            
            // Check if the response indicates success by message content
            if (response.getMessage().contains("thành công")) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            
        } catch (Exception e) {
            log.error("Error in verifyOtpAndChangePasswordWithUsername: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponse("Lỗi hệ thống khi xác thực OTP"));
        }
    }

    /**
     * Endpoint để dọn dẹp các OTP tokens đã hết hạn (có thể được gọi bởi scheduled task)
     * 
     * @return ResponseEntity chứa số lượng tokens đã xóa
     */
    @PostMapping("/cleanup-expired-tokens")
    public ResponseEntity<MessageResponse> cleanupExpiredTokens() {
        try {
            log.info("Received cleanup expired tokens request");
            
            int deletedCount = firstTimeLoginService.cleanupExpiredTokens();
            
            return ResponseEntity.ok(new MessageResponse("Đã dọn dẹp " + deletedCount + " OTP tokens hết hạn"));
            
        } catch (Exception e) {
            log.error("Error in cleanupExpiredTokens: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponse("Lỗi hệ thống khi dọn dẹp tokens"));
        }
    }

    /**
     * Validate email format
     */
    private boolean isValidEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            return false;
        }
        
        String emailRegex = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";
        return email.matches(emailRegex);
    }
}

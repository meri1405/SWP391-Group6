package group6.Swp391.Se1861.SchoolMedicalManagementSystem.controller;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.*;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.UserRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IFirebaseOtpService;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IAuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Controller xử lý xác thực người dùng
 * Quản lý các chức năng đăng nhập, đăng xuất và xác thực OTP
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private IAuthService authService;
    
    @Autowired
    private IFirebaseOtpService firebaseOtpService;
    
    @Autowired
    private UserRepository userRepository;
    
    @Value("${app.firebase.project-id:}")
    private String firebaseProjectId;

    /**
     * Đăng nhập bằng tên đăng nhập và mật khẩu
     * Dành cho admin, manager, y tá trường học
     * 
     * @param loginRequest Thông tin đăng nhập (username, password)
     * @return Token JWT và thông tin người dùng
     */
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        AuthResponse authResponse = authService.authenticateUser(
                loginRequest.getUsername(),
                loginRequest.getPassword());

        return ResponseEntity.ok(authResponse);
    }

    /**
     * Yêu cầu gửi mã OTP đến số điện thoại
     * Dành cho phụ huynh đăng nhập bằng số điện thoại
     * 
     * @param otpRequest Yêu cầu chứa số điện thoại
     * @return Thông báo kết quả gửi OTP
     */
    @PostMapping("/parent/request-otp")
    public ResponseEntity<?> requestOtp(@Valid @RequestBody OtpRequest otpRequest) {
        boolean success = authService.requestOtp(otpRequest.getPhoneNumber());

        if (success) {
            return ResponseEntity.ok().body(new MessageResponse("Gửi mã OTP thành công"));
        } else {
            return ResponseEntity.internalServerError().body(new MessageResponse("Gửi mã OTP thất bại"));
        }
    }

    /**
     * Xác thực mã OTP và đăng nhập cho phụ huynh
     * Kiểm tra mã OTP được gửi đến số điện thoại
     * 
     * @param request Yêu cầu chứa số điện thoại và mã OTP
     * @return Token JWT và thông tin phụ huynh
     */
    @PostMapping("/parent/verify-otp")
    public ResponseEntity<?> verifyOtp(@Valid @RequestBody OtpVerificationRequest request) {
        AuthResponse authResponse = authService.authenticateWithOtp(
                request.getPhoneNumber(),
                request.getOtp());

        return ResponseEntity.ok(authResponse);
    }

    /**
     * Xử lý đăng nhập OAuth2 (Google login)
     * Hoạt động với quy trình OAuth2 của Spring Security
     * 
     * @param authentication Token xác thực OAuth2
     * @return Token JWT và thông tin người dùng
     */
    @GetMapping("/oauth2/callback")
    public ResponseEntity<?> oauth2Callback(OAuth2AuthenticationToken authentication) {
        AuthResponse authResponse = authService.processOAuth2Login(authentication);
        return ResponseEntity.ok(authResponse);
    }

    /**
     * Đăng xuất người dùng bằng cách vô hiệu hóa token
     * Thời gian hết hạn token được thiết lập là 30 phút
     * 
     * @param token Token JWT từ header Authorization
     * @return Thông báo đăng xuất thành công
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader("Authorization") String token) {
        authService.logout(token);
        return ResponseEntity.ok(new MessageResponse("Đăng xuất thành công"));
    }

    /**
     * Get Firebase configuration for frontend
     */
    @GetMapping("/firebase-config")
    public ResponseEntity<FirebaseConfigResponse> getFirebaseConfig() {
        String webApiKey = firebaseOtpService.getWebApiKey();
        FirebaseConfigResponse config = new FirebaseConfigResponse(webApiKey, firebaseProjectId);
        return ResponseEntity.ok(config);
    }

    /**
     * Verify Firebase OTP and authenticate parent (new Firebase method)
     */
    @PostMapping("/parent/verify-firebase-otp")
    public ResponseEntity<?> verifyFirebaseOtp(@Valid @RequestBody FirebaseOtpVerificationRequest request) {
        try {
            // Try Firebase ID token verification first
            if (request.getFirebaseIdToken() != null && !request.getFirebaseIdToken().isEmpty()) {
                boolean isValidToken = firebaseOtpService.verifyFirebaseToken(
                    request.getFirebaseIdToken(), 
                    request.getPhoneNumber()
                );
                
                if (isValidToken) {
                    AuthResponse authResponse = authService.authenticateWithOtp(
                        request.getPhoneNumber(), 
                        "FIREBASE_VERIFIED" // Special marker for Firebase verification
                    );
                    return ResponseEntity.ok(authResponse);
                }
            }
            
            // Fallback to manual OTP verification if Firebase token fails
            if (request.getOtp() != null && !request.getOtp().isEmpty()) {
                AuthResponse authResponse = authService.authenticateWithOtp(
                    request.getPhoneNumber(),
                    request.getOtp()
                );
                return ResponseEntity.ok(authResponse);
            }
            
            return ResponseEntity.badRequest().body(new MessageResponse("Invalid verification data"));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Get user ID by email or username
     * Used for OAuth2 users where JWT token doesn't contain user ID
     */
    @GetMapping("/user-by-email")
    public ResponseEntity<?> getUserByEmail(@RequestParam String email) {
        try {
            // Try to find by email first
            Optional<User> userOpt = userRepository.findByEmail(email);
            
            // If not found by email, try by username
            if (userOpt.isEmpty()) {
                userOpt = userRepository.findByUsername(email);
            }
            
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                Map<String, Object> response = new HashMap<>();
                response.put("id", user.getId());
                response.put("username", user.getUsername());
                response.put("firstName", user.getFirstName());
                response.put("lastName", user.getLastName());
                response.put("email", user.getEmail());
                response.put("roleName", user.getRole().getRoleName());
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new MessageResponse("Error retrieving user information"));
        }
    }
}

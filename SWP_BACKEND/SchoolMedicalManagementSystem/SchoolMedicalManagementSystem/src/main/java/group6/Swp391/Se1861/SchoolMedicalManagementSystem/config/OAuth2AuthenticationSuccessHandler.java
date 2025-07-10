package group6.Swp391.Se1861.SchoolMedicalManagementSystem.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.AuthResponse;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.UserRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.impl.JwtService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Optional;

@Component
@Slf4j
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Autowired
    private JwtService jwtService;

    @Autowired
    private ObjectMapper objectMapper;
    
    @Autowired
    private UserRepository userRepository;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {

        OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
        OAuth2User oauth2User = oauthToken.getPrincipal();
        
        try {
            // Extract email from OAuth2 user
            String email = oauth2User.getAttribute("email");
            if (email == null) {
                log.error("Email not found in OAuth2 user attributes");
                redirectToLoginWithError(response, "Email không được tìm thấy trong tài khoản Google");
                return;
            }

            // Find user by email
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                log.warn("User not found with email: {}", email);
                redirectToLoginWithError(response, "Tài khoản không tồn tại trong hệ thống");
                return;
            }

            User user = userOpt.get();
            
            // Check if user has appropriate role for OAuth2 login
            String roleName = user.getRoleName();
            if (!"ADMIN".equals(roleName) && !"MANAGER".equals(roleName) && !"SCHOOLNURSE".equals(roleName)) {
                log.warn("Unauthorized role for OAuth2 login: {}", roleName);
                redirectToLoginWithError(response, "Tài khoản này không được phép đăng nhập bằng Google");
                return;
            }

            // Check if user needs to change password on first login
            boolean isFirstLogin = user.getFirstLogin() != null ? user.getFirstLogin() : false;
            if (isFirstLogin) {
                log.info("First-time login detected for OAuth2 user: {}", email);
                redirectToFirstTimeLogin(response, email);
                return;
            }

            // Generate JWT token for successful login
            String token = jwtService.generateTokenFromOAuth2User(oauthToken);

            // Redirect to frontend with success parameters
            String redirectUrl = String.format(
                "http://localhost:5173/oauth2/redirect?status=success&token=%s&username=%s&role=%s",
                URLEncoder.encode(token, StandardCharsets.UTF_8),
                URLEncoder.encode(user.getUsername(), StandardCharsets.UTF_8),
                URLEncoder.encode(roleName, StandardCharsets.UTF_8)
            );

            response.sendRedirect(redirectUrl);
            
        } catch (Exception e) {
            log.error("Error processing OAuth2 authentication success", e);
            redirectToLoginWithError(response, "Lỗi hệ thống trong quá trình đăng nhập");
        }
    }

    private void redirectToLoginWithError(HttpServletResponse response, String errorMessage) throws IOException {
        String errorType = determineErrorType(errorMessage);
        String redirectUrl = String.format(
            "http://localhost:5173/error?type=%s&message=%s",
            URLEncoder.encode(errorType, StandardCharsets.UTF_8),
            URLEncoder.encode(errorMessage, StandardCharsets.UTF_8)
        );
        response.sendRedirect(redirectUrl);
    }

    private String determineErrorType(String errorMessage) {
        if (errorMessage.contains("không được tìm thấy") || errorMessage.contains("Email")) {
            return "oauth_login_failed";
        } else if (errorMessage.contains("không tồn tại")) {
            return "user_not_found";
        } else if (errorMessage.contains("không được phép")) {
            return "unauthorized_role";
        } else if (errorMessage.contains("Lỗi hệ thống")) {
            return "system_error";
        }
        return "oauth_login_failed";
    }

    private void redirectToFirstTimeLogin(HttpServletResponse response, String email) throws IOException {
        String redirectUrl = String.format(
            "http://localhost:5173/login?firstTimeLogin=true&email=%s",
            URLEncoder.encode(email, StandardCharsets.UTF_8)
        );
        response.sendRedirect(redirectUrl);
    }
}

package group6.Swp391.Se1861.SchoolMedicalManagementSystem.config;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

/**
 * Handler for OAuth2 authentication failures
 * Redirects to frontend error page with appropriate error information
 */
@Component
@Slf4j
public class OAuth2AuthenticationFailureHandler extends SimpleUrlAuthenticationFailureHandler {

    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response,
                                        AuthenticationException exception) throws IOException, ServletException {
        
        log.error("OAuth2 authentication failed: {}", exception.getMessage(), exception);
        
        // Determine error type and message based on the exception
        String errorType = determineErrorType(exception);
        String errorMessage = determineErrorMessage(exception);
        
        // Build redirect URL to frontend error page
        String redirectUrl = String.format(
            "http://localhost:5173/error?type=%s&message=%s",
            URLEncoder.encode(errorType, StandardCharsets.UTF_8),
            URLEncoder.encode(errorMessage, StandardCharsets.UTF_8)
        );
        
        log.info("Redirecting OAuth2 failure to: {}", redirectUrl);
        response.sendRedirect(redirectUrl);
    }
    
    private String determineErrorType(AuthenticationException exception) {
        String exceptionType = exception.getClass().getSimpleName();
        String message = exception.getMessage();
        
        if (message != null) {
            if (message.contains("access_denied") || message.contains("User denied")) {
                return "oauth_access_denied";
            } else if (message.contains("invalid_client") || message.contains("unauthorized_client")) {
                return "oauth_client_error";
            } else if (message.contains("server_error") || message.contains("temporarily_unavailable")) {
                return "oauth_server_error";
            } else if (message.contains("invalid_request") || message.contains("invalid_grant")) {
                return "oauth_invalid_request";
            }
        }
        
        // Check exception types
        switch (exceptionType) {
            case "OAuth2AuthenticationException":
                return "oauth_login_failed";
            case "InternalAuthenticationServiceException":
                return "system_error";
            case "AuthenticationServiceException":
                return "oauth_server_error";
            default:
                return "oauth_login_failed";
        }
    }
    
    private String determineErrorMessage(AuthenticationException exception) {
        String exceptionMessage = exception.getMessage();
        
        if (exceptionMessage != null) {
            if (exceptionMessage.contains("access_denied") || exceptionMessage.contains("User denied")) {
                return "Bạn đã từ chối cấp quyền truy cập cho ứng dụng";
            } else if (exceptionMessage.contains("invalid_client")) {
                return "Cấu hình OAuth2 không hợp lệ";
            } else if (exceptionMessage.contains("server_error")) {
                return "Lỗi máy chủ Google OAuth2";
            } else if (exceptionMessage.contains("temporarily_unavailable")) {
                return "Dịch vụ Google OAuth2 tạm thời không khả dụng";
            } else if (exceptionMessage.contains("invalid_request")) {
                return "Yêu cầu OAuth2 không hợp lệ";
            }
        }
        
        // Default error messages based on exception type
        String exceptionType = exception.getClass().getSimpleName();
        switch (exceptionType) {
            case "OAuth2AuthenticationException":
                return "Đăng nhập Google thất bại";
            case "InternalAuthenticationServiceException":
                return "Lỗi hệ thống trong quá trình xác thực";
            case "AuthenticationServiceException":
                return "Lỗi dịch vụ xác thực";
            default:
                return "Đăng nhập Google thất bại: " + exceptionMessage;
        }
    }
}

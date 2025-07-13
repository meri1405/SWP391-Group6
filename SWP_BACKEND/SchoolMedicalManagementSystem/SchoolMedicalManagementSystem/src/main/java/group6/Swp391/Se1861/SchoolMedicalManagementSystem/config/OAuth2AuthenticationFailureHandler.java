package group6.Swp391.Se1861.SchoolMedicalManagementSystem.config;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
@Slf4j
public class OAuth2AuthenticationFailureHandler extends SimpleUrlAuthenticationFailureHandler {

    @Value("${app.oauth2.redirect-uri:http://localhost:5173/oauth2/redirect}")
    private String frontendRedirectUri;

    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response,
                                        AuthenticationException exception) throws IOException, ServletException {

        log.error("OAuth2 authentication failed: {}", exception.getMessage(), exception);

        String errorType = determineErrorType(exception);
        String errorMessage = determineErrorMessage(exception);

        // Get base frontend URL (remove path like /oauth2/redirect)
        String baseRedirectUrl = getBaseFrontendUrl();

        // Build error redirect URL
        String redirectUrl = String.format(
                "%s/error?type=%s&message=%s",
                baseRedirectUrl,
                URLEncoder.encode(errorType, StandardCharsets.UTF_8),
                URLEncoder.encode(errorMessage, StandardCharsets.UTF_8)
        );

        log.info("Redirecting OAuth2 failure to: {}", redirectUrl);
        response.sendRedirect(redirectUrl);
    }

    private String determineErrorType(AuthenticationException exception) {
        String type = exception.getClass().getSimpleName();
        String msg = exception.getMessage();

        if (msg != null) {
            if (msg.contains("access_denied") || msg.contains("User denied")) {
                return "oauth_access_denied";
            } else if (msg.contains("invalid_client") || msg.contains("unauthorized_client")) {
                return "oauth_client_error";
            } else if (msg.contains("server_error") || msg.contains("temporarily_unavailable")) {
                return "oauth_server_error";
            } else if (msg.contains("invalid_request") || msg.contains("invalid_grant")) {
                return "oauth_invalid_request";
            }
        }

        return switch (type) {
            case "OAuth2AuthenticationException" -> "oauth_login_failed";
            case "InternalAuthenticationServiceException" -> "system_error";
            case "AuthenticationServiceException" -> "oauth_server_error";
            default -> "oauth_login_failed";
        };
    }

    private String determineErrorMessage(AuthenticationException exception) {
        String msg = exception.getMessage();

        if (msg != null) {
            if (msg.contains("access_denied") || msg.contains("User denied")) {
                return "Bạn đã từ chối cấp quyền truy cập cho ứng dụng";
            } else if (msg.contains("invalid_client")) {
                return "Cấu hình OAuth2 không hợp lệ";
            } else if (msg.contains("server_error")) {
                return "Lỗi máy chủ Google OAuth2";
            } else if (msg.contains("temporarily_unavailable")) {
                return "Dịch vụ Google OAuth2 tạm thời không khả dụng";
            } else if (msg.contains("invalid_request")) {
                return "Yêu cầu OAuth2 không hợp lệ";
            }
        }

        return switch (exception.getClass().getSimpleName()) {
            case "OAuth2AuthenticationException" -> "Đăng nhập Google thất bại";
            case "InternalAuthenticationServiceException" -> "Lỗi hệ thống trong quá trình xác thực";
            case "AuthenticationServiceException" -> "Lỗi dịch vụ xác thực";
            default -> "Đăng nhập Google thất bại: " + msg;
        };
    }

    private String getBaseFrontendUrl() {
        try {
            URI uri = new URI(frontendRedirectUri);
            return uri.getScheme() + "://" + uri.getHost() + (uri.getPort() != -1 ? ":" + uri.getPort() : "");
        } catch (URISyntaxException e) {
            log.warn("Invalid frontendRedirectUri: {}", frontendRedirectUri);
            return "http://localhost:5173";
        }
    }
}

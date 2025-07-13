package group6.Swp391.Se1861.SchoolMedicalManagementSystem.config;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.AuthResponse;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.UserRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.impl.AuthService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Optional;

@Component
@Slf4j
public class CustomOAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final AuthService authService;
    private final UserRepository userRepository;

    @Value("${app.oauth2.redirect-uri:http://localhost:5173/oauth2/redirect}")
    private String frontendRedirectUri;

    @Autowired
    public CustomOAuth2AuthenticationSuccessHandler(@Lazy AuthService authService, UserRepository userRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        try {
            OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
            OAuth2User oauth2User = oauthToken.getPrincipal();

            String userEmail = oauth2User.getAttribute("email");
            log.info("OAuth2 authentication successful for user: {}", userEmail);

            if (userEmail == null) {
                log.error("Email not found in OAuth2 user attributes");
                redirectToError(response, "oauth_login_failed", "Email không được tìm thấy trong tài khoản Google");
                return;
            }

            Optional<User> userOpt = userRepository.findByEmail(userEmail);
            if (userOpt.isEmpty()) {
                log.warn("User not found with email: {}", userEmail);
                redirectToError(response, "user_not_found", "Tài khoản không tồn tại trong hệ thống");
                return;
            }

            User user = userOpt.get();

            String roleName = user.getRoleName();
            if (!"ADMIN".equals(roleName) && !"MANAGER".equals(roleName) && !"SCHOOLNURSE".equals(roleName)) {
                log.warn("Unauthorized role for OAuth2 login: {}", roleName);
                redirectToError(response, "unauthorized_role", "Tài khoản này không được phép đăng nhập bằng Google");
                return;
            }

            boolean isFirstLogin = user.getFirstLogin() != null ? user.getFirstLogin() : false;
            if (isFirstLogin) {
                log.info("First-time login detected for OAuth2 user: {}", userEmail);
                redirectToFirstTimeLogin(response, userEmail);
                return;
            }

            AuthResponse authResponse = authService.processOAuth2Login(oauthToken);

            String redirectUrl = UriComponentsBuilder.fromUriString(frontendRedirectUri)
                    .queryParam("token", authResponse.getToken())
                    .queryParam("username", authResponse.getUsername())
                    .queryParam("role", authResponse.getRoleName())
                    .queryParam("status", "success")
                    .build().toUriString();

            log.info("Redirecting successful OAuth2 login to: {}", redirectUrl);
            response.sendRedirect(redirectUrl);

        } catch (Exception e) {
            log.error("OAuth2 authentication error: {}", e.getMessage(), e);
            redirectToError(response, "system_error", "Lỗi hệ thống trong quá trình đăng nhập");
        }
    }

    private void redirectToError(HttpServletResponse response, String errorType, String errorMessage) throws IOException {
        String baseRedirectUrl = getBaseFrontendUrl();
        String redirectUrl = String.format(
                "%s/error?type=%s&message=%s",
                baseRedirectUrl,
                URLEncoder.encode(errorType, StandardCharsets.UTF_8),
                URLEncoder.encode(errorMessage, StandardCharsets.UTF_8)
        );
        log.info("Redirecting OAuth2 error to: {}", redirectUrl);
        response.sendRedirect(redirectUrl);
    }

    private void redirectToFirstTimeLogin(HttpServletResponse response, String email) throws IOException {
        String baseRedirectUrl = getBaseFrontendUrl();
        String redirectUrl = String.format(
                "%s/login?firstTimeLogin=true&email=%s",
                baseRedirectUrl,
                URLEncoder.encode(email, StandardCharsets.UTF_8)
        );
        log.info("Redirecting OAuth2 first-time login to: {}", redirectUrl);
        response.sendRedirect(redirectUrl);
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

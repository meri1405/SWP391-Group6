package group6.Swp391.Se1861.SchoolMedicalManagementSystem.config;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.AuthResponse;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;

@Component
public class CustomOAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final AuthService authService;

    @Value("${app.oauth2.redirect-uri:http://localhost:3000/auth/oauth2/callback}")
    private String frontendRedirectUri;

    // Default constructor (in case needed for Spring)
    public CustomOAuth2AuthenticationSuccessHandler() {
        this.authService = null;
    }

    @Autowired
    public CustomOAuth2AuthenticationSuccessHandler(@Lazy AuthService authService) {
        this.authService = authService;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        try {
            OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;

            // Get token from AuthService
            AuthResponse authResponse = authService.processOAuth2Login(oauthToken);

            // Build the frontend redirect URL with token, username, and role
            String redirectUrl = UriComponentsBuilder.fromUriString(frontendRedirectUri)
                    .queryParam("token", authResponse.getToken())
                    .queryParam("username", authResponse.getUsername())
                    .queryParam("role", authResponse.getRoleName())
                    .queryParam("status", "success")
                    .build().toUriString();

            // Validate and redirect
            if (isValidRedirectUrl(redirectUrl)) {
                response.sendRedirect(redirectUrl);
            } else {
                response.sendRedirect("/login/oauth2/success?token=" + authResponse.getToken());
            }

        } catch (Exception e) {
            System.err.println("OAuth2 authentication error: " + e.getMessage());
            e.printStackTrace();

            String errorRedirectUrl = UriComponentsBuilder.fromUriString(frontendRedirectUri)
                    .queryParam("error", "Authentication failed")
                    .queryParam("message", e.getMessage())
                    .build().toUriString();

            if (isValidRedirectUrl(errorRedirectUrl)) {
                response.sendRedirect(errorRedirectUrl);
            } else {
                response.sendRedirect("/login/oauth2/error?message=" + e.getMessage());
            }
        }
    }

    private boolean isValidRedirectUrl(String url) {
        try {
            URI uri = new URI(url);
            return true;
        } catch (URISyntaxException e) {
            return false;
        }
    }
}

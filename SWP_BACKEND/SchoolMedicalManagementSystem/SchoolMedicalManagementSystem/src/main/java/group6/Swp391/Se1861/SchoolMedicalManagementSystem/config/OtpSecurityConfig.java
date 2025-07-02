package group6.Swp391.Se1861.SchoolMedicalManagementSystem.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Security configuration for the OTP server endpoints
 * This configuration will be applied to the OTP server port only
 */
@Configuration
@EnableWebSecurity
public class OtpSecurityConfig {

    @Value("${otp.server.port:8082}")
    private int otpServerPort;

    /**
     * Security configuration for the OTP server
     * All requests to the OTP endpoints are allowed without authentication
     */
    @Bean
    @Order(1)
    public SecurityFilterChain otpSecurityFilterChain(HttpSecurity http) throws Exception {
        return http
                .securityMatcher(request -> {
                    int localPort = request.getLocalPort();
                    return localPort == otpServerPort;
                })
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/otp/**").permitAll()
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .build();
    }
}

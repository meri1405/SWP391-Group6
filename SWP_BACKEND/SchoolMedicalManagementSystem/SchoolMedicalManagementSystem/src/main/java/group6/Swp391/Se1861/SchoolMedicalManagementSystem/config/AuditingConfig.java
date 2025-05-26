package group6.Swp391.Se1861.SchoolMedicalManagementSystem.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

import java.util.Optional;

@Configuration
@EnableJpaAuditing
public class AuditingConfig {

    @Bean
    public AuditorAware<String> auditorProvider() {
        // For simplicity, we're returning a fixed value
        // In a real application, you'd return the current user's username
        return () -> Optional.of("System");
    }
}

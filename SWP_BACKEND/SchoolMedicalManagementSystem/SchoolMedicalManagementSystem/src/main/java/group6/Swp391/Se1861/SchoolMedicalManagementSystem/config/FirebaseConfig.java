package group6.Swp391.Se1861.SchoolMedicalManagementSystem.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;

@Configuration
public class FirebaseConfig {
    
    private static final Logger logger = LoggerFactory.getLogger(FirebaseConfig.class);
    
    @Value("${app.firebase.service-account-key-path:}")
    private Resource serviceAccountKeyPath;
    
    @Value("${app.firebase.project-id:}")
    private String projectId;
    
    @PostConstruct
    public void initialize() {
        try {
            if (FirebaseApp.getApps().isEmpty()) {
                if (serviceAccountKeyPath != null && serviceAccountKeyPath.exists()) {
                    InputStream serviceAccount = serviceAccountKeyPath.getInputStream();
                    
                    FirebaseOptions options = FirebaseOptions.builder()
                            .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                            .setProjectId(projectId)
                            .build();
                    
                    FirebaseApp.initializeApp(options);
                    logger.info("Firebase initialized successfully with project ID: {}", projectId);
                } else {
                    logger.warn("Firebase service account key not found. Firebase features will be limited.");
                    logger.info("To enable full Firebase functionality, add firebase-service-account-key.json to src/main/resources/");
                }
            }
        } catch (IOException e) {
            logger.error("Failed to initialize Firebase: {}", e.getMessage(), e);
        }
    }
}

package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.impl;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IUnitConversionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializationService implements ApplicationRunner {
    
    private final IUnitConversionService unitConversionService;
    
    @Override
    public void run(ApplicationArguments args) throws Exception {
        log.info("Starting data initialization...");
        initializeUnitConversions();
        log.info("Data initialization completed");
    }
    
    private void initializeUnitConversions() {
        try {
            log.info("Initializing unit conversions...");
            unitConversionService.seedDefaultConversions();
        } catch (Exception e) {
            log.error("Failed to initialize unit conversions", e);
        }
    }
}

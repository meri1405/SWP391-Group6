package group6.Swp391.Se1861.SchoolMedicalManagementSystem.config;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Annotation to mark endpoints that require ADMIN role access only.
 * The role name must be exactly "ADMIN" (uppercase).
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface AdminOnly {
    /**
     * Custom message to display when access is denied
     */
    String message() default "Access denied. ADMIN role required.";
    
    /**
     * Whether to enforce strict uppercase role checking
     */
    boolean strictCase() default true;
} 
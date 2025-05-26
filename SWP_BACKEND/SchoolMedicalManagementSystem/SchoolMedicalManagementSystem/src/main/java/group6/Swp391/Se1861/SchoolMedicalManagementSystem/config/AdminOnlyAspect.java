package group6.Swp391.Se1861.SchoolMedicalManagementSystem.config;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

/**
 * Aspect to handle @AdminOnly annotation
 * Ensures only users with ADMIN role (uppercase) can access protected endpoints
 */
@Aspect
@Component
public class AdminOnlyAspect {

    @Around("@annotation(adminOnly)")
    public Object checkAdminAccess(ProceedingJoinPoint joinPoint, AdminOnly adminOnly) throws Throwable {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            return createUnauthorizedResponse("Authentication required");
        }

        Object principal = authentication.getPrincipal();
        if (!(principal instanceof User)) {
            return createUnauthorizedResponse("Invalid user authentication");
        }

        User user = (User) principal;
        String userRole = user.getRole().getRoleName();
        
        // Check if user has ADMIN role (strict uppercase checking)
        if (adminOnly.strictCase()) {
            if (!"ADMIN".equals(userRole)) {
                return createForbiddenResponse(
                    adminOnly.message() + " Current role: " + userRole + ", Required: ADMIN"
                );
            }
        } else {
            if (!"ADMIN".equalsIgnoreCase(userRole)) {
                return createForbiddenResponse(
                    adminOnly.message() + " Current role: " + userRole + ", Required: ADMIN"
                );
            }
        }

        // User has ADMIN role, proceed with the method execution
        return joinPoint.proceed();
    }

    @Around("@within(adminOnly)")
    public Object checkAdminAccessForClass(ProceedingJoinPoint joinPoint, AdminOnly adminOnly) throws Throwable {
        return checkAdminAccess(joinPoint, adminOnly);
    }

    private ResponseEntity<?> createUnauthorizedResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("error", "Unauthorized");
        response.put("message", message);
        response.put("status", HttpStatus.UNAUTHORIZED.value());
        response.put("timestamp", System.currentTimeMillis());
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    private ResponseEntity<?> createForbiddenResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("error", "Forbidden");
        response.put("message", message);
        response.put("status", HttpStatus.FORBIDDEN.value());
        response.put("timestamp", System.currentTimeMillis());
        
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }
} 
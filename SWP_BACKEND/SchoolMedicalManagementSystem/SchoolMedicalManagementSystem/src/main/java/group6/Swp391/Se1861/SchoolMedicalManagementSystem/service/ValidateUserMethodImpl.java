package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * This file contains the complete validateUserByRole method to integrate into AuthService
 */
public class ValidateUserMethodImpl {
    private final PasswordEncoder passwordEncoder;

    public ValidateUserMethodImpl(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }
    /**
     * Complete implementation of validateUserByRole method
     */
    private void validateUserByRole(User user, String roleName) {
        // Common validations for all users
        if (user.getPhone() == null || user.getPhone().trim().isEmpty()) {
            throw new IllegalArgumentException("Phone number is required for all users");
        }

        if (user.getFirstName() == null || user.getFirstName().trim().isEmpty()) {
            throw new IllegalArgumentException("First name is required for all users");
        }

        if (user.getLastName() == null || user.getLastName().trim().isEmpty()) {
            throw new IllegalArgumentException("Last name is required for all users");
        }

        if (user.getDob() == null) {
            throw new IllegalArgumentException("Date of birth is required for all users");
        }

        if (user.getGender() == null || user.getGender().trim().isEmpty()) {
            throw new IllegalArgumentException("Gender is required for all users");
        }

        if (user.getAddress() == null || user.getAddress().trim().isEmpty()) {
            throw new IllegalArgumentException("Address is required for all users");
        }

        if (user.getJobTitle() == null || user.getJobTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Job title is required for all users");
        }

        // Role-specific validations
        if ("PARENT".equalsIgnoreCase(roleName)) {
            // For PARENT role, username, password, and email should be null
            user.setUsername(null);
            user.setPassword(null);
            user.setEmail(null);
        } else {
            // For all other roles, username, password and email are required
            if (user.getUsername() == null || user.getUsername().trim().isEmpty()) {
                throw new IllegalArgumentException("Username is required for " + roleName);
            }

            if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
                throw new IllegalArgumentException("Password is required for " + roleName);
            }

            // Encrypt password before saving if it doesn't look encrypted already
            if (!user.getPassword().startsWith("$2a$")) {
                user.setPassword(passwordEncoder.encode(user.getPassword()));
            }

            if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
                throw new IllegalArgumentException("Email is required for " + roleName);
            }
        }
    }
}

package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.impl;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.exception.ValidationException;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IValidateUserMethod;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * This file contains the complete validateUserByRole method to integrate into AuthService
 */
public class ValidateUserMethod implements IValidateUserMethod {
    private final PasswordEncoder passwordEncoder;

    public ValidateUserMethod(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }
    /**
     * Complete implementation of validateUserByRole method
     */
    @Override
    public void validateUserByRole(User user, String roleName) {
        // Common validations for all users
        if (user.getPhone() == null || user.getPhone().trim().isEmpty()) {
            throw new ValidationException("Phone number is required for all users");
        }

        if (user.getFirstName() == null || user.getFirstName().trim().isEmpty()) {
            throw new ValidationException("First name is required for all users");
        }

        if (user.getLastName() == null || user.getLastName().trim().isEmpty()) {
            throw new ValidationException("Last name is required for all users");
        }

        if (user.getDob() == null) {
            throw new ValidationException("Date of birth is required for all users");
        }

        if (user.getGender() == null || user.getGender().trim().isEmpty()) {
            throw new ValidationException("Gender is required for all users");
        }

        if (user.getAddress() == null || user.getAddress().trim().isEmpty()) {
            throw new ValidationException("Address is required for all users");
        }

        if (user.getJobTitle() == null || user.getJobTitle().trim().isEmpty()) {
            throw new ValidationException("Job title is required for all users");
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
                throw new ValidationException("Username is required for " + roleName);
            }

            if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
                throw new ValidationException("Password is required for " + roleName);
            }

            // Encrypt password before saving if it doesn't look encrypted already
            if (!user.getPassword().startsWith("$2a$")) {
                user.setPassword(passwordEncoder.encode(user.getPassword()));
            }

            if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
                throw new ValidationException("Email is required for " + roleName);
            }
        }
    }
}

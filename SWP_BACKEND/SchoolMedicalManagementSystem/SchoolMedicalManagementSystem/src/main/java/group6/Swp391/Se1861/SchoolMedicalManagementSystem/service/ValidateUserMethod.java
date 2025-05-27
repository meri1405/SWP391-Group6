package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service;

/**
 * This file contains the complete validateUserByRole method to be integrated into AuthService
 */
public class ValidateUserMethod {

    /**
     * Validates user data based on role-specific constraints
     */
    /*
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
        switch (roleName.toUpperCase()) {
            case "ADMIN", "SCHOOL_NURSE", "HEALTH_STAFF", "CAMPAIGN_MANAGER" -> {
                // These roles require username, password, and email
                if (user.getUsername() == null || user.getUsername().trim().isEmpty()) {
                    throw new IllegalArgumentException("Username is required for " + roleName);
                }

                if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
                    throw new IllegalArgumentException("Password is required for " + roleName);
                }

                // Encrypt password before saving
                user.setPassword(passwordEncoder.encode(user.getPassword()));

                if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
                    throw new IllegalArgumentException("Email is required for " + roleName);
                }
            }
            case "PARENT" -> {
                // For PARENT role, username, password, and email should be null
                // This will be handled by preprocessUserBeforeSave, but we'll set them here for clarity
                user.setUsername(null);
                user.setPassword(null);
                user.setEmail(null);
            }
            default -> throw new IllegalArgumentException("Unknown role: " + roleName);
        }
    }
    */
}

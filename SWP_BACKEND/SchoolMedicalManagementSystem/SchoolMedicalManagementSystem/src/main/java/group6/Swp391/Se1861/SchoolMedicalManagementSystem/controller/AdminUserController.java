package group6.Swp391.Se1861.SchoolMedicalManagementSystem.controller;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.config.AdminOnly;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.UserCreationDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.AuthService;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controller for admin user management operations
 * All endpoints in this controller require ADMIN role
 */
@RestController
@RequestMapping("/api/admin/users")
@AdminOnly(message = "Admin access required for all user management operations")
public class AdminUserController {

    private final AuthService authService;
    private final UserRepository userRepository;

    @Autowired
    public AdminUserController(AuthService authService, UserRepository userRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
    }

    /**
     * Create a new user with specified role
     * Role-specific validations are applied:
     * - For all roles: phone, firstName, lastName, dob, gender, address, jobTitle are required
     * - For ADMIN, SCHOOLNURSE, MANAGER: username, password, email are required
     * - For PARENT: username, password, email are ignored/nullified
     * - Phone number must be unique for all users regardless of role
     */
    @PostMapping("/create")
    public ResponseEntity<?> createUser(@RequestBody UserCreationDTO userCreationDTO) {
        try {
            // Handle user creation (no STUDENT support)
            return handleUserCreation(userCreationDTO);
        } catch (IllegalArgumentException e) {
            // Return validation errors
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Validation failed");
            errorResponse.put("message", e.getMessage());

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (Exception e) {
            // Return general server errors
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Server error");
            errorResponse.put("message", "An unexpected error occurred while creating the user");

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Handle user creation (excluding STUDENT role)
     */
    private ResponseEntity<?> handleUserCreation(UserCreationDTO userCreationDTO) {
        try {
            // Block STUDENT creation entirely
            if ("STUDENT".equalsIgnoreCase(userCreationDTO.getRoleName())) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Validation failed");
                errorResponse.put("message", "STUDENT creation is not supported through this endpoint.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }

            // Prevent creating PARENT users with username/password/email
            if ("PARENT".equalsIgnoreCase(userCreationDTO.getRoleName())) {
                if ((userCreationDTO.getUsername() != null && !userCreationDTO.getUsername().trim().isEmpty()) ||
                    (userCreationDTO.getPassword() != null && !userCreationDTO.getPassword().trim().isEmpty()) ||
                    (userCreationDTO.getEmail() != null && !userCreationDTO.getEmail().trim().isEmpty())) {

                    Map<String, Object> errorResponse = new HashMap<>();
                    errorResponse.put("error", "Validation failed");
                    errorResponse.put("message", "KHÔNG THỂ TẠO TÀI KHOẢN " + userCreationDTO.getRoleName() + ": Username, password và email không được phép đối với tài khoản " + userCreationDTO.getRoleName() + ". Vui lòng bỏ trống các trường này.");

                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
                }
            } else {
                // Check username requirements for other roles (ADMIN, SCHOOLNURSE, MANAGER)
                if (userCreationDTO.getUsername() == null || userCreationDTO.getUsername().trim().isEmpty()) {
                    Map<String, Object> errorResponse = new HashMap<>();
                    errorResponse.put("error", "Validation failed");
                    errorResponse.put("message", "Username là bắt buộc đối với vai trò " + userCreationDTO.getRoleName());

                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
                }

                // Check if username already exists
                if (authService.usernameExists(userCreationDTO.getUsername())) {
                    Map<String, Object> errorResponse = new HashMap<>();
                    errorResponse.put("error", "Validation failed");
                    errorResponse.put("message", "Username '" + userCreationDTO.getUsername() + "' đã được sử dụng. Vui lòng chọn username khác.");

                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
                }
            }

            // Map DTO to User entity
            User newUser = new User();
            newUser.setUsername(userCreationDTO.getUsername());
            newUser.setPassword(userCreationDTO.getPassword());
            newUser.setFirstName(userCreationDTO.getFirstName());
            newUser.setLastName(userCreationDTO.getLastName());
            newUser.setDob(userCreationDTO.getDob());
            newUser.setGender(userCreationDTO.getGender());
            newUser.setPhone(userCreationDTO.getPhone());
            newUser.setEmail(userCreationDTO.getEmail());
            newUser.setAddress(userCreationDTO.getAddress());
            newUser.setJobTitle(userCreationDTO.getJobTitle());
            
            // Set enabled status based on status field from frontend
            if (userCreationDTO.getStatus() != null) {
                newUser.setEnabled("ACTIVE".equalsIgnoreCase(userCreationDTO.getStatus()));
            } else {
                newUser.setEnabled(true); // Default to enabled if no status specified
            }

            // Use the createUserByAdmin method which applies role-specific validation
            User createdUser = authService.createUserByAdmin(newUser, userCreationDTO.getRoleName());

            // Return created user details (excluding sensitive info)
            Map<String, Object> response = new HashMap<>();
            response.put("message", "User created successfully");
            response.put("userId", createdUser.getId());
            response.put("fullName", createdUser.getFullName());
            response.put("role", createdUser.getRole().getRoleName());

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            // Return validation errors
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Validation failed");
            errorResponse.put("message", e.getMessage());

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (Exception e) {
            // Return general server errors
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Server error");
            errorResponse.put("message", "An unexpected error occurred while creating the user");

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Get all users in the system
     * Returns a list of all users with their details
     */
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        try {
            System.out.println("AdminUserController: getAllUsers() called");
            List<User> users = userRepository.findAll();
            System.out.println("AdminUserController: Found " + users.size() + " users in database");
            
            // Log each user for debugging
            for (int i = 0; i < users.size(); i++) {
                User user = users.get(i);
                System.out.println("AdminUserController: User " + (i+1) + " - ID: " + user.getId() + 
                                 ", Username: " + user.getUsername() + 
                                 ", Name: " + user.getFullName() + 
                                 ", Role: " + (user.getRole() != null ? user.getRole().getRoleName() : "null"));
            }
            
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            System.err.println("AdminUserController: Error fetching users: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    /**
     * Toggle user status (enable/disable)
     * @param userId The ID of the user to toggle
     * @return ResponseEntity with the updated user status
     */
    @PutMapping("/{userId}/toggle-status")
    public ResponseEntity<?> toggleUserStatus(@PathVariable Long userId) {
        try {
            System.out.println("AdminUserController: toggleUserStatus() called for user ID: " + userId);
            
            // Find the user
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "User not found");
                errorResponse.put("message", "User with ID " + userId + " not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            }
            
            // Toggle the enabled status
            boolean oldStatus = user.isEnabled();
            user.setEnabled(!oldStatus);
            
            // Save the updated user
            User updatedUser = userRepository.save(user);
            
            System.out.println("AdminUserController: User " + userId + " status changed from " + oldStatus + " to " + updatedUser.isEnabled());
            
            // Prepare response
            Map<String, Object> response = new HashMap<>();
            response.put("message", "User status updated successfully");
            response.put("userId", updatedUser.getId());
            response.put("userName", updatedUser.getFullName());
            response.put("enabled", updatedUser.isEnabled());
            response.put("previousStatus", oldStatus);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("AdminUserController: Error toggling user status: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Server error");
            errorResponse.put("message", "An unexpected error occurred while updating user status");
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}





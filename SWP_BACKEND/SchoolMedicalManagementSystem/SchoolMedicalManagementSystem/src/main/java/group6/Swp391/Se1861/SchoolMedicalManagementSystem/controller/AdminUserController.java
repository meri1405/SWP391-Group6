package group6.Swp391.Se1861.SchoolMedicalManagementSystem.controller;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.config.AdminOnly;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.UserCreationDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
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

    @Autowired
    public AdminUserController(AuthService authService) {
        this.authService = authService;
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
            // Ngăn chặn việc tạo user PARENT nếu có username/password/email
            if ("PARENT".equalsIgnoreCase(userCreationDTO.getRoleName())) {
                if ((userCreationDTO.getUsername() != null && !userCreationDTO.getUsername().trim().isEmpty()) ||
                    (userCreationDTO.getPassword() != null && !userCreationDTO.getPassword().trim().isEmpty()) ||
                    (userCreationDTO.getEmail() != null && !userCreationDTO.getEmail().trim().isEmpty())) {

                    Map<String, Object> errorResponse = new HashMap<>();
                    errorResponse.put("error", "Validation failed");
                    errorResponse.put("message", "KHÔNG THỂ TẠO TÀI KHOẢN PARENT: Username, password và email không được phép đối với tài khoản PARENT. Vui lòng bỏ trống các trường này.");

                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
                }
            } else {
                // Kiểm tra username duy nhất cho các role khác PARENT
                if (userCreationDTO.getUsername() == null || userCreationDTO.getUsername().trim().isEmpty()) {
                    Map<String, Object> errorResponse = new HashMap<>();
                    errorResponse.put("error", "Validation failed");
                    errorResponse.put("message", "Username là bắt buộc đối với vai trò " + userCreationDTO.getRoleName());

                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
                }

                // Kiểm tra username đã tồn tại chưa
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

            // Use the createUserByAdmin method which applies role-specific validation
            User createdUser = authService.createUserByAdmin(newUser, userCreationDTO.getRoleName());

            // Return created user details (excluding sensitive info)
            Map<String, Object> response = new HashMap<>();
            response.put("message", "User created successfully");
            response.put("userId", createdUser.getId());
            response.put("fullName", createdUser.getFirstName() + " " + createdUser.getLastName());
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
}

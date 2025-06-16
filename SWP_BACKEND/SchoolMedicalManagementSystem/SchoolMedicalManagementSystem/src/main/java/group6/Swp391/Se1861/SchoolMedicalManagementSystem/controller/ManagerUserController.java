package group6.Swp391.Se1861.SchoolMedicalManagementSystem.controller;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.UserCreationDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IAuthService;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.impl.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/manager/users")
@PreAuthorize("hasRole('MANAGER')")
public class ManagerUserController {

    private final IAuthService authService;

    @Autowired
    public ManagerUserController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/create")
    public ResponseEntity<?> createUser(@Valid @RequestBody UserCreationDTO userCreationDTO) {
        try {
            // Only allow creating PARENT role
            if (!"PARENT".equalsIgnoreCase(userCreationDTO.getRoleName())) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Validation error");
                errorResponse.put("message", "Managers can only create PARENT accounts");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }

            // Create new user entity and map all fields from DTO
            User newUser = new User();
            // Required fields
            newUser.setFirstName(userCreationDTO.getFirstName());
            newUser.setLastName(userCreationDTO.getLastName());
            newUser.setDob(userCreationDTO.getDob());
            newUser.setGender(userCreationDTO.getGender());
            newUser.setPhone(userCreationDTO.getPhone());
            newUser.setAddress(userCreationDTO.getAddress());
            
            // Optional fields with defaults
            newUser.setJobTitle(userCreationDTO.getJobTitle() != null ? userCreationDTO.getJobTitle() : "Parent");
            newUser.setEmail(null);  // Parent accounts don't need email
            newUser.setUsername(null);  // Parent accounts don't need username
            newUser.setPassword(null);  // Parent accounts don't need password
            
            // Set enabled status
            newUser.setEnabled(true);  // Always enable parent accounts by default

            // Create user with PARENT role
            User createdUser = authService.createUserByAdmin(newUser, "PARENT");

            // Return response with user info
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Parent created successfully");
            response.put("userId", createdUser.getId());
            response.put("roleId", createdUser.getRole().getId());  // Include roleId for student relationship
            response.put("fullName", createdUser.getFullName());
            response.put("role", createdUser.getRole().getRoleName());
            response.put("phone", createdUser.getPhone());
            response.put("address", createdUser.getAddress());
            response.put("dob", createdUser.getDob());
            response.put("gender", createdUser.getGender());
            response.put("jobTitle", createdUser.getJobTitle());

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Validation error");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Server error");
            errorResponse.put("message", "An unexpected error occurred while creating the user");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
} 
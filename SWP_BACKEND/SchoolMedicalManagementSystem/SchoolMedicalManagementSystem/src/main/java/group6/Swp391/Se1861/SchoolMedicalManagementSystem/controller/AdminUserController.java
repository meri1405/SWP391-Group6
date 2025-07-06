package group6.Swp391.Se1861.SchoolMedicalManagementSystem.controller;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.UserCreationDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IAuthService;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.impl.AuthService;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controller quản lý người dùng dành cho Admin
 * Tất cả endpoint trong controller này yêu cầu vai trò ADMIN
 * 
 * Chức năng chính:
 * - Tạo tài khoản staff (ADMIN, MANAGER, SCHOOLNURSE)
 * - Liệt kê tất cả người dùng trong hệ thống
 * - Kích hoạt/vô hiệu hóa tài khoản
 * - Auto-generate username và password cho staff
 */
@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final IAuthService authService;
    private final UserRepository userRepository;

    @Autowired
    public AdminUserController(AuthService authService, UserRepository userRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
    }

    /**
     * Tạo tài khoản staff với vai trò được chỉ định
     * Chỉ hỗ trợ các vai trò: ADMIN, MANAGER, SCHOOLNURSE
     * Tự động tạo username và password, gửi thông tin qua email
     * 
     * @param userCreationDTO Thông tin người dùng cần tạo
     * @return ResponseEntity chứa thông tin người dùng đã tạo hoặc lỗi
     */
    @PostMapping("/create")
    public ResponseEntity<?> createUser(@RequestBody UserCreationDTO userCreationDTO) {
        try {
            // Xử lý tạo tài khoản staff
            return handleStaffCreation(userCreationDTO);
        } catch (IllegalArgumentException e) {
            // Trả về lỗi validation
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Lỗi validation");
            errorResponse.put("message", e.getMessage());

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (Exception e) {
            // Trả về lỗi server chung
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Lỗi server");
            errorResponse.put("message", "Đã xảy ra lỗi không mong muốn khi tạo người dùng");

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Xử lý logic tạo tài khoản staff (ADMIN, MANAGER, SCHOOLNURSE)
     * 
     * @param userCreationDTO Thông tin người dùng
     * @return ResponseEntity với kết quả tạo tài khoản
     */
    private ResponseEntity<?> handleStaffCreation(UserCreationDTO userCreationDTO) {
        try {
            // Chỉ cho phép tạo các vai trò staff
            String roleName = userCreationDTO.getRoleName();
            if (!"ADMIN".equalsIgnoreCase(roleName) && 
                !"MANAGER".equalsIgnoreCase(roleName) && 
                !"SCHOOLNURSE".equalsIgnoreCase(roleName)) {
                
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Lỗi validation");
                errorResponse.put("message", "Admin chỉ có thể tạo tài khoản staff (ADMIN, MANAGER, SCHOOLNURSE). Vai trò '" + roleName + "' không được hỗ trợ.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }

            // Kiểm tra username nếu được cung cấp (thường sẽ auto-generate)
            if (userCreationDTO.getUsername() != null && !userCreationDTO.getUsername().trim().isEmpty()) {
                if (authService.usernameExists(userCreationDTO.getUsername())) {
                    Map<String, Object> errorResponse = new HashMap<>();
                    errorResponse.put("error", "Lỗi validation");
                    errorResponse.put("message", "Username '" + userCreationDTO.getUsername() + "' đã được sử dụng. Vui lòng chọn username khác.");
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
                }
            }

            // Chuyển đổi DTO thành User entity
            User newUser = new User();
            
            // Only set username and password if they are provided (not null/empty)
            // For staff roles without username/password, they will be auto-generated in AuthService
            if (userCreationDTO.getUsername() != null && !userCreationDTO.getUsername().trim().isEmpty()) {
                newUser.setUsername(userCreationDTO.getUsername());
            }
            if (userCreationDTO.getPassword() != null && !userCreationDTO.getPassword().trim().isEmpty()) {
                newUser.setPassword(userCreationDTO.getPassword());
            }
            
            newUser.setFirstName(userCreationDTO.getFirstName());
            newUser.setLastName(userCreationDTO.getLastName());
            newUser.setDob(userCreationDTO.getDob());
            newUser.setGender(userCreationDTO.getGender());
            newUser.setPhone(userCreationDTO.getPhone());
            newUser.setEmail(userCreationDTO.getEmail());
            newUser.setAddress(userCreationDTO.getAddress());
            newUser.setJobTitle(userCreationDTO.getJobTitle());
            
            // Thiết lập trạng thái kích hoạt dựa trên trường status từ frontend
            if (userCreationDTO.getStatus() != null) {
                newUser.setEnabled("ACTIVE".equalsIgnoreCase(userCreationDTO.getStatus()));
            } else {
                newUser.setEnabled(true); // Mặc định kích hoạt nếu không chỉ định status
            }

            // Sử dụng method createUserByAdmin áp dụng validation theo vai trò
            User createdUser = authService.createUserByAdmin(newUser, userCreationDTO.getRoleName());

            // Trả về thông tin người dùng đã tạo (loại bỏ thông tin nhạy cảm)
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Tạo người dùng thành công");
            response.put("userId", createdUser.getId());
            response.put("username", createdUser.getUsername()); // Include generated username
            response.put("fullName", createdUser.getFullName());
            response.put("role", createdUser.getRole().getRoleName());
            
            // Add information about credential delivery for staff roles
            String userRoleName = createdUser.getRole().getRoleName();
            if ("ADMIN".equalsIgnoreCase(userRoleName) || "MANAGER".equalsIgnoreCase(userRoleName) || "SCHOOLNURSE".equalsIgnoreCase(userRoleName)) {
                response.put("credentialsSent", true);
                response.put("emailSentTo", createdUser.getEmail());
                response.put("firstLogin", true);
            }

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            // Trả về lỗi validation
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Lỗi validation");
            errorResponse.put("message", e.getMessage());

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (Exception e) {
            // Trả về lỗi server chung
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Lỗi server");
            errorResponse.put("message", "Đã xảy ra lỗi không mong muốn khi tạo người dùng");

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Lấy danh sách tất cả người dùng trong hệ thống
     * Trả về danh sách tất cả người dùng với thông tin chi tiết
     * 
     * @return ResponseEntity chứa danh sách người dùng
     */
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        try {
            System.out.println("AdminUserController: getAllUsers() được gọi");
            List<User> users = userRepository.findAll();
            System.out.println("AdminUserController: Tìm thấy " + users.size() + " người dùng trong database");
            
            // Log từng người dùng để debug
            for (int i = 0; i < users.size(); i++) {
                User user = users.get(i);
                System.out.println("AdminUserController: Người dùng " + (i+1) + " - ID: " + user.getId() + 
                                 ", Username: " + user.getUsername() + 
                                 ", Tên: " + user.getFullName() + 
                                 ", Vai trò: " + (user.getRole() != null ? user.getRole().getRoleName() : "null"));
            }
            
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            System.err.println("AdminUserController: Lỗi khi lấy danh sách người dùng: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    /**
     * Chuyển đổi trạng thái người dùng (kích hoạt/vô hiệu hóa)
     * 
     * @param userId ID của người dùng cần chuyển đổi trạng thái
     * @return ResponseEntity với trạng thái người dùng đã cập nhật
     */
    @PutMapping("/{userId}/toggle-status")
    public ResponseEntity<?> toggleUserStatus(@PathVariable Long userId) {
        try {
            System.out.println("AdminUserController: toggleUserStatus() được gọi cho user ID: " + userId);
            
            // Tìm người dùng
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Không tìm thấy người dùng");
                errorResponse.put("message", "Không tìm thấy người dùng với ID: " + userId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            }

            // Chuyển đổi trạng thái
            user.setEnabled(!user.isEnabled());
            userRepository.save(user);

            System.out.println("AdminUserController: Đã cập nhật trạng thái người dùng ID " + userId + " thành: " + user.isEnabled());

            // Tạo response
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Cập nhật trạng thái người dùng thành công");
            response.put("userId", user.getId());
            response.put("username", user.getUsername());
            response.put("enabled", user.isEnabled());
            response.put("status", user.isEnabled() ? "ACTIVE" : "INACTIVE");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("AdminUserController: Lỗi khi chuyển đổi trạng thái người dùng: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Lỗi server");
            errorResponse.put("message", "Đã xảy ra lỗi khi cập nhật trạng thái người dùng");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}

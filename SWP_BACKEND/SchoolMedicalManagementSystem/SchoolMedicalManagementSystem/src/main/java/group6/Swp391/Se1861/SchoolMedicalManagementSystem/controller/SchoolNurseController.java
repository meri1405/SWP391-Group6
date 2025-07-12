package group6.Swp391.Se1861.SchoolMedicalManagementSystem.controller;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/school-nurse")
public class SchoolNurseController {
    @Autowired
    private UserRepository userRepository;

    @GetMapping("/profile")
    public ResponseEntity<?> getSchoolNurseProfile(@AuthenticationPrincipal User schoolNurse) {
        Map<String, Object> profile = new HashMap<>();
        profile.put("id", schoolNurse.getId());
        profile.put("firstName", schoolNurse.getFirstName());
        profile.put("lastName", schoolNurse.getLastName());
        profile.put("phone", schoolNurse.getPhone());
        profile.put("email", schoolNurse.getEmail());
        profile.put("address", schoolNurse.getAddress());
        profile.put("jobTitle", schoolNurse.getJobTitle());
        profile.put("username", schoolNurse.getUsername());

        // Định dạng ngày sinh theo chuẩn ISO nếu tồn tại
        if (schoolNurse.getDob() != null) {
            // Định dạng ngày theo chuẩn ISO (YYYY-MM-DD)
            String formattedDate = schoolNurse.getDob().format(DateTimeFormatter.ISO_LOCAL_DATE);
            profile.put("dateOfBirth", formattedDate);
        } else {
            profile.put("dateOfBirth", null);
        }

        profile.put("gender", schoolNurse.getGender());
        profile.put("role", schoolNurse.getRole().getRoleName());

        // Debug print
        System.out.println("Trả về hồ sơ phụ huynh với ngày sinh: " +
                (schoolNurse.getDob() != null ? schoolNurse.getDob().toString() : "null") +
                " và nghề nghiệp: " + schoolNurse.getJobTitle());

        return ResponseEntity.ok(profile);
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateSchoolNurseProfile(
            @RequestBody Map<String, Object> profileData,
            @AuthenticationPrincipal User schoolNurse) {

        try {
            // Cập nhật thông tin phụ huynh với dữ liệu được cung cấp
            boolean updated = false;

            // Cập nhật tên nếu được cung cấp
            if (profileData.containsKey("firstName") && profileData.get("firstName") != null) {
                String firstName = profileData.get("firstName").toString().trim();
                if (!firstName.isEmpty()) {
                    schoolNurse.setFirstName(firstName);
                    updated = true;
                }
            }

            // Cập nhật họ nếu được cung cấp
            if (profileData.containsKey("lastName") && profileData.get("lastName") != null) {
                String lastName = profileData.get("lastName").toString().trim();
                if (!lastName.isEmpty()) {
                    schoolNurse.setLastName(lastName);
                    updated = true;
                }
            }

            // Cập nhật số điện thoại nếu được cung cấp
            if (profileData.containsKey("phone") && profileData.get("phone") != null) {
                String phone = profileData.get("phone").toString().trim();
                if (!phone.isEmpty()) {
                    // Kiểm tra số điện thoại đã được sử dụng bởi người dùng khác chưa
                    if (userRepository.findByPhone(phone).isPresent() &&
                            !userRepository.findByPhone(phone).get().getId().equals(schoolNurse.getId())) {
                        Map<String, Object> errorResponse = new HashMap<>();
                        errorResponse.put("error", "Số điện thoại đã được sử dụng");
                        errorResponse.put("message", "Số điện thoại này đã được đăng ký bởi người dùng khác");
                        return ResponseEntity.badRequest().body(errorResponse);
                    }
                    schoolNurse.setPhone(phone);
                    updated = true;
                }
            }

            // Cập nhật địa chỉ nếu được cung cấp
            if (profileData.containsKey("address")) {
                String address = profileData.get("address") != null ?
                        profileData.get("address").toString().trim() : "";
                schoolNurse.setAddress(address);
                System.out.println("Địa chỉ được cập nhật thành: " + address);
                updated = true;
            }

            // Cập nhật nghề nghiệp nếu được cung cấp
            if (profileData.containsKey("jobTitle")) {
                String jobTitle = profileData.get("jobTitle") != null ?
                        profileData.get("jobTitle").toString().trim() :
                        "SCHOOLNURSE";  // Giá trị mặc định nếu null
                schoolNurse.setJobTitle(jobTitle);
                System.out.println("Nghề nghiệp được cập nhật thành: " + jobTitle);
                updated = true;
            }

            // Cập nhật ngày sinh nếu được cung cấp
            if (profileData.containsKey("dateOfBirth")) {
                try {
                    String dobString = profileData.get("dateOfBirth") != null ?
                            profileData.get("dateOfBirth").toString().trim() : "";

                    if (!dobString.isEmpty()) {
                        // Cải thiện việc parse ngày với xử lý lỗi tốt hơn
                        LocalDate dob;
                        try {
                            // Thử định dạng ISO chuẩn trước (YYYY-MM-DD)
                            dob = LocalDate.parse(dobString, DateTimeFormatter.ISO_LOCAL_DATE);
                        } catch (Exception e1) {
                            try {
                                // Thử định dạng thay thế làm fallback
                                dob = LocalDate.parse(dobString, DateTimeFormatter.ofPattern("yyyy-MM-dd"));
                            } catch (Exception e2) {
                                throw new IllegalArgumentException("Không thể parse ngày: " + dobString);
                            }
                        }

                        schoolNurse.setDob(dob);
                        System.out.println("Ngày sinh được cập nhật thành: " + dob);
                        updated = true;
                    }
                } catch (Exception e) {
                    e.printStackTrace(); // Log lỗi để troubleshoot
                    Map<String, Object> errorResponse = new HashMap<>();
                    errorResponse.put("error", "Định dạng ngày không hợp lệ");
                    errorResponse.put("message", "Ngày sinh phải theo định dạng YYYY-MM-DD. Lỗi: " + e.getMessage());
                    return ResponseEntity.badRequest().body(errorResponse);
                }
            }

            // Cập nhật giới tính nếu được cung cấp
            if (profileData.containsKey("gender") && profileData.get("gender") != null) {
                String gender = profileData.get("gender").toString().trim().toUpperCase();
                if (gender.equals("M") || gender.equals("F")) {
                    schoolNurse.setGender(gender);
                    updated = true;
                } else if (!gender.isEmpty()) {
                    Map<String, Object> errorResponse = new HashMap<>();
                    errorResponse.put("error", "Giới tính không hợp lệ");
                    errorResponse.put("message", "Giới tính phải là 'M' hoặc 'F'");
                    return ResponseEntity.badRequest().body(errorResponse);
                }
            }

            // Lưu thay đổi nếu có cập nhật
            if (updated) {
                userRepository.save(schoolNurse);
            }

            // Trả về thông tin hồ sơ đã cập nhật
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Cập nhật hồ sơ thành công");

            Map<String, Object> updatedProfile = new HashMap<>();
            updatedProfile.put("id", schoolNurse.getId());
            updatedProfile.put("firstName", schoolNurse.getFirstName());
            updatedProfile.put("lastName", schoolNurse.getLastName());
            updatedProfile.put("phone", schoolNurse.getPhone());
            updatedProfile.put("email", schoolNurse.getEmail());
            updatedProfile.put("address", schoolNurse.getAddress());
            updatedProfile.put("jobTitle", schoolNurse.getJobTitle());

            // Định dạng ngày theo chuẩn ISO
            if (schoolNurse.getDob() != null) {
                // Định dạng ngày theo chuẩn ISO (YYYY-MM-DD)
                String formattedDate = schoolNurse.getDob().format(DateTimeFormatter.ISO_LOCAL_DATE);
                updatedProfile.put("dateOfBirth", formattedDate);
            } else {
                updatedProfile.put("dateOfBirth", null);
            }

            updatedProfile.put("gender", schoolNurse.getGender());
            updatedProfile.put("role", schoolNurse.getRole().getRoleName());

            response.put("profile", updatedProfile);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Update failed");
            errorResponse.put("message", "An error occurred while updating the profile: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }    
    
    /**
     * Get medication schedules for all children of the parent
     */
}

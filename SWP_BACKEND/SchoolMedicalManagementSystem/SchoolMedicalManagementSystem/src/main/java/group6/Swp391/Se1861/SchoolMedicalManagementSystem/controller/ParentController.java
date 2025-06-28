package group6.Swp391.Se1861.SchoolMedicalManagementSystem.controller;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.Student;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.MedicationSchedule;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.MedicationStatus;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.UserRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.StudentRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.HealthProfileRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.MedicationScheduleRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IMedicationScheduleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Controller dành cho phụ huynh
 * Cung cấp các API để phụ huynh quản lý thông tin cá nhân và theo dõi con em
 * 
 * Chức năng chính:
 * - Xem và cập nhật thông tin cá nhân phụ huynh
 * - Theo dõi lịch uống thuốc của con
 * - Xem thông tin học sinh (con em)
 * - Quản lý yêu cầu thuốc
 * 
 * Bảo mật: Chỉ cho phép truy cập với vai trò PARENT
 */
@RestController
@RequestMapping("/api/parent")
@PreAuthorize("hasRole('PARENT')")  // Chỉ phụ huynh mới có thể truy cập các endpoint này
public class ParentController {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private StudentRepository studentRepository;
    
    @Autowired
    private HealthProfileRepository healthProfileRepository;
    
    @Autowired
    private MedicationScheduleRepository medicationScheduleRepository;
    
    @Autowired
    private IMedicationScheduleService medicationScheduleService;

    /**
     * Lấy thông tin hồ sơ phụ huynh
     * Trả về thông tin cá nhân của phụ huynh đang đăng nhập
     * 
     * @param parent Phụ huynh đã xác thực
     * @return ResponseEntity chứa thông tin hồ sơ phụ huynh
     */    
    @GetMapping("/profile")
    public ResponseEntity<?> getParentProfile(@AuthenticationPrincipal User parent) {
        Map<String, Object> profile = new HashMap<>();
        profile.put("id", parent.getId());
        profile.put("firstName", parent.getFirstName());
        profile.put("lastName", parent.getLastName());
        profile.put("phone", parent.getPhone());
        profile.put("email", parent.getEmail());
        profile.put("address", parent.getAddress());
        profile.put("jobTitle", parent.getJobTitle());
        
        // Định dạng ngày sinh theo chuẩn ISO nếu tồn tại
        if (parent.getDob() != null) {
            // Định dạng ngày theo chuẩn ISO (YYYY-MM-DD)
            String formattedDate = parent.getDob().format(DateTimeFormatter.ISO_LOCAL_DATE);
            profile.put("dateOfBirth", formattedDate);
        } else {
            profile.put("dateOfBirth", null);
        }
        
        profile.put("gender", parent.getGender());
        profile.put("role", parent.getRole().getRoleName());
        
        // Debug print
        System.out.println("Trả về hồ sơ phụ huynh với ngày sinh: " + 
                          (parent.getDob() != null ? parent.getDob().toString() : "null") + 
                          " và nghề nghiệp: " + parent.getJobTitle());
        
        return ResponseEntity.ok(profile);
    }

    /**
     * Cập nhật thông tin hồ sơ phụ huynh
     * Cho phép phụ huynh chỉnh sửa thông tin cá nhân
     * 
     * @param profileData Dữ liệu hồ sơ cần cập nhật
     * @param parent Phụ huynh đã xác thực
     * @return ResponseEntity với thông tin đã cập nhật hoặc lỗi
     */
    @PutMapping("/profile")
    public ResponseEntity<?> updateParentProfile(
            @RequestBody Map<String, Object> profileData,
            @AuthenticationPrincipal User parent) {
        
        try {
            // Cập nhật thông tin phụ huynh với dữ liệu được cung cấp
            boolean updated = false;

            // Cập nhật tên nếu được cung cấp
            if (profileData.containsKey("firstName") && profileData.get("firstName") != null) {
                String firstName = profileData.get("firstName").toString().trim();
                if (!firstName.isEmpty()) {
                    parent.setFirstName(firstName);
                    updated = true;
                }
            }

            // Cập nhật họ nếu được cung cấp
            if (profileData.containsKey("lastName") && profileData.get("lastName") != null) {
                String lastName = profileData.get("lastName").toString().trim();
                if (!lastName.isEmpty()) {
                    parent.setLastName(lastName);
                    updated = true;
                }
            }

            // Cập nhật số điện thoại nếu được cung cấp
            if (profileData.containsKey("phone") && profileData.get("phone") != null) {
                String phone = profileData.get("phone").toString().trim();
                if (!phone.isEmpty()) {
                    // Kiểm tra số điện thoại đã được sử dụng bởi người dùng khác chưa
                    if (userRepository.findByPhone(phone).isPresent() && 
                        !userRepository.findByPhone(phone).get().getId().equals(parent.getId())) {
                        Map<String, Object> errorResponse = new HashMap<>();
                        errorResponse.put("error", "Số điện thoại đã được sử dụng");
                        errorResponse.put("message", "Số điện thoại này đã được đăng ký bởi người dùng khác");
                        return ResponseEntity.badRequest().body(errorResponse);
                    }
                    parent.setPhone(phone);
                    updated = true;
                }
            }            
            
            // Cập nhật địa chỉ nếu được cung cấp
            if (profileData.containsKey("address")) {
                String address = profileData.get("address") != null ? 
                    profileData.get("address").toString().trim() : "";
                parent.setAddress(address);
                System.out.println("Địa chỉ được cập nhật thành: " + address);
                updated = true;
            }
            
            // Cập nhật nghề nghiệp nếu được cung cấp
            if (profileData.containsKey("jobTitle")) {
                String jobTitle = profileData.get("jobTitle") != null ? 
                    profileData.get("jobTitle").toString().trim() : 
                    "PARENT";  // Giá trị mặc định nếu null
                parent.setJobTitle(jobTitle);
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
                        
                        parent.setDob(dob);
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
                    parent.setGender(gender);
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
                userRepository.save(parent);
            }

            // Trả về thông tin hồ sơ đã cập nhật
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Cập nhật hồ sơ thành công");
            
            Map<String, Object> updatedProfile = new HashMap<>();
            updatedProfile.put("id", parent.getId());
            updatedProfile.put("firstName", parent.getFirstName());
            updatedProfile.put("lastName", parent.getLastName());
            updatedProfile.put("phone", parent.getPhone());
            updatedProfile.put("email", parent.getEmail());
            updatedProfile.put("address", parent.getAddress());
            updatedProfile.put("jobTitle", parent.getJobTitle());
            
            // Định dạng ngày theo chuẩn ISO
            if (parent.getDob() != null) {
                // Định dạng ngày theo chuẩn ISO (YYYY-MM-DD)
                String formattedDate = parent.getDob().format(DateTimeFormatter.ISO_LOCAL_DATE);
                updatedProfile.put("dateOfBirth", formattedDate);
            } else {
                updatedProfile.put("dateOfBirth", null);
            }
            
            updatedProfile.put("gender", parent.getGender());
            updatedProfile.put("role", parent.getRole().getRoleName());
            
            response.put("profile", updatedProfile);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Update failed");
            errorResponse.put("message", "An error occurred while updating the profile: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }    /**
     * Get medication schedules for all children of the parent
     */
    @GetMapping("/medication-schedules")
    public ResponseEntity<?> getAllChildrenMedicationSchedules(
            @AuthenticationPrincipal User parent,
            @RequestParam(required = false) String date,
            @RequestParam(required = false) String status) {
        try {
            // Get all students of this parent
            List<Student> parentStudents = studentRepository.findByParent(parent);

            // Always return student list in response, even if no schedules
            Map<String, Object> response = new HashMap<>();
            
            if (parentStudents.isEmpty()) {
                response.put("schedules", List.of());
                response.put("students", List.of());
                return ResponseEntity.ok(response);
            }
            
            List<Long> studentIds = parentStudents.stream()
                    .map(Student::getStudentID)
                    .collect(Collectors.toList());
            
            List<MedicationSchedule> schedules = new ArrayList<>();
            
            // Fetch all schedules for each student ID
            for (Long studentId : studentIds) {
                List<MedicationSchedule> studentSchedules = medicationScheduleRepository
                    .findByItemRequestMedicationRequestStudentStudentID(studentId);
                schedules.addAll(studentSchedules);
            }

            // Filter by APPROVED medication request status first
            schedules = schedules.stream()
                .filter(schedule -> "APPROVED".equals(schedule.getItemRequest().getMedicationRequest().getStatus()))
                .collect(Collectors.toList());

            // Filter by date and status if provided
            if (date != null && !date.isEmpty()) {
                LocalDate targetDate = LocalDate.parse(date);
                schedules = schedules.stream()
                    .filter(schedule -> schedule.getScheduledDate().equals(targetDate))
                    .collect(Collectors.toList());
            }

            if (status != null && !status.isEmpty() && !status.equals("ALL")) {
                MedicationStatus medicationStatus = MedicationStatus.valueOf(status);
                schedules = schedules.stream()
                    .filter(schedule -> schedule.getStatus() == medicationStatus)
                    .collect(Collectors.toList());
            }
            
            // Prepare student information
            List<Map<String, Object>> studentInfo = parentStudents.stream()
                .map(student -> {
                    Map<String, Object> studentMap = new HashMap<>();
                    studentMap.put("id", student.getStudentID());
                    studentMap.put("name", student.getLastName() + " " + student.getFirstName());
                    studentMap.put("className", student.getClassName());
                    return studentMap;
                })
                .collect(Collectors.toList());
            
            response.put("schedules", medicationScheduleService.convertToScheduleDTOList(schedules));
            response.put("students", studentInfo);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch medication schedules");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }    /**
     * Get medication schedules for a specific child
     */
    @GetMapping("/students/{studentId}/medication-schedules")
    public ResponseEntity<?> getChildMedicationSchedules(
            @AuthenticationPrincipal User parent,
            @PathVariable Long studentId,
            @RequestParam(required = false) String date,
            @RequestParam(required = false) String status) {
        try {
            // Verify that this student belongs to the parent
            boolean isParentOfStudent = studentRepository.isStudentOwnedByParent(studentId, parent.getId());
            if (!isParentOfStudent) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Access denied");
                errorResponse.put("message", "You don't have permission to view this student's medication schedules");
                return ResponseEntity.status(403).body(errorResponse);
            }
            
            // Get student information
            Student student = studentRepository.findById(studentId).orElse(null);
            
            Map<String, Object> response = new HashMap<>();
            
            // Fetch all schedules for this student
            List<MedicationSchedule> schedules = medicationScheduleRepository
                .findByItemRequestMedicationRequestStudentStudentID(studentId);

            // Filter by APPROVED medication request status first
            schedules = schedules.stream()
                .filter(schedule -> "APPROVED".equals(schedule.getItemRequest().getMedicationRequest().getStatus()))
                .collect(Collectors.toList());

            // Filter by date and status if provided
            if (date != null && !date.isEmpty()) {
                LocalDate targetDate = LocalDate.parse(date);
                schedules = schedules.stream()
                    .filter(schedule -> schedule.getScheduledDate().equals(targetDate))
                    .collect(Collectors.toList());
            }

            if (status != null && !status.isEmpty() && !status.equals("ALL")) {
                MedicationStatus medicationStatus = MedicationStatus.valueOf(status);
                schedules = schedules.stream()
                    .filter(schedule -> schedule.getStatus() == medicationStatus)
                    .collect(Collectors.toList());
            }
            
            // Prepare student information
            if (student != null) {
                Map<String, Object> studentInfo = new HashMap<>();
                studentInfo.put("id", student.getStudentID());
                studentInfo.put("name", student.getLastName() + " " + student.getFirstName());
                studentInfo.put("className", student.getClassName());
                response.put("student", studentInfo);
            }
            
            response.put("schedules", medicationScheduleService.convertToScheduleDTOList(schedules));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch medication schedules");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
}
///*
//     * Lấy danh sách học sinh của phụ huynh
//     *
//     * @param parent Phụ huynh đã xác thực
//     * @return ResponseEntity chứa danh sách học sinh
//     */
//    @GetMapping("/students")
//    public ResponseEntity<?> getMyStudents(@AuthenticationPrincipal User parent) {
//        try {
//            List<Student> students = studentRepository.findByParent(parent);
//
//            List<Map<String, Object>> studentList = students.stream()
//                .map(student -> {
//                    Map<String, Object> studentInfo = new HashMap<>();
//                    studentInfo.put("id", student.getStudentID());
//                    studentInfo.put("firstName", student.getFirstName());
//                    studentInfo.put("lastName", student.getLastName());
//                    studentInfo.put("className", student.getClassName());
//                    studentInfo.put("gender", student.getGender());
//                    studentInfo.put("dateOfBirth", student.getDob());
//                    return studentInfo;
//                })
//                .collect(Collectors.toList());
//
//            return ResponseEntity.ok(studentList);
//
//        } catch (Exception e) {
//            Map<String, Object> errorResponse = new HashMap<>();
//            errorResponse.put("error", "Failed to fetch students");
//            errorResponse.put("message", e.getMessage());
//            return ResponseEntity.internalServerError().body(errorResponse);
//        }
//    }
//
//    /**
//     * Lấy danh sách học sinh với trạng thái hồ sơ y tế
//     *
//     * @param parent Phụ huynh đã xác thực
//     * @return ResponseEntity chứa danh sách học sinh với trạng thái hồ sơ y tế
//     */
//    @GetMapping("/students/health-profile-status")
//    public ResponseEntity<?> getStudentsWithHealthProfileStatus(@AuthenticationPrincipal User parent) {
//        try {
//            List<Student> students = studentRepository.findByParent(parent);
//
//            List<Map<String, Object>> studentList = students.stream()
//                .map(student -> {
//                    Map<String, Object> studentInfo = new HashMap<>();
//                    studentInfo.put("id", student.getStudentID());
//                    studentInfo.put("firstName", student.getFirstName());
//                    studentInfo.put("lastName", student.getLastName());
//                    studentInfo.put("className", student.getClassName());
//                    studentInfo.put("gender", student.getGender());
//                    studentInfo.put("dateOfBirth", student.getDob());
//
//                    // Kiểm tra xem học sinh có hồ sơ y tế không
//                    List<HealthProfile> healthProfiles = healthProfileRepository.findByStudent(student);
//                    studentInfo.put("hasHealthProfile", !healthProfiles.isEmpty());
//                    studentInfo.put("healthProfileCount", healthProfiles.size());
//
//                    return studentInfo;
//                })
//                .collect(Collectors.toList());
//
//            return ResponseEntity.ok(studentList);
//
//        } catch (Exception e) {
//            Map<String, Object> errorResponse = new HashMap<>();
//            errorResponse.put("error", "Failed to fetch students with health profile status");
//            errorResponse.put("message", e.getMessage());
//            return ResponseEntity.internalServerError().body(errorResponse);
//        }
//    }
//
//    /**
//     * Lấy danh sách học sinh chưa có hồ sơ y tế
//     *
//     * @param parent Phụ huynh đã xác thực
//     * @return ResponseEntity chứa danh sách học sinh chưa có hồ sơ y tế
//     */
//    @GetMapping("/students/missing-health-profiles")
//    public ResponseEntity<?> getStudentsMissingHealthProfiles(@AuthenticationPrincipal User parent) {
//        try {
//            List<Student> students = studentRepository.findByParent(parent);
//
//            List<Map<String, Object>> studentsMissingProfile = students.stream()
//                .filter(student -> {
//                    List<HealthProfile> healthProfiles = healthProfileRepository.findByStudent(student);
//                    return healthProfiles.isEmpty();
//                })
//                .map(student -> {
//                    Map<String, Object> studentInfo = new HashMap<>();
//                    studentInfo.put("id", student.getStudentID());
//                    studentInfo.put("firstName", student.getFirstName());
//                    studentInfo.put("lastName", student.getLastName());
//                    studentInfo.put("className", student.getClassName());
//                    studentInfo.put("gender", student.getGender());
//                    studentInfo.put("dateOfBirth", student.getDob());
//                    return studentInfo;
//                })
//                .collect(Collectors.toList());
//
//            return ResponseEntity.ok(studentsMissingProfile);
//
//        } catch (Exception e) {
//            Map<String, Object> errorResponse = new HashMap<>();
//            errorResponse.put("error", "Failed to fetch students missing health profiles");
//            errorResponse.put("message", e.getMessage());
//            return ResponseEntity.internalServerError().body(errorResponse);
//        }
//    }




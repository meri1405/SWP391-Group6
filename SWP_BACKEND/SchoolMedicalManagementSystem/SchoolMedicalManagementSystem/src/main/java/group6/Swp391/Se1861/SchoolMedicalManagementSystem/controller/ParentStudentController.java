package group6.Swp391.Se1861.SchoolMedicalManagementSystem.controller;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.StudentDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.Student;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.HealthProfile;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.StudentRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.HealthProfileRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IStudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/parent/students")
@PreAuthorize("hasRole('PARENT')")  // Only parents can access these endpoints
public class ParentStudentController {

    @Autowired
    private IStudentService studentService;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private HealthProfileRepository healthProfileRepository;

    /**
     * Get all students associated with the authenticated parent
     */
    @GetMapping
    public ResponseEntity<List<StudentDTO>> getMyStudents(@AuthenticationPrincipal User parent) {
        List<StudentDTO> students = studentService.getStudentsByParent(parent);
        return ResponseEntity.ok(students);
    }

    /**
     * Get specific student details (only if parent has access)
     */
    @GetMapping("/{studentId}")
    public ResponseEntity<?> getMyStudent(@PathVariable Long studentId,
                                        @AuthenticationPrincipal User parent) {
        try {
            // Verify the student belongs to the parent
            if (!studentService.isStudentOwnedByParent(studentId, parent.getId())) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Forbidden");
                errorResponse.put("message", "You are not authorized to access this student's information");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
            }

            StudentDTO student = studentService.getStudentById(studentId);
            return ResponseEntity.ok(student);
        } catch (IllegalArgumentException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Not found");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }

    /**
     * Get all students with their health profile status
     */
    @GetMapping("/health-profile-status")
    public ResponseEntity<?> getStudentsWithHealthProfileStatus(@AuthenticationPrincipal User parent) {
        try {
            List<Student> students = studentRepository.findByParent(parent);
            
            List<Map<String, Object>> studentList = students.stream()
                .map(student -> {
                    Map<String, Object> studentInfo = new HashMap<>();
                    studentInfo.put("id", student.getStudentID());
                    studentInfo.put("firstName", student.getFirstName());
                    studentInfo.put("lastName", student.getLastName());
                    studentInfo.put("className", student.getClassName());
                    studentInfo.put("gender", student.getGender());
                    studentInfo.put("dateOfBirth", student.getDob());
                    
                    // Check if student has health profile
                    List<HealthProfile> healthProfiles = healthProfileRepository.findByStudent(student);
                    studentInfo.put("hasHealthProfile", !healthProfiles.isEmpty());
                    studentInfo.put("healthProfileCount", healthProfiles.size());
                    
                    return studentInfo;
                })
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(studentList);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch students with health profile status");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    /**
     * Get students missing health profiles
     */
    @GetMapping("/missing-health-profiles")
    public ResponseEntity<?> getStudentsMissingHealthProfiles(@AuthenticationPrincipal User parent) {
        try {
            List<Student> students = studentRepository.findByParent(parent);
            
            List<Map<String, Object>> studentsMissingProfile = students.stream()
                .filter(student -> {
                    List<HealthProfile> healthProfiles = healthProfileRepository.findByStudent(student);
                    return healthProfiles.isEmpty();
                })
                .map(student -> {
                    Map<String, Object> studentInfo = new HashMap<>();
                    studentInfo.put("id", student.getStudentID());
                    studentInfo.put("firstName", student.getFirstName());
                    studentInfo.put("lastName", student.getLastName());
                    studentInfo.put("className", student.getClassName());
                    studentInfo.put("gender", student.getGender());
                    studentInfo.put("dateOfBirth", student.getDob());
                    return studentInfo;
                })
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(studentsMissingProfile);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch students missing health profiles");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
}

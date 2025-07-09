package group6.Swp391.Se1861.SchoolMedicalManagementSystem.controller;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.StudentDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IStudentService;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.util.ResponseUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/parent/students")
@PreAuthorize("hasRole('PARENT')")
public class ParentStudentController {

    @Autowired
    private IStudentService studentService;

    /**
     * Get specific student details (only if parent has access)
     */
    @GetMapping("/{studentId}")
    public ResponseEntity<Map<String, Object>> getMyStudent(@PathVariable Long studentId,
                                                           @AuthenticationPrincipal User parent) {
        // Verify the student belongs to the parent
        if (!studentService.isStudentOwnedByParent(studentId, parent.getId())) {
            return ResponseUtils.forbidden("You are not authorized to access this student's information");
        }

        StudentDTO student = studentService.getStudentById(studentId);
        return ResponseUtils.success(student);
    }
}

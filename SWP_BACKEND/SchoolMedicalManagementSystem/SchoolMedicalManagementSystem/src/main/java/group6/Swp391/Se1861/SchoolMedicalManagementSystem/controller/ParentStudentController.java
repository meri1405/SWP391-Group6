package group6.Swp391.Se1861.SchoolMedicalManagementSystem.controller;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.StudentDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/parent/students")
@PreAuthorize("hasRole('PARENT')")  // Only parents can access these endpoints
public class ParentStudentController {

    @Autowired
    private StudentService studentService;

    /**
     * Get all students associated with the authenticated parent
     */
    @GetMapping
    public ResponseEntity<List<StudentDTO>> getMyStudents(@AuthenticationPrincipal User parent) {
        List<StudentDTO> students = studentService.getStudentsByParent(parent);
        return ResponseEntity.ok(students);
    }
}

package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.StudentCreationDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.StudentDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.StudentWithParentsDTO;

import java.util.List;

public interface IStudentManagementService {
    /**
     * Create a new student
     * @param studentDTO the student data
     * @return the created student
     */
    StudentDTO createStudent(StudentCreationDTO studentDTO);

    /**
     * Update an existing student
     * @param studentId the student ID
     * @param studentDTO the updated student data
     * @return the updated student
     */
    StudentDTO updateStudent(Long studentId, StudentCreationDTO studentDTO);

    /**
     * Delete a student
     * @param studentId the student ID
     */
    void deleteStudent(Long studentId);

    /**
     * Get all students
     * @return list of all students
     */
    List<StudentDTO> getAllStudents();

    /**
     * Get student by ID
     * @param studentId the student ID
     * @return the student
     */
    StudentDTO getStudentById(Long studentId);

    /**
     * Get all parents
     * @return list of all parents
     */
    List<User> getAllParents();

    /**
     * Create a new parent
     * @param parent the parent data
     * @return the created parent
     */
    User createParent(User parent);

    /**
     * Create students with their parents
     * @param dto the combined student and parent data
     * @return list of created students
     */
    List<StudentDTO> createStudentWithParents(StudentWithParentsDTO dto);
} 
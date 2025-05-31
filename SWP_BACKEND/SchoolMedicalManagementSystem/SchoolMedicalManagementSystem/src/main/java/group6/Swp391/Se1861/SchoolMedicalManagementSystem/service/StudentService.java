package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.ParentDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.StudentCreationDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.StudentDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.Student;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.StudentRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class StudentService {

    @Autowired
    private StudentRepository studentRepository;
    
    @Autowired
    private UserRepository userRepository;

    /**
     * Get all students associated with a parent
     * @param parent the authenticated parent user
     * @return list of students associated with the parent
     */
    public List<StudentDTO> getStudentsByParent(User parent) {
        List<Student> students = studentRepository.findByParentsWithParents(parent);
        return students.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Create a new student with parent relationships (admin only)
     * @param studentCreationDTO the student creation data
     * @return the created student as DTO
     * @throws IllegalArgumentException if validation fails
     */
    @Transactional
    public StudentDTO createStudentByAdmin(StudentCreationDTO studentCreationDTO) {
        // Validate required fields
        validateStudentData(studentCreationDTO);

        // Create student entity
        Student student = new Student();
        student.setFirstName(studentCreationDTO.getFirstName());
        student.setLastName(studentCreationDTO.getLastName());
        student.setDob(studentCreationDTO.getDob());
        student.setGender(studentCreationDTO.getGender());
        student.setClassName(studentCreationDTO.getClassName());
        student.setBirthPlace(studentCreationDTO.getBirthPlace());
        student.setAddress(studentCreationDTO.getAddress());
        student.setCitizenship(studentCreationDTO.getCitizenship());
        student.setBloodType(studentCreationDTO.getBloodType());
        student.setDisabled(studentCreationDTO.isDisabled());

        // Initialize parents set
        student.setParents(new HashSet<>());

        // Save student first
        Student savedStudent = studentRepository.save(student);

        // Add parent relationships if specified
        if (studentCreationDTO.getParentIds() != null && !studentCreationDTO.getParentIds().isEmpty()) {
            for (Long parentId : studentCreationDTO.getParentIds()) {
                addParentToStudentInternal(savedStudent, parentId);
            }
            // Refresh student entity to get updated relationships
            savedStudent = studentRepository.findByIdWithParents(savedStudent.getStudentID())
                    .orElse(savedStudent);
        }

        return convertToDTO(savedStudent);
    }

    /**
     * Get all students (admin only)
     * @return list of all students
     */
    public List<StudentDTO> getAllStudents() {
        List<Student> students = studentRepository.findAllWithParents();
        return students.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get student by ID (admin and parents can access their children)
     * @param studentId the student ID
     * @return the student DTO
     * @throws IllegalArgumentException if student not found
     */
    public StudentDTO getStudentById(Long studentId) {
        Student student = studentRepository.findByIdWithParents(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found with id: " + studentId));
        return convertToDTO(student);
    }

    /**
     * Add parent to existing student (admin only)
     * @param studentId the student ID
     * @param parentId the parent ID
     * @throws IllegalArgumentException if student or parent not found, or relationship already exists
     */
    @Transactional
    public void addParentToStudent(Long studentId, Long parentId) {
        Student student = studentRepository.findByIdWithParents(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found with id: " + studentId));
        
        addParentToStudentInternal(student, parentId);
    }

    /**
     * Remove parent from student (admin only)
     * @param studentId the student ID
     * @param parentId the parent ID
     * @throws IllegalArgumentException if student or parent not found, or relationship doesn't exist
     */
    @Transactional
    public void removeParentFromStudent(Long studentId, Long parentId) {
        Student student = studentRepository.findByIdWithParents(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found with id: " + studentId));

        User parent = userRepository.findById(parentId)
                .orElseThrow(() -> new IllegalArgumentException("Parent not found with id: " + parentId));

        // Verify parent has PARENT role
        if (!"PARENT".equalsIgnoreCase(parent.getRole().getRoleName())) {
            throw new IllegalArgumentException("User with id " + parentId + " is not a parent");
        }

        // Check if relationship exists
        if (!student.getParents().contains(parent)) {
            throw new IllegalArgumentException("Parent-child relationship does not exist");
        }

        // Remove relationship from both sides
        student.getParents().remove(parent);
        parent.getStudents().remove(student);

        // Save both entities
        studentRepository.save(student);
        userRepository.save(parent);
    }

    /**
     * Check if a student is owned by a specific parent
     * @param studentId the student ID
     * @param parentId the parent ID
     * @return true if the parent-child relationship exists
     */
    public boolean isStudentOwnedByParent(Long studentId, Long parentId) {
        return studentRepository.isStudentOwnedByParent(studentId, parentId);
    }

    /**
     * Internal method to add parent to student
     * @param student the student entity
     * @param parentId the parent ID
     */
    private void addParentToStudentInternal(Student student, Long parentId) {
        User parent = userRepository.findById(parentId)
                .orElseThrow(() -> new IllegalArgumentException("Parent not found with id: " + parentId));

        // Verify parent has PARENT role
        if (!"PARENT".equalsIgnoreCase(parent.getRole().getRoleName())) {
            throw new IllegalArgumentException("User with id " + parentId + " is not a parent");
        }

        // Check if relationship already exists
        if (student.getParents().contains(parent)) {
            throw new IllegalArgumentException("Parent-child relationship already exists");
        }

        // Add relationship to both sides
        student.getParents().add(parent);
        if (parent.getStudents() == null) {
            parent.setStudents(new HashSet<>());
        }
        parent.getStudents().add(student);

        // Save both entities
        studentRepository.save(student);
        userRepository.save(parent);
    }

    /**
     * Validate student creation data
     * @param studentCreationDTO the student data to validate
     * @throws IllegalArgumentException if validation fails
     */
    private void validateStudentData(StudentCreationDTO studentCreationDTO) {
        if (studentCreationDTO.getFirstName() == null || studentCreationDTO.getFirstName().trim().isEmpty()) {
            throw new IllegalArgumentException("First name is required");
        }
        
        if (studentCreationDTO.getLastName() == null || studentCreationDTO.getLastName().trim().isEmpty()) {
            throw new IllegalArgumentException("Last name is required");
        }
        
        if (studentCreationDTO.getDob() == null) {
            throw new IllegalArgumentException("Date of birth is required");
        }
        
        if (studentCreationDTO.getGender() == null || studentCreationDTO.getGender().trim().isEmpty()) {
            throw new IllegalArgumentException("Gender is required");
        }
        
        if (studentCreationDTO.getClassName() == null || studentCreationDTO.getClassName().trim().isEmpty()) {
            throw new IllegalArgumentException("Class name is required");
        }
        
        if (studentCreationDTO.getBirthPlace() == null || studentCreationDTO.getBirthPlace().trim().isEmpty()) {
            throw new IllegalArgumentException("Birth place is required");
        }
        
        if (studentCreationDTO.getAddress() == null || studentCreationDTO.getAddress().trim().isEmpty()) {
            throw new IllegalArgumentException("Address is required");
        }
        
        if (studentCreationDTO.getCitizenship() == null || studentCreationDTO.getCitizenship().trim().isEmpty()) {
            throw new IllegalArgumentException("Citizenship is required");
        }
        
        if (studentCreationDTO.getBloodType() == null || studentCreationDTO.getBloodType().trim().isEmpty()) {
            throw new IllegalArgumentException("Blood type is required");
        }
    }

    /**
     * Convert Student entity to StudentDTO
     */
    private StudentDTO convertToDTO(Student student) {
        StudentDTO dto = new StudentDTO();
        dto.setStudentID(student.getStudentID());
        dto.setFirstName(student.getFirstName());
        dto.setLastName(student.getLastName());
        dto.setDob(student.getDob());
        dto.setGender(student.getGender());
        dto.setClassName(student.getClassName());
        dto.setBirthPlace(student.getBirthPlace());
        dto.setAddress(student.getAddress());
        dto.setCitizenship(student.getCitizenship());
        dto.setBloodType(student.getBloodType());
        dto.setDisabled(student.isDisabled());
        
        // Convert parents to ParentDTO list
        if (student.getParents() != null) {
            List<ParentDTO> parentDTOs = student.getParents().stream()
                    .map(this::convertParentToDTO)
                    .collect(Collectors.toList());
            dto.setParents(parentDTOs);
        }
        
        return dto;
    }
    
    /**
     * Convert User (parent) entity to ParentDTO
     */
    private ParentDTO convertParentToDTO(User parent) {
        ParentDTO dto = new ParentDTO();
        if (parent.getRole().getRoleName().equalsIgnoreCase("PARENT")) {
            dto.setId(parent.getId());
            dto.setFirstName(parent.getFirstName());
            dto.setLastName(parent.getLastName());
            dto.setPhone(parent.getPhone());
        }
        return dto;
    }
}

package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.impl;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.*;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.Role;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.Student;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.RoleRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.StudentRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.UserRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IStudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class StudentService implements IStudentService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;    /**
     * Get all students associated with a parent
     * @param parent the authenticated parent user
     * @return list of students associated with the parent
     */
    @Override
    public List<StudentDTO> getStudentsByParent(User parent) {
        List<Student> students = studentRepository.findByParentWithParents(parent);
        return students.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get all students (admin only)
     * @return list of all students
     */
    @Override
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
    @Override
    public StudentDTO getStudentById(Long studentId) {
        Student student = studentRepository.findByIdWithParents(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found with id: " + studentId));
        return convertToDTO(student);
    }

    /**
     * Remove parent from student (admin only)
     * @param studentId the student ID
     * @param parentType either "father" or "mother"
     * @throws IllegalArgumentException if student not found, or relationship doesn't exist
     */
    @Transactional
    @Override
    public void removeParentFromStudent(Long studentId, String parentType) {
        Student student = studentRepository.findByIdWithParents(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found with id: " + studentId));

        // Remove parent based on type
        if ("father".equalsIgnoreCase(parentType)) {
            if (student.getFather() == null) {
                throw new IllegalArgumentException("Student does not have a father assigned");
            }
            student.setFather(null);
        } else if ("mother".equalsIgnoreCase(parentType)) {
            if (student.getMother() == null) {
                throw new IllegalArgumentException("Student does not have a mother assigned");
            }
            student.setMother(null);
        } else {
            throw new IllegalArgumentException("Parent type must be either 'father' or 'mother'");
        }

        studentRepository.save(student);
    }    /**
     * Check if a student is owned by a specific parent
     * @param studentId the student ID
     * @param parentId the parent ID
     * @return true if the parent has access to the student
     */
    @Override
    public boolean isStudentOwnedByParent(Long studentId, Long parentId) {
        return studentRepository.isStudentOwnedByParent(studentId, parentId);
    }
    /**
     * Convert Student entity to StudentDTO
     */
    @Override
    public StudentDTO convertToDTO(Student student) {
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
        dto.setDisabled(false); // Assuming disabled is always false for DTO

        // Set father and mother IDs
        if (student.getFather() != null) {
            dto.setFatherId(student.getFather().getId());
        }
        if (student.getMother() != null) {
            dto.setMotherId(student.getMother().getId());
        }
          return dto;
    }    /**
     * Create students with parents in one transaction
     * This method handles creating multiple students and their parents (father, mother, or both)
     * Now supports finding existing parents by phone to avoid duplicates
     * @param request DTO containing student and parent information
     * @return Response containing created students and parents
     */
    @Transactional
    @Override
    public StudentWithParentsCreationResponseDTO createStudentWithParents(StudentWithParentsCreationDTO request) {
        // Validate request
        if (request.getStudents() == null || request.getStudents().isEmpty()) {
            throw new IllegalArgumentException("Danh sách học sinh không được rỗng");
        }
        
        if (!request.hasAnyParent()) {
            throw new IllegalArgumentException("Phải có ít nhất một phụ huynh (cha hoặc mẹ)");
        }
        
        // Validate all students data
        for (StudentCreationDTO studentDto : request.getStudents()) {
            validateStudentData(studentDto);
        }
        
        // Validate parent data
        validateParentData(request.getFather());
        validateParentData(request.getMother());
        
        // Get PARENT role
        Role parentRole = roleRepository.findByRoleName("PARENT")
                .orElseThrow(() -> new RuntimeException("Không tìm thấy role PARENT"));
        
        // Find or create father
        User father = null;
        if (request.getFather() != null) {
            father = findOrCreateParent(request.getFather(), parentRole);
        }
        
        // Find or create mother
        User mother = null;
        if (request.getMother() != null) {
            mother = findOrCreateParent(request.getMother(), parentRole);
        }
        
        // Create students
        List<Student> createdStudents = new ArrayList<>();
        for (StudentCreationDTO studentDto : request.getStudents()) {
            Student student = createStudent(studentDto, father, mother);
            createdStudents.add(student);
        }
        
        // Save all students
        createdStudents = studentRepository.saveAll(createdStudents);
        
        // Prepare response
        StudentWithParentsCreationResponseDTO response = new StudentWithParentsCreationResponseDTO();
        response.setStudents(createdStudents.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList()));
        
        if (father != null) {
            response.setFather(convertUserToParentDTO(father));
        }
        
        if (mother != null) {
            response.setMother(convertUserToParentDTO(mother));
        }
        
        int studentCount = createdStudents.size();
        String parentInfo = "";
        if (request.hasBothParents()) {
            parentInfo = "cha và mẹ";
        } else if (request.getFather() != null) {
            parentInfo = "cha";
        } else {
            parentInfo = "mẹ";
        }
        
        response.setMessage(String.format("Tạo thành công %d học sinh và %s", studentCount, parentInfo));
        
        return response;
    }
    
    /**
     * Find existing parent by phone or create new one
     * This prevents duplicate parents when multiple students have the same parent
     */
    private User findOrCreateParent(ParentCreationDTO parentDto, Role parentRole) {
        // Try to find existing parent by phone
        Optional<User> existingParent = userRepository.findByPhone(parentDto.getPhone());
        
        if (existingParent.isPresent()) {
            User parent = existingParent.get();
            
            // Verify it's actually a parent
            if (!parent.getRole().getRoleName().equals("PARENT")) {
                throw new IllegalArgumentException("Số điện thoại " + parentDto.getPhone() + " đã được sử dụng bởi tài khoản khác");
            }
            
            // Update parent information if needed (optional)
            updateParentIfNeeded(parent, parentDto);
            
            return parent;
        } else {
            // Create new parent
            return createParentUser(parentDto, parentRole);
        }
    }
    
    /**
     * Update parent information if needed when found existing parent
     */
    private void updateParentIfNeeded(User parent, ParentCreationDTO parentDto) {
        boolean needsUpdate = false;
        
        // Update basic info if different and not null
        if (parentDto.getFirstName() != null && !parentDto.getFirstName().equals(parent.getFirstName())) {
            parent.setFirstName(parentDto.getFirstName());
            needsUpdate = true;
        }
        
        if (parentDto.getLastName() != null && !parentDto.getLastName().equals(parent.getLastName())) {
            parent.setLastName(parentDto.getLastName());
            needsUpdate = true;
        }
        
        if (parentDto.getGender() != null && !parentDto.getGender().equals(parent.getGender())) {
            parent.setGender(parentDto.getGender());
            needsUpdate = true;
        }
        
        if (parentDto.getJobTitle() != null && !parentDto.getJobTitle().equals(parent.getJobTitle())) {
            parent.setJobTitle(parentDto.getJobTitle());
            needsUpdate = true;
        }
        
        if (parentDto.getAddress() != null && !parentDto.getAddress().equals(parent.getAddress())) {
            parent.setAddress(parentDto.getAddress());
            needsUpdate = true;
        }
        
        if (parentDto.getDob() != null && !parentDto.getDob().equals(parent.getDob())) {
            parent.setDob(parentDto.getDob());
            needsUpdate = true;
        }
        
        if (needsUpdate) {
            userRepository.save(parent);
        }
    }

    /**
     * Create parent user from DTO
     */
    private User createParentUser(ParentCreationDTO parentDto, Role parentRole) {
        // Check if phone already exists
        if (userRepository.existsByPhone(parentDto.getPhone())) {
            throw new IllegalArgumentException("Số điện thoại " + parentDto.getPhone() + " đã tồn tại");
        }

        User parent = new User();
        parent.setFirstName(parentDto.getFirstName());
        parent.setLastName(parentDto.getLastName());
        parent.setPhone(parentDto.getPhone());
        parent.setGender(parentDto.getGender());
        parent.setJobTitle(parentDto.getJobTitle());
        parent.setAddress(parentDto.getAddress());
        parent.setDob(parentDto.getDob());
        parent.setEnabled(parentDto.getEnabled() != null ? parentDto.getEnabled() : true);
        parent.setRole(parentRole);

        // For PARENT role: username is phone number, no password and email
        parent.setUsername(parentDto.getPhone());
        parent.setPassword(null);
        parent.setEmail(null);

        return userRepository.save(parent);
    }

    /**
     * Create student from DTO
     */
    private Student createStudent(StudentCreationDTO studentDto, User father, User mother) {
        Student student = new Student();
        student.setFirstName(studentDto.getFirstName());
        student.setLastName(studentDto.getLastName());
        student.setDob(studentDto.getDob());
        student.setGender(studentDto.getGender());
        student.setClassName(studentDto.getClassName());
        student.setBirthPlace(studentDto.getBirthPlace());
        student.setAddress(studentDto.getAddress());
        student.setCitizenship(studentDto.getCitizenship());
        student.setDisabled(false);

        // Set parents
        student.setFather(father);
        student.setMother(mother);

        return student;
    }

    /**
     * Delete a student by ID
     * Only MANAGER can delete students
     * @param studentId the student ID to delete
     * @throws IllegalArgumentException if student not found
     */
    @Transactional
    @Override
    public void deleteStudent(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy học sinh với ID: " + studentId));

        studentRepository.delete(student);
    }

    /**
     * Convert User to ParentDTO
     */
    private ParentDTO convertUserToParentDTO(User user) {
        ParentDTO dto = new ParentDTO();
        dto.setId(user.getId());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setPhone(user.getPhone());
        dto.setGender(user.getGender());
        dto.setJobTitle(user.getJobTitle());
        dto.setAddress(user.getAddress());
        dto.setDob(user.getDob());
        dto.setEnabled(user.getEnabled());
        return dto;
    }
    
    /**
     * Validate student data for both form and Excel input
     */
    private void validateStudentData(StudentCreationDTO studentDto) {
        // Validate required fields
        if (studentDto.getFirstName() == null || studentDto.getFirstName().trim().isEmpty()) {
            throw new IllegalArgumentException("Tên học sinh là bắt buộc");
        }
        
        if (studentDto.getLastName() == null || studentDto.getLastName().trim().isEmpty()) {
            throw new IllegalArgumentException("Họ học sinh là bắt buộc");
        }
        
        if (studentDto.getDob() == null) {
            throw new IllegalArgumentException("Ngày sinh học sinh là bắt buộc");
        }
        
        if (studentDto.getGender() == null || studentDto.getGender().trim().isEmpty()) {
            throw new IllegalArgumentException("Giới tính học sinh là bắt buộc");
        }
        
        if (studentDto.getClassName() == null || studentDto.getClassName().trim().isEmpty()) {
            throw new IllegalArgumentException("Lớp là bắt buộc");
        }
        
        if (studentDto.getBirthPlace() == null || studentDto.getBirthPlace().trim().isEmpty()) {
            throw new IllegalArgumentException("Nơi sinh là bắt buộc");
        }
        
        if (studentDto.getAddress() == null || studentDto.getAddress().trim().isEmpty()) {
            throw new IllegalArgumentException("Địa chỉ học sinh là bắt buộc");
        }
        
        if (studentDto.getCitizenship() == null || studentDto.getCitizenship().trim().isEmpty()) {
            throw new IllegalArgumentException("Quốc tịch là bắt buộc");
        }
        
        // Validate gender
        if (!studentDto.getGender().equals("M") && !studentDto.getGender().equals("F")) {
            throw new IllegalArgumentException("Giới tính học sinh phải là 'M' hoặc 'F'");
        }
        
        // Validate age (5-12 years old)
        validateStudentAge(studentDto.getDob());
    }
      /**
     * Validate student age - must be between 2 and 12 years old
     */
    private void validateStudentAge(java.time.LocalDate dateOfBirth) {
        if (dateOfBirth == null) {
            throw new IllegalArgumentException("Ngày sinh học sinh không được để trống");
        }
        
        java.time.LocalDate currentDate = java.time.LocalDate.now();
        int age = currentDate.getYear() - dateOfBirth.getYear();
        
        // Check if birthday has passed this year
        if (dateOfBirth.plusYears(age).isAfter(currentDate)) {
            age--;
        }
        
        if (age > 12) {
            throw new IllegalArgumentException("Học sinh phải dưới hoặc bằng 12 tuổi. Tuổi hiện tại: " + age);
        }
          // Check for minimum age (at least 2 years old for kindergarten)
        if (age < 2) {
            throw new IllegalArgumentException("Học sinh phải ít nhất 2 tuổi. Tuổi hiện tại: " + age);
        }

    }
    
    /**
     * Validate parent data
     */
    private void validateParentData(ParentCreationDTO parentDto) {
        if (parentDto == null) {
            return; // Parent is optional
        }
        
        // If parent data is provided, phone is required
        if (parentDto.getPhone() == null || parentDto.getPhone().trim().isEmpty()) {
            throw new IllegalArgumentException("Số điện thoại phụ huynh là bắt buộc khi có thông tin phụ huynh");
        }
        
        // Validate phone number format (10-11 digits)
        String phone = parentDto.getPhone().trim();
        if (!phone.matches("^0\\d{9,10}$")) {
            throw new IllegalArgumentException("Số điện thoại phụ huynh không đúng định dạng (phải có 10-11 số và bắt đầu bằng 0)");
        }
        
        // Validate gender if provided
        if (parentDto.getGender() != null && !parentDto.getGender().trim().isEmpty()) {
            if (!parentDto.getGender().equals("M") && !parentDto.getGender().equals("F")) {
                throw new IllegalArgumentException("Giới tính phụ huynh phải là 'M' hoặc 'F'");
            }
        }
    }
    
    // ...existing code...
}

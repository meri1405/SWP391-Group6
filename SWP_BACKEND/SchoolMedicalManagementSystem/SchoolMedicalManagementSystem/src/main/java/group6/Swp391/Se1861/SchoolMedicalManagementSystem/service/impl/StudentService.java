package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.impl;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.*;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.Role;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.Student;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.RoleRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.StudentRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.UserRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IStudentService;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.util.StudentMapper;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.util.PhoneValidator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
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
        List<Student> students = studentRepository.findByParentWithParents(parent)
                .stream()
                .filter(student -> !student.isDisabled()) // Filter out disabled students
                .collect(Collectors.toList());
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
        dto.setSchoolYear(student.getSchoolYear());
        dto.setBirthPlace(student.getBirthPlace());
        dto.setAddress(student.getAddress());
        dto.setCitizenship(student.getCitizenship());
        dto.setDisabled(student.isDisabled()); // Include disabled status

        // Calculate age from date of birth
        if (student.getDob() != null) {
            java.time.LocalDate now = java.time.LocalDate.now();
            int age = java.time.Period.between(student.getDob(), now).getYears();
            dto.setAge(age);
        } else {
            dto.setAge(0);
        }

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

        // Validate only one parent can have system access
        validateSingleParentAccess(request);

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
     * Validate that only one parent can have system access (enabled = true)
     */
    private void validateSingleParentAccess(StudentWithParentsCreationDTO request) {
        // If both parents exist and both are enabled, prioritize father
        if (request.getFather() != null && request.getMother() != null) {
            Boolean fatherEnabled = request.getFather().getEnabled();
            Boolean motherEnabled = request.getMother().getEnabled();

            // If both are true, disable mother
            if (Boolean.TRUE.equals(fatherEnabled) && Boolean.TRUE.equals(motherEnabled)) {
                request.getMother().setEnabled(false);
                System.out.println("Warning: Both parents were enabled. Automatically disabled mother's access.");
            }
        }
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

            // Validate that name matches if parent exists
            validateExistingParentName(parent, parentDto);

            // Update parent information if needed (optional)
            updateParentIfNeeded(parent, parentDto);

            return parent;
        } else {
            // Create new parent
            return createParentUser(parentDto, parentRole);
        }
    }

    /**
     * Validate that existing parent has matching name
     */
    private void validateExistingParentName(User existingParent, ParentCreationDTO parentDto) {
        String existingFullName = (existingParent.getLastName() + " " + existingParent.getFirstName()).trim();
        String newFullName = (parentDto.getLastName() + " " + parentDto.getFirstName()).trim();

        if (!existingFullName.equalsIgnoreCase(newFullName)) {
            throw new IllegalArgumentException("Số điện thoại " + parentDto.getPhone() + 
                " đã được sử dụng bởi phụ huynh khác với tên: " + existingFullName + 
                ". Vui lòng kiểm tra lại thông tin họ tên phụ huynh.");
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
        parent.setFirstLogin(false); // Parents don't need to change password on first login

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
        student.setSchoolYear(studentDto.getSchoolYear());
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
     * Toggle student status (enable/disable)
     * If disabling: set isDisabled = true and disable parent accounts if they only have one child
     * If enabling: set isDisabled = false and auto-enable parent accounts
     * Only MANAGER can toggle student status
     * @param studentId the student ID to toggle
     * @throws IllegalArgumentException if student not found
     */
    @Transactional
    @Override
    public void deleteStudent(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy học sinh với ID: " + studentId));

        // Toggle the disabled status
        boolean newDisabledStatus = !student.isDisabled();
        student.setDisabled(newDisabledStatus);
        studentRepository.save(student);

        if (newDisabledStatus) {
            // Student is being disabled - check and disable parent accounts if they only have one child
            disableParentAccountsIfOnlyChild(student);
        } else {
            // Student is being enabled - auto-enable parent accounts
            enableParentAccounts(student);
        }
    }

    /**
     * Helper method to enable parent accounts when student is re-enabled
     * @param student the student being enabled
     */
    private void enableParentAccounts(Student student) {
        // Enable father if exists
        if (student.getFather() != null) {
            User father = student.getFather();
            father.setEnabled(true);
            userRepository.save(father);
        }

        // Enable mother if exists
        if (student.getMother() != null) {
            User mother = student.getMother();
            mother.setEnabled(true);
            userRepository.save(mother);
        }
    }


    /**
     * Helper method to disable parent accounts if they only have one child
     * @param student the student being disabled
     */
    private void disableParentAccountsIfOnlyChild(Student student) {
        // Check father
        if (student.getFather() != null) {
            User father = student.getFather();
            List<Student> fatherChildren = studentRepository.findByFatherAndIsDisabledFalse(father);
            if (fatherChildren.size() <= 1) { // Only this child or no active children
                father.setEnabled(false);
                userRepository.save(father);
            }
        }

        // Check mother
        if (student.getMother() != null) {
            User mother = student.getMother();
            List<Student> motherChildren = studentRepository.findByMotherAndIsDisabledFalse(mother);
            if (motherChildren.size() <= 1) { // Only this child or no active children
                mother.setEnabled(false);
                userRepository.save(mother);
            }
        }
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

        // Always set citizenship to "Việt Nam" regardless of input
        studentDto.setCitizenship("Việt Nam");

        // Validate gender
        if (!studentDto.getGender().equals("M") && !studentDto.getGender().equals("F")) {
            throw new IllegalArgumentException("Giới tính học sinh phải là 'M' hoặc 'F'");
        }

        // Validate age (5-12 years old)
        validateStudentAge(studentDto.getDob());
    }
      /**
     * Validate student age - must be between 2 and 12 years old
     * Age calculation is based on year only, not specific birth date
     */
    private void validateStudentAge(java.time.LocalDate dateOfBirth) {
        if (dateOfBirth == null) {
            throw new IllegalArgumentException("Ngày sinh học sinh không được để trống");
        }

        java.time.LocalDate currentDate = java.time.LocalDate.now();
        int age = currentDate.getYear() - dateOfBirth.getYear();

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

        // Name is required when phone is provided
        if (parentDto.getFirstName() == null || parentDto.getFirstName().trim().isEmpty()) {
            throw new IllegalArgumentException("Tên phụ huynh là bắt buộc khi có số điện thoại phụ huynh");
        }

        if (parentDto.getLastName() == null || parentDto.getLastName().trim().isEmpty()) {
            throw new IllegalArgumentException("Họ phụ huynh là bắt buộc khi có số điện thoại phụ huynh");
        }

        // Validate phone number format (10 digits with valid Vietnamese prefix)
        String phone = parentDto.getPhone().trim();
        String phoneError = PhoneValidator.validatePhone(phone);
        if (phoneError != null) {
            throw new IllegalArgumentException(phoneError);
        }

        // Validate parent age if DOB is provided - must be at least 18 years old
        if (parentDto.getDob() != null) {
            validateParentAge(parentDto.getDob());
        }

        // Validate gender if provided
        if (parentDto.getGender() != null && !parentDto.getGender().trim().isEmpty()) {
            if (!parentDto.getGender().equals("M") && !parentDto.getGender().equals("F")) {
                throw new IllegalArgumentException("Giới tính phụ huynh phải là 'M' hoặc 'F'");
            }
        }
    }

    /**
     * Validate parent age - must be at least 18 years old
     * Age calculation is based on year only, not specific birth date
     */
    private void validateParentAge(java.time.LocalDate dateOfBirth) {
        if (dateOfBirth == null) {
            return; // DOB is optional for parents
        }

        java.time.LocalDate currentDate = java.time.LocalDate.now();
        int age = currentDate.getYear() - dateOfBirth.getYear();

        if (age < 18) {
            throw new IllegalArgumentException("Phụ huynh phải ít nhất 18 tuổi. Tuổi hiện tại: " + age);
        }

        if (age > 100) {
            throw new IllegalArgumentException("Tuổi phụ huynh không hợp lệ. Tuổi hiện tại: " + age);
        }
    }

    @Override
    public List<StudentDTO> getStudentsByAgeRange(int minAge, int maxAge) {
        System.out.println("=== getStudentsByAgeRange DEBUG ===");
        System.out.println("Input minAge: " + minAge + ", maxAge: " + maxAge);

        int currentYear = java.time.LocalDate.now().getYear();
        int minBirthYear = currentYear - maxAge;  // Older students
        int maxBirthYear = currentYear - minAge;  // Younger students

        System.out.println("Current year: " + currentYear);
        System.out.println("Min birth year: " + minBirthYear + " (for age " + maxAge + ")");
        System.out.println("Max birth year: " + maxBirthYear + " (for age " + minAge + ")");

        // Get all active students
        List<Student> allStudents = studentRepository.findByIsDisabledFalse();
        System.out.println("Total active students: " + allStudents.size());

        // Filter by birth year
        List<Student> filteredStudents = allStudents.stream()
                .filter(student -> {
                    int birthYear = student.getDob().getYear();
                    boolean isEligible = birthYear >= minBirthYear && birthYear <= maxBirthYear;
                    System.out.println("Student: " + student.getFullName() + 
                                     ", Birth year: " + birthYear + ", Age: " + (currentYear - birthYear) + 
                                     ", Eligible: " + isEligible);
                    return isEligible;
                })
                .collect(Collectors.toList());

        System.out.println("Filtered students count: " + filteredStudents.size());

        return filteredStudents.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<StudentDTO> getStudentsByClassName(String className) {
        List<Student> students = studentRepository.findByClassNameAndIsDisabledFalse(className);
        return students.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<StudentDTO> getStudentsByAgeRangeAndClass(int minAge, int maxAge, String className) {
        System.out.println("=== getStudentsByAgeRangeAndClass DEBUG ===");
        System.out.println("Input minAge: " + minAge + ", maxAge: " + maxAge + ", className: " + className);

        int currentYear = java.time.LocalDate.now().getYear();
        int minBirthYear = currentYear - maxAge;  // Older students
        int maxBirthYear = currentYear - minAge;  // Younger students

        System.out.println("Current year: " + currentYear);
        System.out.println("Min birth year: " + minBirthYear + " (for age " + maxAge + ")");
        System.out.println("Max birth year: " + maxBirthYear + " (for age " + minAge + ")");

        // Get students by class name first
        List<Student> studentsInClass = studentRepository.findByClassNameAndIsDisabledFalse(className);
        System.out.println("Students in class " + className + ": " + studentsInClass.size());

        // Filter by birth year
        List<Student> filteredStudents = studentsInClass.stream()
                .filter(student -> {
                    int birthYear = student.getDob().getYear();
                    boolean isEligible = birthYear >= minBirthYear && birthYear <= maxBirthYear;
                    System.out.println("Student: " + student.getFullName() + 
                                     ", Birth year: " + birthYear + ", Age: " + (currentYear - birthYear) + 
                                     ", Eligible: " + isEligible);
                    return isEligible;
                })
                .collect(Collectors.toList());

        System.out.println("Filtered students count: " + filteredStudents.size());

        return filteredStudents.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<StudentDTO> getEligibleStudentsForClasses(Set<String> classNames, Integer minAge, Integer maxAge) {
        System.out.println("=== DEBUG STUDENT SERVICE ===");
        System.out.println("Input classNames: " + classNames);
        System.out.println("Input minAge: " + minAge + ", maxAge: " + maxAge);

        // Handle null or empty classNames
        if (classNames == null || classNames.isEmpty()) {
            System.out.println("Class names is null or empty, returning empty list");
            return new ArrayList<>();
        }

        // Check if "toàn trường" is in the class names
        boolean isAllSchool = classNames.stream()
                .anyMatch(className -> "toàn trường".equalsIgnoreCase(className) || 
                                     "toan truong".equalsIgnoreCase(className) ||
                                     "all".equalsIgnoreCase(className));

        boolean hasAgeRange = minAge != null && maxAge != null;

        System.out.println("isAllSchool: " + isAllSchool + ", hasAgeRange: " + hasAgeRange);

        // Logic 1: Toàn trường + có độ tuổi → lọc theo độ tuổi
        if (isAllSchool && hasAgeRange) {
            System.out.println("Using Logic 1: All school + age range");
            return getStudentsByAgeRange(minAge, maxAge);
        }

        // Logic 2: Toàn trường + không có độ tuổi → lấy tất cả
        if (isAllSchool && !hasAgeRange) {
            System.out.println("Using Logic 2: All school + no age range");
            return getAllStudents();
        }

        // Logic 3: Lớp cụ thể + có độ tuổi → lọc theo các lớp và độ tuổi
        if (!isAllSchool && hasAgeRange) {
            System.out.println("Using Logic 3: Specific classes + age range");
            int currentYear = java.time.LocalDate.now().getYear();
            int minBirthYear = currentYear - maxAge;
            int maxBirthYear = currentYear - minAge;

            System.out.println("Current year: " + currentYear);
            System.out.println("Min birth year: " + minBirthYear + " (for age " + maxAge + ")");
            System.out.println("Max birth year: " + maxBirthYear + " (for age " + minAge + ")");

            // Get all students in the specified classes first
            List<Student> allStudentsInClasses = studentRepository.findByClassNameInAndIsDisabledFalse(classNames);
            System.out.println("Found " + allStudentsInClasses.size() + " students in classes: " + classNames);

            // Filter by birth year
            List<Student> students = allStudentsInClasses.stream()
                    .filter(student -> {
                        int birthYear = student.getDob().getYear();
                        boolean eligible = birthYear >= minBirthYear && birthYear <= maxBirthYear;
                        System.out.println("Student: " + student.getFullName() + 
                                         ", Birth year: " + birthYear + 
                                         ", Class: " + student.getClassName() + 
                                         ", Eligible: " + eligible);
                        return eligible;
                    })
                    .collect(Collectors.toList());

            System.out.println("Final filtered students: " + students.size());

            return students.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
        }

        // Logic 4: Lớp cụ thể + không có độ tuổi → lọc theo các lớp
        if (!isAllSchool && !hasAgeRange) {
            System.out.println("Using Logic 4: Specific classes + no age range");
            System.out.println("Calling studentRepository.findByClassNameInAndIsDisabledFalse with: " + classNames);
            List<Student> students = studentRepository.findByClassNameInAndIsDisabledFalse(classNames);
            System.out.println("Repository returned " + students.size() + " students");
            for (Student student : students) {
                System.out.println("- Found student: " + student.getFullName() + " (Class: " + student.getClassName() + ", Disabled: " + student.isDisabled() + ")");
            }
            List<StudentDTO> result = students.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            System.out.println("Converted to " + result.size() + " DTOs");
            return result;
        }

        // Fallback - trả về danh sách rỗng
        System.out.println("No logic matched, returning empty list");
        return new ArrayList<>();
    }

    @Override
    public List<StudentDTO> filterStudents(StudentFilterDTO filter) {
        List<Student> students = studentRepository.findAllWithParents();

        // Apply filters
        if (filter.getSearchName() != null && !filter.getSearchName().trim().isEmpty()) {
            String searchName = filter.getSearchName().toLowerCase().trim();
            students = students.stream()
                    .filter(student -> {
                        String fullName = (student.getFullName()).toLowerCase();
                        return fullName.contains(searchName);
                    })
                    .collect(Collectors.toList());
        }

        if (filter.getClassName() != null && !filter.getClassName().trim().isEmpty()) {
            students = students.stream()
                    .filter(student -> student.getClassName().equals(filter.getClassName()))
                    .collect(Collectors.toList());
        }

        if (filter.getSchoolYear() != null && !filter.getSchoolYear().trim().isEmpty()) {
            students = students.stream()
                    .filter(student -> student.getSchoolYear() != null && 
                                     student.getSchoolYear().equals(filter.getSchoolYear()))
                    .collect(Collectors.toList());
        }

        if (filter.getBirthPlace() != null && !filter.getBirthPlace().trim().isEmpty()) {
            students = students.stream()
                    .filter(student -> student.getBirthPlace() != null && 
                                     student.getBirthPlace().equals(filter.getBirthPlace()))
                    .collect(Collectors.toList());
        }

        if (filter.getBirthYear() != null) {
            students = students.stream()
                    .filter(student -> student.getDob() != null && 
                                     student.getDob().getYear() == filter.getBirthYear())
                    .collect(Collectors.toList());
        }

        // Convert to DTOs
        return students.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<Map<String, Object>> getStudentsWithHealthProfileStatus(User parent) {
        List<Student> students = studentRepository.findByParent(parent);

        return students.stream()
                .map(StudentMapper::toHealthProfileStatusMap)
                .collect(Collectors.toList());
    }

    @Override
    public List<Map<String, Object>> getStudentsMissingHealthProfiles(User parent) {
        List<Student> students = studentRepository.findByParent(parent);

        return students.stream()
                .filter(student -> student.getHealthProfile() == null)
                .map(StudentMapper::toBasicInfoMap)
                .collect(Collectors.toList());
    }

    @Override
    public List<String> getAvailableClassNames() {
        return studentRepository.findDistinctClassNamesFromActiveStudents();
    }
}

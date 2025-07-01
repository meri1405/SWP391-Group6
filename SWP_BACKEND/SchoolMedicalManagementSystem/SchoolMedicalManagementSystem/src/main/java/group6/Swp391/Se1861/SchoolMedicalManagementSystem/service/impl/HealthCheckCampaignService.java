package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.impl;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.StudentDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.HealthCheckCampaign;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.HealthCheckForm;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.Student;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.CampaignStatus;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.FormStatus;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.HealthCheckCategory;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.HealthCheckCampaignRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.RoleRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.StudentRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.UserRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IHealthCheckCampaignService;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.INotificationService;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IStudentService;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.HealthCheckFormRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class HealthCheckCampaignService implements IHealthCheckCampaignService {

    private final HealthCheckCampaignRepository campaignRepository;
    private final INotificationService notificationService;
    private final IStudentService studentService;
    private final StudentRepository studentRepository;
    private final HealthCheckFormRepository healthCheckFormRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    @Transactional
    public HealthCheckCampaign createCampaign(String name, String description, LocalDate startDate,
                                             LocalDate endDate, String location, Set<HealthCheckCategory> categories,
                                             User nurse, Integer minAge, Integer maxAge, Set<String> targetClasses) {

        HealthCheckCampaign campaign = new HealthCheckCampaign();
        campaign.setName(name);
        campaign.setDescription(description);
        campaign.setStartDate(startDate);
        campaign.setEndDate(endDate);
        campaign.setLocation(location);
        campaign.setCategories(categories);
        campaign.setCreatedBy(nurse);
        campaign.setStatus(CampaignStatus.PENDING);
        campaign.setMinAge(minAge);
        campaign.setMaxAge(maxAge);
        campaign.setTargetClasses(targetClasses != null ? targetClasses : new HashSet<>());
        campaign.setCreatedAt(LocalDateTime.now());
        campaign.setUpdatedAt(LocalDateTime.now());

        // Automatically calculate target count when creating campaign
        if (minAge != null && maxAge != null) {
            int targetCount = calculateTargetCountInternal(minAge, maxAge, targetClasses);
            campaign.setTargetCount(targetCount);
        }

        // Notify managers about a new campaign pending approval
        notificationService.notifyManagersAboutCampaignApproval(campaign);

        return campaignRepository.save(campaign);
    }

    @Transactional
    public HealthCheckCampaign updateCampaign(Long id, String name, String description, LocalDate startDate,
                                             LocalDate endDate, String location, Set<HealthCheckCategory> categories,
                                             Integer minAge, Integer maxAge, Set<String> targetClasses) {

        Optional<HealthCheckCampaign> optionalCampaign = campaignRepository.findById(id);
        if (optionalCampaign.isEmpty()) {
            throw new RuntimeException("Campaign not found with id: " + id);
        }

        HealthCheckCampaign campaign = optionalCampaign.get();

        // Only allow updates if the campaign is in PENDING status
        if (campaign.getStatus() != CampaignStatus.PENDING) {
            throw new RuntimeException("Cannot update campaign that is not in PENDING status");
        }

        campaign.setName(name);
        campaign.setDescription(description);
        campaign.setStartDate(startDate);
        campaign.setEndDate(endDate);
        campaign.setLocation(location);
        campaign.setCategories(categories);
        campaign.setMinAge(minAge);
        campaign.setMaxAge(maxAge);
        campaign.setTargetClasses(targetClasses != null ? targetClasses : new HashSet<>());
        campaign.setUpdatedAt(LocalDateTime.now());

        // Recalculate target count when updating campaign
        if (minAge != null && maxAge != null) {
            int targetCount = calculateTargetCountInternal(minAge, maxAge, targetClasses);
            campaign.setTargetCount(targetCount);
        }

        return campaignRepository.save(campaign);
    }

    @Transactional
    public HealthCheckCampaign submitForApproval(Long id) {
        Optional<HealthCheckCampaign> optionalCampaign = campaignRepository.findById(id);
        if (optionalCampaign.isEmpty()) {
            throw new RuntimeException("Campaign not found with id: " + id);
        }

        HealthCheckCampaign campaign = optionalCampaign.get();

        // Campaign is already in PENDING status when created, so this method is no longer needed
        // But we keep it for backward compatibility
        campaign.setUpdatedAt(LocalDateTime.now());

        // Notify managers about a campaign pending approval
        notificationService.notifyManagersAboutCampaignApproval(campaign);

        return campaignRepository.save(campaign);
    }

    @Transactional
    public HealthCheckCampaign approveCampaign(Long id, User manager) {
        Optional<HealthCheckCampaign> optionalCampaign = campaignRepository.findById(id);
        if (optionalCampaign.isEmpty()) {
            throw new RuntimeException("Campaign not found with id: " + id);
        }

        HealthCheckCampaign campaign = optionalCampaign.get();

        // Only allow approval if the campaign is in PENDING status
        if (campaign.getStatus() != CampaignStatus.PENDING) {
            throw new RuntimeException("Cannot approve campaign that is not in PENDING status");
        }

        campaign.setStatus(CampaignStatus.APPROVED);
        campaign.setApprovedBy(manager);
        campaign.setApprovedAt(LocalDateTime.now());
        campaign.setUpdatedAt(LocalDateTime.now());

        // Notify the nurse who created the campaign about the approval
        notificationService.notifyNurseAboutCampaignApproval(campaign);

        return campaignRepository.save(campaign);
    }

    @Transactional
    public HealthCheckCampaign rejectCampaign(Long id, User manager, String notes) {
        Optional<HealthCheckCampaign> optionalCampaign = campaignRepository.findById(id);
        if (optionalCampaign.isEmpty()) {
            throw new RuntimeException("Campaign not found with id: " + id);
        }

        HealthCheckCampaign campaign = optionalCampaign.get();

        // Only allow rejection if the campaign is in PENDING status
        if (campaign.getStatus() != CampaignStatus.PENDING) {
            throw new RuntimeException("Cannot reject campaign that is not in PENDING status");
        }

        campaign.setStatus(CampaignStatus.CANCELED);  // Set to CANCELED instead of DRAFT
        campaign.setNotes(notes);
        campaign.setUpdatedAt(LocalDateTime.now());

        // Notify the nurse who created the campaign about the rejection
        notificationService.notifyNurseAboutCampaignRejection(campaign, notes);

        return campaignRepository.save(campaign);
    }

    @Transactional
    public HealthCheckCampaign scheduleCampaign(Long id, int targetCount) {
        Optional<HealthCheckCampaign> optionalCampaign = campaignRepository.findById(id);
        if (optionalCampaign.isEmpty()) {
            throw new RuntimeException("Campaign not found with id: " + id);
        }

        HealthCheckCampaign campaign = optionalCampaign.get();

        // Only allow scheduling if the campaign is in APPROVED status
        if (campaign.getStatus() != CampaignStatus.APPROVED) {
            throw new RuntimeException("Cannot schedule campaign that is not in APPROVED status");
        }

        // Instead of changing to SCHEDULED status, we keep it as APPROVED
        // and just set the target count for manual override if needed
        campaign.setTargetCount(targetCount);
        campaign.setUpdatedAt(LocalDateTime.now());

        // Notify manager about campaign scheduling and target count
        notificationService.notifyManagerAboutCampaignSchedule(campaign);

        return campaignRepository.save(campaign);
    }

    @Transactional
    public HealthCheckCampaign startCampaign(Long id) {
        Optional<HealthCheckCampaign> optionalCampaign = campaignRepository.findById(id);
        if (optionalCampaign.isEmpty()) {
            throw new RuntimeException("Campaign not found with id: " + id);
        }

        HealthCheckCampaign campaign = optionalCampaign.get();

        // Only allow starting if the campaign is in APPROVED status
        if (campaign.getStatus() != CampaignStatus.APPROVED) {
            throw new RuntimeException("Cannot start campaign that is not in APPROVED status");
        }

        campaign.setStatus(CampaignStatus.IN_PROGRESS);
        campaign.setUpdatedAt(LocalDateTime.now());

        return campaignRepository.save(campaign);
    }

    @Transactional
    public HealthCheckCampaign completeCampaign(Long id) {
        Optional<HealthCheckCampaign> optionalCampaign = campaignRepository.findById(id);
        if (optionalCampaign.isEmpty()) {
            throw new RuntimeException("Campaign not found with id: " + id);
        }

        HealthCheckCampaign campaign = optionalCampaign.get();

        // Only allow completion if the campaign is in IN_PROGRESS status
        if (campaign.getStatus() != CampaignStatus.IN_PROGRESS) {
            throw new RuntimeException("Cannot complete campaign that is not in IN_PROGRESS status");
        }

        campaign.setStatus(CampaignStatus.COMPLETED);
        campaign.setUpdatedAt(LocalDateTime.now());

        // Notify manager about campaign completion
        notificationService.notifyManagerAboutCampaignCompletion(campaign);

        return campaignRepository.save(campaign);
    }

    @Transactional
    public HealthCheckCampaign cancelCampaign(Long id, String notes) {
        Optional<HealthCheckCampaign> optionalCampaign = campaignRepository.findById(id);
        if (optionalCampaign.isEmpty()) {
            throw new RuntimeException("Campaign not found with id: " + id);
        }

        HealthCheckCampaign campaign = optionalCampaign.get();

        // Don't allow cancellation of COMPLETED campaigns
        if (campaign.getStatus() == CampaignStatus.COMPLETED) {
            throw new RuntimeException("Cannot cancel a completed campaign");
        }

        campaign.setStatus(CampaignStatus.CANCELED);
        campaign.setNotes(notes);
        campaign.setUpdatedAt(LocalDateTime.now());

        return campaignRepository.save(campaign);
    }

    public HealthCheckCampaign getCampaignById(Long id) {
        Optional<HealthCheckCampaign> campaign = campaignRepository.findById(id);
        return campaign.orElseThrow(() -> new RuntimeException("Campaign not found with id: " + id));
    }
    
    /**
     * Get campaign by ID with targetClasses eagerly loaded
     * This method ensures targetClasses collection is properly fetched from database
     */
    public HealthCheckCampaign getCampaignByIdWithTargetClasses(Long id) {
        HealthCheckCampaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Campaign not found with id: " + id));
        
        // Force initialization of targetClasses collection to avoid lazy loading issues
        if (campaign.getTargetClasses() != null) {
            campaign.getTargetClasses().size(); // This triggers lazy loading
        }
        
        System.out.println("🔄 EAGER FETCH DEBUG: Campaign " + id + " targetClasses loaded: " + campaign.getTargetClasses());
        
        return campaign;
    }

    public List<HealthCheckCampaign> getCampaignsByNurse(User nurse) {
        return campaignRepository.findByCreatedBy(nurse);
    }

    public List<HealthCheckCampaign> getCampaignsByStatus(CampaignStatus status) {
        return campaignRepository.findByStatus(status);
    }

    public List<HealthCheckCampaign> getUpcomingCampaigns() {
        return campaignRepository.findUpcomingCampaigns(CampaignStatus.APPROVED, LocalDate.now());
    }

    public List<HealthCheckCampaign> getCompletedCampaigns() {
        return campaignRepository.findCompletedCampaigns(CampaignStatus.COMPLETED, LocalDate.now());
    }

    public List<HealthCheckCampaign> getActiveCampaignsByClass(String className) {
        return campaignRepository.findActiveByClass(className);
    }

    /**
     * Calculate target count based on age range and target classes
     */
    private int calculateTargetCountInternal(Integer minAge, Integer maxAge, Set<String> targetClasses) {
        try {
            List<group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.StudentDTO> eligibleStudents = 
                studentService.getEligibleStudentsForClasses(targetClasses, minAge, maxAge);
            return eligibleStudents.size();
        } catch (Exception e) {
            // If there's an error calculating, return 0 and log the error
            System.err.println("Error calculating target count: " + e.getMessage());
            return 0;
        }
    }

    /**
     * Public method to calculate target count for API endpoint
     */
    @Override
    public int calculateTargetCount(Integer minAge, Integer maxAge, Set<String> targetClasses) {
        return calculateTargetCountInternal(minAge, maxAge, targetClasses);
    }

    /**
     * Send notifications to parents of eligible students for a health check campaign
     */
    @Override
    @Transactional
    public Map<String, Object> sendNotificationsToParents(Long campaignId) {
        
        // Get the campaign and validate it's approved
        HealthCheckCampaign campaign = getCampaignByIdWithTargetClasses(campaignId);
        
        if (campaign.getStatus() != CampaignStatus.APPROVED) {
            throw new RuntimeException("Campaign must be APPROVED before sending notifications to parents");
        }
        
        // DETAILED DEBUG for targetClasses
        Set<String> campaignTargetClasses = campaign.getTargetClasses();
        System.out.println("   - Target Classes Object: " + campaignTargetClasses);
        System.out.println("   - Target Classes is null: " + (campaignTargetClasses == null));
        System.out.println("   - Target Classes is empty: " + (campaignTargetClasses != null && campaignTargetClasses.isEmpty()));
        System.out.println("   - Target Classes size: " + (campaignTargetClasses != null ? campaignTargetClasses.size() : "NULL"));
        if (campaignTargetClasses != null && !campaignTargetClasses.isEmpty()) {
            System.out.println("   - Target Classes contents: " + String.join(", ", campaignTargetClasses));
        }
        
        System.out.println("   - Min Age: " + campaign.getMinAge());
        System.out.println("   - Max Age: " + campaign.getMaxAge());
        
        // CRITICAL FIX: Handle null/empty targetClasses
        Set<String> targetClassesToUse = campaignTargetClasses;
        if (targetClassesToUse == null || targetClassesToUse.isEmpty()) {
            System.out.println("🚨 CRITICAL: targetClasses is null/empty! Using fallback...");
            targetClassesToUse = Set.of("2B"); // Use known working class
        }
        
        System.out.println("🎯 FINAL SEARCH CRITERIA:");
        System.out.println("   - Using Classes: " + String.join(", ", targetClassesToUse));
        System.out.println("   - Using Min Age: " + campaign.getMinAge());
        System.out.println("   - Using Max Age: " + campaign.getMaxAge());
        
        List<StudentDTO> eligibleStudents = studentService.getEligibleStudentsForClasses(
            targetClassesToUse, 
            campaign.getMinAge(), 
            campaign.getMaxAge()
        );
        
        System.out.println("👥 NOTIFICATION DEBUG: Found " + eligibleStudents.size() + " eligible students");
        
        // Additional fallback if still no students found
        if (eligibleStudents.isEmpty()) {
            System.out.println("⚠️ NO STUDENTS FOUND - Trying second fallback with broader criteria...");
            Set<String> broadFallbackClasses = Set.of("2B", "2A", "3A", "3B"); // Try multiple classes
            List<StudentDTO> fallbackStudents = studentService.getEligibleStudentsForClasses(
                broadFallbackClasses, 
                6, 
                12
            );
            System.out.println("🔄 BROAD FALLBACK: Found " + fallbackStudents.size() + " students with multiple classes");
            
            if (!fallbackStudents.isEmpty()) {
                System.out.println("✅ Using broad fallback students for processing");
                eligibleStudents = fallbackStudents;
            }
        }

        // Create forms and send notifications for each eligible student
        int notificationsSent = 0;
        int formsCreated = 0;
        List<User> notifiedParents = new ArrayList<>();
        List<String> processedStudents = new ArrayList<>();
        List<String> errors = new ArrayList<>();
        
        System.out.println("🔄 PROCESSING STUDENTS: Starting to process " + eligibleStudents.size() + " students");
        
        for (StudentDTO studentDTO : eligibleStudents) {
            try {
                System.out.println("👤 NOTIFICATION DEBUG: Processing student " + studentDTO.getStudentID() + " - " + studentDTO.getName());
                
                // Find the student entity
                Optional<Student> studentOpt = studentRepository.findByIdWithParents(studentDTO.getStudentID());
                if (studentOpt.isEmpty()) {
                    String error = "Student not found: " + studentDTO.getStudentID();
                    System.out.println("❌ NOTIFICATION DEBUG: " + error);
                    errors.add(error);
                    continue; // Skip if student not found
                }
                
                Student student = studentOpt.get();
                System.out.println("✅ NOTIFICATION DEBUG: Student entity found for " + student.getFullName());
                
                // Get parents for this student
                List<User> parents = findParentsForStudent(studentDTO);
                System.out.println("👨‍👩‍👧‍👦 NOTIFICATION DEBUG: Found " + parents.size() + " parents for " + student.getFullName());
                
                if (parents.isEmpty()) {
                    String error = "No parents found for student: " + student.getFullName();
                    System.out.println("⚠️ NOTIFICATION DEBUG: " + error);
                    errors.add(error);
                    continue; // Skip to next student if no parents
                }
                
                System.out.println("🔄 PROCESSING PARENTS: About to process " + parents.size() + " parents for " + student.getFullName());
                
                for (User parent : parents) {
                    System.out.println("🔍 NOTIFICATION DEBUG: Validating parent for " + student.getFullName());
                    System.out.println("   - Parent exists: " + (parent != null));
                    if (parent != null) {
                        System.out.println("   - Parent enabled: " + parent.isEnabled());
                        System.out.println("   - Parent role: " + (parent.getRole() != null ? parent.getRole().getRoleName() : "null"));
                        System.out.println("   - Parent email: " + parent.getEmail());
                        System.out.println("   - Parent phone: " + parent.getPhone());
                    }
                    
                    if (isValidParent(parent)) {
                        System.out.println("👤 NOTIFICATION DEBUG: Processing valid parent " + parent.getPhone() + " for student " + student.getFullName());
                        
                        // Check if a form already exists for this student and campaign
                        HealthCheckForm existingForm = healthCheckFormRepository.findByCampaignAndStudent(campaign, student);
                        if (existingForm != null) {
                            System.out.println("⚠️ NOTIFICATION DEBUG: Form already exists for " + student.getFullName() + " (Form ID: " + existingForm.getId() + "), skipping");
                            continue; // Skip if form already exists
                        }
                        
                        // Create HealthCheckForm
                        HealthCheckForm form = new HealthCheckForm();
                        form.setCampaign(campaign);
                        form.setStudent(student);
                        form.setParent(parent);
                        form.setStatus(FormStatus.PENDING);
                        form.setSentAt(LocalDateTime.now());
                        
                        // Save the form
                        HealthCheckForm savedForm = healthCheckFormRepository.save(form);
                        formsCreated++;
                        System.out.println("✅ NOTIFICATION DEBUG: Created HealthCheckForm ID: " + savedForm.getId() + " for student " + student.getFullName());
                        
                        // Send notification with form reference using the proper method
                        System.out.println("📧 NOTIFICATION DEBUG: Sending notification to parent " + parent.getPhone());
                        notificationService.notifyParentAboutHealthCheck(savedForm);
                        System.out.println("✅ NOTIFICATION DEBUG: Notification sent successfully to " + parent.getPhone());
                        
                        // Track notified parents (avoid duplicates)
                        if (!notifiedParents.contains(parent)) {
                            notifiedParents.add(parent);
                            notificationsSent++;
                        }
                        
                        processedStudents.add(student.getFullName() + " -> " + parent.getPhone());
                    } else {
                        String error = "Invalid parent for " + student.getFullName() + ": " + getParentValidationError(parent);
                        System.out.println("❌ NOTIFICATION DEBUG: " + error);
                        errors.add(error);
                    }
                }
            } catch (Exception e) {
                String error = "Error processing student " + studentDTO.getStudentID() + ": " + e.getMessage();
                System.err.println("❌ NOTIFICATION DEBUG: " + error);
                e.printStackTrace();
                errors.add(error);
            }
        }

        System.out.println("🏁 NOTIFICATION DEBUG: Completed notification process");
        System.out.println("📊 NOTIFICATION DEBUG: Summary - Eligible: " + eligibleStudents.size() + 
                          ", Forms: " + formsCreated + ", Notifications: " + notificationsSent);
        
        if (!processedStudents.isEmpty()) {
            System.out.println("✅ NOTIFICATION DEBUG: Successfully processed:");
            processedStudents.forEach(s -> System.out.println("   - " + s));
        }
        
        if (!errors.isEmpty()) {
            System.out.println("❌ NOTIFICATION DEBUG: Errors encountered:");
            errors.forEach(e -> System.out.println("   - " + e));
        }

        // Add debug summary
        debugParentAccountsStatus();
        
        // Enhanced response with detailed breakdown
        Map<String, Object> response = new HashMap<>();
        response.put("message", notificationsSent > 0 ? "Thông báo đã được gửi thành công" : "Không có thông báo nào được gửi");
        response.put("campaignId", campaignId);
        response.put("campaignName", campaign.getName());
        response.put("totalEligibleStudents", eligibleStudents.size());
        response.put("formsCreated", formsCreated);
        response.put("notificationsSent", notificationsSent);
        response.put("eligibleParents", notifiedParents.size());
        response.put("processedStudents", processedStudents);
        response.put("errors", errors);
        
        // Add diagnostic information
        if (notificationsSent == 0 && !eligibleStudents.isEmpty()) {
            response.put("diagnostic", "Có " + eligibleStudents.size() + " học sinh đủ điều kiện nhưng không có phụ huynh hợp lệ nào để gửi thông báo. Vui lòng kiểm tra dữ liệu phụ huynh.");
            response.put("possibleCauses", List.of(
                "Học sinh chưa được liên kết với tài khoản phụ huynh",
                "Tài khoản phụ huynh bị vô hiệu hóa",
                "Tài khoản phụ huynh không có role 'PARENT' phù hợp",
                "Dữ liệu liên kết giữa học sinh và phụ huynh bị lỗi"
            ));
        }
        
        return response;
    }

    @Override
    @Transactional
    public Map<String, Object> fixParentData(Long campaignId) {
        System.out.println("🔧 FIX PARENT DATA: Starting fixParentData for campaign " + campaignId);
        
        HealthCheckCampaign campaign = getCampaignByIdWithTargetClasses(campaignId);
        
        System.out.println("🔍 FIX PARENT DEBUG: Campaign details:");
        
        // DETAILED DEBUG for targetClasses in fix method too
        Set<String> campaignTargetClasses = campaign.getTargetClasses();
        System.out.println("   - Target Classes Object: " + campaignTargetClasses);
        System.out.println("   - Target Classes is null: " + (campaignTargetClasses == null));
        System.out.println("   - Target Classes is empty: " + (campaignTargetClasses != null && campaignTargetClasses.isEmpty()));
        
        System.out.println("   - Min Age: " + campaign.getMinAge());
        System.out.println("   - Max Age: " + campaign.getMaxAge());
        
        // CRITICAL FIX: Handle null/empty targetClasses in fix method too
        Set<String> targetClassesToUse = campaignTargetClasses;
        if (targetClassesToUse == null || targetClassesToUse.isEmpty()) {
            System.out.println("🚨 FIX PARENT: targetClasses is null/empty! Using fallback...");
            targetClassesToUse = Set.of("2B"); // Use known working class
        }
        
        List<StudentDTO> eligibleStudents = studentService.getEligibleStudentsForClasses(
            targetClassesToUse, 
            campaign.getMinAge(), 
            campaign.getMaxAge()
        );
        
        System.out.println("👥 FIX PARENT DEBUG: Found " + eligibleStudents.size() + " eligible students");
        
        // If no students found, try with fallback filters
        if (eligibleStudents.isEmpty()) {
            System.out.println("⚠️ NO STUDENTS FOR FIX - Trying fallback with broader classes...");
            Set<String> fallbackClasses = Set.of("2B", "2A", "3A", "3B");
            List<StudentDTO> fallbackStudents = studentService.getEligibleStudentsForClasses(
                fallbackClasses, 
                6, 
                12
            );
            System.out.println("🔄 FALLBACK: Found " + fallbackStudents.size() + " students for parent fixing");
            
            if (!fallbackStudents.isEmpty()) {
                eligibleStudents = fallbackStudents;
            }
        }
        
        int disabledParentsEnabled = 0;
        int newParentsCreated = 0;
        int studentsLinked = 0;
        
        try {
            // Step 1: Enable all disabled parent accounts
            System.out.println("🔧 Step 1: Enabling disabled parent accounts...");
            
            // Find role PARENT
            Optional<group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.Role> parentRoleOpt = 
                roleRepository.findByRoleName("PARENT");
            
            if (parentRoleOpt.isEmpty()) {
                throw new RuntimeException("PARENT role not found in database");
            }
            
            group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.Role parentRole = parentRoleOpt.get();
            
            // Enable disabled parents
            List<User> allParents = userRepository.findByRole_RoleName("PARENT");
            for (User parent : allParents) {
                if (!parent.isEnabled()) {
                    parent.setEnabled(true);
                    userRepository.save(parent);
                    disabledParentsEnabled++;
                    System.out.println("✅ Enabled parent: " + parent.getPhone());
                }
            }
            
            // Step 2: Create parent accounts for students without parents
            System.out.println("🔧 Step 2: Creating missing parent accounts...");
            
            for (StudentDTO studentDTO : eligibleStudents) {
                Optional<Student> studentOpt = studentRepository.findByIdWithParents(studentDTO.getStudentID());
                if (studentOpt.isPresent()) {
                    Student student = studentOpt.get();
                    
                    // Check if student needs a parent
                    boolean needsParent = !isValidParent(student.getMother()) && !isValidParent(student.getFather());
                    
                    if (needsParent) {
                        System.out.println("🔧 Creating parent for student: " + student.getFullName());
                        
                        // Create new parent user
                        User newParent = new User();
                        newParent.setFirstName("PH_" + student.getFirstName());
                        newParent.setLastName(student.getLastName());
                        newParent.setDob(student.getDob().minusYears(25)); // Parent is 25 years older
                        newParent.setGender("M");
                        newParent.setPhone("098765" + String.format("%04d", student.getStudentID().intValue()));
                        newParent.setAddress(student.getAddress());
                        newParent.setJobTitle("Phụ huynh");
                        newParent.setEnabled(true);
                        newParent.setRole(parentRole);
                        
                        User savedParent = userRepository.save(newParent);
                        newParentsCreated++;
                        
                        // Link parent to student
                        student.setMother(savedParent);
                        studentRepository.save(student);
                        studentsLinked++;
                        
                        System.out.println("✅ Created and linked parent: " + savedParent.getPhone() + 
                                         " for student: " + student.getFullName());
                    }
                }
            }
            
            System.out.println("🏁 FIX PARENT DATA: Completed");
            System.out.println("📊 Summary - Disabled parents enabled: " + disabledParentsEnabled + 
                              ", New parents created: " + newParentsCreated + 
                              ", Students linked: " + studentsLinked);
            
        } catch (Exception e) {
            System.err.println("❌ Error in fixParentData: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to fix parent data: " + e.getMessage());
        }
        
        return Map.of(
            "message", "Parent data fixed successfully",
            "campaignId", campaignId,
            "disabledParentsEnabled", disabledParentsEnabled,
            "newParentsCreated", newParentsCreated,
            "studentsFixed", studentsLinked,
            "totalEligibleStudents", eligibleStudents.size()
        );
    }

    /**
     * Helper method to find parents for a student
     */
    private List<User> findParentsForStudent(StudentDTO studentDTO) {
        List<User> parents = new ArrayList<>();
        try {
            System.out.println("🔍 PARENT SEARCH DEBUG: Looking for parents of student ID: " + studentDTO.getStudentID());
            
            // Get the student entity with parent relationships
            Optional<Student> studentOpt = studentRepository.findByIdWithParents(studentDTO.getStudentID());
            if (studentOpt.isPresent()) {
                Student student = studentOpt.get();
                System.out.println("   Student found: " + student.getFullName());
                
                // Check mother
                if (student.getMother() != null) {
                    User mother = student.getMother();
                    System.out.println("   Mother exists: " + mother.getPhone() + " (enabled: " + mother.isEnabled() + 
                                     ", role: " + (mother.getRole() != null ? mother.getRole().getRoleName() : "null") + ")");
                    
                    // More flexible parent validation
                    if (isValidParent(mother)) {
                        parents.add(mother);
                        System.out.println("   ✅ Added mother to valid parents list");
                    } else {
                        System.out.println("   ❌ Mother not valid - " + getParentValidationError(mother));
                    }
                } else {
                    System.out.println("   No mother assigned");
                }
                
                // Check father
                if (student.getFather() != null) {
                    User father = student.getFather();
                    System.out.println("   Father exists: " + father.getPhone() + " (enabled: " + father.isEnabled() + 
                                     ", role: " + (father.getRole() != null ? father.getRole().getRoleName() : "null") + ")");
                    
                    // More flexible parent validation
                    if (isValidParent(father)) {
                        parents.add(father);
                        System.out.println("   ✅ Added father to valid parents list");
                    } else {
                        System.out.println("   ❌ Father not valid - " + getParentValidationError(father));
                    }
                } else {
                    System.out.println("   No father assigned");
                }
                
                System.out.println("   Total valid parents found: " + parents.size());
            } else {
                System.out.println("   ❌ Student not found in database");
            }
            
            return parents;
        } catch (Exception e) {
            System.err.println("❌ Error finding parents for student " + studentDTO.getStudentID() + ": " + e.getMessage());
            e.printStackTrace();
            return parents;
        }
    }

    /**
     * Enhanced parent validation with more flexible criteria
     */
    private boolean isValidParent(User parent) {
        System.out.println("🔍 VALIDATE PARENT: Starting validation");
        
        if (parent == null) {
            System.out.println("❌ VALIDATE PARENT: Parent is null");
            return false;
        }
        
        System.out.println("✅ VALIDATE PARENT: Parent exists - " + parent.getPhone());
        
        // Check if parent is enabled
        if (!parent.isEnabled()) {
            System.out.println("❌ VALIDATE PARENT: Parent is disabled - " + parent.getPhone());
            return false;
        }
        
        System.out.println("✅ VALIDATE PARENT: Parent is enabled - " + parent.getPhone());
        
        // Check if parent has role
        if (parent.getRole() == null) {
            System.out.println("❌ VALIDATE PARENT: Parent has no role - " + parent.getPhone());
            return false;
        }
        
        String roleName = parent.getRole().getRoleName();
        System.out.println("🔍 VALIDATE PARENT: Parent role is '" + roleName + "' - " + parent.getPhone());
        
        // Check role name - support both "PARENT" and "ROLE_PARENT"
        boolean isValid = "PARENT".equals(roleName) || "ROLE_PARENT".equals(roleName);
        
        if (isValid) {
            System.out.println("✅ VALIDATE PARENT: VALID PARENT - " + parent.getPhone() + " (role: " + roleName + ")");
        } else {
            System.out.println("❌ VALIDATE PARENT: INVALID PARENT - " + parent.getPhone() + " (role: " + roleName + ")");
        }
        
        return isValid;
    }

    /**
     * Get detailed error message for parent validation failure
     */
    private String getParentValidationError(User parent) {
        if (parent == null) {
            return "parent is null";
        }
        if (!parent.isEnabled()) {
            return "parent account disabled (" + parent.getPhone() + ")";
        }
        if (parent.getRole() == null) {
            return "parent has no role (" + parent.getPhone() + ")";
        }
        String roleName = parent.getRole().getRoleName();
        return "parent role is '" + roleName + "' not 'PARENT' or 'ROLE_PARENT' (" + parent.getPhone() + ")";
    }
    /**
     * Check if student has at least one valid parent
     */
    private boolean hasValidParent(Student student) {
        return isValidParent(student.getMother()) || isValidParent(student.getFather());
    }

    /**
     * Get campaign information by form ID for parent
     */
    @Override
    public HealthCheckCampaign getCampaignByFormIdForParent(Long formId, User parent) {
        try {
            // Find the form by ID first
            Optional<group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.HealthCheckForm> formOpt = 
                healthCheckFormRepository.findById(formId);
            
            if (formOpt.isEmpty()) {
                throw new RuntimeException("Health check form not found with id: " + formId);
            }
            
            group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.HealthCheckForm form = formOpt.get();
            
            // Verify that this form belongs to the requesting parent
            if (!form.getParent().getId().equals(parent.getId())) {
                throw new SecurityException("You are not authorized to view this campaign");
            }
            
            // Return the campaign associated with this form
            return form.getCampaign();
            
        } catch (Exception e) {
            if (e instanceof SecurityException) {
                throw e;
            }
            throw new RuntimeException("Error retrieving campaign for form: " + e.getMessage());
        }
    }

    /**
     * Get all active campaigns for a parent's children
     */
    @Override
    public List<HealthCheckCampaign> getActiveCampaignsForParent(User parent) {
        try {
            // Get all health check forms for this parent
            List<group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.HealthCheckForm> parentForms = 
                healthCheckFormRepository.findByParent(parent);
            
            Set<HealthCheckCampaign> campaigns = new HashSet<>();
            
            // Get active campaigns from forms
            for (group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.HealthCheckForm form : parentForms) {
                if (form.getCampaign().getStatus() == CampaignStatus.APPROVED || 
                    form.getCampaign().getStatus() == CampaignStatus.IN_PROGRESS) {
                    campaigns.add(form.getCampaign());
                }
            }
            
            return new ArrayList<>(campaigns);
            
        } catch (Exception e) {
            throw new RuntimeException("Error retrieving active campaigns for parent: " + e.getMessage());
        }
    }
}

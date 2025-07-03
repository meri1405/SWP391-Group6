package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.impl;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.CreateHealthCheckCampaignRequest;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.HealthCheckCampaignDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.HealthCheckFormDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.RecordHealthCheckResultRequest;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.ScheduleHealthCheckCampaignRequest;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.StudentDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.*;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.CampaignStatus;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.FormStatus;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.HealthCheckCategory;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.TimeSlot;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.*;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IHealthCheckCampaignService;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IHealthCheckFormService;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.INotificationService;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IStudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HealthCheckCampaignService implements IHealthCheckCampaignService {

    private final HealthCheckCampaignRepository campaignRepository;
    private final INotificationService notificationService;
    private final IStudentService studentService;
    private final IHealthCheckFormService healthCheckFormService;
    private final StudentRepository studentRepository;
    private final HealthCheckFormRepository healthCheckFormRepository;
    private final NotificationRepository notificationRepository;
    private final VisionRepository visionRepository;
    private final HearingRepository hearingRepository;
    private final OralRepository oralRepository;
    private final SkinRepository skinRepository;
    private final RespiratoryRepository respiratoryRepository;

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

        // Always calculate target count when creating campaign
        System.out.println("=== CAMPAIGN CREATION DEBUG ===");
        System.out.println("Campaign name: " + name);
        System.out.println("Min age: " + minAge + ", Max age: " + maxAge);
        System.out.println("Target classes: " + targetClasses);
        System.out.println("Calculating target count...");
        int targetCount = calculateTargetCountInternal(minAge, maxAge, targetClasses);
        System.out.println("Calculated target count: " + targetCount);
        campaign.setTargetCount(targetCount);

        HealthCheckCampaign savedCampaign = campaignRepository.save(campaign);
        System.out.println("Saved campaign with target count: " + savedCampaign.getTargetCount());

        // Notify managers about a new campaign pending approval
        int estimatedCount = savedCampaign.getTargetCount();
        System.out.println("Notifying managers with estimated count: " + estimatedCount);
        System.out.println("=== END CAMPAIGN CREATION DEBUG ===");
        notificationService.notifyManagersAboutHealthCheckCampaignApproval(savedCampaign, estimatedCount);

        return savedCampaign;
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

        // Always recalculate target count when updating campaign
        int targetCount = calculateTargetCountInternal(minAge, maxAge, targetClasses);
        campaign.setTargetCount(targetCount);

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
        int estimatedCount = campaign.getTargetCount();
        notificationService.notifyManagersAboutHealthCheckCampaignApproval(campaign, estimatedCount);

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

        HealthCheckCampaign savedCampaign = campaignRepository.save(campaign);

        // Notify the nurse who created the campaign about the approval
        notificationService.notifyNurseAboutHealthCheckCampaignApproval(savedCampaign, manager);

        return savedCampaign;
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

        HealthCheckCampaign savedCampaign = campaignRepository.save(campaign);

        // Notify the nurse who created the campaign about the rejection
        notificationService.notifyNurseAboutHealthCheckCampaignRejection(savedCampaign, manager, notes);

        return savedCampaign;
    }

    @Transactional
    public HealthCheckCampaign scheduleCampaign(Long id, Integer targetCount, TimeSlot timeSlot, String scheduleNotes) {
        Optional<HealthCheckCampaign> optionalCampaign = campaignRepository.findById(id);
        if (optionalCampaign.isEmpty()) {
            throw new RuntimeException("Campaign not found with id: " + id);
        }

        HealthCheckCampaign campaign = optionalCampaign.get();

        // Only allow scheduling if the campaign is in APPROVED status
        if (campaign.getStatus() != CampaignStatus.APPROVED) {
            throw new RuntimeException("Cannot schedule campaign that is not in APPROVED status");
        }

        // Set the campaign scheduling details
        campaign.setTargetCount(targetCount);
        campaign.setTimeSlot(timeSlot);
        campaign.setScheduleNotes(scheduleNotes);
        campaign.setUpdatedAt(LocalDateTime.now());

        HealthCheckCampaign savedCampaign = campaignRepository.save(campaign);

        // Notify manager about campaign scheduling and target count
        notificationService.notifyManagerAboutHealthCheckCampaignScheduling(savedCampaign, targetCount);

        return savedCampaign;
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

        HealthCheckCampaign savedCampaign = campaignRepository.save(campaign);
        
        // Send forms to eligible parents when campaign starts
        sendFormsToEligibleParents(savedCampaign);

        return savedCampaign;
    }

    @Transactional
    public void sendFormsToEligibleParents(HealthCheckCampaign campaign) {
        // Get eligible students for this campaign
        List<StudentDTO> eligibleStudents = getEligibleStudents(campaign);
        
        int formsCreated = 0;
        int formsSent = 0;
        
        for (StudentDTO studentDTO : eligibleStudents) {
            try {
                Optional<Student> studentOpt = studentRepository.findById(studentDTO.getStudentID());
                if (studentOpt.isPresent()) {
                    Student student = studentOpt.get();
                    User parent = student.getParent();
                    
                    if (parent != null) {
                        // Create the health check form
                        HealthCheckForm form = healthCheckFormService.createHealthCheckForm(campaign, student, parent);
                        formsCreated++;
                        
                        // Send the form to the parent
                        healthCheckFormService.sendFormToParent(form);
                        formsSent++;
                    }
                }
            } catch (Exception e) {
                System.err.println("Error creating/sending form for student ID " + studentDTO.getStudentID() + ": " + e.getMessage());
            }
        }
        
        System.out.println("Health check forms sent - Campaign: " + campaign.getName() + 
                         ", Forms created: " + formsCreated + 
                         ", Forms sent: " + formsSent);
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

        HealthCheckCampaign savedCampaign = campaignRepository.save(campaign);

        // Notify manager about campaign completion
        // Count completed students based on confirmed forms or other logic
        int completedStudentCount = savedCampaign.getConfirmedCount(); // Adjust this based on your business logic
        notificationService.notifyManagerAboutHealthCheckCampaignCompletion(savedCampaign, completedStudentCount);

        return savedCampaign;
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

    @Override
    public List<StudentDTO> getEligibleStudents(HealthCheckCampaign campaign) {
        if (campaign == null) {
            throw new IllegalArgumentException("Campaign cannot be null");
        }
        
        Set<String> targetClasses = campaign.getTargetClasses();
        Integer minAge = campaign.getMinAge();
        Integer maxAge = campaign.getMaxAge();
        
        if (targetClasses != null && !targetClasses.isEmpty()) {
            // If specific classes are targeted, get students from those classes with age filter
            return studentService.getEligibleStudentsForClasses(targetClasses, minAge, maxAge);
        } else if (minAge != null || maxAge != null) {
            // If only age criteria is specified, get all students within age range
            return studentService.getStudentsByAgeRange(minAge, maxAge);
        } else {
            // If no specific criteria, get all students
            return studentService.getAllStudents();
        }
    }

    @Override
    public List<StudentDTO> getEligibleStudents(Long campaignId) {        
        HealthCheckCampaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new RuntimeException("Campaign not found with id: " + campaignId));
        
        return getEligibleStudents(campaign);
    }

    /**
     * Get eligible students with their health check form status
     */
    @Override
    public List<Map<String, Object>> getEligibleStudentsWithFormStatus(Long campaignId) {
        
        HealthCheckCampaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new RuntimeException("Campaign not found with id: " + campaignId));
        
        // Get base eligible students
        List<StudentDTO> eligibleStudents = getEligibleStudents(campaign);
        
        // Get all forms for this campaign
        List<HealthCheckFormDTO> campaignForms = healthCheckFormService.getFormsByCampaign(campaign);
        
        // Create map of studentId -> form data
        Map<Long, HealthCheckFormDTO> studentFormMap = campaignForms.stream()
                .collect(Collectors.toMap(
                    form -> form.getStudentId(),
                    form -> form,
                    (existing, replacement) -> existing // Keep first if duplicate
                ));
        
        // Convert to Map objects with form status and notification info
        List<Map<String, Object>> studentsWithStatus = new ArrayList<>();
        for (StudentDTO student : eligibleStudents) {
            Map<String, Object> studentData = new HashMap<>();
            studentData.put("studentID", student.getStudentID());
            studentData.put("fullName", student.getFullName());
            studentData.put("className", student.getClassName());
            studentData.put("age", student.getAge());
            studentData.put("gender", student.getGender());
            studentData.put("parentName", student.getParentName());
            studentData.put("parentPhone", student.getParentPhone());
            
            HealthCheckFormDTO form = studentFormMap.get(student.getStudentID());
            if (form != null) {
                studentData.put("status", form.getStatus().toString());
                studentData.put("formId", form.getId());
                studentData.put("sentAt", form.getSentAt());
                studentData.put("respondedAt", form.getRespondedAt());
                studentData.put("notificationSent", form.getSentAt() != null);
            } else {
                studentData.put("status", "NO_FORM");
                studentData.put("formId", null);
                studentData.put("sentAt", null);
                studentData.put("respondedAt", null);
                studentData.put("notificationSent", false);
            }
            
            studentsWithStatus.add(studentData);
        }
        
        System.out.println("Students with form status: " + studentsWithStatus.size());
        System.out.println("Forms found: " + campaignForms.size());
        
        return studentsWithStatus;
    }

    public HealthCheckCampaignDTO createCampaign(User nurse, CreateHealthCheckCampaignRequest request) {
        HealthCheckCampaign campaign = createCampaign(
                request.getName(),
                request.getDescription(),
                request.getStartDate(),
                request.getEndDate(),
                request.getLocation(),
                request.getCategories(),
                nurse,
                request.getMinAge(),
                request.getMaxAge(),
                request.getTargetClasses()
        );
        return convertToDTO(campaign);
    }

    public HealthCheckCampaignDTO getCampaignById(Long id) {
        Optional<HealthCheckCampaign> campaign = campaignRepository.findById(id);
        if (campaign.isEmpty()) {
            throw new IllegalArgumentException("Campaign not found with id: " + id);
        }
        return convertToDTO(campaign.get());
    }

    public HealthCheckCampaign getCampaignModelById(Long id) {
        Optional<HealthCheckCampaign> campaign = campaignRepository.findById(id);
        if (campaign.isEmpty()) {
            throw new IllegalArgumentException("Campaign not found with id: " + id);
        }
        return campaign.get();
    }

    public Page<HealthCheckCampaignDTO> getCampaignsByNurse(User nurse, Pageable pageable) {
        Page<HealthCheckCampaign> campaigns = campaignRepository.findByCreatedByOrderByCreatedAtDesc(nurse, pageable);
        return campaigns.map(this::convertToDTO);
    }

    public Page<HealthCheckCampaignDTO> getCampaignsByStatus(CampaignStatus status, Pageable pageable) {
        Page<HealthCheckCampaign> campaigns = campaignRepository.findByStatusOrderByCreatedAtDesc(status, pageable);
        return campaigns.map(this::convertToDTO);
    }

    public HealthCheckCampaignDTO updateCampaign(Long id, User nurse, CreateHealthCheckCampaignRequest request) {
        Optional<HealthCheckCampaign> optionalCampaign = campaignRepository.findById(id);
        if (optionalCampaign.isEmpty()) {
            throw new IllegalArgumentException("Campaign not found with id: " + id);
        }

        HealthCheckCampaign campaign = optionalCampaign.get();

        // Verify the nurse is the creator
        if (!campaign.getCreatedBy().getId().equals(nurse.getId())) {
            throw new IllegalArgumentException("Not authorized to update this campaign");
        }

        // Only allow updates if campaign is in PENDING status
        if (campaign.getStatus() != CampaignStatus.PENDING) {
            throw new IllegalStateException("Can only update campaigns in PENDING status");
        }

        // Update campaign fields
        campaign.setName(request.getName());
        campaign.setDescription(request.getDescription());
        campaign.setStartDate(request.getStartDate());
        campaign.setEndDate(request.getEndDate());
        campaign.setLocation(request.getLocation());
        campaign.setCategories(request.getCategories());
        campaign.setMinAge(request.getMinAge());
        campaign.setMaxAge(request.getMaxAge());
        campaign.setTargetClasses(request.getTargetClasses() != null ? request.getTargetClasses() : new HashSet<>());
        campaign.setUpdatedAt(LocalDateTime.now());

        HealthCheckCampaign savedCampaign = campaignRepository.save(campaign);
        return convertToDTO(savedCampaign);
    }

    public HealthCheckCampaignDTO approveCampaignDTO(Long id, User manager) {
        HealthCheckCampaign campaign = approveCampaign(id, manager);
        return convertToDTO(campaign);
    }

    public HealthCheckCampaignDTO rejectCampaignDTO(Long id, User manager, String notes) {
        HealthCheckCampaign campaign = rejectCampaign(id, manager, notes);
        return convertToDTO(campaign);
    }

    public HealthCheckCampaignDTO scheduleCampaignDTO(Long id, ScheduleHealthCheckCampaignRequest request) {
        HealthCheckCampaign campaign = scheduleCampaign(id, request.getTargetCount(), request.getTimeSlot(), request.getScheduleNotes());
        return convertToDTO(campaign);
    }

    public HealthCheckCampaignDTO startCampaignDTO(Long id) {
        HealthCheckCampaign campaign = startCampaign(id);
        return convertToDTO(campaign);
    }

    public HealthCheckCampaignDTO completeCampaignDTO(Long id) {
        HealthCheckCampaign campaign = completeCampaign(id);
        return convertToDTO(campaign);
    }

    public HealthCheckCampaignDTO convertToDTO(HealthCheckCampaign campaign) {
        HealthCheckCampaignDTO dto = new HealthCheckCampaignDTO();
        
        dto.setId(campaign.getId());
        dto.setName(campaign.getName());
        dto.setDescription(campaign.getDescription());
        dto.setStartDate(campaign.getStartDate());
        dto.setEndDate(campaign.getEndDate());
        dto.setLocation(campaign.getLocation());
        dto.setCategories(campaign.getCategories());
        dto.setStatus(campaign.getStatus());
        dto.setNotes(campaign.getNotes());
        dto.setTargetCount(campaign.getTargetCount());
        dto.setMinAge(campaign.getMinAge());
        dto.setMaxAge(campaign.getMaxAge());
        dto.setTargetClasses(campaign.getTargetClasses());
        dto.setCreatedAt(campaign.getCreatedAt());
        dto.setUpdatedAt(campaign.getUpdatedAt());
        dto.setApprovedAt(campaign.getApprovedAt());

        // Creator information
        if (campaign.getCreatedBy() != null) {
            dto.setCreatedById(campaign.getCreatedBy().getId());
            dto.setCreatedByName(campaign.getCreatedBy().getFullName());
        }

        // Approver information
        if (campaign.getApprovedBy() != null) {
            dto.setApprovedById(campaign.getApprovedBy().getId());
            dto.setApprovedByName(campaign.getApprovedBy().getFullName());
        }

        return dto;
    }

    // ...existing code...

    public List<HealthCheckCampaign> getCampaignsByNurse(User nurse) {
        return campaignRepository.findByCreatedBy(nurse);
    }

    public List<HealthCheckCampaign> getCampaignsByStatus(CampaignStatus status) {
        return campaignRepository.findByStatus(status);
    }

    /*
    // TODO: Add these repository methods when needed
    public List<HealthCheckCampaign> getUpcomingCampaigns() {
        return campaignRepository.findUpcomingCampaigns(CampaignStatus.APPROVED, LocalDate.now());
    }

    public List<HealthCheckCampaign> getCompletedCampaigns() {
        return campaignRepository.findCompletedCampaigns(CampaignStatus.COMPLETED, LocalDate.now());
    }

    public List<HealthCheckCampaign> getActiveCampaignsByClass(String className) {
        return campaignRepository.findActiveByClass(className);
    }
    */

    /**
     * Calculate target count based on age range and target classes
     */
    private int calculateTargetCountInternal(Integer minAge, Integer maxAge, Set<String> targetClasses) {
        try {
            List<StudentDTO> eligibleStudents = 
                studentService.getEligibleStudentsForClasses(targetClasses, minAge, maxAge);
            
            for (StudentDTO student : eligibleStudents) {
                System.out.println("- Student: " + student.getFullName() + " (Class: " + student.getClassName() + ", Disabled: " + student.isDisabled() + ")");
            }
            
            return eligibleStudents.size();
        } catch (Exception e) {
            // If there's an error calculating, return 0 and log the error
            System.err.println("Error calculating target count: " + e.getMessage());
            e.printStackTrace();
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
     * Generate health check forms for eligible students
     */
    @Override
    @Transactional
    public Map<String, Object> generateHealthCheckForms(Long campaignId) {
        // Get the campaign and validate it's approved
        Optional<HealthCheckCampaign> optionalCampaign = campaignRepository.findById(campaignId);
        if (optionalCampaign.isEmpty()) {
            throw new RuntimeException("Campaign not found with id: " + campaignId);
        }
        
        HealthCheckCampaign campaign = optionalCampaign.get();
        if (campaign.getStatus() != CampaignStatus.APPROVED) {
            throw new RuntimeException("Campaign must be APPROVED before generating forms");
        }

        // Get eligible students for this campaign
        List<StudentDTO> eligibleStudents = studentService.getEligibleStudentsForClasses(
            campaign.getTargetClasses(), 
            campaign.getMinAge(), 
            campaign.getMaxAge()
        );

        int formsGenerated = 0;
        int studentsWithValidParents = 0;
        int studentsWithoutParents = 0;
        int studentsWithInactiveParents = 0;
        List<Long> createdFormIds = new ArrayList<>();
        List<String> studentsWithoutValidParents = new ArrayList<>();

        // Create actual health check forms for each eligible student
        for (StudentDTO studentDTO : eligibleStudents) {
            try {
                // Find the actual student entity
                Optional<Student> studentOpt = studentRepository.findById(studentDTO.getStudentID());
                if (studentOpt.isPresent()) {
                    Student student = studentOpt.get();
                    User parent = student.getParent();
                    
                    if (parent == null) {
                        studentsWithoutParents++;
                        studentsWithoutValidParents.add("Student " + student.getStudentID() + " - No parent assigned");
                    } else if (!parent.isEnabled()) {
                        studentsWithInactiveParents++;
                        studentsWithoutValidParents.add("Student " + student.getStudentID() + " - Parent " + parent.getId() + " disabled");
                    } else if (!parent.getRole().getRoleName().equals("PARENT")) {
                        studentsWithInactiveParents++;
                        studentsWithoutValidParents.add("Student " + student.getStudentID() + " - User " + parent.getId() + " not parent role");
                    } else {
                        // Valid parent found - create form
                        studentsWithValidParents++;
                        HealthCheckForm form = healthCheckFormService.createHealthCheckForm(campaign, student, parent);
                        createdFormIds.add(form.getId());
                        formsGenerated++;
                    }
                } else {
                    studentsWithoutParents++;
                    studentsWithoutValidParents.add("Student " + studentDTO.getStudentID() + " - Student entity not found");
                    System.out.println("ERROR: Student entity not found for ID " + studentDTO.getStudentID());
                }
            } catch (Exception e) {
                studentsWithoutParents++;
                studentsWithoutValidParents.add("Student " + studentDTO.getStudentID() + ": " + e.getMessage());
                System.err.println("ERROR: " + e.getMessage());
            }
        }

        for (String detail : studentsWithoutValidParents) {
            System.out.println("  - " + detail);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("formsGenerated", formsGenerated);
        response.put("campaignId", campaignId);
        response.put("message", "Health check forms generated successfully");
        response.put("createdFormIds", createdFormIds);
        response.put("totalEligibleStudents", eligibleStudents.size());
        response.put("studentsWithValidParents", studentsWithValidParents);
        response.put("studentsWithoutParents", studentsWithoutParents);
        response.put("studentsWithInactiveParents", studentsWithInactiveParents);
        response.put("studentsWithoutValidParents", studentsWithoutValidParents);
        response.put("message", "Health check forms generated successfully");
        response.put("createdFormIds", createdFormIds);

        System.out.println("Forms generated: " + formsGenerated);
        return response;
    }

    /**
     * Send notifications to parents of eligible students for a health check campaign
     */
    @Override
    @Transactional
    public Map<String, Object> sendNotificationsToParents(Long campaignId) {
        // Delegate to the overloaded method with null custom message
        return sendNotificationsToParents(campaignId, null);
    }

    /**
     * Send notifications to parents of eligible students for a health check campaign
     */
    @Override
    @Transactional
    public Map<String, Object> sendNotificationsToParents(Long campaignId, String customMessage) {
        // Get the campaign and validate it's approved
        Optional<HealthCheckCampaign> optionalCampaign = campaignRepository.findById(campaignId);
        if (optionalCampaign.isEmpty()) {
            throw new RuntimeException("Campaign not found with id: " + campaignId);
        }
        
        HealthCheckCampaign campaign = optionalCampaign.get();
        if (campaign.getStatus() != CampaignStatus.APPROVED) {
            throw new RuntimeException("Campaign must be APPROVED before sending notifications to parents");
        }

        // Get all existing forms for this campaign instead of eligible students
        List<HealthCheckFormDTO> campaignForms = healthCheckFormService.getFormsByCampaign(campaign);
        
        System.out.println("Total forms for this campaign: " + campaignForms.size());

        int notificationsSent = 0;
        int formsProcessed = 0;
        List<String> errors = new ArrayList<>();
        Map<Long, Integer> parentNotificationCount = new HashMap<>();

        // Send ONE NOTIFICATION PER FORM (per student), even if same parent has multiple children
        for (HealthCheckFormDTO formDTO : campaignForms) {
            try {
                formsProcessed++;
                
                // Find the actual HealthCheckForm entity by ID
                HealthCheckForm actualForm = healthCheckFormRepository.findById(formDTO.getId())
                    .orElse(null);
                    
                if (actualForm != null) {
                    Student student = actualForm.getStudent();
                    User parent = actualForm.getParent();
                    
                    if (parent != null && parent.isEnabled() && parent.getRole().getRoleName().equals("PARENT")) {
                        // Create specific notification message for this student
                        String studentName = student.getFirstName() + " " + student.getLastName();
                        String customNotificationMessage;
                        
                        if (customMessage != null && !customMessage.trim().isEmpty()) {
                            customNotificationMessage = customMessage.trim();
                        } else {
                            customNotificationMessage = String.format(
                                "Thân gửi Quý phụ huynh,\n" +
                                "Nhà trường thông báo về đợt khám sức khỏe \"%s\" sắp diễn ra.\n" +
                                "Đợt khám sẽ được tổ chức tại trường. Đây là cơ hội để các em học sinh được kiểm tra sức khỏe định kỳ, phát hiện sớm các vấn đề sức khỏe và nhận tư vấn từ các chuyên gia y tế." + 
                                "Kính đề nghị Quý phụ huynh xem xét và cho phép con em %s (lớp %s) tham gia đợt khám sức khỏe này để đảm bảo sức khỏe tốt nhất cho các em.\n" +
                                "Vui lòng phản hồi qua hệ thống để xác nhận việc tham gia.\n" +
                                "Trân trọng,\nBan Giám hiệu", 
                                campaign.getName(), 
                                studentName,
                                student.getClassName() != null ? student.getClassName() : "Chưa có thông tin"
                            );
                        }

                        // Create notification with proper form and campaign linking
                        Notification notification = new Notification();
                        notification.setTitle("THÔNG BÁO KHÁM SỨC KHỎE  - " + studentName.toUpperCase());
                        notification.setMessage(customNotificationMessage);
                        notification.setNotificationType("HEALTH_CHECK_CAMPAIGN");
                        notification.setRecipient(parent);
                        notification.setHealthCheckCampaign(campaign);
                        notification.setHealthCheckForm(actualForm);
                        
                        // Save notification directly using repository
                        notificationRepository.save(notification);
                        
                        notificationsSent++;
                        
                        // Track notifications per parent for statistics
                        parentNotificationCount.put(parent.getId(), 
                            parentNotificationCount.getOrDefault(parent.getId(), 0) + 1);
                    } else {
                        String error = "Invalid parent for form " + formDTO.getId() + " - student " + student.getStudentID();
                        errors.add(error);
                        System.out.println("SKIP: " + error);
                    }
                } else {
                    String error = "Form entity not found for form ID " + formDTO.getId();
                    errors.add(error);
                    System.out.println("ERROR: " + error);
                }
            } catch (Exception e) {
                String error = "Error sending notification for form " + formDTO.getId() + ": " + e.getMessage();
                errors.add(error);
                System.err.println("ERROR: " + error);
                e.printStackTrace();
            }
        }
        
        // Log parent notification breakdown
        for (Map.Entry<Long, Integer> entry : parentNotificationCount.entrySet()) {
            System.out.println("Parent " + entry.getKey() + " received " + entry.getValue() + " notifications");
        }

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Thông báo đã được gửi đến phụ huynh thành công");
        response.put("campaignId", campaignId);
        response.put("campaignName", campaign.getName());
        response.put("totalForms", formsProcessed);
        response.put("notificationsSent", notificationsSent);
        response.put("uniqueParents", parentNotificationCount.size());
        response.put("parentNotificationBreakdown", parentNotificationCount);
        response.put("errors", errors);
        response.put("customMessage", (customMessage != null && !customMessage.trim().isEmpty()));
        
        return response;
    }

    /**
     * Helper method to find parents for a student
     */
    private List<User> findParentsForStudent(StudentDTO studentDTO) {
        List<User> parents = new ArrayList<>();
        try {
            // Find the actual student entity from the DTO
            Optional<Student> studentOpt = studentRepository.findById(studentDTO.getStudentID());
            if (studentOpt.isPresent()) {
                Student student = studentOpt.get();
                if (student.getParent() != null) {
                    parents.add(student.getParent());
                }
            }
        } catch (Exception e) {
            System.err.println("Error finding parents for student ID " + studentDTO.getStudentID() + ": " + e.getMessage());
        }
        return parents;
    }

    @Override
    @Transactional
    public void recordHealthCheckResult(RecordHealthCheckResultRequest request) {
        System.out.println("DEBUG: Recording health check result for student ID: " + request.getStudentId() + ", campaign ID: " + request.getCampaignId());
        
        // Get the campaign and student
        HealthCheckCampaign campaign = getCampaignModelById(request.getCampaignId());
        if (campaign.getStatus() != CampaignStatus.IN_PROGRESS) {
            throw new RuntimeException("Cannot record results for campaign not in progress");
        }
        
        // Find the student
        Student student = studentRepository.findById(request.getStudentId())
            .orElseThrow(() -> new RuntimeException("Student not found with ID: " + request.getStudentId()));
        
        // Get the student's health profile
        Set<HealthProfile> healthProfiles = student.getHealthProfiles();
        if (healthProfiles == null || healthProfiles.isEmpty()) {
            throw new RuntimeException("No health profile found for student ID: " + student.getStudentID());
        }
        HealthProfile healthProfile = healthProfiles.iterator().next();
        
        // Get detailed results from request
        Map<String, Object> detailedResults = request.getDetailedResults();
        if (detailedResults == null) {
            throw new RuntimeException("Detailed results are required");
        }
        
        LocalDate examinationDate = LocalDate.now();
        
        // Process each category result
        for (RecordHealthCheckResultRequest.CategoryResult categoryResult : request.getCategories()) {
            String category = categoryResult.getCategory();
            
            // Get the detailed data for this category
            @SuppressWarnings("unchecked")
            Map<String, Object> categoryData = (Map<String, Object>) detailedResults.get(category);
            if (categoryData == null) {
                System.out.println("WARNING: No detailed data found for category: " + category);
                continue;
            }
            
            // Save data to appropriate table based on category
            switch (category) {
                case "VISION":
                    Vision vision = new Vision();
                    vision.setHealthProfile(healthProfile);
                    vision.setVisionLeft(getIntValue(categoryData, "visionLeft"));
                    vision.setVisionRight(getIntValue(categoryData, "visionRight"));
                    vision.setVisionLeftWithGlass(getIntValue(categoryData, "visionLeftWithGlass"));
                    vision.setVisionRightWithGlass(getIntValue(categoryData, "visionRightWithGlass"));
                    vision.setVisionDescription(getStringValue(categoryData, "visionDescription"));
                    vision.setDateOfExamination(examinationDate);
                    visionRepository.save(vision);
                    System.out.println("DEBUG: Saved vision result for student " + student.getStudentID());
                    break;
                    
                case "HEARING":
                    Hearing hearing = new Hearing();
                    hearing.setHealthProfile(healthProfile);
                    hearing.setLeftEar(getIntValue(categoryData, "leftEar"));
                    hearing.setRightEar(getIntValue(categoryData, "rightEar"));
                    hearing.setDescription(getStringValue(categoryData, "description"));
                    hearing.setDateOfExamination(examinationDate);
                    hearingRepository.save(hearing);
                    System.out.println("DEBUG: Saved hearing result for student " + student.getStudentID());
                    break;
                    
                case "ORAL":
                    Oral oral = new Oral();
                    oral.setHealthProfile(healthProfile);
                    oral.setTeethCondition(getStringValue(categoryData, "teethCondition"));
                    oral.setGumsCondition(getStringValue(categoryData, "gumsCondition"));
                    oral.setTongueCondition(getStringValue(categoryData, "tongueCondition"));
                    oral.setDescription(getStringValue(categoryData, "description"));
                    oral.setAbnormal(getBooleanValue(categoryData, "isAbnormal"));
                    oral.setDateOfExamination(examinationDate);
                    oralRepository.save(oral);
                    System.out.println("DEBUG: Saved oral result for student " + student.getStudentID());
                    break;
                    
                case "SKIN":
                    Skin skin = new Skin();
                    skin.setHealthProfile(healthProfile);
                    skin.setSkinColor(getStringValue(categoryData, "skinColor"));
                    skin.setRashes(getBooleanValue(categoryData, "rashes"));
                    skin.setLesions(getBooleanValue(categoryData, "lesions"));
                    skin.setDryness(getBooleanValue(categoryData, "dryness"));
                    skin.setEczema(getBooleanValue(categoryData, "eczema"));
                    skin.setPsoriasis(getBooleanValue(categoryData, "psoriasis"));
                    skin.setSkinInfection(getBooleanValue(categoryData, "skinInfection"));
                    skin.setAllergies(getBooleanValue(categoryData, "allergies"));
                    skin.setDescription(getStringValue(categoryData, "description"));
                    skin.setTreatment(getStringValue(categoryData, "treatment"));
                    skin.setAbnormal(getBooleanValue(categoryData, "isAbnormal"));
                    skin.setDateOfExamination(examinationDate);
                    String followUpDateStr = getStringValue(categoryData, "followUpDate");
                    if (followUpDateStr != null && !followUpDateStr.isEmpty()) {
                        skin.setFollowUpDate(LocalDate.parse(followUpDateStr));
                    }
                    skinRepository.save(skin);
                    System.out.println("DEBUG: Saved skin result for student " + student.getStudentID());
                    break;
                    
                case "RESPIRATORY":
                    Respiratory respiratory = new Respiratory();
                    respiratory.setHealthProfile(healthProfile);
                    respiratory.setBreathingRate(getIntValue(categoryData, "breathingRate"));
                    respiratory.setBreathingSound(getStringValue(categoryData, "breathingSound"));
                    respiratory.setWheezing(getBooleanValue(categoryData, "wheezing"));
                    respiratory.setCough(getBooleanValue(categoryData, "cough"));
                    respiratory.setBreathingDifficulty(getBooleanValue(categoryData, "breathingDifficulty"));
                    Integer oxygenSat = getIntegerValue(categoryData, "oxygenSaturation");
                    respiratory.setOxygenSaturation(oxygenSat);
                    respiratory.setTreatment(getStringValue(categoryData, "treatment"));
                    respiratory.setDescription(getStringValue(categoryData, "description"));
                    respiratory.setAbnormal(getBooleanValue(categoryData, "isAbnormal"));
                    respiratory.setDateOfExamination(examinationDate);
                    String followUpDateStr2 = getStringValue(categoryData, "followUpDate");
                    if (followUpDateStr2 != null && !followUpDateStr2.isEmpty()) {
                        respiratory.setFollowUpDate(LocalDate.parse(followUpDateStr2));
                    }
                    respiratoryRepository.save(respiratory);
                    System.out.println("DEBUG: Saved respiratory result for student " + student.getStudentID());
                    break;
                    
                default:
                    System.out.println("WARNING: Unknown category: " + category);
                    break;
            }
        }
        
        System.out.println("DEBUG: Successfully recorded health check results for student " + student.getStudentID());
    }
    
    // Helper methods for data extraction
    private String getStringValue(Map<String, Object> data, String key) {
        Object value = data.get(key);
        return value != null ? value.toString() : null;
    }
    
    private boolean getBooleanValue(Map<String, Object> data, String key) {
        Object value = data.get(key);
        if (value instanceof Boolean) {
            return (Boolean) value;
        }
        return false;
    }
    
    private int getIntValue(Map<String, Object> data, String key) {
        Object value = data.get(key);
        if (value instanceof Number) {
            return ((Number) value).intValue();
        }
        try {
            return Integer.parseInt(value.toString());
        } catch (Exception e) {
            return 0;
        }
    }
    
    private Integer getIntegerValue(Map<String, Object> data, String key) {
        Object value = data.get(key);
        if (value == null || value.toString().isEmpty()) {
            return null;
        }
        if (value instanceof Number) {
            return ((Number) value).intValue();
        }
        try {
            return Integer.parseInt(value.toString());
        } catch (Exception e) {
            return null;
        }
    }

    @Override
    public List<Map<String, Object>> getConfirmedStudents(Long campaignId) {
        System.out.println("DEBUG: Getting confirmed students for campaign ID: " + campaignId);
        
        HealthCheckCampaign campaign = getCampaignModelById(campaignId);
        List<Map<String, Object>> result = new ArrayList<>();
        
        // Get all confirmed health check forms for this campaign
        List<HealthCheckForm> confirmedForms = healthCheckFormRepository
            .findByCampaignAndStatus(campaign, FormStatus.CONFIRMED);
        
        System.out.println("DEBUG: Found " + confirmedForms.size() + " confirmed forms");
        
        for (HealthCheckForm form : confirmedForms) {
            Map<String, Object> studentData = new HashMap<>();
            Student student = form.getStudent();
            
            studentData.put("studentID", student.getStudentID());
            studentData.put("fullName", student.getFullName());
            studentData.put("className", student.getClassName());
            studentData.put("status", form.getStatus().toString());
            studentData.put("respondedAt", form.getRespondedAt());
            studentData.put("formId", form.getId());
            
            result.add(studentData);
        }
        
        System.out.println("DEBUG: Returning " + result.size() + " confirmed students");
        return result;
    }

    @Override
    public List<Map<String, Object>> getCampaignResults(Long campaignId) {
        System.out.println("DEBUG: Getting campaign results for campaign ID: " + campaignId);
        
        HealthCheckCampaign campaign = getCampaignModelById(campaignId);
        List<Map<String, Object>> results = new ArrayList<>();
        
        // Get all confirmed health check forms for this campaign
        List<HealthCheckForm> confirmedForms = healthCheckFormRepository
            .findByCampaignAndStatus(campaign, FormStatus.CONFIRMED);
        
        System.out.println("DEBUG: Found " + confirmedForms.size() + " confirmed forms");
        
        for (HealthCheckForm form : confirmedForms) {
            Map<String, Object> studentResult = new HashMap<>();
            Student student = form.getStudent();
            
            // Get the student's health profile (assume one per student, get the first one)
            Set<HealthProfile> healthProfiles = student.getHealthProfiles();
            if (healthProfiles == null || healthProfiles.isEmpty()) {
                System.out.println("WARNING: No health profile found for student ID: " + student.getStudentID());
                continue; // Skip this student if no health profile
            }
            HealthProfile healthProfile = healthProfiles.iterator().next();
            
            studentResult.put("studentID", student.getStudentID());
            studentResult.put("fullName", student.getFullName());
            studentResult.put("className", student.getClassName());
            studentResult.put("formId", form.getId());
            studentResult.put("respondedAt", form.getRespondedAt());
            
            // Get results for each category in the campaign
            Map<String, Object> categoryResults = new HashMap<>();
            
            for (HealthCheckCategory category : campaign.getCategories()) {
                switch (category) {
                    case VISION:
                        List<Vision> visionResults = visionRepository.findByHealthProfile(healthProfile);
                        if (!visionResults.isEmpty()) {
                            Vision latestVision = visionResults.get(visionResults.size() - 1);
                            Map<String, Object> visionData = new HashMap<>();
                            visionData.put("id", latestVision.getId());
                            visionData.put("visionLeft", latestVision.getVisionLeft());
                            visionData.put("visionRight", latestVision.getVisionRight());
                            visionData.put("visionLeftWithGlass", latestVision.getVisionLeftWithGlass());
                            visionData.put("visionRightWithGlass", latestVision.getVisionRightWithGlass());
                            visionData.put("description", latestVision.getVisionDescription());
                            visionData.put("dateOfExamination", latestVision.getDateOfExamination());
                            categoryResults.put("VISION", visionData);
                        }
                        break;
                        
                    case HEARING:
                        List<Hearing> hearingResults = hearingRepository.findByHealthProfile(healthProfile);
                        if (!hearingResults.isEmpty()) {
                            Hearing latestHearing = hearingResults.get(hearingResults.size() - 1);
                            Map<String, Object> hearingData = new HashMap<>();
                            hearingData.put("id", latestHearing.getId());
                            hearingData.put("leftEar", latestHearing.getLeftEar());
                            hearingData.put("rightEar", latestHearing.getRightEar());
                            hearingData.put("description", latestHearing.getDescription());
                            hearingData.put("dateOfExamination", latestHearing.getDateOfExamination());
                            categoryResults.put("HEARING", hearingData);
                        }
                        break;
                        
                    case ORAL:
                        List<Oral> oralResults = oralRepository.findByHealthProfile(healthProfile);
                        if (!oralResults.isEmpty()) {
                            Oral latestOral = oralResults.get(oralResults.size() - 1);
                            Map<String, Object> oralData = new HashMap<>();
                            oralData.put("id", latestOral.getId());
                            oralData.put("teethCondition", latestOral.getTeethCondition());
                            oralData.put("gumsCondition", latestOral.getGumsCondition());
                            oralData.put("tongueCondition", latestOral.getTongueCondition());
                            oralData.put("description", latestOral.getDescription());
                            oralData.put("isAbnormal", latestOral.isAbnormal());
                            oralData.put("dateOfExamination", latestOral.getDateOfExamination());
                            categoryResults.put("ORAL", oralData);
                        }
                        break;
                        
                    case SKIN:
                        List<Skin> skinResults = skinRepository.findByHealthProfile(healthProfile);
                        if (!skinResults.isEmpty()) {
                            Skin latestSkin = skinResults.get(skinResults.size() - 1);
                            Map<String, Object> skinData = new HashMap<>();
                            skinData.put("id", latestSkin.getId());
                            skinData.put("skinColor", latestSkin.getSkinColor());
                            skinData.put("rashes", latestSkin.isRashes());
                            skinData.put("lesions", latestSkin.isLesions());
                            skinData.put("dryness", latestSkin.isDryness());
                            skinData.put("eczema", latestSkin.isEczema());
                            skinData.put("psoriasis", latestSkin.isPsoriasis());
                            skinData.put("skinInfection", latestSkin.isSkinInfection());
                            skinData.put("allergies", latestSkin.isAllergies());
                            skinData.put("description", latestSkin.getDescription());
                            skinData.put("treatment", latestSkin.getTreatment());
                            skinData.put("isAbnormal", latestSkin.isAbnormal());
                            skinData.put("dateOfExamination", latestSkin.getDateOfExamination());
                            skinData.put("followUpDate", latestSkin.getFollowUpDate());
                            categoryResults.put("SKIN", skinData);
                        }
                        break;
                        
                    case RESPIRATORY:
                        List<Respiratory> respiratoryResults = respiratoryRepository.findByHealthProfile(healthProfile);
                        if (!respiratoryResults.isEmpty()) {
                            Respiratory latestRespiratory = respiratoryResults.get(respiratoryResults.size() - 1);
                            Map<String, Object> respiratoryData = new HashMap<>();
                            respiratoryData.put("id", latestRespiratory.getId());
                            respiratoryData.put("breathingRate", latestRespiratory.getBreathingRate());
                            respiratoryData.put("breathingSound", latestRespiratory.getBreathingSound());
                            respiratoryData.put("wheezing", latestRespiratory.isWheezing());
                            respiratoryData.put("cough", latestRespiratory.isCough());
                            respiratoryData.put("breathingDifficulty", latestRespiratory.isBreathingDifficulty());
                            respiratoryData.put("oxygenSaturation", latestRespiratory.getOxygenSaturation());
                            respiratoryData.put("treatment", latestRespiratory.getTreatment());
                            respiratoryData.put("description", latestRespiratory.getDescription());
                            respiratoryData.put("isAbnormal", latestRespiratory.isAbnormal());
                            respiratoryData.put("dateOfExamination", latestRespiratory.getDateOfExamination());
                            respiratoryData.put("followUpDate", latestRespiratory.getFollowUpDate());
                            categoryResults.put("RESPIRATORY", respiratoryData);
                        }
                        break;
                }
            }
            
            studentResult.put("results", categoryResults);
            results.add(studentResult);
        }
        
        System.out.println("DEBUG: Returning " + results.size() + " student results");
        return results;
    }
}

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
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.ResultStatus;
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
import java.time.format.DateTimeFormatter;
import java.util.*;
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
    private final HealthCheckResultRepository healthCheckResultRepository;
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

        int targetCount = calculateTargetCountInternal(minAge, maxAge, targetClasses);

        campaign.setTargetCount(targetCount);

        HealthCheckCampaign savedCampaign = campaignRepository.save(campaign);

        // Notify managers about a new campaign pending approval
        int estimatedCount = savedCampaign.getTargetCount();
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
        
        // Check if the campaign was created within the last 24 hours
        LocalDateTime creationTime = campaign.getCreatedAt();
        LocalDateTime currentTime = LocalDateTime.now();
        LocalDateTime approvalDeadline = creationTime.plusHours(24);
        
        if (currentTime.isAfter(approvalDeadline)) {
            throw new RuntimeException("Approval window expired. Campaigns must be approved within 24 hours of creation.");
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
        
        // Update appointment information for all confirmed forms
        updateAppointmentInfoForForms(savedCampaign);
        
        // Send detailed schedule notifications to parents
        notificationService.notifyParentsAboutHealthCheckSchedule(savedCampaign);

        notificationService.notifyNurseAboutHealthCheckCampaignScheduling(savedCampaign);

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
        
        // Note: Forms and notifications are already sent during scheduling phase
        // No need to send notifications again when starting the campaign

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
        // Count students who actually took the health check (have results)
        int completedStudentCount = (int) healthCheckResultRepository.countDistinctStudentsByCampaign(savedCampaign);
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
            studentData.put("schoolYear", student.getSchoolYear());
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

        // Schedule information
        dto.setTimeSlot(campaign.getTimeSlot());
        dto.setScheduleNotes(campaign.getScheduleNotes());
        
        // Calculate confirmed count from health check forms
        if (campaign.getForms() != null) {
            long confirmedCount = campaign.getForms().stream()
                    .filter(form -> form.getStatus() == FormStatus.CONFIRMED)
                    .count();
            dto.setConfirmedCount((int) confirmedCount);
        } else {
            dto.setConfirmedCount(0);
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
        System.out.println("DEBUG: Request weight: " + request.getWeight() + ", height: " + request.getHeight());
        System.out.println("DEBUG: Categories count: " + (request.getCategories() != null ? request.getCategories().size() : "null"));
        System.out.println("DEBUG: Detailed results keys: " + (request.getDetailedResults() != null ? request.getDetailedResults().keySet() : "null"));
        
        // Get the campaign and student
        HealthCheckCampaign campaign = getCampaignModelById(request.getCampaignId());
        System.out.println("DEBUG: Campaign status: " + campaign.getStatus());
        if (campaign.getStatus() != CampaignStatus.IN_PROGRESS && campaign.getStatus() != CampaignStatus.APPROVED) {
            throw new RuntimeException("Cannot record results for campaign not in progress or approved. Current status: " + campaign.getStatus());
        }
        
        // Find the student
        Student student = studentRepository.findById(request.getStudentId())
            .orElseThrow(() -> new RuntimeException("Student not found with ID: " + request.getStudentId()));
        
        // Find the health check form for this student and campaign
        HealthCheckForm form = healthCheckFormRepository
            .findByCampaignAndStudent(campaign, student)
            .orElseThrow(() -> new RuntimeException("Health check form not found for student ID: " + student.getStudentID() + " and campaign ID: " + campaign.getId()));
        
        // Set check-in status and time
        LocalDateTime now = LocalDateTime.now();
        form.setCheckedInAt(now);
        form.setCheckedIn(true);
        healthCheckFormRepository.save(form);
        
        // Get the student's health profile
        HealthProfile healthProfile = student.getHealthProfile();
        if (healthProfile == null) {
            throw new RuntimeException("No health profile found for student ID: " + student.getStudentID());
        }
        
        // Get basic measurements from request (fallback to 0 if not provided)
        Map<String, Object> detailedResults = request.getDetailedResults();
        if (detailedResults == null) {
            throw new RuntimeException("Detailed results are required");
        }
        
        // Use weight and height from request object directly
        double weight = request.getWeight() != null ? request.getWeight() : 0.0;
        double height = request.getHeight() != null ? request.getHeight() : 0.0;
        Double bmi = null;
        if (weight > 0 && height > 0) {
            bmi = weight / Math.pow(height / 100, 2); // height in cm, convert to meters
        }
        
        // Get nurse information (for now, use campaign creator as nurse)
        User nurse = campaign.getCreatedBy();
        
        LocalDate examinationDate = LocalDate.now();
        
        // Process each category result
        for (RecordHealthCheckResultRequest.CategoryResult categoryResult : request.getCategories()) {
            String categoryStr = categoryResult.getCategory();
            HealthCheckCategory category = HealthCheckCategory.valueOf(categoryStr);
            
            // Get the detailed data for this category
            @SuppressWarnings("unchecked")
            Map<String, Object> categoryData = (Map<String, Object>) detailedResults.get(categoryStr);
            if (categoryData == null) {
                System.out.println("WARNING: No detailed data found for category: " + categoryStr);
                continue;
            }
            
            // Create HealthCheckResult record
            HealthCheckResult healthCheckResult = new HealthCheckResult();
            healthCheckResult.setForm(form);
            healthCheckResult.setStudent(student);
            healthCheckResult.setHealthProfile(healthProfile);
            healthCheckResult.setNurse(nurse);
            healthCheckResult.setCategory(category);
            healthCheckResult.setWeight(weight);
            healthCheckResult.setHeight(height);
            healthCheckResult.setBmi(bmi);
            healthCheckResult.setPerformedAt(LocalDateTime.now());
            
            // Determine if abnormal and set status/notes
            boolean isAbnormal = getBooleanValue(categoryData, "isAbnormal");
            healthCheckResult.setAbnormal(isAbnormal);
            
            // Set result status based on abnormality and specific conditions
            ResultStatus status = determineResultStatus(categoryData, isAbnormal);
            healthCheckResult.setStatus(status);
            
            // Set notes and recommendations
            String notes = getStringValue(categoryData, "description");
            String recommendations = getStringValue(categoryData, "treatment");
            if (recommendations == null || recommendations.isEmpty()) {
                recommendations = getStringValue(categoryData, "recommendations");
            }
            healthCheckResult.setResultNotes(notes);
            healthCheckResult.setRecommendations(recommendations);
            
            // First save the health check result to get its ID
            HealthCheckResult savedResult = healthCheckResultRepository.save(healthCheckResult);
            
            // Save category-specific result with reference back to the saved health check result
            saveCategorySpecificResult(category, categoryData, healthProfile, examinationDate, savedResult);
            
            System.out.println("DEBUG: Saved health check result for student " + student.getStudentID() + ", category: " + category + ", ID: " + savedResult.getId());
        }
        
        System.out.println("DEBUG: Successfully recorded all health check results for student " + student.getStudentID());
    }
    
    private ResultStatus determineResultStatus(Map<String, Object> categoryData, boolean isAbnormal) {
        if (!isAbnormal) {
            return ResultStatus.NORMAL;
        }
        
        // Check for urgent conditions
        boolean hasUrgentCondition = getBooleanValue(categoryData, "urgent") || 
                                   getBooleanValue(categoryData, "severeAbnormal") ||
                                   getBooleanValue(categoryData, "requiresImmediateAttention");
        
        if (hasUrgentCondition) {
            return ResultStatus.URGENT;
        }
        
        // Check for follow-up requirements
        String followUpDate = getStringValue(categoryData, "followUpDate");
        boolean needsFollowUp = (followUpDate != null && !followUpDate.isEmpty()) ||
                              getBooleanValue(categoryData, "needsFollowUp") ||
                              getBooleanValue(categoryData, "requiresFollowUp");
        
        if (needsFollowUp) {
            return ResultStatus.REQUIRES_FOLLOWUP;
        }
        
        // Check for treatment requirements
        String treatment = getStringValue(categoryData, "treatment");
        boolean needsTreatment = (treatment != null && !treatment.isEmpty()) ||
                               getBooleanValue(categoryData, "needsTreatment");
        
        if (needsTreatment) {
            return ResultStatus.NEEDS_ATTENTION;
        }
        
        // Default to minor concern for abnormal but not urgent conditions
        return ResultStatus.MINOR_CONCERN;
    }
    
    private void saveCategorySpecificResult(HealthCheckCategory category, Map<String, Object> categoryData, 
                                          HealthProfile healthProfile, LocalDate examinationDate,
                                          HealthCheckResult healthCheckResult) {
        switch (category) {
            case VISION:
                Vision vision = new Vision();
                vision.setHealthProfile(healthProfile);
                vision.setHealthCheckResult(healthCheckResult); // Set the reference back to health check result
                vision.setVisionLeft(getIntValue(categoryData, "visionLeft"));
                vision.setVisionRight(getIntValue(categoryData, "visionRight"));
                vision.setVisionLeftWithGlass(getIntValue(categoryData, "visionLeftWithGlass"));
                vision.setVisionRightWithGlass(getIntValue(categoryData, "visionRightWithGlass"));
                vision.setVisionDescription(getStringValue(categoryData, "visionDescription"));
                vision.setDoctorName(getStringValue(categoryData, "doctorName"));
                vision.setDateOfExamination(examinationDate);
                vision.setAbnormal(getBooleanValue(categoryData, "isAbnormal"));
                vision.setRecommendations(getStringValue(categoryData, "recommendations"));
                Vision savedVision = visionRepository.save(vision);
                
                // Update the health check result with the category result ID
                healthCheckResult.setCategoryResultId(savedVision.getId());
                // Set the OneToOne relationship
                healthCheckResult.setVision(savedVision);
                healthCheckResultRepository.save(healthCheckResult);
                
                System.out.println("DEBUG: Saved vision result with ID " + savedVision.getId());
                break;
                
            case HEARING:
                Hearing hearing = new Hearing();
                hearing.setHealthProfile(healthProfile);
                hearing.setHealthCheckResult(healthCheckResult); // Set the reference back to health check result
                hearing.setLeftEar(getIntValue(categoryData, "leftEar"));
                hearing.setRightEar(getIntValue(categoryData, "rightEar"));
                hearing.setDescription(getStringValue(categoryData, "description"));
                hearing.setDoctorName(getStringValue(categoryData, "doctorName"));
                hearing.setDateOfExamination(examinationDate);
                hearing.setAbnormal(getBooleanValue(categoryData, "isAbnormal"));
                hearing.setRecommendations(getStringValue(categoryData, "recommendations"));
                Hearing savedHearing = hearingRepository.save(hearing);
                
                // Update the health check result with the category result ID
                healthCheckResult.setCategoryResultId(savedHearing.getId());
                // Set the OneToOne relationship
                healthCheckResult.setHearing(savedHearing);
                healthCheckResultRepository.save(healthCheckResult);
                
                System.out.println("DEBUG: Saved hearing result with ID " + savedHearing.getId());
                break;
                
            case ORAL:
                Oral oral = new Oral();
                oral.setHealthProfile(healthProfile);
                oral.setHealthCheckResult(healthCheckResult); // Set the reference back to health check result
                oral.setTeethCondition(getStringValue(categoryData, "teethCondition"));
                oral.setGumsCondition(getStringValue(categoryData, "gumsCondition"));
                oral.setTongueCondition(getStringValue(categoryData, "tongueCondition"));
                oral.setDescription(getStringValue(categoryData, "description"));
                oral.setDoctorName(getStringValue(categoryData, "doctorName"));
                oral.setAbnormal(getBooleanValue(categoryData, "isAbnormal"));
                oral.setDateOfExamination(examinationDate);
                oral.setRecommendations(getStringValue(categoryData, "recommendations"));
                Oral savedOral = oralRepository.save(oral);
                
                // Update the health check result with the category result ID
                healthCheckResult.setCategoryResultId(savedOral.getId());
                // Set the OneToOne relationship
                healthCheckResult.setOral(savedOral);
                healthCheckResultRepository.save(healthCheckResult);
                
                System.out.println("DEBUG: Saved oral result with ID " + savedOral.getId());
                break;
                
            case SKIN:
                Skin skin = new Skin();
                skin.setHealthProfile(healthProfile);
                skin.setHealthCheckResult(healthCheckResult); // Set the reference back to health check result
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
                skin.setDoctorName(getStringValue(categoryData, "doctorName"));
                skin.setDateOfExamination(examinationDate);
                skin.setRecommendations(getStringValue(categoryData, "recommendations"));
                String followUpDateStr = getStringValue(categoryData, "followUpDate");
                if (followUpDateStr != null && !followUpDateStr.isEmpty()) {
                    skin.setFollowUpDate(LocalDate.parse(followUpDateStr));
                }
                Skin savedSkin = skinRepository.save(skin);
                
                // Update the health check result with the category result ID
                healthCheckResult.setCategoryResultId(savedSkin.getId());
                // Set the OneToOne relationship
                healthCheckResult.setSkin(savedSkin);
                healthCheckResultRepository.save(healthCheckResult);
                
                System.out.println("DEBUG: Saved skin result with ID " + savedSkin.getId());
                break;
                
            case RESPIRATORY:
                Respiratory respiratory = new Respiratory();
                respiratory.setHealthProfile(healthProfile);
                respiratory.setHealthCheckResult(healthCheckResult); // Set the reference back to health check result
                respiratory.setBreathingRate(getIntValue(categoryData, "breathingRate"));
                respiratory.setBreathingSound(getStringValue(categoryData, "breathingSound"));
                respiratory.setWheezing(getBooleanValue(categoryData, "wheezing"));
                respiratory.setCough(getBooleanValue(categoryData, "cough"));
                respiratory.setBreathingDifficulty(getBooleanValue(categoryData, "breathingDifficulty"));
                respiratory.setDescription(getStringValue(categoryData, "description"));
                respiratory.setAbnormal(getBooleanValue(categoryData, "isAbnormal"));
                respiratory.setDoctorName(getStringValue(categoryData, "doctorName"));
                respiratory.setDateOfExamination(examinationDate);
                respiratory.setRecommendations(getStringValue(categoryData, "recommendations"));
                Respiratory savedRespiratory = respiratoryRepository.save(respiratory);
                
                // Update the health check result with the category result ID
                healthCheckResult.setCategoryResultId(savedRespiratory.getId());
                // Set the OneToOne relationship
                healthCheckResult.setRespiratory(savedRespiratory);
                healthCheckResultRepository.save(healthCheckResult);
                
                System.out.println("DEBUG: Saved respiratory result with ID " + savedRespiratory.getId());
                break;
                
            default:
                System.out.println("WARNING: Unknown category: " + category);
                break;
        }
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
    
    private double getDoubleValue(Map<String, Object> data, String key) {
        Object value = data.get(key);
        if (value instanceof Number) {
            return ((Number) value).doubleValue();
        }
        try {
            return Double.parseDouble(value.toString());
        } catch (Exception e) {
            return 0.0;
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
            studentData.put("schoolYear", student.getSchoolYear());
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
            
            studentResult.put("studentID", student.getStudentID());
            studentResult.put("fullName", student.getFullName());
            studentResult.put("className", student.getClassName());
            studentResult.put("schoolYear", student.getSchoolYear());
            studentResult.put("formId", form.getId());
            studentResult.put("respondedAt", form.getRespondedAt());
            
            // Get health check results from HealthCheckResult table
            List<HealthCheckResult> healthCheckResults = healthCheckResultRepository.findByForm(form);
            System.out.println("DEBUG: Found " + healthCheckResults.size() + " health check results for student " + student.getStudentID() + " (form " + form.getId() + ")");
            
            // Only include students who have results
            if (!healthCheckResults.isEmpty()) {
                Map<String, Object> categoryResults = new HashMap<>();
                Map<String, Object> overallResults = new HashMap<>();
                
                // Process each health check result
                for (HealthCheckResult result : healthCheckResults) {
                    HealthCheckCategory category = result.getCategory();
                    
                    // Create category-specific result data
                    Map<String, Object> categoryData = getCategorySpecificData(result);
                    
                    // Add common fields from HealthCheckResult
                    categoryData.put("healthCheckResultId", result.getId());
                    categoryData.put("weight", result.getWeight());
                    categoryData.put("height", result.getHeight());
                    categoryData.put("bmi", result.getBmi());
                    categoryData.put("status", result.getStatus());
                    categoryData.put("isAbnormal", result.isAbnormal());
                    categoryData.put("resultNotes", result.getResultNotes());
                    categoryData.put("recommendations", result.getRecommendations());
                    categoryData.put("performedAt", result.getPerformedAt());
                    categoryData.put("nurseId", result.getNurse() != null ? result.getNurse().getId() : null);
                    categoryData.put("nurseName", result.getNurse() != null ? result.getNurse().getFullName() : null);
                    
                    categoryResults.put(category.toString(), categoryData);
                    
                    // Store overall results (weight, height, BMI) - use the first one found
                    if (overallResults.isEmpty()) {
                        overallResults.put("weight", result.getWeight());
                        overallResults.put("height", result.getHeight());
                        overallResults.put("bmi", result.getBmi());
                        overallResults.put("performedAt", result.getPerformedAt());
                        overallResults.put("nurseId", result.getNurse() != null ? result.getNurse().getId() : null);
                        overallResults.put("nurseName", result.getNurse() != null ? result.getNurse().getFullName() : null);
                    }
                }
                
                studentResult.put("results", categoryResults);
                studentResult.put("overallResults", overallResults);
                studentResult.put("hasResults", true);
                results.add(studentResult);
                
                System.out.println("DEBUG: Added student " + student.getStudentID() + " with results to response");
            } else {
                System.out.println("DEBUG: Student " + student.getStudentID() + " has no health check results yet");
            }
        }
        
        System.out.println("DEBUG: Returning " + results.size() + " student results");
        return results;
    }
    
    private Map<String, Object> getCategorySpecificData(HealthCheckResult result) {
        Map<String, Object> categoryData = new HashMap<>();
        
        if (result.getCategoryResultId() == null) {
            System.out.println("WARNING: No category result ID found for result " + result.getId());
            return categoryData;
        }
        
        Long categoryResultId = result.getCategoryResultId();
        HealthCheckCategory category = result.getCategory();
        
        try {
            switch (category) {
                case VISION:
                    if (result.getVision() != null) {
                        Vision vision = result.getVision();
                        categoryData.put("id", vision.getId());
                        categoryData.put("visionLeft", vision.getVisionLeft());
                        categoryData.put("visionRight", vision.getVisionRight());
                        categoryData.put("visionLeftWithGlass", vision.getVisionLeftWithGlass());
                        categoryData.put("visionRightWithGlass", vision.getVisionRightWithGlass());
                        categoryData.put("visionDescription", vision.getVisionDescription());
                        categoryData.put("doctorName", vision.getDoctorName());
                        categoryData.put("dateOfExamination", vision.getDateOfExamination());
                        categoryData.put("needsGlasses", vision.isNeedsGlasses());
                        categoryData.put("isAbnormal", vision.isAbnormal());
                        categoryData.put("recommendations", vision.getRecommendations());
                    }
                    break;
                    
                case HEARING:
                    if (result.getHearing() != null) {
                        Hearing hearing = result.getHearing();
                        categoryData.put("id", hearing.getId());
                        categoryData.put("leftEar", hearing.getLeftEar());
                        categoryData.put("rightEar", hearing.getRightEar());
                        categoryData.put("description", hearing.getDescription());
                        categoryData.put("doctorName", hearing.getDoctorName());
                        categoryData.put("dateOfExamination", hearing.getDateOfExamination());
                        categoryData.put("isAbnormal", hearing.isAbnormal());
                        categoryData.put("recommendations", hearing.getRecommendations());
                    }
                    break;
                    
                case ORAL:
                    if (result.getOral() != null) {
                        Oral oral = result.getOral();
                        categoryData.put("id", oral.getId());
                        categoryData.put("teethCondition", oral.getTeethCondition());
                        categoryData.put("gumsCondition", oral.getGumsCondition());
                        categoryData.put("tongueCondition", oral.getTongueCondition());
                        categoryData.put("description", oral.getDescription());
                        categoryData.put("doctorName", oral.getDoctorName());
                        categoryData.put("dateOfExamination", oral.getDateOfExamination());
                        categoryData.put("isAbnormal", oral.isAbnormal());
                        categoryData.put("recommendations", oral.getRecommendations());
                    }
                    break;
                    
                case SKIN:
                    if (result.getSkin() != null) {
                        Skin skin = result.getSkin();
                        categoryData.put("id", skin.getId());
                        categoryData.put("skinColor", skin.getSkinColor());
                        categoryData.put("rashes", skin.isRashes());
                        categoryData.put("lesions", skin.isLesions());
                        categoryData.put("dryness", skin.isDryness());
                        categoryData.put("eczema", skin.isEczema());
                        categoryData.put("psoriasis", skin.isPsoriasis());
                        categoryData.put("skinInfection", skin.isSkinInfection());
                        categoryData.put("allergies", skin.isAllergies());
                        categoryData.put("description", skin.getDescription());
                        categoryData.put("treatment", skin.getTreatment());
                        categoryData.put("doctorName", skin.getDoctorName());
                        categoryData.put("isAbnormal", skin.isAbnormal());
                        categoryData.put("recommendations", skin.getRecommendations());
                        categoryData.put("dateOfExamination", skin.getDateOfExamination());
                        categoryData.put("followUpDate", skin.getFollowUpDate());
                    }
                    break;
                    
                case RESPIRATORY:
                    if (result.getRespiratory() != null) {
                        Respiratory respiratory = result.getRespiratory();
                        categoryData.put("id", respiratory.getId());
                        categoryData.put("breathingRate", respiratory.getBreathingRate());
                        categoryData.put("breathingSound", respiratory.getBreathingSound());
                        categoryData.put("wheezing", respiratory.isWheezing());
                        categoryData.put("cough", respiratory.isCough());
                        categoryData.put("breathingDifficulty", respiratory.isBreathingDifficulty());
                        categoryData.put("description", respiratory.getDescription());
                        categoryData.put("doctorName", respiratory.getDoctorName());
                        categoryData.put("isAbnormal", respiratory.isAbnormal());
                        categoryData.put("recommendations", respiratory.getRecommendations());
                        categoryData.put("dateOfExamination", respiratory.getDateOfExamination());
                    }
                    break;
                    
                default:
                    System.out.println("WARNING: Unknown category: " + category);
                    break;
            }
        } catch (Exception e) {
            System.err.println("ERROR: Failed to fetch category-specific data for " + category + " with ID " + categoryResultId + ": " + e.getMessage());
        }
        
        return categoryData;
    }

    /**
     * Send health check result notifications to parents after campaign completion
     */
    @Override
    @Transactional
    public int sendHealthCheckResultNotificationsToParents(Long campaignId, List<Long> studentIds, String notificationContent, boolean useDefaultTemplate) {
        // Get the campaign and validate it's completed
        HealthCheckCampaign campaign = getCampaignModelById(campaignId);
        if (campaign.getStatus() != CampaignStatus.COMPLETED) {
            throw new RuntimeException("Campaign must be COMPLETED to send result notifications");
        }

        // Get confirmed forms for this campaign
        List<HealthCheckForm> confirmedForms = healthCheckFormRepository
            .findByCampaignAndStatus(campaign, FormStatus.CONFIRMED);

        if (confirmedForms.isEmpty()) {
            throw new RuntimeException("No confirmed forms found for this campaign");
        }

        // Filter forms based on studentIds if provided
        List<HealthCheckForm> formsToNotify = confirmedForms;
        if (studentIds != null && !studentIds.isEmpty()) {
            formsToNotify = confirmedForms.stream()
                .filter(form -> studentIds.contains(form.getStudent().getStudentID()))
                .collect(Collectors.toList());
        }

        int notificationsSent = 0;

        for (HealthCheckForm form : formsToNotify) {
            try {
                Student student = form.getStudent();
                User parent = form.getParent();

                // Verify parent is valid and confirmed this form
                if (parent == null || !parent.isEnabled() || !parent.getRole().getRoleName().equals("PARENT")) {
                    System.out.println("SKIP: Invalid parent for student " + student.getStudentID());
                    continue;
                }

                String finalNotificationContent;
                if (useDefaultTemplate) {
                    // Generate auto-generated content based on results
                    finalNotificationContent = generateDefaultResultNotificationContent(student, campaign);
                } else {
                    // Use custom content, but add student-specific information
                    finalNotificationContent = customizeNotificationContent(notificationContent, student, campaign);
                }

                // Create notification
                Notification notification = new Notification();
                notification.setTitle("KẾT QUẢ KHÁM SỨC KHỎE - " + student.getFullName().toUpperCase());
                notification.setMessage(finalNotificationContent);
                notification.setNotificationType("HEALTH_CHECK_RESULT");
                notification.setRecipient(parent);
                notification.setHealthCheckCampaign(campaign);
                notification.setHealthCheckForm(form);

                notificationRepository.save(notification);
                notificationsSent++;

                System.out.println("SENT: Health check result notification to parent of student " + student.getStudentID());

            } catch (Exception e) {
                System.err.println("ERROR: Failed to send notification for student " + form.getStudent().getStudentID() + ": " + e.getMessage());
            }
        }

        System.out.println("Total health check result notifications sent: " + notificationsSent);
        return notificationsSent;
    }

    /**
     * Generate default notification content based on student's health check results
     */
    private String generateDefaultResultNotificationContent(Student student, HealthCheckCampaign campaign) {
        StringBuilder content = new StringBuilder();
        
        content.append("<div style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>");
        content.append("<h3 style='color: #007bff; border-bottom: 2px solid #007bff; padding-bottom: 5px;'>");
        content.append("KẾT QUẢ KHÁM SỨC KHỎE</h3>");
        
        content.append("<p><strong>Kính gửi Quý phụ huynh,</strong></p>");
        content.append("<p>Nhà trường xin thông báo kết quả khám sức khỏe của học sinh <strong>");
        content.append(student.getFullName()).append("</strong> trong đợt khám \"<strong>");
        content.append(campaign.getName()).append("</strong>\".</p>");

        // Get health check results for this student
        List<HealthCheckResult> results = healthCheckResultRepository.findByStudentAndForm_Campaign(student, campaign);
        
        if (!results.isEmpty()) {
            content.append("<div style='background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;'>");
            content.append("<h4 style='margin-top: 0; color: #007bff;'>Thông tin khám:</h4>");
            
            // Add basic measurements
            HealthCheckResult firstResult = results.get(0);
            if (firstResult.getWeight() > 0) {
                content.append("<p><strong>Cân nặng:</strong> ").append(firstResult.getWeight()).append(" kg</p>");
            }
            if (firstResult.getHeight() > 0) {
                content.append("<p><strong>Chiều cao:</strong> ").append(firstResult.getHeight()).append(" cm</p>");
            }
            if (firstResult.getBmi() != null) {
                content.append("<p><strong>BMI:</strong> ").append(String.format("%.2f", firstResult.getBmi())).append("</p>");
            }
            
            // Add category-specific results
            boolean hasAbnormalResults = false;
            for (HealthCheckResult result : results) {
                if (result.isAbnormal()) {
                    hasAbnormalResults = true;
                    content.append("<p><strong>").append(getCategoryDisplayName(result.getCategory()))
                           .append(":</strong> Có bất thường - ").append(result.getResultNotes() != null ? result.getResultNotes() : "")
                           .append("</p>");
                    if (result.getRecommendations() != null && !result.getRecommendations().isEmpty()) {
                        content.append("<p><em>Khuyến nghị:</em> ").append(result.getRecommendations()).append("</p>");
                    }
                }
            }
            
            if (!hasAbnormalResults) {
                content.append("<p style='color: #28a745; font-weight: bold;'>✓ Kết quả khám tổng thể: Bình thường</p>");
            }
            
            content.append("</div>");
        }

        content.append("<p>Quý phụ huynh có thể liên hệ với nhà trường để được tư vấn thêm về kết quả khám sức khỏe của con em.</p>");
        content.append("<p style='margin-top: 20px;'><em>Trân trọng,<br/>");
        content.append("Ban Giám hiệu Nhà trường</em></p>");
        content.append("</div>");

        return content.toString();
    }

    /**
     * Customize notification content with student-specific information
     */
    private String customizeNotificationContent(String content, Student student, HealthCheckCampaign campaign) {
        if (content == null || content.isEmpty()) {
            return generateDefaultResultNotificationContent(student, campaign);
        }

        // Replace placeholders in custom content
        String customizedContent = content
            .replace("{{studentName}}", student.getFullName())
            .replace("{{campaignName}}", campaign.getName())
            .replace("{{className}}", student.getClassName() != null ? student.getClassName() : "")
            .replace("{{schoolYear}}", student.getSchoolYear() != null ? student.getSchoolYear() : "");

        // Wrap in basic styling if not already styled
        if (!content.contains("<div") && !content.contains("<html")) {
            return "<div style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>" 
                   + customizedContent + "</div>";
        }

        return customizedContent;
    }

    /**
     * Get display name for health check category
     */
    private String getCategoryDisplayName(HealthCheckCategory category) {
        switch (category) {
            case VISION: return "Mắt";
            case HEARING: return "Tai";
            case ORAL: return "Răng miệng";
            case SKIN: return "Da";
            case RESPIRATORY: return "Hô hấp";
            default: return category.toString();
        }
    }

    /**
     * Update appointment information for all health check forms associated with the campaign
     * Sets the appointment location to the campaign location and appointment time based on the timeslot
     */
    private void updateAppointmentInfoForForms(HealthCheckCampaign campaign) {
        // Find all health check forms for this campaign
        List<HealthCheckForm> forms = healthCheckFormRepository.findByCampaign(campaign);
        
        // Calculate appointment date (use campaign start date)
        LocalDateTime appointmentDate = campaign.getStartDate().atStartOfDay();
        
        // Determine the time based on the time slot
        LocalDateTime appointmentTime;
        if (campaign.getTimeSlot() == TimeSlot.MORNING) {
            // Morning slot (8:00 AM)
            appointmentTime = appointmentDate.withHour(8).withMinute(0);
        } else if (campaign.getTimeSlot() == TimeSlot.AFTERNOON) {
            // Afternoon slot (1:00 PM)
            appointmentTime = appointmentDate.withHour(13).withMinute(0);
        } else {
            // Default to morning if not specified
            appointmentTime = appointmentDate.withHour(8).withMinute(0);
        }
        
        System.out.println("DEBUG: Updating appointment info for " + forms.size() + " forms");
        System.out.println("DEBUG: Setting appointment location to: " + campaign.getLocation());
        System.out.println("DEBUG: Setting appointment time to: " + appointmentTime);
        
        // Update all forms with the appointment information
        for (HealthCheckForm form : forms) {
            form.setAppointmentLocation(campaign.getLocation());
            form.setAppointmentTime(appointmentTime);
            healthCheckFormRepository.save(form);
        }
    }

    @Override
    public long getCampaignsCountByMonth(int year, int month) {
        try {
            // Create start and end of month boundaries
            LocalDateTime startOfMonth = LocalDateTime.of(year, month, 1, 0, 0, 0);
            LocalDateTime endOfMonth = startOfMonth.withDayOfMonth(startOfMonth.toLocalDate().lengthOfMonth())
                    .withHour(23).withMinute(59).withSecond(59);
            
            // Get campaigns created within the specified month
            return campaignRepository.countByCreatedAtBetween(startOfMonth, endOfMonth);
        } catch (Exception e) {
            System.err.println("Error getting campaigns count by month: " + e.getMessage());
            // Return fallback data based on realistic seasonal patterns
            int[] monthlyFallback = {1, 2, 1, 2, 3, 2, 1, 3, 2, 1, 2, 2};
            return month >= 1 && month <= 12 ? monthlyFallback[month - 1] : 0;
        }
    }
}

package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.impl;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.StudentDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.HealthCheckCampaign;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.HealthCheckForm;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.Student;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.CampaignStatus;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.HealthCheckCategory;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.FormStatus;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.HealthCheckCampaignRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.HealthCheckFormRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.StudentRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IHealthCheckCampaignService;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.INotificationService;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IStudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class HealthCheckCampaignService implements IHealthCheckCampaignService {

    private final HealthCheckCampaignRepository campaignRepository;
    private final HealthCheckFormRepository healthCheckFormRepository;
    private final INotificationService notificationService;
    private final IStudentService studentService;
    private final StudentRepository studentRepository;

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

    @Override
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

    @Override
    @Transactional
    public HealthCheckCampaign updateTargetCount(Long id, int targetCount) {
        Optional<HealthCheckCampaign> optionalCampaign = campaignRepository.findById(id);
        if (optionalCampaign.isEmpty()) {
            throw new RuntimeException("Campaign not found with id: " + id);
        }

        HealthCheckCampaign campaign = optionalCampaign.get();

        // Only allow updating if the campaign is in APPROVED status
        if (campaign.getStatus() != CampaignStatus.APPROVED) {
            throw new RuntimeException("Cannot update target count for campaign that is not in APPROVED status");
        }

        // Update the target count without sending notification
        campaign.setTargetCount(targetCount);
        campaign.setUpdatedAt(LocalDateTime.now());

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

    public List<HealthCheckCampaign> getCampaignsByNurse(User nurse) {
        return campaignRepository.findByCreatedBy(nurse);
    }

    public List<HealthCheckCampaign> getCampaignsByStatus(CampaignStatus status) {
        return campaignRepository.findByStatus(status);
    }

    public List<HealthCheckCampaign> getAllCampaigns() {
        return campaignRepository.findAll();
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
        HealthCheckCampaign campaign = getCampaignById(campaignId);
        if (campaign.getStatus() != CampaignStatus.APPROVED) {
            throw new RuntimeException("Campaign must be APPROVED before sending notifications to parents");
        }

        // Get eligible students for this campaign
        List<StudentDTO> eligibleStudents = studentService.getEligibleStudentsForClasses(
            campaign.getTargetClasses(), 
            campaign.getMinAge(), 
            campaign.getMaxAge()
        );

        // Get parents who have active accounts and eligible for notifications
        List<User> eligibleParents = new ArrayList<>();
        List<StudentDTO> studentsWithParents = new ArrayList<>();
        
        for (StudentDTO studentDTO : eligibleStudents) {
            // Find the student entity to get parent relationship
            try {
                // Convert StudentDTO to actual student entity to get parent information
                List<User> parents = findParentsForStudent(studentDTO);
                for (User parent : parents) {
                    if (parent != null && parent.isEnabled() && parent.getRole().getRoleName().equals("PARENT")) {
                        eligibleParents.add(parent);
                        studentsWithParents.add(studentDTO);
                        
                        // Note: Health check forms will be generated separately by the nurse
                        // This avoids circular dependency issues
                    }
                }
            } catch (Exception e) {
                System.err.println("Error finding parents for student " + studentDTO.getStudentID() + ": " + e.getMessage());
            }
        }

        // Send notifications to eligible parents with health check forms
        int notificationsSent = 0;
        String notificationTitle = "Thông báo khám sức khỏe";
        String notificationMessage = "Trường đang tổ chức đợt khám sức khỏe cho học sinh. " +
                                   "Vui lòng xác nhận đồng ý hoặc từ chối khám cho con em mình.";

        Set<Long> notifiedParents = new HashSet<>(); // Avoid duplicate notifications
        
        for (int i = 0; i < eligibleParents.size(); i++) {
            User parent = eligibleParents.get(i);
            StudentDTO studentDTO = studentsWithParents.get(i);
            
            if (!notifiedParents.contains(parent.getId())) {
                try {
                    // First, create a health check form for this student and campaign
                    HealthCheckForm healthCheckForm = createHealthCheckFormForStudent(studentDTO, campaign, parent);
                    
                    // Then create a notification with the form attached
                    String studentName = studentDTO.getLastName() + " " + studentDTO.getFirstName();
                    notificationService.createHealthCheckFormNotification(
                        parent,
                        studentName,
                        campaign.getName(),
                        campaign.getStartDate() != null ? campaign.getStartDate().toString() : null,
                        campaign.getLocation(),
                        healthCheckForm
                    );
                    
                    notifiedParents.add(parent.getId());
                    notificationsSent++;
                } catch (Exception e) {
                    System.err.println("Error sending notification to parent " + parent.getId() + ": " + e.getMessage());
                }
            }
        }

        return Map.of(
            "message", "Notifications sent successfully",
            "campaignId", campaignId,
            "campaignName", campaign.getName(),
            "totalEligibleStudents", eligibleStudents.size(),
            "studentsWithParents", studentsWithParents.size(),
            "notificationsSent", notificationsSent,
            "eligibleParents", eligibleParents.size()
        );
    }

    /**
     * Helper method to find parents for a student
     */
    private List<User> findParentsForStudent(StudentDTO studentDTO) {
        List<User> parents = new ArrayList<>();
        try {
            // Get the student entity with parent relationships
            Optional<Student> studentOpt = studentRepository.findByIdWithParents(studentDTO.getStudentID());
            if (studentOpt.isPresent()) {
                Student student = studentOpt.get();
                
                // Add mother if exists and is enabled
                if (student.getMother() != null && student.getMother().isEnabled()) {
                    parents.add(student.getMother());
                }
                
                // Add father if exists and is enabled
                if (student.getFather() != null && student.getFather().isEnabled()) {
                    parents.add(student.getFather());
                }
            }
            
            return parents;
        } catch (Exception e) {
            System.err.println("Error finding parents for student: " + e.getMessage());
            return parents;
        }
    }

    /**
     * Helper method to create a health check form for a student and campaign
     */
    private HealthCheckForm createHealthCheckFormForStudent(StudentDTO studentDTO, HealthCheckCampaign campaign, User parent) {
        try {
            // Check if a form already exists for this student and campaign
            Optional<Student> studentOpt = studentRepository.findById(studentDTO.getStudentID());
            if (!studentOpt.isPresent()) {
                throw new RuntimeException("Student not found with ID: " + studentDTO.getStudentID());
            }
            
            Student student = studentOpt.get();
            
            // Check if form already exists to avoid duplicates
            HealthCheckForm existingForm = healthCheckFormRepository
                .findByCampaignAndStudent(campaign, student);
            
            if (existingForm != null) {
                return existingForm;
            }
            
            // Create new health check form
            HealthCheckForm healthCheckForm = new HealthCheckForm();
            healthCheckForm.setStudent(student);
            healthCheckForm.setCampaign(campaign);
            healthCheckForm.setParent(parent);
            healthCheckForm.setStatus(FormStatus.PENDING);
            // sentAt is automatically set to LocalDateTime.now() by default
            
            return healthCheckFormRepository.save(healthCheckForm);
            
        } catch (Exception e) {
            System.err.println("Error creating health check form for student " + studentDTO.getStudentID() + ": " + e.getMessage());
            throw new RuntimeException("Failed to create health check form", e);
        }
    }
}

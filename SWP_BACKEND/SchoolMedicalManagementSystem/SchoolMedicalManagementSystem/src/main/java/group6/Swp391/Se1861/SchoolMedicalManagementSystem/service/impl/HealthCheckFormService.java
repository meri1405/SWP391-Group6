package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.impl;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.HealthCheckFormDetailDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.HealthCheckFormSummaryDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.*;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.FormStatus;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.HealthCheckFormRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.StudentRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.UserRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.HealthCheckCampaignRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IHealthCheckCampaignService;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IHealthCheckFormService;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.INotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class HealthCheckFormService implements IHealthCheckFormService {

    private final HealthCheckFormRepository formRepository;
    private final StudentRepository studentRepository;
    private final INotificationService notificationService;
    private final IHealthCheckCampaignService campaignService;
    private final UserRepository userRepository;
    private final HealthCheckCampaignRepository campaignRepository;

    @Transactional
    @Override
    public List<HealthCheckForm> generateFormsForCampaign(Long campaignId, List<Long> studentIds) {
        HealthCheckCampaign campaign = campaignService.getCampaignById(campaignId);

        // Only allow form generation if campaign is in APPROVED status
        if (campaign.getStatus() != group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.CampaignStatus.APPROVED) {
            throw new RuntimeException("Cannot generate forms for a campaign that is not in APPROVED status");
        }

        List<HealthCheckForm> forms = new ArrayList<>();

        for (Long studentId : studentIds) {
            Optional<Student> optionalStudent = studentRepository.findById(studentId);
            if (optionalStudent.isEmpty()) {
                continue; // Skip invalid student IDs
            }

            Student student = optionalStudent.get();
            User parent = student.getParent();

            if (parent == null) {
                continue; // Skip students without a parent
            }

            // Check if a form already exists for this student and campaign
            HealthCheckForm existingForm = formRepository.findByCampaignAndStudent(campaign, student);
            if (existingForm != null) {
                continue; // Skip duplicate forms
            }

            HealthCheckForm form = new HealthCheckForm();
            form.setCampaign(campaign);
            form.setStudent(student);
            form.setParent(parent);
            form.setStatus(FormStatus.PENDING);
            form.setSentAt(LocalDateTime.now());

            forms.add(formRepository.save(form));

            // Send notification to parent
            notificationService.notifyParentAboutHealthCheck(form);
        }

        // Update the target count in the campaign
        campaign.setTargetCount(campaign.getTargetCount() + forms.size());
        campaignService.scheduleCampaign(campaignId, campaign.getTargetCount());

        return forms;
    }

    @Transactional
    @Override
    public List<HealthCheckForm> generateFormsByAgeRange(Long campaignId, int minAge, int maxAge) {
        HealthCheckCampaign campaign = campaignService.getCampaignById(campaignId);

        // Calculate date ranges for age filtering
        LocalDate now = LocalDate.now();
        LocalDate minDob = now.minusYears(maxAge);  // Older students (smaller date)
        LocalDate maxDob = now.minusYears(minAge);  // Younger students (larger date)

        // Get all students within the age range
        List<Student> students = studentRepository.findByDobBetween(minDob, maxDob);

        List<Long> studentIds = students.stream()
                .map(Student::getStudentID)
                .toList();

        return generateFormsForCampaign(campaignId, studentIds);
    }

    @Transactional
    @Override
    public List<HealthCheckForm> generateFormsByClass(Long campaignId, String className) {
        HealthCheckCampaign campaign = campaignService.getCampaignById(campaignId);

        // Get all students in the specified class
        List<Student> students = studentRepository.findByClassName(className);

        List<Long> studentIds = students.stream()
                .map(Student::getStudentID)
                .toList();

        return generateFormsForCampaign(campaignId, studentIds);
    }

    @Transactional
    @Override
    public HealthCheckForm updateFormStatus(Long formId, FormStatus status, String parentNote) {
        Optional<HealthCheckForm> optionalForm = formRepository.findById(formId);
        if (optionalForm.isEmpty()) {
            throw new RuntimeException("Form not found with id: " + formId);
        }

        HealthCheckForm form = optionalForm.get();
        form.setStatus(status);
        form.setRespondedAt(LocalDateTime.now());

        if (parentNote != null) {
            form.setParentNote(parentNote);
        }

        HealthCheckForm updatedForm = formRepository.save(form);

        // If the form is confirmed, update the confirmed count in the campaign
        if (status == FormStatus.CONFIRMED) {
            HealthCheckCampaign campaign = form.getCampaign();
            campaign.setConfirmedCount(campaign.getConfirmedCount() + 1);
            campaignService.getCampaignById(campaign.getId());

            // Notify the nurse about the confirmation
            notificationService.notifyNurseAboutParentConfirmation(form);
        }

        return updatedForm;
    }

    @Transactional
    @Override
    public HealthCheckForm scheduleAppointment(Long formId, LocalDateTime appointmentTime, String appointmentLocation) {
        Optional<HealthCheckForm> optionalForm = formRepository.findById(formId);
        if (optionalForm.isEmpty()) {
            throw new RuntimeException("Form not found with id: " + formId);
        }

        HealthCheckForm form = optionalForm.get();
        form.setAppointmentTime(appointmentTime);
        form.setAppointmentLocation(appointmentLocation);

        HealthCheckForm updatedForm = formRepository.save(form);

        // Notify the parent about the appointment details
        notificationService.notifyParentAboutAppointment(form);

        return updatedForm;
    }

    @Transactional
    @Override
    public HealthCheckForm checkInStudent(Long formId) {
        Optional<HealthCheckForm> optionalForm = formRepository.findById(formId);
        if (optionalForm.isEmpty()) {
            throw new RuntimeException("Form not found with id: " + formId);
        }

        HealthCheckForm form = optionalForm.get();
        form.setCheckedIn(true);
        form.setCheckedInAt(LocalDateTime.now());

        return formRepository.save(form);
    }

    @Override
    public HealthCheckForm getFormById(Long id) {
        Optional<HealthCheckForm> form = formRepository.findById(id);
        return form.orElseThrow(() -> new RuntimeException("Form not found with id: " + id));
    }

    @Override
    public List<HealthCheckForm> getFormsByCampaign(Long campaignId) {
        HealthCheckCampaign campaign = campaignService.getCampaignById(campaignId);
        return formRepository.findByCampaign(campaign);
    }

    @Override
    public List<HealthCheckForm> getFormsByCampaignAndStatus(Long campaignId, FormStatus status) {
        HealthCheckCampaign campaign = campaignService.getCampaignById(campaignId);
        return formRepository.findByCampaignAndStatus(campaign, status);
    }

    @Override
    public List<HealthCheckForm> getFormsByParent(User parent) {
        return formRepository.findByParent(parent);
    }

    @Override
    public List<HealthCheckForm> getFormsByParentAndStatus(User parent, FormStatus status) {
        return formRepository.findByParentAndStatus(parent, status);
    }

    @Override
    public List<HealthCheckForm> getFormsByStudent(Student student) {
        return formRepository.findByStudent(student);
    }

    @Override
    public int getConfirmedCountByCampaign(Long campaignId) {
        HealthCheckCampaign campaign = campaignService.getCampaignById(campaignId);
        return formRepository.countByCampaignAndStatus(campaign, FormStatus.CONFIRMED);
    }

    @Override
    public int getPendingCountByCampaign(Long campaignId) {
        HealthCheckCampaign campaign = campaignService.getCampaignById(campaignId);
        return formRepository.countByCampaignAndStatus(campaign, FormStatus.PENDING);
    }

    @Override
    public HealthCheckFormDetailDTO getFormDetailsForParent(Long formId, User parent) {
        try {
            // Get the form and verify authorization
            Optional<HealthCheckForm> formOpt = formRepository.findById(formId);
            if (formOpt.isEmpty()) {
                throw new RuntimeException("Health check form not found with id: " + formId);
            }
            
            HealthCheckForm form = formOpt.get();
            
            // Security check - ensure this form belongs to the requesting parent
            if (!form.getParent().getId().equals(parent.getId())) {
                throw new SecurityException("You are not authorized to view this form");
            }
            
            // Map to detailed DTO with complete information
            HealthCheckFormDetailDTO dto = new HealthCheckFormDetailDTO();
            
            // Form basic info
            dto.setFormId(form.getId());
            dto.setStatus(form.getStatus().toString());
            dto.setSentAt(form.getSentAt());
            dto.setRespondedAt(form.getRespondedAt());
            dto.setParentNote(form.getParentNote());
            dto.setAppointmentTime(form.getAppointmentTime());
            dto.setAppointmentLocation(form.getAppointmentLocation());
            
            // Campaign details from NURSE
            HealthCheckCampaign campaign = form.getCampaign();
            if (campaign != null) {
                dto.setCampaignId(campaign.getId());
                dto.setCampaignName(campaign.getName());
                dto.setCampaignDescription(campaign.getDescription());
                dto.setCampaignStartDate(campaign.getStartDate());
                dto.setCampaignEndDate(campaign.getEndDate());
                dto.setCampaignLocation(campaign.getLocation());
                dto.setMinAge(campaign.getMinAge());
                dto.setMaxAge(campaign.getMaxAge());
                dto.setTargetClasses(campaign.getTargetClasses());
                dto.setCampaignStatus(campaign.getStatus().toString());
                dto.setCampaignCreatedAt(campaign.getCreatedAt());
                
                // Nurse information (creator)
                User nurse = campaign.getCreatedBy();
                if (nurse != null) {
                    dto.setNurseFullName(nurse.getFullName());
                    dto.setNurseEmail(nurse.getEmail());
                    dto.setNursePhone(nurse.getPhone());
                }
                
                // Additional details
                dto.setDetailedInstructions(campaign.getDescription());
                dto.setSpecialNotes(campaign.getNotes());
                
                // Calculate deadline (campaign end date)
                if (campaign.getEndDate() != null) {
                    dto.setDeadline(campaign.getEndDate().atTime(23, 59, 59));
                }
            }
            
            // Student information
            Student student = form.getStudent();
            if (student != null) {
                dto.setStudentId(student.getStudentID());
                dto.setStudentFullName(student.getFullName());
                dto.setStudentClassName(student.getClassName());
                dto.setStudentGender(student.getGender() != null ? student.getGender().toString() : null);
                
                // Calculate age if DOB is available
                if (student.getDob() != null) {
                    LocalDate now = LocalDate.now();
                    int age = now.getYear() - student.getDob().getYear();
                    if (now.getDayOfYear() < student.getDob().getDayOfYear()) {
                        age--;
                    }
                    dto.setStudentAge(age);
                }
            }
            
            // Parent information
            dto.setParentId(parent.getId());
            dto.setParentFullName(parent.getFullName());
            dto.setParentEmail(parent.getEmail());
            dto.setParentPhone(parent.getPhone());
            
            // Set urgent flag based on deadline proximity
            if (dto.getDeadline() != null) {
                LocalDateTime now = LocalDateTime.now();
                LocalDateTime urgentThreshold = now.plusDays(3); // Within 3 days
                dto.setUrgent(dto.getDeadline().isBefore(urgentThreshold));
            }
            
            return dto;
            
        } catch (Exception e) {
            if (e instanceof SecurityException) {
                throw e;
            }
            throw new RuntimeException("Error retrieving form details: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public HealthCheckFormDetailDTO autoGenerateFormForParent(User parent, Long campaignId, Long studentId) {
        try {
            // Try to find an existing active campaign or create a default one
            HealthCheckCampaign campaign = null;
            
            if (campaignId != null) {
                try {
                    campaign = campaignService.getCampaignById(campaignId);
                } catch (Exception e) {
                    // Campaign not found, will create default
                }
            }
            
            // If no specific campaign, find or create a default active campaign
            if (campaign == null) {
                // Find active campaigns
                List<HealthCheckCampaign> activeCampaigns = campaignService.getCampaignsByStatus(
                    group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.CampaignStatus.APPROVED
                );
                
                if (!activeCampaigns.isEmpty()) {
                    campaign = activeCampaigns.get(0); // Use first active campaign
                } else {
                    // Create a default campaign for demo purposes
                    campaign = createDefaultCampaign();
                }
            }
            
            // Try to find a student for this parent
            Student student = null;
            if (studentId != null) {
                Optional<Student> studentOpt = studentRepository.findById(studentId);
                if (studentOpt.isPresent() && isStudentRelatedToParent(studentOpt.get(), parent)) {
                    student = studentOpt.get();
                }
            }
            
            // If no specific student, find first student for this parent
            if (student == null) {
                List<Student> parentStudents = studentRepository.findByParent(parent);
                if (!parentStudents.isEmpty()) {
                    student = parentStudents.get(0);
                } else {
                    // Create a default student for demo
                    student = createDefaultStudent(parent);
                }
            }
            
            // Check if form already exists
            HealthCheckForm existingForm = formRepository.findByCampaignAndStudent(campaign, student);
            if (existingForm != null) {
                // Return existing form details
                return getFormDetailsForParent(existingForm.getId(), parent);
            }
            
            // Create new form
            HealthCheckForm newForm = new HealthCheckForm();
            newForm.setCampaign(campaign);
            newForm.setStudent(student);
            newForm.setParent(parent);
            newForm.setStatus(FormStatus.PENDING);
            newForm.setSentAt(LocalDateTime.now());
            newForm.setAppointmentLocation("Tại trường");
            
            // Save the form
            newForm = formRepository.save(newForm);
            
            // Return detailed DTO
            return getFormDetailsForParent(newForm.getId(), parent);
            
        } catch (Exception e) {
            throw new RuntimeException("Error auto-generating form: " + e.getMessage());
        }
    }
    
    private HealthCheckCampaign createDefaultCampaign() {
        // This is a demo campaign - in production, this should be handled differently
        HealthCheckCampaign defaultCampaign = new HealthCheckCampaign();
        defaultCampaign.setName("Đợt khám sức khỏe học sinh 2025");
        defaultCampaign.setDescription("Trường đang tổ chức đợt khám sức khỏe cho học sinh. Vui lòng xác nhận đồng ý hoặc từ chối khám cho con em mình.");
        defaultCampaign.setStartDate(LocalDate.now().plusDays(7));
        defaultCampaign.setEndDate(LocalDate.now().plusDays(14));
        defaultCampaign.setLocation("Tại trường");
        defaultCampaign.setStatus(group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.CampaignStatus.APPROVED);
        defaultCampaign.setCreatedAt(LocalDateTime.now());
        defaultCampaign.setUpdatedAt(LocalDateTime.now());
        defaultCampaign.setMinAge(6);
        defaultCampaign.setMaxAge(18);
        
        // Set a default nurse as creator (you might need to find an actual nurse user)
        User defaultNurse = findDefaultNurse();
        defaultCampaign.setCreatedBy(defaultNurse);
        
        // Save and return
        return campaignRepository.save(defaultCampaign);
    }
    
    private Student createDefaultStudent(User parent) {
        // This is a demo student - in production, this should be handled differently
        Student defaultStudent = new Student();
        defaultStudent.setFirstName("Học sinh");
        defaultStudent.setLastName("Demo");
        defaultStudent.setClassName("Lớp 5A");
        defaultStudent.setDob(LocalDate.now().minusYears(10)); // 10 years old
        defaultStudent.setGender("M"); // Male
        defaultStudent.setBirthPlace("Hà Nội");
        defaultStudent.setAddress("123 Demo Street");
        defaultStudent.setCitizenship("Việt Nam");
        defaultStudent.setDisabled(false);
        
        // Set parent as mother (you could also set as father)
        defaultStudent.setMother(parent);
        
        // Save and return
        return studentRepository.save(defaultStudent);
    }
    
    private User findDefaultNurse() {
        // Try to find any nurse user, or create a default one
        // This is simplified - you might need to adjust based on your user structure
        User defaultNurse = new User();
        defaultNurse.setFirstName("Y tá");
        defaultNurse.setLastName("Trường");
        defaultNurse.setEmail("nurse@school.edu.vn");
        defaultNurse.setPhone("0123456789");
        defaultNurse.setDob(LocalDate.now().minusYears(30));
        defaultNurse.setGender("F");
        defaultNurse.setAddress("123 School Street");
        defaultNurse.setJobTitle("School Nurse");
        defaultNurse.setEnabled(true);
        // Note: This is a simplified example - you'd need proper role assignment
        return defaultNurse;
    }
    
    private boolean isStudentRelatedToParent(Student student, User parent) {
        return (student.getMother() != null && student.getMother().getId().equals(parent.getId())) ||
               (student.getFather() != null && student.getFather().getId().equals(parent.getId()));
    }
    
    @Override
    public List<HealthCheckFormSummaryDTO> getFormsSummaryByParent(User parent) {
        List<HealthCheckForm> forms = formRepository.findByParent(parent);
        return forms.stream().map(this::convertToSummaryDTO).collect(java.util.stream.Collectors.toList());
    }
    
    @Override
    public List<HealthCheckFormSummaryDTO> getFormsSummaryByParentAndStatus(User parent, FormStatus status) {
        List<HealthCheckForm> forms = formRepository.findByParentAndStatus(parent, status);
        return forms.stream().map(this::convertToSummaryDTO).collect(java.util.stream.Collectors.toList());
    }
    
    private HealthCheckFormSummaryDTO convertToSummaryDTO(HealthCheckForm form) {
        HealthCheckFormSummaryDTO dto = new HealthCheckFormSummaryDTO();
        
        // Form basic info
        dto.setId(form.getId());
        dto.setStatus(form.getStatus().toString());
        dto.setSentAt(form.getSentAt());
        dto.setRespondedAt(form.getRespondedAt());
        dto.setParentNote(form.getParentNote());
        dto.setAppointmentTime(form.getAppointmentTime());
        dto.setAppointmentLocation(form.getAppointmentLocation());
        
        // Campaign info (avoid circular reference)
        if (form.getCampaign() != null) {
            HealthCheckCampaign campaign = form.getCampaign();
            dto.setCampaignId(campaign.getId());
            dto.setCampaignName(campaign.getName());
            dto.setCampaignDescription(campaign.getDescription());
            dto.setCampaignLocation(campaign.getLocation());
            dto.setCampaignStartDate(campaign.getStartDate() != null ? campaign.getStartDate().toString() : null);
            dto.setCampaignEndDate(campaign.getEndDate() != null ? campaign.getEndDate().toString() : null);
            dto.setCampaignStatus(campaign.getStatus().toString());
            dto.setMinAge(campaign.getMinAge());
            dto.setMaxAge(campaign.getMaxAge());
            dto.setTargetClasses(campaign.getTargetClasses());
            
            // Nurse info (simplified to avoid circular reference)
            if (campaign.getCreatedBy() != null) {
                User nurse = campaign.getCreatedBy();
                dto.setNurseFullName(nurse.getFullName());
                dto.setNurseEmail(nurse.getEmail());
                dto.setNursePhone(nurse.getPhone());
            }
        }
        
        // Student info
        if (form.getStudent() != null) {
            Student student = form.getStudent();
            dto.setStudentId(student.getStudentID());
            dto.setStudentFullName(student.getFullName());
            dto.setStudentClassName(student.getClassName());
            
            // Calculate age from DOB if available
            if (student.getDob() != null) {
                java.time.LocalDate now = java.time.LocalDate.now();
                int age = now.getYear() - student.getDob().getYear();
                if (now.getDayOfYear() < student.getDob().getDayOfYear()) {
                    age--;
                }
                dto.setStudentAge(age);
            }
            
            dto.setStudentGender(student.getGender());
        }
        
        return dto;
    }
}

package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.impl;


import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.HealthCheckFormDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.*;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.FormStatus;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.HealthCheckFormRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IHealthCheckFormService;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.INotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HealthCheckFormService implements IHealthCheckFormService {

    private final HealthCheckFormRepository formRepository;
    private final INotificationService notificationService;

    // Date formatter for consistent date formatting in notifications
    private static final DateTimeFormatter DATETIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm, dd/MM/yyyy");

    /**
     * Format LocalDateTime to HH:mm, dd/MM/yyyy
     */
    private String formatDateTime(LocalDateTime dateTime) {
        return dateTime != null ? dateTime.format(DATETIME_FORMATTER) : "N/A";
    }

    @Override
    public HealthCheckFormDTO getFormById(Long id) {
        HealthCheckForm form = formRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Health check form not found"));
        return convertToDTO(form);
    }

    @Override
    public List<HealthCheckFormDTO> getFormsByParent(User parent) {
        return formRepository.findByParent(parent).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<HealthCheckFormDTO> getPendingFormsByParent(User parent) {
        return formRepository.findByParentAndStatus(parent, FormStatus.PENDING)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<HealthCheckFormDTO> getFormsByCampaign(HealthCheckCampaign campaign) {
        return formRepository.findByCampaign(campaign).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public HealthCheckFormDTO confirmForm(Long formId, User parent, String parentNote) {
        HealthCheckForm form = formRepository.findById(formId)
                .orElseThrow(() -> new IllegalArgumentException("Health check form not found"));

        // Verify the parent is the owner of this form
        if (!form.getParent().getId().equals(parent.getId())) {
            throw new IllegalArgumentException("Not authorized to confirm this form");
        }

        if (form.getStatus() != FormStatus.PENDING) {
            throw new IllegalStateException("Form has already been responded to");
        }

        // Update form status
        form.setStatus(FormStatus.CONFIRMED);
        form.setRespondedAt(LocalDateTime.now());
        form.setParentNote(parentNote);

        HealthCheckForm savedForm = formRepository.save(form);

        // Send confirmation notification to parent AND nurse with proper form reference
        notificationService.sendHealthCheckFormConfirmation(
                savedForm,
                parent,
                savedForm.getStudent(),
                "<p>Cảm ơn quý phụ huynh đã đồng ý cho con em tham gia đợt khám sức khỏe tại trường.</p>" +
                "<p>Thời gian cụ thể của buổi khám sẽ được nhà trường thông báo sau.</p>" +
                "<p><em>Trân trọng!</em></p>",
                true
        );

        return convertToDTO(savedForm);
    }

    @Override
    @Transactional
    public HealthCheckFormDTO declineForm(Long formId, User parent, String parentNote) {
        HealthCheckForm form = formRepository.findById(formId)
                .orElseThrow(() -> new IllegalArgumentException("Health check form not found"));

        // Verify the parent is the owner of this form
        if (!form.getParent().getId().equals(parent.getId())) {
            throw new IllegalArgumentException("Not authorized to decline this form");
        }

        if (form.getStatus() != FormStatus.PENDING) {
            throw new IllegalStateException("Form has already been responded to");
        }

        // Update form status
        form.setStatus(FormStatus.DECLINED);
        form.setRespondedAt(LocalDateTime.now());
        form.setParentNote(parentNote);

        HealthCheckForm savedForm = formRepository.save(form);

        // Send decline notification to parent AND nurse with proper form reference
        notificationService.sendHealthCheckFormConfirmation(
                savedForm,
                parent,
                savedForm.getStudent(),
                "<p>Cảm ơn quý phụ huynh đã phản hồi về việc tham gia khám sức khỏe cho con em.</p>" + 
                "<p>Chúng tôi ghi nhận rằng quý phụ huynh đã từ chối cho con tham gia đợt khám sức khỏe tại trường.</p>" +
                "<p>Nếu có bất kỳ thay đổi hoặc thắc mắc nào, xin vui lòng liên hệ với nhà trường.</p>" +
                "<p><em>Trân trọng!</em></p>",
                false
        );

        return convertToDTO(savedForm);
    }

    @Override
    public List<HealthCheckFormDTO> getExpiredForms() {
        LocalDateTime threeDaysAgo = LocalDateTime.now().minusDays(3);
        LocalDateTime fiveDaysFromNow = LocalDateTime.now().plusDays(5);
        
        return formRepository.findExpiredFormsForAutoDecline(
                FormStatus.PENDING,
                threeDaysAgo,
                fiveDaysFromNow
        ).stream()
        .map(this::convertToDTO)
        .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void autoDeclineExpiredForms() {
        LocalDateTime threeDaysAgo = LocalDateTime.now().minusDays(3);
        LocalDateTime fiveDaysFromNow = LocalDateTime.now().plusDays(5);
        
        List<HealthCheckForm> expiredForms = formRepository.findExpiredFormsForAutoDecline(
                FormStatus.PENDING,
                threeDaysAgo,
                fiveDaysFromNow
        );

        for (HealthCheckForm form : expiredForms) {
            form.setStatus(FormStatus.DECLINED);
            form.setRespondedAt(LocalDateTime.now());
            form.setParentNote("Auto-declined due to no response within deadline");

            formRepository.save(form);

            // Send auto-decline notification to parent
            notificationService.sendHealthCheckCampaignParentConfirmation(
                    form.getCampaign(),
                    form.getParent(),
                    form.getStudent(),
                    "<p>Phiếu khám sức khỏe của con em quý phụ huynh đã bị từ chối tự động do không có phản hồi trong thời gian quy định.</p>" +
                    "<p>Nếu quý phụ huynh vẫn có nhu cầu cho con tham gia, xin vui lòng liên hệ với nhà trường để được hỗ trợ.</p>" +
                    "<p><em>Trân trọng!</em></p>"
            );

            System.out.println("Auto-declined health check form ID: " + form.getId() + 
                             " for student: " + form.getStudent().getFullName());
        }
    }

    @Override
    @Transactional
    public HealthCheckForm createHealthCheckForm(HealthCheckCampaign campaign, Student student, User parent) {
        // Check if student is disabled
        if (student.isDisabled()) {
            throw new IllegalArgumentException("Cannot create health check form for disabled student with id: " + student.getStudentID());
        }
        
        // Check if a form already exists for this campaign and student
        Optional<HealthCheckForm> existingForm = formRepository.findByCampaignAndStudent(campaign, student);
        if (existingForm.isPresent()) {
            System.out.println("DEBUG: Form already exists for student " + student.getStudentID() + " in campaign " + campaign.getId());
            return existingForm.get();
        }
        
        HealthCheckForm form = new HealthCheckForm();
        form.setCampaign(campaign);
        form.setStudent(student);
        form.setParent(parent);
        form.setStatus(FormStatus.PENDING);
        form.setSentAt(LocalDateTime.now());
        form.setCreatedAt(LocalDateTime.now());

        System.out.println("DEBUG: Creating new form for student " + student.getStudentID() + " in campaign " + campaign.getId());
        return formRepository.save(form);
    }


    @Override
    @Transactional
    public void sendReminderNotifications() {
        // Calculate the time 24 hours before expiration
        // Forms expire after 3 days, so we want to send reminder when forms are 2 days old
        LocalDateTime reminderTriggerTime = LocalDateTime.now().minusDays(2);
        
        // We also want to avoid sending reminders for forms that are too old (already expired)
        LocalDateTime tooOldThreshold = LocalDateTime.now().minusDays(3).minusHours(1); // Add buffer to avoid edge cases
        
        // Find forms that:
        // 1. Are still pending
        // 2. Are around 2 days old (within a small window to account for scheduling precision)
        // 3. Have not had a reminder sent yet
        // 4. Are not already expired
        List<HealthCheckForm> formsNeedingReminder = formRepository.findFormsNeedingReminder(
                FormStatus.PENDING,
                reminderTriggerTime,
                tooOldThreshold
        );

        for (HealthCheckForm form : formsNeedingReminder) {
            // Calculate expiration time (3 days after form was sent)
            LocalDateTime expirationTime = form.getSentAt().plusDays(3);
            
            // Send reminder notification
            notificationService.sendHealthCheckCampaignParentInvitation(
                    form.getCampaign(),
                    form.getParent(),
                    form.getStudent(),
                    "<p><strong>Nhắc nhở quan trọng:</strong> Quý phụ huynh vui lòng phản hồi lời mời tham gia đợt khám sức khỏe tại trường dành cho con em trước <strong>" + 
                    formatDateTime(expirationTime) + 
                    "</strong>. Sau thời hạn này, phiếu đồng ý sẽ tự động bị từ chối.</p>" +
                    "<p>Việc phản hồi đúng hạn sẽ giúp nhà trường sắp xếp và tổ chức khám sức khỏe hiệu quả hơn.</p>" +
                    "<p><em>Trân trọng cảm ơn!</em></p>",
                    form
            );

            // Mark reminder as sent
            form.setReminderSent(true);
            formRepository.save(form);
            
            System.out.println("Sent reminder for form ID: " + form.getId() + 
                             " for student: " + form.getStudent().getFullName() + 
                             ", expires at: " + expirationTime);
        }
    }

    @Override
    public long getFormCountByCampaignAndStatus(HealthCheckCampaign campaign, FormStatus status) {
        return formRepository.countByCampaignAndStatus(campaign, status);
    }

    @Override
    public HealthCheckFormDTO convertToDTO(HealthCheckForm form) {
        HealthCheckFormDTO dto = new HealthCheckFormDTO();
        
        dto.setId(form.getId());
        dto.setStatus(form.getStatus());
        dto.setSentAt(form.getSentAt());
        dto.setCreatedAt(form.getCreatedAt());
        dto.setRespondedAt(form.getRespondedAt());
        dto.setParentNote(form.getParentNote());
        dto.setAppointmentTime(form.getAppointmentTime());
        dto.setAppointmentLocation(form.getAppointmentLocation());
        dto.setReminderSent(form.isReminderSent());
        dto.setCheckedIn(form.isCheckedIn());
        dto.setCheckedInAt(form.getCheckedInAt());

        // Campaign information
        if (form.getCampaign() != null) {
            HealthCheckCampaign campaign = form.getCampaign();
            dto.setCampaignId(campaign.getId());
            dto.setCampaignName(campaign.getName());
            dto.setCampaignDescription(campaign.getDescription());
            dto.setCampaignStartDate(campaign.getStartDate().atStartOfDay());
            dto.setCampaignEndDate(campaign.getEndDate().atTime(23, 59, 59));
            dto.setLocation(campaign.getLocation()); // Use getLocation instead of getCampaignLocation
            dto.setCampaignStatus(campaign.getStatus().toString());
            
            // Add categories to the DTO
            Set<String> categoriesAsStrings = new HashSet<>();
            if (campaign.getCategories() != null) {
                campaign.getCategories().forEach(category -> 
                    categoriesAsStrings.add(category.name()));
            }
            dto.setCategories(categoriesAsStrings);
        }

        // Student information
        if (form.getStudent() != null) {
            Student student = form.getStudent();
            dto.setStudentId(student.getStudentID()); // Use getStudentID instead of getId
            dto.setStudentFullName(student.getFullName());
            dto.setStudentClassName(student.getClassName());
            dto.setSchoolYear(student.getSchoolYear());
            if (student.getDob() != null) {
                dto.setStudentDateOfBirth(student.getDob().toString()); // Use getDob instead of getDateOfBirth
            }
        }

        // Parent information
        if (form.getParent() != null) {
            User parent = form.getParent();
            dto.setParentId(parent.getId());
            dto.setParentFullName(parent.getFullName());
            dto.setParentPhone(parent.getPhone()); // Use getPhone instead of getPhoneNumber
        }

        return dto;
    }

    @Override
    public List<HealthCheckForm> getConfirmedFormsByCampaignId(Long campaignId) {
        return formRepository.findByCampaignIdAndConfirmed(campaignId, true);
    }

    @Override
    public void sendFormToParent(HealthCheckForm form) {
        // Get necessary information
        User parent = form.getParent();
        Student student = form.getStudent();
        HealthCheckCampaign campaign = form.getCampaign();
        
        // Send notification to parent about the health check form
        notificationService.sendHealthCheckCampaignParentInvitation(
            campaign,
            parent,
            student,
            "Please review and respond to the health check consent form for your child.",
            form
        );
    }
}

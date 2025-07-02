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
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HealthCheckFormService implements IHealthCheckFormService {

    private final HealthCheckFormRepository formRepository;
    private final INotificationService notificationService;

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
                "Your child's health check has been confirmed.",
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
                "You have declined the health check for your child.",
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
                    "The health check form for your child has been automatically declined due to no response within the deadline."
            );

            System.out.println("Auto-declined health check form ID: " + form.getId() + 
                             " for student: " + form.getStudent().getFullName());
        }
    }

    @Override
    @Transactional
    public HealthCheckForm createHealthCheckForm(HealthCheckCampaign campaign, Student student, User parent) {
        HealthCheckForm form = new HealthCheckForm();
        form.setCampaign(campaign);
        form.setStudent(student);
        form.setParent(parent);
        form.setStatus(FormStatus.PENDING);
        form.setSentAt(LocalDateTime.now());
        form.setCreatedAt(LocalDateTime.now());

        return formRepository.save(form);
    }

    @Override
    @Transactional
    public void sendFormToParent(HealthCheckForm form) {
        // Send invitation notification to parent
        notificationService.sendHealthCheckCampaignParentInvitation(
                form.getCampaign(),
                form.getParent(),
                form.getStudent(),
                "Your child has been invited to participate in a health check campaign.",
                form
        );
    }

    @Override
    @Transactional
    public void sendReminderNotifications() {
        LocalDateTime reminderThreshold = LocalDateTime.now().minusDays(1); // Send reminder if form is 1 day old
        
        List<HealthCheckForm> formsNeedingReminder = formRepository.findFormsNeedingReminder(
                FormStatus.PENDING,
                reminderThreshold
        );

        for (HealthCheckForm form : formsNeedingReminder) {
            // Send reminder notification
            notificationService.sendHealthCheckCampaignParentInvitation(
                    form.getCampaign(),
                    form.getParent(),
                    form.getStudent(),
                    "Reminder: Please respond to the health check invitation for your child.",
                    form
            );

            // Mark reminder as sent
            form.setReminderSent(true);
            formRepository.save(form);
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
            dto.setCampaignStatus(campaign.getStatus().toString());
        }

        // Student information
        if (form.getStudent() != null) {
            Student student = form.getStudent();
            dto.setStudentId(student.getStudentID()); // Use getStudentID instead of getId
            dto.setStudentFullName(student.getFullName());
            dto.setStudentCode(student.getStudentID().toString()); // Use studentID as code
            dto.setStudentClassName(student.getClassName());
            if (student.getDob() != null) {
                dto.setStudentDateOfBirth(student.getDob().toString()); // Use getDob instead of getDateOfBirth
            }
        }

        // Parent information
        if (form.getParent() != null) {
            User parent = form.getParent();
            dto.setParentId(parent.getId());
            dto.setParentFullName(parent.getFullName());
            dto.setParentEmail(parent.getEmail());
            dto.setParentPhone(parent.getPhone()); // Use getPhone instead of getPhoneNumber
        }

        return dto;
    }
}

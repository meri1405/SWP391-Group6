package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.impl;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.*;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.FormStatus;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.HealthCheckFormRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.StudentRepository;
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
}

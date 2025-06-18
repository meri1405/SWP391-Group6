package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.impl;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.VaccinationFormDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.VaccinationForm;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.VaccinationFormRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IVaccinationFormService;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.INotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VaccinationFormService implements IVaccinationFormService {

    private final VaccinationFormRepository formRepository;
    private final INotificationService notificationService;

    @Override
    public VaccinationFormDTO getFormById(Long id) {
        VaccinationForm form = formRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Vaccination form not found"));
        return convertToDTO(form);
    }

    @Override
    public List<VaccinationFormDTO> getFormsByParent(User parent) {
        return formRepository.findByParent(parent).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<VaccinationFormDTO> getPendingFormsByParent(User parent) {
        return formRepository.findByParentAndConfirmationStatus(
                parent, VaccinationForm.ConfirmationStatus.PENDING)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public VaccinationFormDTO confirmForm(Long formId, User parent, String parentNotes) {
        VaccinationForm form = formRepository.findById(formId)
                .orElseThrow(() -> new IllegalArgumentException("Vaccination form not found"));

        // Verify parent ownership
        if (!form.getParent().getId().equals(parent.getId())) {
            throw new IllegalArgumentException("You are not authorized to confirm this form");
        }

        if (form.getConfirmationStatus() != VaccinationForm.ConfirmationStatus.PENDING) {
            throw new IllegalArgumentException("Form has already been processed");
        }

        form.setConfirmationStatus(VaccinationForm.ConfirmationStatus.CONFIRMED);
        form.setConfirmationDate(LocalDateTime.now());
        form.setParentNotes(parentNotes);
        form = formRepository.save(form);

        // Notify nurse about confirmation
        String studentName = form.getStudent().getFirstName() + " " + form.getStudent().getLastName();
        notificationService.createVaccinationFormConfirmationNotification(
                form.getCreatedBy(),
                studentName,
                form.getVaccineName()
        );

        return convertToDTO(form);
    }

    @Override
    @Transactional
    public VaccinationFormDTO declineForm(Long formId, User parent, String parentNotes) {
        VaccinationForm form = formRepository.findById(formId)
                .orElseThrow(() -> new IllegalArgumentException("Vaccination form not found"));

        // Verify parent ownership
        if (!form.getParent().getId().equals(parent.getId())) {
            throw new IllegalArgumentException("You are not authorized to decline this form");
        }

        if (form.getConfirmationStatus() != VaccinationForm.ConfirmationStatus.PENDING) {
            throw new IllegalArgumentException("Form has already been processed");
        }

        form.setConfirmationStatus(VaccinationForm.ConfirmationStatus.DECLINED);
        form.setConfirmationDate(LocalDateTime.now());
        form.setParentNotes(parentNotes);        form = formRepository.save(form);

        // Notify nurse about decline
        String studentName = form.getStudent().getFirstName() + " " + form.getStudent().getLastName();
        notificationService.createVaccinationFormDeclineNotification(
                form.getCreatedBy(),
                studentName,
                form.getVaccineName(),
                parentNotes
        );

        return convertToDTO(form);
    }

    @Override
    public List<VaccinationFormDTO> getExpiredForms() {
        // Forms that are pending for more than 7 days are considered expired
        LocalDateTime expiredDate = LocalDateTime.now().minusDays(7);
        
        return formRepository.findByConfirmationStatus(VaccinationForm.ConfirmationStatus.PENDING)
                .stream()
                .filter(form -> form.getCreatedDate().isBefore(expiredDate))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void markFormsAsExpired() {
        LocalDateTime expiredDate = LocalDateTime.now().minusDays(7);
        
        List<VaccinationForm> expiredForms = formRepository.findByConfirmationStatus(VaccinationForm.ConfirmationStatus.PENDING)
                .stream()
                .filter(form -> form.getCreatedDate().isBefore(expiredDate))
                .collect(Collectors.toList());

        for (VaccinationForm form : expiredForms) {
            form.setConfirmationStatus(VaccinationForm.ConfirmationStatus.EXPIRED);
            
            // Notify nurse about expired form
            String studentName = form.getStudent().getFirstName() + " " + form.getStudent().getLastName();
            notificationService.createVaccinationFormExpiryNotification(
                    form.getCreatedBy(),
                    studentName
            );
        }

        if (!expiredForms.isEmpty()) {
            formRepository.saveAll(expiredForms);
        }
    }

    @Override
    public VaccinationFormDTO convertToDTO(VaccinationForm form) {
        VaccinationFormDTO dto = new VaccinationFormDTO();
        dto.setId(form.getId());
        dto.setVaccineName(form.getVaccineName());
        dto.setVaccineBrand(form.getVaccineBrand());
        dto.setDoseNumber(form.getDoseNumber());
        dto.setScheduledDate(form.getScheduledDate());
        dto.setLocation(form.getLocation());
        dto.setPrePostCareInstructions(form.getPrePostCareInstructions());
        dto.setConfirmationStatus(form.getConfirmationStatus().toString());
        dto.setConfirmationDate(form.getConfirmationDate());
        dto.setCreatedDate(form.getCreatedDate());
        dto.setSentDate(form.getSentDate());
        dto.setParentNotes(form.getParentNotes());
        dto.setAdditionalInfo(form.getAdditionalInfo());
        dto.setIsActive(form.getIsActive());
        
        if (form.getCampaign() != null) {
            dto.setCampaignId(form.getCampaign().getId());
            dto.setCampaignName(form.getCampaign().getName());
        }
        
        if (form.getStudent() != null) {
            dto.setStudentId(form.getStudent().getStudentID());
            dto.setStudentFullName(form.getStudent().getFirstName() + " " + form.getStudent().getLastName());
            dto.setStudentCode(form.getStudent().getStudentID().toString());
        }
        
        if (form.getParent() != null) {
            dto.setParentId(form.getParent().getId());
            dto.setParentFullName(form.getParent().getFirstName() + " " + form.getParent().getLastName());
            dto.setParentEmail(form.getParent().getEmail());
            dto.setParentPhone(form.getParent().getPhone());
        }
        
        if (form.getCreatedBy() != null) {
            dto.setCreatedById(form.getCreatedBy().getId());
            dto.setCreatedByName(form.getCreatedBy().getFirstName() + " " + form.getCreatedBy().getLastName());
        }
        
        return dto;
    }
}

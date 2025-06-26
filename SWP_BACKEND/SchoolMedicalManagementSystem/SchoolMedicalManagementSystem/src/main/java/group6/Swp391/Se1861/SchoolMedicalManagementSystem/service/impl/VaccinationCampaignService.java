package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.impl;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.*;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.*;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.*;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IVaccinationCampaignService;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.INotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VaccinationCampaignService implements IVaccinationCampaignService {

    private final VaccinationCampaignRepository campaignRepository;
    private final VaccinationRuleRepository ruleRepository;
    private final VaccinationFormRepository formRepository;
    private final VaccinationRecordRepository recordRepository;
    private final VaccinationHistoryRepository historyRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final INotificationService notificationService;

    @Override
    @Transactional
    public VaccinationCampaignDTO createCampaign(User nurse, CreateVaccinationCampaignRequest request) {
        // Validate nurse role
        if (!"SCHOOLNURSE".equals(nurse.getRole().getRoleName())) {
            throw new IllegalArgumentException("Only school nurses can create vaccination campaigns");
        }

        // Validate vaccination rule exists
        VaccinationRule rule = ruleRepository.findById(request.getVaccinationRuleId())
                .orElseThrow(() -> new IllegalArgumentException("Vaccination rule not found"));

        // Check if there's already an active campaign with the same name
        if (campaignRepository.existsByNameAndStatus(request.getName(), VaccinationCampaign.CampaignStatus.PENDING) ||
            campaignRepository.existsByNameAndStatus(request.getName(), VaccinationCampaign.CampaignStatus.APPROVED)) {
            throw new IllegalArgumentException("A campaign with this name already exists and is active");
        }

        // Create campaign entity
        VaccinationCampaign campaign = new VaccinationCampaign();
        campaign.setName(request.getName());
        campaign.setDescription(request.getDescription());
        campaign.setVaccineName(rule.getName());
        campaign.setVaccineBrand(request.getVaccineBrand() != null ? request.getVaccineBrand() : "");
        campaign.setLocation(request.getLocation());
        campaign.setScheduledDate(request.getScheduledDate());
        campaign.setCreatedDate(LocalDateTime.now());
        campaign.setStatus(VaccinationCampaign.CampaignStatus.PENDING);
        campaign.setPrePostCareInstructions(request.getPrePostCareInstructions());
        campaign.setEstimatedVaccineCount(request.getEstimatedVaccineCount());
        campaign.setVaccinationRule(rule);
        campaign.setCreatedBy(nurse);

        campaign = campaignRepository.save(campaign);

        // Send notification to managers for approval
        sendApprovalNotificationToManagers(campaign);

        return convertToDTO(campaign);
    }

    @Override
    public VaccinationCampaignDTO getCampaignById(Long id) {
        VaccinationCampaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Campaign not found"));
        return convertToDTO(campaign);
    }

    @Override
    public List<VaccinationCampaignDTO> getAllCampaigns() {
        return campaignRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Page<VaccinationCampaignDTO> getCampaignsByStatus(VaccinationCampaign.CampaignStatus status, Pageable pageable) {
        return campaignRepository.findByStatusOrderByCreatedDateDesc(status, pageable)
                .map(this::convertToDTO);
    }

    @Override
    public Page<VaccinationCampaignDTO> getCampaignsByNurse(User nurse, Pageable pageable) {
        return campaignRepository.findByCreatedByOrderByCreatedDateDesc(nurse, pageable)
                .map(this::convertToDTO);
    }

    @Override
    @Transactional
    public VaccinationCampaignDTO updateCampaign(Long id, User nurse, CreateVaccinationCampaignRequest request) {
        VaccinationCampaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Campaign not found"));

        // Only creator can update and only if status is PENDING
        if (!campaign.getCreatedBy().getId().equals(nurse.getId())) {
            throw new IllegalArgumentException("Only the campaign creator can update it");
        }

        if (campaign.getStatus() != VaccinationCampaign.CampaignStatus.PENDING) {
            throw new IllegalArgumentException("Can only update pending campaigns");
        }

        // Update fields
        if (request.getVaccinationRuleId() != null) {
            VaccinationRule rule = ruleRepository.findById(request.getVaccinationRuleId())
                    .orElseThrow(() -> new IllegalArgumentException("Vaccination rule not found"));
            campaign.setVaccinationRule(rule);
            campaign.setVaccineName(rule.getName());
        }

        campaign.setName(request.getName());
        campaign.setDescription(request.getDescription());
        campaign.setLocation(request.getLocation());
        campaign.setScheduledDate(request.getScheduledDate());
        campaign.setPrePostCareInstructions(request.getPrePostCareInstructions());
        campaign.setEstimatedVaccineCount(request.getEstimatedVaccineCount());
        if (request.getVaccineBrand() != null) {
            campaign.setVaccineBrand(request.getVaccineBrand());
        }

        campaign = campaignRepository.save(campaign);
        return convertToDTO(campaign);
    }

    @Override
    @Transactional
    public void deleteCampaign(Long id, User nurse) {
        VaccinationCampaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Campaign not found"));

        // Only creator can delete and only if status is PENDING
        if (!campaign.getCreatedBy().getId().equals(nurse.getId())) {
            throw new IllegalArgumentException("Only the campaign creator can delete it");
        }

        if (campaign.getStatus() != VaccinationCampaign.CampaignStatus.PENDING) {
            throw new IllegalArgumentException("Can only delete pending campaigns");
        }

        campaignRepository.delete(campaign);
    }

    @Override
    @Transactional
    public VaccinationCampaignDTO approveCampaign(Long id, User manager) {
        // Validate manager role
        if (!"MANAGER".equals(manager.getRole().getRoleName())) {
            throw new IllegalArgumentException("Only managers can approve campaigns");
        }

        VaccinationCampaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Campaign not found"));

        if (campaign.getStatus() != VaccinationCampaign.CampaignStatus.PENDING) {
            throw new IllegalArgumentException("Can only approve pending campaigns");
        }

        campaign.setStatus(VaccinationCampaign.CampaignStatus.APPROVED);
        campaign.setApprovedBy(manager);
        campaign.setApprovedDate(LocalDateTime.now());
        campaign = campaignRepository.save(campaign);

        // Notify the creator
        String approverName = manager.getFirstName() + " " + manager.getLastName();
        notificationService.createCampaignApprovalNotification(
                campaign.getCreatedBy(),
                campaign.getName(),
                approverName
        );

        return convertToDTO(campaign);
    }

    @Override
    @Transactional
    public VaccinationCampaignDTO rejectCampaign(Long id, User manager, String reason) {
        // Validate manager role
        if (!"MANAGER".equals(manager.getRole().getRoleName())) {
            throw new IllegalArgumentException("Only managers can reject campaigns");
        }

        VaccinationCampaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Campaign not found"));

        if (campaign.getStatus() != VaccinationCampaign.CampaignStatus.PENDING) {
            throw new IllegalArgumentException("Can only reject pending campaigns");
        }

        campaign.setStatus(VaccinationCampaign.CampaignStatus.REJECTED);
        campaign.setApprovedBy(manager);
        campaign.setApprovedDate(LocalDateTime.now());
        campaign = campaignRepository.save(campaign);

        // Notify the creator with rejection reason
        notificationService.createCampaignRejectionNotification(
                campaign.getCreatedBy(),
                campaign.getName(),
                reason
        );

        return convertToDTO(campaign);
    }

    @Override
    @Transactional(readOnly = true)
    public EligibleStudentsResponse getEligibleStudents(Long campaignId) {
        VaccinationCampaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new IllegalArgumentException("Campaign not found with ID: " + campaignId));

        if (campaign.getStatus() != VaccinationCampaign.CampaignStatus.APPROVED) {
            throw new IllegalArgumentException("Campaign " + campaignId + " has status " + campaign.getStatus() + 
                ". Campaign must be APPROVED to check eligible students. Current status: " + campaign.getStatus());
        }

        VaccinationRule rule = campaign.getVaccinationRule();
        List<Student> allStudents = studentRepository.findAllWithParents();

        List<EligibleStudentsResponse.StudentVaccinationInfoDTO> eligibleStudents = new ArrayList<>();
        List<EligibleStudentsResponse.StudentVaccinationInfoDTO> ineligibleStudents = new ArrayList<>();

        for (Student student : allStudents) {
            EligibleStudentsResponse.StudentVaccinationInfoDTO studentInfo = createStudentVaccinationInfo(student, rule);
            
            if (isStudentEligible(student, rule)) {
                eligibleStudents.add(studentInfo);
            } else {
                ineligibleStudents.add(studentInfo);
            }
        }

        EligibleStudentsResponse response = new EligibleStudentsResponse();
        response.setEligibleStudents(eligibleStudents);
        response.setIneligibleStudents(ineligibleStudents);
        response.setMessage("Found " + eligibleStudents.size() + " eligible students and " + 
                           ineligibleStudents.size() + " ineligible students");

        return response;
    }

    @Override
    @Transactional
    public List<VaccinationFormDTO> generateVaccinationForms(Long campaignId, User nurse) {
        VaccinationCampaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new IllegalArgumentException("Campaign not found"));

        if (campaign.getStatus() != VaccinationCampaign.CampaignStatus.APPROVED) {
            throw new IllegalArgumentException("Campaign must be approved to generate forms");
        }

        if (!"SCHOOLNURSE".equals(nurse.getRole().getRoleName())) {
            throw new IllegalArgumentException("Only school nurses can generate vaccination forms");
        }

        VaccinationRule rule = campaign.getVaccinationRule();
        List<Student> allStudents = studentRepository.findAllWithParents();
        List<VaccinationForm> forms = new ArrayList<>();

        for (Student student : allStudents) {
            if (isStudentEligible(student, rule) && !formRepository.existsByCampaignAndStudent(campaign, student)) {
                // Determine parent (prefer mother, then father)
                User parent = student.getMother() != null ? student.getMother() : student.getFather();
                
                if (parent != null) {
                    VaccinationForm form = new VaccinationForm();
                    form.setVaccineName(campaign.getVaccineName());
                    form.setVaccineBrand(campaign.getVaccineBrand());
                    form.setDoseNumber(rule.getDoesNumber());
                    form.setScheduledDate(campaign.getScheduledDate());
                    form.setLocation(campaign.getLocation());
                    form.setPrePostCareInstructions(campaign.getPrePostCareInstructions());
                    form.setConfirmationStatus(VaccinationForm.ConfirmationStatus.PENDING);
                    form.setCampaign(campaign);
                    form.setStudent(student);
                    form.setParent(parent);
                    form.setCreatedBy(nurse);
                    
                    forms.add(form);
                }
            }
        }

        if (!forms.isEmpty()) {
            forms = formRepository.saveAll(forms);
        }

        return forms.stream().map(this::convertFormToDTO).collect(Collectors.toList());
    }

    // Private helper methods
    private boolean isStudentEligible(Student student, VaccinationRule rule) {
        // Calculate age in months
        int ageInMonths = calculateAgeInMonths(student.getDob());
        
        // Check age range
        if (ageInMonths < rule.getMinAge() || ageInMonths > rule.getMaxAge()) {
            return false;
        }        // Check vaccination history for dose sequence
        List<VaccinationHistory> histories = historyRepository.findByStudent(student)
                .stream()
                .filter(h -> h.getVaccineName().equals(rule.getName()))
                .collect(Collectors.toList());
        
        // Check if student needs this dose
        if (rule.getDoesNumber() > 1) {
            // For doses > 1, check if previous dose exists
            boolean hasPreviousDose = histories.stream()
                    .anyMatch(h -> h.getDoseNumber() == rule.getDoesNumber() - 1);
            
            if (!hasPreviousDose) {
                return false;
            }
            
            // Check interval between doses
            if (rule.getIntervalDays() > 0) {
                Optional<VaccinationHistory> lastDose = histories.stream()
                        .filter(h -> h.getDoseNumber() == rule.getDoesNumber() - 1)
                        .findFirst();
                
                if (lastDose.isPresent()) {
                    LocalDate lastVaccineDate = lastDose.get().getDateOfVaccination();
                    LocalDate earliestNextDate = lastVaccineDate.plusDays(rule.getIntervalDays());
                    
                    if (LocalDate.now().isBefore(earliestNextDate)) {
                        return false;
                    }
                }
            }
        }

        // Check if student already has this dose
        boolean alreadyHasDose = histories.stream()
                .anyMatch(h -> h.getDoseNumber() == rule.getDoesNumber());
        
        return !alreadyHasDose;
    }

    private int calculateAgeInMonths(LocalDate birthDate) {
        Period period = Period.between(birthDate, LocalDate.now());
        return period.getYears() * 12 + period.getMonths();
    }

    private EligibleStudentsResponse.StudentVaccinationInfoDTO createStudentVaccinationInfo(Student student, VaccinationRule rule) {
        EligibleStudentsResponse.StudentVaccinationInfoDTO dto = new EligibleStudentsResponse.StudentVaccinationInfoDTO();
        dto.setStudentId(student.getStudentID());
        dto.setStudentFullName(student.getFirstName() + " " + student.getLastName());
        dto.setStudentCode(student.getStudentID().toString()); // Assuming studentID is used as code
        dto.setAgeInMonths(calculateAgeInMonths(student.getDob()));
        dto.setClassName(student.getClassName());
        
        // Set ineligibility reason if applicable
        if (!isStudentEligible(student, rule)) {
            dto.setIneligibilityReason(getIneligibilityReason(student, rule));
        }
          // Get previous vaccinations
        List<VaccinationHistory> histories = historyRepository.findByStudent(student)
                .stream()
                .filter(h -> h.getVaccineName().equals(rule.getName()))
                .collect(Collectors.toList());
        
        List<EligibleStudentsResponse.StudentVaccinationInfoDTO.VaccinationHistoryInfo> historyInfos = 
                histories.stream().map(h -> {
                    EligibleStudentsResponse.StudentVaccinationInfoDTO.VaccinationHistoryInfo info = 
                            new EligibleStudentsResponse.StudentVaccinationInfoDTO.VaccinationHistoryInfo();
                    info.setVaccineName(h.getVaccineName());
                    info.setDoseNumber(h.getDoseNumber());
                    info.setDateOfVaccination(h.getDateOfVaccination().toString());
                    info.setSource(h.getSource().toString());
                    return info;
                }).collect(Collectors.toList());
        
        dto.setPreviousVaccinations(historyInfos);
        
        return dto;
    }

    private String getIneligibilityReason(Student student, VaccinationRule rule) {
        int ageInMonths = calculateAgeInMonths(student.getDob());
        
        if (ageInMonths < rule.getMinAge()) {
            return "Tuổi chưa đủ (cần tối thiểu " + rule.getMinAge() + " tháng)";
        }
        
        if (ageInMonths > rule.getMaxAge()) {
            return "Đã quá tuổi (tối đa " + rule.getMaxAge() + " tháng)";
        }
          List<VaccinationHistory> histories = historyRepository.findByStudent(student)
                .stream()
                .filter(h -> h.getVaccineName().equals(rule.getName()))
                .collect(Collectors.toList());
        
        if (rule.getDoesNumber() > 1) {
            boolean hasPreviousDose = histories.stream()
                    .anyMatch(h -> h.getDoseNumber() == rule.getDoesNumber() - 1);
            
            if (!hasPreviousDose) {
                return "Chưa tiêm mũi " + (rule.getDoesNumber() - 1);
            }
        }
        
        boolean alreadyHasDose = histories.stream()
                .anyMatch(h -> h.getDoseNumber() == rule.getDoesNumber());
        
        if (alreadyHasDose) {
            return "Đã tiêm mũi " + rule.getDoesNumber();
        }
        
        return "Không đủ điều kiện";
    }

    private void sendApprovalNotificationToManagers(VaccinationCampaign campaign) {
        // Find all users with MANAGER role
        List<User> managers = userRepository.findByRole_RoleName("MANAGER");
          for (User manager : managers) {
            String creatorName = campaign.getCreatedBy().getFirstName() + " " + campaign.getCreatedBy().getLastName();
            notificationService.createCampaignApprovalRequestNotification(
                    manager,
                    campaign.getName(),
                    creatorName
            );
        }
    }

    // Continue with remaining methods...
    @Override
    @Transactional
    public List<VaccinationFormDTO> sendFormsToParents(Long campaignId, User nurse) {
        VaccinationCampaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new IllegalArgumentException("Campaign not found"));

        List<VaccinationForm> forms = formRepository.findByCampaignAndConfirmationStatus(
                campaign, VaccinationForm.ConfirmationStatus.PENDING);

        List<VaccinationForm> sentForms = new ArrayList<>();
        for (VaccinationForm form : forms) {
            if (form.getSentDate() == null) {
                // Send notification to parent
                String studentName = form.getStudent().getLastName() + " " + form.getStudent().getFirstName();
                String vaccineName = form.getVaccineName() + " (Mũi " + form.getDoseNumber() + ")";
                notificationService.createVaccinationConsentFormNotification(
                        form.getParent(),
                        studentName,
                        vaccineName,
                        form.getLocation(),
                        form.getScheduledDate() != null ? form.getScheduledDate().toString() : null,
                        form
                );

                form.setSentDate(LocalDateTime.now());
                sentForms.add(form);
            }
        }

        if (!sentForms.isEmpty()) {
            formRepository.saveAll(sentForms);
        }

        return sentForms.stream().map(this::convertFormToDTO).collect(Collectors.toList());
    }

    @Override
    public List<VaccinationFormDTO> getCampaignForms(Long campaignId) {
        VaccinationCampaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new IllegalArgumentException("Campaign not found"));

        return formRepository.findByCampaign(campaign).stream()
                .map(this::convertFormToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<VaccinationFormDTO> getConfirmedForms(Long campaignId) {
        VaccinationCampaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new IllegalArgumentException("Campaign not found"));

        return formRepository.findByCampaignAndConfirmationStatus(campaign, VaccinationForm.ConfirmationStatus.CONFIRMED)
                .stream()
                .map(this::convertFormToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<VaccinationFormDTO> getPendingForms(Long campaignId) {
        VaccinationCampaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new IllegalArgumentException("Campaign not found"));

        return formRepository.findByCampaignAndConfirmationStatus(campaign, VaccinationForm.ConfirmationStatus.PENDING)
                .stream()
                .map(this::convertFormToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<VaccinationRecordDTO> getCampaignRecords(Long campaignId) {
        VaccinationCampaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new IllegalArgumentException("Campaign not found"));

        return recordRepository.findByCampaign(campaign).stream()
                .map(this::convertRecordToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public VaccinationRecordDTO createVaccinationRecord(Long formId, VaccinationRecordDTO recordDTO, User nurse) {
        VaccinationForm form = formRepository.findById(formId)
                .orElseThrow(() -> new IllegalArgumentException("Vaccination form not found"));

        if (!VaccinationForm.ConfirmationStatus.CONFIRMED.equals(form.getConfirmationStatus())) {
            throw new IllegalArgumentException("Can only create records for confirmed forms");
        }

        if (recordRepository.existsByStudentAndCampaign(form.getStudent(), form.getCampaign())) {
            throw new IllegalArgumentException("Vaccination record already exists for this student in this campaign");
        }

        VaccinationRecord record = new VaccinationRecord();
        record.setVaccineName(form.getVaccineName());
        record.setVaccineBrand(form.getVaccineBrand());
        record.setDoseNumber(form.getDoseNumber());
        record.setLotNumber(recordDTO.getLotNumber());
        record.setVaccinationDate(recordDTO.getVaccinationDate() != null ? 
                recordDTO.getVaccinationDate() : LocalDateTime.now());
        record.setLocation(form.getLocation());
        record.setSource(VaccinationRecord.VaccinationSource.SCHOOL_ADMINISTERED);
        record.setAdministeredBy(recordDTO.getAdministeredBy());
        record.setNotes(recordDTO.getNotes());
        record.setStudent(form.getStudent());
        record.setCampaign(form.getCampaign());
        record.setVaccinationRule(form.getCampaign().getVaccinationRule());
        record.setRecordedBy(nurse);
        record.setVaccinationForm(form);

        // Handle pre-vaccination status
        if (recordDTO.getPreVaccinationStatus() != null) {
            record.setNotes((record.getNotes() != null ? record.getNotes() + "; " : "") +
                    "Pre-vaccination status: " + recordDTO.getPreVaccinationStatus());
            
            if (recordDTO.getPreVaccinationNotes() != null) {
                record.setNotes(record.getNotes() + "; " + recordDTO.getPreVaccinationNotes());
            }
        }

        record = recordRepository.save(record);
        return convertRecordToDTO(record);
    }

    @Override
    @Transactional
    public VaccinationRecordDTO updateVaccinationRecord(Long recordId, VaccinationRecordDTO recordDTO, User nurse) {
        VaccinationRecord record = recordRepository.findById(recordId)
                .orElseThrow(() -> new IllegalArgumentException("Vaccination record not found"));

        // Update fields
        if (recordDTO.getAdverseReactions() != null) {
            record.setAdverseReactions(recordDTO.getAdverseReactions());
        }
        
        if (recordDTO.getFollowUpNotes() != null) {
            record.setFollowUpNotes(recordDTO.getFollowUpNotes());
        }
        
        if (recordDTO.getFollowUpDate() != null) {
            record.setFollowUpDate(recordDTO.getFollowUpDate());
        }
        
        if (recordDTO.getSeverityLevel() != null) {
            record.setSeverityLevel(VaccinationRecord.SeverityLevel.valueOf(recordDTO.getSeverityLevel()));
        }
        
        if (recordDTO.getMedicalAttentionRequired() != null) {
            record.setMedicalAttentionRequired(recordDTO.getMedicalAttentionRequired());
        }
        
        if (recordDTO.getResolved() != null) {
            record.setResolved(recordDTO.getResolved());
        }
        
        if (recordDTO.getNotes() != null) {
            record.setNotes(recordDTO.getNotes());
        }
        
        record.setUpdatedBy(nurse);
        record = recordRepository.save(record);

        return convertRecordToDTO(record);
    }

    @Override
    @Transactional
    public VaccinationCampaignDTO completeCampaign(Long campaignId, User nurse) {
        VaccinationCampaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new IllegalArgumentException("Campaign not found"));

        if (campaign.getStatus() != VaccinationCampaign.CampaignStatus.IN_PROGRESS &&
            campaign.getStatus() != VaccinationCampaign.CampaignStatus.APPROVED) {
            throw new IllegalArgumentException("Campaign must be in progress or approved to be completed");
        }

        campaign.setStatus(VaccinationCampaign.CampaignStatus.COMPLETED);
        campaign = campaignRepository.save(campaign);

        // Sync all successful vaccinations to vaccination history
        List<VaccinationRecord> records = recordRepository.findByCampaign(campaign);
        for (VaccinationRecord record : records) {
            if (record.getIsActive() && record.getVaccinationDate() != null) {
                syncRecordToHistory(record);
            }
        }

        return convertToDTO(campaign);
    }

    // Utility conversion methods
    @Override
    public VaccinationCampaignDTO convertToDTO(VaccinationCampaign campaign) {
        VaccinationCampaignDTO dto = new VaccinationCampaignDTO();
        dto.setId(campaign.getId());
        dto.setName(campaign.getName());
        dto.setDescription(campaign.getDescription());
        dto.setVaccineName(campaign.getVaccineName());
        dto.setVaccineBrand(campaign.getVaccineBrand());
        dto.setLocation(campaign.getLocation());
        dto.setScheduledDate(campaign.getScheduledDate());
        dto.setCreatedDate(campaign.getCreatedDate());
        dto.setApprovedDate(campaign.getApprovedDate());
        dto.setStatus(campaign.getStatus().toString());
        dto.setPrePostCareInstructions(campaign.getPrePostCareInstructions());
        dto.setEstimatedVaccineCount(campaign.getEstimatedVaccineCount());
        
        if (campaign.getVaccinationRule() != null) {
            dto.setVaccinationRuleId(campaign.getVaccinationRule().getId());
            dto.setVaccinationRuleName(campaign.getVaccinationRule().getName());
            dto.setDoseNumber(campaign.getVaccinationRule().getDoesNumber());
            dto.setMinAge(campaign.getVaccinationRule().getMinAge());
            dto.setMaxAge(campaign.getVaccinationRule().getMaxAge());
        }
        
        if (campaign.getCreatedBy() != null) {
            dto.setCreatedById(campaign.getCreatedBy().getId());
            dto.setCreatedByName(campaign.getCreatedBy().getFirstName() + " " + campaign.getCreatedBy().getLastName());
        }
        
        if (campaign.getApprovedBy() != null) {
            dto.setApprovedById(campaign.getApprovedBy().getId());
            dto.setApprovedByName(campaign.getApprovedBy().getFirstName() + " " + campaign.getApprovedBy().getLastName());
        }
        
        return dto;
    }

    private VaccinationFormDTO convertFormToDTO(VaccinationForm form) {
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
            dto.setStudentClassName(form.getStudent().getClassName());
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

    private VaccinationRecordDTO convertRecordToDTO(VaccinationRecord record) {
        VaccinationRecordDTO dto = new VaccinationRecordDTO();
        dto.setId(record.getId());
        dto.setVaccineName(record.getVaccineName());
        dto.setVaccineBrand(record.getVaccineBrand());
        dto.setDoseNumber(record.getDoseNumber());
        dto.setLotNumber(record.getLotNumber());
        dto.setVaccinationDate(record.getVaccinationDate());
        dto.setLocation(record.getLocation());
        dto.setSource(record.getSource().toString());
        dto.setAdministeredBy(record.getAdministeredBy());
        dto.setAdverseReactions(record.getAdverseReactions());
        dto.setFollowUpNotes(record.getFollowUpNotes());
        dto.setFollowUpDate(record.getFollowUpDate());
        dto.setSeverityLevel(record.getSeverityLevel() != null ? record.getSeverityLevel().toString() : null);
        dto.setMedicalAttentionRequired(record.getMedicalAttentionRequired());
        dto.setResolved(record.getResolved());
        dto.setRecordedDate(record.getRecordedDate());
        dto.setUpdatedDate(record.getUpdatedDate());
        dto.setIsActive(record.getIsActive());
        dto.setNotes(record.getNotes());
        
        if (record.getStudent() != null) {
            dto.setStudentId(record.getStudent().getStudentID());
            dto.setStudentFullName(record.getStudent().getFirstName() + " " + record.getStudent().getLastName());
            dto.setStudentCode(record.getStudent().getStudentID().toString());
        }
        
        if (record.getCampaign() != null) {
            dto.setCampaignId(record.getCampaign().getId());
            dto.setCampaignName(record.getCampaign().getName());
        }
        
        if (record.getVaccinationRule() != null) {
            dto.setVaccinationRuleId(record.getVaccinationRule().getId());
            dto.setVaccinationRuleName(record.getVaccinationRule().getName());
        }
        
        if (record.getRecordedBy() != null) {
            dto.setRecordedById(record.getRecordedBy().getId());
            dto.setRecordedByName(record.getRecordedBy().getFirstName() + " " + record.getRecordedBy().getLastName());
        }
        
        if (record.getUpdatedBy() != null) {
            dto.setUpdatedById(record.getUpdatedBy().getId());
            dto.setUpdatedByName(record.getUpdatedBy().getFirstName() + " " + record.getUpdatedBy().getLastName());
        }
        
        if (record.getVaccinationForm() != null) {
            dto.setVaccinationFormId(record.getVaccinationForm().getId());
        }
        
        return dto;
    }

    private void syncRecordToHistory(VaccinationRecord record) {
        // Find student's health profile
        Student student = record.getStudent();
        // Assuming there's a method to get the active health profile for a student
        // You'll need to implement this based on your HealthProfile entity relationship
        // For now, I'll leave this as a placeholder
        
        // Create VaccinationHistory entry
        VaccinationHistory history = new VaccinationHistory();
        history.setVaccineName(record.getVaccineName());
        history.setDoseNumber(record.getDoseNumber());
        history.setManufacturer(record.getVaccineBrand());
        history.setDateOfVaccination(record.getVaccinationDate().toLocalDate());
        history.setPlaceOfVaccination(record.getLocation());
        history.setAdministeredBy(record.getAdministeredBy());
        history.setNotes(record.getNotes());
        history.setStatus(true); // Successfully vaccinated
        history.setSource(VaccinationHistory.VaccinationSource.SCHOOL_ADMINISTERED);
        history.setVaccinationRule(record.getVaccinationRule());
        
        // You'll need to set the health profile - this requires additional logic
        // to find the correct health profile for the student
        
        historyRepository.save(history);
    }
}

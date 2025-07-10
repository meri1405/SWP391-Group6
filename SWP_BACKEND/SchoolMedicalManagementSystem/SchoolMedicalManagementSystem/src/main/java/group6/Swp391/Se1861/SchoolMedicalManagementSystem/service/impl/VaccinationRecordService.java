package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.impl;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.VaccinationRecordDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.*;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.VaccinationRecordRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.VaccinationHistoryRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IVaccinationRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VaccinationRecordService implements IVaccinationRecordService {

    private final VaccinationRecordRepository recordRepository;
    private final VaccinationHistoryRepository historyRepository;

    @Override
    public VaccinationRecordDTO getRecordById(Long id) {
        VaccinationRecord record = recordRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Vaccination record not found"));
        return convertToDTO(record);
    }

    @Override
    public List<VaccinationRecordDTO> getRecordsByStudent(Student student) {
        return recordRepository.findByStudent(student).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<VaccinationRecordDTO> getRecordsNeedingFollowUp() {
        return recordRepository.findRecordsNeedingFollowUp().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<VaccinationRecordDTO> getSevereReactions() {
        return recordRepository.findSevereReactions().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public VaccinationRecordDTO updateRecord(Long id, VaccinationRecordDTO recordDTO, User nurse) {
        VaccinationRecord record = recordRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Vaccination record not found"));

        // Validate nurse role
        if (!"SCHOOLNURSE".equals(nurse.getRole().getRoleName())) {
            throw new IllegalArgumentException("Only school nurses can update vaccination records");
        }

        // Update adverse reactions
        if (recordDTO.getAdverseReactions() != null) {
            record.setAdverseReactions(recordDTO.getAdverseReactions());
            
            // Auto-determine severity level based on reaction description
            if (recordDTO.getSeverityLevel() == null) {
                record.setSeverityLevel(determineSeverityLevel(recordDTO.getAdverseReactions()));
            }
        }
        
        if (recordDTO.getSeverityLevel() != null) {
            try {
                record.setSeverityLevel(VaccinationRecord.SeverityLevel.valueOf(recordDTO.getSeverityLevel()));
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid severity level: " + recordDTO.getSeverityLevel());
            }
        }
        
        if (recordDTO.getMedicalAttentionRequired() != null) {
            record.setMedicalAttentionRequired(recordDTO.getMedicalAttentionRequired());
            
            // If medical attention is required, mark as unresolved
            if (recordDTO.getMedicalAttentionRequired()) {
                record.setResolved(false);
            }
        }
        
        if (recordDTO.getResolved() != null) {
            record.setResolved(recordDTO.getResolved());
        }
        
        if (recordDTO.getFollowUpNotes() != null) {
            record.setFollowUpNotes(recordDTO.getFollowUpNotes());
        }
        
        if (recordDTO.getFollowUpDate() != null) {
            record.setFollowUpDate(recordDTO.getFollowUpDate());
        }
        
        if (recordDTO.getNotes() != null) {
            record.setNotes(recordDTO.getNotes());
        }
        
        record.setUpdatedBy(nurse);
        record = recordRepository.save(record);

        return convertToDTO(record);
    }

    @Override
    @Transactional
    public VaccinationRecordDTO addFollowUpNotes(Long id, String followUpNotes, User nurse) {
        VaccinationRecord record = recordRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Vaccination record not found"));

        // Validate nurse role
        if (!"SCHOOLNURSE".equals(nurse.getRole().getRoleName())) {
            throw new IllegalArgumentException("Only school nurses can add follow-up notes");
        }

        String existingNotes = record.getFollowUpNotes();
        String timestamp = LocalDateTime.now().toString();
        String newNote = "[" + timestamp + "] " + followUpNotes;
        
        if (existingNotes != null && !existingNotes.trim().isEmpty()) {
            record.setFollowUpNotes(existingNotes + "\n" + newNote);
        } else {
            record.setFollowUpNotes(newNote);
        }
        
        record.setUpdatedBy(nurse);
        record = recordRepository.save(record);

        return convertToDTO(record);
    }

    @Override
    @Transactional
    public VaccinationRecordDTO markAsResolved(Long id, User nurse) {
        VaccinationRecord record = recordRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Vaccination record not found"));

        // Validate nurse role
        if (!"SCHOOLNURSE".equals(nurse.getRole().getRoleName())) {
            throw new IllegalArgumentException("Only school nurses can mark records as resolved");
        }

        record.setResolved(true);
        record.setMedicalAttentionRequired(false);
        record.setUpdatedBy(nurse);
        
        // Add resolution note
        String timestamp = LocalDateTime.now().toString();
        String resolutionNote = "[" + timestamp + "] Case resolved by " + 
                nurse.getFullName();
        
        String existingNotes = record.getFollowUpNotes();
        if (existingNotes != null && !existingNotes.trim().isEmpty()) {
            record.setFollowUpNotes(existingNotes + "\n" + resolutionNote);
        } else {
            record.setFollowUpNotes(resolutionNote);
        }
        
        record = recordRepository.save(record);

        return convertToDTO(record);
    }

    @Override
    @Transactional
    public void syncToVaccinationHistory(Long recordId) {
        VaccinationRecord record = recordRepository.findById(recordId)
                .orElseThrow(() -> new IllegalArgumentException("Vaccination record not found"));

        // Only sync successful vaccinations
        if (!record.getIsActive() || record.getVaccinationDate() == null) {
            return;
        }

        // Get the student's health profile (one-to-one relationship)
        HealthProfile healthProfile = record.getStudent().getHealthProfile();
        if (healthProfile == null) {
            throw new IllegalArgumentException("No health profile found for student");
        }

        // Check if history entry already exists
        List<VaccinationHistory> existingHistories = historyRepository
                .findByHealthProfileAndVaccineNameAndDoseNumber(
                        healthProfile, record.getVaccineName(), record.getDoseNumber());

        if (!existingHistories.isEmpty()) {
            // Update existing history
            VaccinationHistory existing = existingHistories.get(0);
            existing.setManufacturer(record.getVaccineBrand());
            existing.setDateOfVaccination(record.getVaccinationDate().toLocalDate());
            existing.setPlaceOfVaccination(record.getLocation());
            existing.setAdministeredBy(record.getAdministeredBy());
            existing.setNotes(record.getNotes());
            existing.setStatus(true);
            
            historyRepository.save(existing);
        } else {
            // Create new history entry
            VaccinationHistory history = new VaccinationHistory();
            history.setVaccineName(record.getVaccineName());
            history.setDoseNumber(record.getDoseNumber());
            history.setManufacturer(record.getVaccineBrand());
            history.setDateOfVaccination(record.getVaccinationDate().toLocalDate());
            history.setPlaceOfVaccination(record.getLocation());
            history.setAdministeredBy(record.getAdministeredBy());
            history.setNotes(record.getNotes());
            history.setStatus(true);
            history.setSource(VaccinationHistory.VaccinationSource.SCHOOL_ADMINISTERED);
            history.setHealthProfile(healthProfile);
            history.setVaccinationRule(record.getVaccinationRule());
            
            historyRepository.save(history);
        }
    }

    @Override
    public VaccinationRecordDTO convertToDTO(VaccinationRecord record) {
        VaccinationRecordDTO dto = new VaccinationRecordDTO();
        dto.setId(record.getId());
        dto.setVaccineName(record.getVaccineName());
        dto.setVaccineBrand(record.getVaccineBrand());
        dto.setDoseNumber(record.getDoseNumber());
        dto.setLotNumber(record.getLotNumber());
        dto.setVaccinationDate(record.getVaccinationDate());
        dto.setLocation(record.getLocation());
        dto.setSource(record.getSource() != null ? record.getSource().toString() : null);
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
            dto.setStudentFullName(record.getStudent().getFullName());
            dto.setStudentCode(record.getStudent().getStudentID().toString());
            dto.setStudentClassName(record.getStudent().getClassName());
            dto.setSchoolYear(record.getStudent().getSchoolYear());
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
            dto.setRecordedByName(record.getRecordedBy().getFullName());
        }
        
        if (record.getUpdatedBy() != null) {
            dto.setUpdatedById(record.getUpdatedBy().getId());
            dto.setUpdatedByName(record.getUpdatedBy().getFullName());
        }
        
        if (record.getVaccinationForm() != null) {
            dto.setVaccinationFormId(record.getVaccinationForm().getId());
        }
        
        return dto;
    }

    private VaccinationRecord.SeverityLevel determineSeverityLevel(String adverseReactions) {
        if (adverseReactions == null || adverseReactions.trim().isEmpty()) {
            return VaccinationRecord.SeverityLevel.NONE;
        }
        
        String reaction = adverseReactions.toLowerCase();
        
        // Critical reactions
        if (reaction.contains("sốc phản vệ") || reaction.contains("khó thở nghiêm trọng") || 
            reaction.contains("co giật") || reaction.contains("bất tỉnh")) {
            return VaccinationRecord.SeverityLevel.CRITICAL;
        }
        
        // Severe reactions
        if (reaction.contains("sốt cao") || reaction.contains("khó thở") || 
            reaction.contains("phù nề") || reaction.contains("nôn mửa nhiều")) {
            return VaccinationRecord.SeverityLevel.SEVERE;
        }
        
        // Moderate reactions
        if (reaction.contains("sốt") || reaction.contains("đau") || 
            reaction.contains("sưng") || reaction.contains("nôn")) {
            return VaccinationRecord.SeverityLevel.MODERATE;
        }
        
        // Mild reactions
        return VaccinationRecord.SeverityLevel.MILD;
    }
}

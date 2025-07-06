package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.impl;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.*;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.*;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.ProfileStatus;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.*;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.INotificationService;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.ISchoolNurseHealthProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class SchoolNurseHealthProfileService implements ISchoolNurseHealthProfileService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private HealthProfileRepository healthProfileRepository;

    @Autowired
    private AllergiesRepository allergiesRepository;

    @Autowired
    private ChronicDiseasesRepository chronicDiseasesRepository;

    @Autowired
    private InfectiousDiseasesRepository infectiousDiseasesRepository;

    @Autowired
    private TreatmentHistoryRepository treatmentHistoryRepository;

    @Autowired
    private VisionRepository visionRepository;

    @Autowired
    private HearingRepository hearingRepository;

    @Autowired
    private VaccinationHistoryRepository vaccinationHistoryRepository;

    @Autowired
    private INotificationService notificationService;

    /**
     * Get all health profiles
     * @return list of all health profiles
     */
    @Override
    public List<HealthProfileDTO> getAllHealthProfiles() {
        List<HealthProfile> profiles = healthProfileRepository.findAll();
        return profiles.stream()
                .filter(profile -> profile.getStudent() != null && !profile.getStudent().isDisabled())
                .map(this::convertToBasicDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get health profiles filtered by status
     * @param status the status to filter by
     * @return list of health profiles with the specified status
     */
    @Override
    public List<HealthProfileDTO> getHealthProfilesByStatus(ProfileStatus status) {
        List<HealthProfile> profiles = healthProfileRepository.findByStatus(status);
        return profiles.stream()
                .filter(profile -> profile.getStudent() != null && !profile.getStudent().isDisabled())
                .map(this::convertToBasicDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get a health profile by ID with detailed information
     * @param profileId ID of the health profile
     * @return detailed health profile data
     */
    @Override
    public HealthProfileDTO getHealthProfileById(Long profileId) {
        HealthProfile healthProfile = healthProfileRepository.findById(profileId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Health profile not found"));
                
        // Check if student is disabled
        if (healthProfile.getStudent() != null && healthProfile.getStudent().isDisabled()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot access health profile of a disabled student");
        }
        
        return convertToDetailedDTO(healthProfile);
    }

    /**
     * Approve a health profile
     * @param nurseId ID of the nurse user
     * @param profileId ID of the health profile
     * @param nurseNote optional note from nurse
     * @return approved health profile
     */
    @Transactional
    public HealthProfileDTO approveHealthProfile(Long nurseId, Long profileId, String nurseNote) {
        // Validate nurse exists
        User nurse = userRepository.findById(nurseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Nurse not found"));

        // Check if the user has SCHOOLNURSE role
        if (!nurse.getRole().getRoleName().equals("SCHOOLNURSE")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only school nurses can approve health profiles");
        }

        // Get health profile
        HealthProfile healthProfile = healthProfileRepository.findById(profileId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Health profile not found"));

        // Validate profile is in PENDING status
        if (healthProfile.getStatus() != ProfileStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "Only health profiles in PENDING status can be approved. Current status: " + healthProfile.getStatus());
        }        // Update profile status and nurse information
        healthProfile.setStatus(ProfileStatus.APPROVED);
        healthProfile.setNurse(nurse);
        // Set nurse note separately, don't mix with parent note
        healthProfile.setNurseNote(nurseNote != null && !nurseNote.trim().isEmpty() ? nurseNote.trim() : null);
        healthProfile.setUpdatedAt(LocalDate.now());

        // Save approved profile
        HealthProfile approvedProfile = healthProfileRepository.save(healthProfile);

        // Send notification to parent using NotificationService
        if (approvedProfile.getParent() != null) {
            String title = "Hồ sơ sức khỏe đã được duyệt";
            String message = "<p>Hồ sơ sức khỏe của học sinh " +
                   "<strong>" + approvedProfile.getStudent().getFirstName() + " " +
                    approvedProfile.getStudent().getLastName() + "</strong>"  + " đã được y tá trường duyệt.</p>";

            notificationService.createHealthProfileNotification(
                approvedProfile,
                approvedProfile.getParent(),
                "HEALTH_PROFILE_APPROVED",
                title,
                message
            );
        }

        return convertToDetailedDTO(approvedProfile);
    }

    /**
     * Reject a health profile
     * @param nurseId ID of the nurse user
     * @param profileId ID of the health profile
     * @param nurseNote nurse note with rejection reason
     * @return rejected health profile
     */
    @Transactional
    @Override
    public HealthProfileDTO rejectHealthProfile(Long nurseId, Long profileId, String nurseNote) {
        // Validate nurse exists
        User nurse = userRepository.findById(nurseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Nurse not found"));

        // Check if the user has SCHOOLNURSE role
        if (!nurse.getRole().getRoleName().equals("SCHOOLNURSE")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only school nurses can reject health profiles");
        }

        // Validate nurseNote
        if (nurseNote == null || nurseNote.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rejection reason is required");
        }

        // Get health profile
        HealthProfile healthProfile = healthProfileRepository.findById(profileId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Health profile not found"));

        // Validate profile is in PENDING status
        if (healthProfile.getStatus() != ProfileStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "Only health profiles in PENDING status can be rejected. Current status: " + healthProfile.getStatus());
        }

        // Update profile status and nurse information
        healthProfile.setStatus(ProfileStatus.REJECTED);
        healthProfile.setNurse(nurse);

        // Set nurse note separately for rejection reason
        healthProfile.setNurseNote(nurseNote != null && !nurseNote.trim().isEmpty() ? nurseNote.trim() : null);
        healthProfile.setUpdatedAt(LocalDate.now());

        // Save rejected profile
        HealthProfile rejectedProfile = healthProfileRepository.save(healthProfile);

        // Send notification to parent using NotificationService
        if (rejectedProfile.getParent() != null) {
            String title = "Hồ sơ sức khỏe đã bị từ chối";
            String message = "<p>Hồ sơ sức khỏe của học sinh " +
                   "<strong>" + rejectedProfile.getStudent().getFirstName() + " " +
                    rejectedProfile.getStudent().getLastName() + "</strong>" +
                    " đã bị từ chối. Lý do: " + nurseNote + "</p>";

            notificationService.createHealthProfileNotification(
                rejectedProfile,
                rejectedProfile.getParent(),
                "HEALTH_PROFILE_REJECTED",
                title,
                message
            );
        }

        return convertToDetailedDTO(rejectedProfile);
    }

    /**
     * Convert HealthProfile to basic HealthProfileDTO with student and parent information
     */
    @Override
    public HealthProfileDTO convertToBasicDTO(HealthProfile healthProfile) {
        HealthProfileDTO dto = new HealthProfileDTO();
        dto.setId(healthProfile.getId());
        dto.setWeight(healthProfile.getWeight());
        dto.setHeight(healthProfile.getHeight());
        dto.setCreatedAt(healthProfile.getCreatedAt());
        dto.setUpdatedAt(healthProfile.getUpdatedAt());
        dto.setBloodType(healthProfile.getBloodType());
        dto.setStatus(healthProfile.getStatus());
        dto.setNote(healthProfile.getNote());

        // Initialize additionalFields if needed
        Map<String, Object> additionalFields = new HashMap<>();

        if (healthProfile.getStudent() != null) {
            dto.setStudentId(healthProfile.getStudent().getStudentID());

            // Create StudentDTO
            StudentDTO studentDTO = new StudentDTO();
            studentDTO.setStudentID(healthProfile.getStudent().getStudentID());
            studentDTO.setFirstName(healthProfile.getStudent().getFirstName());
            studentDTO.setLastName(healthProfile.getStudent().getLastName());
            studentDTO.setClassName(healthProfile.getStudent().getClassName());

            // Add to additional fields
            additionalFields.put("student", studentDTO);
        }

        if (healthProfile.getParent() != null) {
            dto.setParentId(healthProfile.getParent().getId());

            // Create parent UserDTO
            Map<String, Object> parentDTO = new HashMap<>();
            parentDTO.put("id", healthProfile.getParent().getId());
            parentDTO.put("firstName", healthProfile.getParent().getFirstName());
            parentDTO.put("lastName", healthProfile.getParent().getLastName());
            parentDTO.put("phone", healthProfile.getParent().getPhone());
            parentDTO.put("email", healthProfile.getParent().getEmail());

            // Add to additional fields
            additionalFields.put("parent", parentDTO);
        }

        if (healthProfile.getNurse() != null) {
            dto.setNurseId(healthProfile.getNurse().getId());

            // Add nurse full name to additional fields
            additionalFields.put("schoolNurseFullName", 
                healthProfile.getNurse().getLastName() + " " + healthProfile.getNurse().getFirstName());
        }

        // Set additional fields if any were added
        if (!additionalFields.isEmpty()) {
            dto.setAdditionalFields(additionalFields);
        }

        return dto;
    }

    /**
     * Convert HealthProfile to detailed HealthProfileDTO with all related data
     */
    @Override
    public HealthProfileDTO convertToDetailedDTO(HealthProfile healthProfile) {
        HealthProfileDTO dto = convertToBasicDTO(healthProfile);

        // Convert allergies
        if (healthProfile.getAllergies() != null && !healthProfile.getAllergies().isEmpty()) {
            List<AllergiesDTO> allergies = new ArrayList<>();
            for (Allergies allergy : healthProfile.getAllergies()) {
                AllergiesDTO allergyDTO = new AllergiesDTO();
                allergyDTO.setId(allergy.getId());
                allergyDTO.setAllergyType(allergy.getAllergyType());
                allergyDTO.setDescription(allergy.getDescription());
                allergyDTO.setStatus(allergy.getStatus());
                allergyDTO.setOnsetDate(allergy.getOnsetDate());
                allergies.add(allergyDTO);
            }
            dto.setAllergies(allergies);
        }

        // Convert chronic diseases
        if (healthProfile.getChronicDiseases() != null && !healthProfile.getChronicDiseases().isEmpty()) {
            List<ChronicDiseasesDTO> diseases = new ArrayList<>();
            for (ChronicDiseases disease : healthProfile.getChronicDiseases()) {
                ChronicDiseasesDTO diseaseDTO = new ChronicDiseasesDTO();
                diseaseDTO.setId(disease.getId());
                diseaseDTO.setDiseaseName(disease.getDiseaseName());
                diseaseDTO.setDateDiagnosed(disease.getDateDiagnosed());
                diseaseDTO.setDateResolved(disease.getDateResolved());
                diseaseDTO.setPlaceOfTreatment(disease.getPlaceOfTreatment());
                diseaseDTO.setDescription(disease.getDescription());
                diseaseDTO.setDateOfAdmission(disease.getDateOfAdmission());
                diseaseDTO.setDateOfDischarge(disease.getDateOfDischarge());
                diseaseDTO.setStatus(disease.getStatus());
                diseases.add(diseaseDTO);
            }
            dto.setChronicDiseases(diseases);
        }

        // Convert infectious diseases
        if (healthProfile.getInfectiousDiseases() != null && !healthProfile.getInfectiousDiseases().isEmpty()) {
            List<InfectiousDiseasesDTO> diseases = new ArrayList<>();
            for (InfectiousDiseases disease : healthProfile.getInfectiousDiseases()) {
                InfectiousDiseasesDTO diseaseDTO = new InfectiousDiseasesDTO();
                diseaseDTO.setId(disease.getId());
                diseaseDTO.setDiseaseName(disease.getDiseaseName());
                diseaseDTO.setDateDiagnosed(disease.getDateDiagnosed());
                diseaseDTO.setDateResolved(disease.getDateResolved());
                diseaseDTO.setPlaceOfTreatment(disease.getPlaceOfTreatment());
                diseaseDTO.setDescription(disease.getDescription());
                diseaseDTO.setDateOfAdmission(disease.getDateOfAdmission());
                diseaseDTO.setDateOfDischarge(disease.getDateOfDischarge());
                diseaseDTO.setStatus(disease.getStatus());
                diseases.add(diseaseDTO);
            }
            dto.setInfectiousDiseases(diseases);
        }

        // Convert treatments
        if (healthProfile.getTreatments() != null && !healthProfile.getTreatments().isEmpty()) {
            List<TreatmentHistoryDTO> treatments = new ArrayList<>();
            for (TreatmentHistory treatment : healthProfile.getTreatments()) {
                TreatmentHistoryDTO treatmentDTO = new TreatmentHistoryDTO();
                treatmentDTO.setId(treatment.getId());
                treatmentDTO.setTreatmentType(treatment.getTreatmentType());
                treatmentDTO.setDescription(treatment.getDescription());
                treatmentDTO.setDoctorName(treatment.getDoctorName());
                treatmentDTO.setDateOfAdmission(treatment.getDateOfAdmission());
                treatmentDTO.setDateOfDischarge(treatment.getDateOfDischarge());
                treatmentDTO.setPlaceOfTreatment(treatment.getPlaceOfTreatment());
                treatmentDTO.setStatus(treatment.getStatus());
                treatments.add(treatmentDTO);
            }
            dto.setTreatments(treatments);
        }

        // Convert vision
        if (healthProfile.getVision() != null && !healthProfile.getVision().isEmpty()) {
            List<VisionDTO> visionList = new ArrayList<>();
            for (Vision vision : healthProfile.getVision()) {
                VisionDTO visionDTO = new VisionDTO();
                visionDTO.setId(vision.getId());
                visionDTO.setVisionLeft(vision.getVisionLeft());
                visionDTO.setVisionRight(vision.getVisionRight());
                visionDTO.setVisionLeftWithGlass(vision.getVisionLeftWithGlass());
                visionDTO.setVisionRightWithGlass(vision.getVisionRightWithGlass());
                visionDTO.setVisionDescription(vision.getVisionDescription());
                visionDTO.setDateOfExamination(vision.getDateOfExamination());
                visionList.add(visionDTO);
            }
            dto.setVision(visionList);
        }

        // Convert hearing
        if (healthProfile.getHearing() != null && !healthProfile.getHearing().isEmpty()) {
            List<HearingDTO> hearingList = new ArrayList<>();
            for (Hearing hearing : healthProfile.getHearing()) {
                HearingDTO hearingDTO = new HearingDTO();
                hearingDTO.setId(hearing.getId());
                hearingDTO.setLeftEar(hearing.getLeftEar());
                hearingDTO.setRightEar(hearing.getRightEar());
                hearingDTO.setDescription(hearing.getDescription());
                hearingDTO.setDateOfExamination(hearing.getDateOfExamination());
                hearingList.add(hearingDTO);
            }
            dto.setHearing(hearingList);
        }

        // Convert vaccination history
        if (healthProfile.getVaccinationHistory() != null && !healthProfile.getVaccinationHistory().isEmpty()) {
            List<VaccinationHistoryDTO> vaccinations = new ArrayList<>();
            for (VaccinationHistory vaccination : healthProfile.getVaccinationHistory()) {
                VaccinationHistoryDTO vaccinationDTO = new VaccinationHistoryDTO();
                vaccinationDTO.setId(vaccination.getId());
                vaccinationDTO.setVaccineName(vaccination.getVaccineName());
                vaccinationDTO.setDoseNumber(vaccination.getDoseNumber());
                vaccinationDTO.setManufacturer(vaccination.getManufacturer());
                vaccinationDTO.setDateOfVaccination(vaccination.getDateOfVaccination());
                vaccinationDTO.setPlaceOfVaccination(vaccination.getPlaceOfVaccination());
                vaccinationDTO.setAdministeredBy(vaccination.getAdministeredBy());
                vaccinationDTO.setNotes(vaccination.getNotes());
                vaccinationDTO.setStatus(vaccination.isStatus());
                if (vaccination.getVaccinationRule() != null) {
                    vaccinationDTO.setRuleId(vaccination.getVaccinationRule().getId());
                }
                vaccinations.add(vaccinationDTO);
            }
            dto.setVaccinationHistory(vaccinations);
        }

        return dto;
    }
    
    /**
     * Check if student has approved health profile
     */
    @Override
    public boolean hasApprovedHealthProfile(Long studentId) {
        // Check if student is disabled
        Student student = studentRepository.findById(studentId).orElse(null);
        if (student == null || student.isDisabled()) {
            return false;
        }
        
        return healthProfileRepository.existsByStudentStudentIDAndStatus(studentId, ProfileStatus.APPROVED);
    }
    
    /**
     * Get approved health profile by student ID
     */
    @Override
    public HealthProfileDTO getApprovedHealthProfileByStudentId(Long studentId) {
        // Check if student is disabled
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));
                
        if (student.isDisabled()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot access health profile of a disabled student");
        }
        
        HealthProfile healthProfile = healthProfileRepository
                .findByStudentStudentIDAndStatus(studentId, ProfileStatus.APPROVED)
                .orElse(null);
        
        return healthProfile != null ? convertToBasicDTO(healthProfile) : null;
    }
}

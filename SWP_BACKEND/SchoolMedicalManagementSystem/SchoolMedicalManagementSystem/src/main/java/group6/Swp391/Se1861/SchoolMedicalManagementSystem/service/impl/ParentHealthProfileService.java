package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.impl;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.*;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.exception.BadRequestException;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.exception.ForbiddenAccessException;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.exception.ResourceNotFoundException;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.*;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.ProfileStatus;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.*;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.INotificationService;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IParentHealthProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ParentHealthProfileService implements IParentHealthProfileService {

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
    private VaccinationRuleRepository vaccinationRuleRepository;

    @Autowired
    private INotificationService notificationService;

    /**
     * Create a health profile for a child by a parent
     * @param parentId ID of the parent user
     * @param healthProfileDTO DTO containing health profile data
     * @return the created health profile
     */
    @Override
    public HealthProfileDTO createHealthProfile(Long parentId, HealthProfileDTO healthProfileDTO) {
        // Validate required fields
        if (healthProfileDTO.getStudentId() == null) {
            throw new BadRequestException("Student ID is required and cannot be null");
        }

        // Validate parent exists
        User parent = userRepository.findById(parentId)
                .orElseThrow(() -> new ResourceNotFoundException("Parent not found"));

        // Check if the user has PARENT role
        if (!parent.getRole().getRoleName().equals("PARENT")) {
            throw new ForbiddenAccessException("Only parents can create health profiles for students");
        }

        // Validate student exists
        Student student = studentRepository.findById(healthProfileDTO.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        // Validate parent is related to student        
        if (!isParentRelatedToStudent(parent, student)) {
            throw new ForbiddenAccessException("Parent is not associated with this student");
        }        // Check if student already has a health profile
        Optional<HealthProfile> existingProfile = healthProfileRepository.findSingleByStudentStudentIDAndParentId(
            healthProfileDTO.getStudentId(), parentId);

        if (existingProfile.isPresent()) {
            HealthProfile profile = existingProfile.get();
            if (profile.getStatus() == ProfileStatus.PENDING) {
                throw new BadRequestException("Cannot create new profile when a pending profile exists. Please wait for review or edit the existing pending profile.");
            }
            // If there's an approved profile, we can't create another one
            throw new BadRequestException("Student already has a health profile. You can update the existing profile instead.");
        }

        // Create health profile
        HealthProfile healthProfile = new HealthProfile();
        healthProfile.setWeight(healthProfileDTO.getWeight());
        healthProfile.setHeight(healthProfileDTO.getHeight());
        healthProfile.setCreatedAt(LocalDate.now());
        healthProfile.setUpdatedAt(LocalDate.now());
        healthProfile.setBloodType(healthProfileDTO.getBloodType());
        healthProfile.setStatus(ProfileStatus.PENDING);
        healthProfile.setNote(healthProfileDTO.getNote());
        healthProfile.setStudent(student);
        healthProfile.setParent(parent);

        // Save health profile
        HealthProfile savedProfile = healthProfileRepository.save(healthProfile);

        // Create and save allergies if provided
        if (healthProfileDTO.getAllergies() != null) {
            for (AllergiesDTO allergyDTO : healthProfileDTO.getAllergies()) {
                Allergies allergy = new Allergies();
                allergy.setAllergyType(allergyDTO.getAllergyType());
                allergy.setDescription(allergyDTO.getDescription());
                allergy.setStatus(allergyDTO.getStatus());
                allergy.setOnsetDate(allergyDTO.getOnsetDate());
                allergy.setHealthProfile(savedProfile);
                allergiesRepository.save(allergy);
            }
        }

        // Create and save chronic diseases if provided
        if (healthProfileDTO.getChronicDiseases() != null) {
            for (ChronicDiseasesDTO diseaseDTO : healthProfileDTO.getChronicDiseases()) {
                ChronicDiseases disease = new ChronicDiseases();
                disease.setDiseaseName(diseaseDTO.getDiseaseName());
                disease.setDateDiagnosed(diseaseDTO.getDateDiagnosed());
                disease.setDateResolved(diseaseDTO.getDateResolved());
                disease.setPlaceOfTreatment(diseaseDTO.getPlaceOfTreatment());
                disease.setDescription(diseaseDTO.getDescription());
                disease.setDateOfAdmission(diseaseDTO.getDateOfAdmission());
                disease.setDateOfDischarge(diseaseDTO.getDateOfDischarge());
                disease.setStatus(diseaseDTO.getStatus());
                disease.setHealthProfile(savedProfile);
                chronicDiseasesRepository.save(disease);
            }
        }

        // Create and save infectious diseases if provided
        if (healthProfileDTO.getInfectiousDiseases() != null) {
            for (InfectiousDiseasesDTO diseaseDTO : healthProfileDTO.getInfectiousDiseases()) {
                InfectiousDiseases disease = new InfectiousDiseases();
                disease.setDiseaseName(diseaseDTO.getDiseaseName());
                disease.setDateDiagnosed(diseaseDTO.getDateDiagnosed());
                disease.setDateResolved(diseaseDTO.getDateResolved());
                disease.setPlaceOfTreatment(diseaseDTO.getPlaceOfTreatment());
                disease.setDescription(diseaseDTO.getDescription());
                disease.setDateOfAdmission(diseaseDTO.getDateOfAdmission());
                disease.setDateOfDischarge(diseaseDTO.getDateOfDischarge());
                disease.setStatus(diseaseDTO.getStatus());
                disease.setHealthProfile(savedProfile);
                infectiousDiseasesRepository.save(disease);
            }
        }

        // Create and save treatment history if provided
        if (healthProfileDTO.getTreatments() != null) {
            for (TreatmentHistoryDTO treatmentDTO : healthProfileDTO.getTreatments()) {
                TreatmentHistory treatment = new TreatmentHistory();
                treatment.setTreatmentType(treatmentDTO.getTreatmentType());
                treatment.setDescription(treatmentDTO.getDescription());
                treatment.setDoctorName(treatmentDTO.getDoctorName());
                treatment.setDateOfAdmission(treatmentDTO.getDateOfAdmission());
                treatment.setDateOfDischarge(treatmentDTO.getDateOfDischarge());
                treatment.setPlaceOfTreatment(treatmentDTO.getPlaceOfTreatment());
                treatment.setStatus(treatmentDTO.getStatus());
                treatment.setHealthProfile(savedProfile);
                treatmentHistoryRepository.save(treatment);
            }
        }

        // Create and save vision records if provided
        if (healthProfileDTO.getVision() != null) {
            for (VisionDTO visionDTO : healthProfileDTO.getVision()) {
                Vision vision = new Vision();
                vision.setVisionLeft(visionDTO.getVisionLeft());
                vision.setVisionRight(visionDTO.getVisionRight());
                vision.setVisionLeftWithGlass(visionDTO.getVisionLeftWithGlass());
                vision.setVisionRightWithGlass(visionDTO.getVisionRightWithGlass());
                vision.setVisionDescription(visionDTO.getVisionDescription());
                vision.setDateOfExamination(visionDTO.getDateOfExamination());
                vision.setHealthProfile(savedProfile);
                visionRepository.save(vision);
            }
        }

        // Create and save hearing records if provided
        if (healthProfileDTO.getHearing() != null) {
            for (HearingDTO hearingDTO : healthProfileDTO.getHearing()) {
                Hearing hearing = new Hearing();
                hearing.setLeftEar(hearingDTO.getLeftEar());
                hearing.setRightEar(hearingDTO.getRightEar());
                hearing.setDescription(hearingDTO.getDescription());
                hearing.setDateOfExamination(hearingDTO.getDateOfExamination());
                hearing.setHealthProfile(savedProfile);
                hearingRepository.save(hearing);
            }
        }        // Create and save vaccination history if provided
        if (healthProfileDTO.getVaccinationHistory() != null) {
            for (VaccinationHistoryDTO vaccinationDTO : healthProfileDTO.getVaccinationHistory()) {
                VaccinationHistory vaccination = new VaccinationHistory();
                vaccination.setVaccineName(vaccinationDTO.getVaccineName());
                vaccination.setDoseNumber(vaccinationDTO.getDoseNumber());
                vaccination.setManufacturer(vaccinationDTO.getManufacturer());
                vaccination.setDateOfVaccination(vaccinationDTO.getDateOfVaccination());
                vaccination.setPlaceOfVaccination(vaccinationDTO.getPlaceOfVaccination());
                vaccination.setAdministeredBy(vaccinationDTO.getAdministeredBy());
                vaccination.setNotes(vaccinationDTO.getNotes());
                vaccination.setStatus(vaccinationDTO.isStatus());
                vaccination.setSource(VaccinationHistory.VaccinationSource.PARENT_REPORTED);
                vaccination.setHealthProfile(savedProfile);

                // Set vaccination rule if provided
                if (vaccinationDTO.getRuleId() != null) {
                    VaccinationRule rule = vaccinationRuleRepository.findById(vaccinationDTO.getRuleId())
                            .orElse(null);
                    vaccination.setVaccinationRule(rule);
                }

                vaccinationHistoryRepository.save(vaccination);
            }
        }

        // Send notification to all school nurses
        List<User> schoolNurses = userRepository.findByRole_RoleName("SCHOOLNURSE");
        if (!schoolNurses.isEmpty()) {
            String title = "Hồ sơ sức khỏe mới đã được tạo";
            String message = "Phụ huynh " + parent.getFullName() +
                    " đã tạo hồ sơ sức khỏe mới cho học sinh " + 
                    student.getFullName() + " "  +
                    ". Vui lòng xem xét và phê duyệt.";

            for (User nurse : schoolNurses) {
                notificationService.createHealthProfileNotification(
                    savedProfile,
                    nurse,
                    "HEALTH_PROFILE_CREATED",
                    title,
                    message
                );
            }
        }

        // Return the created health profile as DTO
        healthProfileDTO.setId(savedProfile.getId());
        healthProfileDTO.setCreatedAt(savedProfile.getCreatedAt());
        healthProfileDTO.setUpdatedAt(savedProfile.getUpdatedAt());
        healthProfileDTO.setStatus(savedProfile.getStatus());
        healthProfileDTO.setParentId(parent.getId());

        return healthProfileDTO;
    }

    /**
     * Get health profile by ID, ensuring the parent has access to it
     * @param parentId ID of the parent user
     * @param profileId ID of the health profile
     * @return the health profile data
     */
    @Override
    public HealthProfileDTO getHealthProfileById(Long parentId, Long profileId) {
        // Validate parent exists
        User parent = userRepository.findById(parentId)
                .orElseThrow(() -> new ResourceNotFoundException("Parent not found"));

        // Check if the user has PARENT role
        if (!parent.getRole().getRoleName().equals("PARENT")) {
            throw new ForbiddenAccessException("Only parents can access health profiles");
        }

        // Get health profile
        HealthProfile healthProfile = healthProfileRepository.findById(profileId)
                .orElseThrow(() -> new ResourceNotFoundException("Health profile not found"));

        // Validate parent is related to student
        if (!isParentRelatedToStudent(parent, healthProfile.getStudent())) {
            throw new ForbiddenAccessException("Parent is not associated with this student");
        }

        // Convert to DTO
        return convertToDTO(healthProfile);
    }

    /**
     * Get health profile by student ID, ensuring the parent has access to it
     * @param parentId ID of the parent user
     * @param studentId ID of the student
     * @return single health profile for the student
     */
    @Override
    public HealthProfileDTO getHealthProfileByStudentId(Long parentId, Long studentId) {
        // Validate parent exists
        User parent = userRepository.findById(parentId)
                .orElseThrow(() -> new ResourceNotFoundException("Parent not found"));

        // Check if the user has PARENT role
        if (!parent.getRole().getRoleName().equals("PARENT")) {
            throw new ForbiddenAccessException("Only parents can access health profiles");
        }

        // Validate student exists
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        // Validate parent is related to student
        if (!isParentRelatedToStudent(parent, student)) {
            throw new ForbiddenAccessException("Parent is not associated with this student");
        }

        // Get the single health profile for this student
        Optional<HealthProfile> healthProfileOpt = healthProfileRepository.findSingleByStudentStudentIDAndParentId(studentId, parentId);

        // Return single profile or null
        if (healthProfileOpt.isPresent()) {
            return convertToDetailedDTO(healthProfileOpt.get());
        } else {
            return null;
        }
    }

    /**
     * Get approved health profile by student ID, ensuring the parent has access to it
     * @param parentId ID of the parent user
     * @param studentId ID of the student
     * @return single approved health profile for the student
     */
    @Override
    public HealthProfileDTO getApprovedHealthProfileByStudentId(Long parentId, Long studentId) {
        // Validate parent exists
        User parent = userRepository.findById(parentId)
                .orElseThrow(() -> new ResourceNotFoundException("Parent not found"));

        // Check if the user has PARENT role
        if (!parent.getRole().getRoleName().equals("PARENT")) {
            throw new ForbiddenAccessException("Only parents can access health profiles");
        }

        // Validate student exists
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        // Validate parent is related to student
        if (!isParentRelatedToStudent(parent, student)) {
            throw new ForbiddenAccessException("Parent is not associated with this student");
        }

        // Get the single health profile for this student  
        Optional<HealthProfile> healthProfileOpt = healthProfileRepository.findSingleByStudentStudentIDAndParentId(studentId, parentId);

        // Check if profile exists and is approved
        if (healthProfileOpt.isPresent() && healthProfileOpt.get().getStatus() == ProfileStatus.APPROVED) {
            return convertToDetailedDTO(healthProfileOpt.get());
        } else {
            return null;
        }
    }

    /**
     * Update a health profile
     * @param parentId ID of the parent user
     * @param profileId ID of the health profile
     * @param healthProfileDTO updated health profile data
     * @return updated health profile
     */
    @Override
    public HealthProfileDTO updateHealthProfile(Long parentId, Long profileId, HealthProfileDTO healthProfileDTO) {
        // Validate parent exists
        User parent = userRepository.findById(parentId)
                .orElseThrow(() -> new ResourceNotFoundException("Parent not found"));
        // Check if the user has PARENT role
        if (!parent.getRole().getRoleName().equals("PARENT")) {
            throw new ForbiddenAccessException("Only parents can update health profiles");
        }

        // Get health profile
        HealthProfile healthProfile = healthProfileRepository.findById(profileId)
                .orElseThrow(() -> new ResourceNotFoundException("Health profile not found"));

        // Validate parent is related to student
        if (!isParentRelatedToStudent(parent, healthProfile.getStudent())) {
            throw new ForbiddenAccessException("Parent is not associated with this student");
        }

        // Check if profile can be updated
        // Allow updating profiles with PENDING, APPROVED, and REJECTED status
        if (healthProfile.getStatus() != ProfileStatus.PENDING && 
            healthProfile.getStatus() != ProfileStatus.APPROVED && 
            healthProfile.getStatus() != ProfileStatus.REJECTED) {
            throw new BadRequestException("Profile status does not allow updates");
        }

        // Update basic profile information
        healthProfile.setWeight(healthProfileDTO.getWeight());
        healthProfile.setHeight(healthProfileDTO.getHeight());
        healthProfile.setBloodType(healthProfileDTO.getBloodType());
        healthProfile.setNote(healthProfileDTO.getNote());
        healthProfile.setUpdatedAt(LocalDate.now());

        User nurse = null;
        // If the profile was APPROVED or REJECTED, change it back to PENDING when updated
        if (healthProfile.getStatus() == ProfileStatus.APPROVED || 
            healthProfile.getStatus() == ProfileStatus.REJECTED) {
            healthProfile.setStatus(ProfileStatus.PENDING);
            // Clear nurse note since it will need re-review
            nurse = healthProfile.getNurse();
            healthProfile.setNurseNote(null);
            healthProfile.setNurse(null);
        }

        // Save updated profile
        HealthProfile updatedProfile = healthProfileRepository.save(healthProfile);

        // Update allergies if provided
        if (healthProfileDTO.getAllergies() != null) {
            Set<Allergies> existingAllergies = healthProfile.getAllergies() != null ? 
                new HashSet<>(healthProfile.getAllergies()) : new HashSet<>();
            Set<Allergies> updatedAllergies = new HashSet<>(existingAllergies);

            // Process each allergy from DTO
            for (AllergiesDTO allergyDTO : healthProfileDTO.getAllergies()) {
                // Check if this is a new allergy (no ID) or doesn't exist in current allergies
                boolean isNewAllergy = allergyDTO.getId() == null || 
                    existingAllergies.stream().noneMatch(existing -> 
                        existing.getId().equals(allergyDTO.getId()) ||
                        (existing.getAllergyType().equalsIgnoreCase(allergyDTO.getAllergyType()) &&
                         existing.getOnsetDate().equals(allergyDTO.getOnsetDate()))
                    );

                if (isNewAllergy) {
                    // Create new allergy
                    Allergies newAllergy = new Allergies();
                    newAllergy.setAllergyType(allergyDTO.getAllergyType());
                    newAllergy.setDescription(allergyDTO.getDescription());
                    newAllergy.setStatus(allergyDTO.getStatus());
                    newAllergy.setOnsetDate(allergyDTO.getOnsetDate());
                    newAllergy.setHealthProfile(updatedProfile);

                    // Save new allergy
                    Allergies savedAllergy = allergiesRepository.save(newAllergy);
                    updatedAllergies.add(savedAllergy);
                } else {
                    // Update existing allergy if needed
                    Allergies existingAllergy = existingAllergies.stream()
                        .filter(existing -> existing.getId().equals(allergyDTO.getId()) ||
                                (existing.getAllergyType().equalsIgnoreCase(allergyDTO.getAllergyType()) &&
                                 existing.getOnsetDate().equals(allergyDTO.getOnsetDate())))
                        .findFirst().orElse(null);

                    if (existingAllergy != null) {
                        // Update fields if they have changed
                        existingAllergy.setDescription(allergyDTO.getDescription());
                        existingAllergy.setStatus(allergyDTO.getStatus());
                        allergiesRepository.save(existingAllergy);
                    }
                }
            }

            // Update the bidirectional relationship
            updatedProfile.setAllergies(updatedAllergies);
            // Save the updated profile with the allergies
            updatedProfile = healthProfileRepository.save(updatedProfile);
        }

        // Update chronic diseases if provided
        if (healthProfileDTO.getChronicDiseases() != null) {
            Set<ChronicDiseases> existingDiseases = healthProfile.getChronicDiseases() != null ? 
                new HashSet<>(healthProfile.getChronicDiseases()) : new HashSet<>();
            Set<ChronicDiseases> updatedDiseases = new HashSet<>(existingDiseases);

            // Process each chronic disease from DTO
            for (ChronicDiseasesDTO diseaseDTO : healthProfileDTO.getChronicDiseases()) {
                // Check if this is a new chronic disease (no ID) or doesn't exist in current diseases
                boolean isNewDisease = diseaseDTO.getId() == null || 
                    existingDiseases.stream().noneMatch(existing -> 
                        existing.getId().equals(diseaseDTO.getId()) ||
                        (existing.getDiseaseName().equalsIgnoreCase(diseaseDTO.getDiseaseName()) &&
                         existing.getDateDiagnosed().equals(diseaseDTO.getDateDiagnosed()))
                    );

                if (isNewDisease) {
                    // Create new chronic disease
                    ChronicDiseases newDisease = new ChronicDiseases();
                    newDisease.setDiseaseName(diseaseDTO.getDiseaseName());
                    newDisease.setDateDiagnosed(diseaseDTO.getDateDiagnosed());
                    newDisease.setDateResolved(diseaseDTO.getDateResolved());
                    newDisease.setPlaceOfTreatment(diseaseDTO.getPlaceOfTreatment());
                    newDisease.setDescription(diseaseDTO.getDescription());
                    newDisease.setDateOfAdmission(diseaseDTO.getDateOfAdmission());
                    newDisease.setDateOfDischarge(diseaseDTO.getDateOfDischarge());
                    newDisease.setStatus(diseaseDTO.getStatus());
                    newDisease.setHealthProfile(updatedProfile);

                    // Save new chronic disease
                    ChronicDiseases savedDisease = chronicDiseasesRepository.save(newDisease);
                    updatedDiseases.add(savedDisease);
                } else {
                    // Update existing chronic disease if needed
                    ChronicDiseases existingDisease = existingDiseases.stream()
                        .filter(existing -> existing.getId().equals(diseaseDTO.getId()) ||
                                (existing.getDiseaseName().equalsIgnoreCase(diseaseDTO.getDiseaseName()) &&
                                 existing.getDateDiagnosed().equals(diseaseDTO.getDateDiagnosed())))
                        .findFirst().orElse(null);
                      if (existingDisease != null) {
                        // Update fields if they have changed
                        existingDisease.setDateDiagnosed(diseaseDTO.getDateDiagnosed());
                        existingDisease.setDateResolved(diseaseDTO.getDateResolved());
                        existingDisease.setPlaceOfTreatment(diseaseDTO.getPlaceOfTreatment());
                        existingDisease.setDescription(diseaseDTO.getDescription());
                        existingDisease.setDateOfAdmission(diseaseDTO.getDateOfAdmission());
                        existingDisease.setDateOfDischarge(diseaseDTO.getDateOfDischarge());
                        existingDisease.setStatus(diseaseDTO.getStatus());
                        chronicDiseasesRepository.save(existingDisease);
                    }
                }
            }

            // Update the bidirectional relationship
            updatedProfile.setChronicDiseases(updatedDiseases);
            // Save the updated profile with the chronic diseases
            updatedProfile = healthProfileRepository.save(updatedProfile);
        }

        // Update infectious diseases if provided
        if (healthProfileDTO.getInfectiousDiseases() != null) {
            List<InfectiousDiseases> existingDiseases = healthProfile.getInfectiousDiseases() != null ? 
                new ArrayList<>(healthProfile.getInfectiousDiseases()) : new ArrayList<>();
            List<InfectiousDiseases> updatedDiseases = new ArrayList<>(existingDiseases);

            for (InfectiousDiseasesDTO diseaseDTO : healthProfileDTO.getInfectiousDiseases()) {
                // Check if this is a new infectious disease (no ID or doesn't match existing)
                if (diseaseDTO.getId() == null || existingDiseases.stream()
                    .noneMatch(existing -> existing.getId().equals(diseaseDTO.getId()) ||
                              (existing.getDiseaseName().equalsIgnoreCase(diseaseDTO.getDiseaseName()) &&
                               existing.getDateDiagnosed().equals(diseaseDTO.getDateDiagnosed())))) {

                    // Create new infectious disease
                    InfectiousDiseases newDisease = new InfectiousDiseases();
                    newDisease.setDiseaseName(diseaseDTO.getDiseaseName());
                    newDisease.setDateDiagnosed(diseaseDTO.getDateDiagnosed());
                    newDisease.setDateResolved(diseaseDTO.getDateResolved());
                    newDisease.setPlaceOfTreatment(diseaseDTO.getPlaceOfTreatment());
                    newDisease.setDescription(diseaseDTO.getDescription());
                    newDisease.setDateOfAdmission(diseaseDTO.getDateOfAdmission());
                    newDisease.setDateOfDischarge(diseaseDTO.getDateOfDischarge());
                    newDisease.setStatus(diseaseDTO.getStatus());
                    newDisease.setHealthProfile(updatedProfile);

                    // Save new infectious disease
                    InfectiousDiseases savedDisease = infectiousDiseasesRepository.save(newDisease);
                    updatedDiseases.add(savedDisease);
                } else {
                    // Update existing infectious disease if needed
                    InfectiousDiseases existingDisease = existingDiseases.stream()
                        .filter(existing -> existing.getId().equals(diseaseDTO.getId()) ||
                                (existing.getDiseaseName().equalsIgnoreCase(diseaseDTO.getDiseaseName()) &&
                                 existing.getDateDiagnosed().equals(diseaseDTO.getDateDiagnosed())))
                        .findFirst().orElse(null);
                      if (existingDisease != null) {
                        // Update fields if they have changed
                        existingDisease.setDateDiagnosed(diseaseDTO.getDateDiagnosed());
                        existingDisease.setDateResolved(diseaseDTO.getDateResolved());
                        existingDisease.setPlaceOfTreatment(diseaseDTO.getPlaceOfTreatment());
                        existingDisease.setDescription(diseaseDTO.getDescription());
                        existingDisease.setDateOfAdmission(diseaseDTO.getDateOfAdmission());
                        existingDisease.setDateOfDischarge(diseaseDTO.getDateOfDischarge());
                        existingDisease.setStatus(diseaseDTO.getStatus());
                        infectiousDiseasesRepository.save(existingDisease);
                    }
                }
            }

            // Update the bidirectional relationship
            updatedProfile.setInfectiousDiseases(new HashSet<>(updatedDiseases));
            // Save the updated profile with the infectious diseases
            updatedProfile = healthProfileRepository.save(updatedProfile);
        }

        // Update treatment history if provided
        if (healthProfileDTO.getTreatments() != null) {
            List<TreatmentHistory> existingTreatments = healthProfile.getTreatments() != null ? 
                new ArrayList<>(healthProfile.getTreatments()) : new ArrayList<>();
            List<TreatmentHistory> updatedTreatments = new ArrayList<>(existingTreatments);

            for (TreatmentHistoryDTO treatmentDTO : healthProfileDTO.getTreatments()) {
                // Check if this is a new treatment (no ID or doesn't match existing)
                if (treatmentDTO.getId() == null || existingTreatments.stream()
                    .noneMatch(existing -> existing.getId().equals(treatmentDTO.getId()) ||
                              (existing.getTreatmentType().equalsIgnoreCase(treatmentDTO.getTreatmentType()) &&
                               existing.getDateOfAdmission().equals(treatmentDTO.getDateOfAdmission())))) {

                    // Create new treatment
                    TreatmentHistory newTreatment = new TreatmentHistory();
                    newTreatment.setTreatmentType(treatmentDTO.getTreatmentType());
                    newTreatment.setDescription(treatmentDTO.getDescription());
                    newTreatment.setDoctorName(treatmentDTO.getDoctorName());
                    newTreatment.setDateOfAdmission(treatmentDTO.getDateOfAdmission());
                    newTreatment.setDateOfDischarge(treatmentDTO.getDateOfDischarge());
                    newTreatment.setPlaceOfTreatment(treatmentDTO.getPlaceOfTreatment());
                    newTreatment.setStatus(treatmentDTO.getStatus());
                    newTreatment.setHealthProfile(updatedProfile);

                    // Save new treatment
                    TreatmentHistory savedTreatment = treatmentHistoryRepository.save(newTreatment);
                    updatedTreatments.add(savedTreatment);
                } else {
                    // Update existing treatment if needed
                    TreatmentHistory existingTreatment = existingTreatments.stream()
                        .filter(existing -> existing.getId().equals(treatmentDTO.getId()) ||
                                (existing.getTreatmentType().equalsIgnoreCase(treatmentDTO.getTreatmentType()) &&
                                 existing.getDateOfAdmission().equals(treatmentDTO.getDateOfAdmission())))
                        .findFirst().orElse(null);
                      if (existingTreatment != null) {
                        // Update fields if they have changed
                        existingTreatment.setDescription(treatmentDTO.getDescription());
                        existingTreatment.setDoctorName(treatmentDTO.getDoctorName());
                        existingTreatment.setDateOfAdmission(treatmentDTO.getDateOfAdmission());
                        existingTreatment.setDateOfDischarge(treatmentDTO.getDateOfDischarge());
                        existingTreatment.setPlaceOfTreatment(treatmentDTO.getPlaceOfTreatment());
                        existingTreatment.setStatus(treatmentDTO.getStatus());
                        treatmentHistoryRepository.save(existingTreatment);
                    }
                }
            }

            // Update the bidirectional relationship
            updatedProfile.setTreatments(new HashSet<>(updatedTreatments));
            // Save the updated profile with the treatments
            updatedProfile = healthProfileRepository.save(updatedProfile);
        }

        // Update vision records if provided
        if (healthProfileDTO.getVision() != null) {
            List<Vision> existingVision = healthProfile.getVision() != null ? 
                new ArrayList<>(healthProfile.getVision()) : new ArrayList<>();
            List<Vision> updatedVision = new ArrayList<>(existingVision);

            for (VisionDTO visionDTO : healthProfileDTO.getVision()) {
                // Check if this is a new vision record (no ID or doesn't match existing)
                if (visionDTO.getId() == null || existingVision.stream()
                    .noneMatch(existing -> existing.getId().equals(visionDTO.getId()) ||
                              existing.getDateOfExamination().equals(visionDTO.getDateOfExamination()))) {

                    // Create new vision record
                    Vision newVision = new Vision();
                    newVision.setVisionLeft(visionDTO.getVisionLeft());
                    newVision.setVisionRight(visionDTO.getVisionRight());
                    newVision.setVisionLeftWithGlass(visionDTO.getVisionLeftWithGlass());
                    newVision.setVisionRightWithGlass(visionDTO.getVisionRightWithGlass());
                    newVision.setVisionDescription(visionDTO.getVisionDescription());
                    newVision.setDateOfExamination(visionDTO.getDateOfExamination());
                    newVision.setHealthProfile(updatedProfile);

                    // Save new vision record
                    Vision savedVision = visionRepository.save(newVision);
                    updatedVision.add(savedVision);
                } else {
                    // Update existing vision record if needed
                    Vision existingVisionRecord = existingVision.stream()
                        .filter(existing -> existing.getId().equals(visionDTO.getId()) ||
                                existing.getDateOfExamination().equals(visionDTO.getDateOfExamination()))
                        .findFirst().orElse(null);
                      if (existingVisionRecord != null) {
                        // Update fields if they have changed
                        existingVisionRecord.setVisionLeft(visionDTO.getVisionLeft());
                        existingVisionRecord.setVisionRight(visionDTO.getVisionRight());
                        existingVisionRecord.setVisionLeftWithGlass(visionDTO.getVisionLeftWithGlass());
                        existingVisionRecord.setVisionRightWithGlass(visionDTO.getVisionRightWithGlass());
                        existingVisionRecord.setVisionDescription(visionDTO.getVisionDescription());
                        existingVisionRecord.setDateOfExamination(visionDTO.getDateOfExamination());
                        visionRepository.save(existingVisionRecord);
                    }
                }
            }

            // Update the bidirectional relationship
            updatedProfile.setVision(new HashSet<>(updatedVision));
            // Save the updated profile with the vision records
            updatedProfile = healthProfileRepository.save(updatedProfile);
        }

        // Update hearing records if provided
        if (healthProfileDTO.getHearing() != null) {
            List<Hearing> existingHearing = healthProfile.getHearing() != null ? 
                new ArrayList<>(healthProfile.getHearing()) : new ArrayList<>();
            List<Hearing> updatedHearing = new ArrayList<>(existingHearing);

            for (HearingDTO hearingDTO : healthProfileDTO.getHearing()) {
                // Check if this is a new hearing record (no ID or doesn't match existing)
                if (hearingDTO.getId() == null || existingHearing.stream()
                    .noneMatch(existing -> existing.getId().equals(hearingDTO.getId()) ||
                              existing.getDateOfExamination().equals(hearingDTO.getDateOfExamination()))) {

                    // Create new hearing record
                    Hearing newHearing = new Hearing();
                    newHearing.setLeftEar(hearingDTO.getLeftEar());
                    newHearing.setRightEar(hearingDTO.getRightEar());
                    newHearing.setDescription(hearingDTO.getDescription());
                    newHearing.setDateOfExamination(hearingDTO.getDateOfExamination());
                    newHearing.setHealthProfile(updatedProfile);

                    // Save new hearing record
                    Hearing savedHearing = hearingRepository.save(newHearing);
                    updatedHearing.add(savedHearing);
                } else {
                    // Update existing hearing record if needed
                    Hearing existingHearingRecord = existingHearing.stream()
                        .filter(existing -> existing.getId().equals(hearingDTO.getId()) ||
                                existing.getDateOfExamination().equals(hearingDTO.getDateOfExamination()))
                        .findFirst().orElse(null);
                      if (existingHearingRecord != null) {
                        // Update fields if they have changed
                        existingHearingRecord.setLeftEar(hearingDTO.getLeftEar());
                        existingHearingRecord.setRightEar(hearingDTO.getRightEar());
                        existingHearingRecord.setDescription(hearingDTO.getDescription());
                        existingHearingRecord.setDateOfExamination(hearingDTO.getDateOfExamination());
                        hearingRepository.save(existingHearingRecord);
                    }
                }
            }

            // Update the bidirectional relationship
            updatedProfile.setHearing(new HashSet<>(updatedHearing));
            // Save the updated profile with the hearing records
            updatedProfile = healthProfileRepository.save(updatedProfile);
        }

        // Update vaccination history if provided
        if (healthProfileDTO.getVaccinationHistory() != null) {
            List<VaccinationHistory> existingVaccinations = healthProfile.getVaccinationHistory() != null ? 
                new ArrayList<>(healthProfile.getVaccinationHistory()) : new ArrayList<>();
            List<VaccinationHistory> updatedVaccinations = new ArrayList<>(existingVaccinations);

            for (VaccinationHistoryDTO vaccinationDTO : healthProfileDTO.getVaccinationHistory()) {
                // Check if this is a new vaccination record (no ID or doesn't match existing)
                if (vaccinationDTO.getId() == null || existingVaccinations.stream()
                    .noneMatch(existing -> existing.getId().equals(vaccinationDTO.getId()) ||
                              (existing.getVaccineName().equalsIgnoreCase(vaccinationDTO.getVaccineName()) &&
                               existing.getDoseNumber() == vaccinationDTO.getDoseNumber() &&
                               existing.getDateOfVaccination().equals(vaccinationDTO.getDateOfVaccination())))) {
                      // Create new vaccination record
                    VaccinationHistory newVaccination = new VaccinationHistory();
                    newVaccination.setVaccineName(vaccinationDTO.getVaccineName());
                    newVaccination.setDoseNumber(vaccinationDTO.getDoseNumber());
                    newVaccination.setManufacturer(vaccinationDTO.getManufacturer());
                    newVaccination.setDateOfVaccination(vaccinationDTO.getDateOfVaccination());
                    newVaccination.setPlaceOfVaccination(vaccinationDTO.getPlaceOfVaccination());
                    newVaccination.setAdministeredBy(vaccinationDTO.getAdministeredBy());
                    newVaccination.setNotes(vaccinationDTO.getNotes());
                    newVaccination.setStatus(vaccinationDTO.isStatus());
                    newVaccination.setSource(VaccinationHistory.VaccinationSource.PARENT_REPORTED);
                    newVaccination.setHealthProfile(updatedProfile);

                    // Set vaccination rule if provided
                    if (vaccinationDTO.getRuleId() != null) {
                        VaccinationRule rule = vaccinationRuleRepository.findById(vaccinationDTO.getRuleId())
                                .orElse(null);
                        newVaccination.setVaccinationRule(rule);
                    }

                    // Save new vaccination record
                    VaccinationHistory savedVaccination = vaccinationHistoryRepository.save(newVaccination);
                    updatedVaccinations.add(savedVaccination);
                } else {
                    // Update existing vaccination record if needed
                    VaccinationHistory existingVaccination = existingVaccinations.stream()
                        .filter(existing -> existing.getId().equals(vaccinationDTO.getId()) ||
                                (existing.getVaccineName().equalsIgnoreCase(vaccinationDTO.getVaccineName()) &&
                                 existing.getDoseNumber() == vaccinationDTO.getDoseNumber() &&
                                 existing.getDateOfVaccination().equals(vaccinationDTO.getDateOfVaccination())))
                        .findFirst().orElse(null);                      if (existingVaccination != null) {
                        // Update fields if they have changed
                        existingVaccination.setManufacturer(vaccinationDTO.getManufacturer());
                        existingVaccination.setDateOfVaccination(vaccinationDTO.getDateOfVaccination());
                        existingVaccination.setPlaceOfVaccination(vaccinationDTO.getPlaceOfVaccination());
                        existingVaccination.setAdministeredBy(vaccinationDTO.getAdministeredBy());
                        existingVaccination.setNotes(vaccinationDTO.getNotes());
                        existingVaccination.setSource(VaccinationHistory.VaccinationSource.PARENT_REPORTED);
                        existingVaccination.setStatus(vaccinationDTO.isStatus());

                        // Update vaccination rule if provided
                        if (vaccinationDTO.getRuleId() != null) {
                            VaccinationRule rule = vaccinationRuleRepository.findById(vaccinationDTO.getRuleId())
                                    .orElse(null);
                            existingVaccination.setVaccinationRule(rule);
                        } else {
                            existingVaccination.setVaccinationRule(null);
                        }

                        vaccinationHistoryRepository.save(existingVaccination);
                    }
                }
            }

            // Update the bidirectional relationship
            updatedProfile.setVaccinationHistory(new HashSet<>(updatedVaccinations));
            // Save the updated profile with the vaccination history
            updatedProfile = healthProfileRepository.save(updatedProfile);
        }

        Student student = updatedProfile.getStudent();

        if (nurse != null) {
            String title = "Hồ sơ sức khỏe đã được cập nhật";
            String message = "Phụ huynh " + parent.getFullName() +
                    " đã cập nhật hồ sơ sức khỏe cho học sinh " +
                    student.getFullName() + " " +
                    ". Vui lòng xem xét và phê duyệt.";

            notificationService.createHealthProfileUpdateNotification(
                    updatedProfile,
                    nurse,
                    "HEALTH_PROFILE_UPDATED",
                    title,
                    message
            );
        }
        return convertToDetailedDTO(updatedProfile);
    }

    /**
     * Delete a health profile
     * @param parentId ID of the parent user
     * @param profileId ID of the health profile
     */
    @Override
    public void deleteHealthProfile(Long parentId, Long profileId) {
        // Validate parent exists
        User parent = userRepository.findById(parentId)
                .orElseThrow(() -> new ResourceNotFoundException("Parent not found"));

        // Check if the user has PARENT role
        if (!parent.getRole().getRoleName().equals("PARENT")) {
            throw new ForbiddenAccessException("Only parents can delete health profiles");
        }

        // Get health profile
        HealthProfile healthProfile = healthProfileRepository.findById(profileId)
                .orElseThrow(() -> new ResourceNotFoundException("Health profile not found"));

        // Validate parent is related to student
        if (!isParentRelatedToStudent(parent, healthProfile.getStudent())) {
            throw new ForbiddenAccessException("Parent is not associated with this student");
        }

        // Check if profile can be deleted (only PENDING profiles can be deleted)
        if (healthProfile.getStatus() != ProfileStatus.PENDING) {
            throw new BadRequestException("Only profiles with PENDING status can be deleted");
        }

        // Delete the health profile (cascade will handle related entities)
        healthProfileRepository.delete(healthProfile);
    }

    /**
     * Convert HealthProfile entity to DTO
     * @param healthProfile the health profile entity
     * @return the health profile DTO
     */
    @Override
    public HealthProfileDTO convertToDTO(HealthProfile healthProfile) {
        HealthProfileDTO dto = new HealthProfileDTO();
        dto.setId(healthProfile.getId());
        dto.setWeight(healthProfile.getWeight());
        dto.setHeight(healthProfile.getHeight());
        dto.setCreatedAt(healthProfile.getCreatedAt());
        dto.setUpdatedAt(healthProfile.getUpdatedAt());
        dto.setBloodType(healthProfile.getBloodType());
        dto.setStatus(healthProfile.getStatus());
        dto.setNote(healthProfile.getNote());
        dto.setNurseNote(healthProfile.getNurseNote());
        dto.setStudentId(healthProfile.getStudent().getStudentID());



        if (healthProfile.getNurse() != null) {
            dto.setNurseId(healthProfile.getNurse().getId());

        }

        if (healthProfile.getParent() != null) {
            dto.setParentId(healthProfile.getParent().getId());
        }

        return dto;
    }

    /**
     * Convert HealthProfile entity to detailed DTO with all related data
     * @param healthProfile the health profile entity
     * @return the detailed health profile DTO
     */
    @Override
    public HealthProfileDTO convertToDetailedDTO(HealthProfile healthProfile) {
        HealthProfileDTO dto = new HealthProfileDTO();
        dto.setId(healthProfile.getId());
        dto.setWeight(healthProfile.getWeight());
        dto.setHeight(healthProfile.getHeight());
        dto.setCreatedAt(healthProfile.getCreatedAt());
        dto.setUpdatedAt(healthProfile.getUpdatedAt());
        dto.setBloodType(healthProfile.getBloodType());
        dto.setStatus(healthProfile.getStatus());
        dto.setNote(healthProfile.getNote());
        dto.setNurseNote(healthProfile.getNurseNote());
        dto.setStudentId(healthProfile.getStudent().getStudentID());

        Map<String, Object> additionalFields = new HashMap<>();
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

        if (healthProfile.getParent() != null) {
            dto.setParentId(healthProfile.getParent().getId());
        }

        // Convert related entities to DTOs
        // Note: This is a simplified conversion. In a real implementation,
        // you might want to create proper DTOs for each related entity        // Convert allergies
        if (healthProfile.getAllergies() != null) {
            List<AllergiesDTO> allergiesDTOs = healthProfile.getAllergies().stream()
                    .map(allergy -> {
                        AllergiesDTO allergyDTO = new AllergiesDTO();
                        allergyDTO.setId(allergy.getId());
                        allergyDTO.setAllergyType(allergy.getAllergyType());
                        allergyDTO.setDescription(allergy.getDescription());
                        allergyDTO.setStatus(allergy.getStatus());
                        allergyDTO.setOnsetDate(allergy.getOnsetDate());
                        return allergyDTO;
                    })
                    .collect(Collectors.toList());
            dto.setAllergies(allergiesDTOs);
        }        // Convert chronic diseases
        if (healthProfile.getChronicDiseases() != null) {
            List<ChronicDiseasesDTO> chronicDiseasesDTOs = healthProfile.getChronicDiseases().stream()
                    .map(disease -> {
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
                        return diseaseDTO;
                    })
                    .collect(Collectors.toList());
            dto.setChronicDiseases(chronicDiseasesDTOs);
        }        // Convert infectious diseases
        if (healthProfile.getInfectiousDiseases() != null) {
            List<InfectiousDiseasesDTO> infectiousDiseasesDTOs = healthProfile.getInfectiousDiseases().stream()
                    .map(disease -> {
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
                        return diseaseDTO;
                    })
                    .collect(Collectors.toList());
            dto.setInfectiousDiseases(infectiousDiseasesDTOs);        }        // Convert treatment history
        if (healthProfile.getTreatments() != null) {
            List<TreatmentHistoryDTO> treatmentDTOs = healthProfile.getTreatments().stream()
                    .map(treatment -> {
                        TreatmentHistoryDTO treatmentDTO = new TreatmentHistoryDTO();
                        treatmentDTO.setId(treatment.getId());
                        treatmentDTO.setTreatmentType(treatment.getTreatmentType());
                        treatmentDTO.setDescription(treatment.getDescription());
                        treatmentDTO.setDoctorName(treatment.getDoctorName());
                        treatmentDTO.setDateOfAdmission(treatment.getDateOfAdmission());
                        treatmentDTO.setDateOfDischarge(treatment.getDateOfDischarge());
                        treatmentDTO.setPlaceOfTreatment(treatment.getPlaceOfTreatment());
                        treatmentDTO.setStatus(treatment.getStatus());
                        return treatmentDTO;
                    })
                    .collect(Collectors.toList());
            dto.setTreatments(treatmentDTOs);
        }        // Convert vision data
        if (healthProfile.getVision() != null) {
            List<VisionDTO> visionDTOs = healthProfile.getVision().stream()
                    .map(vision -> {
                        VisionDTO visionDTO = new VisionDTO();
                        visionDTO.setId(vision.getId());
                        visionDTO.setVisionLeft(vision.getVisionLeft());
                        visionDTO.setVisionRight(vision.getVisionRight());
                        visionDTO.setVisionLeftWithGlass(vision.getVisionLeftWithGlass());
                        visionDTO.setVisionRightWithGlass(vision.getVisionRightWithGlass());
                        visionDTO.setVisionDescription(vision.getVisionDescription());
                        visionDTO.setDateOfExamination(vision.getDateOfExamination());
                        return visionDTO;
                    })
                    .collect(Collectors.toList());
            dto.setVision(visionDTOs);
        }        // Convert hearing data
        if (healthProfile.getHearing() != null) {
            List<HearingDTO> hearingDTOs = healthProfile.getHearing().stream()
                    .map(hearing -> {
                        HearingDTO hearingDTO = new HearingDTO();
                        hearingDTO.setId(hearing.getId());
                        hearingDTO.setLeftEar(hearing.getLeftEar());
                        hearingDTO.setRightEar(hearing.getRightEar());
                        hearingDTO.setDescription(hearing.getDescription());
                        hearingDTO.setDateOfExamination(hearing.getDateOfExamination());
                        return hearingDTO;
                    })
                    .collect(Collectors.toList());
            dto.setHearing(hearingDTOs);
        }        // Convert vaccination history
        if (healthProfile.getVaccinationHistory() != null) {
            List<VaccinationHistoryDTO> vaccinationDTOs = healthProfile.getVaccinationHistory().stream()
                    .map(vaccination -> {
                        VaccinationHistoryDTO vaccinationDTO = new VaccinationHistoryDTO();
                        vaccinationDTO.setId(vaccination.getId());
                        vaccinationDTO.setVaccineName(vaccination.getVaccineName());
                        vaccinationDTO.setDoseNumber(vaccination.getDoseNumber());
                        vaccinationDTO.setManufacturer(vaccination.getManufacturer());
                        vaccinationDTO.setDateOfVaccination(vaccination.getDateOfVaccination());
                        vaccinationDTO.setPlaceOfVaccination(vaccination.getPlaceOfVaccination());
                        vaccinationDTO.setAdministeredBy(vaccination.getAdministeredBy());
                        vaccinationDTO.setNotes(vaccination.getNotes());
                        vaccinationDTO.setSource(vaccination.getSource() != null ? vaccination.getSource().name() : null);
                        vaccinationDTO.setStatus(vaccination.isStatus());

                        // Include vaccination rule ID if rule is associated
                        if (vaccination.getVaccinationRule() != null) {
                            vaccinationDTO.setRuleId(vaccination.getVaccinationRule().getId());
                        }

                        return vaccinationDTO;
                    })
                    .collect(Collectors.toList());
            dto.setVaccinationHistory(vaccinationDTOs);
        }

        return dto;
    }

    /**
     * Check if a parent is related to a student
     * @param parent The parent user
     * @param student The student
     * @return true if the parent is related to the student, false otherwise
     */
    private boolean isParentRelatedToStudent(User parent, Student student) {
        // Check if the parent is either the mother or father of the student
        return (student.getMother() != null && student.getMother().getId().equals(parent.getId())) ||
               (student.getFather() != null && student.getFather().getId().equals(parent.getId()));
    }

    /**
     * Check if a REJECTED profile was previously approved based on nurse notes
     * @param healthProfile The health profile to check
     * @return true if the profile was previously approved, false otherwise
     */
    private boolean wasProfilePreviouslyApproved(HealthProfile healthProfile) {
        if (healthProfile.getStatus() != ProfileStatus.REJECTED || healthProfile.getNurseNote() == null) {
            return false;
        }

        String nurseNote = healthProfile.getNurseNote().toLowerCase();
        return nurseNote.contains("đã được duyệt") ||
               nurseNote.contains("đã duyệt") ||
               nurseNote.contains("trước đó") ||
               nurseNote.contains("chỉnh sửa lại") ||
               nurseNote.contains("cập nhật lại") ||
               nurseNote.contains("previously approved") ||
               nurseNote.contains("was approved");
    }

    /**
     * Check if a health profile can be edited based on current status and history
     * @param parentId ID of the parent user
     * @param profileId ID of the health profile
     * @return true if the profile can be edited, false otherwise
     */
    public boolean canEditHealthProfile(Long parentId, Long profileId) {
        try {
            // Validate parent exists
            User parent = userRepository.findById(parentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Parent not found"));

            // Check if the user has PARENT role
            if (!parent.getRole().getRoleName().equals("PARENT")) {
                return false;
            }

            // Get health profile
            HealthProfile healthProfile = healthProfileRepository.findById(profileId)
                    .orElseThrow(() -> new ResourceNotFoundException("Health profile not found"));

            // Validate parent is related to student
            if (!isParentRelatedToStudent(parent, healthProfile.getStudent())) {
                return false;
            }

            // Check if profile can be edited based on status
            switch (healthProfile.getStatus()) {
                case PENDING:
                case APPROVED:
                    return true;
                case REJECTED:
                    return wasProfilePreviouslyApproved(healthProfile);
                default:
                    return false;
            }
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Check if a new health profile can be created for a student
     * @param parentId ID of the parent user  
     * @param studentId ID of the student
     * @return true if a new profile can be created, false otherwise
     */
    public boolean canCreateNewHealthProfile(Long parentId, Long studentId) {
        try {
            // Validate parent exists
            User parent = userRepository.findById(parentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Parent not found"));

            // Check if the user has PARENT role
            if (!parent.getRole().getRoleName().equals("PARENT")) {
                return false;
            }

            // Validate student exists
            Student student = studentRepository.findById(studentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

            // Validate parent is related to student
            if (!isParentRelatedToStudent(parent, student)) {
                return false;
            }

            // Check if student already has a health profile
            Optional<HealthProfile> existingProfile = healthProfileRepository.findSingleByStudentStudentIDAndParentId(studentId, parentId);

            if (existingProfile.isEmpty()) {
                return true; // No existing profile, can create new one
            }

            HealthProfile profile = existingProfile.get();
            
            // Cannot create if there's an APPROVED profile (one-to-one relationship allows only one)
            if (profile.getStatus() == ProfileStatus.APPROVED) {
                return false;
            }

            // Cannot create if there's a PENDING profile
            if (profile.getStatus() == ProfileStatus.PENDING) {
                return false;
            }

            // Cannot create if there's a REJECTED profile that was previously approved
            if (profile.getStatus() == ProfileStatus.REJECTED && wasProfilePreviouslyApproved(profile)) {
                return false;
            }

            // Can create new profile (only for first-time rejected profiles or when no profile exists)
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}

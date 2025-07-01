package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.impl;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.*;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.FormStatus;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.HealthCheckCategory;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.ProfileStatus;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.ResultStatus;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.*;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IHealthCheckResultService;
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
public class HealthCheckResultService implements IHealthCheckResultService {

    private final HealthCheckResultRepository resultRepository;
    private final HealthCheckFormRepository formRepository;
    private final HealthProfileRepository healthProfileRepository;
    private final VisionRepository visionRepository;
    private final HearingRepository hearingRepository;
    private final OralRepository oralRepository;
    private final SkinRepository skinRepository;
    private final RespiratoryRepository respiratoryRepository;
    private final INotificationService notificationService;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;

    @Transactional
    @Override
    public HealthCheckResult recordResult(Long formId, HealthCheckCategory category,
                                        double weight, double height, User nurse,
                                        boolean isAbnormal, String resultNotes,
                                        String recommendations, ResultStatus status) {

        Optional<HealthCheckForm> optionalForm = formRepository.findById(formId);
        if (optionalForm.isEmpty()) {
            throw new RuntimeException("Form not found with id: " + formId);
        }

        HealthCheckForm form = optionalForm.get();
        Student student = form.getStudent();

        // Make sure the form is in CONFIRMED status
        if (form.getStatus() != FormStatus.CONFIRMED) {
            throw new RuntimeException("Cannot record result for a form that is not in CONFIRMED status");
        }

        // Get the most recent health profile for the student
        List<HealthProfile> profiles = healthProfileRepository.findByStudentOrderByCreatedAtDesc(student);
        if (profiles.isEmpty()) {
            throw new RuntimeException("No health profile found for student with id: " + student.getStudentID());
        }

        HealthProfile healthProfile = new HealthProfile();

        for( HealthProfile profile : profiles) {
            // If the profile is not active, skip it
            if (profile.getStatus().equals(ProfileStatus.APPROVED)) {
                healthProfile = profile;
                break; // We found an active profile, no need to check further
            } else {
                // If we reach here, it means we have no active profile
                // We can either throw an exception or handle it as needed
                continue; // Skip to the next profile
            }
        }

        // Calculate BMI
        double heightInMeters = height / 100; // Convert height from cm to m
        double bmi = weight / (heightInMeters * heightInMeters);

        HealthCheckResult result = new HealthCheckResult();
        result.setForm(form);
        result.setStudent(student);
        result.setHealthProfile(healthProfile);
        result.setNurse(nurse);
        result.setCategory(category);
        result.setWeight(weight);
        result.setHeight(height);
        result.setBmi(bmi);
        result.setAbnormal(isAbnormal);
        result.setResultNotes(resultNotes);
        result.setRecommendations(recommendations);
        result.setPerformedAt(LocalDateTime.now());
        result.setStatus(status);

        HealthCheckResult savedResult = resultRepository.save(result);

        // Update the form status to COMPLETED
        form.setStatus(FormStatus.COMPLETED);
        formRepository.save(form);

        // Sync the health check result with the specific category table
        Long categoryResultId = syncResultWithCategoryTable(category, savedResult, healthProfile);
        savedResult.setCategoryResultId(categoryResultId);
        savedResult = resultRepository.save(savedResult);

        // Sync the health check result with the student's health profile
        // This replaces the simpler update that was here before
        syncWithHealthProfile(savedResult, healthProfile);

        // If the result is abnormal, notify the parent and manager
        if (isAbnormal) {
            notificationService.notifyParentAboutAbnormalResult(savedResult);
            notificationService.notifyManagerAboutAbnormalResult(savedResult);
        }

        // Notify parent about health profile update
        notificationService.notifyParentAboutHealthProfileUpdate(savedResult);

        return savedResult;
    }

    /**
     * Helper method to sync health check result with health profile
     */
    private void syncWithHealthProfile(HealthCheckResult result, HealthProfile healthProfile) {
        // Update basic measurements
        healthProfile.setWeight(result.getWeight());
        healthProfile.setHeight(result.getHeight());

        // Calculate and update BMI
        healthProfile.setBmi(result.getBmi());

        // Set the updated date
        healthProfile.setUpdatedAt(LocalDate.now());

        // Add notes to the health profile based on the result
        if (result.isAbnormal()) {
            String categoryName = result.getCategory().toString();
            String existingNotes = healthProfile.getNurseNote() != null ? healthProfile.getNurseNote() : "";
            String newNote = String.format("[%s] %s - %s. Recommendations: %s",
                LocalDate.now(),
                categoryName,
                result.getResultNotes(),
                result.getRecommendations());

            // Append the new note to existing notes
            if (!existingNotes.isEmpty()) {
                existingNotes += "\n\n";
            }
            existingNotes += newNote;
            healthProfile.setNurseNote(existingNotes);
        }

        // Save the updated health profile
        healthProfileRepository.save(healthProfile);

        // Mark the result as synced
        result.setSyncedToProfile(true);
        resultRepository.save(result);
    }

    @Transactional
    @Override
    public Long syncResultWithCategoryTable(HealthCheckCategory category,
                                            HealthCheckResult result,
                                            HealthProfile healthProfile) {
        LocalDate examDate = LocalDate.now();

        switch (category) {
            case VISION:
                Vision vision = new Vision();
                vision.setHealthProfile(healthProfile);
                vision.setDateOfExamination(examDate);
                vision.setVisionDescription(result.getResultNotes());

                // Default values - these would be replaced with actual measurements in a real implementation
                vision.setVisionLeft(20);
                vision.setVisionRight(20);

                return visionRepository.save(vision).getId();

            case HEARING:
                Hearing hearing = new Hearing();
                hearing.setHealthProfile(healthProfile);
                hearing.setDateOfExamination(examDate);
                hearing.setDescription(result.getResultNotes());

                // Default values - these would be replaced with actual measurements in a real implementation
                hearing.setLeftEar(10);
                hearing.setRightEar(10);

                return hearingRepository.save(hearing).getId();

            case ORAL:
                Oral oral = new Oral();
                oral.setHealthProfile(healthProfile);
                oral.setDateOfExamination(examDate);
                oral.setDescription(result.getResultNotes());
                oral.setAbnormal(result.isAbnormal());  // Changed from setIsAbnormal to setAbnormal

                // Default values - these would be replaced with actual assessments in a real implementation
                oral.setTeethCondition("Normal");
                oral.setGumsCondition("Normal");
                oral.setTongueCondition("Normal");

                return oralRepository.save(oral).getId();

            case SKIN:
                Skin skin = new Skin();
                skin.setHealthProfile(healthProfile);
                skin.setDateOfExamination(examDate);
                skin.setDescription(result.getResultNotes());
                skin.setAbnormal(result.isAbnormal());  // Changed from setIsAbnormal to setAbnormal

                // Default values - these would be replaced with actual assessments in a real implementation
                skin.setSkinColor("Normal");
                skin.setRashes(false);
                skin.setLesions(false);
                skin.setDryness(false);
                skin.setEczema(false);
                skin.setPsoriasis(false);
                skin.setSkinInfection(false);
                skin.setAllergies(false);

                return skinRepository.save(skin).getId();

            case RESPIRATORY:
                Respiratory respiratory = new Respiratory();
                respiratory.setHealthProfile(healthProfile);
                respiratory.setDateOfExamination(examDate);
                respiratory.setDescription(result.getResultNotes());
                respiratory.setAbnormal(result.isAbnormal());  // Changed from setIsAbnormal to setAbnormal

                // Default values - these would be replaced with actual assessments in a real implementation
                respiratory.setBreathingRate(16);
                respiratory.setBreathingSound("Normal");
                respiratory.setWheezing(false);
                respiratory.setCough(false);
                respiratory.setBreathingDifficulty(false);
                respiratory.setOxygenSaturation(98);

                return respiratoryRepository.save(respiratory).getId();

            default:
                throw new RuntimeException("Invalid health check category: " + category);
        }
    }

    @Transactional
    @Override
    public HealthCheckResult markAsNotified(Long resultId, boolean parent, boolean manager) {
        Optional<HealthCheckResult> optionalResult = resultRepository.findById(resultId);
        if (optionalResult.isEmpty()) {
            throw new RuntimeException("Result not found with id: " + resultId);
        }

        HealthCheckResult result = optionalResult.get();

        if (parent) {
            result.setParentNotified(true);
        }

        if (manager) {
            result.setManagerNotified(true);
        }

        return resultRepository.save(result);
    }

    @Transactional
    @Override
    public HealthCheckResult markAsSynced(Long resultId) {
        // Instead of just marking as synced, we now do a full synchronization
        return syncResultWithHealthProfile(resultId);
    }

    @Override
    public HealthCheckResult getResultById(Long id) {
        Optional<HealthCheckResult> result = resultRepository.findById(id);
        return result.orElseThrow(() -> new RuntimeException("Result not found with id: " + id));
    }

    @Override
    public List<HealthCheckResult> getResultsByForm(Long formId) {
        Optional<HealthCheckForm> form = formRepository.findById(formId);
        if (form.isEmpty()) {
            throw new RuntimeException("Form not found with id: " + formId);
        }

        return resultRepository.findByForm(form.get());
    }

    @Override
    public List<HealthCheckResult> getResultsByStudent(Long studentId) {
        Student student = new Student();
        student.setStudentID(studentId);
        return resultRepository.findByStudent(student);
    }

    @Override
    public List<HealthCheckResult> getResultsByHealthProfile(Long healthProfileId) {
        HealthProfile healthProfile = new HealthProfile();
        healthProfile.setId(healthProfileId);
        return resultRepository.findByHealthProfile(healthProfile);
    }

    @Override
    public List<HealthCheckResult> getResultsByCategory(HealthCheckCategory category) {
        return resultRepository.findByCategory(category);
    }

    @Override
    public List<HealthCheckResult> getAbnormalResults() {
        return resultRepository.findByIsAbnormal(true);
    }

    @Override
    public List<HealthCheckResult> getResultsByStatus(ResultStatus status) {
        return resultRepository.findByStatus(status);
    }

    @Override
    public List<HealthCheckResult> getResultsByCampaign(Long campaignId) {
        return resultRepository.findByCampaignId(campaignId);
    }

    @Override
    public List<HealthCheckResult> getResultsByCampaignAndCategory(Long campaignId,
                                                                   HealthCheckCategory category) {
        return resultRepository.findByCampaignIdAndCategory(campaignId, category);
    }

    @Override
    public int countAbnormalResultsByCampaign(Long campaignId) {
        return resultRepository.countAbnormalResultsByCampaign(campaignId);
    }

    @Override
    public List<HealthCheckResult> getResultsForParentChildren(Long parentId) {
        // First, get all students associated with this parent
        Optional<User> parentOptional = userRepository.findById(parentId);
        if (parentOptional.isEmpty()) {
            return new ArrayList<>();
        }

        User parent = parentOptional.get();

        // Use the StudentService to get all students for this parent
        List<Student> children = studentRepository.findByParentWithParents(parent);

        // Get results for all children
        List<HealthCheckResult> results = new ArrayList<>();
        for (Student child : children) {
            results.addAll(resultRepository.findByStudent(child));
        }

        return results;
    }

    @Transactional
    @Override
    public HealthCheckResult syncResultWithHealthProfile(Long resultId) {
        Optional<HealthCheckResult> optionalResult = resultRepository.findById(resultId);
        if (optionalResult.isEmpty()) {
            throw new RuntimeException("Result not found with id: " + resultId);
        }

        HealthCheckResult result = optionalResult.get();
        HealthProfile healthProfile = result.getHealthProfile();

        // Update basic measurements
        healthProfile.setWeight(result.getWeight());
        healthProfile.setHeight(result.getHeight());

        // Calculate and update BMI
        double heightInMeters = result.getHeight() / 100; // Convert height from cm to m
        double bmi = result.getWeight() / (heightInMeters * heightInMeters);
        healthProfile.setBmi(bmi);

        // Set the updated date
        healthProfile.setUpdatedAt(LocalDate.now());

        // Add notes to the health profile based on the result
        if (result.isAbnormal()) {
            String categoryName = result.getCategory().toString();
            String existingNotes = healthProfile.getNurseNote() != null ? healthProfile.getNurseNote() : "";
            String newNote = String.format("[%s] %s - %s. Recommendations: %s",
                LocalDate.now(),
                categoryName,
                result.getResultNotes(),
                result.getRecommendations());

            // Append the new note to existing notes
            if (!existingNotes.isEmpty()) {
                existingNotes += "\n\n";
            }
            existingNotes += newNote;
            healthProfile.setNurseNote(existingNotes);
        }

        // Save the updated health profile
        healthProfileRepository.save(healthProfile);

        // Mark the result as synced
        result.setSyncedToProfile(true);
        result = resultRepository.save(result);

        return result;
    }
}

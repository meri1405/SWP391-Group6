package group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.HealthProfile;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.Student;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.ProfileStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HealthProfileRepository extends JpaRepository<HealthProfile, Long> {

    /**
     * Find the most recent health profile for a student
     *
     * @param student The student whose health profile we want to find
     * @return Optional containing the most recent health profile, or empty if none found
     */
    Optional<HealthProfile> findTopByStudentOrderByCreatedAtDesc(Student student);

    /**
     * Find the most recent approved health profile for a student
     *
     * @param student The student whose approved health profile we want to find
     * @param status The status of the health profile (should be APPROVED)
     * @return Optional containing the most recent approved health profile, or empty if none found
     */
    Optional<HealthProfile> findTopByStudentAndStatusOrderByCreatedAtDesc(Student student, ProfileStatus status);

    /**
     * Find all health profiles for a student
     *
     * @param student The student whose health profiles we want to find
     * @return List of health profiles for the student
     */
    List<HealthProfile> findByStudentOrderByCreatedAtDesc(Student student);

    // Find health profiles by student ID
    @Query("SELECT hp FROM HealthProfile hp WHERE hp.student.studentID = :studentId")
    List<HealthProfile> findByStudentStudentID(@Param("studentId") Long studentId);

    // Find health profiles by student
    List<HealthProfile> findByStudent(Student student);

    // Find health profiles by parent and student (for security validation)
    @Query("SELECT hp FROM HealthProfile hp WHERE hp.student.studentID = :studentId AND hp.parent.id = :parentId")
    List<HealthProfile> findByStudentStudentIDAndParentId(@Param("studentId") Long studentId, @Param("parentId") Long parentId);

    // Find health profiles by status
    List<HealthProfile> findByStatus(ProfileStatus status);

    // Find health profile by student and status
    Optional<HealthProfile> findByStudentAndStatus(Student student, ProfileStatus status);
}

package group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.HealthProfile;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.Student;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.ProfileStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HealthProfileRepository extends JpaRepository<HealthProfile, Long> {
    
    // Find health profiles by student ID
    @Query("SELECT hp FROM HealthProfile hp WHERE hp.student.studentID = :studentId")
    List<HealthProfile> findByStudentStudentID(@Param("studentId") Long studentId);
    
    // Find health profiles by student
    List<HealthProfile> findByStudent(Student student);
    
    // Find health profiles by parent and student (for security validation)
    @Query("SELECT hp FROM HealthProfile hp WHERE hp.student.studentID = :studentId AND hp.parent.id = :parentId")
    List<HealthProfile> findByStudentStudentIDAndParentId(@Param("studentId") Long studentId, @Param("parentId") Long parentId);

    List<HealthProfile> findByParent(User parent);
    List<HealthProfile> findByParentAndStudent(User parent, Student student);
    List<HealthProfile> findByStatus(ProfileStatus status);
    List<HealthProfile> findByStatusAndParent(ProfileStatus status, User parent);
    List<HealthProfile> findByStatusAndStudent(ProfileStatus status, Student student);
}

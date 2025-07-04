package group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.MedicationRequest;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.Student;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MedicationRequestRepository extends JpaRepository<MedicationRequest, Long> {

    // Find all medication requests for a specific parent
    List<MedicationRequest> findByParent(User parent);

    // Find all medication requests for a specific student
    List<MedicationRequest> findByStudent(Student student);

    // Find all medication requests for a specific student and parent
    List<MedicationRequest> findByStudentAndParent(Student student, User parent);

    // Find all medication requests for a specific nurse
    List<MedicationRequest> findByNurse(User nurse);

    // Find all medication requests by status
    List<MedicationRequest> findByStatus(String status);
}

package group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.Hearing;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.HealthProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HearingRepository extends JpaRepository<Hearing, Long> {
    List<Hearing> findByHealthProfile(HealthProfile healthProfile);
}

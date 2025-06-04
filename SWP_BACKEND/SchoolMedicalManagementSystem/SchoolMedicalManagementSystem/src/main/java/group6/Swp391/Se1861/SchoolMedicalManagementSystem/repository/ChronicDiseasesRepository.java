package group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.ChronicDiseases;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChronicDiseasesRepository extends JpaRepository<ChronicDiseases, Long> {
    // You can add custom query methods here if needed
}

package group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.InfectiousDiseases;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InfectiousDiseasesRepository extends JpaRepository<InfectiousDiseases, Long> {
    // You can add custom query methods here if needed
}

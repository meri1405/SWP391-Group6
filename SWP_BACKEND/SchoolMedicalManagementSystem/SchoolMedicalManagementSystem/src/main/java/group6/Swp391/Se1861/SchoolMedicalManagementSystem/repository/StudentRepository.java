package group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.Student;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    // Find all students associated with a specific parent
    List<Student> findByParents(User parent);

    // Check if a student belongs to a specific parent
    @Query("SELECT CASE WHEN COUNT(s) > 0 THEN true ELSE false END FROM Student s JOIN s.parents p WHERE s.studentID = :studentId AND p.id = :parentId")
    boolean isStudentOwnedByParent(@Param("studentId") Long studentId, @Param("parentId") Long parentId);

    // Find student by ID with eager loading of parents
    @Query("SELECT s FROM Student s LEFT JOIN FETCH s.parents WHERE s.studentID = :id")
    Optional<Student> findByIdWithParents(@Param("id") Long id);
}

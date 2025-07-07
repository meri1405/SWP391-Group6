package group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.Student;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    // Find all students associated with a specific parent (father or mother)
    @Query("SELECT s FROM Student s WHERE s.father = :parent OR s.mother = :parent")
    List<Student> findByParent(@Param("parent") User parent);
    
    // Find all students associated with a specific parent with eager loading of father and mother
    @Query("SELECT DISTINCT s FROM Student s LEFT JOIN FETCH s.father LEFT JOIN FETCH s.mother WHERE s.father = :parent OR s.mother = :parent")
    List<Student> findByParentWithParents(@Param("parent") User parent);

    // Check if a student belongs to a specific parent
    @Query("SELECT CASE WHEN COUNT(s) > 0 THEN true ELSE false END FROM Student s WHERE s.studentID = :studentId AND (s.father.id = :parentId OR s.mother.id = :parentId)")
    boolean isStudentOwnedByParent(@Param("studentId") Long studentId, @Param("parentId") Long parentId);

    // Find student by ID with eager loading of father and mother
    @Query("SELECT s FROM Student s LEFT JOIN FETCH s.father LEFT JOIN FETCH s.mother WHERE s.studentID = :id")
    Optional<Student> findByIdWithParents(@Param("id") Long id);
    
    // Find all students with eager loading of father and mother
    @Query("SELECT DISTINCT s FROM Student s LEFT JOIN FETCH s.father LEFT JOIN FETCH s.mother")
    List<Student> findAllWithParents();

    // Find students by date of birth between two dates (for age filtering)
    List<Student> findByDobBetween(LocalDate startDate, LocalDate endDate);

    // Find students by class name
    List<Student> findByClassName(String className);
    
    // Find students by multiple class names
    List<Student> findByClassNameIn(Set<String> classNames);
    
    // Find students by age range and multiple class names
    List<Student> findByDobBetweenAndClassNameIn(LocalDate startDate, LocalDate endDate, Set<String> classNames);
    
    // Find students by both age range and class name
    List<Student> findByDobBetweenAndClassName(LocalDate startDate, LocalDate endDate, String className);

    // Find all active (not disabled) children of a father
    List<Student> findByFatherAndIsDisabledFalse(User father);

    // Find all active (not disabled) children of a mother
    List<Student> findByMotherAndIsDisabledFalse(User mother);
    
    // Find all active students with eager loading of father and mother
    @Query("SELECT DISTINCT s FROM Student s LEFT JOIN FETCH s.father LEFT JOIN FETCH s.mother WHERE s.isDisabled = false")
    List<Student> findAllActiveWithParents();
    
    // Find all active students
    List<Student> findByIsDisabledFalse();
    
    // Find active students by date of birth between two dates (for age filtering)
    List<Student> findByDobBetweenAndIsDisabledFalse(LocalDate startDate, LocalDate endDate);
    
    // Find active students by class name
    List<Student> findByClassNameAndIsDisabledFalse(String className);
    
    // Find active students by multiple class names
    List<Student> findByClassNameInAndIsDisabledFalse(Set<String> classNames);
    
    // Find active students by age range and multiple class names
    List<Student> findByDobBetweenAndClassNameInAndIsDisabledFalse(LocalDate startDate, LocalDate endDate, Set<String> classNames);
    
    // Find active students by both age range and class name
    List<Student> findByDobBetweenAndClassNameAndIsDisabledFalse(LocalDate startDate, LocalDate endDate, String className);
    
    // Get distinct class names from active students
    @Query("SELECT DISTINCT s.className FROM Student s WHERE s.isDisabled = false AND s.className IS NOT NULL ORDER BY s.className")
    List<String> findDistinctClassNamesFromActiveStudents();
}

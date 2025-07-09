package group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.HealthProfile;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.HealthProfileEvent;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface HealthProfileEventRepository extends JpaRepository<HealthProfileEvent, Long> {

    // Find all events for a specific health profile
    List<HealthProfileEvent> findByHealthProfileOrderByModifiedAtDesc(HealthProfile healthProfile);

    // Find events by health profile ID
    @Query("SELECT hpe FROM HealthProfileEvent hpe WHERE hpe.healthProfile.id = :healthProfileId ORDER BY hpe.modifiedAt DESC")
    List<HealthProfileEvent> findByHealthProfileIdOrderByModifiedAtDesc(@Param("healthProfileId") Long healthProfileId);

    // Find events by modified user
    List<HealthProfileEvent> findByModifiedByUserOrderByModifiedAtDesc(User modifiedByUser);

    // Find events by action type
    List<HealthProfileEvent> findByActionTypeOrderByModifiedAtDesc(HealthProfileEvent.ActionType actionType);

    // Find events within a date range
    List<HealthProfileEvent> findByModifiedAtBetweenOrderByModifiedAtDesc(LocalDateTime startDate, LocalDateTime endDate);

    // Find events for a specific field
    List<HealthProfileEvent> findByFieldChangedOrderByModifiedAtDesc(String fieldChanged);

    // Find recent events for a health profile (last N events)
    @Query("SELECT hpe FROM HealthProfileEvent hpe WHERE hpe.healthProfile = :healthProfile ORDER BY hpe.modifiedAt DESC")
    List<HealthProfileEvent> findRecentEventsByHealthProfile(@Param("healthProfile") HealthProfile healthProfile);

    // Count events for a health profile
    long countByHealthProfile(HealthProfile healthProfile);

    // Find events by health profile and user
    List<HealthProfileEvent> findByHealthProfileAndModifiedByUserOrderByModifiedAtDesc(HealthProfile healthProfile, User modifiedByUser);

    // Statistics queries
    @Query("SELECT hpe.actionType, COUNT(hpe) FROM HealthProfileEvent hpe WHERE hpe.modifiedAt BETWEEN :startDate AND :endDate GROUP BY hpe.actionType")
    List<Object[]> countEventsByActionType(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT FUNCTION('DATE', hpe.modifiedAt), COUNT(hpe) FROM HealthProfileEvent hpe WHERE hpe.modifiedAt BETWEEN :startDate AND :endDate GROUP BY FUNCTION('DATE', hpe.modifiedAt) ORDER BY FUNCTION('DATE', hpe.modifiedAt)")
    List<Object[]> countEventsByDate(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT CONCAT(hpe.modifiedByUser.firstName, ' ', hpe.modifiedByUser.lastName), COUNT(hpe) FROM HealthProfileEvent hpe WHERE hpe.modifiedAt BETWEEN :startDate AND :endDate GROUP BY hpe.modifiedByUser.id, hpe.modifiedByUser.firstName, hpe.modifiedByUser.lastName")
    List<Object[]> countEventsByUser(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(hpe) FROM HealthProfileEvent hpe WHERE hpe.modifiedAt BETWEEN :startDate AND :endDate")
    Long countEventsByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
}

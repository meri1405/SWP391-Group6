package group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.Notification;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    @Query("SELECT n FROM Notification n " +
           "LEFT JOIN FETCH n.campaignCompletionRequest " +
           "LEFT JOIN FETCH n.medicationRequest " +
           "LEFT JOIN FETCH n.medicationSchedule " +
           "LEFT JOIN FETCH n.medicalEvent " +
           "LEFT JOIN FETCH n.vaccinationForm " +
           "LEFT JOIN FETCH n.restockRequest " +
           "WHERE n.recipient = :recipient " +
           "ORDER BY n.createdAt DESC")
    List<Notification> findByRecipientOrderByCreatedAtDesc(@Param("recipient") User recipient);

    @Query("SELECT n FROM Notification n " +
           "LEFT JOIN FETCH n.campaignCompletionRequest " +
           "LEFT JOIN FETCH n.medicationRequest " +
           "LEFT JOIN FETCH n.medicationSchedule " +
           "LEFT JOIN FETCH n.medicalEvent " +
           "LEFT JOIN FETCH n.vaccinationForm " +
           "LEFT JOIN FETCH n.restockRequest " +
           "WHERE n.recipient = :recipient " +
           "ORDER BY n.createdAt DESC")
    List<Notification> findByRecipientOrderByCreatedAtDesc(@Param("recipient") User recipient, Pageable pageable);

    @Query("SELECT n FROM Notification n " +
           "LEFT JOIN FETCH n.campaignCompletionRequest " +
           "LEFT JOIN FETCH n.medicationRequest " +
           "LEFT JOIN FETCH n.medicationSchedule " +
           "LEFT JOIN FETCH n.medicalEvent " +
           "LEFT JOIN FETCH n.vaccinationForm " +
           "LEFT JOIN FETCH n.restockRequest " +
           "WHERE n.recipient = :recipient AND n.isRead = false")
    List<Notification> findByRecipientAndIsReadFalse(@Param("recipient") User recipient);

    long countByRecipientAndIsReadFalse(User recipient);

    List<Notification> findByNotificationType(String notificationType);

    @Query("SELECT n FROM Notification n " +
           "LEFT JOIN FETCH n.campaignCompletionRequest " +
           "LEFT JOIN FETCH n.medicationRequest " +
           "LEFT JOIN FETCH n.medicationSchedule " +
           "LEFT JOIN FETCH n.medicalEvent " +
           "LEFT JOIN FETCH n.vaccinationForm " +
           "LEFT JOIN FETCH n.restockRequest " +
           "WHERE n.id = :id")
    Optional<Notification> findByIdWithAssociations(@Param("id") Long id);
}

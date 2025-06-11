package group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.Notification;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // Find all notifications for a specific user, ordered by creation time (newest first)
    List<Notification> findByRecipientOrderByCreatedAtDesc(User recipient);

    // Find all unread notifications for a specific user
    List<Notification> findByRecipientAndIsReadFalseOrderByCreatedAtDesc(User recipient);

    // Count unread notifications for a specific user
    long countByRecipientAndIsReadFalse(User recipient);
}

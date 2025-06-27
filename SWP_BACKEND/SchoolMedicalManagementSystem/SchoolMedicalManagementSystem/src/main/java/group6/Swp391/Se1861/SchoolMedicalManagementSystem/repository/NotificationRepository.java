package group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.Notification;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByRecipientOrderByCreatedAtDesc(User recipient);

    List<Notification> findByRecipientOrderByCreatedAtDesc(User recipient, Pageable pageable);

    List<Notification> findByRecipientAndIsReadFalse(User recipient);

    long countByRecipientAndIsReadFalse(User recipient);

    List<Notification> findByNotificationType(String notificationType);
}

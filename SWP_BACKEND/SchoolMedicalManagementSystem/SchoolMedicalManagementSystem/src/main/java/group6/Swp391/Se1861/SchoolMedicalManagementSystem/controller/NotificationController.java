package group6.Swp391.Se1861.SchoolMedicalManagementSystem.controller;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.NotificationDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.INotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final INotificationService notificationService;    /**
     * Get all notifications for the authenticated user
     */
    @GetMapping
    public ResponseEntity<List<NotificationDTO>> getAllNotifications(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) Integer limit) {
        if (limit != null && limit > 0) {
            return ResponseEntity.ok(notificationService.getAllNotificationsForUser(user, limit));
        }
        return ResponseEntity.ok(notificationService.getAllNotificationsForUser(user));
    }

    /**
     * Get only unread notifications for the authenticated user
     */
    @GetMapping("/unread")
    public ResponseEntity<List<NotificationDTO>> getUnreadNotifications(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(notificationService.getUnreadNotificationsForUser(user));
    }

    /**
     * Get count of unread notifications for the authenticated user
     */
    @GetMapping("/unread/count")
    public ResponseEntity<Map<String, Long>> getUnreadNotificationCount(@AuthenticationPrincipal User user) {
        long count = notificationService.getUnreadNotificationCount(user);
        return ResponseEntity.ok(Map.of("count", count));
    }

    /**
     * Mark a specific notification as read
     */
    @PutMapping("/{notificationId}/read")
    public ResponseEntity<NotificationDTO> markNotificationAsRead(
            @PathVariable Long notificationId,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(notificationService.markNotificationAsRead(notificationId, user));
    }

    /**
     * Mark all notifications as read for the authenticated user
     */
    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllNotificationsAsRead(@AuthenticationPrincipal User user) {
        notificationService.markAllNotificationsAsRead(user);
        return ResponseEntity.ok().build();
    }
}

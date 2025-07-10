package group6.Swp391.Se1861.SchoolMedicalManagementSystem.utils;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;

/**
 * Utility class for consistent timezone handling across the application
 * Provides methods to work with Vietnam timezone
 */
@Component
public class TimezoneUtils {

    @Value("${app.timezone:Asia/Ho_Chi_Minh}")
    private String appTimezone;

    /**
     * Get the configured application timezone
     */
    public ZoneId getApplicationZone() {
        return ZoneId.of(appTimezone);
    }

    /**
     * Get current time in Vietnam timezone
     */
    public LocalDateTime nowInVietnam() {
        return LocalDateTime.now(getApplicationZone());
    }

    /**
     * Convert LocalDateTime to Vietnam timezone
     */
    public ZonedDateTime toVietnamTime(LocalDateTime dateTime) {
        return dateTime.atZone(getApplicationZone());
    }

    /**
     * Get current time as ZonedDateTime in Vietnam timezone
     */
    public ZonedDateTime nowInVietnamZoned() {
        return ZonedDateTime.now(getApplicationZone());
    }

    /**
     * Get the timezone string
     */
    public String getTimezoneString() {
        return appTimezone;
    }
}

package group6.Swp391.Se1861.SchoolMedicalManagementSystem.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.annotation.PostConstruct;
import java.time.ZoneId;
import java.util.TimeZone;

/**
 * Cấu hình múi giờ cho toàn bộ ứng dụng
 * Đảm bảo tất cả các thao tác thời gian sử dụng múi giờ Việt Nam
 */
@Configuration
public class TimezoneConfig {

    @Value("${app.timezone:Asia/Ho_Chi_Minh}")
    private String appTimezone;

    @PostConstruct
    public void configureTimezone() {
        // Đặt múi giờ mặc định cho JVM
        TimeZone timeZone = TimeZone.getTimeZone(appTimezone);
        TimeZone.setDefault(timeZone);
        
        // Đặt múi giờ cho system property
        System.setProperty("user.timezone", appTimezone);
        
        System.out.println("Application timezone configured to: " + appTimezone);
        System.out.println("Default timezone: " + TimeZone.getDefault().getID());
        System.out.println("ZoneId.systemDefault(): " + ZoneId.systemDefault());
    }

    /**
     * Cấu hình ObjectMapper với múi giờ Việt Nam
     * Đảm bảo tất cả JSON serialization/deserialization sử dụng đúng múi giờ
     */
    @Bean
    @Primary
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.setTimeZone(TimeZone.getTimeZone(appTimezone));
        return mapper;
    }

    /**
     * Bean để cung cấp ZoneId cho các service khác
     */
    @Bean("vietnamZoneId")
    public ZoneId vietnamZoneId() {
        return ZoneId.of(appTimezone);
    }
}

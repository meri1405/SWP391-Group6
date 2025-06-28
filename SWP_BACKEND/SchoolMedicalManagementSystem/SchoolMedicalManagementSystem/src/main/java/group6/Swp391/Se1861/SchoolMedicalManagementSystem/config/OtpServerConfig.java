package group6.Swp391.Se1861.SchoolMedicalManagementSystem.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.boot.web.servlet.server.ConfigurableServletWebServerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory;
import org.apache.catalina.connector.Connector;

/**
 * Configuration for secondary server that handles OTP generation
 */
@Configuration
public class OtpServerConfig {

    @Value("${otp.server.port:8082}")
    private int otpServerPort;

    @Bean
    public WebServerFactoryCustomizer<ConfigurableServletWebServerFactory> otpServerPortCustomizer() {
        return factory -> {
            if (factory instanceof TomcatServletWebServerFactory) {
                TomcatServletWebServerFactory tomcatFactory = (TomcatServletWebServerFactory) factory;
                Connector connector = new Connector(TomcatServletWebServerFactory.DEFAULT_PROTOCOL);
                connector.setPort(otpServerPort);
                tomcatFactory.addAdditionalTomcatConnectors(connector);
            }
        };
    }
}

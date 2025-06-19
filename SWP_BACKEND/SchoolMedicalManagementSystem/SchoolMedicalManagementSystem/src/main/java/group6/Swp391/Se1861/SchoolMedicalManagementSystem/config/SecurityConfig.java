package group6.Swp391.Se1861.SchoolMedicalManagementSystem.config;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.impl.CustomOAuth2UserService;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.impl.CustomUserDetailsService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final JwtAuthenticationEntryPoint unauthorizedHandler;
    private final CustomOAuth2UserService customOAuth2UserService;
    private final CustomOAuth2AuthenticationSuccessHandler oAuth2SuccessHandler;

    public SecurityConfig(
            CustomUserDetailsService userDetailsService,
            JwtAuthenticationFilter jwtAuthenticationFilter,
            JwtAuthenticationEntryPoint unauthorizedHandler,
            CustomOAuth2UserService customOAuth2UserService,
            CustomOAuth2AuthenticationSuccessHandler oAuth2SuccessHandler) {
        this.userDetailsService = userDetailsService;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.unauthorizedHandler = unauthorizedHandler;
        this.customOAuth2UserService = customOAuth2UserService;
        this.oAuth2SuccessHandler = oAuth2SuccessHandler;
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        // Use secure BCryptPasswordEncoder for password hashing
        return new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.cors(cors -> cors.configure(http))
            .csrf(csrf -> csrf.disable())
            .exceptionHandling(exception -> exception.authenticationEntryPoint(unauthorizedHandler))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))            .authorizeHttpRequests(auth ->
                auth.requestMatchers("/api/auth/**").permitAll()
                    .requestMatchers("/api/public/**").permitAll()
                    .requestMatchers("/oauth2/**").permitAll()
                    .requestMatchers("/login/oauth2/**").permitAll()
                    .requestMatchers("/ws/**").permitAll()  // Allow WebSocket endpoint
                    .requestMatchers("/api/nurse/students/test").permitAll()  // Debug endpoint
                    .requestMatchers("/api/nurse/students/debug-user").authenticated()  // Any authenticated user
                    .requestMatchers("/api/nurse/students/all").authenticated()  // Any authenticated user
                    .requestMatchers("/api/admin/**").hasRole("ADMIN")
                    .requestMatchers("/api/manager/**").hasRole("MANAGER")
                    .requestMatchers("/api/nurse/**").hasRole("SCHOOLNURSE")
                    .requestMatchers("/api/schoolnurse/**").hasRole("SCHOOLNURSE")
                    .requestMatchers("/api/parent/**").hasRole("PARENT")
                    .requestMatchers("/api/medical-events/**").hasAnyRole("PARENT", "SCHOOLNURSE", "MANAGER")
                    .requestMatchers("/api/health-check/campaigns").hasAnyRole( "SCHOOLNURSE", "MANAGER")
                    .requestMatchers("/api/health-check/forms").hasAnyRole("SCHOOLNURSE", "MANAGER", "PARENT")
                    .requestMatchers("/api/health-check/results").hasAnyRole("SCHOOLNURSE", "MANAGER", "PARENT")
                    .anyRequest().authenticated()
            ).oauth2Login(oauth2 ->
                oauth2.authorizationEndpoint(authEndpoint ->
                        authEndpoint.baseUri("/oauth2/authorize"))
                    .redirectionEndpoint(redirectEndpoint ->
                        redirectEndpoint.baseUri("/login/oauth2/code/*"))
                    .userInfoEndpoint(userInfo ->
                        userInfo.userService(customOAuth2UserService))
                    .successHandler(oAuth2SuccessHandler)
            );        http.authenticationProvider(authenticationProvider());
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}

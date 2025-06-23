package group6.Swp391.Se1861.SchoolMedicalManagementSystem.config;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.impl.CustomUserDetailsService;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private CustomUserDetailsService customUserDetailsService;    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String jwt = parseJwt(request);
            if (jwt != null) {
                // Log the request path and token existence
                logger.debug("Processing request to path: " + request.getRequestURI() + ", JWT token exists");

                if (jwtUtil.validateToken(jwt)) {
                    String username = jwtUtil.extractUsername(jwt);
                    logger.debug("JWT token validated for user: " + username);                    UserDetails userDetails = customUserDetailsService.loadUserByUsername(username);
                    
                    // Check if user is enabled
                    if (!userDetails.isEnabled()) {
                        logger.warn("Account is disabled for user: " + username);
                        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                        return;
                    }
                    
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    logger.debug("Authentication set in security context for user: " + username);
                } else {
                    logger.warn("Invalid JWT token for request to: " + request.getRequestURI());
                }
            } else {
                logger.debug("No JWT token found in request to: " + request.getRequestURI());
            }
        } catch (Exception e) {
            logger.error("Cannot set user authentication for request to " + request.getRequestURI() + ": " + e.getMessage(), e);
        }

        filterChain.doFilter(request, response);
    }

    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");

        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }

        return null;
    }
}

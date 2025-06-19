package group6.Swp391.Se1861.SchoolMedicalManagementSystem.config;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.impl.JwtService;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.impl.CustomUserDetailsService;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    public WebSocketAuthInterceptor(JwtService jwtService, CustomUserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
          if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            System.out.println("CONNECT command received");
            
            // Get the Authorization header
            String authHeader = accessor.getFirstNativeHeader("Authorization");
            System.out.println("Authorization header: " + authHeader);
              if (StringUtils.hasText(authHeader) && authHeader.startsWith("Bearer ")) {
                String jwt = authHeader.substring(7);
                System.out.println("JWT token extracted: " + jwt.substring(0, Math.min(jwt.length(), 20)) + "...");
                
                try {
                    System.out.println("Extracting username from JWT");
                    String username = jwtService.extractUsername(jwt);
                    System.out.println("Username extracted: " + username);
                    
                    if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                        System.out.println("Loading user details for: " + username);
                        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                        System.out.println("User details loaded: " + userDetails.getUsername());
                        
                        if (jwtService.validateToken(jwt, userDetails)) {
                            System.out.println("Token validated successfully");
                            UsernamePasswordAuthenticationToken authentication = 
                                new UsernamePasswordAuthenticationToken(
                                    userDetails, null, userDetails.getAuthorities());
                            
                            accessor.setUser(authentication);
                            System.out.println("User authentication set in accessor");
                        } else {
                            System.out.println("Token validation failed");
                        }
                    } else {
                        System.out.println("Username is null or authentication already exists");
                    }                } catch (Exception e) {
                    System.err.println("WebSocket authentication error: " + e.getMessage());
                    e.printStackTrace();
                    // You might want to throw an exception here to reject the connection
                }
            } else {
                System.out.println("No valid Authorization header found");
            }
        }
        
        return message;
    }
}

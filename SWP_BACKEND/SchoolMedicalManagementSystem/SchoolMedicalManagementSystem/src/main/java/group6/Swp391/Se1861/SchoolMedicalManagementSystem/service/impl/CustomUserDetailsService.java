package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.impl;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // First try to find by username (for non-parent users)
        Optional<User> userOptional = userRepository.findByUsername(username);

        if (userOptional.isPresent()) {
            return userOptional.get();
        }

        // If not found by username, try to find by email (for school nurses and other staff)
        userOptional = userRepository.findByEmail(username);

        if (userOptional.isPresent()) {
            return userOptional.get();
        }

        // If not found by email, try to find by phone (for parent users)
        // This handles the case where JWT tokens for parents use phone as username
        userOptional = userRepository.findByPhone(username);

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            // Verify this is actually a parent user
            if ("PARENT".equals(user.getRole().getRoleName())) {
                return user;
            }
        }

        throw new UsernameNotFoundException("User not found with username: " + username);
    }

    @Transactional
    public UserDetails loadUserByPhone(String phoneNumber) throws UsernameNotFoundException {
        User user = userRepository.findByPhone(phoneNumber)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with phone number: " + phoneNumber));

        return user;
    }
}

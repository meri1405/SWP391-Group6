package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.impl;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.RoleRepository;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.InternalAuthenticationServiceException;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.context.annotation.Lazy;

import java.util.Map;
import java.util.Optional;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService{

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    @Lazy
    private AuthenticationManager authenticationManager;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauth2User = super.loadUser(userRequest);

        try {
            return processOAuth2User(userRequest, oauth2User);
        } catch (Exception ex) {
            throw new InternalAuthenticationServiceException(ex.getMessage(), ex.getCause());
        }
    }

    private OAuth2User processOAuth2User(OAuth2UserRequest oAuth2UserRequest, OAuth2User oAuth2User) {
        // Extract OAuth2 user attributes
        Map<String, Object> attributes = oAuth2User.getAttributes();

        String email = (String) attributes.get("email");
        String providerId = (String) attributes.get("sub");

        // Check if user exists by email since we're not storing providerId in the database
        Optional<User> userOptional = userRepository.findByEmail(email);

        User user;
        if (userOptional.isPresent()) {
            user = userOptional.get();
            // Update existing user with new information from OAuth provider
            user = updateExistingUser(user, attributes);

            // Only staff roles (ADMIN, MANAGER, SCHOOLNURSE) can use OAuth2
            String roleName = user.getRole().getRoleName();
            if (!isStaffRole(roleName)) {
                throw new OAuth2AuthenticationException(
                    new OAuth2Error("unauthorized_user"),
                    "This account doesn't have permission to use Google login");
            }
        } else {
            // We don't allow new user registration through OAuth
            // This should be handled through admin registration
            throw new OAuth2AuthenticationException(
                new OAuth2Error("user_not_found"),
                "No account found with this email. Please contact administrator.");
        }

        // Set the attributes from OAuth2 to make the User compatible with OAuth2User
        user.setAttributes(attributes);

        return user;
    }

    private User updateExistingUser(User user, Map<String, Object> attributes) {
        // Update user information from OAuth provider if needed
        String email = (String) attributes.get("email");
        String firstName = (String) attributes.get("given_name");
        String lastName = (String) attributes.get("family_name");

        // Only update if different
        if (!user.getEmail().equals(email)) {
            user.setEmail(email);
        }

        if (firstName != null && !user.getFirstName().equals(firstName)) {
            user.setFirstName(firstName);
        }

        if (lastName != null && !user.getLastName().equals(lastName)) {
            user.setLastName(lastName);
        }

        return userRepository.save(user);
    }

    private boolean isStaffRole(String roleName) {
        return "ADMIN".equalsIgnoreCase(roleName) ||
               "MANAGER".equalsIgnoreCase(roleName) ||
               "SCHOOLNURSE".equalsIgnoreCase(roleName);
    }
}

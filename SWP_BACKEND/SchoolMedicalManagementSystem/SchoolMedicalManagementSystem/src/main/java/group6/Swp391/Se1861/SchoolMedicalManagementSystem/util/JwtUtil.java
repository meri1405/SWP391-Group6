package group6.Swp391.Se1861.SchoolMedicalManagementSystem.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Function;

@Component
public class JwtUtil {
    private static final Logger logger = LoggerFactory.getLogger(JwtUtil.class);

    @Value("${app.jwt.secret:defaultsecretkeywhichislongenoughforsecuritypurposes}")
    private String jwtSecret;

    @Value("${app.jwt.expiration:86400000}") // Default 24 hours
    private int jwtExpirationMs;

    // Generate key from the secret
    private Key getSigningKey() {
        byte[] keyBytes = jwtSecret.getBytes();
        return Keys.hmacShaKeyFor(keyBytes);
    }    // Extract username from token
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // Alias method for compatibility
    public String getUserNameFromJwtToken(String token) {
        return extractUsername(token);
    }

    // Extract expiration date from token
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    // Extract claim from token
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    // Extract all claims from token
    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // Check if token has expired
    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    // Generate token from UserDetails
    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        return createToken(claims, userDetails.getUsername());
    }

    // Generate token from Authentication
    public String generateToken(Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        return generateToken(userDetails);
    }

    // Create token
    private String createToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }    // Validate token
    public Boolean validateToken(String token, UserDetails userDetails) {
        // Check if token is blacklisted
        if (blacklistedTokens.contains(token)) {
            logger.warn("JWT token is blacklisted");
            return false;
        }
        
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }// Validate token without UserDetails
    public boolean validateToken(String token) {
        try {
            // Check if token is blacklisted
            if (blacklistedTokens.contains(token)) {
                logger.warn("JWT token is blacklisted");
                return false;
            }

            Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(token);

            // If parsing succeeds, also check if the token has expired
            if (isTokenExpired(token)) {
                logger.warn("JWT token is expired");
                return false;
            }

            return true;
        } catch (SignatureException e) {
            logger.error("Invalid JWT signature: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            logger.error("Invalid JWT token: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            logger.error("JWT token is expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            logger.error("JWT token is unsupported: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.error("JWT claims string is empty: {}", e.getMessage());
        } catch (Exception e) {
            logger.error("JWT validation error: {}", e.getMessage());
        }        return false;
    }

    // Alias method for compatibility
    public boolean validateJwtToken(String token) {
        return validateToken(token);
    }

    // Add a set to store invalidated tokens
    private final Set<String> blacklistedTokens = Collections.newSetFromMap(new ConcurrentHashMap<>());

    /**
     * Invalidate a token by adding it to the blacklist
     *
     * @param token The token to invalidate
     */
    public void invalidateToken(String token) {
        blacklistedTokens.add(token);
    }

    /**
     * Clean up expired tokens from the blacklist
     * This method should be scheduled to run periodically
     */
    @Scheduled(fixedRate = 3600000) // Run every hour
    public void cleanupExpiredTokens() {
        Iterator<String> iterator = blacklistedTokens.iterator();
        while (iterator.hasNext()) {
            String token = iterator.next();
            try {
                Claims claims = Jwts.parser().setSigningKey(jwtSecret).parseClaimsJws(token).getBody();
                Date expiration = claims.getExpiration();
                if (expiration.before(new Date())) {
                    iterator.remove();
                }
            } catch (Exception e) {
                // If we can't parse the token, it's invalid, so remove it
                iterator.remove();
            }
        }
    }
}

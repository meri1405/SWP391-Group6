package group6.Swp391.Se1861.SchoolMedicalManagementSystem.util;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.HashMap;
import java.util.Map;

/**
 * Utility class for creating standardized API responses
 */
public class ResponseUtils {
    
    /**
     * Create a success response with data
     */
    public static ResponseEntity<Map<String, Object>> success(Object data) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", data);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Create a success response with custom message and data
     */
    public static ResponseEntity<Map<String, Object>> success(String message, Object data) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", message);
        response.put("data", data);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Create a success response with only message
     */
    public static ResponseEntity<Map<String, Object>> success(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", message);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Create an error response with HTTP status and message
     */
    public static ResponseEntity<Map<String, Object>> error(HttpStatus status, String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("error", status.getReasonPhrase());
        response.put("message", message);
        return ResponseEntity.status(status).body(response);
    }
    
    /**
     * Create an error response with custom error type and message
     */
    public static ResponseEntity<Map<String, Object>> error(HttpStatus status, String error, String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("error", error);
        response.put("message", message);
        return ResponseEntity.status(status).body(response);
    }
    
    /**
     * Create a bad request response
     */
    public static ResponseEntity<Map<String, Object>> badRequest(String message) {
        return error(HttpStatus.BAD_REQUEST, message);
    }
    
    /**
     * Create a not found response
     */
    public static ResponseEntity<Map<String, Object>> notFound(String message) {
        return error(HttpStatus.NOT_FOUND, message);
    }
    
    /**
     * Create a forbidden response
     */
    public static ResponseEntity<Map<String, Object>> forbidden(String message) {
        return error(HttpStatus.FORBIDDEN, message);
    }
    
    /**
     * Create an internal server error response
     */
    public static ResponseEntity<Map<String, Object>> internalServerError(String message) {
        return error(HttpStatus.INTERNAL_SERVER_ERROR, message);
    }
    
    /**
     * Create an unauthorized response
     */
    public static ResponseEntity<Map<String, Object>> unauthorized(String message) {
        return error(HttpStatus.UNAUTHORIZED, message);
    }
} 
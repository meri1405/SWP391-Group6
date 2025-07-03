package group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto;

import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.databind.JsonNode;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.HealthCheckCategory;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateHealthCheckCampaignRequest {
    private String name;
    private String description;
    private LocalDate startDate;
    private LocalDate endDate;
    private String location;
    private Set<HealthCheckCategory> categories;
    private Integer minAge;
    private Integer maxAge;
    private Set<String> targetClasses;
    
    /**
     * Custom setter to handle both string and array inputs for targetClasses
     * Supports:
     * - Single string: "1A" -> ["1A"]
     * - Comma-separated string: "1A,1B,1C" -> ["1A", "1B", "1C"]  
     * - Array: ["1A", "1B", "1C"] -> ["1A", "1B", "1C"]
     */
    @JsonSetter("targetClasses")
    public void setTargetClasses(JsonNode node) {
        this.targetClasses = new HashSet<>();
        
        if (node == null || node.isNull()) {
            return;
        }
        
        if (node.isTextual()) {
            // Handle string input
            String classesStr = node.asText().trim();
            if (!classesStr.isEmpty()) {
                this.targetClasses = Arrays.stream(classesStr.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toSet());
            }
        } else if (node.isArray()) {
            // Handle array input
            for (JsonNode classNode : node) {
                if (classNode.isTextual()) {
                    String className = classNode.asText().trim();
                    if (!className.isEmpty()) {
                        this.targetClasses.add(className);
                    }
                }
            }
        }
    }
}

package group6.Swp391.Se1861.SchoolMedicalManagementSystem.controller;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.HealthCheckResultDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.HealthCheckResult;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.Student;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.HealthCheckCategory;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.ResultStatus;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IHealthCheckResultService;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/health-check/results")
@RequiredArgsConstructor
public class HealthCheckResultController {

    private final IHealthCheckResultService resultService;
    private final IUserService userService;

    @PostMapping
    @PreAuthorize("hasRole('SCHOOLNURSE')")
    public ResponseEntity<?> recordResult(@RequestBody HealthCheckResultDTO dto,
                                         @AuthenticationPrincipal UserDetails userDetails) {
        Optional<User> userOptional = userService.findByUsername(userDetails.getUsername());
        if (userOptional.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found");
        }
        User nurse = userOptional.get();

        HealthCheckResult result = resultService.recordResult(
            dto.getFormId(),
            dto.getCategory(),
            dto.getWeight(),
            dto.getHeight(),
            nurse,
            dto.isAbnormal(),
            dto.getResultNotes(),
            dto.getRecommendations(),
            dto.getStatus()
        );

        return ResponseEntity.ok(Map.of(
            "message", "Health check result recorded successfully",
            "result", result
        ));
    }

    @PutMapping("/{resultId}/notified")
    @PreAuthorize("hasRole('SCHOOLNURSE')")
    public ResponseEntity<?> markAsNotified(@PathVariable Long resultId,
                                           @RequestParam(defaultValue = "false") boolean parent,
                                           @RequestParam(defaultValue = "false") boolean manager) {
        HealthCheckResult result = resultService.markAsNotified(resultId, parent, manager);
        return ResponseEntity.ok(Map.of(
            "message", "Notification status updated",
            "result", result
        ));
    }

    @PutMapping("/{resultId}/synced")
    @PreAuthorize("hasRole('SCHOOLNURSE')")
    public ResponseEntity<?> markAsSynced(@PathVariable Long resultId) {
        HealthCheckResult result = resultService.markAsSynced(resultId);
        return ResponseEntity.ok(Map.of(
            "message", "Result marked as synced to health profile",
            "result", result
        ));
    }

    @GetMapping("/{resultId}")
    @PreAuthorize("hasAnyRole('SCHOOLNURSE', 'MANAGER', 'PARENT')")
    public ResponseEntity<?> getResultById(@PathVariable Long resultId,
                                          @AuthenticationPrincipal UserDetails userDetails) {
        Optional<User> userOptional = userService.findByUsername(userDetails.getUsername());
        if (userOptional.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found");
        }
        User user = userOptional.get();

        HealthCheckResult result = resultService.getResultById(resultId);

        // If user is a parent, verify they are authorized to view this result
        boolean isParent = user.getRole().getRoleName().equals("PARENT");
        if (isParent) {
            boolean isAuthorized = false;
            Student student = result.getStudent();

            // Check if the parent is associated with the student
            if (student.getFather() != null && student.getFather().getId().equals(user.getId())) {
                isAuthorized = true;
            } else if (student.getMother() != null && student.getMother().getId().equals(user.getId())) {
                isAuthorized = true;
            }

            if (!isAuthorized) {
                return ResponseEntity.status(403).body("You are not authorized to view this result");
            }
        }

        return ResponseEntity.ok(result);
    }

    @GetMapping("/form/{formId}")
    @PreAuthorize("hasAnyRole('SCHOOLNURSE', 'MANAGER')")
    public ResponseEntity<?> getResultsByForm(@PathVariable Long formId) {
        List<HealthCheckResult> results = resultService.getResultsByForm(formId);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('SCHOOLNURSE', 'MANAGER', 'PARENT')")
    public ResponseEntity<?> getResultsByStudent(@PathVariable Long studentId,
                                               @AuthenticationPrincipal UserDetails userDetails) {
        Optional<User> userOptional = userService.findByUsername(userDetails.getUsername());
        if (userOptional.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found");
        }
        User user = userOptional.get();

        // If user is a parent, verify they are authorized to view this student's results
        boolean isParent = user.getRole().getRoleName().equals("PARENT");
        if (isParent) {
            boolean isAuthorized = userService.isParentOfStudent(user.getId(), studentId);
            if (!isAuthorized) {
                return ResponseEntity.status(403).body("You are not authorized to view results for this student");
            }
        }

        List<HealthCheckResult> results = resultService.getResultsByStudent(studentId);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/profile/{healthProfileId}")
    @PreAuthorize("hasAnyRole('SCHOOLNURSE', 'MANAGER')")
    public ResponseEntity<?> getResultsByHealthProfile(@PathVariable Long healthProfileId) {
        List<HealthCheckResult> results = resultService.getResultsByHealthProfile(healthProfileId);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/category/{category}")
    @PreAuthorize("hasAnyRole('SCHOOLNURSE', 'MANAGER')")
    public ResponseEntity<?> getResultsByCategory(@PathVariable String category) {
        HealthCheckCategory healthCheckCategory = HealthCheckCategory.valueOf(category.toUpperCase());
        List<HealthCheckResult> results = resultService.getResultsByCategory(healthCheckCategory);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/abnormal")
    @PreAuthorize("hasAnyRole('SCHOOLNURSE', 'MANAGER')")
    public ResponseEntity<?> getAbnormalResults() {
        List<HealthCheckResult> results = resultService.getAbnormalResults();
        return ResponseEntity.ok(results);
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('SCHOOLNURSE', 'MANAGER')")
    public ResponseEntity<?> getResultsByStatus(@PathVariable String status) {
        ResultStatus resultStatus = ResultStatus.valueOf(status.toUpperCase());
        List<HealthCheckResult> results = resultService.getResultsByStatus(resultStatus);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/campaign/{campaignId}")
    @PreAuthorize("hasAnyRole('SCHOOLNURSE', 'MANAGER')")
    public ResponseEntity<?> getResultsByCampaign(@PathVariable Long campaignId) {
        List<HealthCheckResult> results = resultService.getResultsByCampaign(campaignId);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/campaign/{campaignId}/category/{category}")
    @PreAuthorize("hasAnyRole('SCHOOLNURSE', 'MANAGER')")
    public ResponseEntity<?> getResultsByCampaignAndCategory(@PathVariable Long campaignId,
                                                           @PathVariable String category) {
        HealthCheckCategory healthCheckCategory = HealthCheckCategory.valueOf(category.toUpperCase());
        List<HealthCheckResult> results = resultService.getResultsByCampaignAndCategory(campaignId, healthCheckCategory);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/campaign/{campaignId}/abnormal/count")
    @PreAuthorize("hasAnyRole('SCHOOLNURSE', 'MANAGER')")
    public ResponseEntity<?> countAbnormalResultsByCampaign(@PathVariable Long campaignId) {
        int count = resultService.countAbnormalResultsByCampaign(campaignId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    @GetMapping("/parent/children")
    @PreAuthorize("hasRole('PARENT')")
    public ResponseEntity<?> getResultsForParentChildren(@AuthenticationPrincipal UserDetails userDetails) {
        Optional<User> userOptional = userService.findByUsername(userDetails.getUsername());
        if (userOptional.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found");
        }
        User parent = userOptional.get();

        // This would need to be implemented in the service to get all results for all children of this parent
        List<HealthCheckResult> results = resultService.getResultsForParentChildren(parent.getId());
        return ResponseEntity.ok(results);
    }
}

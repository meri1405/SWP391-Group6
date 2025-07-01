package group6.Swp391.Se1861.SchoolMedicalManagementSystem.controller;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.HealthCheckForm;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.Student;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.enums.FormStatus;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.HealthCheckFormDTO;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IHealthCheckFormService;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IStudentService;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@RestController
@RequestMapping("/api/health-check/forms")
@RequiredArgsConstructor
public class HealthCheckFormController {

    private final IHealthCheckFormService formService;
    private final IUserService userService;
    private final IStudentService studentService;

    @PostMapping("/campaign/{campaignId}/students")
    @PreAuthorize("hasRole('SCHOOLNURSE')")
    public ResponseEntity<?> generateFormsForStudents(@PathVariable Long campaignId,
                                                     @RequestBody List<Long> studentIds) {
        List<HealthCheckForm> forms = formService.generateFormsForCampaign(campaignId, studentIds);
        return ResponseEntity.ok(Map.of(
            "message", "Generated " + forms.size() + " notification forms",
            "forms", forms
        ));
    }

    @PostMapping("/campaign/{campaignId}/age-range")
    @PreAuthorize("hasRole('SCHOOLNURSE')")
    public ResponseEntity<?> generateFormsByAgeRange(@PathVariable Long campaignId,
                                                    @RequestParam int minAge,
                                                    @RequestParam int maxAge) {
        List<HealthCheckForm> forms = formService.generateFormsByAgeRange(campaignId, minAge, maxAge);
        return ResponseEntity.ok(Map.of(
            "message", "Generated " + forms.size() + " notification forms by age range",
            "forms", forms
        ));
    }

    @GetMapping("/campaign/{campaignId}/eligible-students")
    @PreAuthorize("hasRole('SCHOOLNURSE')")
    public ResponseEntity<?> getEligibleStudentsWithFilters(@PathVariable Long campaignId,
                                                           @RequestParam(required = false) Set<String> classNames,
                                                           @RequestParam(required = false) Integer minAge,
                                                           @RequestParam(required = false) Integer maxAge) {
        List<group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.StudentDTO> students =
            studentService.getEligibleStudentsForClasses(classNames, minAge, maxAge);

        String message = "Found " + students.size() + " eligible students";
        if (classNames != null && !classNames.isEmpty()) {
            message += " for classes: " + String.join(", ", classNames);
        }
        if (minAge != null && maxAge != null) {
            message += " with age range: " + minAge + "-" + maxAge;
        }

        return ResponseEntity.ok(Map.of(
            "message", message,
            "students", students
        ));
    }

    @PostMapping("/campaign/{campaignId}/class")
    @PreAuthorize("hasRole('SCHOOLNURSE')")
    public ResponseEntity<?> generateFormsByClass(@PathVariable Long campaignId,
                                                 @RequestParam String className) {
        List<HealthCheckForm> forms = formService.generateFormsByClass(campaignId, className);
        return ResponseEntity.ok(Map.of(
            "message", "Generated " + forms.size() + " notification forms for class " + className,
            "forms", forms
        ));
    }

    @PutMapping("/{formId}/confirm")
    @PreAuthorize("hasRole('PARENT')")
    public ResponseEntity<?> confirmForm(@PathVariable Long formId,
                                        @RequestParam(required = false) String parentNote,
                                        @AuthenticationPrincipal UserDetails userDetails) {
        // Get the authenticated parent
        Optional<User> userOptional = userService.findByUsername(userDetails.getUsername());
        if (userOptional.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found");
        }
        User parent = userOptional.get();

        // Get the form and verify it belongs to this parent
        HealthCheckForm form = formService.getFormById(formId);
        if (!form.getParent().getId().equals(parent.getId())) {
            return ResponseEntity.status(403).body("You are not authorized to confirm this form");
        }

        form = formService.updateFormStatus(formId, FormStatus.CONFIRMED, parentNote);
        return ResponseEntity.ok(Map.of(
            "message", "Form confirmed successfully",
            "form", form
        ));
    }

    @PutMapping("/{formId}/decline")
    @PreAuthorize("hasRole('PARENT')")
    public ResponseEntity<?> declineForm(@PathVariable Long formId,
                                        @RequestParam(required = false) String parentNote,
                                        @AuthenticationPrincipal UserDetails userDetails) {
        // Get the authenticated parent
        Optional<User> userOptional = userService.findByUsername(userDetails.getUsername());
        if (userOptional.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found");
        }
        User parent = userOptional.get();

        // Get the form and verify it belongs to this parent
        HealthCheckForm form = formService.getFormById(formId);
        if (!form.getParent().getId().equals(parent.getId())) {
            return ResponseEntity.status(403).body("You are not authorized to decline this form");
        }

        form = formService.updateFormStatus(formId, FormStatus.DECLINED, parentNote);
        return ResponseEntity.ok(Map.of(
            "message", "Form declined",
            "form", form
        ));
    }

    @PutMapping("/{formId}/schedule")
    @PreAuthorize("hasRole('SCHOOLNURSE')")
    public ResponseEntity<?> scheduleAppointment(@PathVariable Long formId,
                                               @RequestParam LocalDateTime appointmentTime,
                                               @RequestParam String appointmentLocation) {
        HealthCheckForm form = formService.scheduleAppointment(formId, appointmentTime, appointmentLocation);
        return ResponseEntity.ok(Map.of(
            "message", "Appointment scheduled successfully",
            "form", form
        ));
    }

    @PutMapping("/{formId}/check-in")
    @PreAuthorize("hasRole('SCHOOLNURSE')")
    public ResponseEntity<?> checkInStudent(@PathVariable Long formId) {
        HealthCheckForm form = formService.checkInStudent(formId);
        return ResponseEntity.ok(Map.of(
            "message", "Student checked in successfully",
            "form", form
        ));
    }

    @GetMapping("/{formId}")
    @PreAuthorize("hasAnyRole('SCHOOLNURSE', 'MANAGER', 'PARENT')")
    public ResponseEntity<?> getFormById(@PathVariable Long formId,
                                        @AuthenticationPrincipal UserDetails userDetails) {
        // Get the authenticated user
        Optional<User> userOptional = userService.findByUsername(userDetails.getUsername());
        if (userOptional.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found");
        }
        User user = userOptional.get();

        // Get the form
        HealthCheckForm form = formService.getFormById(formId);

        // If user is a parent, check if they're authorized to see this form
        boolean isParent = user.getRole().getRoleName().equals("PARENT");
        if (isParent && !form.getParent().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body("You are not authorized to view this form");
        }

        // Return DTO instead of entity
        HealthCheckFormDTO formDTO = formService.getFormDTOById(formId);
        return ResponseEntity.ok(formDTO);
    }

    @GetMapping("/campaign/{campaignId}")
    @PreAuthorize("hasAnyRole('SCHOOLNURSE', 'MANAGER')")
    public ResponseEntity<?> getFormsByCampaign(@PathVariable Long campaignId) {
        List<HealthCheckForm> forms = formService.getFormsByCampaign(campaignId);
        return ResponseEntity.ok(forms);
    }

    @GetMapping("/campaign/{campaignId}/status/{status}")
    @PreAuthorize("hasAnyRole('SCHOOLNURSE', 'MANAGER')")
    public ResponseEntity<?> getFormsByCampaignAndStatus(@PathVariable Long campaignId,
                                                        @PathVariable String status) {
        FormStatus formStatus = FormStatus.valueOf(status.toUpperCase());
        List<HealthCheckForm> forms = formService.getFormsByCampaignAndStatus(campaignId, formStatus);
        return ResponseEntity.ok(forms);
    }

    @GetMapping("/parent")
    @PreAuthorize("hasRole('PARENT')")
    public ResponseEntity<?> getFormsByParent(@AuthenticationPrincipal UserDetails userDetails) {
        Optional<User> userOptional = userService.findByUsername(userDetails.getUsername());
        if (userOptional.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found");
        }
        User parent = userOptional.get();
        List<HealthCheckForm> forms = formService.getFormsByParent(parent);
        return ResponseEntity.ok(forms);
    }

    @GetMapping("/parent/status/{status}")
    @PreAuthorize("hasRole('PARENT')")
    public ResponseEntity<?> getFormsByParentAndStatus(@AuthenticationPrincipal UserDetails userDetails,
                                                      @PathVariable String status) {
        Optional<User> userOptional = userService.findByUsername(userDetails.getUsername());
        if (userOptional.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found");
        }
        User parent = userOptional.get();
        FormStatus formStatus = FormStatus.valueOf(status.toUpperCase());
        List<HealthCheckForm> forms = formService.getFormsByParentAndStatus(parent, formStatus);
        return ResponseEntity.ok(forms);
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('SCHOOLNURSE', 'MANAGER')")
    public ResponseEntity<?> getFormsByStudent(@PathVariable Long studentId) {
        Student student = new Student();
        student.setStudentID(studentId);
        List<HealthCheckForm> forms = formService.getFormsByStudent(student);
        return ResponseEntity.ok(forms);
    }

    @GetMapping("/campaign/{campaignId}/count/confirmed")
    @PreAuthorize("hasAnyRole('SCHOOLNURSE', 'MANAGER')")
    public ResponseEntity<?> getConfirmedCountByCampaign(@PathVariable Long campaignId) {
        int count = formService.getConfirmedCountByCampaign(campaignId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    @GetMapping("/campaign/{campaignId}/count/pending")
    @PreAuthorize("hasAnyRole('SCHOOLNURSE', 'MANAGER')")
    public ResponseEntity<?> getPendingCountByCampaign(@PathVariable Long campaignId) {
        int count = formService.getPendingCountByCampaign(campaignId);
        return ResponseEntity.ok(Map.of("count", count));
    }
}

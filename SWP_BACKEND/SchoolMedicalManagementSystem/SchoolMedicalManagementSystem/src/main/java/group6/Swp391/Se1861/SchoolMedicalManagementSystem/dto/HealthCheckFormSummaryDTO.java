package group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto;

import java.time.LocalDateTime;
import java.util.Set;

public class HealthCheckFormSummaryDTO {
    private Long id;
    private String status;
    private LocalDateTime sentAt;
    private LocalDateTime respondedAt;
    private String parentNote;
    private LocalDateTime appointmentTime;
    private String appointmentLocation;
    
    // Campaign summary info
    private Long campaignId;
    private String campaignName;
    private String campaignDescription;
    private String campaignLocation;
    private String campaignStartDate;
    private String campaignEndDate;
    private String campaignStatus;
    private Integer minAge;
    private Integer maxAge;
    private Set<String> targetClasses;
    
    // Student info
    private Long studentId;
    private String studentFullName;
    private String studentClassName;
    private Integer studentAge;
    private String studentGender;
    
    // Simplified nurse info
    private String nurseFullName;
    private String nurseEmail;
    private String nursePhone;
    
    // Constructors
    public HealthCheckFormSummaryDTO() {}
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public LocalDateTime getSentAt() { return sentAt; }
    public void setSentAt(LocalDateTime sentAt) { this.sentAt = sentAt; }
    
    public LocalDateTime getRespondedAt() { return respondedAt; }
    public void setRespondedAt(LocalDateTime respondedAt) { this.respondedAt = respondedAt; }
    
    public String getParentNote() { return parentNote; }
    public void setParentNote(String parentNote) { this.parentNote = parentNote; }
    
    public LocalDateTime getAppointmentTime() { return appointmentTime; }
    public void setAppointmentTime(LocalDateTime appointmentTime) { this.appointmentTime = appointmentTime; }
    
    public String getAppointmentLocation() { return appointmentLocation; }
    public void setAppointmentLocation(String appointmentLocation) { this.appointmentLocation = appointmentLocation; }
    
    public Long getCampaignId() { return campaignId; }
    public void setCampaignId(Long campaignId) { this.campaignId = campaignId; }
    
    public String getCampaignName() { return campaignName; }
    public void setCampaignName(String campaignName) { this.campaignName = campaignName; }
    
    public String getCampaignDescription() { return campaignDescription; }
    public void setCampaignDescription(String campaignDescription) { this.campaignDescription = campaignDescription; }
    
    public String getCampaignLocation() { return campaignLocation; }
    public void setCampaignLocation(String campaignLocation) { this.campaignLocation = campaignLocation; }
    
    public String getCampaignStartDate() { return campaignStartDate; }
    public void setCampaignStartDate(String campaignStartDate) { this.campaignStartDate = campaignStartDate; }
    
    public String getCampaignEndDate() { return campaignEndDate; }
    public void setCampaignEndDate(String campaignEndDate) { this.campaignEndDate = campaignEndDate; }
    
    public String getCampaignStatus() { return campaignStatus; }
    public void setCampaignStatus(String campaignStatus) { this.campaignStatus = campaignStatus; }
    
    public Integer getMinAge() { return minAge; }
    public void setMinAge(Integer minAge) { this.minAge = minAge; }
    
    public Integer getMaxAge() { return maxAge; }
    public void setMaxAge(Integer maxAge) { this.maxAge = maxAge; }
    
    public Set<String> getTargetClasses() { return targetClasses; }
    public void setTargetClasses(Set<String> targetClasses) { this.targetClasses = targetClasses; }
    
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    
    public String getStudentFullName() { return studentFullName; }
    public void setStudentFullName(String studentFullName) { this.studentFullName = studentFullName; }
    
    public String getStudentClassName() { return studentClassName; }
    public void setStudentClassName(String studentClassName) { this.studentClassName = studentClassName; }
    
    public Integer getStudentAge() { return studentAge; }
    public void setStudentAge(Integer studentAge) { this.studentAge = studentAge; }
    
    public String getStudentGender() { return studentGender; }
    public void setStudentGender(String studentGender) { this.studentGender = studentGender; }
    
    public String getNurseFullName() { return nurseFullName; }
    public void setNurseFullName(String nurseFullName) { this.nurseFullName = nurseFullName; }
    
    public String getNurseEmail() { return nurseEmail; }
    public void setNurseEmail(String nurseEmail) { this.nurseEmail = nurseEmail; }
    
    public String getNursePhone() { return nursePhone; }
    public void setNursePhone(String nursePhone) { this.nursePhone = nursePhone; }
} 
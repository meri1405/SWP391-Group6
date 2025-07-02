package group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FirebaseConfigResponse {
    private String webApiKey;
    private String projectId;
    private String authDomain;
    private String messagingSenderId;
    private String appId;
    
    public FirebaseConfigResponse(String webApiKey, String projectId) {
        this.webApiKey = webApiKey;
        this.projectId = projectId;
        this.authDomain = projectId + ".firebaseapp.com";
        this.messagingSenderId = "defaultSenderId";
        this.appId = "defaultAppId";
    }
}

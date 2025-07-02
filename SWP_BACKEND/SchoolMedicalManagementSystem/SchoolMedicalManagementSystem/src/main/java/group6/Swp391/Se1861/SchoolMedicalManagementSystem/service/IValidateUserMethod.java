package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.model.User;

public interface IValidateUserMethod {

    void validateUserByRole(User user, String roleName);

}

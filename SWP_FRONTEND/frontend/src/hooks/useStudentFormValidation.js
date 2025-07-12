// ==================== STUDENT FORM VALIDATION HOOK ====================
// Custom hook for handling all validation logic in student form

import { validatePhone } from "../utils/phoneValidator";
import { VALIDATION_MESSAGES, FORM_FIELDS } from "../constants/studentFormConstants";

/**
 * Custom hook for student form validation logic
 * @param {Object} form - Ant Design form instance
 * @returns {Object} Validation functions
 */
export const useStudentFormValidation = (form) => {
  /**
   * Create validator for parent information
   * Validates that if any parent info is provided, all required fields are filled
   * @param {string} parentType - 'father' or 'mother'
   * @returns {Object} Validator object for Ant Design Form
   */
  const createParentValidator = (parentType) => {
    return {
      validator: async (rule) => {
        if (!form) return Promise.resolve();
        
        const values = form.getFieldsValue();
        
        const phoneField = `${parentType}_phone`;
        const firstNameField = `${parentType}_firstName`;
        const lastNameField = `${parentType}_lastName`;
        const dobField = `${parentType}_dob`;
        const jobTitleField = `${parentType}_jobTitle`;

        const phone = values[phoneField];
        const firstName = values[firstNameField];
        const lastName = values[lastNameField];
        const dob = values[dobField];
        const jobTitle = values[jobTitleField];

        const currentField = rule.field;

        // If phone is provided, validate that all required fields are filled
        if (phone && phone.trim()) {
          if (currentField === firstNameField && (!firstName || !firstName.trim())) {
            return Promise.reject(new Error(VALIDATION_MESSAGES.PARENT.FIRST_NAME_REQUIRED_WITH_PHONE));
          }
          
          if (currentField === lastNameField && (!lastName || !lastName.trim())) {
            return Promise.reject(new Error(VALIDATION_MESSAGES.PARENT.LAST_NAME_REQUIRED_WITH_PHONE));
          }
          
          if (currentField === dobField && !dob) {
            return Promise.reject(new Error(VALIDATION_MESSAGES.PARENT.DOB_REQUIRED_WITH_PHONE));
          }
          
          if (currentField === jobTitleField && (!jobTitle || !jobTitle.trim())) {
            return Promise.reject(new Error(VALIDATION_MESSAGES.PARENT.JOB_TITLE_REQUIRED_WITH_PHONE));
          }

          // Validate phone format
          if (currentField === phoneField) {
            const phoneError = validatePhone(phone);
            if (phoneError) {
              return Promise.reject(new Error(phoneError));
            }
          }
        }

        // If name info is provided, validate that phone is provided
        if ((firstName && firstName.trim()) || (lastName && lastName.trim())) {
          if (currentField === phoneField && (!phone || !phone.trim())) {
            return Promise.reject(new Error(VALIDATION_MESSAGES.PARENT.PHONE_REQUIRED_WITH_INFO));
          }
        }

        return Promise.resolve();
      },
    };
  };

  /**
   * Create phone validator for parent
   * @returns {Object} Validator object for phone validation
   */
  const createPhoneValidator = () => {
    return {
      validator: (_, value) => {
        if (value && value.trim()) {
          const phoneError = validatePhone(value);
          if (phoneError) {
            return Promise.reject(new Error(phoneError));
          }
        }
        return Promise.resolve();
      },
    };
  };

  /**
   * Get validation rules for student fields
   * @returns {Object} Object containing validation rules for all student fields
   */
  const getStudentValidationRules = () => {
    return {
      [FORM_FIELDS.STUDENT.FIRST_NAME]: [
        { required: true, message: VALIDATION_MESSAGES.STUDENT.FIRST_NAME_REQUIRED }
      ],
      [FORM_FIELDS.STUDENT.LAST_NAME]: [
        { required: true, message: VALIDATION_MESSAGES.STUDENT.LAST_NAME_REQUIRED }
      ],
      [FORM_FIELDS.STUDENT.DOB]: [
        { required: true, message: VALIDATION_MESSAGES.STUDENT.DOB_REQUIRED }
      ],
      [FORM_FIELDS.STUDENT.GENDER]: [
        { required: true, message: VALIDATION_MESSAGES.STUDENT.GENDER_REQUIRED }
      ],
      [FORM_FIELDS.STUDENT.CLASS_NAME]: [
        { required: true, message: VALIDATION_MESSAGES.STUDENT.CLASS_NAME_REQUIRED }
      ],
      [FORM_FIELDS.STUDENT.SCHOOL_YEAR]: [
        { required: true, message: VALIDATION_MESSAGES.STUDENT.SCHOOL_YEAR_REQUIRED }
      ],
      [FORM_FIELDS.STUDENT.BIRTH_PLACE]: [
        { required: true, message: VALIDATION_MESSAGES.STUDENT.BIRTH_PLACE_REQUIRED }
      ],
      [FORM_FIELDS.STUDENT.ADDRESS]: [
        { required: true, message: VALIDATION_MESSAGES.STUDENT.ADDRESS_REQUIRED }
      ],
    };
  };

  /**
   * Get validation rules for parent fields
   * @param {string} parentType - 'father' or 'mother'
   * @returns {Object} Object containing validation rules for parent fields
   */
  const getParentValidationRules = (parentType) => {
    const parentValidator = createParentValidator(parentType);
    const phoneValidator = createPhoneValidator(parentType);

    return {
      [`${parentType}_firstName`]: [parentValidator],
      [`${parentType}_lastName`]: [parentValidator],
      [`${parentType}_phone`]: [parentValidator, phoneValidator],
      [`${parentType}_dob`]: [parentValidator],
      [`${parentType}_jobTitle`]: [parentValidator],
      [`${parentType}_address`]: [parentValidator],
    };
  };

  return {
    createParentValidator,
    createPhoneValidator,
    getStudentValidationRules,
    getParentValidationRules,
  };
};

// ==================== STUDENT FORM SERVICE ====================
// Service functions for student and parent creation

import { createStudentWithParents } from "../api/studentApi";
import { DEFAULT_CITIZENSHIP } from "../constants/studentFormConstants";

/**
 * Prepare student data for API submission
 * @param {Object} formValues - Form values from the form
 * @param {Object} studentDob - Student date of birth (dayjs object)
 * @returns {Object} Formatted student data
 */
export const prepareStudentData = (formValues, studentDob) => {
  return {
    firstName: formValues.student_firstName,
    lastName: formValues.student_lastName,
    dob: studentDob.format("YYYY-MM-DD"),
    gender: formValues.student_gender,
    className: formValues.student_className,
    schoolYear: formValues.student_schoolYear,
    birthPlace: formValues.student_birthPlace,
    address: formValues.student_address,
    citizenship: DEFAULT_CITIZENSHIP,
    isDisabled: false,
  };
};

/**
 * Prepare parent data for API submission
 * @param {Object} formValues - Form values from the form
 * @param {string} parentType - Type of parent ('father' or 'mother')
 * @param {string} studentAddress - Student address to use as fallback
 * @param {boolean} isEnabled - Whether the parent has system access
 * @returns {Object|null} Formatted parent data or null if no phone provided
 */
export const prepareParentData = (formValues, parentType, studentAddress, isEnabled) => {
  const phoneField = `${parentType}_phone`;
  const firstNameField = `${parentType}_firstName`;
  const lastNameField = `${parentType}_lastName`;
  const dobField = `${parentType}_dob`;
  const jobTitleField = `${parentType}_jobTitle`;
  const addressField = `${parentType}_address`;

  const phone = formValues[phoneField];
  
  // If no phone number, don't include this parent
  if (!phone || !phone.trim()) {
    return null;
  }

  return {
    firstName: formValues[firstNameField],
    lastName: formValues[lastNameField],
    phone: formValues[phoneField],
    gender: parentType === "father" ? "M" : "F",
    jobTitle: formValues[jobTitleField],
    address: formValues[addressField] || studentAddress,
    dob: formValues[dobField].format("YYYY-MM-DD"),
    enabled: isEnabled,
  };
};

/**
 * Create complete request payload for student with parents
 * @param {Object} formValues - Form values
 * @param {Object} studentDob - Student date of birth (dayjs object)
 * @param {boolean} fatherEnabled - Whether father has system access
 * @param {boolean} motherEnabled - Whether mother has system access
 * @returns {Object} Complete request payload
 */
export const createStudentRequestPayload = (formValues, studentDob, fatherEnabled, motherEnabled) => {
  const studentData = prepareStudentData(formValues, studentDob);
  
  const requestData = {
    students: [studentData],
  };

  // Add father data if phone is provided
  const fatherData = prepareParentData(formValues, "father", formValues.student_address, fatherEnabled);
  if (fatherData) {
    requestData.father = fatherData;
  }

  // Add mother data if phone is provided
  const motherData = prepareParentData(formValues, "mother", formValues.student_address, motherEnabled);
  if (motherData) {
    requestData.mother = motherData;
  }

  return requestData;
};

/**
 * Validate that required parent information is complete
 * @param {Object} formValues - Form values
 * @param {string} parentType - Type of parent ('father' or 'mother')
 * @returns {Object} Validation result with isValid and errorMessage
 */
export const validateCompleteParentInfo = (formValues, parentType) => {
  const phoneField = `${parentType}_phone`;
  const firstNameField = `${parentType}_firstName`;
  const lastNameField = `${parentType}_lastName`;
  const dobField = `${parentType}_dob`;
  const jobTitleField = `${parentType}_jobTitle`;

  const phone = formValues[phoneField];
  
  // If no phone, no validation needed
  if (!phone || !phone.trim()) {
    return { isValid: true };
  }

  const firstName = formValues[firstNameField];
  const lastName = formValues[lastNameField];
  const dob = formValues[dobField];
  const jobTitle = formValues[jobTitleField];

  if (!firstName || !firstName.trim() || 
      !lastName || !lastName.trim() || 
      !jobTitle || !jobTitle.trim() || 
      !dob) {
    const parentLabel = parentType === "father" ? "cha" : "mẹ";
    return {
      isValid: false,
      errorMessage: `Vui lòng nhập đầy đủ thông tin bắt buộc của ${parentLabel}: họ, tên, nghề nghiệp, ngày sinh`
    };
  }

  return { isValid: true };
};

/**
 * Submit student and parent data to the API
 * @param {Object} requestData - Complete request payload
 * @returns {Promise<Object>} API response
 */
export const submitStudentWithParents = async (requestData) => {
  try {
    const response = await createStudentWithParents(requestData);
    return response;
  } catch (error) {
    throw new Error(error.message || "Có lỗi xảy ra khi tạo học sinh và phụ huynh");
  }
};

/**
 * Validate that at least one parent has phone information
 * @param {Object} formValues - Form values
 * @returns {boolean} Whether at least one parent has phone info
 */
export const hasAtLeastOneParent = (formValues) => {
  const fatherPhone = formValues.father_phone;
  const motherPhone = formValues.mother_phone;
  
  return (fatherPhone && fatherPhone.trim()) || (motherPhone && motherPhone.trim());
};

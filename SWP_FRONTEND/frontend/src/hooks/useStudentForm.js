// ==================== STUDENT FORM HOOK ====================
// Custom hook for managing student form state and business logic

import { useState, useEffect } from "react";
import { Form, message } from "antd";
import dayjs from "dayjs";
import { 
  DEFAULT_DATES, 
  GRADE_MAPPING, 
  VALIDATION_MESSAGES 
} from "../constants/studentFormConstants";
import { 
  createStudentRequestPayload,
  submitStudentWithParents,
  validateCompleteParentInfo,
  hasAtLeastOneParent
} from "../services/studentFormService";

/**
 * Custom hook for managing student form state and logic
 * @param {Function} onSuccess - Callback for successful submission
 * @param {Function} onCancel - Callback for form cancellation
 * @returns {Object} Form state and handlers
 */
export const useStudentForm = (onSuccess, onCancel) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fatherEnabled, setFatherEnabled] = useState(true);
  const [motherEnabled, setMotherEnabled] = useState(false);
  const [studentDob, setStudentDob] = useState(DEFAULT_DATES.STUDENT_DOB);
  const [hasUserSelectedDate, setHasUserSelectedDate] = useState(false);

  /**
   * Calculate automatic grade based on date of birth
   * @param {Object} dateOfBirth - dayjs date object
   * @returns {string} Calculated grade or empty string
   */
  const calculateAutoGrade = (dateOfBirth) => {
    if (!dateOfBirth) return "";

    const today = dayjs();
    const age = today.diff(dateOfBirth, "year");

    return GRADE_MAPPING[age] || "";
  };

  /**
   * Auto-fill grade when user selects date of birth
   */
  useEffect(() => {
    if (hasUserSelectedDate) {
      const autoGrade = calculateAutoGrade(studentDob);
      if (autoGrade) {
        form.setFieldsValue({ student_className: autoGrade });
      }
    }
  }, [studentDob, hasUserSelectedDate, form]);

  /**
   * Handle father access toggle - only one parent can have access
   * @param {boolean} checked - Whether father access is enabled
   */
  const handleFatherAccessChange = (checked) => {
    setFatherEnabled(checked);
    if (checked) {
      setMotherEnabled(false);
    }
  };

  /**
   * Handle mother access toggle - only one parent can have access
   * @param {boolean} checked - Whether mother access is enabled
   */
  const handleMotherAccessChange = (checked) => {
    setMotherEnabled(checked);
    if (checked) {
      setFatherEnabled(false);
    }
  };

  /**
   * Handle student date of birth change
   * @param {Object} date - dayjs date object
   * @param {string} dateString - formatted date string
   */
  const handleStudentDobChange = (date, dateString) => {
    console.log("Student DatePicker onChange:", date, "dateString:", dateString);
    setStudentDob(date);
    setHasUserSelectedDate(true);
    form.setFieldsValue({ student_dob: date });
    
    if (date) {
      console.log("Date object details:", {
        year: date.year(),
        month: date.month(),
        day: date.date(),
        formatted: date.format("DD/MM/YYYY"),
      });
    }
  };

  /**
   * Create disabled date function for student date picker
   * @returns {Function} Function to determine if a date should be disabled
   */
  const getStudentDisabledDate = () => {
    return (current) => {
      if (!current) return false;

      const today = dayjs();
      const currentYear = today.year();
      const selectedYear = current.year();

      // Disable dates in future and outside allowed age range (2-12 years)
      return (
        current > today ||
        selectedYear < currentYear - 12 ||
        selectedYear > currentYear - 2
      );
    };
  };

  /**
   * Create disabled date function for parent date picker
   * @returns {Function} Function to determine if a date should be disabled
   */
  const getParentDisabledDate = () => {
    return (current) => {
      if (!current) return false;

      const today = dayjs();
      const currentYear = today.year();
      const selectedYear = current.year();

      // Disable dates in future and outside allowed age range (18-100 years)
      return (
        current > today ||
        selectedYear < currentYear - 100 ||
        selectedYear > currentYear - 18
      );
    };
  };

  /**
   * Handle form submission
   * @param {Object} values - Form values
   */
  const handleSubmit = async (values) => {
    setLoading(true);
    
    try {
      // Validate at least one parent has information
      if (!hasAtLeastOneParent(values)) {
        message.error(VALIDATION_MESSAGES.GENERAL.AT_LEAST_ONE_PARENT);
        setLoading(false);
        return;
      }

      // Validate complete father information if phone is provided
      const fatherValidation = validateCompleteParentInfo(values, "father");
      if (!fatherValidation.isValid) {
        message.error(fatherValidation.errorMessage);
        setLoading(false);
        return;
      }

      // Validate complete mother information if phone is provided
      const motherValidation = validateCompleteParentInfo(values, "mother");
      if (!motherValidation.isValid) {
        message.error(motherValidation.errorMessage);
        setLoading(false);
        return;
      }

      // Create request payload
      const requestData = createStudentRequestPayload(
        values, 
        studentDob, 
        fatherEnabled, 
        motherEnabled
      );

      // Submit to API
      const response = await submitStudentWithParents(requestData);

      message.success("Tạo học sinh và phụ huynh thành công!");
      handleReset();
      onSuccess && onSuccess(response);
      onCancel();
      
    } catch (error) {
      message.error(error.message || "Có lỗi xảy ra khi tạo học sinh và phụ huynh");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Reset form to initial state
   */
  const handleReset = () => {
    form.resetFields();
    setStudentDob(DEFAULT_DATES.STUDENT_DOB);
    setHasUserSelectedDate(false);
    setFatherEnabled(true);
    setMotherEnabled(false);
  };

  /**
   * Handle form cancellation
   */
  const handleCancel = () => {
    handleReset();
    onCancel();
  };

  return {
    // Form instance
    form,
    
    // Loading state
    loading,
    
    // Parent access states
    fatherEnabled,
    motherEnabled,
    
    // Date states
    studentDob,
    hasUserSelectedDate,
    
    // Event handlers
    handleSubmit,
    handleCancel,
    handleFatherAccessChange,
    handleMotherAccessChange,
    handleStudentDobChange,
    
    // Utility functions
    getStudentDisabledDate,
    getParentDisabledDate,
    
    // Helper data
    defaultStudentDob: DEFAULT_DATES.STUDENT_DOB,
    defaultParentDob: DEFAULT_DATES.PARENT_DOB,
  };
};

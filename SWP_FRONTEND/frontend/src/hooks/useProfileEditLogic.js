import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';

/**
 * Custom hook for profile editing logic
 * This hook encapsulates all the common logic for editing user profiles across different roles
 * 
 * @param {Object} config - Configuration object
 * @param {Function} config.fetchProfile - Function to fetch profile data from API
 * @param {Function} config.updateProfile - Function to update profile data via API
 * @param {Object} config.initialData - Initial data for the form
 * @param {Object} config.defaultValues - Default values for form fields
 * @param {Array} config.requiredFields - Array of required field names
 * @param {Object} config.customValidators - Custom validation functions for specific fields
 * @param {Function} config.onProfileUpdate - Callback function called after successful update
 * @param {Function} config.transformDataForSubmit - Function to transform form data before API submission
 * @param {Function} config.transformDataFromAPI - Function to transform API response data for form
 */
export const useProfileEditLogic = ({
  fetchProfile,
  updateProfile,
  initialData = {},
  defaultValues = {},
  requiredFields = ['firstName', 'lastName', 'email', 'phone'],
  customValidators = {},
  onProfileUpdate,
  transformDataForSubmit,
  transformDataFromAPI,
}) => {
  // State management
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    gender: '',
    jobTitle: '',
    username: '',
    ...defaultValues,
    ...initialData,
  });
  const [errors, setErrors] = useState({});

  // Initialize form data
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData(prev => ({
        ...prev,
        ...initialData
      }));
    }
  }, [initialData]);

  // Fetch profile data from API
  const fetchProfileData = useCallback(async () => {
    if (!fetchProfile) return;

    try {
      setLoading(true);
      console.log('Fetching profile data...');
      
      const response = await fetchProfile();
      console.log('Profile data response:', response);

      let profileResponse = response;
      
      // Handle different API response structures
      if (response?.data) {
        profileResponse = response.data;
      }
      
      if (response?.success && response?.data) {
        profileResponse = response.data;
      }

      setProfileData(profileResponse);

      // Transform API data if transformer is provided
      const transformedData = transformDataFromAPI 
        ? transformDataFromAPI(profileResponse)
        : profileResponse;

      // Update form data with API response
      const updatedFormData = {
        firstName: transformedData.firstName || '',
        lastName: transformedData.lastName || '',
        email: transformedData.email || '',
        phone: transformedData.phone || '',
        address: transformedData.address || '',
        dateOfBirth: transformedData.dateOfBirth || transformedData.dob || '',
        gender: transformedData.gender || '',
        jobTitle: transformedData.jobTitle || '',
        username: transformedData.username || '',
        ...defaultValues,
        ...transformedData,
      };

      setFormData(updatedFormData);
      console.log('Updated form data:', updatedFormData);

    } catch (error) {
      console.error('Error fetching profile:', error);
      message.error('Không thể tải thông tin hồ sơ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [fetchProfile, defaultValues, transformDataFromAPI]);

  // Load profile data on mount
  useEffect(() => {
    if (fetchProfile) {
      fetchProfileData();
    }
  }, [fetchProfileData, fetchProfile]);

  // Form validation
  const validateForm = useCallback(() => {
    const newErrors = {};
    
    // Default validation rules
    const defaultValidators = {
      firstName: (value) => {
        if (!value?.trim()) return 'Tên không được để trống';
        return null;
      },
      lastName: (value) => {
        if (!value?.trim()) return 'Họ không được để trống';
        return null;
      },
      email: (value) => {
        if (!value?.trim()) return 'Email không được để trống';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Email không hợp lệ';
        return null;
      },
      phone: (value) => {
        if (!value?.trim()) return 'Số điện thoại không được để trống';
        if (!/^[0-9]{10,11}$/.test(value.replace(/\s/g, ''))) {
          return 'Số điện thoại không hợp lệ';
        }
        return null;
      },
      address: (value) => {
        if (!value?.trim()) return 'Địa chỉ không được để trống';
        return null;
      },
      dateOfBirth: (value) => {
        if (!value?.trim()) return 'Ngày sinh không được để trống';
        return null;
      },
      gender: (value) => {
        if (!value?.trim()) return 'Giới tính không được để trống';
        return null;
      },
      jobTitle: (value) => {
        if (!value?.trim()) return 'Chức vụ không được để trống';
        return null;
      },
    };
    
    const validators = { ...defaultValidators, ...customValidators };

    // Validate required fields
    requiredFields.forEach(field => {
      const validator = validators[field];
      if (validator) {
        const error = validator(formData[field]);
        if (error) {
          newErrors[field] = error;
        }
      }
    });

    // Validate optional fields that have validators
    Object.keys(validators).forEach(field => {
      if (!requiredFields.includes(field) && formData[field]) {
        const validator = validators[field];
        const error = validator(formData[field]);
        if (error) {
          newErrors[field] = error;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, requiredFields, customValidators]);

  // Handle form input changes
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  }, [errors]);

  // Handle form submission
  const handleSubmit = useCallback(async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    if (!validateForm()) {
      message.error('Vui lòng kiểm tra lại thông tin');
      return false;
    }

    if (!updateProfile) {
      message.error('Chức năng cập nhật chưa được cấu hình');
      return false;
    }

    try {
      setLoading(true);

      // Transform data for submission if transformer is provided
      const submitData = transformDataForSubmit 
        ? transformDataForSubmit(formData)
        : formData;

      console.log('Submitting profile update with:', submitData);

      const response = await updateProfile(submitData);
      console.log('Profile update response:', response);

      // Handle different API response structures
      let updatedProfile = response;
      if (response?.data) {
        updatedProfile = response.data;
      }
      if (response?.profile) {
        updatedProfile = response.profile;
      }

      // Update local state
      setProfileData(updatedProfile);
      
      // Update form data with response
      if (updatedProfile) {
        const transformedResponse = transformDataFromAPI 
          ? transformDataFromAPI(updatedProfile)
          : updatedProfile;
          
        setFormData(prev => ({
          ...prev,
          ...transformedResponse
        }));
      }

      // Exit edit mode
      setIsEditing(false);
      setErrors({});

      // Call update callback if provided
      if (onProfileUpdate) {
        onProfileUpdate(updatedProfile);
      }

      message.success('Cập nhật thông tin thành công!');
      return true;

    } catch (error) {
      console.error('Error updating profile:', error);
      message.error(
        error.message || 'Có lỗi xảy ra khi cập nhật thông tin. Vui lòng thử lại.'
      );
      return false;
    } finally {
      setLoading(false);
    }
  }, [
    validateForm, 
    updateProfile, 
    formData, 
    transformDataForSubmit, 
    transformDataFromAPI, 
    onProfileUpdate
  ]);

  // Toggle edit mode
  const toggleEditMode = useCallback(() => {
    if (isEditing) {
      // If canceling edit, reset form data to original profile data
      if (profileData) {
        const transformedData = transformDataFromAPI 
          ? transformDataFromAPI(profileData)
          : profileData;
          
        setFormData(prev => ({
          ...prev,
          ...transformedData
        }));
      }
      setErrors({});
    }
    setIsEditing(prev => !prev);
  }, [isEditing, profileData, transformDataFromAPI]);

  // Reset form to original data
  const resetForm = useCallback(() => {
    if (profileData) {
      const transformedData = transformDataFromAPI 
        ? transformDataFromAPI(profileData)
        : profileData;
        
      setFormData(prev => ({
        ...prev,
        ...transformedData
      }));
    }
    setErrors({});
  }, [profileData, transformDataFromAPI]);

  // Refresh profile data
  const refreshProfile = useCallback(() => {
    return fetchProfileData();
  }, [fetchProfileData]);

  return {
    // State
    isEditing,
    loading,
    profileData,
    formData,
    errors,
    
    // Configuration
    requiredFields,
    
    // Actions
    handleChange,
    handleSubmit,
    toggleEditMode,
    resetForm,
    refreshProfile,
    validateForm,
    
    // Setters (for advanced use cases)
    setIsEditing,
    setLoading,
    setFormData,
    setErrors,
  };
};

export default useProfileEditLogic;

// Profile configuration for different user roles
// This file contains the specific configurations for each role to use with useProfileEditLogic hook

import { getAdminProfile, updateAdminProfile } from '../api/adminApi';
import { nurseApi } from '../api/nurseApi';
import { parentApi } from '../api/parentApi';
import managerApi from '../api/managerApi';
import dayjs from 'dayjs';

/**
 * Admin Profile Configuration
 */
export const adminProfileConfig = {
  fetchProfile: async () => {
    const response = await getAdminProfile();
    return response?.data || response;
  },
  
  updateProfile: async (formData) => {
    const updateData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      jobTitle: formData.jobTitle,
      dob: formData.dateOfBirth,
      gender: formData.gender,
    };
    return await updateAdminProfile(updateData);
  },
  
  defaultValues: {
    jobTitle: 'Quản trị viên',
  },
  
  requiredFields: ['firstName', 'lastName', 'email', 'phone', 'address', 'dateOfBirth', 'gender', 'jobTitle'],
  
  transformDataFromAPI: (data) => ({
    firstName: data.firstName || '',
    lastName: data.lastName || '',
    email: data.email || '',
    phone: data.phone || '',
    address: data.address || '',
    jobTitle: data.jobTitle || 'Quản trị viên',
    username: data.username || '',
    dateOfBirth: data.dob || data.dateOfBirth || '',
    gender: data.gender || '',
  }),
  
  transformDataForSubmit: (formData) => ({
    firstName: formData.firstName,
    lastName: formData.lastName,
    email: formData.email,
    phone: formData.phone,
    address: formData.address,
    jobTitle: formData.jobTitle,
    dob: formData.dateOfBirth,
    gender: formData.gender,
  }),
};

/**
 * Manager Profile Configuration
 */
export const managerProfileConfig = {
  fetchProfile: async () => {
    return await managerApi.getManagerProfile();
  },
  
  updateProfile: async (formData) => {
    const submitData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      gender: formData.gender,
      jobTitle: formData.jobTitle,
      dob: formData.dateOfBirth || null,
    };
    return await managerApi.updateManagerProfile(submitData);
  },
  
  defaultValues: {
    jobTitle: 'Quản lý',
  },
  
  requiredFields: ['firstName', 'lastName', 'email', 'phone', 'address', 'dateOfBirth', 'gender', 'jobTitle'],
  
  transformDataFromAPI: (data) => {
    // Handle Java date array conversion
    const convertJavaDateArray = (dateArray) => {
      if (!dateArray || !Array.isArray(dateArray)) return null;
      try {
        const [year, month, day, hour = 0, minute = 0, second = 0] = dateArray;
        return dayjs(`${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')} ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`);
      } catch (error) {
        console.error("Error converting date array:", dateArray, error);
        return null;
      }
    };

    return {
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      email: data.email || '',
      phone: data.phone || '',
      address: data.address || '',
      dateOfBirth: data.dob ? (Array.isArray(data.dob) ? convertJavaDateArray(data.dob)?.format("YYYY-MM-DD") : dayjs(data.dob).format("YYYY-MM-DD")) : '',
      gender: data.gender || '',
      jobTitle: data.jobTitle || 'Quản lý',
      username: data.username || '',
    };
  },
};

/**
 * Nurse Profile Configuration
 */
export const nurseProfileConfig = {
  fetchProfile: async () => {
    return await nurseApi.getProfile();
  },
  
  updateProfile: async (formData) => {
    return await nurseApi.updateProfile(formData);
  },
  
  defaultValues: {
    jobTitle: 'Y tá Trường học',
    specialization: 'Y tá Trường học',
    department: 'Phòng Y tế',
  },
  
  requiredFields: ['firstName', 'lastName', 'email', 'phone', 'address', 'dateOfBirth', 'gender', 'jobTitle'],
  
  transformDataFromAPI: (response) => {
    // Handle nurse API response structure
    const data = response?.data || response;
    return {
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      email: data.email || '',
      phone: data.phone || '',
      address: data.address || '',
      dateOfBirth: data.dateOfBirth || '',
      gender: data.gender || '',
      jobTitle: data.jobTitle || 'Y tá Trường học',
      username: data.username || '',
    };
  },
};

/**
 * Parent Profile Configuration Factory
 * Note: Parent profile requires token-based authentication
 */
export const createParentProfileConfig = (token) => ({
  fetchProfile: async () => {
    return await parentApi.getParentProfile(token);
  },
  
  updateProfile: async (formData) => {
    const updateData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
    };

    // Include optional fields if they have values
    if (formData.address) updateData.address = formData.address;
    if (formData.jobTitle) updateData.jobTitle = formData.jobTitle;
    if (formData.dateOfBirth) updateData.dateOfBirth = formData.dateOfBirth;

    return await parentApi.updateParentProfile(token, updateData);
  },
  
  defaultValues: {
    jobTitle: 'Phụ huynh',
    address: '123 Healthcare Ave',
    dateOfBirth: '1990-01-15',
  },
  
  requiredFields: ['firstName', 'lastName', 'phone', 'address', 'dateOfBirth', 'jobTitle'],
  
  customValidators: {
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
    jobTitle: (value) => {
      if (!value?.trim()) return 'Chức vụ không được để trống';
      return null;
    },
  },
  
  transformDataFromAPI: (data) => {
    // Apply default values for missing fields
    const userAddress = data.address || '123 Healthcare Ave';
    const userJobTitle = data.jobTitle || 'PARENT';
    let userDateOfBirth = '1990-01-15'; // Default birth date
    
    if (data.dateOfBirth) {
      // Handle different date formats
      try {
        const date = dayjs(data.dateOfBirth);
        userDateOfBirth = date.isValid() ? date.format('YYYY-MM-DD') : '1990-01-15';
      } catch {
        console.warn('Invalid date format:', data.dateOfBirth);
        userDateOfBirth = '1990-01-15';
      }
    }

    return {
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      phone: data.phone || '',
      address: userAddress,
      jobTitle: userJobTitle,
      dateOfBirth: userDateOfBirth,
    };
  },
});

/**
 * Get profile configuration by role
 * @param {string} role - The user role (admin, manager, nurse, parent)
 * @returns {Object} The configuration object for the specified role
 */
export const getProfileConfigByRole = (role, token = null) => {
  const configs = {
    admin: adminProfileConfig,
    manager: managerProfileConfig,
    nurse: nurseProfileConfig,
    parent: token ? createParentProfileConfig(token) : null,
  };
  
  return configs[role] || null;
};

export default {
  adminProfileConfig,
  managerProfileConfig,
  nurseProfileConfig,
  createParentProfileConfig,
  getProfileConfigByRole,
};

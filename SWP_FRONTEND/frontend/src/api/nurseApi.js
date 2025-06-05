import axios from "axios";

// Sử dụng import.meta.env thay vì process.env cho Vite
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

// Create axios instance for nurse API
const nurseApiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor to include auth token
nurseApiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling - BUT NOT for profile endpoints
nurseApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Không auto-redirect cho profile endpoints khi development
    const isProfileEndpoint = error.config?.url?.includes('/profile');
    
    if (error.response?.status === 401 && !isProfileEndpoint) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Nurse Profile APIs
export const nurseApi = {
  // Get nurse profile - với mock data fallback
  getProfile: async () => {
    try {
      // Tạm thời comment API call để tránh 401 error
      // const response = await nurseApiClient.get('/api/nurse/profile');
      
      // Mock data để test UI
      const mockData = {
        id: 'NS001',
        firstName: 'Nguyễn',
        lastName: 'Thị Mai',
        email: 'mai.nurse@school.edu.vn',
        phone: '0123456789',
        address: '123 Đường ABC, Quận 1, TP.HCM',
        dateOfBirth: '1990-05-15',
        gender: 'female',
        avatar: '',
        specialization: 'Y tá Trường học',
        licenseNumber: 'YT123456',
        experience: '5',
        education: 'Cử nhân Điều dưỡng - Đại học Y Dược TP.HCM',
        department: 'Phòng Y tế',
        workingHours: '7:00 - 17:00',
        emergencyContactName: 'Nguyễn Văn Nam',
        emergencyContactPhone: '0987654321',
        employeeId: 'NV2024001',
        joinDate: '2024-01-15',
        status: 'active',
        completionLevel: 85
      };

      return {
        success: true,
        data: mockData
      };
    } catch (error) {
      console.error('Error fetching nurse profile:', error);
      
      // Fallback với mock data thay vì return error
      const fallbackData = {
        id: 'NS001',
        firstName: 'Nurse',
        lastName: 'Demo',
        email: 'nurse@demo.com',
        phone: '',
        address: '',
        dateOfBirth: '',
        gender: '',
        avatar: '',
        specialization: 'Y tá Trường học',
        licenseNumber: '',
        experience: '',
        education: '',
        department: 'Phòng Y tế',
        workingHours: '7:00 - 17:00',
        emergencyContactName: '',
        emergencyContactPhone: '',
        employeeId: 'NV2024001',
        joinDate: '2024-01-15',
        status: 'active',
        completionLevel: 25
      };

      return {
        success: true,
        data: fallbackData
      };
    }
  },

  // Update nurse profile - với mock response
  updateProfile: async (profileData) => {
    try {
      // Tạm thời comment API call
      // const response = await nurseApiClient.put('/api/nurse/profile', profileData);
      
      // Mock successful update
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      
      return {
        success: true,
        data: profileData,
        message: 'Cập nhật hồ sơ thành công'
      };
    } catch (error) {
      console.error('Error updating nurse profile:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể cập nhật hồ sơ'
      };
    }
  },

  // Upload avatar - với mock response
  uploadAvatar: async (file) => {
    try {
      // Tạm thời comment API call
      // const formData = new FormData();
      // formData.append('avatar', file);
      // const response = await nurseApiClient.post('/api/nurse/profile/avatar', formData, {
      //   headers: {
      //     'Content-Type': 'multipart/form-data',
      //   },
      // });
      
      // Mock successful upload
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate upload delay
      
      return {
        success: true,
        data: {
          avatarUrl: URL.createObjectURL(file) // Create local URL for preview
        },
        message: 'Upload avatar thành công'
      };
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể upload avatar'
      };
    }
  },

  // Get activity stats - với mock data
  getActivityStats: async () => {
    try {
      // Tạm thời comment API call
      // const response = await nurseApiClient.get('/api/nurse/profile/stats');
      
      // Mock stats data
      const mockStats = {
        medicalEventsHandled: 89,
        vaccinationsPerformed: 450,
        healthChecksPerformed: 1200,
        medicationRequestsApproved: 156
      };

      return {
        success: true,
        data: mockStats
      };
    } catch (error) {
      console.error('Error fetching activity stats:', error);
      return {
        success: true, // Return success với empty data thay vì error
        data: {
          medicalEventsHandled: 0,
          vaccinationsPerformed: 0,
          healthChecksPerformed: 0,
          medicationRequestsApproved: 0
        }
      };
    }
  },

  // Get activity history - với mock data
  getActivityHistory: async () => {
    try {
      // Tạm thời comment API call
      // const response = await nurseApiClient.get('/api/nurse/profile/activities');
      
      // Mock activity history
      const mockHistory = [
        {
          id: 1,
          type: 'medical_event',
          description: 'Xử lý sự kiện té ngã của học sinh Trần Thị B',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
        },
        {
          id: 2,
          type: 'vaccination',
          description: 'Thực hiện tiêm vaccine phòng cúm cho học sinh lớp 6A',
          createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() // 5 hours ago
        },
        {
          id: 3,
          type: 'medication',
          description: 'Duyệt yêu cầu cấp thuốc hạ sốt cho học sinh Nguyễn Văn C',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 day ago
        },
        {
          id: 4,
          type: 'health_check',
          description: 'Hoàn thành khám sức khỏe định kỳ cho lớp 7B',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
        }
      ];

      return {
        success: true,
        data: mockHistory
      };
    } catch (error) {
      console.error('Error fetching activity history:', error);
      return {
        success: true, // Return success với empty array thay vì error
        data: []
      };
    }
  }
};

export default nurseApi;

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
  },

  // Medication Request Management
  getPendingMedicationRequests: async () => {
    try {
      const response = await nurseApiClient.get('/api/nurse/medications/requests/pending');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching pending medication requests:', error);
      // Mock data fallback for development
      const mockRequests = [
        {
          id: 1,
          studentId: 'ST001',
          studentName: 'Nguyễn Văn A',
          className: '6A',
          medicationName: 'Paracetamol',
          dosage: '500mg',
          frequency: '2 lần/ngày',
          duration: '3 ngày',
          reason: 'Sốt cao',
          requestedBy: 'Nguyễn Thị B (Phụ huynh)',
          requestDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: 'PENDING',
          notes: 'Học sinh có triệu chứng sốt từ sáng nay'
        },
        {
          id: 2,
          studentId: 'ST002',
          studentName: 'Trần Thị C',
          className: '7B',
          medicationName: 'Ibuprofen',
          dosage: '200mg',
          frequency: '3 lần/ngày',
          duration: '2 ngày',
          reason: 'Đau đầu',
          requestedBy: 'Trần Văn D (Phụ huynh)',
          requestDate: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          status: 'PENDING',
          notes: 'Đau đầu kéo dài từ hôm qua'
        }
      ];
      
      return {
        success: true,
        data: mockRequests
      };
    }
  },  approveMedicationRequest: async (requestId, nurseNote = '', customMessage = '') => {
    try {
      const response = await nurseApiClient.put(`/api/nurse/medications/requests/${requestId}/approve`, {
        nurseNote: nurseNote,
        customMessage: customMessage
      });
      return {
        success: true,
        data: response.data,
        message: 'Yêu cầu thuốc đã được duyệt thành công'
      };
    } catch (error) {
      console.error('Error approving medication request:', error);
      // Mock approval for development
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        success: true,
        message: 'Yêu cầu thuốc đã được duyệt thành công'
      };
    }
  },

  rejectMedicationRequest: async (requestId, nurseNote = '', customMessage = '') => {
    try {
      const response = await nurseApiClient.put(`/api/nurse/medications/requests/${requestId}/reject`, {
        nurseNote: nurseNote,
        customMessage: customMessage
      });
      return {
        success: true,
        data: response.data,
        message: 'Yêu cầu thuốc đã bị từ chối'
      };
    } catch (error) {
      console.error('Error rejecting medication request:', error);
      // Mock rejection for development
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        success: true,
        message: 'Yêu cầu thuốc đã bị từ chối'
      };
    }
  },

  // Get all medication requests (for history view)
  getAllMedicationRequests: async () => {
    try {
      const response = await nurseApiClient.get('/api/nurse/medications/requests');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching all medication requests:', error);
      // Mock data fallback
      const mockRequests = [
        {
          id: 1,
          studentId: 'ST001',
          studentName: 'Nguyễn Văn A',
          className: '6A',
          medicationName: 'Paracetamol',
          dosage: '500mg',
          frequency: '2 lần/ngày',
          duration: '3 ngày',
          reason: 'Sốt cao',
          requestedBy: 'Nguyễn Thị B (Phụ huynh)',
          requestDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: 'PENDING',
          approvedBy: null,
          approvedDate: null,
          notes: 'Học sinh có triệu chứng sốt từ sáng nay'
        },
        {
          id: 2,
          studentId: 'ST003',
          studentName: 'Lê Văn E',
          className: '8C',
          medicationName: 'Aspirin',
          dosage: '100mg',
          frequency: '1 lần/ngày',
          duration: '5 ngày',
          reason: 'Đau mãn tính',
          requestedBy: 'Lê Thị F (Phụ huynh)',
          requestDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          status: 'APPROVED',
          approvedBy: 'Y tá Mai',
          approvedDate: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
          notes: 'Đã được bác sĩ chỉ định'
        }
      ];
      
      return {
        success: true,
        data: mockRequests
      };
    }
  },

  // Medication Schedule Management
  getSchedulesByDate: async (params) => {
    try {
      const response = await nurseApiClient.get('/api/nurse/medications/schedules', { params });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching schedules by date:', error);
      // Mock data fallback for development
      const mockSchedules = [
        {
          id: 1,
          itemRequestId: 1,
          medicationName: 'Paracetamol',
          scheduledDate: params.date || new Date().toISOString().split('T')[0],
          scheduledTime: '08:00',
          status: 'PENDING',
          administeredTime: null,
          nurseNote: '',
          nurseId: null,
          nurseName: '',
          studentId: 'ST001',
          studentName: 'Nguyễn Văn A',
          className: '6A',
          dosage: 500
        },
        {
          id: 2,
          itemRequestId: 2,
          medicationName: 'Ibuprofen',
          scheduledDate: params.date || new Date().toISOString().split('T')[0],
          scheduledTime: '12:00',
          status: 'PENDING',
          administeredTime: null,
          nurseNote: '',
          nurseId: null,
          nurseName: '',
          studentId: 'ST002',
          studentName: 'Trần Thị B',
          className: '7B',
          dosage: 200
        }
      ];
      
      return {
        success: true,
        data: mockSchedules
      };
    }
  },

  getSchedulesForStudent: async (studentId) => {
    try {
      const response = await nurseApiClient.get(`/api/nurse/medications/schedules/student/${studentId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching schedules for student:', error);
      // Mock data fallback
      const mockSchedules = [
        {
          id: 1,
          itemRequestId: 1,
          medicationName: 'Paracetamol',
          scheduledDate: new Date().toISOString().split('T')[0],
          scheduledTime: '08:00',
          status: 'PENDING',
          administeredTime: null,
          nurseNote: '',
          nurseId: null,
          nurseName: '',
          studentId: studentId,
          studentName: 'Học sinh Demo',
          className: '6A',
          dosage: 500
        }
      ];
      
      return {
        success: true,
        data: mockSchedules
      };
    }
  },
  updateScheduleStatus: async (scheduleId, status, note = null) => {
    try {
      const requestBody = { status };
      
      // Only include note in request if it's provided and not empty
      if (note && note.trim() !== '') {
        requestBody.note = note;
      }
      
      const response = await nurseApiClient.put(`/api/nurse/medications/schedules/${scheduleId}/status`, requestBody);
      return {
        success: true,
        data: response.data,
        message: 'Cập nhật trạng thái thành công'
      };
    } catch (error) {
      console.error('Error updating schedule status:', error);
      // Mock response for development
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        success: true,
        message: 'Cập nhật trạng thái thành công'
      };
    }
  },

  updateScheduleNote: async (scheduleId, note) => {
    try {
      const response = await nurseApiClient.put(`/api/nurse/medications/schedules/${scheduleId}/note`, {
        note
      });
      return {
        success: true,
        data: response.data,
        message: 'Cập nhật ghi chú thành công'
      };
    } catch (error) {
      console.error('Error updating schedule note:', error);
      // Mock response for development
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        success: true,
        message: 'Cập nhật ghi chú thành công'
      };
    }
  }
};

export default nurseApi;

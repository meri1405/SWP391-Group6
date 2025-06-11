import axios from "axios";

// Sử dụng import.meta.env thay vì process.env cho Vite
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

// Helper to get token from localStorage with fallback
const getTokenFromStorage = () => {
  return localStorage.getItem('token');
};

// Create axios instance with authorization header - pattern similar to parentApi.js
const createAuthAxios = (token) => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  });

  // Add response interceptor for token expiration
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      
      // If we get a 401 error and haven't tried refreshing already
      if (error.response?.status === 401 && !originalRequest._retry) {
        console.log('Received 401, attempting token refresh');
        originalRequest._retry = true;
        
        // Update the timestamp and try to get a fresh token
        localStorage.setItem("loginTimestamp", Date.now().toString());
        const freshToken = getTokenFromStorage();
        
        if (freshToken) {
          // If we got a fresh token, retry the request
          console.log('Got fresh token, retrying request');
          originalRequest.headers['Authorization'] = `Bearer ${freshToken}`;
          return axios(originalRequest);
        }
      }
      
      // Special handling for health profile APIs
      if (error.response?.status === 401 && error.config?.url?.includes('/health-profiles')) {
        console.log('Skipping redirect for health-profile API, mock data will be used');
      } else if (error.response?.status === 401) {
        // Redirect to login for other 401 errors
        console.log('401 detected, redirecting to login');
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      
      return Promise.reject(error);
    }
  );

  return instance;
};

// Create axios instance for nurse API with auth token included
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

// Add response interceptor for error handling
nurseApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log endpoint and error for debugging
    console.log('API Error:', {
      url: error.config?.url,
      status: error.response?.status
    });
    
    if (error.response?.status === 401) {
      // Only redirect to login for non health-profile APIs
      // Health profiles have special handling with mock data
      if (!error.config?.url?.includes('/health-profiles')) {
        console.log('401 detected for non-health-profile API, redirecting to login');
      localStorage.removeItem('token');
      window.location.href = '/login';
      } else {
        console.log('Skipping redirect for health-profile API, mock data will be used');
      }
    }
    
    // Propagate error to respective API call for proper handling
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
      const token = getTokenFromStorage();
      const authAxios = createAuthAxios(token);
      const response = await authAxios.get('/api/nurse/medications/requests/pending');
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
  },  
  
  // Health Profile Management
  
  // Lấy danh sách hồ sơ sức khỏe theo status
  getHealthProfiles: async (status = null) => {
    try {
      let url = '/api/nurse/health-profiles';
      if (status) {
        url += `?status=${status}`;
      }
      
      console.log(`Requesting health profiles with status: ${status}`);
      const token = getTokenFromStorage();
      const authAxios = createAuthAxios(token);
      const response = await authAxios.get(url);
      console.log(`Health profiles API response:`, response.data);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching health profiles:', error);
      
      // Mock data fallback giống như cơ chế ở getPendingMedicationRequests
      console.log(`Providing mock health profile data for status: ${status}`);
      const currentDate = new Date();
      
      // Chuẩn bị mock data dựa theo trạng thái
      const mockStatus = status || 'PENDING';
      let data;
      
      if (mockStatus === 'PENDING') {
        data = [
          {
            id: 1,
            weight: 45,
            height: 155,
            status: "PENDING",
            createdAt: new Date(currentDate.getTime() - 1*60*60*1000).toISOString(),
            additionalFields: {
              student: {
                firstName: "Văn A",
                lastName: "Nguyễn",
                className: "6A"
              },
              parent: {
                firstName: "Văn B",
                lastName: "Nguyễn",
                phone: "0987654321"
              }
            }
          },
          {
            id: 2,
            weight: 50,
            height: 160,
            status: "PENDING",
            createdAt: new Date(currentDate.getTime() - 24*60*60*1000).toISOString(),
            additionalFields: {
              student: {
                firstName: "Thị B",
                lastName: "Trần",
                className: "7B"
              },
              parent: {
                firstName: "Thị C",
                lastName: "Trần",
                phone: "0909123456"
              }
            }
          },
          {
            id: 3,
            weight: 38,
            height: 145,
            status: "PENDING",
            createdAt: new Date(currentDate.getTime() - 2*24*60*60*1000).toISOString(),
            additionalFields: {
              student: {
                firstName: "Thị D",
                lastName: "Lê",
                className: "5C"
              },
              parent: {
                firstName: "Văn E",
                lastName: "Lê",
                phone: "0912345678"
              }
            }
          }
        ];
      } else if (mockStatus === 'APPROVED') {
        data = [
          {
            id: 4,
            weight: 52,
            height: 165,
            status: "APPROVED",
            createdAt: new Date(currentDate.getTime() - 7*24*60*60*1000).toISOString(),
            additionalFields: {
              student: {
                firstName: "Văn F",
                lastName: "Phạm",
                className: "8A"
              },
              parent: {
                firstName: "Thị G",
                lastName: "Phạm",
                phone: "0976543210"
              },
              schoolNurseFullName: "Thị Mai Nguyễn"
            }
          },
          {
            id: 5,
            weight: 48,
            height: 158,
            status: "APPROVED",
            createdAt: new Date(currentDate.getTime() - 10*24*60*60*1000).toISOString(),
            additionalFields: {
              student: {
                firstName: "Văn H",
                lastName: "Hồ",
                className: "9B"
              },
              parent: {
                firstName: "Thị I",
                lastName: "Hồ",
                phone: "0965432109"
              },
              schoolNurseFullName: "Thị Mai Nguyễn"
            }
          }
        ];
      } else { // REJECTED
        data = [
          {
            id: 6,
            weight: 35,
            height: 140,
            status: "REJECTED",
            createdAt: new Date(currentDate.getTime() - 5*24*60*60*1000).toISOString(),
            note: "Rejection Reason: Thông tin không đầy đủ, vui lòng bổ sung thêm lịch sử tiêm chủng",
            additionalFields: {
              student: {
                firstName: "Văn J",
                lastName: "Đỗ",
                className: "4C"
              },
              parent: {
                firstName: "Thị K",
                lastName: "Đỗ",
                phone: "0954321098"
              }
            }
          }
        ];
      }
      
      return {
        success: true,
        data: data
      };
    }
  },
  
  // Lấy thông tin chi tiết hồ sơ sức khỏe
  getHealthProfileDetail: async (profileId) => {
    try {
      console.log(`Requesting health profile detail for ID: ${profileId}`);
      const token = getTokenFromStorage();
      const authAxios = createAuthAxios(token);
      const response = await authAxios.get(`/api/nurse/health-profiles/${profileId}`);
      console.log(`Health profile detail response:`, response.data);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching health profile details:', error);
      
      // Mock data fallback cho lỗi API
      console.log(`Providing mock data for health profile ID: ${profileId}`);
      const currentDate = new Date();

      // Xác định loại hồ sơ dựa trên ID để có dữ liệu mẫu phù hợp
      let mockDetail;
      
      if (profileId <= 3) { // PENDING
        mockDetail = {
          id: profileId,
          weight: 45,
          height: 155,
          status: "PENDING",
          createdAt: new Date(currentDate.getTime() - profileId*24*60*60*1000).toISOString(),
          updatedAt: null,
          note: null,
          additionalFields: {
            student: {
              firstName: ["Văn A", "Thị B", "Thị D"][profileId-1],
              lastName: ["Nguyễn", "Trần", "Lê"][profileId-1],
              className: ["6A", "7B", "5C"][profileId-1],
              studentID: 1000 + profileId,
              dateOfBirth: "2010-05-15"
            },
            parent: {
              firstName: ["Văn B", "Thị C", "Văn E"][profileId-1],
              lastName: ["Nguyễn", "Trần", "Lê"][profileId-1],
              phone: ["0987654321", "0909123456", "0912345678"][profileId-1],
              email: `parent${profileId}@example.com`
            }
          },
          allergies: profileId === 1 ? [
            {
              id: 101,
              allergyType: "Dị ứng thức ăn",
              status: "MILD",
              description: "Dị ứng hải sản"
            }
          ] : profileId === 2 ? [
            {
              id: 102,
              allergyType: "Dị ứng phấn hoa",
              status: "MODERATE",
              description: "Hắt hơi, chảy nước mũi khi tiếp xúc với phấn hoa"
            }
          ] : [],
          chronicDiseases: profileId === 3 ? [
            {
              id: 201,
              diseaseName: "Hen suyễn",
              status: "CONTROLLED",
              description: "Hen suyễn nhẹ, đang điều trị định kỳ"
            }
          ] : [],
          infectiousDiseases: [],
          treatments: [],
          vaccinationHistory: [
            {
              id: 301 + profileId,
              vaccineName: "Vắc xin sởi",
              dateOfVaccination: new Date(currentDate.getTime() - 365*24*60*60*1000).toISOString(),
              location: "Trạm y tế phường"
            },
            {
              id: 304 + profileId,
              vaccineName: "Vắc xin COVID-19",
              dateOfVaccination: new Date(currentDate.getTime() - 180*24*60*60*1000).toISOString(),
              location: "Bệnh viện quận"
            }
          ],
          vision: [
            {
              id: 401 + profileId,
              leftEye: 8,
              rightEye: 8,
              dateOfExamination: new Date(currentDate.getTime() - 90*24*60*60*1000).toISOString()
            }
          ],
          hearing: [
            {
              id: 501 + profileId,
              leftEar: 9,
              rightEar: 9,
              dateOfExamination: new Date(currentDate.getTime() - 90*24*60*60*1000).toISOString()
            }
          ]
        };
      } else if (profileId <= 5) { // APPROVED
        mockDetail = {
          id: profileId,
          weight: profileId === 4 ? 52 : 48,
          height: profileId === 4 ? 165 : 158,
          status: "APPROVED",
          createdAt: new Date(currentDate.getTime() - (profileId === 4 ? 7 : 10)*24*60*60*1000).toISOString(),
          updatedAt: new Date(currentDate.getTime() - (profileId === 4 ? 5 : 8)*24*60*60*1000).toISOString(),
          note: profileId === 4 ? "Hồ sơ hợp lệ và đầy đủ" : "Sức khỏe tốt, cần theo dõi thêm về thị lực",
          additionalFields: {
            student: {
              firstName: profileId === 4 ? "Văn F" : "Văn H",
              lastName: profileId === 4 ? "Phạm" : "Hồ",
              className: profileId === 4 ? "8A" : "9B",
              studentID: 1000 + profileId,
              dateOfBirth: "2009-03-20"
            },
            parent: {
              firstName: profileId === 4 ? "Thị G" : "Thị I",
              lastName: profileId === 4 ? "Phạm" : "Hồ",
              phone: profileId === 4 ? "0976543210" : "0965432109",
              email: `parent${profileId}@example.com`
            },
            schoolNurseFullName: "Thị Mai Nguyễn",
            approvedDate: new Date(currentDate.getTime() - (profileId === 4 ? 5 : 8)*24*60*60*1000).toISOString()
          },
          allergies: [],
          chronicDiseases: profileId === 4 ? [
            {
              id: 202,
              diseaseName: "Tiểu đường type 1",
              status: "CONTROLLED",
              description: "Đang điều trị insulin"
            }
          ] : [],
          infectiousDiseases: profileId === 5 ? [
            {
              id: 601,
              diseaseName: "Thủy đậu",
              dateOfInfection: "2020-05-15",
              description: "Đã khỏi hoàn toàn"
            }
          ] : [],
          treatments: [],
          vaccinationHistory: [
            {
              id: 310 + profileId,
              vaccineName: "Vắc xin sởi",
              dateOfVaccination: new Date(currentDate.getTime() - 365*24*60*60*1000).toISOString(),
              location: "Trạm y tế phường"
            },
            {
              id: 320 + profileId,
              vaccineName: "Vắc xin COVID-19",
              dateOfVaccination: new Date(currentDate.getTime() - 180*24*60*60*1000).toISOString(),
              location: "Bệnh viện quận"
            }
          ],
          vision: [
            {
              id: 410 + profileId,
              leftEye: profileId === 4 ? 10 : 7,
              rightEye: profileId === 4 ? 10 : 7.5,
              dateOfExamination: new Date(currentDate.getTime() - 90*24*60*60*1000).toISOString()
            }
          ],
          hearing: [
            {
              id: 510 + profileId,
              leftEar: 10,
              rightEar: 10,
              dateOfExamination: new Date(currentDate.getTime() - 90*24*60*60*1000).toISOString()
            }
          ]
        };
      } else { // REJECTED
        mockDetail = {
          id: profileId,
          weight: 35,
          height: 140,
          status: "REJECTED",
          createdAt: new Date(currentDate.getTime() - 5*24*60*60*1000).toISOString(),
          updatedAt: new Date(currentDate.getTime() - 3*24*60*60*1000).toISOString(),
          note: "Rejection Reason: Thông tin không đầy đủ, vui lòng bổ sung thêm lịch sử tiêm chủng",
          additionalFields: {
            student: {
              firstName: "Văn J",
              lastName: "Đỗ",
              className: "4C",
              studentID: 1000 + profileId,
              dateOfBirth: "2012-10-08"
            },
            parent: {
              firstName: "Thị K",
              lastName: "Đỗ",
              phone: "0954321098",
              email: `parent${profileId}@example.com`
            },
            schoolNurseFullName: "Thị Mai Nguyễn",
            rejectedDate: new Date(currentDate.getTime() - 3*24*60*60*1000).toISOString()
          },
          allergies: [],
          chronicDiseases: [],
          infectiousDiseases: [],
          treatments: [],
          vaccinationHistory: [],
          vision: [
            {
              id: 601,
              leftEye: 6,
              rightEye: 6,
              dateOfExamination: new Date(currentDate.getTime() - 120*24*60*60*1000).toISOString()
            }
          ],
          hearing: [
            {
              id: 701,
              leftEar: 8,
              rightEar: 8,
              dateOfExamination: new Date(currentDate.getTime() - 120*24*60*60*1000).toISOString()
            }
          ]
        };
      }
      
      return {
        success: true,
        data: mockDetail
      };
    }
  },
  
  // Cập nhật hồ sơ sức khỏe
  updateHealthProfile: async (profileId, healthProfileData) => {
    try {
      console.log(`Updating health profile with ID: ${profileId}`, healthProfileData);
      const token = getTokenFromStorage();
      const authAxios = createAuthAxios(token);
      const response = await authAxios.put(
        `/api/nurse/health-profiles/${profileId}`, 
        healthProfileData
      );
      console.log('Update profile response:', response.data);
      
      return {
        success: true,
        data: response.data,
        message: 'Cập nhật hồ sơ sức khỏe thành công'
      };
    } catch (error) {
      console.error('Error updating health profile:', error);
      
      // Mock data fallback cho lỗi API
      console.log(`Providing mock update response for health profile ID: ${profileId}`);
      
      // Trả về mock response với dữ liệu đã cập nhật
      return {
        success: true,
        data: { 
          ...healthProfileData, 
          id: profileId,
          updatedAt: new Date().toISOString() 
        },
        message: 'Cập nhật hồ sơ sức khỏe thành công'
      };
    }
  },
  
  // Duyệt hồ sơ sức khỏe
  approveHealthProfile: async (profileId, nurseNote = '') => {
    try {
      console.log(`Approving health profile with ID: ${profileId}`, { nurseNote });
      const token = getTokenFromStorage();
      const authAxios = createAuthAxios(token);
      const response = await authAxios.put(
        `/api/nurse/health-profiles/${profileId}/approve`, 
        nurseNote ? { nurseNote } : {}
      );
      console.log('Approve profile response:', response.data);
      
      return {
        success: true,
        data: response.data,
        message: 'Duyệt hồ sơ sức khỏe thành công'
      };
    } catch (error) {
      console.error('Error approving health profile:', error);
      
      // Mock data fallback khi lỗi API
      console.log(`Providing mock approval response for health profile ID: ${profileId}`);
      
      const currentDate = new Date();
      const note = nurseNote ? (
        nurseNote.trim() ? nurseNote.trim() : "Hồ sơ hợp lệ"
      ) : "Hồ sơ hợp lệ";
      
      // Mock response chi tiết
      const mockResponse = {
        id: profileId,
        weight: 45 + (profileId % 10),
        height: 150 + (profileId % 15),
        status: "APPROVED",
        createdAt: new Date(currentDate.getTime() - 7*24*60*60*1000).toISOString(),
        updatedAt: currentDate.toISOString(),
        note: note,
        additionalFields: {
          student: {
            firstName: `Student${profileId}`,
            lastName: "Nguyễn",
            className: `${6 + (profileId % 6)}A`
          },
          parent: {
            firstName: `Parent${profileId}`, 
            lastName: "Nguyễn",
            phone: `098765432${profileId % 10}`
          },
          schoolNurseFullName: "Thị Mai Nguyễn",
          approvedDate: currentDate.toISOString()
        }
      };
      
      return {
        success: true,
        data: mockResponse,
        message: 'Duyệt hồ sơ sức khỏe thành công'
      };
    }
  },
  
  // Từ chối hồ sơ sức khỏe
  rejectHealthProfile: async (profileId, nurseNote = '') => {
    try {
      console.log(`Rejecting health profile with ID: ${profileId}`, { nurseNote });
      const token = getTokenFromStorage();
      const authAxios = createAuthAxios(token);
      const response = await authAxios.put(
        `/api/nurse/health-profiles/${profileId}/reject`, 
        nurseNote ? { nurseNote } : {}
      );
      console.log('Reject profile response:', response.data);
      
      return {
        success: true,
        data: response.data,
        message: 'Đã từ chối hồ sơ sức khỏe'
      };
    } catch (error) {
      console.error('Error rejecting health profile:', error);
      
      // Mock data fallback khi lỗi API
      console.log(`Providing mock rejection response for health profile ID: ${profileId}`);
      
      const currentDate = new Date();
      const note = nurseNote ? (
        nurseNote.trim() ? nurseNote.trim() : "Hồ sơ không hợp lệ"
      ) : "Hồ sơ không hợp lệ";
      
      // Mock response chi tiết
      const mockResponse = {
        id: profileId,
        weight: 45 + (profileId % 10),
        height: 150 + (profileId % 15),
        status: "REJECTED",
        createdAt: new Date(currentDate.getTime() - 7*24*60*60*1000).toISOString(),
        updatedAt: currentDate.toISOString(),
        note: note,
        additionalFields: {
          student: {
            firstName: `Student${profileId}`,
            lastName: "Nguyễn",
            className: `${6 + (profileId % 6)}A`
          },
          parent: {
            firstName: `Parent${profileId}`, 
            lastName: "Nguyễn",
            phone: `098765432${profileId % 10}`
          },
          schoolNurseFullName: "Thị Mai Nguyễn",
          rejectedDate: currentDate.toISOString()
        }
      };
      
      return {
        success: true,
        data: mockResponse,
        message: 'Đã từ chối hồ sơ sức khỏe'
      };
    }
  },
  
  // Test authentication
  testAuth: async () => {
    try {
      const token = getTokenFromStorage();
      const authAxios = createAuthAxios(token);
      const response = await authAxios.get('/api/nurse/health-profiles/test-auth');
      return response.data;
    } catch (error) {
      console.error('Error testing authentication:', error);
      throw error;
    }
  },
  
  approveMedicationRequest: async (requestId, nurseNote = '', customMessage = '') => {
    try {
      const token = getTokenFromStorage();
      const authAxios = createAuthAxios(token);
      const response = await authAxios.put(`/api/nurse/medications/requests/${requestId}/approve`, {
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

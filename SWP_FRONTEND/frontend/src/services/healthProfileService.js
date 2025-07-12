import { message } from 'antd';
import { parentApi } from '../api/parentApi';
import dayjs from 'dayjs';

/**
 * Service class for handling health profile related API operations
 */
export class HealthProfileService {
  constructor(getToken) {
    this.getToken = getToken;
  }

  /**
   * Fetch all students for the current parent
   * @returns {Promise<Array>} Array of students
   */
  async fetchStudents() {
    try {
      const token = this.getToken();
      const response = await parentApi.getMyStudents(token);
      
      if (response && Array.isArray(response)) {
        return response;
      } else {
        console.warn('Unexpected response format for students:', response);
        return [];
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      message.error('Không thể tải danh sách học sinh');
      throw error;
    }
  }

  /**
   * Fetch approved health profiles for a specific student
   * @param {string|number} studentId - The student ID
   * @returns {Promise<Array>} Array of approved health profiles
   */
  async fetchApprovedHealthProfiles(studentId) {
    try {
      const token = this.getToken();
      const profiles = await parentApi.getApprovedHealthProfiles(studentId, token);
      return profiles || [];
    } catch (error) {
      console.error('Error loading approved profiles:', error);
      message.error('Không thể tải hồ sơ sức khỏe đã duyệt');
      throw error;
    }
  }

  /**
   * Get the latest approved health profile from a list of profiles
   * @param {Array} profiles - Array of health profiles
   * @returns {Object|null} Latest profile or null if empty
   */
  getLatestProfile(profiles) {
    if (!profiles || profiles.length === 0) return null;
    
    return profiles.sort((a, b) => 
      dayjs(b.updatedAt).unix() - dayjs(a.updatedAt).unix()
    )[0];
  }

  /**
   * Find a student by ID from a list of students
   * @param {Array} students - Array of students
   * @param {string|number} studentId - The student ID to find
   * @returns {Object|null} Found student or null
   */
  findStudentById(students, studentId) {
    return students.find(s => s.id === studentId || s.studentID === studentId) || null;
  }

  /**
   * Find a profile by ID from a list of profiles
   * @param {Array} profiles - Array of profiles
   * @param {string|number} profileId - The profile ID to find
   * @returns {Object|null} Found profile or null
   */
  findProfileById(profiles, profileId) {
    return profiles.find(p => p.id === profileId) || null;
  }
}

/**
 * Factory function to create a health profile service instance
 * @param {Function} getToken - Function to get authentication token
 * @returns {HealthProfileService} New service instance
 */
export const createHealthProfileService = (getToken) => {
  return new HealthProfileService(getToken);
};

export default HealthProfileService;

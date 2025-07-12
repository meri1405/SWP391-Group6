import {
  getMedicalEvents,
  createMedicalEvent,
  getMedicalEventById,
  updateMedicalEventStatus,
  getAllStudents,
  checkStudentHealthProfile,
} from "../api/medicalEventApi";
import { medicalSupplyApi } from "../api/medicalSupplyApi";
import { message } from "antd";

/**
 * Service layer for Medical Event Management
 * Handles all business logic and API interactions
 */
class MedicalEventService {
  /**
   * Load all medical events
   */
  async loadEvents() {
    try {
      const response = await getMedicalEvents();
      console.log("Events API Response:", response);
      const eventsData = Array.isArray(response) ? response : [];

      // Sort events by creation date - newest first
      const sortedEvents = [...eventsData].sort((a, b) => {
        const dateA = new Date(a.createdAt || a.occurrenceTime);
        const dateB = new Date(b.createdAt || b.occurrenceTime);
        return dateB - dateA;
      });

      return sortedEvents;
    } catch (error) {
      console.error("Error loading medical events:", error);
      message.error("Không thể tải danh sách sự kiện y tế");
      throw error;
    }
  }

  /**
   * Load all students
   */
  async loadStudents() {
    try {
      const response = await getAllStudents();
      console.log("Students API Response:", response);
      // Handle different response formats
      const studentsData = response?.students || response || [];
      console.log("Processed students data:", studentsData);
      const studentsArray = Array.isArray(studentsData) ? studentsData : [];
      
      return studentsArray;
    } catch (error) {
      console.error("Error loading students:", error);
      message.error("Không thể tải danh sách học sinh");
      throw error;
    }
  }

  /**
   * Load medical supplies (excluding expired ones)
   */
  async loadMedicalSupplies() {
    try {
      const response = await medicalSupplyApi.getAllSupplies();
      console.log("Medical Supplies API Response:", response);
      let suppliesData = Array.isArray(response) ? response : [];

      // Filter out expired supplies
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      suppliesData = suppliesData.filter((supply) => {
        const expirationDate = new Date(supply.expirationDate);
        expirationDate.setHours(0, 0, 0, 0);
        return expirationDate >= today;
      });

      // Sort supplies by expiration date (nearest first)
      suppliesData = suppliesData.sort((a, b) => {
        const dateA = new Date(a.expirationDate);
        const dateB = new Date(b.expirationDate);

        if (a.name === b.name) {
          return dateA - dateB;
        }
        return dateA - dateB;
      });

      console.log("Filtered and sorted medical supplies (excluding expired):", suppliesData);
      return suppliesData;
    } catch (error) {
      console.error("Error loading medical supplies:", error);
      message.error("Không thể tải danh sách vật tư y tế");
      throw error;
    }
  }

  /**
   * Check student health profile
   */
  async checkHealthProfile(studentId) {
    if (!studentId) {
      return { hasApprovedProfile: true, message: "" };
    }

    try {
      const response = await checkStudentHealthProfile(studentId);
      
      if (!response.hasApprovedProfile) {
        message.warning(response.message);
      }

      return response;
    } catch (error) {
      console.error("Error checking health profile:", error);
      message.error("Không thể kiểm tra hồ sơ sức khỏe của học sinh");
      throw error;
    }
  }

  /**
   * Get medical event by ID
   */
  async getEventById(eventId) {
    try {
      const event = await getMedicalEventById(eventId);
      return event;
    } catch (error) {
      console.error("Error loading event details:", error);
      message.error("Không thể tải chi tiết sự kiện");
      throw error;
    }
  }

  /**
   * Process/mark event as handled
   */
  async processEvent(eventId) {
    try {
      await updateMedicalEventStatus(eventId);
      message.success("Đã đánh dấu sự kiện là đã xử lý");
      return true;
    } catch (error) {
      console.error("Error processing event:", error);
      message.error("Không thể cập nhật trạng thái sự kiện");
      throw error;
    }
  }

  /**
   * Create new medical event
   */
  async createEvent(eventData) {
    try {
      console.log("Sending event data:", eventData);
      const response = await createMedicalEvent(eventData);
      console.log("Create event response:", response);
      
      message.success("Đã thêm sự kiện mới thành công");
      return response;
    } catch (error) {
      console.error("Error saving event:", error);
      
      // Show more helpful error messages for validation failures
      if (error.errorFields) {
        const fieldLabels = {
          occurrenceTime: "Thời gian xảy ra",
          className: "Lớp",
          studentId: "Học sinh",
          eventType: "Loại sự kiện",
          severityLevel: "Mức độ nghiêm trọng",
          location: "Địa điểm xảy ra",
        };

        const firstError = error.errorFields[0];
        const fieldName = firstError.name[0];
        const fieldLabel = fieldLabels[fieldName] || fieldName;
        message.error(`Vui lòng điền đúng thông tin: ${fieldLabel}`);
      } else {
        message.error("Có lỗi xảy ra khi lưu sự kiện");
      }
      throw error;
    }
  }
}

export const medicalEventService = new MedicalEventService();

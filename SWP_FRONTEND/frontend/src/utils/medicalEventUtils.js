import { message } from "antd";
import dayjs from "dayjs";
import { REQUIRED_FIELDS, FIELD_LABELS } from "../constants/medicalEventConstants";

/**
 * Utility functions for Medical Event Management
 */

/**
 * Calculate statistics from events data
 */
export const calculateStatistics = (eventData) => {
  const total = eventData.length;
  const pending = eventData.filter((event) => !event.processed).length;
  const processed = eventData.filter((event) => event.processed).length;

  return {
    total,
    pending,
    processed,
  };
};

/**
 * Extract unique classes from students data
 */
export const extractClassesFromStudents = (studentsData) => {
  const uniqueClasses = [];
  const classSet = new Set();

  studentsData.forEach((student) => {
    const className = student.className;
    if (className && !classSet.has(className)) {
      classSet.add(className);
      // Count students in this class
      const studentsInClass = studentsData.filter(
        (s) => s.className === className
      );
      uniqueClasses.push({
        name: className,
        studentCount: studentsInClass.length,
      });
    }
  });

  // Sort classes by name
  uniqueClasses.sort((a, b) => a.name.localeCompare(b.name));

  console.log("Extracted classes:", uniqueClasses);
  return uniqueClasses;
};

/**
 * Filter students by class name
 */
export const filterStudentsByClass = (students, className) => {
  if (!className) return [];
  
  const studentsInClass = students.filter(
    (student) => student.className === className
  );
  
  console.log(`Class "${className}" selected. Found ${studentsInClass.length} students.`);
  return studentsInClass;
};

/**
 * Filter events based on search criteria
 */
export const filterEvents = (events, filters) => {
  const { searchText, filterProcessed, filterType, filterSeverity, dateRange } = filters;
  let filtered = events;

  // Search filter
  if (searchText) {
    filtered = filtered.filter(
      (event) =>
        `${event.student?.firstName} ${event.student?.lastName}`
          .toLowerCase()
          .includes(searchText.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchText.toLowerCase()) ||
        event.symptoms?.toLowerCase().includes(searchText.toLowerCase())
    );
  }

  // Processed status filter
  if (filterProcessed !== "all") {
    filtered = filtered.filter((event) => {
      if (filterProcessed === "pending") return !event.processed;
      if (filterProcessed === "processed") return event.processed;
      return true;
    });
  }

  // Event type filter
  if (filterType !== "all") {
    filtered = filtered.filter((event) => event.eventType === filterType);
  }

  // Severity filter
  if (filterSeverity !== "all") {
    filtered = filtered.filter(
      (event) => event.severityLevel === filterSeverity
    );
  }

  // Date range filter
  if (dateRange && dateRange.length === 2) {
    filtered = filtered.filter((event) => {
      const eventDate = dayjs(event.occurrenceTime);
      return (
        eventDate.isAfter(dateRange[0]) && eventDate.isBefore(dateRange[1])
      );
    });
  }

  return filtered;
};

/**
 * Get supply name and unit by ID
 */
export const getSupplyName = (supplyId, supplyObject = null, medicalSupplies = []) => {
  console.log("Debug getSupplyName:", {
    supplyId,
    supplyObject,
    medicalSupplies,
  });

  // Ưu tiên sử dụng thông tin từ backend response trước
  if (supplyObject?.medicalSupply?.name) {
    console.log("Using backend supply info:", supplyObject.medicalSupply);
    return {
      name: supplyObject.medicalSupply.name,
      unit: supplyObject.medicalSupply.displayUnit || "",
    };
  }

  // Tìm từ danh sách medicalSupplies
  const supplyInfo = medicalSupplies.find((s) => s.id === supplyId);
  if (supplyInfo) {
    console.log("Using supply info:", supplyInfo);
    return {
      name: supplyInfo.name,
      unit: supplyInfo.displayUnit,
    };
  }

  // Fallback
  console.log("Using fallback for supply ID:", supplyId);
  return {
    name: `Vật tư ID: ${supplyId}`,
    unit: "",
  };
};

/**
 * Validate form data before submission
 */
export const validateFormData = (values, healthProfileValid, healthProfileMessage) => {
  // Check if student has approved health profile
  if (!healthProfileValid) {
    message.error("Không thể tạo sự kiện y tế: " + healthProfileMessage);
    return false;
  }

  // Check that all required fields have values
  const missingFields = REQUIRED_FIELDS.filter((field) => !values[field]);

  if (missingFields.length > 0) {
    const missingFieldLabels = missingFields.map(
      (field) => FIELD_LABELS[field]
    );
    message.error(
      `Vui lòng điền đầy đủ thông tin: ${missingFieldLabels.join(", ")}`
    );
    return false;
  }

  // Validate medical supplies if any are provided
  if (values.suppliesUsed && values.suppliesUsed.length > 0) {
    const invalidSupplies = values.suppliesUsed.filter(
      (supply) => !supply.medicalSupplyId || !supply.quantityUsed
    );

    if (invalidSupplies.length > 0) {
      message.error(
        "Vui lòng chọn vật tư và nhập số lượng cho tất cả vật tư y tế"
      );
      return false;
    }
  }

  return true;
};

/**
 * Format form data for backend API
 */
export const formatEventData = (values) => {
  // Format suppliesUsed data according to backend DTO
  const suppliesUsed = values.suppliesUsed || [];
  const formattedSuppliesUsed = suppliesUsed.map((supply) => ({
    medicalSupplyId: parseInt(supply.medicalSupplyId),
    quantityUsed: parseInt(supply.quantityUsed),
  }));

  // Format data according to backend DTO
  return {
    eventType: values.eventType,
    occurrenceTime: values.occurrenceTime.toISOString(),
    location: values.location,
    symptoms: values.symptoms || "",
    severityLevel: values.severityLevel,
    firstAidActions: values.firstAidActions || "",
    studentId: parseInt(values.studentId),
    suppliesUsed: formattedSuppliesUsed,
  };
};

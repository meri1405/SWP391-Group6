/**
 * Constants for Medical Event Management
 */

// Backend EventType enum values
export const EVENT_TYPES = [
  { value: "ACCIDENT", label: "Tai nạn", color: "#ff4d4f" },
  { value: "FEVER", label: "Sốt", color: "#fa8c16" },
  { value: "FALL", label: "Té ngã", color: "#faad14" },
  { value: "EPIDEMIC", label: "Dịch bệnh", color: "#722ed1" },
  { value: "OTHER_EMERGENCY", label: "Cấp cứu khác", color: "#eb2f96" },
];

// Backend SeverityLevel enum values
export const SEVERITY_LEVELS = [
  { value: "MILD", label: "Nhẹ", color: "#52c41a" },
  { value: "MODERATE", label: "Trung bình", color: "#faad14" },
  { value: "SEVERE", label: "Nặng", color: "#ff4d4f" },
];

// Filter options
export const FILTER_OPTIONS = {
  PROCESSED: {
    ALL: "all",
    PENDING: "pending", 
    PROCESSED: "processed"
  }
};

// Field labels for validation messages
export const FIELD_LABELS = {
  occurrenceTime: "Thời gian xảy ra",
  className: "Lớp",
  studentId: "Học sinh",
  eventType: "Loại sự kiện",
  severityLevel: "Mức độ nghiêm trọng",
  location: "Địa điểm xảy ra",
};

// Required fields for form validation
export const REQUIRED_FIELDS = [
  "occurrenceTime",
  "className", 
  "studentId",
  "eventType",
  "severityLevel",
  "location",
];

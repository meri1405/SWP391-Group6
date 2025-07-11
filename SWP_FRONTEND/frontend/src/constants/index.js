// API Constants
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    OTP_REQUEST: "/auth/otp/request",
    OTP_VERIFY: "/auth/otp/verify",
  },
  ADMIN: {
    PROFILE: "/admin/profile",
    SETTINGS: "/admin/settings",
    USERS: "/admin/users",
  },
  PARENT: {
    STUDENTS: "/parent/students",
    HEALTH_PROFILES: "/parent/students/health-profile-status",
    MISSING_PROFILES: "/parent/students/missing-health-profiles",
  },
  NURSE: {
    HEALTH_CHECKS: "/nurse/health-checks",
    MEDICATIONS: "/nurse/medications",
  },
  MANAGER: {
    CAMPAIGNS: "/manager/campaigns",
    REPORTS: "/manager/reports",
  },
};

// Status Constants
export const STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  CONFIRMED: "CONFIRMED",
  DECLINED: "DECLINED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
};

// Form Status
export const FORM_STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  DECLINED: "DECLINED",
  NO_FORM: "NO_FORM",
  COMPLETED: "COMPLETED",
  CANCELED: "CANCELED",
};

// Health Profile Status
export const HEALTH_PROFILE_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  COMPLETED: "COMPLETED",
};

// User Roles
export const USER_ROLES = {
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  SCHOOLNURSE: "SCHOOLNURSE",
  PARENT: "PARENT",
};

// Medication Status
export const MEDICATION_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  COMPLETED: "COMPLETED",
};

// Event Types
export const EVENT_TYPES = {
  ACCIDENT: "ACCIDENT",
  ILLNESS: "ILLNESS",
  INJURY: "INJURY",
  ALLERGY: "ALLERGY",
  EMERGENCY: "EMERGENCY",
};

// Severity Levels
export const SEVERITY_LEVELS = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  CRITICAL: "CRITICAL",
};

// Health Check Categories
export const HEALTH_CHECK_CATEGORIES = {
  GENERAL: "GENERAL",
  VISION: "VISION",
  HEARING: "HEARING",
  DENTAL: "DENTAL",
  PHYSICAL: "PHYSICAL",
  MENTAL: "MENTAL",
};

// Result Status
export const RESULT_STATUS = {
  NORMAL: "NORMAL",
  MINOR_CONCERN: "MINOR_CONCERN",
  NEEDS_ATTENTION: "NEEDS_ATTENTION",
  REQUIRES_FOLLOWUP: "REQUIRES_FOLLOWUP",
  URGENT: "URGENT",
};

// Time Constants
export const TIME_CONSTANTS = {
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  NOTIFICATION_TIMEOUT: 5000, // 5 seconds
  DEBOUNCE_DELAY: 300, // 300ms
  REFRESH_INTERVAL: 60000, // 1 minute
};

// Validation Constants
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 100,
  MIN_AGE: 3,
  MAX_AGE: 18,
  MIN_PARENT_AGE: 18,
  MAX_PARENT_AGE: 100,
  PHONE_REGEX: /^(0[3|5|7|8|9])+([0-9]{8})$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};

// UI Constants
export const UI = {
  ITEMS_PER_PAGE: 10,
  MAX_ITEMS_PER_PAGE: 100,
  SIDEBAR_WIDTH: 250,
  HEADER_HEIGHT: 64,
  MODAL_WIDTH: 800,
  DRAWER_WIDTH: 400,
};

// File Upload Constants
export const FILE_UPLOAD = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ACCEPTED_IMAGE_TYPES: ["image/jpeg", "image/jpg", "image/png", "image/gif"],
  ACCEPTED_DOCUMENT_TYPES: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
};

// Date/Time Formats
export const DATE_FORMATS = {
  DISPLAY: "DD/MM/YYYY",
  API: "YYYY-MM-DD",
  DATETIME: "DD/MM/YYYY HH:mm",
  TIME: "HH:mm",
};

// Colors (Ant Design compatible)
export const COLORS = {
  PRIMARY: "#1890ff",
  SUCCESS: "#52c41a",
  WARNING: "#faad14",
  ERROR: "#f5222d",
  INFO: "#13c2c2",
  GRAY: "#8c8c8c",
};

// Gender Constants
export const GENDER = {
  MALE: "M",
  FEMALE: "F",
};

// Medication Unit Constants
export const MEDICATION_UNITS = {
  TABLET: "viên",
  CAPSULE: "viên",
  ML: "ml",
  MG: "mg",
  G: "g",
  DROPS: "giọt",
  SPOONFUL: "thìa",
  SPRAY: "lần xịt",
  PATCH: "miếng dán",
  BOTTLE: "chai",
  TUBE: "tuýp",
  UNIT: "đơn vị",
};

// Default Units for Item Types
export const DEFAULT_UNITS_BY_TYPE = {
  TABLET: ["viên", "mg", "g"],
  CREAM: ["g", "tuýp", "ml"],
  DROPS: ["giọt", "ml", "chai"],
  SPOONFUL: ["thìa", "ml"],
  SPRAY: ["lần xịt", "chai", "ml"],
  CAPSULE: ["viên", "mg"]
};

// Default Values
export const DEFAULTS = {
  AVATAR: "/images/default-avatar.png",
  PAGINATION_SIZE: 10,
  SEARCH_DEBOUNCE: 300,
  NOTIFICATION_DURATION: 4.5,
};

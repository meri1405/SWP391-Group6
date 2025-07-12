import { EVENT_TYPES, SEVERITY_LEVELS } from "../constants/medicalEventConstants";

/**
 * Utility functions for getting configuration objects
 */

/**
 * Get event type configuration by value
 */
export const getEventTypeConfig = (type) => {
  return EVENT_TYPES.find((t) => t.value === type) || EVENT_TYPES[0];
};

/**
 * Get severity level configuration by value
 */
export const getSeverityConfig = (severity) => {
  return SEVERITY_LEVELS.find((s) => s.value === severity) || SEVERITY_LEVELS[0];
};

import React from 'react';
import { DEFAULT_UNITS_BY_TYPE } from '../constants/index.js';
import dayjs from 'dayjs';

/**
 * UI utilities for medication management component
 * Contains reusable UI logic and helpers
 */
export const medicationUIUtils = {
  /**
   * Handle image preview for prescription images
   * @param {string} imageUrl - Image URL to preview
   * @param {number} index - Image index
   * @param {Function} setPreviewImageUrl - Setter for preview URL
   * @param {Function} setPreviewImageTitle - Setter for preview title
   * @param {Function} setImagePreviewVisible - Setter for preview visibility
   */
  handleImagePreview(imageUrl, index, setPreviewImageUrl, setPreviewImageTitle, setImagePreviewVisible) {
    if (!imageUrl) {
      return;
    }

    if (typeof imageUrl !== "string") {
      return;
    }

    if (!imageUrl.startsWith("data:image/")) {
      return;
    }

    setPreviewImageUrl(imageUrl);
    setPreviewImageTitle(`Đơn thuốc ${index + 1}`);
    setImagePreviewVisible(true);
  },

  /**
   * Handle item type change to update available units
   * @param {string} itemType - Selected item type
   * @param {number} itemIndex - Index of the medication item
   * @param {Object} form - Ant Design form instance
   */
  handleItemTypeChange(itemType, itemIndex, form) {
    const availableUnits = DEFAULT_UNITS_BY_TYPE[itemType] || ['đơn vị'];
    const defaultUnit = availableUnits[0];
    
    // Update the unit field when item type changes
    form.setFieldValue(['itemRequests', itemIndex, 'unit'], defaultUnit);
    
    // Force form to re-render by updating a dummy field and then removing it
    form.setFieldsValue({
      itemRequests: form.getFieldValue('itemRequests')
    });
  },

  /**
   * Render student name for table display
   * @param {string} text - Text from dataIndex
   * @param {Object} record - Row record
   * @param {Array} students - Array of students
   * @returns {string} Formatted student name
   */
  renderStudentName(text, record, students) {
    // If studentName exists in the record, use it directly
    if (record.studentName) {
      return record.studentName;
    }

    // Otherwise, try to find the student in the students array
    const student = students.find((s) => s.id === record.studentId);
    return student ? `${student.lastName} ${student.firstName}` : "N/A";
  },

  /**
   * Render period for table display
   * @param {Object} record - Row record
   * @returns {JSX.Element} Formatted period display
   */
  renderPeriod(record) {
    // Since dates are now at item level, show min-max dates across all items
    if (!record.itemRequests || record.itemRequests.length === 0) {
      return "N/A";
    }

    const dates = record.itemRequests.map((item) => ({
      start: dayjs(item.startDate),
      end: dayjs(item.endDate),
    }));

    const minStart = dates.reduce(
      (min, curr) => (curr.start.isBefore(min) ? curr.start : min),
      dates[0].start
    );
    const maxEnd = dates.reduce(
      (max, curr) => (curr.end.isAfter(max) ? curr.end : max),
      dates[0].end
    );

    return (
      <span>
        {minStart.format("DD/MM/YYYY")} - {maxEnd.format("DD/MM/YYYY")}
      </span>
    );
  },

  /**
   * Render medication count for table display
   * @param {Object} record - Row record
   * @returns {JSX.Element} Formatted medication count
   */
  renderMedicationCount(record) {
    return <span>{record.itemRequests?.length || 0} loại</span>;
  },

  /**
   * Render note for table display
   * @param {string} text - Note text
   * @returns {JSX.Element} Formatted note display
   */
  renderNote(text) {
    const generalNote = text || "";

    return (
      <div className="note-column-content">
        {generalNote ? (
          <div className="general-note-inline">{generalNote}</div>
        ) : (
          <span className="empty-note">Không có ghi chú</span>
        )}
      </div>
    );
  },

  /**
   * Handle frequency change and update time slots
   * @param {Event} e - Input change event
   * @param {number} itemIndex - Index of the medication item
   * @param {Object} form - Ant Design form instance
   */
  handleFrequencyChange(e, itemIndex, form) {
    const value = parseInt(e.target.value) || 0;

    // When frequency changes, update time slots field to match frequency
    const currentTimeSlots = form.getFieldValue(['itemRequests', itemIndex, 'timeSlots']) || [];
    const newTimeSlots = [...currentTimeSlots];

    // Add or remove time slots as needed
    if (value > currentTimeSlots.length) {
      // Add more time slots
      for (let i = currentTimeSlots.length; i < value; i++) {
        // Default to 8:00, 12:00, 18:00, etc. based on index
        const defaultHour = i === 0 ? 8 : i === 1 ? 12 : i === 2 ? 18 : 8 + ((i * 4) % 24);
        newTimeSlots.push(dayjs().hour(defaultHour).minute(0));
      }
    } else if (value < currentTimeSlots.length) {
      // Remove excess time slots
      newTimeSlots.length = value;
    }

    // Update form field
    form.setFieldsValue({
      itemRequests: {
        [itemIndex]: {
          timeSlots: newTimeSlots,
        },
      },
    });
  },

  /**
   * Get default values for adding new medication item
   * @param {Object} form - Ant Design form instance
   * @returns {Object} Default values for new medication item
   */
  getNewMedicationItemDefaults(form) {
    // Get dates from first medication item if available
    const currentItems = form.getFieldValue("itemRequests") || [];
    let startDate = dayjs();
    let endDate = dayjs().add(7, "day");

    if (currentItems.length > 0 && currentItems[0]) {
      // Copy dates from first medication item
      if (currentItems[0].startDate) {
        startDate = currentItems[0].startDate;
      }
      if (currentItems[0].endDate) {
        endDate = currentItems[0].endDate;
      }
    }

    return {
      itemType: "TABLET",
      unit: "viên", // Default unit for tablet
      startDate: startDate,
      endDate: endDate,
    };
  },

  /**
   * Get schedule times for display in detail modal
   * @param {Object} item - Medication item
   * @returns {Array|string} Array of schedule times or fallback text
   */
  getScheduleTimesForDisplay(item) {
    let scheduleTimes = [];

    // First try to get scheduleTimes directly from the item
    if (Array.isArray(item.scheduleTimes)) {
      scheduleTimes = item.scheduleTimes;
    }
    // If not found, try to parse from note
    else if (item.note) {
      const scheduleTimeMatch = item.note.match(/scheduleTimeJson:(.*?)($|\s)/);
      if (scheduleTimeMatch) {
        try {
          const scheduleTimeJson = JSON.parse(scheduleTimeMatch[1]);
          if (scheduleTimeJson.scheduleTimes) {
            scheduleTimes = scheduleTimeJson.scheduleTimes;
          }
        } catch (e) {
          console.error("Error parsing schedule times from note:", e);
        }
      }
    }

    return scheduleTimes.length > 0 ? scheduleTimes : null;
  },

  /**
   * Clean note by removing schedule time JSON
   * @param {string} note - Original note
   * @returns {string} Cleaned note
   */
  cleanNoteForDisplay(note) {
    if (!note) return "";
    
    // Remove scheduleTimeJson part if exists
    return note.replace(/scheduleTimeJson:.*?($|\s)/, "").trim();
  },

  /**
   * Format request date for display
   * @param {string} requestDate - Request date
   * @returns {string} Formatted date
   */
  formatRequestDate(requestDate) {
    return requestDate 
      ? dayjs(requestDate).format("DD/MM/YYYY")
      : dayjs().format("DD/MM/YYYY");
  },

  /**
   * Get item type display name
   * @param {string} itemType - Item type code
   * @returns {string} Display name
   */
  getItemTypeDisplayName(itemType) {
    const typeMap = {
      'CREAM': 'Kem',
      'DROPS': 'Giọt',
      'TABLET': 'Viên',
      'SPOONFUL': 'Thìa',
      'SPRAY': 'Xịt'
    };
    return typeMap[itemType] || itemType;
  },

  /**
   * Get item type color for tags
   * @param {string} itemType - Item type code
   * @returns {string} Color name
   */
  getItemTypeColor(itemType) {
    const colorMap = {
      'CREAM': 'red',
      'DROPS': 'green',
      'TABLET': 'blue',
      'SPOONFUL': 'cyan',
      'SPRAY': 'magenta'
    };
    return colorMap[itemType] || 'default';
  }
};

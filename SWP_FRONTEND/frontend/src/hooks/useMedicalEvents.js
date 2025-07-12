import { useState, useEffect, useCallback } from "react";
import { Form, message } from "antd";
import { medicalEventService } from "../services/medicalEventService";
import { 
  calculateStatistics,
  extractClassesFromStudents,
  filterStudentsByClass,
  filterEvents,
  validateFormData,
  formatEventData
} from "../utils/medicalEventUtils";

/**
 * Custom hook for managing medical events data and operations
 */
export const useMedicalEvents = (isViewOnly) => {
  // States
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [medicalSupplies, setMedicalSupplies] = useState([]);
  const [statistics, setStatistics] = useState({
    total: 0,
    pending: 0,
    processed: 0,
  });

  // Load events
  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const eventsData = await medicalEventService.loadEvents();
      setEvents(eventsData);
      setStatistics(calculateStatistics(eventsData));
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load students
  const loadStudents = useCallback(async () => {
    try {
      const studentsData = await medicalEventService.loadStudents();
      setStudents(studentsData);
      return studentsData;
    } catch {
      // Error already handled in service
    }
  }, []);

  // Load medical supplies
  const loadMedicalSupplies = useCallback(async () => {
    try {
      const suppliesData = await medicalEventService.loadMedicalSupplies();
      setMedicalSupplies(suppliesData);
    } catch{
      // Error already handled in service
    }
  }, []);

  // View event details
  const viewEvent = async (eventId) => {
    try {
      const event = await medicalEventService.getEventById(eventId);
      return event;
    } catch {
      return null;
    }
  };

  // Process event
  const processEvent = async (eventId) => {
    if (isViewOnly) {
      message.warning("Bạn không có quyền xử lý sự kiện y tế");
      return false;
    }

    try {
      setLoading(true);
      await medicalEventService.processEvent(eventId);
      await loadEvents(); // Reload events to update the list
      return true;
    } catch {
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Create new event
  const createEvent = async (values, healthProfileValid, healthProfileMessage) => {
    if (isViewOnly) {
      message.error("Bạn không có quyền thêm sự kiện y tế");
      return false;
    }

    try {
      setLoading(true);

      // Validate form data
      if (!validateFormData(values, healthProfileValid, healthProfileMessage)) {
        return false;
      }

      // Format data for backend
      const eventData = formatEventData(values);

      // Create event
      const response = await medicalEventService.createEvent(eventData);

      // Update local state
      if (response) {
        const newEvent = response;
        setEvents((prevEvents) => [newEvent, ...prevEvents]);
        setStatistics(calculateStatistics([newEvent, ...events]));
      } else {
        // If no response, refresh the full list
        await loadEvents();
      }

      return true;
    } catch {
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Apply filters to events
  const applyFilters = useCallback((filters) => {
    const filtered = filterEvents(events, filters);
    setFilteredEvents(filtered);
  }, [events]);

  // Load initial data
  useEffect(() => {
    loadEvents();
    loadStudents();
    loadMedicalSupplies();
  }, [loadEvents, loadStudents, loadMedicalSupplies]);

  return {
    // Data
    events,
    filteredEvents,
    students,
    medicalSupplies,
    statistics,
    loading,
    
    // Actions
    loadEvents,
    viewEvent,
    processEvent,
    createEvent,
    applyFilters,
  };
};

/**
 * Custom hook for managing form state and class/student selection
 */
export const useMedicalEventForm = (students) => {
  const [form] = Form.useForm();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [studentCount, setStudentCount] = useState(0);
  
  // Health profile validation state
  const [healthProfileValid, setHealthProfileValid] = useState(true);
  const [healthProfileMessage, setHealthProfileMessage] = useState("");

  // Extract classes when students data changes
  useEffect(() => {
    if (students.length > 0) {
      const extractedClasses = extractClassesFromStudents(students);
      setClasses(extractedClasses);
    }
  }, [students]);

  // Handle class selection
  const handleClassChange = useCallback((className) => {
    setSelectedClass(className);

    if (className) {
      const studentsInClass = filterStudentsByClass(students, className);
      setFilteredStudents(studentsInClass);
      setStudentCount(studentsInClass.length);
      // Reset student selection in form
      form.setFieldsValue({ studentId: undefined });
    } else {
      // If no class selected, clear filtered students
      setFilteredStudents([]);
      setStudentCount(0);
      form.setFieldsValue({ studentId: undefined });
    }
  }, [students, form]);

  // Handle student selection and health profile check
  const handleStudentChange = useCallback(async (studentId) => {
    if (studentId) {
      try {
        const profileResult = await medicalEventService.checkHealthProfile(studentId);
        setHealthProfileValid(profileResult.hasApprovedProfile);
        setHealthProfileMessage(profileResult.message);
      } catch{
        setHealthProfileValid(false);
        setHealthProfileMessage("Không thể kiểm tra hồ sơ sức khỏe");
      }
    } else {
      setHealthProfileValid(true);
      setHealthProfileMessage("");
    }
  }, []);

  // Reset form state
  const resetFormState = () => {
    setSelectedClass(null);
    setFilteredStudents([]);
    setStudentCount(0);
    setHealthProfileValid(true);
    setHealthProfileMessage("");
    form.resetFields();
  };

  // Sync form field with selectedClass state
  useEffect(() => {
    if (form && selectedClass) {
      form.setFieldsValue({ className: selectedClass });
    }
  }, [form, selectedClass]);

  return {
    // Form
    form,
    
    // Class/Student data
    classes,
    selectedClass,
    filteredStudents,
    studentCount,
    
    // Health profile validation
    healthProfileValid,
    healthProfileMessage,
    
    // Actions
    handleClassChange,
    handleStudentChange,
    resetFormState,
  };
};

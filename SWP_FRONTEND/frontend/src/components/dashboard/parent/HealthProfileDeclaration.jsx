import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Input,
  InputNumber,
  Button,
  Select,
  DatePicker,
  Tabs,
  message,
  Space,
  Divider,
  Row,
  Col,
  Tag,
  Modal,
  List,
  Spin,
  Alert,
  Table,
  Popconfirm,
  Checkbox,
  Radio,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  MedicineBoxOutlined,
  HeartOutlined,
  EyeOutlined,
  AudioOutlined,
  SafetyOutlined,
  FileTextOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import { parentApi } from "../../../api/parentApi";
import { useAuth } from "../../../contexts/AuthContext";
import dayjs from "dayjs";
import "../../../styles/HealthProfileDeclaration.css";
import HealthProfileDetailModal from "./HealthProfileDetailModal";

const { TextArea } = Input;
const { Option } = Select;

// Helper function to validate dates in DatePicker disabledDate callback
const disabledDateAfterToday = (current) => {
  if (!current) return false;
  return dayjs(current).isAfter(dayjs(), "day");
};

const HealthProfileDeclaration = ({ onProfileCreated }) => {
  const { getToken } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activeTab, setActiveTab] = useState("basic");
  // New states for managing health profiles
  const [healthProfiles, setHealthProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [profilesLoading, setProfilesLoading] = useState(false);

  // State for detail modal
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedProfileForDetail, setSelectedProfileForDetail] =
    useState(null);
  // Modal states for managing health conditions
  const [allergyModalVisible, setAllergyModalVisible] = useState(false);
  const [chronicModalVisible, setChronicModalVisible] = useState(false);
  const [treatmentModalVisible, setTreatmentModalVisible] = useState(false);
  const [vaccinationModalVisible, setVaccinationModalVisible] = useState(false);
  const [visionModalVisible, setVisionModalVisible] = useState(false);
  const [hearingModalVisible, setHearingModalVisible] = useState(false);
  const [infectiousModalVisible, setInfectiousModalVisible] = useState(false);

  // Edit states for each health component
  const [editingAllergy, setEditingAllergy] = useState(null);
  const [editingChronicDisease, setEditingChronicDisease] = useState(null);
  const [editingTreatment, setEditingTreatment] = useState(null);
  const [editingVaccination, setEditingVaccination] = useState(null);
  const [editingVision, setEditingVision] = useState(null);
  const [editingHearing, setEditingHearing] = useState(null);
  const [editingInfectiousDisease, setEditingInfectiousDisease] =
    useState(null);

  // View detail modal states
  const [viewDetailModalVisible, setViewDetailModalVisible] = useState(false);
  const [viewDetailData, setViewDetailData] = useState(null);
  const [viewDetailType, setViewDetailType] = useState(null);

  // Temporary storage for health data
  const [allergies, setAllergies] = useState([]);
  const [chronicDiseases, setChronicDiseases] = useState([]);
  const [infectiousDiseases, setInfectiousDiseases] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [vaccinationHistory, setVaccinationHistory] = useState([]);
  const [vaccinationRules, setVaccinationRules] = useState([]);
  const [selectedVaccinationRule, setSelectedVaccinationRule] = useState(null);
  const [showVaccinationRules, setShowVaccinationRules] = useState(false);
  const [visionData, setVisionData] = useState([]);
  const [hearingData, setHearingData] = useState([]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const token = getToken();
        const response = await parentApi.getMyStudents(token);
        setStudents(response || []);
      } catch (err) {
        console.error("Error fetching students:", err);
        message.error("Không thể tải danh sách học sinh");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [getToken]);

  // Functions for vaccination rules
  const fetchVaccinationRules = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "/api/parent/health-profiles/vaccination-rules",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        const rules = await response.json();
        setVaccinationRules(rules);
        setShowVaccinationRules(true);
      }
    } catch (error) {
      console.error("Error fetching vaccination rules:", error);
      message.error("Không thể tải danh sách quy tắc tiêm chủng");
    }
  };
  const handleRuleSelection = (ruleId) => {
    if (selectedVaccinationRule && selectedVaccinationRule.id === ruleId) {
      // If clicking the same rule, deselect it
      setSelectedVaccinationRule(null);
    } else {
      // Select the new rule
      const rule = vaccinationRules.find((r) => r.id === ruleId);
      if (rule) {
        setSelectedVaccinationRule(rule);
      }
    }
  };
  const handleRuleSelectionForForm = (rule, form) => {
    // Auto-fill form with selected vaccination rule information
    form.setFieldsValue({
      vaccineName: rule.name,
      doseNumber: rule.doesNumber || 1,
      notes: rule.description || "",
    });

    // Set as selected rule for tracking
    setSelectedVaccinationRule(rule);
  };
  const _addSelectedRulesToHistory = () => {
    if (!selectedVaccinationRule) {
      message.warning("Vui lòng chọn một quy tắc tiêm chủng");
      return;
    }

    const newEntry = {
      vaccineName: selectedVaccinationRule.name,
      doseNumber: selectedVaccinationRule.doesNumber || 1,
      dateOfVaccination: null,
      manufacturer: "",
      placeOfVaccination: "",
      administeredBy: "",
      notes: selectedVaccinationRule.description || "",
      status: "PENDING",
      ruleId: selectedVaccinationRule.id,
    };

    setVaccinationHistory((prev) => [
      ...prev,
      { ...newEntry, id: Date.now() + Math.random() },
    ]);

    setSelectedVaccinationRule(null);
    setShowVaccinationRules(false);
    message.success("Đã thêm mục tiêm chủng từ quy tắc");
  };

  const handleStudentSelect = (studentId) => {
    console.log("Selected student ID:", studentId);

    // Validate studentId is not null/undefined
    if (!studentId) {
      message.error("ID học sinh không hợp lệ");
      return;
    }

    const student = students.find(
      (s) => s.id === studentId || s.studentID === studentId
    );
    console.log("Found student:", student);

    if (!student) {
      message.error("Không tìm thấy thông tin học sinh");
      return;
    }

    setSelectedStudent(student);
    // Reset form and health data when selecting a different student
    form.resetFields();
    setAllergies([]);
    setChronicDiseases([]);
    setInfectiousDiseases([]);
    setTreatments([]);
    setVaccinationHistory([]);
    setVisionData([]);
    setHearingData([]);
    setSelectedProfile(null);

    // Fetch health profiles for the selected student
    fetchHealthProfiles(studentId);
  };
  const handleSubmit = async (values) => {
    // Comprehensive validation before submission
    if (!selectedStudent) {
      message.error("Vui lòng chọn học sinh trước khi gửi");
      return;
    }

    // Ensure we have a valid student ID with multiple checks
    const studentId = selectedStudent.id || selectedStudent.studentID;
    if (!studentId || studentId === null || studentId === undefined) {
      console.error("Invalid student ID:", { selectedStudent, studentId });
      message.error("ID học sinh không hợp lệ. Vui lòng chọn lại học sinh.");
      return;
    }

    // Validate required form fields
    if (!values.weight || values.weight <= 0) {
      message.error("Vui lòng nhập cân nặng hợp lệ");
      return;
    }

    if (!values.height || values.height <= 0) {
      message.error("Vui lòng nhập chiều cao hợp lệ");
      return;
    }

    if (!values.bloodType) {
      message.error("Vui lòng chọn nhóm máu");
      return;
    }

    try {
      setLoading(true);

      const healthProfileData = {
        weight: parseFloat(values.weight),
        height: parseFloat(values.height),
        bloodType: values.bloodType,
        note: values.note || "",
        studentId: parseInt(studentId, 10), // Ensure it's a number
        status: "PENDING",
        allergies:
          allergies.map((allergy) => {
            // Remove tempId for new allergies, keep id for existing ones
            const { tempId: _tempId, ...allergyData } = allergy;
            return allergyData;
          }) || [],
        chronicDiseases:
          chronicDiseases.map((disease) => {
            // Remove tempId for new chronic diseases, keep id for existing ones
            const { tempId: _tempId, ...diseaseData } = disease;
            return diseaseData;
          }) || [],
        infectiousDiseases:
          infectiousDiseases.map((disease) => {
            // Remove tempId for new infectious diseases, keep id for existing ones
            const { tempId: _tempId, ...diseaseData } = disease;
            return diseaseData;
          }) || [],
        treatments:
          treatments.map((treatment) => {
            // Remove tempId for new treatments, keep id for existing ones
            const { tempId: _tempId, ...treatmentData } = treatment;
            return treatmentData;
          }) || [],
        vision:
          visionData.map((vision) => {
            // Remove tempId for new vision data, keep id for existing ones
            const { tempId: _tempId, ...visionDataItem } = vision;
            return visionDataItem;
          }) || [],
        hearing:
          hearingData.map((hearing) => {
            // Remove tempId for new hearing data, keep id for existing ones
            const { tempId: _tempId, ...hearingDataItem } = hearing;
            return hearingDataItem;
          }) || [],
        vaccinationHistory:
          vaccinationHistory.map((vaccination) => {
            // Remove tempId for new vaccination history, keep id for existing ones
            const { tempId: _tempId, ...vaccinationData } = vaccination;

            // Debug logging for vaccination data being sent to server
            console.log("Processing vaccination for server:", vaccination);
            console.log(
              "Vaccination dateOfVaccination before processing:",
              vaccination.dateOfVaccination
            );
            console.log(
              "Vaccination data after tempId removal:",
              vaccinationData
            );

            return vaccinationData;
          }) || [],
      };

      // Final validation before sending
      if (!healthProfileData.studentId || isNaN(healthProfileData.studentId)) {
        throw new Error("Student ID is invalid or missing");
      }

      console.log("Submitting health profile data:", healthProfileData);
      const response = await parentApi.createHealthProfile(healthProfileData);
      console.log("Health profile created successfully:", response);
      message.success("Hồ sơ sức khỏe đã được tạo thành công!");

      // Call the callback if provided
      if (onProfileCreated) {
        onProfileCreated();
      }

      // Refresh health profiles to show updated data
      if (studentId) {
        await fetchHealthProfiles(studentId);
      }

      // Reset form after successful submission
      form.resetFields();
      setAllergies([]);
      setChronicDiseases([]);
      setInfectiousDiseases([]);
      setTreatments([]);
      setVaccinationHistory([]);
      setVisionData([]);
      setHearingData([]);
      setSelectedStudent(null);
    } catch (error) {
      console.error("Error creating health profile:", error);

      // Provide specific error messages based on error type
      if (error.response) {
        const status = error.response.status;
        const errorMessage =
          error.response.data?.message || error.response.data?.error;

        switch (status) {
          case 400:
            message.error(
              errorMessage ||
                "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin."
            );
            break;
          case 401:
            message.error(
              "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
            );
            break;
          case 403:
            message.error("Bạn không có quyền thực hiện thao tác này.");
            break;
          case 404:
            message.error(
              "Không tìm thấy thông tin học sinh. Vui lòng chọn lại."
            );
            break;
          case 500:
            message.error("Lỗi hệ thống. Vui lòng thử lại sau.");
            break;
          default:
            message.error(
              errorMessage || "Có lỗi xảy ra khi tạo hồ sơ sức khỏe"
            );
        }
      } else if (error.request) {
        message.error(
          "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng."
        );
      } else {
        message.error(error.message || "Có lỗi xảy ra khi tạo hồ sơ sức khỏe");
      }
    } finally {
      setLoading(false);
    }
  };
  // Allergy Management
  const handleAddAllergy = (allergyData) => {
    // Check if an allergy with the same type already exists
    const existingAllergy = allergies.find(
      (allergy) =>
        allergy.allergyType.toLowerCase() ===
        allergyData.allergyType.toLowerCase()
    );

    if (existingAllergy) {
      message.warning(
        `Dị ứng với "${allergyData.allergyType}" đã tồn tại trong danh sách.`
      );
      return;
    }

    const newAllergy = {
      // Don't set ID for new allergies - let backend generate it
      // This helps backend distinguish between new and existing allergies
      allergyType: allergyData.allergyType,
      description: allergyData.description,
      status: allergyData.status, // Đảm bảo giá trị này là một trong: MILD, MODERATE, SEVERE
      onsetDate: allergyData.onsetDate,
      // Add a temporary frontend ID for UI purposes only
      tempId: Date.now(),
    };

    // Use functional update to ensure we're working with the latest state
    setAllergies((prevAllergies) => [...prevAllergies, newAllergy]);
    // Modal is now closed by the modal component itself
  };

  const handleRemoveAllergy = (id) => {
    setAllergies(
      allergies.filter((allergy) => allergy.id !== id && allergy.tempId !== id)
    );
  };
  // Chronic Disease Management
  const handleAddChronicDisease = (diseaseData) => {
    const newDisease = {
      // Don't set ID for new chronic diseases - let backend generate it
      // This helps backend distinguish between new and existing chronic diseases
      diseaseName: diseaseData.diseaseName,
      dateDiagnosed: diseaseData.dateDiagnosed,
      dateResolved: diseaseData.dateResolved,
      placeOfTreatment: diseaseData.placeOfTreatment,
      description: diseaseData.description,
      dateOfAdmission: diseaseData.dateOfAdmission,
      dateOfDischarge: diseaseData.dateOfDischarge,
      status: diseaseData.status,
      // Add a temporary frontend ID for UI purposes only
      tempId: Date.now(),
    };
    setChronicDiseases([...chronicDiseases, newDisease]);
    setChronicModalVisible(false);
  };

  const handleRemoveChronicDisease = (id) => {
    setChronicDiseases(
      chronicDiseases.filter(
        (disease) => disease.id !== id && disease.tempId !== id
      )
    );
  };
  // Treatment Management
  const handleAddTreatment = (treatmentData) => {
    const newTreatment = {
      tempId: Date.now(),
      treatmentType: treatmentData.treatmentType,
      description: treatmentData.description,
      dateOfAdmission: treatmentData.dateOfAdmission,
      dateOfDischarge: treatmentData.dateOfDischarge,
      doctorName: treatmentData.doctorName,
      status: treatmentData.status || "UNDER_TREATMENT",
      placeOfTreatment: treatmentData.placeOfTreatment,
    };
    setTreatments([...treatments, newTreatment]);
    setTreatmentModalVisible(false);
  };

  const handleRemoveTreatment = (id) => {
    setTreatments(
      treatments.filter(
        (treatment) => treatment.id !== id && treatment.tempId !== id
      )
    );
  }; // Vaccination Management
  const handleAddVaccination = (vaccinationData) => {
    // Debug logging to check received vaccination data
    console.log("handleAddVaccination received data:", vaccinationData);
    console.log(
      "handleAddVaccination dateOfVaccination:",
      vaccinationData.dateOfVaccination
    );

    const newVaccination = {
      tempId: Date.now(),
      vaccineName: vaccinationData.vaccineName,
      doseNumber: vaccinationData.doseNumber,
      manufacturer: vaccinationData.manufacturer,
      dateOfVaccination: vaccinationData.dateOfVaccination,
      placeOfVaccination: vaccinationData.placeOfVaccination,
      administeredBy: vaccinationData.administeredBy,
      notes: vaccinationData.notes,
      status: true,
      // Include ruleId if a rule is selected
      ruleId: selectedVaccinationRule?.id || null,
    };

    // Debug logging to check the new vaccination object
    console.log("New vaccination object created:", newVaccination);
    console.log(
      "New vaccination dateOfVaccination:",
      newVaccination.dateOfVaccination
    );
    console.log("New vaccination ruleId:", newVaccination.ruleId);

    setVaccinationHistory([...vaccinationHistory, newVaccination]);
    setVaccinationModalVisible(false);

    // Clear selected rule after adding vaccination
    setSelectedVaccinationRule(null);
    setShowVaccinationRules(false);
  };
  const handleRemoveVaccination = (id) => {
    // Find the vaccination record to check if it can be removed
    const vaccinationRecord = vaccinationHistory.find(v => v.id === id || v.tempId === id);
    if (vaccinationRecord && vaccinationRecord.source === 'SCHOOL_ADMINISTERED') {
      message.warning('Không thể xóa thông tin tiêm chủng do trường quản lý');
      return;
    }
    setVaccinationHistory(
      vaccinationHistory.filter(
        (vaccination) => vaccination.id !== id && vaccination.tempId !== id
      )
    );
  };
  // Vision Management
  const handleAddVision = (formData) => {
    const newVision = {
      tempId: Date.now(),
      visionLeft: parseInt(formData.visionLeft, 10) || 0,
      visionRight: parseInt(formData.visionRight, 10) || 0,
      visionLeftWithGlass: parseInt(formData.visionLeftWithGlass, 10) || 0,
      visionRightWithGlass: parseInt(formData.visionRightWithGlass, 10) || 0,
      visionDescription: formData.visionDescription,
      dateOfExamination: formData.dateOfExamination
        ? (formData.dateOfExamination.format ? formData.dateOfExamination.format("YYYY-MM-DD") : formData.dateOfExamination)
        : null,
    };
    setVisionData([...visionData, newVision]);
    setVisionModalVisible(false);
  };

  const handleRemoveVision = (id) => {
    // Find the vision record to check if it can be removed
    const visionRecord = visionData.find(v => v.id === id || v.tempId === id);
    if (visionRecord && (visionRecord.healthCheckResult || visionRecord.healthResult)) {
      message.warning('Không thể xóa thông tin thị lực đã có kết quả khám sức khỏe');
      return;
    }
    setVisionData(
      visionData.filter((vision) => vision.id !== id && vision.tempId !== id)
    );
  };
  // Hearing Management
  const handleAddHearing = (formData) => {
    const newHearing = {
      tempId: Date.now(),
      leftEar: parseInt(formData.leftEar, 10) || 0,
      rightEar: parseInt(formData.rightEar, 10) || 0,
      description: formData.description,
      dateOfExamination: formData.dateOfExamination
        ? (formData.dateOfExamination.format ? formData.dateOfExamination.format("YYYY-MM-DD") : formData.dateOfExamination)
        : null,
    };
    setHearingData([...hearingData, newHearing]);
    setHearingModalVisible(false);
  };

  const handleRemoveHearing = (id) => {
    // Find the hearing record to check if it can be removed
    const hearingRecord = hearingData.find(h => h.id === id || h.tempId === id);
    if (hearingRecord && (hearingRecord.healthCheckResult || hearingRecord.healthResult)) {
      message.warning('Không thể xóa thông tin thính lực đã có kết quả khám sức khỏe');
      return;
    }
    setHearingData(
      hearingData.filter(
        (hearing) => hearing.id !== id && hearing.tempId !== id
      )
    );
  };

  // Infectious Disease Management
  const handleAddInfectiousDisease = (diseaseData) => {
    const newDisease = {
      tempId: Date.now(),
      diseaseName: diseaseData.diseaseName,
      dateDiagnosed: diseaseData.dateDiagnosed,
      dateResolved: diseaseData.dateResolved,
      placeOfTreatment: diseaseData.placeOfTreatment,
      description: diseaseData.description,
      dateOfAdmission: diseaseData.dateOfAdmission,
      dateOfDischarge: diseaseData.dateOfDischarge,
      status: diseaseData.status,
    };
    setInfectiousDiseases([...infectiousDiseases, newDisease]);
    setInfectiousModalVisible(false);
  };

  const handleRemoveInfectiousDisease = (id) => {
    setInfectiousDiseases(
      infectiousDiseases.filter(
        (disease) => disease.id !== id && disease.tempId !== id
      )
    );
  };

  // Edit handler functions for each health component
  const handleEditAllergy = (allergy) => {
    setEditingAllergy(allergy);
    setAllergyModalVisible(true);
  };

  const handleEditChronicDisease = (disease) => {
    setEditingChronicDisease(disease);
    setChronicModalVisible(true);
  };

  const handleEditTreatment = (treatment) => {
    setEditingTreatment(treatment);
    setTreatmentModalVisible(true);
  };

  const handleEditVaccination = (vaccination) => {
    // Check if vaccination is school-administered
    if (vaccination.source === 'SCHOOL_ADMINISTERED') {
      message.warning('Không thể chỉnh sửa thông tin tiêm chủng do trường quản lý');
      return;
    }
    setEditingVaccination(vaccination);
    setVaccinationModalVisible(true);
  };

  const handleEditVision = (vision) => {
    // Check if vision record has health check result
    if (vision.healthCheckResult || vision.healthResult) {
      message.warning('Không thể chỉnh sửa thông tin thị lực đã có kết quả khám sức khỏe');
      return;
    }
    setEditingVision(vision);
    setVisionModalVisible(true);
  };

  const handleEditHearing = (hearing) => {
    // Check if hearing record has health check result
    if (hearing.healthCheckResult || hearing.healthResult) {
      message.warning('Không thể chỉnh sửa thông tin thính lực đã có kết quả khám sức khỏe');
      return;
    }
    setEditingHearing(hearing);
    setHearingModalVisible(true);
  };

  const handleEditInfectiousDisease = (disease) => {
    setEditingInfectiousDisease(disease);
    setInfectiousModalVisible(true);
  };

  // View detail handler function
  const handleViewDetail = (data, type) => {
    setViewDetailData(data);
    setViewDetailType(type);
    setViewDetailModalVisible(true);
  };

  // Update handler functions to support both add and edit modes
  const handleUpdateAllergy = (allergyData) => {
    if (editingAllergy) {
      // Edit existing allergy
      setAllergies(
        allergies.map((allergy) =>
          (allergy.id || allergy.tempId) ===
          (editingAllergy.id || editingAllergy.tempId)
            ? { ...allergy, ...allergyData }
            : allergy
        )
      );
      setEditingAllergy(null);
      message.success("Cập nhật dị ứng thành công");
    } else {
      // Add new allergy (existing logic)
      handleAddAllergy(allergyData);
    }
    setAllergyModalVisible(false);
  };

  const handleUpdateChronicDisease = (diseaseData) => {
    if (editingChronicDisease) {
      // Edit existing chronic disease
      setChronicDiseases(
        chronicDiseases.map((disease) =>
          (disease.id || disease.tempId) ===
          (editingChronicDisease.id || editingChronicDisease.tempId)
            ? { ...disease, ...diseaseData }
            : disease
        )
      );
      setEditingChronicDisease(null);
      message.success("Cập nhật bệnh mãn tính thành công");
    } else {
      // Add new chronic disease (existing logic)
      handleAddChronicDisease(diseaseData);
    }
    setChronicModalVisible(false);
  };

  const handleUpdateTreatment = (treatmentData) => {
    if (editingTreatment) {
      // Edit existing treatment
      setTreatments(
        treatments.map((treatment) =>
          (treatment.id || treatment.tempId) ===
          (editingTreatment.id || editingTreatment.tempId)
            ? { ...treatment, ...treatmentData }
            : treatment
        )
      );
      setEditingTreatment(null);
      message.success("Cập nhật lịch sử điều trị thành công");
    } else {
      // Add new treatment (existing logic)
      handleAddTreatment(treatmentData);
    }
    setTreatmentModalVisible(false);
  };
  const handleUpdateVaccination = (vaccinationData) => {
    if (editingVaccination) {
      // Edit existing vaccination
      const updatedVaccinationData = {
        ...vaccinationData,
        // Include ruleId if a rule is selected, otherwise preserve existing ruleId or set to null
        ruleId: selectedVaccinationRule?.id || vaccinationData.ruleId || null,
      };

      setVaccinationHistory(
        vaccinationHistory.map((vaccination) =>
          (vaccination.id || vaccination.tempId) ===
          (editingVaccination.id || editingVaccination.tempId)
            ? { ...vaccination, ...updatedVaccinationData }
            : vaccination
        )
      );
      setEditingVaccination(null);
      message.success("Cập nhật tiêm chủng thành công");

      // Clear selected rule after updating vaccination
      setSelectedVaccinationRule(null);
      setShowVaccinationRules(false);
    } else {
      // Add new vaccination (existing logic)
      handleAddVaccination(vaccinationData);
    }
    setVaccinationModalVisible(false);
  };

  const handleUpdateVision = (visionData) => {
    if (editingVision) {
      // Edit existing vision data
      setVisionData((visionDataList) =>
        visionDataList.map((vision) =>
          (vision.id || vision.tempId) ===
          (editingVision.id || editingVision.tempId)
            ? { ...vision, ...visionData }
            : vision
        )
      );
      setEditingVision(null);
      message.success("Cập nhật thị lực thành công");
    } else {
      // Add new vision data (existing logic)
      handleAddVision(visionData);
    }
    setVisionModalVisible(false);
  };

  const handleUpdateHearing = (hearingData) => {
    if (editingHearing) {
      // Edit existing hearing data
      setHearingData((hearingDataList) =>
        hearingDataList.map((hearing) =>
          (hearing.id || hearing.tempId) ===
          (editingHearing.id || editingHearing.tempId)
            ? { ...hearing, ...hearingData }
            : hearing
        )
      );
      setEditingHearing(null);
      message.success("Cập nhật thính lực thành công");
    } else {
      // Add new hearing data (existing logic)
      handleAddHearing(hearingData);
    }
    setHearingModalVisible(false);
  };

  const handleUpdateInfectiousDisease = (diseaseData) => {
    if (editingInfectiousDisease) {
      // Edit existing infectious disease
      setInfectiousDiseases(
        infectiousDiseases.map((disease) =>
          (disease.id || disease.tempId) ===
          (editingInfectiousDisease.id || editingInfectiousDisease.tempId)
            ? { ...disease, ...diseaseData }
            : disease
        )
      );
      setEditingInfectiousDisease(null);
      message.success("Cập nhật bệnh truyền nhiễm thành công");
    } else {
      // Add new infectious disease (existing logic)
      handleAddInfectiousDisease(diseaseData);
    }
    setInfectiousModalVisible(false);
  };
  // Fetch health profiles for the selected student
  const fetchHealthProfiles = async (studentId) => {
    setProfilesLoading(true);
    try {
      const token = getToken();
      const response = await parentApi.getHealthProfilesByStudentId(
        studentId,
        token
      );
      setHealthProfiles(response || []);
    } catch (error) {
      console.error("Error fetching health profiles:", error);
      message.error("Không thể tải hồ sơ sức khỏe");
    } finally {
      setProfilesLoading(false);
    }
  };

  // Handle profile update submission
  const handleProfileUpdate = async (values) => {
    if (!selectedStudent || !selectedProfile) {
      message.error("Không có hồ sơ được chọn để cập nhật");
      return;
    }

    const studentId = selectedStudent.id || selectedStudent.studentID;
    if (!studentId) {
      message.error("ID học sinh không hợp lệ");
      return;
    }

    try {
      setLoading(true);
      const updatedProfileData = {
        ...selectedProfile,
        weight: parseFloat(values.weight),
        height: parseFloat(values.height),
        bloodType: values.bloodType,
        note: values.note || "",
        studentId: parseInt(studentId, 10),
        allergies:
          allergies.map((allergy) => {
            // Remove tempId for new allergies, keep id for existing ones
            const { tempId: _tempId, ...allergyData } = allergy;
            return allergyData;
          }) || [],
        chronicDiseases:
          chronicDiseases.map((disease) => {
            // Remove tempId for new chronic diseases, keep id for existing ones
            const { tempId: _tempId, ...diseaseData } = disease;
            return {
              ...diseaseData,
              dateDiagnosed:
                diseaseData.dateDiagnosed && diseaseData.dateDiagnosed.format
                  ? diseaseData.dateDiagnosed.format("YYYY-MM-DD")
                  : diseaseData.dateDiagnosed,
              dateResolved:
                diseaseData.dateResolved && diseaseData.dateResolved.format
                  ? diseaseData.dateResolved.format("YYYY-MM-DD")
                  : diseaseData.dateResolved,
              dateOfAdmission:
                diseaseData.dateOfAdmission &&
                diseaseData.dateOfAdmission.format
                  ? diseaseData.dateOfAdmission.format("YYYY-MM-DD")
                  : diseaseData.dateOfAdmission,
              dateOfDischarge:
                diseaseData.dateOfDischarge &&
                diseaseData.dateOfDischarge.format
                  ? diseaseData.dateOfDischarge.format("YYYY-MM-DD")
                  : diseaseData.dateOfDischarge,
            };
          }) || [],
        infectiousDiseases:
          infectiousDiseases.map((disease) => {
            // Remove tempId for new infectious diseases, keep id for existing ones
            const { tempId: _tempId, ...diseaseData } = disease;
            return {
              ...diseaseData,
              dateDiagnosed:
                diseaseData.dateDiagnosed && diseaseData.dateDiagnosed.format
                  ? diseaseData.dateDiagnosed.format("YYYY-MM-DD")
                  : diseaseData.dateDiagnosed,
              dateResolved:
                diseaseData.dateResolved && diseaseData.dateResolved.format
                  ? diseaseData.dateResolved.format("YYYY-MM-DD")
                  : diseaseData.dateResolved,
              dateOfAdmission:
                diseaseData.dateOfAdmission &&
                diseaseData.dateOfAdmission.format
                  ? diseaseData.dateOfAdmission.format("YYYY-MM-DD")
                  : diseaseData.dateOfAdmission,
              dateOfDischarge:
                diseaseData.dateOfDischarge &&
                diseaseData.dateOfDischarge.format
                  ? diseaseData.dateOfDischarge.format("YYYY-MM-DD")
                  : diseaseData.dateOfDischarge,
            };
          }) || [],
        treatments:
          treatments.map((treatment) => {
            // Remove tempId for new treatments, keep id for existing ones
            const { tempId: _tempId, ...treatmentData } = treatment;
            return treatmentData;
          }) || [],
        vision:
          visionData.map((vision) => {
            // Remove tempId for new vision data, keep id for existing ones
            const { tempId: _tempId, ...visionDataItem } = vision;
            return {
              ...visionDataItem,
              dateOfExamination:
                visionDataItem.dateOfExamination &&
                visionDataItem.dateOfExamination.format
                  ? visionDataItem.dateOfExamination.format("YYYY-MM-DD")
                  : visionDataItem.dateOfExamination,
            };
          }) || [],
        hearing:
          hearingData.map((hearing) => {
            // Remove tempId for new hearing data, keep id for existing ones
            const { tempId: _tempId, ...hearingDataItem } = hearing;
            return {
              ...hearingDataItem,
              dateOfExamination:
                hearingDataItem.dateOfExamination &&
                hearingDataItem.dateOfExamination.format
                  ? hearingDataItem.dateOfExamination.format("YYYY-MM-DD")
                  : hearingDataItem.dateOfExamination,
            };
          }) || [],
        vaccinationHistory:
          vaccinationHistory.map((vaccination) => {
            // Remove tempId for new vaccination history, keep id for existing ones
            const { tempId: _tempId, ...vaccinationData } = vaccination;
            return vaccinationData;
          }) || [],
      };

      console.log("Updating health profile data:", updatedProfileData);
      const response = await parentApi.updateHealthProfile(
        updatedProfileData.id,
        updatedProfileData
      );
      console.log("Health profile updated successfully:", response);

      message.success("Hồ sơ sức khỏe đã được cập nhật thành công!");

      // Refresh profiles list
      fetchHealthProfiles(studentId);

      // Reset form and states
      form.resetFields();
      setAllergies([]);
      setChronicDiseases([]);
      setInfectiousDiseases([]);
      setTreatments([]);
      setVaccinationHistory([]);
      setVisionData([]);
      setHearingData([]);
      setSelectedProfile(null);
    } catch (error) {
      console.error("Error updating health profile:", error);
      message.error("Có lỗi xảy ra khi cập nhật hồ sơ sức khỏe");
    } finally {
      setLoading(false);
    }
  };

  // Modified submit handler to handle both create and update
  const handleFormSubmit = async (values) => {
    if (selectedProfile) {
      // Update existing profile
      await handleProfileUpdate(values);
    } else {
      // Create new profile
      await handleSubmit(values);
    }
  };
  // Handle profile selection for viewing or editing
  const handleProfileSelect = (profile) => {
    setSelectedProfile(profile);
    setActiveTab("basic"); // Populate form with selected profile data
    form.setFieldsValue({
      weight: profile.weight,
      height: profile.height,
      bloodType: profile.bloodType,
      note: profile.note,
    });
    setAllergies(profile.allergies);
    setChronicDiseases(profile.chronicDiseases);
    setInfectiousDiseases(profile.infectiousDiseases);
    setTreatments(profile.treatments);
    setVaccinationHistory(profile.vaccinationHistory);
    setVisionData(profile.vision);
    setHearingData(profile.hearing);
  };
  // Handle profile deletion
  const handleProfileDelete = async (profileId) => {
    try {
      const token = getToken();
      await parentApi.deleteHealthProfile(profileId, token);
      message.success("Đã xóa hồ sơ sức khỏe");

      // Refresh profile list
      fetchHealthProfiles(selectedStudent.id || selectedStudent.studentID);
    } catch (error) {
      console.error("Error deleting health profile:", error);
      message.error("Không thể xóa hồ sơ sức khỏe");
    }
  }; // Handle viewing profile detail
  const handleViewProfileDetail = async (profile) => {
    try {
      setLoading(true);

      // Tìm profile đầy đủ từ danh sách hiện có thay vì gọi API
      const fullProfile = healthProfiles.find((p) => p.id === profile.id);

      if (!fullProfile) {
        message.error("Không tìm thấy thông tin chi tiết hồ sơ");
        return;
      }

      console.log("FullProfile from list:", fullProfile);
      console.log("SelectedStudent:", selectedStudent);

      setSelectedProfileForDetail({
        ...fullProfile,
        // Ưu tiên dữ liệu student từ profile, fallback về selectedStudent
        student: fullProfile.student || selectedStudent,
      });
      setDetailModalVisible(true);
    } catch (error) {
      console.error("Error fetching health profile details:", error);
      message.error("Không thể tải chi tiết hồ sơ sức khỏe");
    } finally {
      setLoading(false);
    }
  };
  if (loading && students.length === 0) {
    return (
      <div
        style={{ display: "flex", justifyContent: "center", padding: "50px" }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <Card>
        <div style={{ marginBottom: "24px" }}>
          <h2 style={{ marginBottom: "16px", color: "#1890ff" }}>
            <MedicineBoxOutlined style={{ marginRight: "8px" }} />
            Khai Báo Hồ Sơ Sức Khỏe
          </h2>
          <Alert
            message="Thông tin quan trọng"
            description="Vui lòng cung cấp thông tin sức khỏe chính xác và đầy đủ cho con em của bạn. Thông tin này sẽ giúp nhà trường chăm sóc sức khỏe tốt hơn."
            type="info"
            showIcon
            style={{ marginBottom: "24px" }}
          />
        </div>
        {/* Student Selection */}
        <Card
          size="small"
          style={{ marginBottom: "24px", backgroundColor: "#f9f9f9" }}
        >
          <Row gutter={[16, 16]} align="middle">
            <Col span={8}>
              <label style={{ fontWeight: 600 }}>Chọn học sinh:</label>
            </Col>
            <Col span={16}>
              {" "}
              <Select
                placeholder="Chọn học sinh để khai báo hồ sơ sức khỏe"
                style={{ width: "100%" }}
                value={selectedStudent?.id || selectedStudent?.studentID}
                onChange={handleStudentSelect}
                size="large"
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option?.children?.toLowerCase().includes(input.toLowerCase())
                }
              >
                {students.map((student, index) => {
                  const studentId = student.id || student.studentID;
                  const studentName =
                    student.firstName && student.lastName
                      ? `${student.lastName} ${student.firstName}`
                      : student.name || "Tên không có";

                  // Skip students without valid IDs
                  if (!studentId) {
                    console.warn("Student without valid ID:", student);
                    return null;
                  }

                  return (
                    <Option
                      key={studentId || `student-${index}`}
                      value={studentId}
                    >
                      {studentName} - Lớp {student.className || "N/A"}
                    </Option>
                  );
                })}
              </Select>
            </Col>
          </Row>
        </Card>{" "}
        {!selectedStudent && (
          <Card
            style={{
              textAlign: "center",
              padding: "48px",
              marginBottom: "24px",
            }}
          >
            <MedicineBoxOutlined
              style={{
                fontSize: "48px",
                color: "#1890ff",
                marginBottom: "16px",
              }}
            />
            <h3 style={{ color: "#1890ff", marginBottom: "8px" }}>
              Chọn học sinh để bắt đầu khai báo
            </h3>
            <p style={{ color: "#666", margin: 0 }}>
              Vui lòng chọn học sinh từ danh sách bên trên để bắt đầu khai báo
              hồ sơ sức khỏe
            </p>
          </Card>
        )}{" "}
        {selectedStudent &&
          (healthProfiles.length === 0 || selectedProfile) && (
            <Card
              title={`${
                selectedProfile ? "Chỉnh sửa" : "Tạo"
              } hồ sơ sức khỏe của ${
                selectedStudent.firstName && selectedStudent.lastName
                  ? `${selectedStudent.lastName} ${selectedStudent.firstName}`
                  : selectedStudent.name || "Học sinh"
              }`}
              style={{ marginBottom: "24px" }}
            >
              <Form
                form={form}
                layout="vertical"
                onFinish={handleFormSubmit}
                initialValues={{
                  weight: 0,
                  height: 0,
                  bloodType: "",
                  note: "",
                }}
              >
                <Tabs
                  activeKey={activeTab}
                  onChange={setActiveTab}
                  items={[
                    {
                      key: "basic",
                      label: "Thông tin cơ bản",
                      children: (
                        <>
                          <Row gutter={[24, 16]}>
                            <Col span={12}>
                              <Form.Item
                                label="Cân nặng (kg)"
                                name="weight"
                                rules={[
                                  {
                                    required: true,
                                    message: "Vui lòng nhập cân nặng",
                                  },
                                ]}
                              >
                                <InputNumber
                                  style={{ width: "100%" }}
                                  placeholder="Nhập cân nặng"
                                  step={0.1}
                                  precision={1}
                                  min={1}
                                  max={200}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={12}>
                              <Form.Item
                                label="Chiều cao (cm)"
                                name="height"
                                rules={[
                                  {
                                    required: true,
                                    message: "Vui lòng nhập chiều cao",
                                  },
                                ]}
                              >
                                <InputNumber
                                  style={{ width: "100%" }}
                                  placeholder="Nhập chiều cao"
                                  step={0.1}
                                  precision={1}
                                  min={50}
                                  max={250}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={12}>
                              <Form.Item
                                label="Nhóm máu"
                                name="bloodType"
                                rules={[
                                  {
                                    required: true,
                                    message: "Vui lòng chọn nhóm máu",
                                  },
                                ]}
                              >
                                <Select
                                  placeholder="Chọn nhóm máu"
                                  style={{ width: "100%" }}
                                >
                                  <Option value="A">A</Option>
                                  <Option value="B">B</Option>
                                  <Option value="AB">AB</Option>
                                  <Option value="O">O</Option>
                                  <Option value="A+">A+</Option>
                                  <Option value="A-">A-</Option>
                                  <Option value="B+">B+</Option>
                                  <Option value="B-">B-</Option>
                                  <Option value="AB+">AB+</Option>
                                  <Option value="AB-">AB-</Option>
                                  <Option value="O+">O+</Option>
                                  <Option value="O-">O-</Option>
                                </Select>
                              </Form.Item>
                            </Col>
                          </Row>

                          <Form.Item label="Ghi chú bổ sung" name="note">
                            <TextArea
                              rows={4}
                              placeholder="Các thông tin bổ sung về sức khỏe của học sinh..."
                            />
                          </Form.Item>
                        </>
                      ),
                    },
                    {
                      key: "allergies",
                      label: "Dị ứng",
                      children: (
                        <>
                          <div style={{ marginBottom: "16px" }}>
                            <Button
                              type="primary"
                              icon={<PlusOutlined />}
                              onClick={() => setAllergyModalVisible(true)}
                            >
                              Thêm dị ứng
                            </Button>
                          </div>
                          <List
                            dataSource={allergies}
                            renderItem={(allergy) => (
                              <List.Item
                                key={allergy.id || allergy.tempId}
                                actions={[
                                  <Button
                                    type="link"
                                    icon={<EyeOutlined />}
                                    onClick={() =>
                                      handleViewDetail(allergy, "allergy")
                                    }
                                  >
                                    Xem
                                  </Button>,
                                  <Button
                                    type="link"
                                    icon={<EditOutlined />}
                                    onClick={() => handleEditAllergy(allergy)}
                                  >
                                    Sửa
                                  </Button>,
                                  <Button
                                    type="link"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() =>
                                      handleRemoveAllergy(
                                        allergy.id || allergy.tempId
                                      )
                                    }
                                  >
                                    Xóa
                                  </Button>,
                                ]}
                              >
                                <List.Item.Meta
                                  title={allergy.allergyType}
                                  description={
                                    <div>
                                      <p>{allergy.description}</p>
                                      <Tag
                                        color={
                                          allergy.status === "MILD"
                                            ? "green"
                                            : allergy.status === "MODERATE"
                                            ? "orange"
                                            : allergy.status === "SEVERE"
                                            ? "red"
                                            : "blue"
                                        }
                                      >
                                        {allergy.status === "MILD"
                                          ? "Nhẹ"
                                          : allergy.status === "MODERATE"
                                          ? "Trung bình"
                                          : allergy.status === "SEVERE"
                                          ? "Nặng"
                                          : "Không xác định"}
                                      </Tag>
                                      {allergy.onsetDate && (
                                        <span
                                          style={{
                                            marginLeft: "8px",
                                            color: "#666",
                                          }}
                                        >
                                          Từ:{" "}
                                          {dayjs(allergy.onsetDate).format(
                                            "DD/MM/YYYY"
                                          )}
                                        </span>
                                      )}
                                    </div>
                                  }
                                />
                              </List.Item>
                            )}
                            locale={{ emptyText: "Chưa có thông tin dị ứng" }}
                          />
                        </>
                      ),
                    },
                    {
                      key: "chronic",
                      label: "Bệnh mãn tính",
                      children: (
                        <>
                          <div style={{ marginBottom: "16px" }}>
                            <Button
                              type="primary"
                              icon={<PlusOutlined />}
                              onClick={() => setChronicModalVisible(true)}
                            >
                              Thêm bệnh mãn tính
                            </Button>
                          </div>
                          <List
                            dataSource={chronicDiseases}
                            renderItem={(disease) => (
                              <List.Item
                                key={disease.id || disease.tempId}
                                actions={[
                                  <Button
                                    type="link"
                                    icon={<EyeOutlined />}
                                    onClick={() =>
                                      handleViewDetail(
                                        disease,
                                        "chronicDisease"
                                      )
                                    }
                                  >
                                    Xem
                                  </Button>,
                                  <Button
                                    type="link"
                                    icon={<EditOutlined />}
                                    onClick={() =>
                                      handleEditChronicDisease(disease)
                                    }
                                  >
                                    Sửa
                                  </Button>,
                                  <Button
                                    type="link"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() =>
                                      handleRemoveChronicDisease(
                                        disease.id || disease.tempId
                                      )
                                    }
                                  >
                                    Xóa
                                  </Button>,
                                ]}
                              >
                                <List.Item.Meta
                                  title={disease.diseaseName}
                                  description={
                                    <div>
                                      <p>{disease.description}</p>
                                      <Tag
                                        color={
                                          disease.status === "RECOVERED"
                                            ? "green"
                                            : disease.status ===
                                              "UNDER_TREATMENT"
                                            ? "orange"
                                            : disease.status === "STABLE"
                                            ? "blue"
                                            : disease.status === "WORSENED"
                                            ? "red"
                                            : disease.status === "RELAPSED"
                                            ? "volcano"
                                            : disease.status ===
                                              "NEWLY_DIAGNOSED"
                                            ? "purple"
                                            : disease.status ===
                                              "UNDER_OBSERVATION"
                                            ? "cyan"
                                            : disease.status === "ISOLATED"
                                            ? "magenta"
                                            : disease.status === "UNTREATED"
                                            ? "gold"
                                            : "default"
                                        }
                                      >
                                        {disease.status === "UNDER_TREATMENT"
                                          ? "Đang điều trị"
                                          : disease.status === "RECOVERED"
                                          ? "Đã khỏi"
                                          : disease.status === "STABLE"
                                          ? "Ổn định"
                                          : disease.status === "WORSENED"
                                          ? "Đang xấu đi"
                                          : disease.status === "RELAPSED"
                                          ? "Tái phát"
                                          : disease.status === "NEWLY_DIAGNOSED"
                                          ? "Mới chẩn đoán"
                                          : disease.status ===
                                            "UNDER_OBSERVATION"
                                          ? "Đang theo dõi"
                                          : disease.status === "UNKNOWN"
                                          ? "Không rõ"
                                          : disease.status === "ISOLATED"
                                          ? "Cách ly"
                                          : disease.status === "UNTREATED"
                                          ? "Chưa điều trị"
                                          : "Không xác định"}
                                      </Tag>
                                      {disease.dateDiagnosed && (
                                        <span
                                          style={{
                                            marginLeft: "8px",
                                            color: "#666",
                                          }}
                                        >
                                          Chẩn đoán:{" "}
                                          {dayjs(disease.dateDiagnosed).format(
                                            "DD/MM/YYYY"
                                          )}
                                        </span>
                                      )}
                                      {disease.placeOfTreatment && (
                                        <p
                                          style={{
                                            margin: "4px 0 0 0",
                                            color: "#666",
                                          }}
                                        >
                                          Nơi điều trị:{" "}
                                          {disease.placeOfTreatment}
                                        </p>
                                      )}
                                    </div>
                                  }
                                />
                              </List.Item>
                            )}
                            locale={{
                              emptyText: "Chưa có thông tin bệnh mãn tính",
                            }}
                          />
                        </>
                      ),
                    },
                    {
                      key: "treatment",
                      label: "Lịch sử điều trị",
                      children: (
                        <>
                          <div style={{ marginBottom: "16px" }}>
                            <Button
                              type="primary"
                              icon={<PlusOutlined />}
                              onClick={() => setTreatmentModalVisible(true)}
                            >
                              Thêm lịch sử điều trị
                            </Button>
                          </div>
                          <List
                            dataSource={treatments}
                            renderItem={(treatment) => (
                              <List.Item
                                key={treatment.id || treatment.tempId}
                                actions={[
                                  <Button
                                    type="link"
                                    icon={<EyeOutlined />}
                                    onClick={() =>
                                      handleViewDetail(treatment, "treatment")
                                    }
                                  >
                                    Xem
                                  </Button>,
                                  <Button
                                    type="link"
                                    icon={<EditOutlined />}
                                    onClick={() =>
                                      handleEditTreatment(treatment)
                                    }
                                  >
                                    Sửa
                                  </Button>,
                                  <Button
                                    type="link"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() =>
                                      handleRemoveTreatment(
                                        treatment.id || treatment.tempId
                                      )
                                    }
                                  >
                                    Xóa
                                  </Button>,
                                ]}
                              >
                                <List.Item.Meta
                                  title={treatment.treatmentType}
                                  description={
                                    <div>
                                      <p>{treatment.description}</p>
                                      <p style={{ margin: 0, color: "#666" }}>
                                        Bác sĩ: {treatment.doctorName}
                                      </p>
                                      <p style={{ margin: 0, color: "#666" }}>
                                        Thời gian:{" "}
                                        {treatment.dateOfAdmission
                                          ? dayjs(
                                              treatment.dateOfAdmission
                                            ).format("DD/MM/YYYY")
                                          : "Chưa cập nhật"}
                                        {treatment.dateOfAdmission &&
                                          ` - ${dayjs(
                                            treatment.dateOfDischarge
                                          ).format("DD/MM/YYYY")}`}
                                      </p>
                                    </div>
                                  }
                                />
                              </List.Item>
                            )}
                            locale={{ emptyText: "Chưa có lịch sử điều trị" }}
                          />
                        </>
                      ),
                    },
                    {
                      key: "vaccination",
                      label: "Tiêm chủng",
                      children: (
                        <>
                          <div style={{ marginBottom: "16px" }}>
                            <Button
                              type="primary"
                              icon={<PlusOutlined />}
                              onClick={() => setVaccinationModalVisible(true)}
                            >
                              Thêm lịch sử tiêm chủng
                            </Button>
                          </div>
                          <List
                            dataSource={vaccinationHistory}
                            renderItem={(vaccination) => (
                              <List.Item
                                key={vaccination.id || vaccination.tempId}
                                actions={[
                                  <Button
                                    type="link"
                                    icon={<EyeOutlined />}
                                    onClick={() =>
                                      handleViewDetail(
                                        vaccination,
                                        "vaccination"
                                      )
                                    }
                                  >
                                    Xem
                                  </Button>,
                                  <Button
                                    type="link"
                                    icon={<EditOutlined />}
                                    onClick={() =>
                                      handleEditVaccination(vaccination)
                                    }
                                    disabled={vaccination.source === 'SCHOOL_ADMINISTERED'}
                                    title={vaccination.source === 'SCHOOL_ADMINISTERED' ? 
                                      'Không thể chỉnh sửa thông tin tiêm chủng do trường quản lý' : 
                                      (vaccination.status === "PENDING" ? "Hoàn thành" : "Sửa")}
                                  >
                                    {vaccination.status === "PENDING"
                                      ? "Hoàn thành"
                                      : "Sửa"}
                                  </Button>,
                                  <Button
                                    type="link"
                                    danger
                                    icon={<DeleteOutlined />}
                                    disabled={vaccination.source === 'SCHOOL_ADMINISTERED'}
                                    onClick={() =>
                                      handleRemoveVaccination(
                                        vaccination.id || vaccination.tempId
                                      )
                                    }
                                    title={
                                      vaccination.source === 'SCHOOL_ADMINISTERED' 
                                        ? 'Không thể xóa - Do trường quản lý' 
                                        : 'Xóa thông tin tiêm chủng'
                                    }
                                  >
                                    Xóa
                                  </Button>,
                                ]}
                              >
                                <List.Item.Meta
                                  title={
                                    <div>
                                      {vaccination.vaccineName}
                                      {vaccination.status === "PENDING" && (
                                        <Tag
                                          color="orange"
                                          style={{ marginLeft: 8 }}
                                        >
                                          Chưa hoàn thành
                                        </Tag>
                                      )}
                                      {vaccination.status === "COMPLETED" && (
                                        <Tag
                                          color="green"
                                          style={{ marginLeft: 8 }}
                                        >
                                          Đã hoàn thành
                                        </Tag>
                                      )}
                                      {vaccination.source === 'SCHOOL_ADMINISTERED' && (
                                        <Tag
                                          color="blue"
                                          style={{ marginLeft: 8 }}
                                        >
                                          Do trường quản lý
                                        </Tag>
                                      )}
                                    </div>
                                  }
                                  description={
                                    <div>
                                      {vaccination.dateOfVaccination ? (
                                        <p>
                                          Ngày tiêm:{" "}
                                          {dayjs(
                                            vaccination.dateOfVaccination
                                          ).format("DD/MM/YYYY")}
                                        </p>
                                      ) : (
                                        <p style={{ color: "#999" }}>
                                          Ngày tiêm: Chưa cập nhật
                                        </p>
                                      )}
                                      <p>Liều số: {vaccination.doseNumber}</p>
                                      {vaccination.manufacturer ? (
                                        <p>
                                          Nhà sản xuất:{" "}
                                          {vaccination.manufacturer}
                                        </p>
                                      ) : (
                                        vaccination.status === "PENDING" && (
                                          <p style={{ color: "#999" }}>
                                            Nhà sản xuất: Chưa cập nhật
                                          </p>
                                        )
                                      )}
                                      {vaccination.placeOfVaccination ? (
                                        <p>
                                          Nơi tiêm:{" "}
                                          {vaccination.placeOfVaccination}
                                        </p>
                                      ) : (
                                        vaccination.status === "PENDING" && (
                                          <p style={{ color: "#999" }}>
                                            Nơi tiêm: Chưa cập nhật
                                          </p>
                                        )
                                      )}
                                      {vaccination.administeredBy ? (
                                        <p>
                                          Người tiêm:{" "}
                                          {vaccination.administeredBy}
                                        </p>
                                      ) : (
                                        vaccination.status === "PENDING" && (
                                          <p style={{ color: "#999" }}>
                                            Người tiêm: Chưa cập nhật
                                          </p>
                                        )
                                      )}
                                      {vaccination.notes && (
                                        <p>Ghi chú: {vaccination.notes}</p>
                                      )}
                                    </div>
                                  }
                                />
                              </List.Item>
                            )}
                            locale={{ emptyText: "Chưa có lịch sử tiêm chủng" }}
                          />
                        </>
                      ),
                    },
                    {
                      key: "vision",
                      label: "Thị lực",
                      children: (
                        <>
                          <div style={{ marginBottom: "16px" }}>
                            <Button
                              type="primary"
                              icon={<EyeOutlined />}
                              onClick={() => setVisionModalVisible(true)}
                            >
                              Thêm thông tin thị lực
                            </Button>
                          </div>
                          <List
                            dataSource={visionData}
                            renderItem={(vision) => (
                              <List.Item
                                key={vision.id || vision.tempId}
                                actions={[
                                  <Button
                                    type="link"
                                    icon={<EyeOutlined />}
                                    onClick={() =>
                                      handleViewDetail(vision, "vision")
                                    }
                                  >
                                    Xem
                                  </Button>,
                                  <Button
                                    type="link"
                                    icon={<EditOutlined />}
                                    onClick={() => handleEditVision(vision)}
                                    disabled={vision.healthCheckResult != null || vision.healthResult != null}
                                    title={vision.healthCheckResult || vision.healthResult ? 
                                      'Không thể chỉnh sửa thông tin thị lực đã có kết quả khám sức khỏe' : 
                                      'Sửa thông tin thị lực'}
                                  >
                                    Sửa
                                  </Button>,
                                  <Button
                                    type="link"
                                    danger
                                    icon={<DeleteOutlined />}
                                    disabled={vision.healthCheckResult != null || vision.healthResult != null}
                                    onClick={() =>
                                      handleRemoveVision(
                                        vision.id || vision.tempId
                                      )
                                    }
                                    title={
                                      vision.healthCheckResult || vision.healthResult 
                                        ? 'Không thể xóa - Đã có kết quả khám sức khỏe' 
                                        : 'Xóa thông tin thị lực'
                                    }
                                  >
                                    Xóa
                                  </Button>,
                                ]}
                              >
                                <List.Item.Meta
                                  title={
                                    <div>
                                      {`Khám thị lực - ${dayjs(
                                        vision.dateOfExamination
                                      ).format("DD/MM/YYYY")}`}
                                      {(vision.healthCheckResult || vision.healthResult) && (
                                        <Tag
                                          color="purple"
                                          style={{ marginLeft: 8 }}
                                        >
                                          Có kết quả khám
                                        </Tag>
                                      )}
                                    </div>
                                  }
                                  description={
                                    <div>
                                      <p>
                                        Mắt trái: {vision.visionLeft}/10{" "}
                                        {vision.visionLeftWithGlass > 0
                                          ? `(Có kính: ${vision.visionLeftWithGlass}/10)`
                                          : vision.visionLeftWithGlass === 0
                                          ? "(Có kính: Không có)"
                                          : ""}
                                      </p>
                                      <p>
                                        Mắt phải: {vision.visionRight}/10{" "}
                                        {vision.visionRightWithGlass > 0
                                          ? `(Có kính: ${vision.visionRightWithGlass}/10)`
                                          : vision.visionRightWithGlass === 0
                                          ? "(Có kính: Không có)"
                                          : ""}
                                      </p>
                                      {vision.visionDescription && (
                                        <p>Mô tả: {vision.visionDescription}</p>
                                      )}
                                    </div>
                                  }
                                />
                              </List.Item>
                            )}
                            locale={{ emptyText: "Chưa có thông tin thị lực" }}
                          />
                        </>
                      ),
                    },
                    {
                      key: "hearing",
                      label: "Thính lực",
                      children: (
                        <>
                          <div style={{ marginBottom: "16px" }}>
                            <Button
                              type="primary"
                              icon={<EyeOutlined />}
                              onClick={() => setHearingModalVisible(true)}
                            >
                              Thêm thông tin thính lực
                            </Button>
                          </div>
                          <List
                            dataSource={hearingData}
                            renderItem={(hearing) => (
                              <List.Item
                                key={hearing.id || hearing.tempId}
                                actions={[
                                  <Button
                                    type="link"
                                    icon={<EyeOutlined />}
                                    onClick={() =>
                                      handleViewDetail(hearing, "hearing")
                                    }
                                  >
                                    Xem
                                  </Button>,
                                  <Button
                                    type="link"
                                    icon={<EditOutlined />}
                                    onClick={() => handleEditHearing(hearing)}
                                    disabled={hearing.healthCheckResult != null || hearing.healthResult != null}
                                    title={hearing.healthCheckResult || hearing.healthResult ? 
                                      'Không thể chỉnh sửa thông tin thính lực đã có kết quả khám sức khỏe' : 
                                      'Sửa thông tin thính lực'}
                                  >
                                    Sửa
                                  </Button>,
                                  <Button
                                    type="link"
                                    danger
                                    icon={<DeleteOutlined />}
                                    disabled={hearing.healthCheckResult != null || hearing.healthResult != null}
                                    onClick={() =>
                                      handleRemoveHearing(
                                        hearing.id || hearing.tempId
                                      )
                                    }
                                    title={
                                      hearing.healthCheckResult || hearing.healthResult 
                                        ? 'Không thể xóa - Đã có kết quả khám sức khỏe' 
                                        : 'Xóa thông tin thính lực'
                                    }
                                  >
                                    Xóa
                                  </Button>,
                                ]}
                              >
                                <List.Item.Meta
                                  title={
                                    <div>
                                      {`Khám thính lực - ${dayjs(
                                        hearing.dateOfExamination
                                      ).format("DD/MM/YYYY")}`}
                                      {(hearing.healthCheckResult || hearing.healthResult) && (
                                        <Tag
                                          color="purple"
                                          style={{ marginLeft: 8 }}
                                        >
                                          Có kết quả khám
                                        </Tag>
                                      )}
                                    </div>
                                  }
                                  description={
                                    <div>
                                      <p>Tai trái: {hearing.leftEar}/10</p>
                                      <p>Tai phải: {hearing.rightEar}/10</p>
                                      {hearing.description && (
                                        <p>Mô tả: {hearing.description}</p>
                                      )}
                                    </div>
                                  }
                                />
                              </List.Item>
                            )}
                            locale={{
                              emptyText: "Chưa có thông tin thính lực",
                            }}
                          />
                        </>
                      ),
                    },
                    {
                      key: "infectious",
                      label: "Bệnh truyền nhiễm",
                      children: (
                        <>
                          <div style={{ marginBottom: "16px" }}>
                            <Button
                              type="primary"
                              icon={<SafetyOutlined />}
                              onClick={() => setInfectiousModalVisible(true)}
                            >
                              Thêm bệnh truyền nhiễm
                            </Button>
                          </div>
                          <List
                            dataSource={infectiousDiseases}
                            renderItem={(disease) => (
                              <List.Item
                                key={disease.id || disease.tempId}
                                actions={[
                                  <Button
                                    type="link"
                                    icon={<EyeOutlined />}
                                    onClick={() =>
                                      handleViewDetail(
                                        disease,
                                        "infectiousDisease"
                                      )
                                    }
                                  >
                                    Xem
                                  </Button>,
                                  <Button
                                    type="link"
                                    icon={<EditOutlined />}
                                    onClick={() =>
                                      handleEditInfectiousDisease(disease)
                                    }
                                  >
                                    Sửa
                                  </Button>,
                                  <Button
                                    type="link"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() =>
                                      handleRemoveInfectiousDisease(
                                        disease.id || disease.tempId
                                      )
                                    }
                                  >
                                    Xóa
                                  </Button>,
                                ]}
                              >
                                <List.Item.Meta
                                  title={disease.diseaseName}
                                  description={
                                    <div>
                                      <p>{disease.description}</p>
                                      <Tag
                                        color={
                                          disease.status === "ACTIVE"
                                            ? "red"
                                            : "green"
                                        }
                                      >
                                        {disease.status === "ACTIVE"
                                          ? "Đang điều trị"
                                          : "Đã khỏi"}
                                      </Tag>
                                      {disease.dateDiagnosed && (
                                        <span
                                          style={{
                                            marginLeft: "8px",
                                            color: "#666",
                                          }}
                                        >
                                          Chẩn đoán:{" "}
                                          {dayjs(disease.dateDiagnosed).format(
                                            "DD/MM/YYYY"
                                          )}
                                        </span>
                                      )}
                                      {disease.placeOfTreatment && (
                                        <p
                                          style={{
                                            margin: "4px 0 0 0",
                                            color: "#666",
                                          }}
                                        >
                                          Nơi điều trị:{" "}
                                          {disease.placeOfTreatment}
                                        </p>
                                      )}
                                    </div>
                                  }
                                />
                              </List.Item>
                            )}
                            locale={{
                              emptyText: "Chưa có thông tin bệnh truyền nhiễm",
                            }}
                          />
                        </>
                      ),
                    },
                  ]}
                />

                <Divider />
                <div style={{ textAlign: "center" }}>
                  <Space>
                    <Button
                      size="large"
                      onClick={() => {
                        if (selectedProfile) {
                          // Cancel editing mode
                          setSelectedProfile(null);
                          form.resetFields();
                          setAllergies([]);
                          setChronicDiseases([]);
                          setInfectiousDiseases([]);
                          setTreatments([]);
                          setVaccinationHistory([]);
                          setVisionData([]);
                          setHearingData([]);
                        } else {
                          // Just reset the form
                          form.resetFields();
                        }
                      }}
                    >
                      {selectedProfile ? "Hủy chỉnh sửa" : "Hủy bỏ"}
                    </Button>
                    <Button
                      type="primary"
                      size="large"
                      htmlType="submit"
                      loading={loading}
                      disabled={!selectedStudent}
                    >
                      {selectedProfile
                        ? "Cập nhật hồ sơ sức khỏe"
                        : "Tạo hồ sơ sức khỏe"}
                    </Button>
                  </Space>
                  {selectedProfile &&
                    (selectedProfile.status === "APPROVED" ||
                      selectedProfile.status === "REJECTED") && (
                      <div
                        style={{
                          marginTop: "8px",
                          color: "#1890ff",
                          fontSize: "14px",
                        }}
                      >
                        Khi cập nhật hồ sơ đã duyệt/từ chối, trạng thái sẽ
                        chuyển về "Đang chờ duyệt"
                      </div>
                    )}
                </div>
              </Form>
            </Card>
          )}{" "}
        {/* Health Profiles Section */}
        {selectedStudent && (
          <Card title="Hồ sơ sức khỏe" style={{ marginBottom: "24px" }}>
            <Alert
              message="Thông tin về quản lý hồ sơ"
              description="Bạn chỉ có thể chỉnh sửa và xóa các hồ sơ có trạng thái 'Đang chờ duyệt'. Hồ sơ đã được duyệt hoặc bị từ chối chỉ có thể xem."
              type="info"
              showIcon
              style={{ marginBottom: "16px" }}
            />
            {healthProfiles.length === 0 ? (
              <div style={{ marginBottom: "16px", textAlign: "right" }}>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setSelectedProfile(null);
                    form.resetFields();
                    setAllergies([]);
                    setChronicDiseases([]);
                    setInfectiousDiseases([]);
                    setTreatments([]);
                    setVaccinationHistory([]);
                    setVisionData([]);
                    setHearingData([]);
                    setActiveTab("basic");
                  }}
                >
                  Thêm hồ sơ sức khỏe
                </Button>
              </div>
            ) : (
              <div style={{ marginBottom: "16px" }}>
                <Alert
                  message="Hồ sơ sức khỏe đã tồn tại"
                  description="Bạn có thể xem, chỉnh sửa hoặc xóa hồ sơ sức khỏe hiện có bên dưới."
                  type="success"
                  showIcon
                  style={{ marginBottom: "16px" }}
                />
              </div>
            )}

            {profilesLoading ? (
              <Spin size="large" />
            ) : (
              <Table
                dataSource={healthProfiles}
                rowKey="id"
                pagination={false}
                bordered
                columns={[
                  {
                    title: "STT",
                    key: "index",
                    width: "10%",
                    render: (_, __, index) => index + 1,
                  },
                  {
                    title: "Ngày tạo",
                    key: "createdAt",
                    width: "30%",
                    render: (_, profile) =>
                      dayjs(profile.createdAt).format("DD/MM/YYYY"),
                  },
                  {
                    title: "Trạng thái",
                    key: "status",
                    width: "30%",
                    render: (_, profile) => (
                      <Tag
                        color={
                          profile.status === "PENDING"
                            ? "orange"
                            : profile.status === "APPROVED"
                            ? "green"
                            : profile.status === "REJECTED"
                            ? "red"
                            : "blue"
                        }
                      >
                        {profile.status === "PENDING"
                          ? "Đang chờ duyệt"
                          : profile.status === "APPROVED"
                          ? "Đã duyệt"
                          : profile.status === "REJECTED"
                          ? "Bị từ chối"
                          : "Không xác định"}
                      </Tag>
                    ),
                  },
                  {
                    title: "Hành động",
                    key: "actions",
                    width: "30%",
                    render: (_, profile) => (
                      <Space size="middle">
                        {" "}
                        <Button
                          type="link"
                          icon={<EditOutlined />}
                          onClick={() => handleProfileSelect(profile)}
                          title={
                            profile.status === "APPROVED"
                              ? "Chỉnh sửa (sẽ chuyển về trạng thái chờ duyệt)"
                              : "Chỉnh sửa hồ sơ"
                          }
                        >
                          {/* {profile.status === 'PENDING' ? 'Chỉnh sửa' : 'Xem'} */}
                        </Button>
                        <Button
                          type="link"
                          icon={<FileTextOutlined />}
                          onClick={() => handleViewProfileDetail(profile)}
                        />
                        {profile.status === "PENDING" && (
                          <Popconfirm
                            title="Xóa hồ sơ sức khỏe"
                            description="Bạn có chắc chắn muốn xóa hồ sơ sức khỏe này?"
                            onConfirm={() => handleProfileDelete(profile.id)}
                            okText="Có"
                            cancelText="Không"
                          >
                            <Button
                              type="link"
                              danger
                              icon={<DeleteOutlined />}
                            ></Button>
                          </Popconfirm>
                        )}
                      </Space>
                    ),
                  },
                ]}
              />
            )}
          </Card>
        )}
      </Card>{" "}
      {/* Allergy Modal */}{" "}
      <AllergyModal
        open={allergyModalVisible}
        onCancel={() => {
          setAllergyModalVisible(false);
          setEditingAllergy(null);
        }}
        onSubmit={handleUpdateAllergy}
        initialData={editingAllergy}
        isEdit={!!editingAllergy}
      />
      {/* Chronic Disease Modal */}{" "}
      <ChronicDiseaseModal
        open={chronicModalVisible}
        onCancel={() => {
          setChronicModalVisible(false);
          setEditingChronicDisease(null);
        }}
        onSubmit={handleUpdateChronicDisease}
        initialData={editingChronicDisease}
        isEdit={!!editingChronicDisease}
      />
      {/* Treatment Modal */}{" "}
      <TreatmentModal
        open={treatmentModalVisible}
        onCancel={() => {
          setTreatmentModalVisible(false);
          setEditingTreatment(null);
        }}
        onSubmit={handleUpdateTreatment}
        initialData={editingTreatment}
        isEdit={!!editingTreatment}
      />{" "}
      {/* Vaccination Modal */}{" "}
      <VaccinationModal
        open={vaccinationModalVisible}
        onCancel={() => {
          setVaccinationModalVisible(false);
          setEditingVaccination(null);
        }}
        onSubmit={handleUpdateVaccination}
        initialData={editingVaccination}
        isEdit={!!editingVaccination}
        vaccinationRules={vaccinationRules}
        selectedVaccinationRule={selectedVaccinationRule}
        showVaccinationRules={showVaccinationRules}
        onFetchVaccinationRules={fetchVaccinationRules}
        onRuleSelection={handleRuleSelection}
        onRuleSelectionForForm={handleRuleSelectionForForm}
      />
      {/* Vision Modal */}
      <VisionModal
        open={visionModalVisible}
        onCancel={() => {
          setVisionModalVisible(false);
          setEditingVision(null);
        }}
        onSubmit={handleUpdateVision}
        initialData={editingVision}
        isEdit={!!editingVision}
      />
      {/* Hearing Modal */}
      <HearingModal
        open={hearingModalVisible}
        onCancel={() => {
          setHearingModalVisible(false);
          setEditingHearing(null);
        }}
        onSubmit={handleUpdateHearing}
        initialData={editingHearing}
        isEdit={!!editingHearing}
      />{" "}
      {/* Infectious Disease Modal */}
      <InfectiousDiseaseModal
        open={infectiousModalVisible}
        onCancel={() => {
          setInfectiousModalVisible(false);
          setEditingInfectiousDisease(null);
        }}
        onSubmit={handleUpdateInfectiousDisease}
        initialData={editingInfectiousDisease}
        isEdit={!!editingInfectiousDisease}
      />
      {/* Health Profile Detail Modal */}
      <HealthProfileDetailModal
        visible={detailModalVisible}
        onClose={() => setDetailModalVisible(false)}
        healthProfile={selectedProfileForDetail}
      />
      {/* View Detail Modal */}
      <Modal
        title={`Chi tiết ${
          viewDetailType === "allergy"
            ? "dị ứng"
            : viewDetailType === "chronicDisease"
            ? "bệnh mãn tính"
            : viewDetailType === "treatment"
            ? "lịch sử điều trị"
            : viewDetailType === "vaccination"
            ? "tiêm chủng"
            : viewDetailType === "vision"
            ? "thị lực"
            : viewDetailType === "hearing"
            ? "thính lực"
            : viewDetailType === "infectiousDisease"
            ? "bệnh truyền nhiễm"
            : "thông tin sức khỏe"
        }`}
        open={viewDetailModalVisible}
        onCancel={() => setViewDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setViewDetailModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={600}
      >
        {viewDetailData && (
          <div>
            {viewDetailType === "allergy" && (
              <div>
                <p>
                  <strong>Loại dị ứng:</strong> {viewDetailData.allergyType}
                </p>
                <p>
                  <strong>Mô tả:</strong> {viewDetailData.description}
                </p>
                <p>
                  <strong>Mức độ:</strong>
                  <Tag
                    color={
                      viewDetailData.status === "MILD"
                        ? "green"
                        : viewDetailData.status === "MODERATE"
                        ? "orange"
                        : viewDetailData.status === "SEVERE"
                        ? "red"
                        : "blue"
                    }
                  >
                    {viewDetailData.status === "MILD"
                      ? "Nhẹ"
                      : viewDetailData.status === "MODERATE"
                      ? "Trung bình"
                      : viewDetailData.status === "SEVERE"
                      ? "Nặng"
                      : "Không xác định"}
                  </Tag>
                </p>
                {viewDetailData.onsetDate && (
                  <p>
                    <strong>Ngày khởi phát:</strong>{" "}
                    {dayjs(viewDetailData.onsetDate).format("DD/MM/YYYY")}
                  </p>
                )}
              </div>
            )}

            {viewDetailType === "chronicDisease" && (
              <div>
                <p>
                  <strong>Tên bệnh:</strong> {viewDetailData.diseaseName}
                </p>
                <p>
                  <strong>Mô tả:</strong> {viewDetailData.description}
                </p>
                <p>
                  <strong>Trạng thái:</strong>
                  <Tag
                    color={
                      viewDetailData.status === "RECOVERED"
                        ? "green"
                        : viewDetailData.status === "UNDER_TREATMENT"
                        ? "orange"
                        : viewDetailData.status === "STABLE"
                        ? "blue"
                        : viewDetailData.status === "WORSENED"
                        ? "red"
                        : "default"
                    }
                  >
                    {viewDetailData.status === "UNDER_TREATMENT"
                      ? "Đang điều trị"
                      : viewDetailData.status === "RECOVERED"
                      ? "Đã khỏi"
                      : viewDetailData.status === "STABLE"
                      ? "Ổn định"
                      : viewDetailData.status === "WORSENED"
                      ? "Đang xấu đi"
                      : "Không xác định"}
                  </Tag>
                </p>
                {viewDetailData.dateDiagnosed && (
                  <p>
                    <strong>Ngày chẩn đoán:</strong>{" "}
                    {dayjs(viewDetailData.dateDiagnosed).format("DD/MM/YYYY")}
                  </p>
                )}
                {viewDetailData.placeOfTreatment && (
                  <p>
                    <strong>Nơi điều trị:</strong>{" "}
                    {viewDetailData.placeOfTreatment}
                  </p>
                )}
              </div>
            )}

            {viewDetailType === "treatment" && (
              <div>
                <p>
                  <strong>Loại điều trị:</strong> {viewDetailData.treatmentType}
                </p>
                <p>
                  <strong>Mô tả:</strong> {viewDetailData.description}
                </p>
                <p>
                  <strong>Bác sĩ điều trị:</strong> {viewDetailData.doctorName}
                </p>
                {viewDetailData.dateOfAdmission && (
                  <p>
                    <strong>Ngày nhập viện:</strong>{" "}
                    {dayjs(viewDetailData.dateOfAdmission).format("DD/MM/YYYY")}
                  </p>
                )}
                {viewDetailData.dateOfDischarge && (
                  <p>
                    <strong>Ngày xuất viện:</strong>{" "}
                    {dayjs(viewDetailData.dateOfDischarge).format("DD/MM/YYYY")}
                  </p>
                )}
                {viewDetailData.placeOfTreatment && (
                  <p>
                    <strong>Nơi điều trị:</strong>{" "}
                    {viewDetailData.placeOfTreatment}
                  </p>
                )}
              </div>
            )}

            {viewDetailType === "vaccination" && (
              <div>
                <p>
                  <strong>Tên vaccine:</strong> {viewDetailData.vaccineName}
                </p>
                <p>
                  <strong>Liều số:</strong> {viewDetailData.doseNumber}
                </p>
                <p>
                  <strong>Trạng thái:</strong>
                  <Tag
                    color={
                      viewDetailData.status === "PENDING" ? "orange" : "green"
                    }
                  >
                    {viewDetailData.status === "PENDING"
                      ? "Chưa hoàn thành"
                      : "Đã hoàn thành"}
                  </Tag>
                </p>
                {viewDetailData.dateOfVaccination && (
                  <p>
                    <strong>Ngày tiêm:</strong>{" "}
                    {dayjs(viewDetailData.dateOfVaccination).format(
                      "DD/MM/YYYY"
                    )}
                  </p>
                )}
                {viewDetailData.manufacturer && (
                  <p>
                    <strong>Nhà sản xuất:</strong> {viewDetailData.manufacturer}
                  </p>
                )}
                {viewDetailData.placeOfVaccination && (
                  <p>
                    <strong>Nơi tiêm:</strong>{" "}
                    {viewDetailData.placeOfVaccination}
                  </p>
                )}
                {viewDetailData.administeredBy && (
                  <p>
                    <strong>Người tiêm:</strong> {viewDetailData.administeredBy}
                  </p>
                )}
                {viewDetailData.notes && (
                  <p>
                    <strong>Ghi chú:</strong> {viewDetailData.notes}
                  </p>
                )}
              </div>
            )}

            {viewDetailType === "vision" && (
              <div>
                <p>
                  <strong>Ngày khám:</strong>{" "}
                  {dayjs(viewDetailData.dateOfExamination).format("DD/MM/YYYY")}
                </p>
                <p>
                  <strong>Thị lực mắt trái:</strong> {viewDetailData.visionLeft}
                  /10
                </p>
                <p>
                  <strong>Thị lực mắt phải:</strong>{" "}
                  {viewDetailData.visionRight}/10
                </p>
                {viewDetailData.visionLeftWithGlass !== undefined && viewDetailData.visionLeftWithGlass !== null && (
                  <p>
                    <strong>Thị lực mắt trái (có kính):</strong>{" "}
                    {viewDetailData.visionLeftWithGlass > 0 
                      ? `${viewDetailData.visionLeftWithGlass}/10`
                      : "Không có"}
                  </p>
                )}
                {viewDetailData.visionRightWithGlass !== undefined && viewDetailData.visionRightWithGlass !== null && (
                  <p>
                    <strong>Thị lực mắt phải (có kính):</strong>{" "}
                    {viewDetailData.visionRightWithGlass > 0 
                      ? `${viewDetailData.visionRightWithGlass}/10`
                      : "Không có"}
                  </p>
                )}
                {viewDetailData.visionDescription && (
                  <p>
                    <strong>Mô tả:</strong> {viewDetailData.visionDescription}
                  </p>
                )}
              </div>
            )}

            {viewDetailType === "hearing" && (
              <div>
                <p>
                  <strong>Ngày khám:</strong>{" "}
                  {dayjs(viewDetailData.dateOfExamination).format("DD/MM/YYYY")}
                </p>
                <p>
                  <strong>Thính lực tai trái:</strong> {viewDetailData.leftEar}%
                </p>
                <p>
                  <strong>Thính lực tai phải:</strong> {viewDetailData.rightEar}
                  %
                </p>
                {viewDetailData.description && (
                  <p>
                    <strong>Mô tả:</strong> {viewDetailData.description}
                  </p>
                )}
              </div>
            )}

            {viewDetailType === "infectiousDisease" && (
              <div>
                <p>
                  <strong>Tên bệnh:</strong> {viewDetailData.diseaseName}
                </p>
                <p>
                  <strong>Mô tả:</strong> {viewDetailData.description}
                </p>
                <p>
                  <strong>Trạng thái:</strong>
                  <Tag
                    color={viewDetailData.status === "ACTIVE" ? "red" : "green"}
                  >
                    {viewDetailData.status === "ACTIVE"
                      ? "Đang điều trị"
                      : "Đã khỏi"}
                  </Tag>
                </p>
                {viewDetailData.dateDiagnosed && (
                  <p>
                    <strong>Ngày chẩn đoán:</strong>{" "}
                    {dayjs(viewDetailData.dateDiagnosed).format("DD/MM/YYYY")}
                  </p>
                )}
                {viewDetailData.placeOfTreatment && (
                  <p>
                    <strong>Nơi điều trị:</strong>{" "}
                    {viewDetailData.placeOfTreatment}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

// Allergy Modal Component
const AllergyModal = ({
  open,
  onCancel,
  onSubmit,
  initialData = null,
  isEdit = false,
}) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  // Pre-fill form when in edit mode
  React.useEffect(() => {
    if (open && isEdit && initialData) {
      form.setFieldsValue({
        allergyType: initialData.allergyType,
        description: initialData.description,
        status: initialData.status,
        onsetDate:
          initialData.onsetDate &&
          initialData.onsetDate !== "null" &&
          initialData.onsetDate !== ""
            ? dayjs(initialData.onsetDate)
            : null,
      });
    } else if (open && !isEdit) {
      form.resetFields();
    }
  }, [open, isEdit, initialData, form]);

  const handleSubmit = async () => {
    if (submitting) return; // Prevent double submission

    try {
      setSubmitting(true);
      const values = await form.validateFields();

      // Format the onsetDate properly before submitting
      const formattedValues = {
        ...values,
        onsetDate: values.onsetDate
          ? values.onsetDate.format("YYYY-MM-DD")
          : null,
      };

      onSubmit(formattedValues);
      onCancel(); // Close modal first
      form.resetFields(); // Then reset fields after modal is closed
    } catch (error) {
      console.error("Validation error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Don't reset form fields to preserve user input
    onCancel();
  };

  return (
    <Modal
      title={isEdit ? "Chỉnh sửa thông tin dị ứng" : "Thêm thông tin dị ứng"}
      open={open}
      onCancel={handleCancel}
      onOk={handleSubmit}
      confirmLoading={submitting}
      width={600}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="allergyType"
          label="Loại dị ứng"
          rules={[{ required: true, message: "Vui lòng nhập loại dị ứng" }]}
        >
          <Input placeholder="Ví dụ: Phấn hoa, Thức ăn, Thuốc..." />
        </Form.Item>

        <Form.Item
          name="description"
          label="Mô tả chi tiết"
          rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
        >
          <TextArea
            rows={3}
            placeholder="Mô tả triệu chứng và mức độ nghiêm trọng..."
          />
        </Form.Item>
        <Form.Item
          name="status"
          label="Mức độ dị ứng"
          rules={[{ required: true, message: "Vui lòng chọn mức độ dị ứng" }]}
        >
          <Select placeholder="Chọn mức độ dị ứng">
            <Option value="MILD">Nhẹ</Option>
            <Option value="MODERATE">Trung bình</Option>
            <Option value="SEVERE">Nặng</Option>
          </Select>
        </Form.Item>
        <Form.Item name="onsetDate" label="Ngày bắt đầu">
          {" "}
          <DatePicker
            style={{ width: "100%" }}
            placeholder="Chọn ngày bắt đầu"
            format="DD/MM/YYYY"
            disabledDate={disabledDateAfterToday}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

// Chronic Disease Modal Component
const ChronicDiseaseModal = ({
  open,
  onCancel,
  onSubmit,
  initialData,
  isEdit,
}) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  // Pre-fill form when editing
  React.useEffect(() => {
    if (isEdit && initialData && open) {
      const formData = {
        ...initialData,
        dateDiagnosed:
          initialData.dateDiagnosed &&
          initialData.dateDiagnosed !== "null" &&
          initialData.dateDiagnosed !== ""
            ? dayjs(initialData.dateDiagnosed)
            : null,
        dateResolved:
          initialData.dateResolved &&
          initialData.dateResolved !== "null" &&
          initialData.dateResolved !== ""
            ? dayjs(initialData.dateResolved)
            : null,
        dateOfAdmission:
          initialData.dateOfAdmission &&
          initialData.dateOfAdmission !== "null" &&
          initialData.dateOfAdmission !== ""
            ? dayjs(initialData.dateOfAdmission)
            : null,
        dateOfDischarge:
          initialData.dateOfDischarge &&
          initialData.dateOfDischarge !== "null" &&
          initialData.dateOfDischarge !== ""
            ? dayjs(initialData.dateOfDischarge)
            : null,
      };
      form.setFieldsValue(formData);
    } else if (!isEdit) {
      form.resetFields();
    }
  }, [isEdit, initialData, open, form]);

  const handleSubmit = async () => {
    if (submitting) return; // Prevent double submission

    try {
      setSubmitting(true);
      const values = await form.validateFields();
      // Format date fields properly before submitting
      const formattedValues = {
        ...values,
        dateDiagnosed: values.dateDiagnosed
          ? values.dateDiagnosed.format("YYYY-MM-DD")
          : null,
        dateResolved: values.dateResolved
          ? values.dateResolved.format("YYYY-MM-DD")
          : null,
        dateOfAdmission: values.dateOfAdmission
          ? values.dateOfAdmission.format("YYYY-MM-DD")
          : null,
        dateOfDischarge: values.dateOfDischarge
          ? values.dateOfDischarge.format("YYYY-MM-DD")
          : null,
      };

      onSubmit(formattedValues);
      // Only reset fields after successful submission and modal closure
      onCancel(); // Close modal first
      form.resetFields(); // Then reset fields after modal is closed
    } catch (error) {
      console.error("Validation error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Don't reset form fields to preserve user input
    onCancel();
  };
  return (
    <Modal
      title={isEdit ? "Sửa bệnh mãn tính" : "Thêm bệnh mãn tính"}
      open={open}
      onCancel={handleCancel}
      onOk={handleSubmit}
      confirmLoading={submitting}
      width={600}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="diseaseName"
          label="Tên bệnh"
          rules={[{ required: true, message: "Vui lòng nhập tên bệnh" }]}
        >
          <Input placeholder="Ví dụ: Hen suyễn, Tiểu đường, Tim mạch..." />
        </Form.Item>

        <Form.Item
          name="description"
          label="Mô tả tình trạng"
          rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
        >
          <TextArea
            rows={3}
            placeholder="Mô tả tình trạng bệnh, mức độ nghiêm trọng..."
          />
        </Form.Item>

        <Form.Item name="placeOfTreatment" label="Nơi điều trị">
          <Input placeholder="Tên bệnh viện, phòng khám..." />
        </Form.Item>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="dateDiagnosed" label="Ngày chẩn đoán">
              {" "}
              <DatePicker
                style={{ width: "100%" }}
                placeholder="Chọn ngày chẩn đoán"
                format="DD/MM/YYYY"
                disabledDate={disabledDateAfterToday}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="dateResolved" label="Ngày khỏi bệnh">
              <DatePicker
                style={{ width: "100%" }}
                placeholder="Chọn ngày khỏi bệnh"
                format="DD/MM/YYYY"
                disabledDate={disabledDateAfterToday}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="dateOfAdmission" label="Ngày nhập viện">
              {" "}
              <DatePicker
                style={{ width: "100%" }}
                placeholder="Ngày nhập viện"
                format="DD/MM/YYYY"
                disabledDate={disabledDateAfterToday}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="dateOfDischarge" label="Ngày xuất viện">
              <DatePicker
                style={{ width: "100%" }}
                placeholder="Ngày xuất viện"
                format="DD/MM/YYYY"
                disabledDate={disabledDateAfterToday}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="status"
          label="Tình trạng điều trị"
          rules={[{ required: true, message: "Vui lòng chọn tình trạng" }]}
        >
          <Select placeholder="Chọn tình trạng">
            <Option value="UNDER_TREATMENT">Đang điều trị</Option>
            <Option value="RECOVERED">Đã khỏi</Option>
            <Option value="STABLE">Ổn định</Option>
            <Option value="WORSENED">Đang xấu đi</Option>
            <Option value="RELAPSED">Tái phát</Option>
            <Option value="NEWLY_DIAGNOSED">Mới chẩn đoán</Option>
            <Option value="UNDER_OBSERVATION">Đang theo dõi</Option>
            <Option value="UNKNOWN">Không rõ</Option>
            <Option value="ISOLATED">Cách ly</Option>
            <Option value="UNTREATED">Chưa điều trị</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

// Treatment Modal Component
const TreatmentModal = ({ open, onCancel, onSubmit, initialData, isEdit }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  // Pre-fill form when editing
  React.useEffect(() => {
    if (isEdit && initialData && open) {
      const formData = {
        ...initialData,
        startDate:
          initialData.dateOfAdmission &&
          initialData.dateOfAdmission !== "null" &&
          initialData.dateOfAdmission !== ""
            ? dayjs(initialData.dateOfAdmission)
            : null,
        endDate:
          initialData.dateOfDischarge &&
          initialData.dateOfDischarge !== "null" &&
          initialData.dateOfDischarge !== ""
            ? dayjs(initialData.dateOfDischarge)
            : null,
      };
      form.setFieldsValue(formData);
    } else if (!isEdit) {
      form.resetFields();
    }
  }, [isEdit, initialData, open, form]);
  const handleSubmit = async () => {
    if (submitting) return; // Prevent double submission

    try {
      setSubmitting(true);
      const values = await form.validateFields();

      // Format date fields and map to backend expected field names
      const formattedValues = {
        ...values,
        dateOfAdmission: values.startDate
          ? values.startDate.format("YYYY-MM-DD")
          : null,
        dateOfDischarge: values.endDate
          ? values.endDate.format("YYYY-MM-DD")
          : null,
      };

      // Remove the frontend field names that don't match backend
      delete formattedValues.startDate;
      delete formattedValues.endDate;

      onSubmit(formattedValues);
      // Only reset fields after successful submission and modal closure
      onCancel(); // Close modal after successful submission
      form.resetFields(); // Reset fields after modal is closed
    } catch (error) {
      console.error("Validation error:", error);
    } finally {
      setSubmitting(false);
    }
  };
  const handleCancel = () => {
    // Don't reset form fields to preserve user input
    onCancel();
  };
  return (
    <Modal
      title={isEdit ? "Sửa lịch sử điều trị" : "Thêm lịch sử điều trị"}
      open={open}
      onCancel={handleCancel}
      onOk={handleSubmit}
      confirmLoading={submitting}
      width={600}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="treatmentType"
          label="Loại điều trị"
          rules={[{ required: true, message: "Vui lòng nhập loại điều trị" }]}
        >
          <Input placeholder="Ví dụ: Khám bệnh, Phẫu thuật, Điều trị nội khoa..." />
        </Form.Item>

        <Form.Item
          name="description"
          label="Mô tả chi tiết"
          rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
        >
          <TextArea
            rows={3}
            placeholder="Mô tả quá trình điều trị, kết quả..."
          />
        </Form.Item>
        <Form.Item name="doctorName" label="Bác sĩ điều trị">
          <Input placeholder="Tên bác sĩ điều trị" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="startDate"
              label="Ngày bắt đầu"
              rules={[
                { required: true, message: "Vui lòng chọn ngày bắt đầu" },
              ]}
            >
              {" "}
              <DatePicker
                style={{ width: "100%" }}
                placeholder="Ngày bắt đầu điều trị"
                format="DD/MM/YYYY"
                disabledDate={disabledDateAfterToday}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="endDate" label="Ngày kết thúc">
              {" "}
              <DatePicker
                style={{ width: "100%" }}
                placeholder="Ngày kết thúc điều trị"
                format="DD/MM/YYYY"
                disabledDate={disabledDateAfterToday}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="placeOfTreatment"
          label="Nơi điều trị"
          rules={[
            {
              required: true,
              message: "Vui lòng nhập tên bệnh viện hoặc cơ sở y tế",
            },
          ]}
        >
          <Input placeholder="Tên bệnh viện hoặc cơ sở y tế" />
        </Form.Item>

        <Form.Item
          name="status"
          label="Tình trạng điều trị"
          rules={[
            { required: true, message: "Vui lòng chọn tình trạng điều trị" },
          ]}
        >
          <Select placeholder="Chọn tình trạng">
            <Option value="UNDER_TREATMENT">Đang điều trị</Option>
            <Option value="RECOVERED">Đã khỏi</Option>
            <Option value="STABLE">Ổn định</Option>
            <Option value="WORSENED">Đang xấu đi</Option>
            <Option value="RELAPSED">Tái phát</Option>
            <Option value="NEWLY_DIAGNOSED">Mới chẩn đoán</Option>
            <Option value="UNDER_OBSERVATION">Đang theo dõi</Option>
            <Option value="UNKNOWN">Không rõ</Option>
            <Option value="UNTREATED">Chưa điều trị</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

// Vaccination Modal Component
const VaccinationModal = ({
  open,
  onCancel,
  onSubmit,
  vaccinationRules,
  selectedVaccinationRule,
  showVaccinationRules,
  onFetchVaccinationRules,
  onRuleSelection,
  onRuleSelectionForForm,
  initialData,
  isEdit,
}) => {
  const [form] = Form.useForm();
  // Pre-fill form when editing
  React.useEffect(() => {
    if (isEdit && initialData && open) {
      const formData = {
        ...initialData,
        dateOfVaccination:
          initialData.dateOfVaccination &&
          initialData.dateOfVaccination !== "null" &&
          initialData.dateOfVaccination !== ""
            ? dayjs(initialData.dateOfVaccination)
            : null,
      };
      form.setFieldsValue(formData);
    } else if (!isEdit) {
      form.resetFields();
    }
  }, [isEdit, initialData, open, form]);
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Debug logging to check the date values
      console.log("Original form values:", values);
      console.log("Original dateOfVaccination:", values.dateOfVaccination);

      // Format date field to YYYY-MM-DD format before submission
      const formattedValues = {
        ...values,
        dateOfVaccination: values.dateOfVaccination
          ? values.dateOfVaccination.format("YYYY-MM-DD")
          : null,
      };

      // Debug logging to check the formatted values
      console.log("Formatted values being submitted:", formattedValues);
      console.log(
        "Formatted dateOfVaccination:",
        formattedValues.dateOfVaccination
      );

      onSubmit(formattedValues);
      form.resetFields();
    } catch (error) {
      console.error("Validation error:", error);
    }
  };
  return (
    <Modal
      title={isEdit ? "Sửa lịch sử tiêm chủng" : "Thêm lịch sử tiêm chủng"}
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      width={800}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Hủy
        </Button>,
        <Button key="rules" type="default" onClick={onFetchVaccinationRules}>
          Chọn từ quy tắc tiêm chủng
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          {isEdit ? "Cập nhật" : "Thêm"}
        </Button>,
      ]}
    >
      {" "}
      {showVaccinationRules && (
        <div
          style={{
            marginBottom: 16,
            padding: 16,
            border: "1px solid #d9d9d9",
            borderRadius: 6,
          }}
        >
          <h4>Chọn quy tắc tiêm chủng (chỉ được chọn 1 quy tắc):</h4>
          <Radio.Group
            value={selectedVaccinationRule?.id || null}
            onChange={(e) => onRuleSelection(e.target.value)}
            style={{ width: "100%" }}
          >
            <div style={{ maxHeight: 200, overflowY: "auto" }}>
              {vaccinationRules.map((rule) => (
                <div
                  key={rule.id}
                  style={{
                    marginBottom: 12,
                    padding: 8,
                    border: "1px solid #f0f0f0",
                    borderRadius: 4,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <Radio value={rule.id}>
                        <strong>{rule.name}</strong> - Liều{" "}
                        {rule.doesNumber || 1}
                        {rule.isMandatory && (
                          <span style={{ color: "red" }}> (Bắt buộc)</span>
                        )}
                      </Radio>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#666",
                          marginLeft: 24,
                        }}
                      >
                        {rule.description}
                        {rule.minAge !== undefined &&
                          rule.maxAge !== undefined && (
                            <span>
                              {" "}
                              | Độ tuổi: {rule.minAge}-{rule.maxAge} tháng
                            </span>
                          )}
                      </div>
                    </div>
                    <Button
                      type="primary"
                      size="small"
                      onClick={() => onRuleSelectionForForm(rule, form)}
                      style={{ marginLeft: 8 }}
                    >
                      Thêm vào form
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Radio.Group>
        </div>
      )}
      <Form form={form} layout="vertical">
        <Form.Item
          name="vaccineName"
          label="Tên vaccine"
          rules={[{ required: true, message: "Vui lòng nhập tên vaccine" }]}
        >
          <Input placeholder="Ví dụ: BCG, DPT, MMR, Viêm gan B..." />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="doseNumber"
              label="Liều số"
              rules={[{ required: true, message: "Vui lòng nhập liều số" }]}
            >
              <InputNumber
                style={{ width: "100%" }}
                placeholder="Liều thứ mấy"
                min={1}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="dateOfVaccination"
              label="Ngày tiêm"
              rules={[{ required: true, message: "Vui lòng chọn ngày tiêm" }]}
            >
              <DatePicker
                style={{ width: "100%" }}
                placeholder="Chọn ngày tiêm"
                format="DD/MM/YYYY"
                disabledDate={disabledDateAfterToday}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="manufacturer" label="Nhà sản xuất">
          <Input placeholder="Tên nhà sản xuất vaccine" />
        </Form.Item>

        <Form.Item
          name="placeOfVaccination"
          label="Nơi tiêm"
          rules={[{ required: true, message: "Vui lòng nhập nơi tiêm" }]}
        >
          <Input placeholder="Tên bệnh viện, phòng khám, trạm y tế..." />
        </Form.Item>

        <Form.Item name="administeredBy" label="Người tiêm">
          <Input placeholder="Tên bác sĩ thực hiện tiêm" />
        </Form.Item>

        <Form.Item name="notes" label="Ghi chú">
          <TextArea
            rows={2}
            placeholder="Ghi chú thêm về phản ứng, tác dụng phụ..."
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

// Vision Modal Component
const VisionModal = ({
  open,
  onCancel,
  onSubmit,
  initialData,
  isEdit = false,
}) => {
  const [form] = Form.useForm();

  // Pre-fill form when editing
  React.useEffect(() => {
    if (isEdit && initialData && open) {
      const formData = {
        ...initialData,
        dateOfExamination:
          initialData.dateOfExamination &&
          initialData.dateOfExamination !== "null" &&
          initialData.dateOfExamination !== ""
            ? dayjs(initialData.dateOfExamination)
            : null,
      };
      form.setFieldsValue(formData);
    } else if (!isEdit) {
      form.resetFields();
    }
  }, [isEdit, initialData, open, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
      form.resetFields();
    } catch (error) {
      console.error("Validation error:", error);
    }
  };

  return (
    <Modal
      title={isEdit ? "Chỉnh sửa thông tin thị lực" : "Thêm thông tin thị lực"}
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      width={600}
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="visionLeft"
              label="Thị lực mắt trái (không kính)"
              rules={[
                { required: true, message: "Vui lòng nhập thị lực mắt trái" },
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                placeholder="Ví dụ: 8"
                min={0}
                max={10}
                step={1}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="visionRight"
              label="Thị lực mắt phải (không kính)"
              rules={[
                { required: true, message: "Vui lòng nhập thị lực mắt phải" },
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                placeholder="Ví dụ: 8"
                min={0}
                max={10}
                step={1}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="visionLeftWithGlass"
              label="Thị lực mắt trái (có kính)"
            >
              <InputNumber
                style={{ width: "100%" }}
                placeholder="Ví dụ: 10"
                min={0}
                max={10}
                step={1}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="visionRightWithGlass"
              label="Thị lực mắt phải (có kính)"
            >
              <InputNumber
                style={{ width: "100%" }}
                placeholder="Ví dụ: 10"
                min={0}
                max={10}
                step={1}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="dateOfExamination" label="Ngày khám">
          {" "}
          <DatePicker
            style={{ width: "100%" }}
            placeholder="Chọn ngày khám thị lực"
            format="DD/MM/YYYY"
            disabledDate={disabledDateAfterToday}
          />
        </Form.Item>

        <Form.Item name="visionDescription" label="Mô tả thêm">
          <TextArea
            rows={3}
            placeholder="Ghi chú về tình trạng mắt, cần đeo kính, bệnh về mắt..."
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

// Hearing Modal Component
const HearingModal = ({
  open,
  onCancel,
  onSubmit,
  initialData,
  isEdit = false,
}) => {
  const [form] = Form.useForm();

  // Pre-fill form when editing
  React.useEffect(() => {
    if (isEdit && initialData && open) {
      const formData = {
        ...initialData,
        dateOfExamination:
          initialData.dateOfExamination &&
          initialData.dateOfExamination !== "null" &&
          initialData.dateOfExamination !== ""
            ? dayjs(initialData.dateOfExamination)
            : null,
      };
      form.setFieldsValue(formData);
    } else if (!isEdit) {
      form.resetFields();
    }
  }, [isEdit, initialData, open, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
      form.resetFields();
    } catch (error) {
      console.error("Validation error:", error);
    }
  };

  return (
    <Modal
      title={
        isEdit ? "Chỉnh sửa thông tin thính lực" : "Thêm thông tin thính lực"
      }
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      width={500}
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="leftEar"
              label="Thính lực tai trái (/10)"
              rules={[
                { required: true, message: "Vui lòng nhập thính lực tai trái" },
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                placeholder="Ví dụ: 8"
                min={0}
                max={10}
                step={1}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="rightEar"
              label="Thính lực tai phải (/10)"
              rules={[
                { required: true, message: "Vui lòng nhập thính lực tai phải" },
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                placeholder="Ví dụ: 8"
                min={0}
                max={10}
                step={1}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="dateOfExamination" label="Ngày khám">
          {" "}
          <DatePicker
            style={{ width: "100%" }}
            placeholder="Chọn ngày khám thính lực"
            format="DD/MM/YYYY"
            disabledDate={disabledDateAfterToday}
          />
        </Form.Item>

        <Form.Item name="description" label="Mô tả thêm">
          <TextArea
            rows={3}
            placeholder="Ghi chú về tình trạng tai, nghe kém, viêm tai..."
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

// Infectious Disease Modal Component
const InfectiousDiseaseModal = ({
  open,
  onCancel,
  onSubmit,
  initialData,
  isEdit,
}) => {
  const [form] = Form.useForm();

  // Pre-fill form when editing
  React.useEffect(() => {
    if (isEdit && initialData && open) {
      const formData = {
        ...initialData,
        dateDiagnosed:
          initialData.dateDiagnosed &&
          initialData.dateDiagnosed !== "null" &&
          initialData.dateDiagnosed !== ""
            ? dayjs(initialData.dateDiagnosed)
            : null,
        dateResolved:
          initialData.dateResolved &&
          initialData.dateResolved !== "null" &&
          initialData.dateResolved !== ""
            ? dayjs(initialData.dateResolved)
            : null,
        dateOfAdmission:
          initialData.dateOfAdmission &&
          initialData.dateOfAdmission !== "null" &&
          initialData.dateOfAdmission !== ""
            ? dayjs(initialData.dateOfAdmission)
            : null,
        dateOfDischarge:
          initialData.dateOfDischarge &&
          initialData.dateOfDischarge !== "null" &&
          initialData.dateOfDischarge !== ""
            ? dayjs(initialData.dateOfDischarge)
            : null,
      };
      form.setFieldsValue(formData);
    } else if (!isEdit) {
      form.resetFields();
    }
  }, [isEdit, initialData, open, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Format dates properly before submitting
      const formattedValues = {
        ...values,
        dateDiagnosed: values.dateDiagnosed 
          ? values.dateDiagnosed.format("YYYY-MM-DD") 
          : null,
        dateResolved: values.dateResolved 
          ? values.dateResolved.format("YYYY-MM-DD") 
          : null,
        dateOfAdmission: values.dateOfAdmission 
          ? values.dateOfAdmission.format("YYYY-MM-DD") 
          : null,
        dateOfDischarge: values.dateOfDischarge 
          ? values.dateOfDischarge.format("YYYY-MM-DD") 
          : null,
      };
      
      onSubmit(formattedValues);
      form.resetFields();
    } catch (error) {
      console.error("Validation error:", error);
    }
  };
  return (
    <Modal
      title={isEdit ? "Sửa bệnh truyền nhiễm" : "Thêm bệnh truyền nhiễm"}
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      width={700}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="diseaseName"
          label="Tên bệnh"
          rules={[{ required: true, message: "Vui lòng nhập tên bệnh" }]}
        >
          <Input placeholder="Ví dụ: Sốt xuất huyết, Tay chân miệng, Thủy đậu..." />
        </Form.Item>
        <Form.Item
          name="description"
          label="Mô tả tình trạng"
          rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
        >
          <TextArea
            rows={3}
            placeholder="Mô tả triệu chứng, mức độ nghiêm trọng..."
          />
        </Form.Item>{" "}
        <Row gutter={16}>
          <Col span={12}>
            {" "}
            <Form.Item
              name="dateDiagnosed"
              label="Ngày chẩn đoán"
              rules={[
                { required: true, message: "Vui lòng chọn ngày chẩn đoán" },
              ]}
            >
              <DatePicker
                style={{ width: "100%" }}
                placeholder="Chọn ngày chẩn đoán"
                format="DD/MM/YYYY"
                disabledDate={disabledDateAfterToday}
              />
            </Form.Item>
          </Col>{" "}
          <Col span={12}>
            <Form.Item name="dateResolved" label="Ngày khỏi bệnh">
              <DatePicker
                style={{ width: "100%" }}
                placeholder="Chọn ngày khỏi bệnh"
                format="DD/MM/YYYY"
                disabledDate={disabledDateAfterToday}
              />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item
          name="placeOfTreatment"
          label="Nơi điều trị"
        >
          <Input placeholder="Tên bệnh viện, phòng khám..." />
        </Form.Item>
        <Row gutter={16}>
          <Col span={12}>
            {" "}
            <Form.Item name="dateOfAdmission" label="Ngày nhập viện">
              <DatePicker
                style={{ width: "100%" }}
                placeholder="Ngày nhập viện"
                format="DD/MM/YYYY"
                disabledDate={disabledDateAfterToday}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            {" "}
            <Form.Item name="dateOfDischarge" label="Ngày xuất viện">
              <DatePicker
                style={{ width: "100%" }}
                placeholder="Ngày xuất viện"
                format="DD/MM/YYYY"
                disabledDate={disabledDateAfterToday}
              />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item
          name="status"
          label="Tình trạng hiện tại"
          rules={[{ required: true, message: "Vui lòng chọn tình trạng" }]}
        >
          <Select placeholder="Chọn tình trạng">
            <Option value="UNDER_TREATMENT">Đang điều trị</Option>
            <Option value="RECOVERED">Đã khỏi</Option>
            <Option value="STABLE">Ổn định</Option>
            <Option value="WORSENED">Đang xấu đi</Option>
            <Option value="RELAPSED">Tái phát</Option>
            <Option value="NEWLY_DIAGNOSED">Mới chẩn đoán</Option>
            <Option value="UNDER_OBSERVATION">Đang theo dõi</Option>
            <Option value="UNKNOWN">Không rõ</Option>
            <Option value="ISOLATED">Cách ly</Option>
            <Option value="UNTREATED">Chưa điều trị</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default HealthProfileDeclaration;

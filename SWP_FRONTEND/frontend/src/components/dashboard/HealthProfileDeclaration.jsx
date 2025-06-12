import React, { useState, useEffect } from 'react';
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
  Alert,  Table,
  Popconfirm,
  Checkbox,
  Radio
} from 'antd';
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
  HistoryOutlined
} from '@ant-design/icons';
import { parentApi } from '../../api/parentApi';
import { useAuth } from '../../contexts/AuthContext';
import dayjs from 'dayjs';
import '../../styles/HealthProfileDeclaration.css';
import HealthProfileDetailModal from './HealthProfileDetailModal';

const { TextArea } = Input;
const { Option } = Select;

// Helper function to validate dates in DatePicker disabledDate callback
const disabledDateAfterToday = (current) => {
  if (!current) return false;
  return dayjs(current).isAfter(dayjs(), 'day');
};

const HealthProfileDeclaration = () => {
  // Lấy token xác thực từ context để gọi API
  const { getToken } = useAuth();
  
  // Khởi tạo form của Ant Design để quản lý dữ liệu form
  const [form] = Form.useForm();
  
  // State quản lý trạng thái loading khi gửi dữ liệu
  const [loading, setLoading] = useState(false);
  
  // State lưu trữ danh sách học sinh của phụ huynh
  const [students, setStudents] = useState([]);
  
  // State lưu học sinh được chọn để tạo/chỉnh sửa hồ sơ sức khỏe
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  // State quản lý tab đang active trong form (basic, allergies, chronic, etc.)
  const [activeTab, setActiveTab] = useState('basic');
  
  // States quản lý hồ sơ sức khỏe
  // Danh sách tất cả hồ sơ sức khỏe của học sinh được chọn
  const [healthProfiles, setHealthProfiles] = useState([]);
  
  // Hồ sơ được chọn để chỉnh sửa (null nếu đang tạo mới)
  const [selectedProfile, setSelectedProfile] = useState(null);
  
  // Trạng thái loading khi tải danh sách hồ sơ
  const [profilesLoading, setProfilesLoading] = useState(false);
  
  // Trạng thái theo dõi việc tạo hồ sơ mới (để kiểm soát hiển thị form)
  const [isCreatingNewProfile, setIsCreatingNewProfile] = useState(false);  
  // States quản lý modal chi tiết hồ sơ sức khỏe
  // Trạng thái hiển thị modal xem chi tiết hồ sơ
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  
  // Hồ sơ được chọn để xem chi tiết trong modal
  const [selectedProfileForDetail, setSelectedProfileForDetail] = useState(null);
  
  // States quản lý các modal thêm/sửa thông tin sức khỏe
  // Modal cho thông tin dị ứng
  const [allergyModalVisible, setAllergyModalVisible] = useState(false);
  
  // Modal cho bệnh mãn tính
  const [chronicModalVisible, setChronicModalVisible] = useState(false);
  
  // Modal cho lịch sử điều trị
  const [treatmentModalVisible, setTreatmentModalVisible] = useState(false);
  
  // Modal cho lịch sử tiêm chủng
  const [vaccinationModalVisible, setVaccinationModalVisible] = useState(false);
  
  // Modal cho thông tin thị lực
  const [visionModalVisible, setVisionModalVisible] = useState(false);
  
  // Modal cho thông tin thính lực
  const [hearingModalVisible, setHearingModalVisible] = useState(false);
  
  // Modal cho bệnh truyền nhiễm
  const [infectiousModalVisible, setInfectiousModalVisible] = useState(false);  
  // States quản lý việc chỉnh sửa từng loại thông tin sức khỏe
  // Lưu trữ thông tin dị ứng đang được chỉnh sửa (null nếu đang thêm mới)
  const [editingAllergy, setEditingAllergy] = useState(null);
  
  // Lưu trữ thông tin bệnh mãn tính đang được chỉnh sửa
  const [editingChronicDisease, setEditingChronicDisease] = useState(null);
  
  // Lưu trữ thông tin điều trị đang được chỉnh sửa
  const [editingTreatment, setEditingTreatment] = useState(null);
  
  // Lưu trữ thông tin tiêm chủng đang được chỉnh sửa
  const [editingVaccination, setEditingVaccination] = useState(null);
  
  // Lưu trữ thông tin thị lực đang được chỉnh sửa
  const [editingVision, setEditingVision] = useState(null);
  
  // Lưu trữ thông tin thính lực đang được chỉnh sửa
  const [editingHearing, setEditingHearing] = useState(null);
  
  // Lưu trữ thông tin bệnh truyền nhiễm đang được chỉnh sửa
  const [editingInfectiousDisease, setEditingInfectiousDisease] = useState(null);  
  // States quản lý modal xem chi tiết từng loại thông tin sức khỏe
  // Trạng thái hiển thị modal xem chi tiết
  const [viewDetailModalVisible, setViewDetailModalVisible] = useState(false);
  
  // Dữ liệu được hiển thị trong modal chi tiết
  const [viewDetailData, setViewDetailData] = useState(null);
  
  // Loại thông tin đang được xem (allergy, chronicDisease, treatment, etc.)
  const [viewDetailType, setViewDetailType] = useState(null);
  
  // States lưu trữ tạm thời dữ liệu sức khỏe trong form (chưa gửi lên server)
  // Danh sách dị ứng được thêm vào form
  const [allergies, setAllergies] = useState([]);
  
  // Danh sách bệnh mãn tính được thêm vào form
  const [chronicDiseases, setChronicDiseases] = useState([]);
  
  // Danh sách bệnh truyền nhiễm được thêm vào form
  const [infectiousDiseases, setInfectiousDiseases] = useState([]);
  
  // Danh sách lịch sử điều trị được thêm vào form
  const [treatments, setTreatments] = useState([]);  // Danh sách lịch sử tiêm chủng được thêm vào form
  const [vaccinationHistory, setVaccinationHistory] = useState([]);
  
  // Danh sách quy tắc tiêm chủng có sẵn từ hệ thống (để phụ huynh chọn)
  const [vaccinationRules, setVaccinationRules] = useState([]);
  
  // Quy tắc tiêm chủng được chọn để tự động điền thông tin
  const [selectedVaccinationRule, setSelectedVaccinationRule] = useState(null);
  
  // Trạng thái hiển thị danh sách quy tắc tiêm chủng
  const [showVaccinationRules, setShowVaccinationRules] = useState(false);
  
  // Danh sách thông tin thị lực được thêm vào form
  const [visionData, setVisionData] = useState([]);
  
  // Danh sách thông tin thính lực được thêm vào form
  const [hearingData, setHearingData] = useState([]);
  // Effect hook chạy khi component mount để tải danh sách học sinh
  useEffect(() => {
    // Hàm async để tải danh sách học sinh của phụ huynh
    const fetchStudents = async () => {      
      try {
        // Bật trạng thái loading
        setLoading(true);
        
        // Lấy token xác thực
        const token = getToken();
        
        // Gọi API để lấy danh sách học sinh
        const response = await parentApi.getMyStudents(token);
        
        // Cập nhật state với danh sách học sinh (hoặc mảng rỗng nếu không có)
        setStudents(response || []);
      } catch (err) {
        // Log lỗi ra console (giữ nguyên tiếng Anh)
        console.error('Error fetching students:', err);
        
        // Hiển thị thông báo lỗi cho người dùng bằng tiếng Việt
        message.error('Không thể tải danh sách học sinh');
      } finally {
        // Tắt trạng thái loading dù thành công hay thất bại
        setLoading(false);
      }
    };
    
    // Gọi hàm tải danh sách học sinh
    fetchStudents();
  }, [getToken]); // Dependency array: chỉ chạy lại khi getToken thay đổi
  // Hàm tải danh sách quy tắc tiêm chủng từ server
  const fetchVaccinationRules = async () => {
    try {
      // Lấy token từ localStorage (có thể refactor để dùng getToken())
      const token = localStorage.getItem('token');
      
      // Gọi API để lấy quy tắc tiêm chủng
      const response = await fetch('/api/parent/health-profiles/vaccination-rules', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Kiểm tra nếu response thành công
      if (response.ok) {
        // Parse JSON và cập nhật state
        const rules = await response.json();
        setVaccinationRules(rules);
        
        // Hiển thị danh sách quy tắc cho người dùng chọn
        setShowVaccinationRules(true);
      }
    } catch (error) {
      // Log lỗi ra console (giữ nguyên tiếng Anh)
      console.error('Error fetching vaccination rules:', error);
      
      // Hiển thị thông báo lỗi cho người dùng bằng tiếng Việt
      message.error('Không thể tải danh sách quy tắc tiêm chủng');
    }
  };  // Hàm xử lý việc chọn/bỏ chọn quy tắc tiêm chủng
  const handleRuleSelection = (ruleId) => {
    // Kiểm tra nếu quy tắc hiện tại đã được chọn
    if (selectedVaccinationRule && selectedVaccinationRule.id === ruleId) {
      // Nếu click vào quy tắc đã chọn thì bỏ chọn
      setSelectedVaccinationRule(null);
    } else {
      // Tìm quy tắc theo ID và chọn nó
      const rule = vaccinationRules.find(r => r.id === ruleId);
      if (rule) {
        setSelectedVaccinationRule(rule);
      }
    }
  };
  
  // Hàm tự động điền thông tin từ quy tắc tiêm chủng vào form
  const handleRuleSelectionForForm = (rule, form) => {
    // Điền các trường form với thông tin từ quy tắc được chọn
    form.setFieldsValue({
      vaccineName: rule.name,           // Tên vaccine
      doseNumber: rule.doesNumber || 1, // Số liều (mặc định là 1)
      notes: rule.description || ''     // Ghi chú mô tả
    });
    
    // Lưu quy tắc được chọn để theo dõi
    setSelectedVaccinationRule(rule);
  };
  
  const _addSelectedRulesToHistory = () => {
    if (!selectedVaccinationRule) {
      message.warning('Vui lòng chọn một quy tắc tiêm chủng');
      return;
    }

    const newEntry = {
      vaccineName: selectedVaccinationRule.name,
      doseNumber: selectedVaccinationRule.doesNumber || 1,
      dateOfVaccination: null,
      manufacturer: '',
      placeOfVaccination: '',
      administeredBy: '',
      notes: selectedVaccinationRule.description || '',
      status: 'PENDING',
      ruleId: selectedVaccinationRule.id
    };
    
    setVaccinationHistory(prev => [...prev, { ...newEntry, id: Date.now() + Math.random() }]);
    
    setSelectedVaccinationRule(null);
    setShowVaccinationRules(false);
    message.success('Đã thêm mục tiêm chủng từ quy tắc');
  };
  // Hàm xử lý khi người dùng chọn học sinh từ dropdown
  const handleStudentSelect = (studentId) => {
    // Log thông tin để debug (giữ nguyên tiếng Anh)
    console.log('Selected student ID:', studentId);
    
    // Kiểm tra tính hợp lệ của studentId
    if (!studentId) {
      message.error('ID học sinh không hợp lệ');
      return;
    }
    
    // Tìm thông tin học sinh trong danh sách dựa trên ID
    const student = students.find(s => s.id === studentId || s.studentID === studentId);
    console.log('Found student:', student);
    
    // Kiểm tra nếu không tìm thấy học sinh
    if (!student) {
      message.error('Không tìm thấy thông tin học sinh');
      return;
    }
    
    // Cập nhật học sinh được chọn
    setSelectedStudent(student);
    
    // Reset tất cả dữ liệu form và health data khi chọn học sinh khác
    form.resetFields();                    // Reset form fields
    setAllergies([]);                      // Xóa danh sách dị ứng tạm thời
    setChronicDiseases([]);                // Xóa danh sách bệnh mãn tính tạm thời
    setInfectiousDiseases([]);             // Xóa danh sách bệnh truyền nhiễm tạm thời
    setTreatments([]);                     // Xóa danh sách điều trị tạm thời
    setVaccinationHistory([]);             // Xóa lịch sử tiêm chủng tạm thời
    setVisionData([]);                     // Xóa thông tin thị lực tạm thời
    setHearingData([]);                    // Xóa thông tin thính lực tạm thời
    setSelectedProfile(null);              // Bỏ chọn hồ sơ đang chỉnh sửa
    setIsCreatingNewProfile(false);        // Reset trạng thái tạo hồ sơ mới
    
    // Tải danh sách hồ sơ sức khỏe của học sinh được chọn
    fetchHealthProfiles(studentId);
  };  // Hàm xử lý gửi form tạo hồ sơ sức khỏe mới
  const handleSubmit = async (values) => {
    // Kiểm tra toàn diện trước khi gửi dữ liệu
    
    // Kiểm tra đã chọn học sinh chưa
    if (!selectedStudent) {
      message.error('Vui lòng chọn học sinh trước khi gửi');
      return;
    }

    // Lấy ID học sinh với nhiều cách kiểm tra để đảm bảo tính hợp lệ
    const studentId = selectedStudent.id || selectedStudent.studentID;
    if (!studentId || studentId === null || studentId === undefined) {
      // Log chi tiết để debug
      console.error('Invalid student ID:', { selectedStudent, studentId });
      message.error('ID học sinh không hợp lệ. Vui lòng chọn lại học sinh.');
      return;
    }

    // Kiểm tra các trường form bắt buộc
    if (!values.weight || values.weight <= 0) {
      message.error('Vui lòng nhập cân nặng hợp lệ');
      return;
    }

    if (!values.height || values.height <= 0) {
      message.error('Vui lòng nhập chiều cao hợp lệ');
      return;
    }    try {
      // Bật trạng thái loading khi đang xử lý
      setLoading(true);
      
      // Tạo object chứa toàn bộ dữ liệu hồ sơ sức khỏe
      const healthProfileData = {
        // Thông tin cơ bản
        weight: parseFloat(values.weight),        // Chuyển đổi cân nặng sang số thực
        height: parseFloat(values.height),        // Chuyển đổi chiều cao sang số thực
        note: values.note || '',                  // Ghi chú (chuỗi rỗng nếu không có)
        studentId: parseInt(studentId, 10),       // Chuyển đổi ID học sinh sang số nguyên
        status: 'PENDING',                        // Trạng thái mặc định: đang chờ duyệt
        
        // Xử lý danh sách dị ứng: loại bỏ tempId cho record mới, giữ id cho record có sẵn
        allergies: allergies.map(allergy => {
          const { tempId: _tempId, ...allergyData } = allergy;
          return allergyData;
        }) || [],
        
        // Xử lý danh sách bệnh mãn tính: loại bỏ tempId cho record mới
        chronicDiseases: chronicDiseases.map(disease => {
           const { tempId: _tempId, ...diseaseData } = disease;
           return diseaseData;
         }) || [],        
         
        // Xử lý danh sách bệnh truyền nhiễm: loại bỏ tempId cho record mới
        infectiousDiseases: infectiousDiseases.map(disease => {
          const { tempId: _tempId, ...diseaseData } = disease;
          return diseaseData;
        }) || [],
        
        // Xử lý danh sách lịch sử điều trị: loại bỏ tempId cho record mới
        treatments: treatments.map(treatment => {
          const { tempId: _tempId, ...treatmentData } = treatment;
          return treatmentData;
        }) || [],
        
        // Xử lý dữ liệu thị lực: loại bỏ tempId cho record mới
        vision: visionData.map(vision => {
          const { tempId: _tempId, ...visionDataItem } = vision;
          return visionDataItem;
        }) || [],
        
        // Xử lý dữ liệu thính lực: loại bỏ tempId cho record mới
        hearing: hearingData.map(hearing => {
          const { tempId: _tempId, ...hearingDataItem } = hearing;
          return hearingDataItem;
        }) || [],
        
        // Xử lý lịch sử tiêm chủng: loại bỏ tempId cho record mới
        vaccinationHistory: vaccinationHistory.map(vaccination => {
          const { tempId: _tempId, ...vaccinationData } = vaccination;
          
          // Log debug cho dữ liệu tiêm chủng được gửi lên server
          console.log('Processing vaccination for server:', vaccination);
          console.log('Vaccination dateOfVaccination before processing:', vaccination.dateOfVaccination);
          console.log('Vaccination data after tempId removal:', vaccinationData);
          
          return vaccinationData;
        }) || []
      };      // Kiểm tra cuối cùng trước khi gửi dữ liệu
      if (!healthProfileData.studentId || isNaN(healthProfileData.studentId)) {
        throw new Error('Student ID is invalid or missing');
      }

      // Log dữ liệu được gửi để debug
      console.log('Submitting health profile data:', healthProfileData);
      
      // Gọi API để tạo hồ sơ sức khỏe
      const response = await parentApi.createHealthProfile(healthProfileData);
      console.log('Health profile created successfully:', response);
      
      // Hiển thị thông báo thành công
      message.success('Hồ sơ sức khỏe đã được tạo thành công!');
      
      // Tải lại danh sách hồ sơ để hiển thị dữ liệu cập nhật
      if (studentId) {
        await fetchHealthProfiles(studentId);
      }
      
      // Reset form và tất cả dữ liệu tạm thời sau khi tạo thành công
      form.resetFields();                    // Reset các trường form
      setAllergies([]);                      // Xóa danh sách dị ứng tạm thời
      setChronicDiseases([]);                // Xóa danh sách bệnh mãn tính tạm thời
      setInfectiousDiseases([]);             // Xóa danh sách bệnh truyền nhiễm tạm thời
      setTreatments([]);                     // Xóa danh sách điều trị tạm thời
      setVaccinationHistory([]);             // Xóa lịch sử tiêm chủng tạm thời
      setVisionData([]);                     // Xóa thông tin thị lực tạm thời
      setHearingData([]);                    // Xóa thông tin thính lực tạm thời
      setIsCreatingNewProfile(false);        // Tắt trạng thái tạo hồ sơ mới
      setSelectedStudent(null);              // Bỏ chọn học sinh
        } catch (error) {
      // Log lỗi ra console để debug
      console.error('Error creating health profile:', error);
      
      // Xử lý hiển thị thông báo lỗi cụ thể dựa trên loại lỗi
      if (error.response) {
        // Lỗi từ server (có response)
        const status = error.response.status;
        const errorMessage = error.response.data?.message || error.response.data?.error;
        
        // Xử lý từng mã lỗi HTTP cụ thể
        switch (status) {
          case 400:
            message.error(errorMessage || 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.');
            break;
          case 401:
            message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
            break;
          case 403:
            message.error('Bạn không có quyền thực hiện thao tác này.');
            break;
          case 404:
            message.error('Không tìm thấy thông tin học sinh. Vui lòng chọn lại.');
            break;
          case 500:
            message.error('Lỗi hệ thống. Vui lòng thử lại sau.');
            break;
          default:
            message.error(errorMessage || 'Có lỗi xảy ra khi tạo hồ sơ sức khỏe');
        }
      } else if (error.request) {
        // Lỗi kết nối mạng (không có response)
        message.error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.');
      } else {
        // Lỗi khác (lỗi code, validation, etc.)
        message.error(error.message || 'Có lỗi xảy ra khi tạo hồ sơ sức khỏe');
      }
    } finally {
      // Tắt trạng thái loading dù thành công hay thất bại
      setLoading(false);
    }
  };  // === QUẢN LÝ DỊ ỨNG ===
  
  // Hàm thêm thông tin dị ứng mới vào danh sách tạm thời
  const handleAddAllergy = (allergyData) => {
    // Kiểm tra xem đã có dị ứng cùng loại trong danh sách chưa
    const existingAllergy = allergies.find(
      allergy => allergy.allergyType.toLowerCase() === allergyData.allergyType.toLowerCase()
    );
    
    // Nếu đã tồn tại, hiển thị cảnh báo và không thêm
    if (existingAllergy) {
      message.warning(`Dị ứng với "${allergyData.allergyType}" đã tồn tại trong danh sách.`);
      return;
    }
    
    // Tạo object dị ứng mới
    const newAllergy = {
      // Không set ID cho dị ứng mới - để backend tự tạo
      // Điều này giúp backend phân biệt record mới và record đã có
      allergyType: allergyData.allergyType,     // Loại dị ứng
      description: allergyData.description,     // Mô tả chi tiết
      status: allergyData.status,               // Mức độ: MILD, MODERATE, SEVERE
      onsetDate: allergyData.onsetDate,         // Ngày bắt đầu
      // Thêm ID tạm thời chỉ để phục vụ UI
      tempId: Date.now()
    };
    
    // Cập nhật state với functional update để đảm bảo dùng state mới nhất
    setAllergies(prevAllergies => [...prevAllergies, newAllergy]);
    // Modal sẽ được đóng bởi component modal
  };

  // Hàm xóa dị ứng khỏi danh sách tạm thời
  const handleRemoveAllergy = (id) => {
    // Lọc ra các dị ứng không có ID hoặc tempId trùng với ID cần xóa
    setAllergies(allergies.filter(allergy => 
      allergy.id !== id && allergy.tempId !== id
    ));
  };  // === QUẢN LÝ BỆNH MÃN TÍNH ===
  
  // Hàm thêm thông tin bệnh mãn tính mới vào danh sách tạm thời
  const handleAddChronicDisease = (diseaseData) => {
    const newDisease = {
      // Không set ID cho bệnh mãn tính mới - để backend tự tạo
      // Điều này giúp backend phân biệt record mới và record đã có
      diseaseName: diseaseData.diseaseName,           // Tên bệnh
      dateDiagnosed: diseaseData.dateDiagnosed,       // Ngày chẩn đoán
      dateResolved: diseaseData.dateResolved,         // Ngày khỏi bệnh
      placeOfTreatment: diseaseData.placeOfTreatment, // Nơi điều trị
      description: diseaseData.description,           // Mô tả tình trạng
      dateOfAdmission: diseaseData.dateOfAdmission,   // Ngày nhập viện
      dateOfDischarge: diseaseData.dateOfDischarge,   // Ngày xuất viện
      status: diseaseData.status,                     // Trạng thái điều trị
      // Thêm ID tạm thời chỉ để phục vụ UI
      tempId: Date.now()
    };
    
    // Thêm vào danh sách và đóng modal
    setChronicDiseases([...chronicDiseases, newDisease]);
    setChronicModalVisible(false);
  };

  // Hàm xóa bệnh mãn tính khỏi danh sách tạm thời
  const handleRemoveChronicDisease = (id) => {
    setChronicDiseases(chronicDiseases.filter(disease => 
      disease.id !== id && disease.tempId !== id
    ));
  };  
  
  // === QUẢN LÝ LỊCH SỬ ĐIỀU TRỊ ===
  
  // Hàm thêm thông tin điều trị mới vào danh sách tạm thời
  const handleAddTreatment = (treatmentData) => {
    // Tạo object thông tin điều trị mới
    const newTreatment = {
      // Thêm ID tạm thời chỉ để phục vụ UI
      tempId: Date.now(),
      treatmentType: treatmentData.treatmentType,         // Loại điều trị
      description: treatmentData.description,             // Mô tả chi tiết
      dateOfAdmission: treatmentData.dateOfAdmission,     // Ngày nhập viện
      dateOfDischarge: treatmentData.dateOfDischarge,     // Ngày xuất viện
      doctorName: treatmentData.doctorName,               // Tên bác sĩ điều trị
      status: treatmentData.status || 'UNDER_TREATMENT',  // Trạng thái điều trị (mặc định: đang điều trị)
      placeOfTreatment: treatmentData.placeOfTreatment    // Nơi điều trị
    };
    
    // Thêm vào danh sách điều trị tạm thời và đóng modal
    setTreatments([...treatments, newTreatment]);
    setTreatmentModalVisible(false);
  };

  // Hàm xóa thông tin điều trị khỏi danh sách tạm thời
  const handleRemoveTreatment = (id) => {
    setTreatments(treatments.filter(treatment => 
      treatment.id !== id && treatment.tempId !== id
    ));
  };

  // === QUẢN LÝ LỊCH SỬ TIÊM CHỦNG ===

  // Hàm thêm thông tin tiêm chủng mới vào danh sách tạm thời
  const handleAddVaccination = (vaccinationData) => {
    // Log debug để kiểm tra dữ liệu tiêm chủng nhận được
    console.log('handleAddVaccination received data:', vaccinationData);
    console.log('handleAddVaccination dateOfVaccination:', vaccinationData.dateOfVaccination);
    
    // Tạo object thông tin tiêm chủng mới
    const newVaccination = {
      // Thêm ID tạm thời chỉ để phục vụ UI
      tempId: Date.now(),
      vaccineName: vaccinationData.vaccineName,             // Tên vắc xin
      doseNumber: vaccinationData.doseNumber,               // Số liều (mũi thứ mấy)
      manufacturer: vaccinationData.manufacturer,           // Hãng sản xuất
      dateOfVaccination: vaccinationData.dateOfVaccination, // Ngày tiêm
      placeOfVaccination: vaccinationData.placeOfVaccination, // Nơi tiêm
      administeredBy: vaccinationData.administeredBy,       // Người thực hiện tiêm
      notes: vaccinationData.notes,                         // Ghi chú thêm
      status: true,                                         // Trạng thái hoạt động
      // Bao gồm ID quy tắc tiêm chủng nếu có quy tắc được chọn
      ruleId: selectedVaccinationRule?.id || null
    };
    
    // Log debug để kiểm tra object tiêm chủng mới được tạo
    console.log('New vaccination object created:', newVaccination);
    console.log('New vaccination dateOfVaccination:', newVaccination.dateOfVaccination);
    console.log('New vaccination ruleId:', newVaccination.ruleId);
    
    // Thêm vào danh sách lịch sử tiêm chủng và đóng modal
    setVaccinationHistory([...vaccinationHistory, newVaccination]);
    setVaccinationModalVisible(false);
    
    // Xóa quy tắc đã chọn sau khi thêm tiêm chủng
    setSelectedVaccinationRule(null);
    setShowVaccinationRules(false);
  };

  // Hàm xóa thông tin tiêm chủng khỏi danh sách tạm thời
  const handleRemoveVaccination = (id) => {
    setVaccinationHistory(vaccinationHistory.filter(vaccination =>
      vaccination.id !== id && vaccination.tempId !== id
    ));
  };
  
  // === QUẢN LÝ THÔNG TIN THỊ LỰC ===
  
  // Hàm thêm thông tin thị lực mới vào danh sách tạm thời
  const handleAddVision = (formData) => {
    // Tạo object thông tin thị lực mới
    const newVision = {
      // Thêm ID tạm thời chỉ để phục vụ UI
      tempId: Date.now(),
      // Chuyển đổi dữ liệu thị lực sang số nguyên
      visionLeft: parseInt(formData.visionLeft, 10) || 0,           // Thị lực mắt trái
      visionRight: parseInt(formData.visionRight, 10) || 0,         // Thị lực mắt phải
      visionLeftWithGlass: parseInt(formData.visionLeftWithGlass, 10) || 0,    // Thị lực mắt trái có kính
      visionRightWithGlass: parseInt(formData.visionRightWithGlass, 10) || 0,  // Thị lực mắt phải có kính
      visionDescription: formData.visionDescription,                // Mô tả tình trạng thị lực
      // Chuyển đổi ngày khám từ dayjs sang string format
      dateOfExamination: formData.dateOfExamination ? formData.dateOfExamination.format('YYYY-MM-DD') : null
    };
    
    // Thêm vào danh sách thị lực tạm thời và đóng modal
    setVisionData([...visionData, newVision]);
    setVisionModalVisible(false);
  };

  // Hàm xóa thông tin thị lực khỏi danh sách tạm thời
  const handleRemoveVision = (id) => {
    setVisionData(visionData.filter(vision => 
      vision.id !== id && vision.tempId !== id
    ));
  };
  
  // === QUẢN LÝ THÔNG TIN THÍNH LỰC ===
  
  // Hàm thêm thông tin thính lực mới vào danh sách tạm thời  
  const handleAddHearing = (formData) => {
    // Tạo object thông tin thính lực mới
    const newHearing = {
      // Thêm ID tạm thời chỉ để phục vụ UI
      tempId: Date.now(),
      // Chuyển đổi dữ liệu thính lực sang số nguyên
      leftEar: parseInt(formData.leftEar, 10) || 0,    // Thính lực tai trái (điểm/10)
      rightEar: parseInt(formData.rightEar, 10) || 0,  // Thính lực tai phải (điểm/10)
      description: formData.description,               // Mô tả tình trạng thính lực
      dateOfExamination: formData.dateOfExamination    // Ngày khám thính lực
    };
    
    // Thêm vào danh sách thính lực tạm thời và đóng modal
    setHearingData([...hearingData, newHearing]);
    setHearingModalVisible(false);
  };

  // Hàm xóa thông tin thính lực khỏi danh sách tạm thời
  const handleRemoveHearing = (id) => {
    setHearingData(hearingData.filter(hearing => 
      hearing.id !== id && hearing.tempId !== id
    ));
  };

  // === QUẢN LÝ BỆNH TRUYỀN NHIỄM ===
  
  // Hàm thêm thông tin bệnh truyền nhiễm mới vào danh sách tạm thời
  const handleAddInfectiousDisease = (diseaseData) => {
    // Tạo object bệnh truyền nhiễm mới
    const newDisease = {
      // Thêm ID tạm thời chỉ để phục vụ UI
      tempId: Date.now(),
      diseaseName: diseaseData.diseaseName,           // Tên bệnh truyền nhiễm
      dateDiagnosed: diseaseData.dateDiagnosed,       // Ngày chẩn đoán
      dateResolved: diseaseData.dateResolved,         // Ngày khỏi bệnh
      placeOfTreatment: diseaseData.placeOfTreatment, // Nơi điều trị
      description: diseaseData.description,           // Mô tả tình trạng bệnh
      dateOfAdmission: diseaseData.dateOfAdmission,   // Ngày nhập viện
      dateOfDischarge: diseaseData.dateOfDischarge,   // Ngày xuất viện
      status: diseaseData.status                      // Trạng thái bệnh (ACTIVE/RECOVERED/etc.)
    };
    
    // Thêm vào danh sách bệnh truyền nhiễm tạm thời và đóng modal
    setInfectiousDiseases([...infectiousDiseases, newDisease]);
    setInfectiousModalVisible(false);
  };

  // Hàm xóa thông tin bệnh truyền nhiễm khỏi danh sách tạm thời
  const handleRemoveInfectiousDisease = (id) => {
    setInfectiousDiseases(infectiousDiseases.filter(disease => 
      disease.id !== id && disease.tempId !== id
    ));
  };// === HÀM TIỆN ÍCH KIỂM TRA QUYỀN ===
    // Hàm kiểm tra xem có được phép chỉnh sửa hồ sơ sức khỏe không
  const isEditingAllowed = () => {
    // Cho phép chỉnh sửa nếu:
    // 1. Chưa có hồ sơ nào HOẶC
    // 2. Có ít nhất một hồ sơ đang ở trạng thái PENDING (chờ duyệt) HOẶC
    // 3. Có hồ sơ đã được APPROVED (cho phép chỉnh sửa và sẽ chuyển về PENDING khi submit)
    return healthProfiles.length === 0 || 
           healthProfiles.some(profile => profile.status === 'PENDING') ||
           healthProfiles.some(profile => profile.status === 'APPROVED');
  };
  // Hàm kiểm tra xem có được phép tạo hồ sơ sức khỏe mới không
  const isCreatingNewProfileAllowed = () => {
    // Cho phép tạo hồ sơ mới nếu:
    // 1. Chưa có hồ sơ nào
    // 2. Có hồ sơ đang PENDING (chờ duyệt) 
    // 3. Hồ sơ mới nhất bị REJECTED (từ chối) - để cho phép tạo lại
    // KHÔNG cho phép tạo hồ sơ mới khi đã có hồ sơ APPROVED
    
    if (healthProfiles.length === 0) return true;
    
    const hasPendingProfile = healthProfiles.some(profile => profile.status === 'PENDING');
    if (hasPendingProfile) return true;
    
    // Không cho phép tạo hồ sơ mới nếu đã có hồ sơ APPROVED
    const hasApprovedProfile = healthProfiles.some(profile => profile.status === 'APPROVED');
    if (hasApprovedProfile) return false;
    
    // Kiểm tra xem hồ sơ mới nhất có bị từ chối không
    // Sắp xếp theo updatedAt hoặc createdAt, ưu tiên cái nào có sẵn
    const sortedProfiles = [...healthProfiles].sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt);
      const dateB = new Date(b.updatedAt || b.createdAt);
      return dateB - dateA; // Sắp xếp giảm dần (mới nhất trước)
    });
    const latestProfile = sortedProfiles[0];
    
    // Log thông tin để debug (giữ nguyên tiếng Anh)
    console.log('isCreatingNewProfileAllowed - healthProfiles:', healthProfiles);
    console.log('isCreatingNewProfileAllowed - sortedProfiles:', sortedProfiles);
    console.log('isCreatingNewProfileAllowed - latestProfile:', latestProfile);
    console.log('isCreatingNewProfileAllowed - latestProfile.status:', latestProfile?.status);
    
    const result = latestProfile && latestProfile.status === 'REJECTED';
    console.log('isCreatingNewProfileAllowed - result:', result);
    
    return result;
  };
  // === CÁC HÀM XỬ LÝ CHỈNH SỬA THÔNG TIN SỨC KHỎE ===
    // Hàm xử lý chỉnh sửa thông tin dị ứng
  const handleEditAllergy = (allergy) => {
    // Kiểm tra quyền chỉnh sửa trước khi cho phép
    if (!isEditingAllowed()) {
      message.warning('Chỉ có thể chỉnh sửa khi hồ sơ có trạng thái "Đang chờ duyệt" hoặc "Đã duyệt"');
      return;
    }
    // Lưu thông tin dị ứng đang được chỉnh sửa
    setEditingAllergy(allergy);
    // Mở modal chỉnh sửa
    setAllergyModalVisible(true);
  };
  // Hàm xử lý chỉnh sửa thông tin bệnh mãn tính
  const handleEditChronicDisease = (disease) => {
    if (!isEditingAllowed()) {
      message.warning('Chỉ có thể chỉnh sửa khi hồ sơ có trạng thái "Đang chờ duyệt" hoặc "Đã duyệt"');
      return;
    }
    setEditingChronicDisease(disease);
    setChronicModalVisible(true);
  };
  // Hàm xử lý chỉnh sửa thông tin điều trị
  const handleEditTreatment = (treatment) => {
    if (!isEditingAllowed()) {
      message.warning('Chỉ có thể chỉnh sửa khi hồ sơ có trạng thái "Đang chờ duyệt" hoặc "Đã duyệt"');
      return;
    }
    setEditingTreatment(treatment);
    setTreatmentModalVisible(true);
  };
  // Hàm xử lý chỉnh sửa thông tin tiêm chủng
  const handleEditVaccination = (vaccination) => {
    if (!isEditingAllowed()) {
      message.warning('Chỉ có thể chỉnh sửa khi hồ sơ có trạng thái "Đang chờ duyệt" hoặc "Đã duyệt"');
      return;
    }
    setEditingVaccination(vaccination);
    setVaccinationModalVisible(true);
  };
  // Hàm xử lý chỉnh sửa thông tin thị lực
  const handleEditVision = (vision) => {
    if (!isEditingAllowed()) {
      message.warning('Chỉ có thể chỉnh sửa khi hồ sơ có trạng thái "Đang chờ duyệt" hoặc "Đã duyệt"');
      return;
    }
    setEditingVision(vision);
    setVisionModalVisible(true);
  };
  // Hàm xử lý chỉnh sửa thông tin thính lực
  const handleEditHearing = (hearing) => {
    if (!isEditingAllowed()) {
      message.warning('Chỉ có thể chỉnh sửa khi hồ sơ có trạng thái "Đang chờ duyệt" hoặc "Đã duyệt"');
      return;
    }
    setEditingHearing(hearing);
    setHearingModalVisible(true);
  };
  // Hàm xử lý chỉnh sửa thông tin bệnh truyền nhiễm
  const handleEditInfectiousDisease = (disease) => {
    if (!isEditingAllowed()) {
      message.warning('Chỉ có thể chỉnh sửa khi hồ sơ có trạng thái "Đang chờ duyệt" hoặc "Đã duyệt"');
      return;
    }
    setEditingInfectiousDisease(disease);
    setInfectiousModalVisible(true);
  };
  // Hàm xử lý xem chi tiết thông tin sức khỏe
  const handleViewDetail = (data, type) => {
    // Lưu dữ liệu và loại thông tin cần hiển thị
    setViewDetailData(data);
    setViewDetailType(type);
    // Mở modal xem chi tiết
    setViewDetailModalVisible(true);
  };

  // === CÁC HÀM CẬP NHẬT THÔNG TIN SỨC KHỎE (HỖ TRỢ CẢ THÊM MỚI VÀ CHỈNH SỬA) ===
  
  // Hàm cập nhật thông tin dị ứng (thêm mới hoặc chỉnh sửa)
  const handleUpdateAllergy = (allergyData) => {
    if (editingAllergy) {
      // Chế độ chỉnh sửa: cập nhật dị ứng hiện có
      setAllergies(allergies.map(allergy => 
        (allergy.id || allergy.tempId) === (editingAllergy.id || editingAllergy.tempId)
          ? { ...allergy, ...allergyData }  // Merge dữ liệu mới với dữ liệu cũ
          : allergy
      ));
      setEditingAllergy(null);  // Reset trạng thái chỉnh sửa
      message.success('Cập nhật dị ứng thành công');
    } else {
      // Chế độ thêm mới: sử dụng logic thêm dị ứng hiện có
      handleAddAllergy(allergyData);
    }
    setAllergyModalVisible(false);
  };
  // Hàm cập nhật thông tin bệnh mãn tính (thêm mới hoặc chỉnh sửa)
  const handleUpdateChronicDisease = (diseaseData) => {
    if (editingChronicDisease) {
      // Chế độ chỉnh sửa: cập nhật bệnh mãn tính hiện có
      setChronicDiseases(chronicDiseases.map(disease => 
        (disease.id || disease.tempId) === (editingChronicDisease.id || editingChronicDisease.tempId)
          ? { ...disease, ...diseaseData }
          : disease
      ));
      setEditingChronicDisease(null);
      message.success('Cập nhật bệnh mãn tính thành công');
    } else {
      // Chế độ thêm mới: sử dụng logic thêm bệnh mãn tính hiện có
      handleAddChronicDisease(diseaseData);
    }
    setChronicModalVisible(false);
  };

  // Hàm cập nhật thông tin điều trị (thêm mới hoặc chỉnh sửa)
  const handleUpdateTreatment = (treatmentData) => {
    if (editingTreatment) {
      // Chế độ chỉnh sửa: cập nhật thông tin điều trị hiện có
      setTreatments(treatments.map(treatment => 
        (treatment.id || treatment.tempId) === (editingTreatment.id || editingTreatment.tempId)
          ? { ...treatment, ...treatmentData }
          : treatment
      ));
      setEditingTreatment(null);
      message.success('Cập nhật lịch sử điều trị thành công');
    } else {
      // Chế độ thêm mới: sử dụng logic thêm điều trị hiện có
      handleAddTreatment(treatmentData);
    }
    setTreatmentModalVisible(false);
  };  // Hàm cập nhật thông tin tiêm chủng (thêm mới hoặc chỉnh sửa)
  const handleUpdateVaccination = (vaccinationData) => {
    if (editingVaccination) {
      // Chế độ chỉnh sửa: cập nhật thông tin tiêm chủng hiện có
      const updatedVaccinationData = {
        ...vaccinationData,
        // Bao gồm ruleId nếu có quy tắc được chọn, nếu không thì giữ nguyên hoặc set null
        ruleId: selectedVaccinationRule?.id || vaccinationData.ruleId || null
      };
      
      setVaccinationHistory(vaccinationHistory.map(vaccination => 
        (vaccination.id || vaccination.tempId) === (editingVaccination.id || editingVaccination.tempId)
          ? { ...vaccination, ...updatedVaccinationData }
          : vaccination
      ));
      setEditingVaccination(null);
      message.success('Cập nhật tiêm chủng thành công');
      
      // Xóa quy tắc đã chọn sau khi cập nhật tiêm chủng
      setSelectedVaccinationRule(null);
      setShowVaccinationRules(false);
    } else {
      // Chế độ thêm mới: sử dụng logic thêm tiêm chủng hiện có
      handleAddVaccination(vaccinationData);
    }
    setVaccinationModalVisible(false);
  };

  // Hàm cập nhật thông tin thị lực (thêm mới hoặc chỉnh sửa)
  const handleUpdateVision = (visionData) => {
    if (editingVision) {
      // Chế độ chỉnh sửa: cập nhật thông tin thị lực hiện có
      setVisionData(visionDataList => visionDataList.map(vision => 
        (vision.id || vision.tempId) === (editingVision.id || editingVision.tempId)
          ? { ...vision, ...visionData }
          : vision
      ));
      setEditingVision(null);
      message.success('Cập nhật thị lực thành công');
    } else {
      // Chế độ thêm mới: sử dụng logic thêm thị lực hiện có
      handleAddVision(visionData);
    }
    setVisionModalVisible(false);
  };

  // Hàm cập nhật thông tin thính lực (thêm mới hoặc chỉnh sửa)
  const handleUpdateHearing = (hearingData) => {
    if (editingHearing) {
      // Chế độ chỉnh sửa: cập nhật thông tin thính lực hiện có
      setHearingData(hearingDataList => hearingDataList.map(hearing => 
        (hearing.id || hearing.tempId) === (editingHearing.id || editingHearing.tempId)
          ? { ...hearing, ...hearingData }
          : hearing
      ));
      setEditingHearing(null);
      message.success('Cập nhật thính lực thành công');
    } else {
      // Chế độ thêm mới: sử dụng logic thêm thính lực hiện có
      handleAddHearing(hearingData);
    }
    setHearingModalVisible(false);
  };

  // Hàm cập nhật thông tin bệnh truyền nhiễm (thêm mới hoặc chỉnh sửa)
  const handleUpdateInfectiousDisease = (diseaseData) => {
    if (editingInfectiousDisease) {
      // Chế độ chỉnh sửa: cập nhật thông tin bệnh truyền nhiễm hiện có
      setInfectiousDiseases(infectiousDiseases.map(disease => 
        (disease.id || disease.tempId) === (editingInfectiousDisease.id || editingInfectiousDisease.tempId)
          ? { ...disease, ...diseaseData }
          : disease
      ));
      setEditingInfectiousDisease(null);
      message.success('Cập nhật bệnh truyền nhiễm thành công');
    } else {
      // Chế độ thêm mới: sử dụng logic thêm bệnh truyền nhiễm hiện có
      handleAddInfectiousDisease(diseaseData);
    }
    setInfectiousModalVisible(false);
  };  // === CÁC HÀM QUẢN LÝ HỒ SƠ SỨC KHỎE ===
  
  // Hàm tải danh sách hồ sơ sức khỏe cho học sinh đã chọn
  const fetchHealthProfiles = async (studentId) => {
    setProfilesLoading(true);
    try {
      const token = getToken();
      const response = await parentApi.getHealthProfilesByStudentId(studentId, token);
      setHealthProfiles(response || []);
    } catch (error) {
      console.error('Error fetching health profiles:', error);
      message.error('Không thể tải hồ sơ sức khỏe');
    } finally {
      setProfilesLoading(false);
    }
  };

  // Hàm xử lý cập nhật hồ sơ sức khỏe hiện có
  const handleProfileUpdate = async (values) => {
    if (!selectedStudent || !selectedProfile) {
      message.error('Không có hồ sơ được chọn để cập nhật');
      return;
    }

    const studentId = selectedStudent.id || selectedStudent.studentID;
    if (!studentId) {
      message.error('ID học sinh không hợp lệ');
      return;
    }

    try {
      setLoading(true);
        // Chuẩn bị dữ liệu hồ sơ đã được cập nhật
      const updatedProfileData = {
        ...selectedProfile,
        // Cập nhật thông tin cơ bản từ form
        weight: parseFloat(values.weight),
        height: parseFloat(values.height),
        note: values.note || '',
        studentId: parseInt(studentId, 10),
        
        // QUAN TRỌNG: Nếu hồ sơ hiện tại đã được APPROVED, chuyển về PENDING để Y tá duyệt lại
        status: selectedProfile.status === 'APPROVED' ? 'PENDING' : selectedProfile.status,
        
        // Xóa nurseNote nếu chuyển từ APPROVED về PENDING (Y tá sẽ viết ghi chú mới)
        nurseNote: selectedProfile.status === 'APPROVED' ? null : selectedProfile.nurseNote,
        
        // Xử lý danh sách dị ứng: loại bỏ tempId cho record mới
        allergies: allergies.map(allergy => {
          const { tempId: _tempId, ...allergyData } = allergy;
          return allergyData;
        }) || [],
        
        // Xử lý danh sách bệnh mãn tính: loại bỏ tempId và format ngày tháng
        chronicDiseases: chronicDiseases.map(disease => {
           const { tempId: _tempId, ...diseaseData } = disease;
           return {
             ...diseaseData,
             // Format các ngày tháng từ dayjs object sang string YYYY-MM-DD
             dateDiagnosed: diseaseData.dateDiagnosed && diseaseData.dateDiagnosed.format ? diseaseData.dateDiagnosed.format('YYYY-MM-DD') : diseaseData.dateDiagnosed,
             dateResolved: diseaseData.dateResolved && diseaseData.dateResolved.format ? diseaseData.dateResolved.format('YYYY-MM-DD') : diseaseData.dateResolved,
             dateOfAdmission: diseaseData.dateOfAdmission && diseaseData.dateOfAdmission.format ? diseaseData.dateOfAdmission.format('YYYY-MM-DD') : diseaseData.dateOfAdmission,
             dateOfDischarge: diseaseData.dateOfDischarge && diseaseData.dateOfDischarge.format ? diseaseData.dateOfDischarge.format('YYYY-MM-DD') : diseaseData.dateOfDischarge
           };
         }) || [],
        
        // Xử lý danh sách bệnh truyền nhiễm: loại bỏ tempId và format ngày tháng
        infectiousDiseases: infectiousDiseases.map(disease => {
          const { tempId: _tempId, ...diseaseData } = disease;
          return {
            ...diseaseData,
            dateDiagnosed: diseaseData.dateDiagnosed && diseaseData.dateDiagnosed.format ? diseaseData.dateDiagnosed.format('YYYY-MM-DD') : diseaseData.dateDiagnosed,
            dateResolved: diseaseData.dateResolved && diseaseData.dateResolved.format ? diseaseData.dateResolved.format('YYYY-MM-DD') : diseaseData.dateResolved,
            dateOfAdmission: diseaseData.dateOfAdmission && diseaseData.dateOfAdmission.format ? diseaseData.dateOfAdmission.format('YYYY-MM-DD') : diseaseData.dateOfAdmission,
            dateOfDischarge: diseaseData.dateOfDischarge && diseaseData.dateOfDischarge.format ? diseaseData.dateOfDischarge.format('YYYY-MM-DD') : diseaseData.dateOfDischarge
          };
        }) || [],
        
        // Xử lý danh sách điều trị: loại bỏ tempId cho record mới
        treatments: treatments.map(treatment => {
          const { tempId: _tempId, ...treatmentData } = treatment;
          return treatmentData;
        }) || [],
        
        // Xử lý dữ liệu thị lực: loại bỏ tempId và format ngày khám
        vision: visionData.map(vision => {
          const { tempId: _tempId, ...visionDataItem } = vision;
          return {
            ...visionDataItem,
            dateOfExamination: visionDataItem.dateOfExamination && visionDataItem.dateOfExamination.format ? visionDataItem.dateOfExamination.format('YYYY-MM-DD') : visionDataItem.dateOfExamination
          };
        }) || [],
        
        // Xử lý dữ liệu thính lực: loại bỏ tempId và format ngày khám
        hearing: hearingData.map(hearing => {
          const { tempId: _tempId, ...hearingDataItem } = hearing;
          return {
            ...hearingDataItem,
            dateOfExamination: hearingDataItem.dateOfExamination && hearingDataItem.dateOfExamination.format ? hearingDataItem.dateOfExamination.format('YYYY-MM-DD') : hearingDataItem.dateOfExamination
          };
        }) || [],
        
        // Xử lý lịch sử tiêm chủng: loại bỏ tempId cho record mới
        vaccinationHistory: vaccinationHistory.map(vaccination => {
          const { tempId: _tempId, ...vaccinationData } = vaccination;
          return vaccinationData;
        }) || []
      };      console.log('Updating health profile data:', updatedProfileData);
      const response = await parentApi.updateHealthProfile(updatedProfileData.id, updatedProfileData);
      console.log('Health profile updated successfully:', response);
      
      // Thông báo thành công khác nhau tùy theo trạng thái
      if (selectedProfile.status === 'APPROVED') {
        message.success('Hồ sơ sức khỏe đã được cập nhật thành công! Trạng thái đã chuyển về "Đang chờ duyệt" để Y tá kiểm tra lại.');
      } else {
        message.success('Hồ sơ sức khỏe đã được cập nhật thành công!');
      }
      
      // Tải lại danh sách hồ sơ để hiển thị dữ liệu cập nhật
      fetchHealthProfiles(studentId);
      
      // Reset form và tất cả state tạm thời
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
      console.error('Error updating health profile:', error);
      message.error('Có lỗi xảy ra khi cập nhật hồ sơ sức khỏe');
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý submit form - sẽ gọi create hoặc update tùy theo context
  const handleFormSubmit = async (values) => {
    if (selectedProfile) {
      // Cập nhật hồ sơ hiện có
      await handleProfileUpdate(values);
    } else {
      // Tạo hồ sơ mới
      await handleSubmit(values);
    }
  };
    // Hàm xử lý chọn hồ sơ để xem hoặc chỉnh sửa
  const handleProfileSelect = (profile) => {
    setSelectedProfile(profile);
    setActiveTab('basic');
    
    // Hiển thị cảnh báo nếu đang chỉnh sửa hồ sơ đã được duyệt
    if (profile.status === 'APPROVED') {
      message.warning({
        content: 'Bạn đang chỉnh sửa hồ sơ đã được duyệt. Khi bấm "Cập nhật", trạng thái sẽ chuyển về "Đang chờ duyệt" để Y tá kiểm tra lại.',
        duration: 6,
        style: {
          marginTop: '20px',
        },
      });
    }
    
    // Điền dữ liệu hồ sơ đã chọn vào form
    form.setFieldsValue({
      weight: profile.weight,
      height: profile.height,
      note: profile.note
    });
    
    // Điền dữ liệu sức khỏe vào các state tạm thời để hiển thị và chỉnh sửa
    setAllergies(profile.allergies);
    setChronicDiseases(profile.chronicDiseases);
    setInfectiousDiseases(profile.infectiousDiseases);
    setTreatments(profile.treatments);
    setVaccinationHistory(profile.vaccinationHistory);
    setVisionData(profile.vision);
    setHearingData(profile.hearing);
  };
  
  // Hàm xử lý xóa hồ sơ sức khỏe
  const handleProfileDelete = async (profileId) => {
    try {
      const token = getToken();
      await parentApi.deleteHealthProfile(profileId, token);
      message.success('Đã xóa hồ sơ sức khỏe');
      
      // Tải lại danh sách hồ sơ sau khi xóa
      fetchHealthProfiles(selectedStudent.id || selectedStudent.studentID);
    } catch (error) {
      console.error('Error deleting health profile:', error);
      message.error('Không thể xóa hồ sơ sức khỏe');
    }
  };

  // Hàm xử lý xem chi tiết hồ sơ sức khỏe
  const handleViewProfileDetail = async (profile) => {
    try {
      setLoading(true);
      
      // Tìm profile đầy đủ từ danh sách hiện có thay vì gọi API
      const fullProfile = healthProfiles.find(p => p.id === profile.id);
      
      if (!fullProfile) {
        message.error('Không tìm thấy thông tin chi tiết hồ sơ');
        return;
      }
      
      console.log('FullProfile from list:', fullProfile);
      console.log('SelectedStudent:', selectedStudent);
      
      // Set dữ liệu hồ sơ để hiển thị trong modal chi tiết
      setSelectedProfileForDetail({
        ...fullProfile,
        // Ưu tiên dữ liệu student từ profile, fallback về selectedStudent
        student: fullProfile.student || selectedStudent
      });
      setDetailModalVisible(true);
    } catch (error) {
      console.error('Error fetching health profile details:', error);
      message.error('Không thể tải chi tiết hồ sơ sức khỏe');
    } finally {
      setLoading(false);
    }
  };  // === COMPONENT LOADING VÀ RENDER ===
  
  // Hiển thị loading khi đang tải dữ liệu học sinh
  if (loading && students.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  // === RENDER MAIN COMPONENT ===
  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Card>
        {/* Header section với tiêu đề và thông báo quan trọng */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ marginBottom: '16px', color: '#1890ff' }}>
            <MedicineBoxOutlined style={{ marginRight: '8px' }} />
            Khai Báo Hồ Sơ Sức Khỏe
          </h2>
          <Alert
            message="Thông tin quan trọng"
            description="Vui lòng cung cấp thông tin sức khỏe chính xác và đầy đủ cho con em của bạn. Thông tin này sẽ giúp nhà trường chăm sóc sức khỏe tốt hơn."
            type="info"
            showIcon
            style={{ marginBottom: '24px' }}
          />
        </div>

        {/* Phần chọn học sinh */}
        <Card size="small" style={{ marginBottom: '24px', backgroundColor: '#f9f9f9' }}>
          <Row gutter={[16, 16]} align="middle">
            <Col span={8}>
              <label style={{ fontWeight: 600 }}>Chọn học sinh:</label>
            </Col>
            <Col span={16}>              <Select
                placeholder="Chọn học sinh để khai báo hồ sơ sức khỏe"
                style={{ width: '100%' }}
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
                  const studentName = student.firstName && student.lastName 
                    ? `${student.lastName} ${student.firstName}` 
                    : student.name || 'Tên không có';
                  
                  // Skip students without valid IDs
                  if (!studentId) {
                    console.warn('Student without valid ID:', student);
                    return null;
                  }
                  
                  return (
                    <Option key={studentId || `student-${index}`} value={studentId}>
                      {studentName} - Lớp {student.className || 'N/A'}
                    </Option>
                  );
                })}
              </Select>
            </Col>
          </Row>
        </Card>        {!selectedStudent && (
          <Card style={{ textAlign: 'center', padding: '48px', marginBottom: '24px' }}>
            <MedicineBoxOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
            <h3 style={{ color: '#1890ff', marginBottom: '8px' }}>Chọn học sinh để bắt đầu khai báo</h3>
            <p style={{ color: '#666', margin: 0 }}>
              Vui lòng chọn học sinh từ danh sách bên trên để bắt đầu khai báo hồ sơ sức khỏe
            </p>
          </Card>
        )}        {selectedStudent && (healthProfiles.length === 0 || selectedProfile || isCreatingNewProfile) && (
          <Card title={`${selectedProfile ? 'Chỉnh sửa' : 'Tạo'} hồ sơ sức khỏe của ${
            selectedStudent.firstName && selectedStudent.lastName 
              ? `${selectedStudent.lastName} ${selectedStudent.firstName}` 
              : selectedStudent.name || 'Học sinh'
          }`} style={{ marginBottom: '24px' }}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleFormSubmit}
              initialValues={{
                weight: 0,
                height: 0,
                note: ''
              }}
            ><Tabs 
                activeKey={activeTab} 
                onChange={setActiveTab}
                items={[
                  {
                    key: 'basic',
                    label: 'Thông tin cơ bản',
                    children: (
                      <>
                        <Row gutter={[24, 16]}>
                          <Col span={12}>
                            <Form.Item
                              label="Cân nặng (kg)"
                              name="weight"
                              rules={[
                                { required: true, message: 'Vui lòng nhập cân nặng' },
                                { type: 'number', min: 1, max: 200, message: 'Cân nặng phải từ 1-200 kg' }
                              ]}
                            >
                              <InputNumber
                                style={{ width: '100%' }}
                                placeholder="Nhập cân nặng"
                                step={0.1}
                                precision={1}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item
                              label="Chiều cao (cm)"
                              name="height"
                              rules={[
                                { required: true, message: 'Vui lòng nhập chiều cao' },
                                { type: 'number', min: 50, max: 250, message: 'Chiều cao phải từ 50-250 cm' }
                              ]}
                            >
                              <InputNumber
                                style={{ width: '100%' }}
                                placeholder="Nhập chiều cao"
                                step={0.1}
                                precision={1}
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                        
                        <Form.Item
                          label="Ghi chú bổ sung"
                          name="note"
                        >
                          <TextArea
                            rows={4}
                            placeholder="Các thông tin bổ sung về sức khỏe của học sinh..."
                          />
                        </Form.Item>
                      </>
                    )
                  },
                  {
                    key: 'allergies',
                    label: 'Dị ứng',
                    children: (
                      <>
                        <div style={{ marginBottom: '16px' }}>
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
                                  onClick={() => handleViewDetail(allergy, 'allergy')}
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
                                  onClick={() => handleRemoveAllergy(allergy.id || allergy.tempId)}
                                >
                                  Xóa
                                </Button>
                              ]}
                            >
                              <List.Item.Meta
                                title={allergy.allergyType}
                                description={
                                  <div>
                                    <p>{allergy.description}</p>
                                    <Tag color={
                                      allergy.status === 'MILD' ? 'green' : 
                                      allergy.status === 'MODERATE' ? 'orange' : 
                                      allergy.status === 'SEVERE' ? 'red' : 'blue'
                                    }>
                                      {
                                        allergy.status === 'MILD' ? 'Nhẹ' : 
                                        allergy.status === 'MODERATE' ? 'Trung bình' : 
                                        allergy.status === 'SEVERE' ? 'Nặng' : 'Không xác định'
                                      }
                                    </Tag>
                                    {allergy.onsetDate && (
                                      <span style={{ marginLeft: '8px', color: '#666' }}>
                                        Từ: {dayjs(allergy.onsetDate).format('DD/MM/YYYY')}
                                      </span>
                                    )}
                                  </div>
                                }
                              />
                            </List.Item>
                          )}
                          locale={{ emptyText: 'Chưa có thông tin dị ứng' }}
                        />
                      </>
                    )
                  },
                  {
                    key: 'chronic',
                    label: 'Bệnh mãn tính',
                    children: (
                      <>
                        <div style={{ marginBottom: '16px' }}>
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
                                  onClick={() => handleViewDetail(disease, 'chronicDisease')}
                                >
                                  Xem
                                </Button>,
                                <Button
                                  type="link"
                                  icon={<EditOutlined />}
                                  onClick={() => handleEditChronicDisease(disease)}
                                >
                                  Sửa
                                </Button>,
                                <Button
                                  type="link"
                                  danger
                                  icon={<DeleteOutlined />}
                                  onClick={() => handleRemoveChronicDisease(disease.id || disease.tempId)}
                                >
                                  Xóa
                                </Button>
                              ]}
                            >
                              <List.Item.Meta
                                title={disease.diseaseName}
                                description={
                                  <div>
                                    <p>{disease.description}</p>
                                    <Tag color={
                                      disease.status === 'RECOVERED' ? 'green' : 
                                      disease.status === 'UNDER_TREATMENT' ? 'orange' :
                                      disease.status === 'STABLE' ? 'blue' :
                                      disease.status === 'WORSENED' ? 'red' :
                                      disease.status === 'RELAPSED' ? 'volcano' :
                                      disease.status === 'NEWLY_DIAGNOSED' ? 'purple' :
                                      disease.status === 'UNDER_OBSERVATION' ? 'cyan' :
                                      disease.status === 'ISOLATED' ? 'magenta' :
                                      disease.status === 'UNTREATED' ? 'gold' : 'default'
                                    }>
                                      {disease.status === 'UNDER_TREATMENT' ? 'Đang điều trị' : 
                                       disease.status === 'RECOVERED' ? 'Đã khỏi' :
                                       disease.status === 'STABLE' ? 'Ổn định' :
                                       disease.status === 'WORSENED' ? 'Đang xấu đi' :
                                       disease.status === 'RELAPSED' ? 'Tái phát' :
                                       disease.status === 'NEWLY_DIAGNOSED' ? 'Mới chẩn đoán' :
                                       disease.status === 'UNDER_OBSERVATION' ? 'Đang theo dõi' :
                                       disease.status === 'UNKNOWN' ? 'Không rõ' :
                                       disease.status === 'ISOLATED' ? 'Cách ly' :
                                       disease.status === 'UNTREATED' ? 'Chưa điều trị' : 'Không xác định'}
                                    </Tag>
                                    {disease.dateDiagnosed && (
                                      <span style={{ marginLeft: '8px', color: '#666' }}>
                                        Chẩn đoán: {dayjs(disease.dateDiagnosed).format('DD/MM/YYYY')}
                                      </span>
                                    )}
                                    {disease.placeOfTreatment && (
                                      <p style={{ margin: '4px 0 0 0', color: '#666' }}>
                                        Nơi điều trị: {disease.placeOfTreatment}
                                      </p>
                                    )}
                                  </div>
                                }
                              />
                            </List.Item>
                          )}
                          locale={{ emptyText: 'Chưa có thông tin bệnh mãn tính' }}
                        />
                      </>
                    )
                  },
                  {
                    key: 'treatment',
                    label: 'Lịch sử điều trị',
                    children: (
                      <>
                        <div style={{ marginBottom: '16px' }}>
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
                                  onClick={() => handleViewDetail(treatment, 'treatment')}
                                >
                                  Xem
                                </Button>,
                                <Button
                                  type="link"
                                  icon={<EditOutlined />}
                                  onClick={() => handleEditTreatment(treatment)}
                                >
                                  Sửa
                                </Button>,
                                <Button
                                  type="link"
                                  danger
                                  icon={<DeleteOutlined />}
                                  onClick={() => handleRemoveTreatment(treatment.id || treatment.tempId)}
                                >
                                  Xóa
                                </Button>
                              ]}
                            >
                              <List.Item.Meta
                                title={treatment.treatmentType}
                                description={
                                  <div>
                                    <p>{treatment.description}</p>
                                    <p style={{ margin: 0, color: '#666' }}>
                                      Bác sĩ: {treatment.doctorName}
                                    </p>
                                    <p style={{ margin: 0, color: '#666' }}>
                                      Thời gian: {treatment.dateOfAdmission ? dayjs(treatment.dateOfAdmission).format('DD/MM/YYYY') : 'Chưa cập nhật'}
                                      {treatment.dateOfAdmission && ` - ${dayjs(treatment.dateOfDischarge).format('DD/MM/YYYY')}`}
                                    </p>
                                  </div>
                                }
                              />
                            </List.Item>
                          )}
                          locale={{ emptyText: 'Chưa có lịch sử điều trị' }}
                        />
                      </>
                    )
                  },
                  {
                    key: 'vaccination',
                    label: 'Tiêm chủng',
                    children: (
                      <>
                        <div style={{ marginBottom: '16px' }}>
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
                                  onClick={() => handleViewDetail(vaccination, 'vaccination')}
                                >
                                  Xem
                                </Button>,
                                <Button
                                  type="link"
                                  icon={<EditOutlined />}
                                  onClick={() => handleEditVaccination(vaccination)}
                                >
                                  {vaccination.status === 'PENDING' ? 'Hoàn thành' : 'Sửa'}
                                </Button>,
                                <Button
                                  type="link"
                                  danger
                                  icon={<DeleteOutlined />}
                                  onClick={() => handleRemoveVaccination(vaccination.id || vaccination.tempId)}
                                >
                                  Xóa
                                </Button>
                              ]}
                            >
                              <List.Item.Meta
                                title={
                                  <div>
                                    {vaccination.vaccineName}
                                    {vaccination.status === 'PENDING' && (
                                      <Tag color="orange" style={{ marginLeft: 8 }}>Chưa hoàn thành</Tag>
                                    )}
                                    {vaccination.status === 'COMPLETED' && (
                                      <Tag color="green" style={{ marginLeft: 8 }}>Đã hoàn thành</Tag>
                                    )}
                                  </div>
                                }
                                description={
                                  <div>
                                    {vaccination.dateOfVaccination ? (
                                      <p>Ngày tiêm: {dayjs(vaccination.dateOfVaccination).format('DD/MM/YYYY')}</p>
                                    ) : (
                                      <p style={{ color: '#999' }}>Ngày tiêm: Chưa cập nhật</p>
                                    )}
                                    <p>Liều số: {vaccination.doseNumber}</p>
                                    {vaccination.manufacturer ? (
                                      <p>Nhà sản xuất: {vaccination.manufacturer}</p>
                                    ) : vaccination.status === 'PENDING' && (
                                      <p style={{ color: '#999' }}>Nhà sản xuất: Chưa cập nhật</p>
                                    )}
                                    {vaccination.placeOfVaccination ? (
                                      <p>Nơi tiêm: {vaccination.placeOfVaccination}</p>
                                    ) : vaccination.status === 'PENDING' && (
                                      <p style={{ color: '#999' }}>Nơi tiêm: Chưa cập nhật</p>
                                    )}
                                    {vaccination.administeredBy ? (
                                      <p>Người tiêm: {vaccination.administeredBy}</p>
                                    ) : vaccination.status === 'PENDING' && (
                                      <p style={{ color: '#999' }}>Người tiêm: Chưa cập nhật</p>
                                    )}
                                    {vaccination.notes && <p>Ghi chú: {vaccination.notes}</p>}
                                  </div>
                                }
                              />
                            </List.Item>
                          )}
                          locale={{ emptyText: 'Chưa có lịch sử tiêm chủng' }}
                        />
                      </>
                    )
                  },                  {
                    key: 'vision',
                    label: 'Thị lực',
                    children: (
                      <>
                        <div style={{ marginBottom: '16px' }}>
                          {visionData.length === 0 ? (
                            <Button
                              type="primary"
                              icon={<EyeOutlined />}
                              onClick={() => setVisionModalVisible(true)}
                            >
                              Thêm thông tin thị lực
                            </Button>
                          ) : (
                            <div>
                              <Alert
                                message="Thông tin thị lực đã được khai báo"
                                description="Bạn có thể xem chi tiết hoặc chỉnh sửa thông tin hiện có, nhưng không thể thêm mới."
                                type="info"
                                showIcon
                                style={{ marginBottom: '12px' }}
                              />
                              <Button
                                type="default"
                                icon={<EyeOutlined />}
                                disabled
                                style={{ opacity: 0.6 }}
                              >
                                Không thể thêm mới
                              </Button>
                            </div>
                          )}
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
                                  onClick={() => handleViewDetail(vision, 'vision')}
                                >
                                  Xem
                                </Button>,
                                <Button
                                  type="link"
                                  icon={<EditOutlined />}
                                  onClick={() => handleEditVision(vision)}
                                >
                                  Sửa
                                </Button>,
                                <Button
                                  type="link"
                                  danger
                                  icon={<DeleteOutlined />}
                                  onClick={() => handleRemoveVision(vision.id || vision.tempId)}
                                >
                                  Xóa
                                </Button>
                              ]}
                            >
                              <List.Item.Meta
                                title={`Khám thị lực - ${dayjs(vision.dateOfExamination).format('DD/MM/YYYY')}`}
                                description={
                                  <div>
                                    <p>Mắt trái: {vision.visionLeft}/10 {vision.visionLeftWithGlass && `(Có kính: ${vision.visionLeftWithGlass}/10)`}</p>
                                    <p>Mắt phải: {vision.visionRight}/10 {vision.visionRightWithGlass && `(Có kính: ${vision.visionRightWithGlass}/10)`}</p>
                                    {vision.visionDescription && <p>Mô tả: {vision.visionDescription}</p>}
                                  </div>
                                }
                              />
                            </List.Item>
                          )}
                          locale={{ emptyText: 'Chưa có thông tin thị lực' }}
                        />
                      </>
                    )
                  },
                  {
                    key: 'hearing',
                    label: 'Thính lực',
                    children: (
                      <>
                      <div style={{ marginBottom: '16px' }}>
                        {hearingData.length === 0 ? (
                              <Button
                                type="primary"
                                icon={<EyeOutlined />}
                                onClick={() => setHearingModalVisible(true)}
                              >
                                Thêm thông tin thính lực
                              </Button>
                            ) : (
                              <div>
                                <Alert
                                  message="Thông tin thính lực đã được khai báo"
                                  description="Bạn có thể xem chi tiết hoặc chỉnh sửa thông tin hiện có, nhưng không thể thêm mới."
                                  type="info"
                                  showIcon
                                  style={{ marginBottom: '12px' }}
                                />
                                <Button
                                  type="default"
                                  icon={<EyeOutlined />}
                                  disabled
                                  style={{ opacity: 0.6 }}
                                >
                                  Không thể thêm mới
                                </Button>
                              </div>
                            )}
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
                                  onClick={() => handleViewDetail(hearing, 'hearing')}
                                >
                                  Xem
                                </Button>,
                                <Button
                                  type="link"
                                  icon={<EditOutlined />}
                                  onClick={() => handleEditHearing(hearing)}
                                >
                                  Sửa
                                </Button>,
                                <Button
                                  type="link"
                                  danger
                                  icon={<DeleteOutlined />}
                                  onClick={() => handleRemoveHearing(hearing.id || hearing.tempId)}
                                >
                                  Xóa
                                </Button>
                              ]}
                            >
                              <List.Item.Meta
                                title={`Khám thính lực - ${dayjs(hearing.dateOfExamination).format('DD/MM/YYYY')}`}
                                description={
                                  <div>
                                    <p>Tai trái: {hearing.leftEar}/10</p>
                                    <p>Tai phải: {hearing.rightEar}/10</p>
                                    {hearing.description && <p>Mô tả: {hearing.description}</p>}
                                  </div>
                                }
                              />
                            </List.Item>
                          )}
                          locale={{ emptyText: 'Chưa có thông tin thính lực' }}
                        />
                      </>
                    )
                  },
                  {
                    key: 'infectious',
                    label: 'Bệnh truyền nhiễm',
                    children: (
                      <>
                        <div style={{ marginBottom: '16px' }}>
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
                                  onClick={() => handleViewDetail(disease, 'infectiousDisease')}
                                >
                                  Xem
                                </Button>,
                                <Button
                                  type="link"
                                  icon={<EditOutlined />}
                                  onClick={() => handleEditInfectiousDisease(disease)}
                                >
                                  Sửa
                                </Button>,
                                <Button
                                  type="link"
                                  danger
                                  icon={<DeleteOutlined />}
                                  onClick={() => handleRemoveInfectiousDisease(disease.id || disease.tempId)}
                                >
                                  Xóa
                                </Button>
                              ]}
                            >
                              <List.Item.Meta
                                title={disease.diseaseName}
                                description={
                                  <div>
                                    <p>{disease.description}</p>
                                    <Tag color={disease.status === 'ACTIVE' ? 'red' : 'green'}>
                                      {disease.status === 'ACTIVE' ? 'Đang điều trị' : 'Đã khỏi'}
                                    </Tag>
                                    {disease.dateDiagnosed && (
                                      <span style={{ marginLeft: '8px', color: '#666' }}>
                                        Chẩn đoán: {dayjs(disease.dateDiagnosed).format('DD/MM/YYYY')}
                                      </span>
                                    )}
                                    {disease.placeOfTreatment && (
                                      <p style={{ margin: '4px 0 0 0', color: '#666' }}>
                                        Nơi điều trị: {disease.placeOfTreatment}
                                      </p>
                                    )}
                                  </div>
                                }
                              />
                            </List.Item>
                          )}
                          locale={{ emptyText: 'Chưa có thông tin bệnh truyền nhiễm' }}
                        />
                      </>
                    )
                  }
                ]}
              />

              <Divider />
                <div style={{ textAlign: 'center' }}>
                <Space>                  <Button 
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
                        // Cancel creating new profile
                        setIsCreatingNewProfile(false);
                        form.resetFields();
                        setAllergies([]);
                        setChronicDiseases([]);
                        setInfectiousDiseases([]);
                        setTreatments([]);
                        setVaccinationHistory([]);
                        setVisionData([]);
                        setHearingData([]);
                      }
                    }}
                  >
                    {selectedProfile ? 'Hủy chỉnh sửa' : 'Hủy bỏ'}
                  </Button>                  
                  
                  <Button
                    type="primary"
                    size="large"
                    htmlType="submit"
                    loading={loading}
                    disabled={!selectedStudent || (selectedProfile && selectedProfile.status === 'REJECTED')}
                  >
                    {selectedProfile ? 
                      (selectedProfile.status === 'APPROVED' ? 'Cập nhật hồ sơ' : 'Cập nhật hồ sơ sức khỏe') 
                      : 'Tạo hồ sơ sức khỏe'}
                  </Button>
                </Space>
                {selectedProfile && selectedProfile.status === 'REJECTED' && (
                  <div style={{ marginTop: '8px', color: '#ff4d4f', fontSize: '14px' }}>
                    Không thể chỉnh sửa hồ sơ đã bị từ chối. Vui lòng tạo hồ sơ mới.
                  </div>
                )}
                {selectedProfile && selectedProfile.status === 'APPROVED' && (
                  <div style={{ marginTop: '8px', color: '#1890ff', fontSize: '14px' }}>
                     Khi cập nhật hồ sơ đã được duyệt, trạng thái sẽ chuyển về "Đang chờ duyệt" để Y tá kiểm tra lại.
                  </div>
                )}
              </div>
            </Form>
          </Card>
        )}        {/* Health Profiles Section */}
        {selectedStudent && (
          <Card title="Hồ sơ sức khỏe" style={{ marginBottom: '24px' }}>            
          <Alert
              message="Thông tin về quản lý hồ sơ"
              description="Bạn có thể chỉnh sửa hồ sơ có trạng thái 'Đang chờ duyệt' hoặc 'Đã duyệt'. Khi chỉnh sửa hồ sơ đã được duyệt, trạng thái sẽ tự động chuyển về 'Đang chờ duyệt' để Y tá kiểm tra lại. Hồ sơ bị từ chối chỉ có thể xem."
              type="info"
              showIcon
              style={{ marginBottom: '16px' }}
            />
            {healthProfiles.length === 0 || healthProfiles.some(profile => profile.status === 'PENDING') ? (
              <div style={{ marginBottom: '16px', textAlign: 'right' }}>
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
                    setActiveTab('basic');
                  }}
                >
                  Thêm hồ sơ sức khỏe
                </Button>
              </div>            
              ) : isCreatingNewProfileAllowed() ? (
              <div style={{ marginBottom: '16px', textAlign: 'right' }}>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setSelectedProfile(null);
                    setIsCreatingNewProfile(true);
                    form.resetFields();
                    setAllergies([]);
                    setChronicDiseases([]);
                    setInfectiousDiseases([]);
                    setTreatments([]);
                    setVaccinationHistory([]);
                    setVisionData([]);
                    setHearingData([]);
                    setActiveTab('basic');
                  }}
                >
                  Tạo lại hồ sơ sức khỏe
                </Button>
              </div>
            ) : (
              <div style={{ marginBottom: '16px' }}>
                <Alert
                  message="Hồ sơ sức khỏe đã tồn tại"
                  description="Bạn có thể xem hoặc chỉnh sửa hồ sơ sức khỏe hiện có bên dưới."
                  type="success"
                  showIcon
                  style={{ marginBottom: '16px' }}
                />
              </div>
            )}
            
            {profilesLoading ? (
              <Spin size="large" />
            ) : (              <Table
                dataSource={healthProfiles}
                rowKey="id"
                pagination={false}
                bordered                columns={[
                  {
                    title: 'STT',
                    key: 'index',
                    width: '8%',
                    render: (_, __, index) => index + 1
                  },
                  {
                    title: 'Ngày tạo',
                    key: 'createdAt',
                    width: '15%',
                    render: (_, profile) => dayjs(profile.createdAt).format('DD/MM/YYYY')
                  },
                  {
                    title: 'Trạng thái',
                    key: 'status',
                    width: '17%',
                    render: (_, profile) => (
                      <div>
                        <Tag color={
                          profile.status === 'PENDING' ? 'orange' : 
                          profile.status === 'APPROVED' ? 'green' : 
                          profile.status === 'REJECTED' ? 'red' : 'blue'
                        }>
                          {profile.status === 'PENDING' ? 'Đang chờ duyệt' : 
                            profile.status === 'APPROVED' ? 'Đã duyệt' : 
                            profile.status === 'REJECTED' ? 'Bị từ chối' : 'Không xác định'}
                        </Tag>
                      </div>
                    )
                  },
                  {
                    title: 'Ghi chú của Y tá',
                    key: 'nurseNote',
                    width: '35%',
                    render: (_, profile) => {
                      // Chỉ hiển thị ghi chú khi hồ sơ đã được duyệt hoặc bị từ chối
                      if (profile.status === 'APPROVED' || profile.status === 'REJECTED') {
                        return profile.nurseNote ? (
                          <div style={{ 
                            maxWidth: '300px',
                            wordWrap: 'break-word',
                            fontSize: '13px',
                            color: profile.status === 'REJECTED' ? '#ff4d4f' : '#52c41a'
                          }}>
                            {profile.nurseNote}
                          </div>
                        ) : (
                          <span style={{ color: '#999', fontStyle: 'italic' }}>
                            Không có ghi chú
                          </span>
                        );
                      }
                      // Không hiển thị gì cho trạng thái PENDING
                      return null;
                    }
                  },
                  {
                    title: 'Hành động',
                    key: 'actions',
                    width: '25%',                    render: (_, profile) => (
                      <Space size="middle">
                        <Button
                          type="link"
                          icon={<EditOutlined />}
                          onClick={() => handleProfileSelect(profile)}
                          disabled={profile.status === 'REJECTED'}
                          title={profile.status === 'APPROVED' ? 'Chỉnh sửa (sẽ chuyển về trạng thái chờ duyệt)' : 'Chỉnh sửa hồ sơ'}
                        >
                          
                        </Button>
                        <Button
                          type="link"
                          icon={<FileTextOutlined />}
                          onClick={() => handleViewProfileDetail(profile)}
                        />
                        {profile.status === 'PENDING' && (
                          <Popconfirm
                            title="Xóa hồ sơ sức khỏe"
                            description="Bạn có chắc chắn muốn xóa hồ sơ sức khỏe này?"
                            onConfirm={() => handleProfileDelete(profile.id)}
                            okText="Có"
                            cancelText="Không"
                          >
                            <Button type="link" danger icon={<DeleteOutlined />}>
                            </Button>
                          </Popconfirm>
                        )}
                      </Space>
                    )
                  }
                ]}
              />
            )}
          </Card>
        )}
      </Card>      
      {/* Allergy Modal */}      
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

      {/* Chronic Disease Modal */}      
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

      {/* Treatment Modal */}      
      <TreatmentModal
        open={treatmentModalVisible}
        onCancel={() => {
          setTreatmentModalVisible(false);
          setEditingTreatment(null);
        }}
        onSubmit={handleUpdateTreatment}
        initialData={editingTreatment}
        isEdit={!!editingTreatment}
      />      
      {/* Vaccination Modal */}      
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
      />      
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
          viewDetailType === 'allergy' ? 'dị ứng' :
          viewDetailType === 'chronicDisease' ? 'bệnh mãn tính' :
          viewDetailType === 'treatment' ? 'lịch sử điều trị' :
          viewDetailType === 'vaccination' ? 'tiêm chủng' :
          viewDetailType === 'vision' ? 'thị lực' :
          viewDetailType === 'hearing' ? 'thính lực' :
          viewDetailType === 'infectiousDisease' ? 'bệnh truyền nhiễm' :
          'thông tin sức khỏe'
        }`}
        open={viewDetailModalVisible}
        onCancel={() => setViewDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setViewDetailModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={600}
      >
        {viewDetailData && (
          <div>
            {viewDetailType === 'allergy' && (
              <div>
                <p><strong>Loại dị ứng:</strong> {viewDetailData.allergyType}</p>
                <p><strong>Mô tả:</strong> {viewDetailData.description}</p>
                <p><strong>Mức độ:</strong> 
                  <Tag color={
                    viewDetailData.status === 'MILD' ? 'green' : 
                    viewDetailData.status === 'MODERATE' ? 'orange' : 
                    viewDetailData.status === 'SEVERE' ? 'red' : 'blue'
                  }>
                    {
                      viewDetailData.status === 'MILD' ? 'Nhẹ' : 
                      viewDetailData.status === 'MODERATE' ? 'Trung bình' : 
                      viewDetailData.status === 'SEVERE' ? 'Nặng' : 'Không xác định'
                    }
                  </Tag>
                </p>
                {viewDetailData.onsetDate && (
                  <p><strong>Ngày khởi phát:</strong> {dayjs(viewDetailData.onsetDate).format('DD/MM/YYYY')}</p>
                )}
              </div>
            )}
            
            {viewDetailType === 'chronicDisease' && (
              <div>
                <p><strong>Tên bệnh:</strong> {viewDetailData.diseaseName}</p>
                <p><strong>Mô tả:</strong> {viewDetailData.description}</p>
                <p><strong>Trạng thái:</strong>
                  <Tag color={
                    viewDetailData.status === 'RECOVERED' ? 'green' : 
                    viewDetailData.status === 'UNDER_TREATMENT' ? 'orange' :
                    viewDetailData.status === 'STABLE' ? 'blue' :
                    viewDetailData.status === 'WORSENED' ? 'red' :
                    'default'
                  }>
                    {viewDetailData.status === 'UNDER_TREATMENT' ? 'Đang điều trị' : 
                     viewDetailData.status === 'RECOVERED' ? 'Đã khỏi' :
                     viewDetailData.status === 'STABLE' ? 'Ổn định' :
                     viewDetailData.status === 'WORSENED' ? 'Đang xấu đi' :
                     'Không xác định'}
                  </Tag>
                </p>
                {viewDetailData.dateDiagnosed && (
                  <p><strong>Ngày chẩn đoán:</strong> {dayjs(viewDetailData.dateDiagnosed).format('DD/MM/YYYY')}</p>
                )}
                {viewDetailData.placeOfTreatment && (
                  <p><strong>Nơi điều trị:</strong> {viewDetailData.placeOfTreatment}</p>
                )}
              </div>
            )}

            {viewDetailType === 'treatment' && (
              <div>
                <p><strong>Loại điều trị:</strong> {viewDetailData.treatmentType}</p>
                <p><strong>Mô tả:</strong> {viewDetailData.description}</p>
                <p><strong>Bác sĩ điều trị:</strong> {viewDetailData.doctorName}</p>
                {viewDetailData.dateOfAdmission && (
                  <p><strong>Ngày nhập viện:</strong> {dayjs(viewDetailData.dateOfAdmission).format('DD/MM/YYYY')}</p>
                )}
                {viewDetailData.dateOfDischarge && (
                  <p><strong>Ngày xuất viện:</strong> {dayjs(viewDetailData.dateOfDischarge).format('DD/MM/YYYY')}</p>
                )}
                {viewDetailData.placeOfTreatment && (
                  <p><strong>Nơi điều trị:</strong> {viewDetailData.placeOfTreatment}</p>
                )}
              </div>
            )}

            {viewDetailType === 'vaccination' && (
              <div>
                <p><strong>Tên vaccine:</strong> {viewDetailData.vaccineName}</p>
                <p><strong>Liều số:</strong> {viewDetailData.doseNumber}</p>
                <p><strong>Trạng thái:</strong>
                  <Tag color={viewDetailData.status === 'PENDING' ? 'orange' : 'green'}>
                    {viewDetailData.status === 'PENDING' ? 'Chưa hoàn thành' : 'Đã hoàn thành'}
                  </Tag>
                </p>
                {viewDetailData.dateOfVaccination && (
                  <p><strong>Ngày tiêm:</strong> {dayjs(viewDetailData.dateOfVaccination).format('DD/MM/YYYY')}</p>
                )}
                {viewDetailData.manufacturer && (
                  <p><strong>Nhà sản xuất:</strong> {viewDetailData.manufacturer}</p>
                )}
                {viewDetailData.placeOfVaccination && (
                  <p><strong>Nơi tiêm:</strong> {viewDetailData.placeOfVaccination}</p>
                )}
                {viewDetailData.administeredBy && (
                  <p><strong>Người tiêm:</strong> {viewDetailData.administeredBy}</p>
                )}
                {viewDetailData.notes && (
                  <p><strong>Ghi chú:</strong> {viewDetailData.notes}</p>
                )}
              </div>
            )}

            {viewDetailType === 'vision' && (
              <div>
                <p><strong>Ngày khám:</strong> {dayjs(viewDetailData.dateOfExamination).format('DD/MM/YYYY')}</p>
                <p><strong>Thị lực mắt trái:</strong> {viewDetailData.visionLeft}/10</p>
                <p><strong>Thị lực mắt phải:</strong> {viewDetailData.visionRight}/10</p>
                {viewDetailData.visionLeftWithGlass && (
                  <p><strong>Thị lực mắt trái (có kính):</strong> {viewDetailData.visionLeftWithGlass}/10</p>
                )}
                {viewDetailData.visionRightWithGlass && (
                  <p><strong>Thị lực mắt phải (có kính):</strong> {viewDetailData.visionRightWithGlass}/10</p>
                )}
                {viewDetailData.visionDescription && (
                  <p><strong>Mô tả:</strong> {viewDetailData.visionDescription}</p>
                )}
              </div>
            )}

            {viewDetailType === 'hearing' && (
              <div>
                <p><strong>Ngày khám:</strong> {dayjs(viewDetailData.dateOfExamination).format('DD/MM/YYYY')}</p>
                <p><strong>Thính lực tai trái:</strong> {viewDetailData.leftEar}%</p>
                <p><strong>Thính lực tai phải:</strong> {viewDetailData.rightEar}%</p>
                {viewDetailData.description && (
                  <p><strong>Mô tả:</strong> {viewDetailData.description}</p>
                )}
              </div>
            )}

            {viewDetailType === 'infectiousDisease' && (
              <div>
                <p><strong>Tên bệnh:</strong> {viewDetailData.diseaseName}</p>
                <p><strong>Mô tả:</strong> {viewDetailData.description}</p>
                <p><strong>Trạng thái:</strong>
                  <Tag color={viewDetailData.status === 'ACTIVE' ? 'red' : 'green'}>
                    {viewDetailData.status === 'ACTIVE' ? 'Đang điều trị' : 'Đã khỏi'}
                  </Tag>
                </p>
                {viewDetailData.dateDiagnosed && (
                  <p><strong>Ngày chẩn đoán:</strong> {dayjs(viewDetailData.dateDiagnosed).format('DD/MM/YYYY')}</p>
                )}
                {viewDetailData.placeOfTreatment && (
                  <p><strong>Nơi điều trị:</strong> {viewDetailData.placeOfTreatment}</p>
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
const AllergyModal = ({ open, onCancel, onSubmit, initialData = null, isEdit = false }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  // Pre-fill form when in edit mode
  React.useEffect(() => {
    if (open && isEdit && initialData) {
      form.setFieldsValue({
        allergyType: initialData.allergyType,
        description: initialData.description,
        status: initialData.status,
        onsetDate: initialData.onsetDate && initialData.onsetDate !== 'null' && initialData.onsetDate !== '' ? dayjs(initialData.onsetDate) : null
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
        onsetDate: values.onsetDate ? values.onsetDate.format('YYYY-MM-DD') : null
      };
      
      onSubmit(formattedValues);
      onCancel(); // Close modal first
      form.resetFields(); // Then reset fields after modal is closed
    } catch (error) {
      console.error('Validation error:', error);    
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
          rules={[{ required: true, message: 'Vui lòng nhập loại dị ứng' }]}
        >
          <Input placeholder="Ví dụ: Phấn hoa, Thức ăn, Thuốc..." />
        </Form.Item>
        
        <Form.Item
          name="description"
          label="Mô tả chi tiết"
          rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
        >
          <TextArea rows={3} placeholder="Mô tả triệu chứng và mức độ nghiêm trọng..." />
        </Form.Item>
          <Form.Item
          name="status"
          label="Mức độ dị ứng"
          rules={[{ required: true, message: 'Vui lòng chọn mức độ dị ứng' }]}
        >
          <Select placeholder="Chọn mức độ dị ứng">
            <Option value="MILD">Nhẹ</Option>
            <Option value="MODERATE">Trung bình</Option>
            <Option value="SEVERE">Nặng</Option>
          </Select>
        </Form.Item>
          <Form.Item
          name="onsetDate"
          label="Ngày bắt đầu"
        >          <DatePicker 
            style={{ width: '100%' }} 
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
const ChronicDiseaseModal = ({ open, onCancel, onSubmit, initialData, isEdit }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  // Pre-fill form when editing
  React.useEffect(() => {
    if (isEdit && initialData && open) {
      const formData = {
        ...initialData,
        dateDiagnosed: initialData.dateDiagnosed && initialData.dateDiagnosed !== 'null' && initialData.dateDiagnosed !== '' ? dayjs(initialData.dateDiagnosed) : null,
        dateResolved: initialData.dateResolved && initialData.dateResolved !== 'null' && initialData.dateResolved !== '' ? dayjs(initialData.dateResolved) : null,
        dateOfAdmission: initialData.dateOfAdmission && initialData.dateOfAdmission !== 'null' && initialData.dateOfAdmission !== '' ? dayjs(initialData.dateOfAdmission) : null,
        dateOfDischarge: initialData.dateOfDischarge && initialData.dateOfDischarge !== 'null' && initialData.dateOfDischarge !== '' ? dayjs(initialData.dateOfDischarge) : null
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
        dateDiagnosed: values.dateDiagnosed ? values.dateDiagnosed.format('YYYY-MM-DD') : null,
        dateResolved: values.dateResolved ? values.dateResolved.format('YYYY-MM-DD') : null,
        dateOfAdmission: values.dateOfAdmission ? values.dateOfAdmission.format('YYYY-MM-DD') : null,
        dateOfDischarge: values.dateOfDischarge ? values.dateOfDischarge.format('YYYY-MM-DD') : null
      };
      
      onSubmit(formattedValues);
      // Only reset fields after successful submission and modal closure
      onCancel(); // Close modal first
      form.resetFields(); // Then reset fields after modal is closed
    } catch (error) {
      console.error('Validation error:', error);    } finally {
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
          rules={[{ required: true, message: 'Vui lòng nhập tên bệnh' }]}
        >
          <Input placeholder="Ví dụ: Hen suyễn, Tiểu đường, Tim mạch..." />
        </Form.Item>
        
        <Form.Item
          name="description"
          label="Mô tả tình trạng"
          rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
        >
          <TextArea rows={3} placeholder="Mô tả tình trạng bệnh, mức độ nghiêm trọng..." />
        </Form.Item>
        
        <Form.Item
          name="placeOfTreatment"
          label="Nơi điều trị"
        >
          <Input placeholder="Tên bệnh viện, phòng khám..." />
        </Form.Item>
          <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="dateDiagnosed"
              label="Ngày chẩn đoán"
            >              <DatePicker 
                style={{ width: '100%' }} 
                placeholder="Chọn ngày chẩn đoán" 
                format="DD/MM/YYYY"
                disabledDate={disabledDateAfterToday}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="dateResolved"              label="Ngày khỏi bệnh"
            >
              <DatePicker 
                style={{ width: '100%' }} 
                placeholder="Chọn ngày khỏi bệnh" 
                format="DD/MM/YYYY"
                disabledDate={disabledDateAfterToday}
              />
            </Form.Item>
          </Col>
        </Row>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="dateOfAdmission"
              label="Ngày nhập viện"
            >              <DatePicker 
                style={{ width: '100%' }} 
                placeholder="Ngày nhập viện" 
                format="DD/MM/YYYY"
                disabledDate={disabledDateAfterToday}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="dateOfDischarge"
              label="Ngày xuất viện"
            >
              <DatePicker 
                style={{ width: '100%' }} 
                placeholder="Ngày xuất viện" 
                format="DD/MM/YYYY"
                disabledDate={disabledDateAfterToday}
              />
            </Form.Item>
          </Col>
        </Row>
        
        <Form.Item          name="status"
          label="Tình trạng điều trị"
          rules={[{ required: true, message: 'Vui lòng chọn tình trạng' }]}
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
        startDate: initialData.dateOfAdmission && initialData.dateOfAdmission !== 'null' && initialData.dateOfAdmission !== '' ? dayjs(initialData.dateOfAdmission) : null,
        endDate: initialData.dateOfDischarge && initialData.dateOfDischarge !== 'null' && initialData.dateOfDischarge !== '' ? dayjs(initialData.dateOfDischarge) : null
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
        dateOfAdmission: values.startDate ? values.startDate.format('YYYY-MM-DD') : null,
        dateOfDischarge: values.endDate ? values.endDate.format('YYYY-MM-DD') : null
      };
      
      // Remove the frontend field names that don't match backend
      delete formattedValues.startDate;
      delete formattedValues.endDate;
      
      onSubmit(formattedValues);
      // Only reset fields after successful submission and modal closure
      onCancel(); // Close modal after successful submission
      form.resetFields(); // Reset fields after modal is closed
    } catch (error) {
      console.error('Validation error:', error);
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
          rules={[{ required: true, message: 'Vui lòng nhập loại điều trị' }]}
        >
          <Input placeholder="Ví dụ: Khám bệnh, Phẫu thuật, Điều trị nội khoa..." />
        </Form.Item>
        
        <Form.Item
          name="description"
          label="Mô tả chi tiết"
          rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
        >
          <TextArea rows={3} placeholder="Mô tả quá trình điều trị, kết quả..." />
        </Form.Item>
          <Form.Item
          name="doctorName"
          label="Bác sĩ điều trị"
        >
          <Input placeholder="Tên bác sĩ điều trị" />
        </Form.Item>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="startDate"
              label="Ngày bắt đầu"
              rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu' }]}
            >              <DatePicker 
                style={{ width: '100%' }} 
                placeholder="Ngày bắt đầu điều trị" 
                format="DD/MM/YYYY"
                disabledDate={disabledDateAfterToday}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="endDate"
              label="Ngày kết thúc"
            >              <DatePicker 
                style={{ width: '100%' }} 
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
          rules={[{ required: true, message: 'Vui lòng nhập tên bệnh viện hoặc cơ sở y tế' }]}
        >
          <Input placeholder="Tên bệnh viện hoặc cơ sở y tế" />
        </Form.Item>
        
        <Form.Item
          name="status"
          label="Tình trạng điều trị"
          rules={[{ required: true, message: 'Vui lòng chọn tình trạng điều trị' }]}
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
  isEdit
}) => {
  const [form] = Form.useForm();
  // Pre-fill form when editing
  React.useEffect(() => {
    if (isEdit && initialData && open) {
      const formData = {
        ...initialData,
        dateOfVaccination: initialData.dateOfVaccination && initialData.dateOfVaccination !== 'null' && initialData.dateOfVaccination !== '' ? dayjs(initialData.dateOfVaccination) : null
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
      console.log('Original form values:', values);
      console.log('Original dateOfVaccination:', values.dateOfVaccination);
      
      // Format date field to YYYY-MM-DD format before submission
      const formattedValues = {
        ...values,
        dateOfVaccination: values.dateOfVaccination ? values.dateOfVaccination.format('YYYY-MM-DD') : null
      };
      
      // Debug logging to check the formatted values
      console.log('Formatted values being submitted:', formattedValues);
      console.log('Formatted dateOfVaccination:', formattedValues.dateOfVaccination);
      
      onSubmit(formattedValues);
      form.resetFields();
    } catch (error) {
      console.error('Validation error:', error);
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
        </Button>
      ]}
    >      {showVaccinationRules && (
        <div style={{ marginBottom: 16, padding: 16, border: '1px solid #d9d9d9', borderRadius: 6 }}>
          <h4>Chọn quy tắc tiêm chủng (chỉ được chọn 1 quy tắc):</h4>
          <Radio.Group 
            value={selectedVaccinationRule?.id || null} 
            onChange={(e) => onRuleSelection(e.target.value)}
            style={{ width: '100%' }}
          >
            <div style={{ maxHeight: 200, overflowY: 'auto' }}>
              {vaccinationRules.map(rule => (
                <div key={rule.id} style={{ marginBottom: 12, padding: 8, border: '1px solid #f0f0f0', borderRadius: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <Radio value={rule.id}>
                        <strong>{rule.name}</strong> - Liều {rule.doesNumber || 1}
                        {rule.isMandatory && <span style={{ color: 'red' }}> (Bắt buộc)</span>}
                      </Radio>
                      <div style={{ fontSize: '12px', color: '#666', marginLeft: 24 }}>
                        {rule.description}
                        {rule.minAge !== undefined && rule.maxAge !== undefined && (
                          <span> | Độ tuổi: {rule.minAge}-{rule.maxAge} tháng</span>
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
          rules={[{ required: true, message: 'Vui lòng nhập tên vaccine' }]}
        >
          <Input placeholder="Ví dụ: BCG, DPT, MMR, Viêm gan B..." />
        </Form.Item>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="doseNumber"
              label="Liều số"
              rules={[{ required: true, message: 'Vui lòng nhập liều số' }]}
            >
              <InputNumber style={{ width: '100%' }} placeholder="Liều thứ mấy" min={1} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="dateOfVaccination"
              label="Ngày tiêm"
              rules={[{ required: true, message: 'Vui lòng chọn ngày tiêm' }]}
            >
              <DatePicker                style={{ width: '100%' }} 
                placeholder="Chọn ngày tiêm" 
                format="DD/MM/YYYY"
                disabledDate={disabledDateAfterToday}
              />
            </Form.Item>
          </Col>
        </Row>
        
        <Form.Item
          name="manufacturer"
          label="Nhà sản xuất"
        >
          <Input placeholder="Tên nhà sản xuất vaccine" />
        </Form.Item>
        
        <Form.Item
          name="placeOfVaccination"
          label="Nơi tiêm"
          rules={[{ required: true, message: 'Vui lòng nhập nơi tiêm' }]}
        >
          <Input placeholder="Tên bệnh viện, phòng khám, trạm y tế..." />
        </Form.Item>
        
        <Form.Item
          name="administeredBy"
          label="Người tiêm"
        >
          <Input placeholder="Tên bác sĩ, y tá thực hiện tiêm" />
        </Form.Item>
        
        <Form.Item
          name="notes"
          label="Ghi chú"
        >
          <TextArea rows={2} placeholder="Ghi chú thêm về phản ứng, tác dụng phụ..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};

// Vision Modal Component
const VisionModal = ({ open, onCancel, onSubmit, initialData, isEdit = false }) => {
  const [form] = Form.useForm();

  // Pre-fill form when editing
  React.useEffect(() => {
    if (isEdit && initialData && open) {
      const formData = {
        ...initialData,
        dateOfExamination: initialData.dateOfExamination && 
                          initialData.dateOfExamination !== 'null' && 
                          initialData.dateOfExamination !== '' 
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
      console.error('Validation error:', error);
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
              rules={[{ required: true, message: 'Vui lòng nhập thị lực mắt trái' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
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
              rules={[{ required: true, message: 'Vui lòng nhập thị lực mắt phải' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
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
                style={{ width: '100%' }}
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
                style={{ width: '100%' }}
                placeholder="Ví dụ: 10"
                min={0}
                max={10}
                step={1}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="dateOfExamination"
          label="Ngày khám"
        >              <DatePicker 
                style={{ width: '100%' }} 
                placeholder="Chọn ngày khám thị lực" 
                format="DD/MM/YYYY"
                disabledDate={disabledDateAfterToday}
              />
        </Form.Item>

        <Form.Item
          name="visionDescription"
          label="Mô tả thêm"
        >
          <TextArea rows={3} placeholder="Ghi chú về tình trạng mắt, cần đeo kính, bệnh về mắt..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};

// Hearing Modal Component
const HearingModal = ({ open, onCancel, onSubmit, initialData, isEdit = false }) => {
  const [form] = Form.useForm();

  // Pre-fill form when editing
  React.useEffect(() => {
    if (isEdit && initialData && open) {
      const formData = {
        ...initialData,
        dateOfExamination: initialData.dateOfExamination && 
                          initialData.dateOfExamination !== 'null' && 
                          initialData.dateOfExamination !== '' 
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
      console.error('Validation error:', error);
    }
  };

  return (
    <Modal
      title={isEdit ? "Chỉnh sửa thông tin thính lực" : "Thêm thông tin thính lực"}
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
              rules={[{ required: true, message: 'Vui lòng nhập thính lực tai trái' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
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
              rules={[{ required: true, message: 'Vui lòng nhập thính lực tai phải' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="Ví dụ: 8"
                min={0}
                max={10}
                step={1}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="dateOfExamination"
          label="Ngày khám"
        >              <DatePicker 
                style={{ width: '100%' }} 
                placeholder="Chọn ngày khám thính lực" 
                format="DD/MM/YYYY"
                disabledDate={disabledDateAfterToday}
              />
        </Form.Item>

        <Form.Item
          name="description"
          label="Mô tả thêm"
        >
          <TextArea rows={3} placeholder="Ghi chú về tình trạng tai, nghe kém, viêm tai..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};

// Infectious Disease Modal Component
const InfectiousDiseaseModal = ({ open, onCancel, onSubmit, initialData, isEdit }) => {
  const [form] = Form.useForm();

  // Pre-fill form when editing
  React.useEffect(() => {
    if (isEdit && initialData && open) {
      const formData = {
        ...initialData,
        dateDiagnosed: initialData.dateDiagnosed && initialData.dateDiagnosed !== 'null' && initialData.dateDiagnosed !== '' ? dayjs(initialData.dateDiagnosed) : null,
        dateResolved: initialData.dateResolved && initialData.dateResolved !== 'null' && initialData.dateResolved !== '' ? dayjs(initialData.dateResolved) : null,
        dateOfAdmission: initialData.dateOfAdmission && initialData.dateOfAdmission !== 'null' && initialData.dateOfAdmission !== '' ? dayjs(initialData.dateOfAdmission) : null,
        dateOfDischarge: initialData.dateOfDischarge && initialData.dateOfDischarge !== 'null' && initialData.dateOfDischarge !== '' ? dayjs(initialData.dateOfDischarge) : null
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
      console.error('Validation error:', error);  
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
          rules={[{ required: true, message: 'Vui lòng nhập tên bệnh' }]}
        >
          <Input placeholder="Ví dụ: Sốt xuất huyết, Tay chân miệng, Thủy đậu..." />
        </Form.Item>

        <Form.Item
          name="description"
          label="Mô tả tình trạng"
          rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
        >
          <TextArea rows={3} placeholder="Mô tả triệu chứng, mức độ nghiêm trọng..." />
        </Form.Item>        <Row gutter={16}>
          <Col span={12}>            <Form.Item
              name="dateDiagnosed"
              label="Ngày chẩn đoán"
              rules={[{ required: true, message: 'Vui lòng chọn ngày chẩn đoán' }]}
            >
              <DatePicker 
                style={{ width: '100%' }} 
                placeholder="Chọn ngày chẩn đoán" 
                format="DD/MM/YYYY"
                disabledDate={disabledDateAfterToday}
              />
            </Form.Item>
          </Col>          <Col span={12}>
            <Form.Item
              name="dateResolved"
              label="Ngày khỏi bệnh"
            >
              <DatePicker 
                style={{ width: '100%' }} 
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
          rules={[{ required: true, message: 'Vui lòng nhập nơi điều trị' }]}
        >          <Input placeholder="Tên bệnh viện, phòng khám..." />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>            <Form.Item
              name="dateOfAdmission"
              label="Ngày nhập viện"
            >
              <DatePicker 
                style={{ width: '100%' }} 
                placeholder="Ngày nhập viện" 
                format="DD/MM/YYYY"
                disabledDate={disabledDateAfterToday}
              />
            </Form.Item>
          </Col>
          <Col span={12}>            <Form.Item
              name="dateOfDischarge"
              label="Ngày xuất viện"
            >
              <DatePicker 
                style={{ width: '100%' }} 
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
          rules={[{ required: true, message: 'Vui lòng chọn tình trạng' }]}
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

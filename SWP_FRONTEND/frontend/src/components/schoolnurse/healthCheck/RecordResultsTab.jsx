import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  InputNumber, 
  Select, 
  Checkbox, 
  Button, 
  Row, 
  Col, 
  Typography, 
  Space, 
  Divider, 
  Spin, 
  Alert,
  message,
  Avatar,
  Badge,
  Table,
  Modal,
  Tag
} from 'antd';
import { 
  EyeOutlined, 
  AudioOutlined, 
  SmileOutlined, 
  SkinOutlined, 
  HeartOutlined,
  UserOutlined,
  MedicineBoxOutlined,
  EditOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import healthCheckApi from '../../../api/healthCheckApi';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const RecordResultsTab = ({ campaign, campaignId, onRefreshData }) => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedStudents, setConfirmedStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState('record'); // 'record' or 'view'
  const [existingResults, setExistingResults] = useState({});

  // Fetch confirmed students and existing results when component mounts
  useEffect(() => {
    const fetchData = async () => {
      if (!campaignId) return;
      
      setLoadingStudents(true);
      console.log('Making API call to getConfirmedStudents with campaignId:', campaignId);
      try {
        // Fetch confirmed students
        const students = await healthCheckApi.getConfirmedStudents(campaignId);
        console.log('API call successful - confirmed students response:', students);
        setConfirmedStudents(students || []);
        
        // Fetch existing health check results
        console.log('Fetching existing health check results for campaign:', campaignId);
        const results = await healthCheckApi.getCampaignResults(campaignId);
        console.log('Existing results response:', results);
        
        // Create a map of studentId -> true for students who have results
        const resultsMap = {};
        if (results && Array.isArray(results)) {
          results.forEach(result => {
            if (result.studentID) {
              resultsMap[result.studentID] = result;
              console.log(`Student ${result.studentID} has existing results:`, result);
            }
          });
        }
        console.log('Final existingResults map:', resultsMap);
        setExistingResults(resultsMap);
      } catch (error) {
        console.error('Error fetching data:', error);
        message.error('Không thể tải danh sách học sinh đã xác nhận');
        setConfirmedStudents([]);
        setExistingResults({});
      } finally {
        setLoadingStudents(false);
      }
    };

    fetchData();
  }, [campaignId]);

  // Handle opening record/view modal
  const handleRecordResult = (student) => {
    setSelectedStudent(student);
    setModalMode('record');
    setIsModalVisible(true);
    
    // Initialize form data
    if (campaign?.categories) {
      const initialData = {
        weight: '',
        height: ''
      };
      campaign.categories.forEach(category => {
        initialData[category] = getInitialCategoryData(category);
      });
      setFormData(initialData);
    }
  };

  const handleViewResult = (student) => {
    setSelectedStudent(student);
    setModalMode('view');
    setIsModalVisible(true);
    
    // Load existing results for this student
    const studentResults = existingResults[student.studentID];
    console.log('Loading existing results for student:', student.studentID, studentResults);
    
    if (studentResults) {
      // Populate form data with existing results
      const loadedData = {
        weight: studentResults.weight || (studentResults.overallResults?.weight) || '',
        height: studentResults.height || (studentResults.overallResults?.height) || ''
      };
      
      // Load category-specific data if available
      if (campaign?.categories) {
        campaign.categories.forEach(category => {
          console.log(`Processing category ${category} for student ${student.studentID}`);
          
          let categoryData = null;
          
          // The backend returns category data in the 'results' object with category name as key
          if (studentResults.results && studentResults.results[category]) {
            categoryData = studentResults.results[category];
            console.log(`Found category data in results.${category}:`, categoryData);
          }
          // Fallback: try direct category key
          else if (studentResults[category]) {
            categoryData = studentResults[category];
            console.log(`Found category data with direct key ${category}:`, categoryData);
          }
          
          if (categoryData) {
            // Map the backend data to frontend form structure
            const mappedData = { ...getInitialCategoryData(category) };
            
            // Map common fields
            if (categoryData.doctorName) mappedData.doctorName = categoryData.doctorName;
            if (categoryData.isAbnormal !== undefined) mappedData.isAbnormal = categoryData.isAbnormal;
            if (categoryData.recommendations) mappedData.recommendations = categoryData.recommendations;
            if (categoryData.dateOfExamination) mappedData.dateOfExamination = categoryData.dateOfExamination;
            
            // Map category-specific fields based on category type
            if (category === 'VISION') {
              if (categoryData.visionLeft !== undefined) mappedData.visionLeft = categoryData.visionLeft;
              if (categoryData.visionRight !== undefined) mappedData.visionRight = categoryData.visionRight;
              if (categoryData.visionLeftWithGlass !== undefined) mappedData.visionLeftWithGlass = categoryData.visionLeftWithGlass;
              if (categoryData.visionRightWithGlass !== undefined) mappedData.visionRightWithGlass = categoryData.visionRightWithGlass;
              if (categoryData.visionDescription) mappedData.visionDescription = categoryData.visionDescription;
              if (categoryData.colorVision) mappedData.colorVision = categoryData.colorVision;
              if (categoryData.eyeMovement) mappedData.eyeMovement = categoryData.eyeMovement;
              if (categoryData.eyePressure !== undefined) mappedData.eyePressure = categoryData.eyePressure;
              if (categoryData.needsGlasses !== undefined) mappedData.needsGlasses = categoryData.needsGlasses;
            } else if (category === 'HEARING') {
              if (categoryData.leftEar !== undefined) mappedData.leftEar = categoryData.leftEar;
              if (categoryData.rightEar !== undefined) mappedData.rightEar = categoryData.rightEar;
              if (categoryData.description) mappedData.description = categoryData.description;
              if (categoryData.hearingAcuity) mappedData.hearingAcuity = categoryData.hearingAcuity;
              if (categoryData.tympanometry) mappedData.tympanometry = categoryData.tympanometry;
              if (categoryData.earWaxPresent !== undefined) mappedData.earWaxPresent = categoryData.earWaxPresent;
              if (categoryData.earInfection !== undefined) mappedData.earInfection = categoryData.earInfection;
            } else if (category === 'ORAL') {
              if (categoryData.teethCondition) mappedData.teethCondition = categoryData.teethCondition;
              if (categoryData.gumsCondition) mappedData.gumsCondition = categoryData.gumsCondition;
              if (categoryData.tongueCondition) mappedData.tongueCondition = categoryData.tongueCondition;
              if (categoryData.description) mappedData.description = categoryData.description;
              if (categoryData.oralHygiene) mappedData.oralHygiene = categoryData.oralHygiene;
              if (categoryData.cavitiesCount !== undefined) mappedData.cavitiesCount = categoryData.cavitiesCount;
              if (categoryData.plaquePresent !== undefined) mappedData.plaquePresent = categoryData.plaquePresent;
              if (categoryData.gingivitis !== undefined) mappedData.gingivitis = categoryData.gingivitis;
              if (categoryData.mouthUlcers !== undefined) mappedData.mouthUlcers = categoryData.mouthUlcers;
            } else if (category === 'SKIN') {
              if (categoryData.skinColor) mappedData.skinColor = categoryData.skinColor;
              if (categoryData.rashes !== undefined) mappedData.rashes = categoryData.rashes;
              if (categoryData.lesions !== undefined) mappedData.lesions = categoryData.lesions;
              if (categoryData.dryness !== undefined) mappedData.dryness = categoryData.dryness;
              if (categoryData.eczema !== undefined) mappedData.eczema = categoryData.eczema;
              if (categoryData.psoriasis !== undefined) mappedData.psoriasis = categoryData.psoriasis;
              if (categoryData.skinInfection !== undefined) mappedData.skinInfection = categoryData.skinInfection;
              if (categoryData.allergies !== undefined) mappedData.allergies = categoryData.allergies;
              if (categoryData.acne !== undefined) mappedData.acne = categoryData.acne;
              if (categoryData.scars !== undefined) mappedData.scars = categoryData.scars;
              if (categoryData.birthmarks !== undefined) mappedData.birthmarks = categoryData.birthmarks;
              if (categoryData.skinTone) mappedData.skinTone = categoryData.skinTone;
              if (categoryData.description) mappedData.description = categoryData.description;
              if (categoryData.treatment) mappedData.treatment = categoryData.treatment;
              if (categoryData.followUpDate) mappedData.followUpDate = categoryData.followUpDate;
            } else if (category === 'RESPIRATORY') {
              if (categoryData.breathingRate !== undefined) mappedData.breathingRate = categoryData.breathingRate;
              if (categoryData.breathingSound) mappedData.breathingSound = categoryData.breathingSound;
              if (categoryData.wheezing !== undefined) mappedData.wheezing = categoryData.wheezing;
              if (categoryData.cough !== undefined) mappedData.cough = categoryData.cough;
              if (categoryData.breathingDifficulty !== undefined) mappedData.breathingDifficulty = categoryData.breathingDifficulty;
              if (categoryData.oxygenSaturation !== undefined) mappedData.oxygenSaturation = categoryData.oxygenSaturation;
              if (categoryData.chestExpansion) mappedData.chestExpansion = categoryData.chestExpansion;
              if (categoryData.lungSounds) mappedData.lungSounds = categoryData.lungSounds;
              if (categoryData.asthmaHistory !== undefined) mappedData.asthmaHistory = categoryData.asthmaHistory;
              if (categoryData.allergicRhinitis !== undefined) mappedData.allergicRhinitis = categoryData.allergicRhinitis;
              if (categoryData.treatment) mappedData.treatment = categoryData.treatment;
              if (categoryData.description) mappedData.description = categoryData.description;
              if (categoryData.followUpDate) mappedData.followUpDate = categoryData.followUpDate;
            }
            
            loadedData[category] = mappedData;
            console.log(`Mapped category data for ${category}:`, mappedData);
          } else {
            console.log(`No existing data found for category ${category}, using initial data`);
            loadedData[category] = getInitialCategoryData(category);
          }
        });
      }
      
      console.log('Final loaded data for view mode:', loadedData);
      setFormData(loadedData);
    } else {
      console.log('No existing results found for student:', student.studentID);
      // Initialize with empty data
      const initialData = {
        weight: '',
        height: ''
      };
      if (campaign?.categories) {
        campaign.categories.forEach(category => {
          initialData[category] = getInitialCategoryData(category);
        });
      }
      setFormData(initialData);
    }
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedStudent(null);
    setFormData({});
  };

  // Check if student has existing results
  const hasExistingResults = (studentId) => {
    return existingResults[studentId] || false;
  };

  // Table columns definition
  const columns = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_, __, index) => index + 1,
      align: 'center',
    },
    {
      title: 'Họ và tên',
      dataIndex: 'fullName',
      key: 'fullName',
      width: 200,
      render: (text) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          <span style={{ fontWeight: 500 }}>{text}</span>
        </Space>
      ),
    },
    {
      title: 'Lớp',
      dataIndex: 'className',
      key: 'className',
      width: 100,
      align: 'center',
    },
    {
      title: 'Ngày sinh',
      dataIndex: 'dateOfBirth',
      key: 'dateOfBirth',
      width: 120,
      render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : 'N/A',
      align: 'center',
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 120,
      render: (_, record) => {
        const hasResults = hasExistingResults(record.studentID);
        return hasResults ? (
          <Tag color="success" icon={<CheckCircleOutlined />}>
            Đã khám
          </Tag>
        ) : (
          <Tag color="processing">
            Chờ khám
          </Tag>
        );
      },
      align: 'center',
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 150,
      render: (_, record) => {
        const hasResults = hasExistingResults(record.studentID);
        return (
          <Space>
            {hasResults ? (
              <Button 
                type="primary" 
                icon={<EyeOutlined />}
                onClick={() => handleViewResult(record)}
                size="small"
              >
                Xem kết quả
              </Button>
            ) : (
              <Button 
                type="primary" 
                icon={<EditOutlined />}
                onClick={() => handleRecordResult(record)}
                size="small"
              >
                Ghi kết quả
              </Button>
            )}
          </Space>
        );
      },
      align: 'center',
    },
  ];

  const getInitialCategoryData = (category) => {
    switch (category) {
      case 'VISION':
        return {
          visionLeft: '',
          visionRight: '',
          visionLeftWithGlass: '',
          visionRightWithGlass: '',
          visionDescription: '',
          doctorName: '',
          colorVision: 'NORMAL',
          eyeMovement: 'NORMAL',
          eyePressure: '',
          needsGlasses: false,
          isAbnormal: false,
          recommendations: '',
          dateOfExamination: new Date().toISOString().split('T')[0]
        };
      case 'HEARING':
        return {
          leftEar: '',
          rightEar: '',
          description: '',
          doctorName: '',
          hearingAcuity: 'NORMAL',
          tympanometry: 'NORMAL',
          earWaxPresent: false,
          earInfection: false,
          isAbnormal: false,
          recommendations: '',
          dateOfExamination: new Date().toISOString().split('T')[0]
        };
      case 'ORAL':
        return {
          teethCondition: '',
          gumsCondition: '',
          tongueCondition: '',
          description: '',
          doctorName: '',
          oralHygiene: 'GOOD',
          cavitiesCount: 0,
          plaquePresent: false,
          gingivitis: false,
          mouthUlcers: false,
          isAbnormal: false,
          recommendations: '',
          dateOfExamination: new Date().toISOString().split('T')[0]
        };
      case 'SKIN':
        return {
          skinColor: '',
          rashes: false,
          lesions: false,
          dryness: false,
          eczema: false,
          psoriasis: false,
          skinInfection: false,
          allergies: false,
          description: '',
          treatment: '',
          doctorName: '',
          acne: false,
          scars: false,
          birthmarks: false,
          skinTone: 'NORMAL',
          isAbnormal: false,
          recommendations: '',
          followUpDate: '',
          dateOfExamination: new Date().toISOString().split('T')[0]
        };
      case 'RESPIRATORY':
        return {
          breathingRate: '',
          breathingSound: '',
          wheezing: false,
          cough: false,
          breathingDifficulty: false,
          oxygenSaturation: '',
          treatment: '',
          description: '',
          doctorName: '',
          chestExpansion: 'NORMAL',
          lungSounds: 'CLEAR',
          asthmaHistory: false,
          allergicRhinitis: false,
          isAbnormal: false,
          recommendations: '',
          followUpDate: '',
          dateOfExamination: new Date().toISOString().split('T')[0]
        };
      default:
        return {};
    }
  };

  const handleInputChange = (category, field, value) => {
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  const renderVisionForm = (categoryData) => (
    <Card 
      className="mb-6"
      style={{ 
        background: 'linear-gradient(135deg, #e3f2fd 0%, #e8eaf6 100%)',
        border: '1px solid #2196f3'
      }}
    >
      <div className="mb-6">
        <Space align="center" size="middle">
          <Avatar 
            size={40} 
            icon={<EyeOutlined />} 
            style={{ backgroundColor: '#1976d2' }}
          />
          <Title level={3} style={{ margin: 0, color: '#1976d2' }}>
            Thị lực (Vision)
          </Title>
        </Space>
      </div>
      
      <Row gutter={[24, 24]}>
        {/* Vision Tests */}
        <Col xs={24} md={8}>
          <Card 
            title={<Text strong>Độ thị lực</Text>}
            size="small"
            className="h-full"
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong style={{ color: '#d32f2f' }}>Thị lực mắt trái (không kính) *</Text>
                <InputNumber
                  min={0}
                  max={20}
                  step={0.1}
                  value={categoryData.visionLeft}
                  onChange={(value) => handleInputChange('VISION', 'visionLeft', value || 0)}
                  placeholder="Ví dụ: 10/10"
                  style={{ width: '100%', marginTop: 4 }}
                />
              </div>
              
              <div>
                <Text strong style={{ color: '#d32f2f' }}>Thị lực mắt phải (không kính) *</Text>
                <InputNumber
                  min={0}
                  max={20}
                  step={0.1}
                  value={categoryData.visionRight}
                  onChange={(value) => handleInputChange('VISION', 'visionRight', value || 0)}
                  placeholder="Ví dụ: 10/10"
                  style={{ width: '100%', marginTop: 4 }}
                />
              </div>
              
              <div>
                <Text strong>Thị lực mắt trái (có kính)</Text>
                <InputNumber
                  min={0}
                  max={20}
                  step={0.1}
                  value={categoryData.visionLeftWithGlass}
                  onChange={(value) => handleInputChange('VISION', 'visionLeftWithGlass', value || 0)}
                  placeholder="Để trống nếu không đeo kính"
                  style={{ width: '100%', marginTop: 4 }}
                />
              </div>
              
              <div>
                <Text strong>Thị lực mắt phải (có kính)</Text>
                <InputNumber
                  min={0}
                  max={20}
                  step={0.1}
                  value={categoryData.visionRightWithGlass}
                  onChange={(value) => handleInputChange('VISION', 'visionRightWithGlass', value || 0)}
                  placeholder="Để trống nếu không đeo kính"
                  style={{ width: '100%', marginTop: 4 }}
                />
              </div>
            </Space>
          </Card>
        </Col>

        {/* Additional Vision Tests */}
        <Col xs={24} md={8}>
          <Card 
            title={<Text strong>Kiểm tra bổ sung</Text>}
            size="small"
            className="h-full"
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Thị lực màu</Text>
                <Select
                  value={categoryData.colorVision}
                  onChange={(value) => handleInputChange('VISION', 'colorVision', value)}
                  style={{ width: '100%', marginTop: 4 }}
                >
                  <Option value="NORMAL">Bình thường</Option>
                  <Option value="COLORBLIND_RED_GREEN">Mù màu đỏ-xanh</Option>
                  <Option value="COLORBLIND_BLUE_YELLOW">Mù màu xanh-vàng</Option>
                  <Option value="PARTIAL_COLORBLIND">Yếu màu</Option>
                </Select>
              </div>
              
              <div>
                <Text strong>Vận động mắt</Text>
                <Select
                  value={categoryData.eyeMovement}
                  onChange={(value) => handleInputChange('VISION', 'eyeMovement', value)}
                  style={{ width: '100%', marginTop: 4 }}
                >
                  <Option value="NORMAL">Bình thường</Option>
                  <Option value="LIMITED">Hạn chế</Option>
                  <Option value="STRABISMUS">Lác mắt</Option>
                  <Option value="NYSTAGMUS">Rung giật nhãn cầu</Option>
                </Select>
              </div>
              
              <div>
                <Text strong>Nhãn áp (mmHg)</Text>
                <InputNumber
                  min={0}
                  max={50}
                  value={categoryData.eyePressure}
                  onChange={(value) => handleInputChange('VISION', 'eyePressure', value)}
                  placeholder="Ví dụ: 15"
                  style={{ width: '100%', marginTop: 4 }}
                />
              </div>
              
              <div>
                <Text strong>Tên bác sĩ khám</Text>
                <Input
                  value={categoryData.doctorName}
                  onChange={(e) => handleInputChange('VISION', 'doctorName', e.target.value)}
                  placeholder="Nhập tên bác sĩ thực hiện khám"
                  style={{ width: '100%', marginTop: 4 }}
                />
              </div>
              
              <Divider style={{ margin: '12px 0' }} />
              
              <Checkbox
                checked={categoryData.needsGlasses}
                onChange={(e) => handleInputChange('VISION', 'needsGlasses', e.target.checked)}
              >
                <Text>Cần đeo kính</Text>
              </Checkbox>
              
              <Checkbox
                checked={categoryData.isAbnormal}
                onChange={(e) => handleInputChange('VISION', 'isAbnormal', e.target.checked)}
              >
                <Text style={{ color: '#d32f2f' }}>Bất thường</Text>
              </Checkbox>
            </Space>
          </Card>
        </Col>

        {/* Notes and Recommendations */}
        <Col xs={24} md={8}>
          <Card 
            title={<Text strong>Ghi chú & Khuyến nghị</Text>}
            size="small"
            className="h-full"
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Mô tả chi tiết</Text>
                <TextArea
                  value={categoryData.visionDescription}
                  onChange={(e) => handleInputChange('VISION', 'visionDescription', e.target.value)}
                  placeholder="Mô tả tình trạng thị lực của học sinh..."
                  rows={3}
                  style={{ marginTop: 4 }}
                />
              </div>
              
              <div>
                <Text strong>Khuyến nghị</Text>
                <TextArea
                  value={categoryData.recommendations}
                  onChange={(e) => handleInputChange('VISION', 'recommendations', e.target.value)}
                  placeholder="Khuyến nghị điều trị hoặc theo dõi..."
                  rows={3}
                  style={{ marginTop: 4 }}
                />
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </Card>
  );

  const renderHearingForm = (categoryData) => (
    <Card 
      className="mb-6"
      style={{ 
        background: 'linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%)',
        border: '1px solid #4caf50'
      }}
    >
      <div className="mb-6">
        <Space align="center" size="middle">
          <Avatar 
            size={40} 
            icon={<AudioOutlined />} 
            style={{ backgroundColor: '#388e3c' }}
          />
          <Title level={3} style={{ margin: 0, color: '#2e7d32' }}>
            Thính lực (Hearing)
          </Title>
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        {/* Hearing Tests */}
        <Col xs={24} md={8}>
          <Card 
            title={<Text strong>Kiểm tra thính lực</Text>}
            size="small"
            className="h-full"
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong style={{ color: '#d32f2f' }}>Tai trái (dB) *</Text>
                <InputNumber
                  min={0}
                  max={120}
                  value={categoryData.leftEar}
                  onChange={(value) => handleInputChange('HEARING', 'leftEar', value || 0)}
                  placeholder="Ví dụ: 20"
                  style={{ width: '100%', marginTop: 4 }}
                />
                <Text type="secondary" style={{ fontSize: '12px' }}>Bình thường: ≤ 25dB</Text>
              </div>
              
              <div>
                <Text strong style={{ color: '#d32f2f' }}>Tai phải (dB) *</Text>
                <InputNumber
                  min={0}
                  max={120}
                  value={categoryData.rightEar}
                  onChange={(value) => handleInputChange('HEARING', 'rightEar', value || 0)}
                  placeholder="Ví dụ: 20"
                  style={{ width: '100%', marginTop: 4 }}
                />
                <Text type="secondary" style={{ fontSize: '12px' }}>Bình thường: ≤ 25dB</Text>
              </div>
              
              <div>
                <Text strong>Độ nhạy thính lực</Text>
                <Select
                  value={categoryData.hearingAcuity}
                  onChange={(value) => handleInputChange('HEARING', 'hearingAcuity', value)}
                  style={{ width: '100%', marginTop: 4 }}
                >
                  <Option value="NORMAL">Bình thường</Option>
                  <Option value="MILD_LOSS">Giảm nhẹ</Option>
                  <Option value="MODERATE_LOSS">Giảm vừa</Option>
                  <Option value="SEVERE_LOSS">Giảm nặng</Option>
                  <Option value="PROFOUND_LOSS">Điếc</Option>
                </Select>
              </div>
              
              <div>
                <Text strong>Tympanometry</Text>
                <Select
                  value={categoryData.tympanometry}
                  onChange={(value) => handleInputChange('HEARING', 'tympanometry', value)}
                  style={{ width: '100%', marginTop: 4 }}
                >
                  <Option value="NORMAL">Bình thường (Type A)</Option>
                  <Option value="FLAT">Phẳng (Type B)</Option>
                  <Option value="NEGATIVE">Âm (Type C)</Option>
                  <Option value="SHALLOW">Nông (Type As)</Option>
                  <Option value="DEEP">Sâu (Type Ad)</Option>
                </Select>
              </div>
            </Space>
          </Card>
        </Col>

        {/* Ear Examination */}
        <Col xs={24} md={8}>
          <Card 
            title={<Text strong>Kiểm tra tai</Text>}
            size="small"
            className="h-full"
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Checkbox
                checked={categoryData.earWaxPresent}
                onChange={(e) => handleInputChange('HEARING', 'earWaxPresent', e.target.checked)}
              >
                <Text>Có ráy tai</Text>
              </Checkbox>
              
              <Checkbox
                checked={categoryData.earInfection}
                onChange={(e) => handleInputChange('HEARING', 'earInfection', e.target.checked)}
              >
                <Text style={{ color: '#d32f2f' }}>Nhiễm trùng tai</Text>
              </Checkbox>
              
              <div>
                <Text strong>Tên bác sĩ khám</Text>
                <Input
                  value={categoryData.doctorName}
                  onChange={(e) => handleInputChange('HEARING', 'doctorName', e.target.value)}
                  placeholder="Nhập tên bác sĩ thực hiện khám"
                  style={{ width: '100%', marginTop: 4 }}
                />
              </div>
              
              <Divider style={{ margin: '12px 0' }} />
              
              <Checkbox
                checked={categoryData.isAbnormal}
                onChange={(e) => handleInputChange('HEARING', 'isAbnormal', e.target.checked)}
              >
                <Text style={{ color: '#d32f2f' }}>Bất thường</Text>
              </Checkbox>
            </Space>
          </Card>
        </Col>

        {/* Notes and Recommendations */}
        <Col xs={24} md={8}>
          <Card 
            title={<Text strong>Ghi chú & Khuyến nghị</Text>}
            size="small"
            className="h-full"
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Mô tả chi tiết</Text>
                <TextArea
                  value={categoryData.description}
                  onChange={(e) => handleInputChange('HEARING', 'description', e.target.value)}
                  placeholder="Mô tả tình trạng thính lực của học sinh..."
                  rows={3}
                  style={{ marginTop: 4 }}
                />
              </div>
              
              <div>
                <Text strong>Khuyến nghị</Text>
                <TextArea
                  value={categoryData.recommendations}
                  onChange={(e) => handleInputChange('HEARING', 'recommendations', e.target.value)}
                  placeholder="Khuyến nghị điều trị hoặc theo dõi..."
                  rows={3}
                  style={{ marginTop: 4 }}
                />
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </Card>
  );

  const renderOralForm = (categoryData) => (
    <Card 
      className="mb-6"
      style={{ 
        background: 'linear-gradient(135deg, #f3e5f5 0%, #fce4ec 100%)',
        border: '1px solid #9c27b0'
      }}
    >
      <div className="mb-6">
        <Space align="center" size="middle">
          <Avatar 
            size={40} 
            icon={<SmileOutlined />} 
            style={{ backgroundColor: '#7b1fa2' }}
          />
          <Title level={3} style={{ margin: 0, color: '#6a1b9a' }}>
            Răng miệng (Oral Health)
          </Title>
        </Space>
      </div>
      
      <Row gutter={[24, 24]}>
        {/* Basic Oral Examination */}
        <Col xs={24} md={8}>
          <Card 
            title={<Text strong>Kiểm tra cơ bản</Text>}
            size="small"
            className="h-full"
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong style={{ color: '#d32f2f' }}>Tình trạng răng *</Text>
                <Input
                  value={categoryData.teethCondition}
                  onChange={(e) => handleInputChange('ORAL', 'teethCondition', e.target.value)}
                  placeholder="Ví dụ: Tốt, có sâu răng, mất răng..."
                  style={{ width: '100%', marginTop: 4 }}
                />
              </div>
              
              <div>
                <Text strong style={{ color: '#d32f2f' }}>Tình trạng nướu *</Text>
                <Input
                  value={categoryData.gumsCondition}
                  onChange={(e) => handleInputChange('ORAL', 'gumsCondition', e.target.value)}
                  placeholder="Ví dụ: Hồng, sưng, chảy máu..."
                  style={{ width: '100%', marginTop: 4 }}
                />
              </div>
              
              <div>
                <Text strong style={{ color: '#d32f2f' }}>Tình trạng lưỡi *</Text>
                <Input
                  value={categoryData.tongueCondition}
                  onChange={(e) => handleInputChange('ORAL', 'tongueCondition', e.target.value)}
                  placeholder="Ví dụ: Bình thường, có vết loét..."
                  style={{ width: '100%', marginTop: 4 }}
                />
              </div>
              
              <div>
                <Text strong>Vệ sinh răng miệng</Text>
                <Select
                  value={categoryData.oralHygiene}
                  onChange={(value) => handleInputChange('ORAL', 'oralHygiene', value)}
                  style={{ width: '100%', marginTop: 4 }}
                >
                  <Option value="EXCELLENT">Rất tốt</Option>
                  <Option value="GOOD">Tốt</Option>
                  <Option value="FAIR">Trung bình</Option>
                  <Option value="POOR">Kém</Option>
                </Select>
              </div>
            </Space>
          </Card>
        </Col>

        {/* Detailed Examination */}
        <Col xs={24} md={8}>
          <Card 
            title={<Text strong>Kiểm tra chi tiết</Text>}
            size="small"
            className="h-full"
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Số răng sâu</Text>
                <InputNumber
                  min={0}
                  max={32}
                  value={categoryData.cavitiesCount}
                  onChange={(value) => handleInputChange('ORAL', 'cavitiesCount', value || 0)}
                  placeholder="0"
                  style={{ width: '100%', marginTop: 4 }}
                />
              </div>
              
              <Divider style={{ margin: '12px 0' }} />
              
              <div>
                <Text strong>Triệu chứng</Text>
                <div style={{ marginTop: 8 }}>
                  <Checkbox
                    checked={categoryData.plaquePresent}
                    onChange={(e) => handleInputChange('ORAL', 'plaquePresent', e.target.checked)}
                  >
                    <Text>Có mảng bám</Text>
                  </Checkbox>
                </div>
                <div style={{ marginTop: 4 }}>
                  <Checkbox
                    checked={categoryData.gingivitis}
                    onChange={(e) => handleInputChange('ORAL', 'gingivitis', e.target.checked)}
                  >
                    <Text>Viêm nướu</Text>
                  </Checkbox>
                </div>
                <div style={{ marginTop: 4 }}>
                  <Checkbox
                    checked={categoryData.mouthUlcers}
                    onChange={(e) => handleInputChange('ORAL', 'mouthUlcers', e.target.checked)}
                  >
                    <Text>Loét miệng</Text>
                  </Checkbox>
                </div>
                
                <div style={{ marginTop: 8 }}>
                  <Text strong>Tên bác sĩ khám</Text>
                  <Input
                    value={categoryData.doctorName}
                    onChange={(e) => handleInputChange('ORAL', 'doctorName', e.target.value)}
                    placeholder="Nhập tên bác sĩ thực hiện khám"
                    style={{ width: '100%', marginTop: 4 }}
                  />
                </div>
                
                <div style={{ marginTop: 4 }}>
                  <Checkbox
                    checked={categoryData.isAbnormal}
                    onChange={(e) => handleInputChange('ORAL', 'isAbnormal', e.target.checked)}
                  >
                    <Text style={{ color: '#d32f2f' }}>Bất thường</Text>
                  </Checkbox>
                </div>
              </div>
            </Space>
          </Card>
        </Col>

        {/* Notes and Recommendations */}
        <Col xs={24} md={8}>
          <Card 
            title={<Text strong>Ghi chú & Khuyến nghị</Text>}
            size="small"
            className="h-full"
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Mô tả chi tiết</Text>
                <TextArea
                  value={categoryData.description}
                  onChange={(e) => handleInputChange('ORAL', 'description', e.target.value)}
                  placeholder="Mô tả tình trạng răng miệng của học sinh..."
                  rows={3}
                  style={{ marginTop: 4 }}
                />
              </div>
              
              <div>
                <Text strong>Khuyến nghị</Text>
                <TextArea
                  value={categoryData.recommendations}
                  onChange={(e) => handleInputChange('ORAL', 'recommendations', e.target.value)}
                  placeholder="Khuyến nghị về vệ sinh, điều trị..."
                  rows={3}
                  style={{ marginTop: 4 }}
                />
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </Card>
  );

  const renderSkinForm = (categoryData) => (
    <Card 
      className="mb-6"
      style={{ 
        background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
        border: '1px solid #ff9800'
      }}
    >
      <div className="mb-6">
        <Space align="center" size="middle">
          <Avatar 
            size={40} 
            icon={<SkinOutlined />} 
            style={{ backgroundColor: '#f57c00' }}
          />
          <Title level={3} style={{ margin: 0, color: '#e65100' }}>
            Da (Skin Health)
          </Title>
        </Space>
      </div>
      
      <Row gutter={[24, 24]}>
        {/* Basic Skin Assessment */}
        <Col xs={24} md={8}>
          <Card 
            title={<Text strong>Đánh giá cơ bản</Text>}
            size="small"
            className="h-full"
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong style={{ color: '#d32f2f' }}>Màu da *</Text>
                <Input
                  value={categoryData.skinColor}
                  onChange={(e) => handleInputChange('SKIN', 'skinColor', e.target.value)}
                  placeholder="Ví dụ: Hồng, vàng, xanh..."
                  style={{ width: '100%', marginTop: 4 }}
                />
              </div>
              
              <div>
                <Text strong>Tông màu da</Text>
                <Select
                  value={categoryData.skinTone}
                  onChange={(value) => handleInputChange('SKIN', 'skinTone', value)}
                  style={{ width: '100%', marginTop: 4 }}
                >
                  <Option value="NORMAL">Bình thường</Option>
                  <Option value="PALE">Nhợt nhạt</Option>
                  <Option value="FLUSHED">Đỏ bừng</Option>
                  <Option value="CYANOTIC">Tím tái</Option>
                  <Option value="JAUNDICED">Vàng da</Option>
                </Select>
              </div>
              
              <div>
                <Text strong>Điều trị</Text>
                <Input
                  value={categoryData.treatment}
                  onChange={(e) => handleInputChange('SKIN', 'treatment', e.target.value)}
                  placeholder="Thuốc bôi, kem dưỡng ẩm..."
                  style={{ width: '100%', marginTop: 4 }}
                />
              </div>
              
              <div>
                <Text strong>Ngày tái khám</Text>
                <Input
                  type="date"
                  value={categoryData.followUpDate}
                  onChange={(e) => handleInputChange('SKIN', 'followUpDate', e.target.value)}
                  style={{ width: '100%', marginTop: 4 }}
                />
              </div>
            </Space>
          </Card>
        </Col>

        {/* Skin Conditions */}
        <Col xs={24} md={8}>
          <Card 
            title={<Text strong>Tình trạng da</Text>}
            size="small"
            className="h-full"
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Row gutter={[8, 8]}>
                <Col span={12}>
                  <Checkbox
                    checked={categoryData.rashes}
                    onChange={(e) => handleInputChange('SKIN', 'rashes', e.target.checked)}
                  >
                    <Text>Phát ban</Text>
                  </Checkbox>
                </Col>
                <Col span={12}>
                  <Checkbox
                    checked={categoryData.lesions}
                    onChange={(e) => handleInputChange('SKIN', 'lesions', e.target.checked)}
                  >
                    <Text>Tổn thương</Text>
                  </Checkbox>
                </Col>
                <Col span={12}>
                  <Checkbox
                    checked={categoryData.dryness}
                    onChange={(e) => handleInputChange('SKIN', 'dryness', e.target.checked)}
                  >
                    <Text>Khô da</Text>
                  </Checkbox>
                </Col>
                <Col span={12}>
                  <Checkbox
                    checked={categoryData.eczema}
                    onChange={(e) => handleInputChange('SKIN', 'eczema', e.target.checked)}
                  >
                    <Text>Chàm</Text>
                  </Checkbox>
                </Col>
                <Col span={12}>
                  <Checkbox
                    checked={categoryData.psoriasis}
                    onChange={(e) => handleInputChange('SKIN', 'psoriasis', e.target.checked)}
                  >
                    <Text>Vảy nến</Text>
                  </Checkbox>
                </Col>
                <Col span={12}>
                  <Checkbox
                    checked={categoryData.skinInfection}
                    onChange={(e) => handleInputChange('SKIN', 'skinInfection', e.target.checked)}
                  >
                    <Text>Nhiễm trùng da</Text>
                  </Checkbox>
                </Col>
                <Col span={12}>
                  <Checkbox
                    checked={categoryData.allergies}
                    onChange={(e) => handleInputChange('SKIN', 'allergies', e.target.checked)}
                  >
                    <Text>Dị ứng</Text>
                  </Checkbox>
                </Col>
                <Col span={12}>
                  <Checkbox
                    checked={categoryData.acne}
                    onChange={(e) => handleInputChange('SKIN', 'acne', e.target.checked)}
                  >
                    <Text>Mụn trứng cá</Text>
                  </Checkbox>
                </Col>
                <Col span={12}>
                  <Checkbox
                    checked={categoryData.scars}
                    onChange={(e) => handleInputChange('SKIN', 'scars', e.target.checked)}
                  >
                    <Text>Sẹo</Text>
                  </Checkbox>
                </Col>
                <Col span={12}>
                  <Checkbox
                    checked={categoryData.birthmarks}
                    onChange={(e) => handleInputChange('SKIN', 'birthmarks', e.target.checked)}
                  >
                    <Text>Vết bớt</Text>
                  </Checkbox>
                </Col>
              </Row>
              
              <Divider style={{ margin: '12px 0' }} />
              
              <div>
                <Text strong>Tên bác sĩ khám</Text>
                <Input
                  value={categoryData.doctorName}
                  onChange={(e) => handleInputChange('SKIN', 'doctorName', e.target.value)}
                  placeholder="Nhập tên bác sĩ thực hiện khám"
                  style={{ width: '100%', marginTop: 4 }}
                />
              </div>
              
              <Checkbox
                checked={categoryData.isAbnormal}
                onChange={(e) => handleInputChange('SKIN', 'isAbnormal', e.target.checked)}
              >
                <Text style={{ color: '#d32f2f' }}>Bất thường</Text>
              </Checkbox>
            </Space>
          </Card>
        </Col>

        {/* Notes and Recommendations */}
        <Col xs={24} md={8}>
          <Card 
            title={<Text strong>Ghi chú & Khuyến nghị</Text>}
            size="small"
            className="h-full"
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Mô tả chi tiết</Text>
                <TextArea
                  value={categoryData.description}
                  onChange={(e) => handleInputChange('SKIN', 'description', e.target.value)}
                  placeholder="Mô tả tình trạng da của học sinh..."
                  rows={3}
                  style={{ marginTop: 4 }}
                />
              </div>
              
              <div>
                <Text strong>Khuyến nghị</Text>
                <TextArea
                  value={categoryData.recommendations}
                  onChange={(e) => handleInputChange('SKIN', 'recommendations', e.target.value)}
                  placeholder="Khuyến nghị chăm sóc da, điều trị..."
                  rows={3}
                  style={{ marginTop: 4 }}
                />
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </Card>
  );

  const renderRespiratoryForm = (categoryData) => (
    <Card 
      className="mb-6"
      style={{ 
        background: 'linear-gradient(135deg, #ffebee 0%, #fce4ec 100%)',
        border: '1px solid #f44336'
      }}
    >
      <div className="mb-6">
        <Space align="center" size="middle">
          <Avatar 
            size={40} 
            icon={<HeartOutlined />} 
            style={{ backgroundColor: '#d32f2f' }}
          />
          <Title level={3} style={{ margin: 0, color: '#c62828' }}>
            Hô hấp (Respiratory)
          </Title>
        </Space>
      </div>
      
      <Row gutter={[24, 24]}>
        {/* Vital Signs */}
        <Col xs={24} md={8}>
          <Card 
            title={<Text strong>Dấu hiệu sinh tồn</Text>}
            size="small"
            className="h-full"
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong style={{ color: '#d32f2f' }}>Nhịp thở (lần/phút) *</Text>
                <InputNumber
                  min={0}
                  max={200}
                  value={categoryData.breathingRate}
                  onChange={(value) => handleInputChange('RESPIRATORY', 'breathingRate', value || 0)}
                  placeholder="Ví dụ: 20"
                  style={{ width: '100%', marginTop: 4 }}
                />
                <Text type="secondary" style={{ fontSize: '12px' }}>Bình thường: 12-20 lần/phút</Text>
              </div>
              
              <div>
                <Text strong>SpO2 (%)</Text>
                <InputNumber
                  min={0}
                  max={100}
                  value={categoryData.oxygenSaturation}
                  onChange={(value) => handleInputChange('RESPIRATORY', 'oxygenSaturation', value || null)}
                  placeholder="Ví dụ: 98"
                  style={{ width: '100%', marginTop: 4 }}
                />
                <Text type="secondary" style={{ fontSize: '12px' }}>Bình thường: ≥ 95%</Text>
              </div>
              
              <div>
                <Text strong style={{ color: '#d32f2f' }}>Âm thở *</Text>
                <Input
                  value={categoryData.breathingSound}
                  onChange={(e) => handleInputChange('RESPIRATORY', 'breathingSound', e.target.value)}
                  placeholder="Ví dụ: Rõ, bình thường"
                  style={{ width: '100%', marginTop: 4 }}
                />
              </div>
              
              <div>
                <Text strong>Âm phổi</Text>
                <Select
                  value={categoryData.lungSounds}
                  onChange={(value) => handleInputChange('RESPIRATORY', 'lungSounds', value)}
                  style={{ width: '100%', marginTop: 4 }}
                >
                  <Option value="CLEAR">Rõ</Option>
                  <Option value="WHEEZE">Khò khè</Option>
                  <Option value="CRACKLES">Ran ẩm</Option>
                  <Option value="RHONCHI">Ran khô</Option>
                  <Option value="DIMINISHED">Giảm</Option>
                  <Option value="ABSENT">Mất</Option>
                </Select>
              </div>
            </Space>
          </Card>
        </Col>

        {/* Physical Assessment */}
        <Col xs={24} md={8}>
          <Card 
            title={<Text strong>Đánh giá thể chất</Text>}
            size="small"
            className="h-full"
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Sự nở ngực</Text>
                <Select
                  value={categoryData.chestExpansion}
                  onChange={(value) => handleInputChange('RESPIRATORY', 'chestExpansion', value)}
                  style={{ width: '100%', marginTop: 4 }}
                >
                  <Option value="NORMAL">Bình thường</Option>
                  <Option value="DECREASED">Giảm</Option>
                  <Option value="ASYMMETRIC">Không đối xứng</Option>
                  <Option value="BARREL_CHEST">Ngực thùng</Option>
                </Select>
              </div>
              
              <div>
                <Text strong>Điều trị</Text>
                <Input
                  value={categoryData.treatment}
                  onChange={(e) => handleInputChange('RESPIRATORY', 'treatment', e.target.value)}
                  placeholder="Thuốc, xịt, oxy..."
                  style={{ width: '100%', marginTop: 4 }}
                />
              </div>
              
              <div>
                <Text strong>Ngày tái khám</Text>
                <Input
                  type="date"
                  value={categoryData.followUpDate}
                  onChange={(e) => handleInputChange('RESPIRATORY', 'followUpDate', e.target.value)}
                  style={{ width: '100%', marginTop: 4 }}
                />
              </div>
              
              <Divider style={{ margin: '12px 0' }} />
              
              <div>
                <Text strong>Tiền sử</Text>
                <div style={{ marginTop: 8 }}>
                  <Checkbox
                    checked={categoryData.asthmaHistory}
                    onChange={(e) => handleInputChange('RESPIRATORY', 'asthmaHistory', e.target.checked)}
                  >
                    <Text>Tiền sử hen suyễn</Text>
                  </Checkbox>
                </div>
                <div style={{ marginTop: 4 }}>
                  <Checkbox
                    checked={categoryData.allergicRhinitis}
                    onChange={(e) => handleInputChange('RESPIRATORY', 'allergicRhinitis', e.target.checked)}
                  >
                    <Text>Viêm mũi dị ứng</Text>
                  </Checkbox>
                </div>
              </div>
            </Space>
          </Card>
        </Col>

        {/* Symptoms and Notes */}
        <Col xs={24} md={8}>
          <Card 
            title={<Text strong>Triệu chứng & Ghi chú</Text>}
            size="small"
            className="h-full"
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Triệu chứng</Text>
                <div style={{ marginTop: 8 }}>
                  <Checkbox
                    checked={categoryData.wheezing}
                    onChange={(e) => handleInputChange('RESPIRATORY', 'wheezing', e.target.checked)}
                  >
                    <Text>Thở khò khè</Text>
                  </Checkbox>
                </div>
                <div style={{ marginTop: 4 }}>
                  <Checkbox
                    checked={categoryData.cough}
                    onChange={(e) => handleInputChange('RESPIRATORY', 'cough', e.target.checked)}
                  >
                    <Text>Ho</Text>
                  </Checkbox>
                </div>
                <div style={{ marginTop: 4 }}>
                  <Checkbox
                    checked={categoryData.breathingDifficulty}
                    onChange={(e) => handleInputChange('RESPIRATORY', 'breathingDifficulty', e.target.checked)}
                  >
                    <Text>Khó thở</Text>
                  </Checkbox>
                </div>
                
                <div style={{ marginTop: 8 }}>
                  <Text strong>Tên bác sĩ khám</Text>
                  <Input
                    value={categoryData.doctorName}
                    onChange={(e) => handleInputChange('RESPIRATORY', 'doctorName', e.target.value)}
                    placeholder="Nhập tên bác sĩ thực hiện khám"
                    style={{ width: '100%', marginTop: 4 }}
                  />
                </div>
                
                <div style={{ marginTop: 4 }}>
                  <Checkbox
                    checked={categoryData.isAbnormal}
                    onChange={(e) => handleInputChange('RESPIRATORY', 'isAbnormal', e.target.checked)}
                  >
                    <Text style={{ color: '#d32f2f' }}>Bất thường</Text>
                  </Checkbox>
                </div>
              </div>
              
              <div>
                <Text strong>Mô tả chi tiết</Text>
                <TextArea
                  value={categoryData.description}
                  onChange={(e) => handleInputChange('RESPIRATORY', 'description', e.target.value)}
                  placeholder="Mô tả tình trạng hô hấp của học sinh..."
                  rows={3}
                  style={{ marginTop: 4 }}
                />
              </div>
              
              <div>
                <Text strong>Khuyến nghị</Text>
                <TextArea
                  value={categoryData.recommendations}
                  onChange={(e) => handleInputChange('RESPIRATORY', 'recommendations', e.target.value)}
                  placeholder="Khuyến nghị điều trị, theo dõi..."
                  rows={3}
                  style={{ marginTop: 4 }}
                />
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </Card>
  );

  const handleSubmit = async () => {
    if (!selectedStudent) {
      message.error('Vui lòng chọn học sinh');
      return;
    }

    setIsSubmitting(true);
    try {
      // Add overall student measurements
      const overallMeasurements = {
        weight: formData.weight || 0,
        height: formData.height || 0
      };

      // Transform form data to match backend DTO structure
      const categoryResults = campaign.categories.map(category => {
        const categoryData = formData[category];
        let status = 'NORMAL';
        
        // Determine status based on category-specific abnormal flags
        if (category === 'ORAL' || category === 'SKIN' || category === 'RESPIRATORY') {
          if (categoryData.isAbnormal) {
            status = categoryData.treatment ? 'NEEDS_TREATMENT' : 'ABNORMAL';
          }
        } else if (category === 'VISION') {
          // Consider abnormal if vision is below normal threshold or needs glasses
          if (categoryData.visionLeft < 1.0 || categoryData.visionRight < 1.0 || categoryData.needsGlasses || categoryData.isAbnormal) {
            status = 'ABNORMAL';
          }
        } else if (category === 'HEARING') {
          // Consider abnormal if hearing threshold is above normal
          if (categoryData.leftEar > 25 || categoryData.rightEar > 25 || categoryData.isAbnormal) {
            status = 'ABNORMAL';
          }
        }

        return {
          category,
          status,
          notes: categoryData.description || categoryData.visionDescription || categoryData.recommendations || ''
        };
      });

      const resultData = {
        studentId: selectedStudent.studentID,
        campaignId: campaign.id,
        categories: categoryResults,
        weight: overallMeasurements.weight,
        height: overallMeasurements.height,
        detailedResults: formData // Include detailed form data for backend processing
      };

      console.log('DEBUG: Sending data to backend:', JSON.stringify(resultData, null, 2));
      await healthCheckApi.recordHealthCheckResult(resultData);
      message.success('Ghi nhận kết quả khám sức khỏe thành công!');
      
      // Close modal and reset form
      setIsModalVisible(false);
      setSelectedStudent(null);
      setFormData({});
      
      // Refresh data to update table with new results
      if (onRefreshData) {
        onRefreshData();
      }
      
      // Also refresh local data to update existing results
      try {
        const updatedResults = await healthCheckApi.getCampaignResults(campaignId);
        const resultsMap = {};
        if (updatedResults && Array.isArray(updatedResults)) {
          updatedResults.forEach(result => {
            if (result.studentID) {
              resultsMap[result.studentID] = result;
            }
          });
        }
        setExistingResults(resultsMap);
      } catch (error) {
        console.error('Error refreshing results data:', error);
      }
    } catch (error) {
      console.error('Error recording health check result:', error);
      message.error('Có lỗi xảy ra khi ghi nhận kết quả. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Debug logging
  console.log('RecordResultsTab - confirmedStudents from state:', confirmedStudents);
  console.log('RecordResultsTab - confirmedStudents length:', confirmedStudents.length);

  if (loadingStudents) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" tip="Đang tải danh sách học sinh...">
          <div style={{ width: '200px', height: '100px' }} />
        </Spin>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Card 
        title={
          <div>
            <Space align="center" size="middle">
              <Avatar 
                size={48} 
                icon={<MedicineBoxOutlined />} 
                style={{ backgroundColor: '#1890ff' }}
              />
              <div>
                <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
                  Ghi nhận kết quả khám sức khỏe
                </Title>
                <Paragraph style={{ margin: 0, color: '#666' }}>
                  Danh sách học sinh đã xác nhận tham gia khám sức khỏe
                </Paragraph>
              </div>
            </Space>
          </div>
        }
        style={{ maxWidth: '1400px', margin: '0 auto' }}
      >
        {confirmedStudents.length > 0 ? (
          <Table
            dataSource={confirmedStudents}
            columns={columns}
            rowKey="studentID"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} của ${total} học sinh`,
            }}
            size="middle"
            bordered
            scroll={{ x: 800 }}
          />
        ) : (
          <Card 
            style={{ 
              textAlign: 'center', 
              backgroundColor: '#fafafa',
              border: '1px dashed #d9d9d9'
            }}
          >
            <Avatar 
              size={64} 
              icon={<UserOutlined />} 
              style={{ backgroundColor: '#d9d9d9', marginBottom: '16px' }}
            />
            <Title level={4} style={{ color: '#666' }}>
              Chưa có học sinh nào xác nhận tham gia khám sức khỏe
            </Title>
            <Paragraph style={{ color: '#999' }}>
              Vui lòng kiểm tra lại danh sách học sinh đã gửi form.
            </Paragraph>
          </Card>
        )}

        {/* Modal for Recording/Viewing Results */}
        <Modal
          title={
            modalMode === 'record' 
              ? `Ghi nhận kết quả - ${selectedStudent?.fullName}` 
              : `Xem kết quả - ${selectedStudent?.fullName}`
          }
          open={isModalVisible}
          onCancel={handleCloseModal}
          width={1200}
          footer={null}
          destroyOnClose
        >
          {selectedStudent && (
            <div>
              {/* Student Info Header */}
              <Card 
                style={{ 
                  marginBottom: '24px',
                  background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
                  color: 'white'
                }}
              >
                <Row justify="space-between" align="middle">
                  <Col>
                    <Title level={4} style={{ color: 'white', margin: 0 }}>
                      Học sinh: {selectedStudent.fullName}
                    </Title>
                    <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                      Lớp: {selectedStudent.className} | Ngày sinh: {
                        selectedStudent.dateOfBirth ? 
                          new Date(selectedStudent.dateOfBirth).toLocaleDateString('vi-VN') : 
                          'N/A'
                      }
                    </Text>
                  </Col>
                  <Col>
                    <div style={{ textAlign: 'right' }}>
                      <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>
                        {modalMode === 'record' ? 'Ngày khám' : 'Kết quả khám'}
                      </Text>
                      <div style={{ color: 'white', fontWeight: 'bold' }}>
                        {modalMode === 'record' 
                          ? new Date().toLocaleDateString('vi-VN')
                          : hasExistingResults(selectedStudent.studentID) 
                            ? 'Đã có kết quả' 
                            : 'Chưa có kết quả'
                        }
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card>

              {/* Health Check Form */}
              <Form onFinish={handleSubmit} layout="vertical" disabled={modalMode === 'view'}>
                {/* Overall Measurements */}
                <Card 
                  title={
                    <Space>
                      <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: '#52c41a' }} />
                      <Text strong>Chỉ số cơ thể</Text>
                    </Space>
                  }
                  style={{ marginBottom: '24px' }}
                >
                  <Row gutter={[24, 16]}>
                    <Col xs={24} md={8}>
                      <Form.Item 
                        label={<Text strong style={{ color: modalMode === 'record' ? '#d32f2f' : '#666' }}>
                          Cân nặng (kg) {modalMode === 'record' && '*'}
                        </Text>}
                        required={modalMode === 'record'}
                      >
                        <InputNumber
                          min={0}
                          max={200}
                          step={0.1}
                          value={formData.weight}
                          onChange={(value) => setFormData(prev => ({...prev, weight: value || ''}))}
                          placeholder="Ví dụ: 45.5"
                          style={{ width: '100%' }}
                          size="large"
                          disabled={modalMode === 'view'}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item 
                        label={<Text strong style={{ color: modalMode === 'record' ? '#d32f2f' : '#666' }}>
                          Chiều cao (cm) {modalMode === 'record' && '*'}
                        </Text>}
                        required={modalMode === 'record'}
                      >
                        <InputNumber
                          min={0}
                          max={300}
                          step={0.1}
                          value={formData.height}
                          onChange={(value) => setFormData(prev => ({...prev, height: value || ''}))}
                          placeholder="Ví dụ: 150.5"
                          style={{ width: '100%' }}
                          size="large"
                          disabled={modalMode === 'view'}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item label={<Text strong>BMI (tự động tính)</Text>}>
                        <Input
                          value={formData.weight && formData.height ? 
                            (formData.weight / Math.pow(formData.height / 100, 2)).toFixed(1) : 
                            '--'
                          }
                          disabled
                          style={{ 
                            backgroundColor: '#f5f5f5',
                            color: '#666'
                          }}
                          size="large"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>

                {/* Category-specific forms */}
                {campaign?.categories?.map(category => (
                  <div key={category}>
                    {category === 'VISION' && formData.VISION && renderVisionForm(formData.VISION)}
                    {category === 'HEARING' && formData.HEARING && renderHearingForm(formData.HEARING)}
                    {category === 'ORAL' && formData.ORAL && renderOralForm(formData.ORAL)}
                    {category === 'SKIN' && formData.SKIN && renderSkinForm(formData.SKIN)}
                    {category === 'RESPIRATORY' && formData.RESPIRATORY && renderRespiratoryForm(formData.RESPIRATORY)}
                  </div>
                ))}

                {/* Submit Button - only show in record mode */}
                {modalMode === 'record' && (
                  <Form.Item style={{ textAlign: 'center', marginTop: '32px' }}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      loading={isSubmitting}
                      style={{
                        background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
                        border: 'none',
                        padding: '0 48px',
                        height: '48px',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        fontSize: '16px'
                      }}
                    >
                      {isSubmitting ? 'Đang ghi nhận...' : 'Ghi nhận kết quả'}
                    </Button>
                  </Form.Item>
                )}

                {/* Close Button - show in view mode */}
                {modalMode === 'view' && (
                  <Form.Item style={{ textAlign: 'center', marginTop: '32px' }}>
                    <Button
                      type="default"
                      size="large"
                      onClick={handleCloseModal}
                      style={{
                        padding: '0 48px',
                        height: '48px',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        fontSize: '16px'
                      }}
                    >
                      Đóng
                    </Button>
                  </Form.Item>
                )}
              </Form>
            </div>
          )}
        </Modal>
      </Card>
    </div>
  );
};

export default RecordResultsTab;

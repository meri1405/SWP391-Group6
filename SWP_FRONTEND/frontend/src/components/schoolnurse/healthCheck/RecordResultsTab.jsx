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
  Badge
} from 'antd';
import { 
  EyeOutlined, 
  AudioOutlined, 
  SmileOutlined, 
  SkinOutlined, 
  HeartOutlined,
  UserOutlined,
  MedicineBoxOutlined
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

  // Fetch confirmed students when component mounts
  useEffect(() => {
    const fetchConfirmedStudents = async () => {
      if (!campaignId) return;
      
      setLoadingStudents(true);
      console.log('Making API call to getConfirmedStudents with campaignId:', campaignId);
      try {
        const students = await healthCheckApi.getConfirmedStudents(campaignId);
        console.log('API call successful - confirmed students response:', students);
        console.log('API call successful - students type:', typeof students);
        console.log('API call successful - students is array:', Array.isArray(students));
        console.log('API call successful - students length:', students?.length);
        setConfirmedStudents(students || []);
      } catch (error) {
        console.error('Error fetching confirmed students:', error);
        console.error('Error response:', error.response);
        console.error('Error status:', error.response?.status);
        console.error('Error data:', error.response?.data);
        message.error('Không thể tải danh sách học sinh đã xác nhận');
        setConfirmedStudents([]);
      } finally {
        setLoadingStudents(false);
      }
    };

    fetchConfirmedStudents();
  }, [campaignId]);

  // Initialize form data when student is selected
  useEffect(() => {
    if (selectedStudent && campaign?.categories) {
      const initialData = {
        weight: '',
        height: ''
      };
      campaign.categories.forEach(category => {
        initialData[category] = getInitialCategoryData(category);
      });
      setFormData(initialData);
    }
  }, [selectedStudent, campaign]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
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

      await healthCheckApi.recordHealthCheckResult(resultData);
      message.success('Ghi nhận kết quả khám sức khỏe thành công!');
      
      // Reset form
      setSelectedStudent(null);
      setFormData({});
      
      // Refresh data if callback provided
      if (onRefreshData) {
        onRefreshData();
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
                  Nhập thông tin chi tiết kết quả khám sức khỏe cho học sinh
                </Paragraph>
              </div>
            </Space>
          </div>
        }
        style={{ maxWidth: '1200px', margin: '0 auto' }}
      >
        {/* Student Selection */}
        <div style={{ marginBottom: '32px' }}>
          <Text strong style={{ fontSize: '16px' }}>
            <UserOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
            Chọn học sinh để ghi nhận kết quả
          </Text>
          <Select
            value={selectedStudent?.studentID || undefined}
            onChange={(studentId) => {
              const student = confirmedStudents.find(s => s.studentID.toString() === studentId.toString());
              setSelectedStudent(student || null);
            }}
            placeholder="-- Chọn học sinh --"
            style={{ width: '100%', marginTop: '8px' }}
            size="large"
            showSearch
            optionFilterProp="children"
          >
            {confirmedStudents.map(student => (
              <Option key={student.studentID} value={student.studentID}>
                {student.fullName} - {student.className}
              </Option>
            ))}
          </Select>
        </div>

        {/* Results Form */}
        {selectedStudent && (
          <Form onFinish={handleSubmit} layout="vertical">
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
                    Lớp: {selectedStudent.className}
                  </Text>
                </Col>
                <Col>
                  <div style={{ textAlign: 'right' }}>
                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>
                      Ngày khám
                    </Text>
                    <div style={{ color: 'white', fontWeight: 'bold' }}>
                      {new Date().toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>

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
                    label={<Text strong style={{ color: '#d32f2f' }}>Cân nặng (kg) *</Text>}
                    required
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
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item 
                    label={<Text strong style={{ color: '#d32f2f' }}>Chiều cao (cm) *</Text>}
                    required
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

            {/* Dynamic Category Forms */}
            <div style={{ marginBottom: '24px' }}>
              {campaign.categories?.map(category => (
                <div key={category}>
                  {category === 'VISION' && formData.VISION && renderVisionForm(formData.VISION)}
                  {category === 'HEARING' && formData.HEARING && renderHearingForm(formData.HEARING)}
                  {category === 'ORAL' && formData.ORAL && renderOralForm(formData.ORAL)}
                  {category === 'SKIN' && formData.SKIN && renderSkinForm(formData.SKIN)}
                  {category === 'RESPIRATORY' && formData.RESPIRATORY && renderRespiratoryForm(formData.RESPIRATORY)}
                </div>
              ))}
            </div>

            {/* Submit Button */}
            <Row justify="end" style={{ paddingTop: '24px', borderTop: '1px solid #f0f0f0' }}>
              <Col>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isSubmitting}
                  size="large"
                  style={{
                    background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    height: '48px',
                    padding: '0 32px',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}
                >
                  {isSubmitting ? 'Đang lưu...' : 'Lưu kết quả khám'}
                </Button>
              </Col>
            </Row>
          </Form>
        )}

        {confirmedStudents.length === 0 && (
          <Card style={{ textAlign: 'center', padding: '48px' }}>
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
      </Card>
    </div>
  );
};

export default RecordResultsTab;
